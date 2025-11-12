import {  createSessionClient } from "../../db/appwrite";
import { getSession } from "../helpers";
import { appwriteConfig } from "../../db/appwrite/config";
import { ID, Query } from "node-appwrite";

export const createProject = async (projectData: { title: string; description?: string }) => {
    const {DatabaseId, projectsCollectionId} = appwriteConfig
const { title, description } = projectData;
const {session} = await getSession()
    if(!session) throw new Error('Unauthorized'

    )
    const {databases} = await createSessionClient(session)
     const userId = 'user:' + (await (await createSessionClient(session)).account.get()).$id;
     console.log(userId);

    const project = await databases.createDocument(DatabaseId, projectsCollectionId, ID.unique(), {
    title,
    description,
    owner: userId,
  });

     return project

}

export const getUserProjects = async () => {
const {session} = await getSession()
  if (!session) throw new Error('Unauthorized');
    const {DatabaseId, projectsCollectionId} = appwriteConfig

  const { databases, account } = await createSessionClient(session);
  const user = await account.get();

  const projects = await databases.listDocuments(DatabaseId, projectsCollectionId, [
    Query.equal('owner', user.$id),
  ]);

  return projects.documents;
};

// Delete a project
export const deleteProject = async (projectId: string) => {
const {session} = await getSession()
  if (!session) throw new Error('Unauthorized');
    const {DatabaseId, projectsCollectionId} = appwriteConfig

  const { databases } = await createSessionClient(session);
  await databases.deleteDocument(DatabaseId, projectsCollectionId, projectId);

  return { success: true };
};

export const getSpecificProject = async (projectId: string) => {
const {session} = await getSession()
  if (!session) throw new Error('Unauthorized');
    const {DatabaseId, projectsCollectionId} = appwriteConfig
    const { databases } = await createSessionClient(session);
    const project = await databases.getDocument(DatabaseId, projectsCollectionId, projectId);
    if (!project) {
        throw new Error('Project not found');
    }
    return project;
}



export const renameProject = async (projectId: string, newName  : string)   => {
const {session} = await getSession()
  if (!session) throw new Error('Unauthorized');
    const project = await getSpecificProject(projectId);
    if (!project) throw new Error('Project not found');
    const {DatabaseId, projectsCollectionId} = appwriteConfig
    const { databases } = await createSessionClient(session);
    const updatedProject = await databases.updateDocument(
        DatabaseId,
        projectsCollectionId,
        projectId,
        {
            name: newName,
        }
    );
    return updatedProject;
}