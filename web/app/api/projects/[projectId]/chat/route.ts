import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/helpers";
import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { AppwriteException, Models } from "node-appwrite";

const { DatabaseId, projectsCollectionId } = appwriteConfig;

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL!;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET!;

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const sessionResult = await getSession();
  if (!sessionResult.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Authorization: ensure the authenticated user owns the requested project
  try {
    const { databases, account } = await createSessionClient(
      sessionResult.session!,
    );

    let user: Models.User | undefined;
    try {
      user = await account.get();
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // fetch project and verify ownership
    try {
      const projectDoc = await databases.getDocument(
        DatabaseId,
        projectsCollectionId,
        projectId,
      );
      const projectUserId =
        typeof projectDoc.userId === "string"
          ? projectDoc.userId
          : projectDoc.userId?.$id;

      if (projectUserId !== user.$id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch (err) {
      if (err instanceof AppwriteException && err.code === 404) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 },
        );
      }
      console.error("Error fetching project for authorization:", err);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  } catch (err) {
    console.error("Authorization check failed:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  const body = await request.json();
  const { message, intent } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  // map frontend intent to rag-service intent_hint
  const intentHint = intent === "generate documentation" ? "doc_gen" : "qa";

  try {
    const ragResponse = await fetch(`${RAG_SERVICE_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_API_SECRET,
      },
      body: JSON.stringify({
        query: message,
        project_id: projectId,
        intent_hint: intentHint,
      }),
    });

    if (!ragResponse.ok) {
      // rag service may return non-JSON (plain text or HTML) on errors.
      // try to parse JSON, otherwise fall back to text so we can forward
      // the real error message and status code to the client.
      let errMessage = "RAG service error";
      try {
        const parsed = await ragResponse.json();
        errMessage = parsed?.detail || parsed?.error || JSON.stringify(parsed);
      } catch {
        try {
          const txt = await ragResponse.text();
          if (txt) errMessage = txt;
        } catch {
          // ignore, keep generic message
        }
      }

      return NextResponse.json(
        { error: errMessage || "RAG service error" },
        { status: ragResponse.status },
      );
    }

    // pipe the SSE stream directly to the client
    // translate rag-service event types to what useChat.ts expects:
    // rag-service emits: {type: "token"} → useChat expects: {type: "chunk"}
    // rag-service emits: {type: "node"}  → useChat expects: ignored
    // rag-service emits: {type: "done"}  → useChat expects: {type: "done"}
    const encoder = new TextEncoder();
    const ragReader = ragResponse.body!.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = "";
          while (true) {
            const { done, value } = await ragReader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              try {
                const event = JSON.parse(line.slice(6));

                if (event.type === "token") {
                  // translate token → chunk for useChat.ts compatibility and streaming
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "token", content: event.content })}\n\n`,
                    ),
                  );
                } else if (event.type === "done") {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "done" })}\n\n`,
                    ),
                  );
                } else if (event.type === "error") {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "error", error: event.message })}\n\n`,
                    ),
                  );
                } else if (event.type === "thinking") {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "thinking", message: event.message })}\n\n`,
                    ),
                  );
                }
                // node events are internal — skip them
              } catch {
                continue;
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat proxy error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
