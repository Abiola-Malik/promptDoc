"use server";

import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { ID, Permission, Role } from "node-appwrite";
import { getLoggedInUser } from "./user.action";
import { getSession } from "../helpers";

const { storageBucketId, DatabaseId, filesCollectionId } = appwriteConfig;

interface CreateGeneratedFileInput {
  projectId: string;
  filename: string;
  title: string;
  content: string;
}

interface CreateGeneratedFileResult {
  fileId: string;
  path: string;
  url: string;
  size: number;
}

export async function createGeneratedFile({
  projectId,
  filename,
  title,
  content,
}: CreateGeneratedFileInput): Promise<CreateGeneratedFileResult> {
  try {
    // 1. Verify user is authenticated
    const loggedInUser = await getLoggedInUser();
    const { session } = await getSession();

    if (!loggedInUser || !session) {
      throw new Error("Unauthorized");
    }
    const { storage, databases } = await createSessionClient(session);
    // Note: We need to get userId from session, not admin client
    // Use session client to verify ownership

    // 3. Verify project ownership
    const project = await databases.getDocument(
      DatabaseId,
      appwriteConfig.projectsCollectionId,
      projectId
    );

    const user = loggedInUser;

    const projectUserId =
      typeof project.userId === "string" ? project.userId : project.userId.$id;

    if (projectUserId !== user.$id) {
      throw new Error("Forbidden: You don't own this project");
    }

    // 4. Create blob from markdown content
    const blob = new Blob([content], { type: "text/markdown" });

    // Convert Blob to File for Appwrite (requires name property)
    const file = new File([blob], filename, { type: "text/markdown" });

    // 5. Upload file with proper permissions
    const uploadedFile = await storage.createFile(
      storageBucketId,
      ID.unique(),
      file,
      [
        Permission.read(Role.user(user.$id)), // Owner can read
        Permission.update(Role.user(user.$id)), // Owner can update
        Permission.delete(Role.user(user.$id)), // Owner can delete
      ]
    );

    // 6. Save metadata to database (if collection exists)
    if (filesCollectionId) {
      try {
        await databases.createDocument(
          DatabaseId,
          filesCollectionId,
          ID.unique(),
          {
            projectId,
            fileId: uploadedFile.$id,
            path: filename,
            title,
            size: uploadedFile.sizeOriginal,
            mimeType: "text/markdown",
            userId: user.$id,
            // createdAt: new Date().toISOString(),
            // updatedAt: new Date().toISOString(),
          }
        );
      } catch (dbError) {
        console.error("Failed to save file metadata:", dbError);
        // Don't fail the whole operation if metadata save fails
        // The file is still uploaded successfully
      }
    }

    // 7. Return file info
    return {
      fileId: uploadedFile.$id,
      path: filename,
      url: `/api/files/${uploadedFile.$id}`, // You'll need to create this route
      size: uploadedFile.sizeOriginal,
    };
  } catch (error) {
    console.error("Error creating generated file:", error);

    if (error instanceof Error) {
      throw new Error(`Failed to create file: ${error.message}`);
    }

    throw new Error("Failed to create file: Unknown error");
  }
}
