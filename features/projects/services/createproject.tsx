import { appwriteConfig } from "@/db/appwrite/config";
import { Project } from "../model/project";
import { createSessionClient } from "@/db/appwrite";
import { ID } from "node-appwrite";
import { getSession } from "@/lib/helpers";
import checkExistingProject from "./checkExistingProject";

export const createProject = async (
  projectData: Omit<Project, "id" | "userId">
) => {
  const { DatabaseId, projectsCollectionId } = appwriteConfig;
  const { name, description, contentHash } = projectData;
  const { session } = await getSession();
  if (!session) throw new Error("Unauthorized");
  const { databases, account } = await createSessionClient(session);
  const userId = "user:" + (await account.get()).$id;
  const existingProject = contentHash
    ? await checkExistingProject(contentHash, userId)
    : null;

  if (existingProject) {
    return existingProject;
  }
  const project = await databases.createDocument(
    DatabaseId,
    projectsCollectionId,
    ID.unique(),
    {
      name,
      description,
      userId,
      contentHash,
    }
  );

  return project;
};
