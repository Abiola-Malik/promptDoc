import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { getSession } from "@/lib/helpers";
import { Query } from "node-appwrite";

export const getUserProjects = async (userId?: string) => {
  const { session } = await getSession();
  if (!session) throw new Error("Unauthorized");
  const { DatabaseId, projectsCollectionId } = appwriteConfig;

  const { databases, account } = await createSessionClient(session);
  const id = userId ?? (await account.get()).$id;
  try {
    const projects = await databases.listDocuments(
      DatabaseId,
      projectsCollectionId,
      [Query.equal("userId", id.toString())]
    );

    return projects.documents;
  } catch (error) {
    console.error("Failed to fetch user projects:", error);
    throw new Error("Failed to fetch user projects");
  }
};
