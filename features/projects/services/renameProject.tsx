import { getSession } from "@/lib/helpers";
import { getSpecificProject } from "./getSpecificProject";
import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";

export const renameProject = async (projectId: string, newName: string) => {
  const { session } = await getSession();
  if (!session) throw new Error("Unauthorized");

  const trimmedName = newName.trim();
  if (!trimmedName) throw new Error("Project name cannot be empty");
  if (trimmedName.length > 100) throw new Error("Project name too long");

  const project = await getSpecificProject(projectId);
  if (!project) throw new Error("Project not found");
  const { DatabaseId, projectsCollectionId } = appwriteConfig;
  const { databases } = await createSessionClient(session);
  const updatedProject = await databases.updateDocument(
    DatabaseId,
    projectsCollectionId,
    projectId,
    {
      name: trimmedName,
    }
  );
  return updatedProject;
};
