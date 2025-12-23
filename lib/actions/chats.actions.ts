import { appwriteConfig } from "../../db/appwrite/config";

import { createSessionClient } from "../../db/appwrite";
import { getSession } from "../helpers";
import { ID, Query } from "node-appwrite";
const { DatabaseId, chatsCollectionId, messagesCollectionId } = appwriteConfig;

type MessageType = {
  projectId: string;
  chatId?: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

export const createChat = async (chatData: {
  projectId: string;
  title: string;
}) => {
  const { session } = await getSession();
  if (!session) throw new Error("Unauthorized");
  const { title, projectId } = chatData;
  const { databases } = await createSessionClient(session);

  const chat = await databases.createDocument(
    DatabaseId,
    chatsCollectionId,
    ID.unique(),
    {
      project_id: projectId,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  );
  return chat;
};

export const getProjectChats = async (projectId: string) => {
  const { session } = await getSession();
  if (!session) throw new Error("Unauthorized");
  const { databases } = await createSessionClient(session);

  const chats = await databases.listDocuments(DatabaseId, chatsCollectionId, [
    Query.equal("project_id", projectId),
  ]);

  return chats.documents;
};

export const saveMessage = async (message: MessageType) => {
  const { chatId, role, content, sources, projectId } = message;
  const { session } = await getSession();
  if (!session) throw new Error("Unauthorized");
  const { databases } = await createSessionClient(session);
  let lastChat = chatId;
  if (!lastChat) {
    const chats = await databases.createDocument(
      DatabaseId,
      chatsCollectionId,
      ID.unique(),
      {
        project_id: projectId,
        title: role === "user" ? content.slice(0, 60) : "New Chat",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
    lastChat = chats.$id;
  } else {
    // update timestamp
    await databases.updateDocument(DatabaseId, chatsCollectionId, lastChat, {
      updated_at: new Date().toISOString(),
    });
  }

  // save Message

  const savedMessage = await databases.createDocument(
    DatabaseId,
    messagesCollectionId,
    ID.unique(),
    {
      chat_id: lastChat,
      project_id: projectId,
      role,
      content,
      sources: sources || [],
      created_at: new Date().toISOString(),
    }
  );

  return { chatId: lastChat, message: savedMessage };
};
