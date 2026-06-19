import { NextRequest, NextResponse } from "next/server";
import { getLoggedInUser } from "@/lib/actions/user.action";
import { getSession } from "@/lib/helpers";
import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { ID } from "node-appwrite";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes
export const dynamic = "force-dynamic";

const CHUNK_SERVICE_URL = process.env.CHUNK_SERVICE_URL!;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET!;
const { DatabaseId, projectsCollectionId } = appwriteConfig;

export async function POST(request: NextRequest) {
  try {
    // ── 1. Auth ──────────────────────────────────────────────────────────────
    const sessionResult = await getSession();
    if (!sessionResult.success || !sessionResult.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getLoggedInUser();
    if (!user?.$id) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // ── 2. Parse form data ───────────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectName =
      (formData.get("name") as string)?.trim() || "Untitled Project";
    const source = (formData.get("source") as string) || "zip";
    const existingProjectId = formData.get("projectId") as string | null;

    if (!file && source === "zip") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ── 3. Resolve project document ──────────────────────────────────────────
    const { databases } = await createSessionClient(sessionResult.session);
    let projectId: string;

    if (existingProjectId) {
      try {
        const doc = await databases.getDocument(
          DatabaseId,
          projectsCollectionId,
          existingProjectId,
        );
        if (doc.userId !== user.$id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        projectId = existingProjectId;
      } catch {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 },
        );
      }
    } else {
      projectId = ID.unique();
      await databases.createDocument(
        DatabaseId,
        projectsCollectionId,
        projectId,
        {
          name: projectName,
          userId: user.$id,
          status: "indexing",
          filesCount: 0,
          chunksCount: 0,
        },
      );
    }

    // ── 4. Forward to chunk-service with timeout ─────────────────────────────
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 minutes

    let chunkResponse: Response;

    if (source === "github") {
      const repo = formData.get("repo") as string;
      const branch = (formData.get("branch") as string) || "main";
      const token = formData.get("token") as string;

      if (!repo || !token) {
        return NextResponse.json(
          { error: "repo and token are required for GitHub source" },
          { status: 400 },
        );
      }

      chunkResponse = await fetch(
        `${CHUNK_SERVICE_URL}/chunk/github?project_id=${projectId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": INTERNAL_API_SECRET,
          },
          body: JSON.stringify({ repo, branch, token }),
          signal: controller.signal,
        },
      );
    } else {
      const serviceFormData = new FormData();
      serviceFormData.append("project_id", projectId);
      serviceFormData.append("file", file!);

      chunkResponse = await fetch(`${CHUNK_SERVICE_URL}/chunk/zip`, {
        method: "POST",
        headers: { "x-internal-secret": INTERNAL_API_SECRET },
        body: serviceFormData,
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);

    // ── 5. Handle chunk-service errors ───────────────────────────────────────
    if (!chunkResponse.ok) {
      const err = await chunkResponse.json().catch(() => ({}));
      await databases
        .updateDocument(DatabaseId, projectsCollectionId, projectId, {
          status: "failed",
        })
        .catch(() => {});

      return NextResponse.json(
        { error: err.detail || "Chunk service error" },
        { status: 500 },
      );
    }

    const chunkResult = await chunkResponse.json();

    // ── 6. Update project with job metadata ──────────────────────────────────
    const chunksCount = parseInt(
      chunkResult.message?.match(/\d+/)?.[0] ?? "0",
      10,
    );

    await databases
      .updateDocument(DatabaseId, projectsCollectionId, projectId, {
        jobId: chunkResult.job_id,
        chunksCount,
      })
      .catch((err) => {
        console.warn("Failed to update project with job metadata:", err);
      });

    return NextResponse.json({
      success: true,
      projectId,
      jobId: chunkResult.job_id,
      message: chunkResult.message,
      chunksCount,
    });
  } catch (error: unknown) {
    console.error("Ingest route error:", error);

    const hasName = (e: unknown): e is { name: string } =>
      typeof e === "object" &&
      e !== null &&
      typeof (e as Record<string, unknown>).name === "string";

    if (hasName(error) && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Upload timed out. Please try a smaller ZIP file." },
        { status: 408 },
      );
    }

    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || "Internal server error" },
      { status: 500 },
    );
  }
}
