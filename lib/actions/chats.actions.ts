import { appwriteConfig } from "../appwrite/config";

import { createSessionClient } from "../appwrite";
import { getSession } from "../helpers";
import { ID, Query } from "node-appwrite";
const { DatabaseId, chatsCollectionId, } = appwriteConfig;

export const createChat = async (chatData: { projectId: string; title: string }) => {
    const {session} = await getSession()
     if(!session) throw new Error('Unauthorized')
    const { title, projectId } = chatData;
 const { databases } = await createSessionClient(session);

  const chat = await databases.createDocument(DatabaseId, chatsCollectionId, ID.unique(), {
    project_id: projectId,
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  return chat;
}

export const getProjectChats = async (projectId: string) => {
    
   const {session} = await getSession()
     if(!session) throw new Error('Unauthorized')
 const { databases } = await createSessionClient(session);

  const chats = await databases.listDocuments(DatabaseId, chatsCollectionId, [
    Query.equal('project_id', projectId),
  ]);

  return chats.documents;
};