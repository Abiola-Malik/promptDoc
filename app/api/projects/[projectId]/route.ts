import { NextResponse } from "next/server";
import { appwriteConfig } from "@/db/appwrite/config";
import { createSessionClient } from "@/db/appwrite";
import { getSession } from "@/lib/helpers";
import { AppwriteException, Models } from "node-appwrite";

const { DatabaseId, projectsCollectionId } = appwriteConfig;

// Cache for 10 seconds, stale-while-revalidate for 60 seconds
const CACHE_MAX_AGE = 10;
const CACHE_STALE_WHILE_REVALIDATE = 60;

interface ProjectDocument extends Models.Document {
  name: string;
  status: "processing" | "ready" | "error";
  processingProgress?: number;
  fileCount: number;
  chunksCount?: number;
  framework?: string;
  projectSummary?: string;
  contentHash: string;
  userId: string | Models.Document;
  namespace: string;
}

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const awaitedParams = await context.params;
  const { projectId } = awaitedParams;

  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  try {
    // 1. Validate session
    const sessionResult = await getSession();

    if (!sessionResult.session || sessionResult.error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = sessionResult.session;
    const { databases, account } = await createSessionClient(session);

    // 2. Validate logged-in user
    let user: Models.User<Models.Preferences>;
    try {
      user = await account.get();
    } catch (error) {
      console.error("Failed to get user account:", error);
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // 3. Fetch project with error handling
    let project: ProjectDocument;
    try {
      const doc = await databases.getDocument(
        DatabaseId,
        projectsCollectionId,
        projectId
      );
      project = doc as unknown as ProjectDocument;
    } catch (error) {
      if (error instanceof AppwriteException) {
        if (error.code === 404) {
          return NextResponse.json(
            { error: "Project not found" },
            { status: 404 }
          );
        }

        console.error("Appwrite error:", {
          code: error.code,
          message: error.message,
          type: error.type,
        });
      }

      // Re-throw unknown/unhandled errors
      throw error;
    }

    // 4. Verify ownership - handle both string and Document types
    const projectUserId =
      typeof project.userId === "string" ? project.userId : project.userId.$id;

    if (projectUserId !== user.$id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this project" },
        { status: 403 }
      );
    }

    // 5. Return project with proper caching headers
    return NextResponse.json(
      { project },
      {
        status: 200,
        headers: {
          "Cache-Control": `private, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`,
        },
      }
    );
  } catch (error) {
    // Type-safe error logging
    if (error instanceof Error) {
      console.error("[GET /api/projects/[projectId]] Error:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    } else {
      console.error("[GET /api/projects/[projectId]] Unknown Error:", error);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
