// app/api/files/[fileId]/download/route.ts
import { NextRequest } from "next/server";
import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { getSession } from "@/lib/helpers";
import { Query } from "node-appwrite";
import { getLoggedInUser } from "@/lib/actions/user.action";

const { storageBucketId, DatabaseId, filesCollectionId } = appwriteConfig;

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

    // Search for metadata document where fileId matches the storage file ID
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

    //check for file ownership

    if (fileDoc.userId !== user.$id) {
      return new Response("Forbidden", { status: 403 });
    }

    // Download from storage using the actual storage file ID
    const fileData = await storage.getFileDownload(storageBucketId, fileId);

    const filename = fileDoc.path?.split("/").pop() || "download.md";
    const safeFilename = encodeURIComponent(filename.replace(/["\\\r\n]/g, ""));

    const headers: Record<string, string> = {
      "Content-Type": fileDoc.mimeType || "text/markdown",
      "Content-Disposition": `attachment; filename="${safeFilename}"`,
    };

    if (fileDoc.size) {
      headers["Content-Length"] = fileDoc.size.toString();
    }

    return new Response(fileData, {
      status: 200,
      headers,
    });
  } catch (error) {
    if (!error || typeof error !== "object" || !("code" in error)) {
      console.error("Unexpected error:", error);
      return new Response("Internal server error", { status: 500 });
    }
    console.error("Error downloading file:", error);
    const errorCode = (error as Record<string, unknown>).code;
    const errorType = (error as Record<string, unknown>).type;
    if (
      errorCode === 404 ||
      (typeof errorType === "string" &&
        errorType.includes("document_not_found"))
    ) {
      return new Response("File not found", { status: 404 });
    }
    return new Response("Internal server error", { status: 500 });
  }
}
