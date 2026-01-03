// app/api/files/[fileId]/route.ts
import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { getLoggedInUser } from "@/lib/actions/user.action";
import { getSession } from "@/lib/helpers";
import { NextRequest } from "next/server";
import { Query } from "node-appwrite";

const { DatabaseId, filesCollectionId, storageBucketId } = appwriteConfig;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  if (!fileId) {
    return new Response("Missing fileId", { status: 400 });
  }

  const user = await getLoggedInUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const sessionResult = await getSession();
    if (!sessionResult.session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { storage, databases } = await createSessionClient(
      sessionResult.session
    );

    // Get metadata to verify ownership and get filename/mime
    const result = await databases.listDocuments(
      DatabaseId,
      filesCollectionId,
      [
        Query.equal("fileId", fileId), // This is correct here
        Query.limit(1),
      ]
    );

    if (result.total === 0) {
      return new Response("File not found", { status: 404 });
    }

    const fileDoc = result.documents[0];

    if (fileDoc.userId !== user.$id) {
      return new Response("Forbidden", { status: 403 });
    }

    // Get actual file view (binary)
    const fileData = await storage.getFileView(storageBucketId, fileDoc.fileId);

    if (!fileData) {
      return new Response("File not found", { status: 404 });
    }

    const filename = fileDoc.path?.split("/")?.pop() || "download.md";
    return new Response(fileData, {
      status: 200,
      headers: {
        "Content-Type": fileDoc.mimeType || "text/markdown",
        "Content-Disposition": `inline; filename="${encodeURIComponent(
          filename
        )}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    if (!error || typeof error !== "object" || !("code" in error)) {
      console.error("Unexpected error:", error);
      return new Response("Internal server error", { status: 500 });
    }
    console.error("Error retrieving file:", error);
    if (error.code === 404) {
      return new Response("File not found", { status: 404 });
    }
    return new Response("Internal server error", { status: 500 });
  }
}
