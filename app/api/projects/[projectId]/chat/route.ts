// app/api/projects/[projectId]/chat/route.ts
import { NextRequest } from "next/server";
import { getSession } from "@/lib/helpers";
import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { index } from "@/db/pinecone";
import { generateDocumentation } from "@/features/documentation/generateDocumentation";

const { DatabaseId, projectsCollectionId } = appwriteConfig;

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const awaitedParams = await params;
  const { projectId } = awaitedParams;

  if (!projectId) {
    return new Response("Missing projectId", { status: 400 });
  }

  try {
    const sessionResult = await getSession();
    if (!sessionResult.session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { databases, account } = await createSessionClient(
      sessionResult.session
    );
    const user = await account.get();

    const project = await databases.getDocument(
      DatabaseId,
      projectsCollectionId,
      projectId
    );

    const projectUserId =
      typeof project.userId === "string" ? project.userId : project.userId.$id;
    if (projectUserId !== user.$id) {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message) {
      return new Response("Message required", { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "start" })}\n\n`)
          );

          await generateDocumentation(projectId, message, index, (chunk) => {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`
              )
            );
          });

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
          controller.close();
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: errorMessage,
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Chat API error:", error.message);
      return new Response("Internal error", { status: 500 });
    } else {
      console.error("Chat API error:", error);
    }
  }
}
