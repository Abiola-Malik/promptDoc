import { NextRequest, NextResponse } from "next/server";
import { getLoggedInUser } from "@/lib/actions/user.action";
import { getSession } from "@/lib/helpers";
import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { ID } from "node-appwrite";

export const runtime = "nodejs";
export const maxDuration = 300;

const CHUNK_SERVICE_URL = process.env.CHUNK_SERVICE_URL!;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET!;
const { DatabaseId, projectsCollectionId } = appwriteConfig;

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ingest
//
// BFF proxy between Next.js and chunk-service. Handles two ingestion sources:
//   - "zip"    → multipart file upload forwarded to /chunk/zip
//   - "github" → repo metadata forwarded to /chunk/github
//
// Project lifecycle:
//   handleSmartUpload may pre-create the Appwrite project document and pass
//   its ID here via the "projectId" form field. If no projectId is provided
//   (e.g. direct GitHub picker call from DashboardClient), this route creates
//   the document itself. Either way, the document is updated with the job ID
//   returned by chunk-service so the UI can poll /api/ingest/status.
// ─────────────────────────────────────────────────────────────────────────────
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

    // projectId is optionally pre-created by handleSmartUpload.
    // If present, we update that document. If absent, we create a new one.
    const existingProjectId = formData.get("projectId") as string | null;

    if (!file && source === "zip") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ── 3. Resolve project document ──────────────────────────────────────────
    const { databases } = await createSessionClient(sessionResult.session);
    let projectId: string;

    if (existingProjectId) {
      // Validate the pre-created document exists and belongs to this user
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
      // Direct call (e.g. GitHub picker from DashboardClient) — create now.
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

    // ── 4. Forward to chunk-service ──────────────────────────────────────────
    // chunk-service returns: { job_id, project_id, status, message }
    // where message is a human string like "554 chunks queued"
    let chunkResponse: Response;

    if (source === "github") {
      // GitHub source — repo metadata sent as JSON body.
      // chunk-service fetches file contents directly from GitHub API
      // using the user's OAuth token so we never store raw code here.
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
        },
      );
    } else {
      // ZIP source — forward multipart form directly.
      // chunk-service handles extraction, filtering, and chunking.
      const serviceFormData = new FormData();
      serviceFormData.append("project_id", projectId);
      serviceFormData.append("file", file!);

      chunkResponse = await fetch(`${CHUNK_SERVICE_URL}/chunk/zip`, {
        method: "POST",
        headers: { "x-internal-secret": INTERNAL_API_SECRET },
        body: serviceFormData,
      });
    }

    // ── 5. Handle chunk-service errors ───────────────────────────────────────
    if (!chunkResponse.ok) {
      const err = await chunkResponse.json().catch(() => ({}));

      // mark project failed so the UI shows an error state instead of
      // spinning forever on the progress poll
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
    // Parse chunk count from the message string "554 chunks queued".
    // The job_id is used by the UI to poll /api/ingest/status for real-time
    // progress as embed-service processes chunks from the Redis queue.
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
        // non-fatal — job is already queued, polling will still work
        console.warn("Failed to update project with job metadata:", err);
      });

    return NextResponse.json({
      success: true,
      projectId,
      jobId: chunkResult.job_id,
      message: chunkResult.message,
      chunksCount,
    });
  } catch (error) {
    console.error("Ingest route error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
