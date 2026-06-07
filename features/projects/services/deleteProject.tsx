import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { getSession } from "@/lib/helpers";

export const deleteProject = async (projectId: string) => {
  const { session } = await getSession();
  if (!session) throw new Error("Unauthorized");
  const { DatabaseId, projectsCollectionId } = appwriteConfig;

  const { databases } = await createSessionClient(session);
  await databases.deleteDocument(DatabaseId, projectsCollectionId, projectId);

  return { success: true };
};
