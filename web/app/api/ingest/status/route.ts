import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/helpers";
import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";

const EMBED_SERVICE_URL = process.env.EMBED_SERVICE_URL!;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET!;

const { DatabaseId, projectsCollectionId } = appwriteConfig;

export async function GET(request: NextRequest) {
  const sessionResult = await getSession();
  if (!sessionResult.success || !sessionResult.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobId = request.nextUrl.searchParams.get("jobId");
  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${EMBED_SERVICE_URL}/job/${jobId}`, {
      headers: { "x-internal-secret": INTERNAL_API_SECRET },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const status = await res.json();
    // sync Appwrite project status when job reaches a terminal state
    if (
      projectId &&
      (status.status === "complete" ||
        status.status === "partial" ||
        status.status === "failed")
    ) {
      const { databases } = await createSessionClient(sessionResult.session);
      const newStatus = status.status === "failed" ? "failed" : "ready";
      await databases
        .updateDocument(DatabaseId, projectsCollectionId, projectId, {
          status: newStatus,
          chunksCount: status.processed,
        })
        .catch((err) => console.warn("Failed to sync project status:", err));
    }

    return NextResponse.json(status);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch job status" },
      { status: 500 },
    );
  }
}
