// features/upload/usecases/handleSmartUpload.ts
import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { ID } from "node-appwrite";
import checkExistingProject from "@/features/projects/services/checkExistingProject";
import { getSession } from "@/lib/helpers";
import { getLoggedInUser } from "@/lib/actions/user.action";
import { generateContentHash } from "@/hashing";

const { DatabaseId, projectsCollectionId } = appwriteConfig;

// ── Return types ──────────────────────────────────────────────────────────────
// Two possible outcomes: a successful ingest that returns a project ID and
// job ID for the client to poll, or a cached hit that skips processing entirely.
interface SmartUploadResult {
  success: true;
  projectId: string;
  jobId: string;
  cached?: boolean;
  stats: {
    message: string;
  };
}

interface SmartUploadError {
  success: false;
  error: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// handleSmartUpload
//
// Orchestrates the ZIP upload flow for the monolith → microservices migration.
// Phase 4 implementation: this function no longer does chunking or embedding
// itself. Instead it:
//   1. Validates the file and session
//   2. Checks the content hash cache — if we've seen this exact codebase
//      before, we skip processing entirely and return the existing project
//   3. Creates a project record in Appwrite with status "indexing"
//   4. Forwards the ZIP to chunk-service via /api/ingest
//   5. Returns the project ID + job ID so the UI can poll embed-service
//      for real-time progress via /api/ingest/status
//
// The strangler fig pattern: web/services/chunk/, web/services/embed/, and
// web/services/extract/ still exist but are no longer called here. They will
// be deleted in Phase 5 once the Python services are deployed and verified.
// ─────────────────────────────────────────────────────────────────────────────
export async function handleSmartUpload(
  formData: FormData,
): Promise<SmartUploadResult | SmartUploadError> {
  // ── 1. Parse + validate input ──────────────────────────────────────────────
  const file = formData.get("file") as File;
  const projectName =
    (formData.get("name") as string)?.trim() || "Untitled Project";
  const includeTests = formData.get("includeTests") === "true";
  const includeDotfiles = formData.get("includeDotfiles") === "true";

  if (!file || !file.name.endsWith(".zip")) {
    return { success: false, error: "Invalid file — only .zip files accepted" };
  }

  // ── 2. Auth ────────────────────────────────────────────────────────────────
  // Both session and user are required. Session is used to create the Appwrite
  // client with the correct user permissions. User.$id is the owner field on
  // the project document and is used for cache lookups.
  const sessionResult = await getSession();
  if (!sessionResult.success || !sessionResult.session) {
    return { success: false, error: "Unauthorized — please log in again" };
  }

  const user = await getLoggedInUser();
  if (!user?.$id) {
    return { success: false, error: "User not found" };
  }

  // ── 3. Content hash cache check ────────────────────────────────────────────
  // We hash the raw ZIP bytes before any processing. If this exact codebase
  // has been uploaded before by this user, we return the existing project
  // immediately — no chunking, no embedding, no API calls to Python services.
  // This is the most important performance optimisation for repeat uploads.
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentHash = generateContentHash(buffer);

  const existing = await checkExistingProject(contentHash, user.$id);
  if (existing) {
    return {
      success: true,
      projectId: existing.$id,
      jobId: "", // no job — already indexed
      cached: true,
      stats: { message: "Loaded from cache — no reprocessing needed" },
    };
  }

  // ── 4. Create project record in Appwrite ───────────────────────────────────
  // We create the project document before calling chunk-service so that:
  //   a) The user can be redirected to the project page immediately
  //   b) If chunk-service fails, we can mark the project as "failed"
  //   c) The project ID is used as the Pinecone namespace by embed-service
  //
  // Status lifecycle: indexing → ready (set by embed-service worker)
  //                            → failed (set here on error)
  const { databases } = await createSessionClient(sessionResult.session);
  const projectId = ID.unique();

  try {
    await databases.createDocument(
      DatabaseId,
      projectsCollectionId,
      projectId,
      {
        name: projectName,
        userId: user.$id,
        contentHash,
        status: "indexing",
        filesCount: 0, // updated by chunk-service response
        chunksCount: 0, // updated by chunk-service response
      },
    );
  } catch (error) {
    console.error("Failed to create project document:", error);
    return {
      success: false,
      error: "Failed to create project record",
    };
  }

  // ── 5. Forward to chunk-service via /api/ingest ────────────────────────────
  // We call our own Next.js /api/ingest route rather than chunk-service
  // directly for two reasons:
  //   a) /api/ingest handles the x-internal-secret header injection so
  //      this function doesn't need to know about service internals
  //   b) /api/ingest also updates the Appwrite project document with the
  //      job ID returned by chunk-service
  //
  // We pass the pre-created projectId so /api/ingest doesn't create a
  // duplicate document — it updates the existing one with the job ID.
  try {
    const ingestFormData = new FormData();
    ingestFormData.append("file", file);
    ingestFormData.append("name", projectName);
    ingestFormData.append("source", "zip");
    ingestFormData.append("projectId", projectId); // pre-created ID
    ingestFormData.append("includeTests", String(includeTests));
    ingestFormData.append("includeDotfiles", String(includeDotfiles));

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ingest`, {
      method: "POST",
      body: ingestFormData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      // mark project failed so the UI shows an error state
      await databases
        .updateDocument(DatabaseId, projectsCollectionId, projectId, {
          status: "failed",
        })
        .catch(() => {});
      return { success: false, error: err.error || "Ingest service error" };
    }

    const result = await res.json();

    // ── 6. Return job ID for progress polling ──────────────────────────────
    // The UI will poll /api/ingest/status?jobId=<jobId> every 2 seconds.
    // embed-service tracks processed/total_chunks in Redis and updates the
    // Appwrite project status to "ready" when all chunks are embedded.
    return {
      success: true,
      projectId,
      jobId: result.jobId,
      stats: { message: result.message || "Processing started" },
    };
  } catch (error) {
    console.error("handleSmartUpload error:", error);

    // best-effort status update — don't let this mask the original error
    await databases
      .updateDocument(DatabaseId, projectsCollectionId, projectId, {
        status: "failed",
      })
      .catch(() => {});

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Upload processing failed",
    };
  }
}
