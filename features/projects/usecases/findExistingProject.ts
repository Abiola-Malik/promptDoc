import { createSessionClient } from "@/db/appwrite";
import { getSession } from "@/lib/helpers";
import { appwriteConfig } from "@/db/appwrite/config";
import { Query } from "node-appwrite";

const {DatabaseId, projectsCollectionId} = appwriteConfig

export const findExistingProject = async (
  contentHash: string,
  userId: string
): Promise<string | null> => {
  const sessionResult = await getSession();
  if (!sessionResult.success) {
    throw new Error("No valid session");
  }
  const { databases } = await createSessionClient(sessionResult.session!);
  try {
    const existingHash = await databases.listDocuments(
      DatabaseId,
      projectsCollectionId,
      [Query.equal("contentHash", contentHash), Query.equal("userId", userId)]
    );
    return existingHash.documents.length > 0
      ? existingHash.documents[0].$id
      : null;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to query existing projects: ${error.message}`);
    }
  }
  return null;
};