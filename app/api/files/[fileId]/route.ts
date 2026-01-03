// app/api/files/[fileId]/route.ts
import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { getSession } from "@/lib/helpers";
import { NextRequest } from "next/server";

const { DatabaseId, filesCollectionId, storageBucketId } = appwriteConfig;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  if (!fileId) {
    return new Response("Missing fileId", { status: 400 });
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
    const fileDoc = await databases.getDocument(
      DatabaseId,
      filesCollectionId,
      fileId
    );

    // Optional: verify project/user ownership here if needed
    // For now, trust that permissions on the document protect it

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
