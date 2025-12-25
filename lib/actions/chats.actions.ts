// lib/actions/chats.actions.ts
"use server";

import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { getSession } from "@/lib/helpers";
import { ID, Query } from "node-appwrite";
import { getLoggedInUser } from "./user.action";

const {
  DatabaseId,
  chatsCollectionId,
  messagesCollectionId,
  projectsCollectionId,
} = appwriteConfig;

export interface Chat {
  $id: string;
  projectId: string;
  userId: string;
  title: string;
  description?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  $id: string;
  chatId: string;
  projectId: string;
  role: "user" | "assistant";
  content: string;
  sources?: string;
  createdAt: string;
}

// Create new chat
export async function createChat(
  projectId: string,
  title?: string
): Promise<Chat> {
  const { session } = await getSession();
  if (!session) throw new Error("Unauthorized");

  const { databases, account } = await createSessionClient(session);
  const user = await account.get();

  // Verify project ownership
  const project = await databases.getDocument(
    DatabaseId,
    projectsCollectionId,
    projectId
  );

  const projectUserId =
    typeof project.userId === "string" ? project.userId : project.userId.$id;

  if (projectUserId !== user.$id) {
    throw new Error("Forbidden: You don't own this project");
  }

  try {
    const chat = await databases.createDocument(
      DatabaseId,
      chatsCollectionId,
      ID.unique(),
      {
        projectId,
        userId: user.$id,
        title: title || `Chat ${new Date().toLocaleDateString()}`,
        description: "",
        messageCount: 0,
        // createdAt: new Date().toISOString(),
        // updatedAt: new Date().toISOString(),
      }
    );

    return chat as unknown as Chat;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw new Error("Failed to create chat");
  }
}

// Get all chats for a project
export async function getProjectChats(projectId: string): Promise<Chat[]> {
  const { session } = await getSession();
  if (!session) throw new Error("Unauthorized");

  const { databases, account } = await createSessionClient(session);
  const user = await account.get();
  const userId = user.$id;
  const project = await databases.getDocument(
    DatabaseId,
    projectsCollectionId,
    projectId
  );
  const projectUserId =
    typeof project.userId === "string" ? project.userId : project.userId.$id;
  if (projectUserId !== userId) {
    throw new Error("Forbidden: You don't own this project");
  }

  try {
    const chats = await databases.listDocuments(DatabaseId, chatsCollectionId, [
      Query.equal("projectId", projectId),
      // Query.orderDesc("updatedAt"),
      Query.limit(100),
    ]);

    return chats.documents as unknown as Chat[];
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw new Error("Failed to fetch chats");
  }
}

// Get messages for a specific chat
export async function getChatMessages(
  chatId: string,
  limit: number = 100
): Promise<Message[]> {
  const { session } = await getSession();
  if (!session) throw new Error("Unauthorized");

  const { databases } = await createSessionClient(session);
  const loggedInUser = await getLoggedInUser();
  if (!loggedInUser) throw new Error("Unauthorized");

  const userId = loggedInUser.$id;
  const chat = await databases.getDocument(
    DatabaseId,
    chatsCollectionId,
    chatId
  );
  if (chat.userId !== userId) {
    throw new Error("Forbidden: You don't own this chat");
  }

  try {
    const messages = await databases.listDocuments(
      DatabaseId,
      messagesCollectionId,
      [
        Query.equal("chatId", chatId),
        // Query.orderAsc("createdAt"),
        Query.limit(limit),
      ]
    );

    return messages.documents as unknown as Message[];
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to fetch messages");
  }
}

// Save message to chat
export async function saveMessage({
  chatId,
  role,
  content,
  projectId,
  sources,
}: {
  chatId: string;
  role: "user" | "assistant";
  content: string;
  projectId: string;
  sources?: string[];
}): Promise<Message> {
  const { session } = await getSession();
  if (!session) throw new Error("Unauthorized");

  const { databases } = await createSessionClient(session);
  const loggedInUser = await getLoggedInUser();
  if (!loggedInUser) throw new Error("Unauthorized");

  const userId = loggedInUser.$id;
  const chat = await databases.getDocument(
    DatabaseId,
    chatsCollectionId,
    chatId
  );
  if (chat.userId !== userId) {
    throw new Error("Forbidden: You don't own this chat");
  }

  try {
    const message = await databases.createDocument(
      DatabaseId,
      messagesCollectionId,
      ID.unique(),
      {
        chatId,
        projectId,
        role,
        content,
        sources: sources ? JSON.stringify(sources) : undefined,
        // createdAt: new Date().toISOString(),
      }
    );

    await databases.updateDocument(DatabaseId, chatsCollectionId, chatId, {
      // updatedAt: new Date().toISOString(),
      messageCount: (chat.messageCount || 0) + 1,
    });

    return message as unknown as Message;
  } catch (error) {
    console.error("Error saving message:", error);
    throw new Error("Failed to save message");
  }
}

// Update chat title
export async function updateChatTitle(
  chatId: string,
  title: string
): Promise<void> {
  const { session } = await getSession();
  if (!session) throw new Error("Unauthorized");

  const { databases } = await createSessionClient(session);
  const loggedInUser = await getLoggedInUser();
  if (!loggedInUser) throw new Error("Unauthorized");

  const userId = loggedInUser.$id;
  const chat = await databases.getDocument(
    DatabaseId,
    chatsCollectionId,
    chatId
  );
  if (chat.userId !== userId) {
    throw new Error("Forbidden: You don't own this chat");
  }

  try {
    await databases.updateDocument(DatabaseId, chatsCollectionId, chatId, {
      title,
      // updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating chat title:", error);
    throw new Error("Failed to update chat title");
  }
}

// Delete chat and all its messages
export async function deleteChat(chatId: string): Promise<void> {
  const { session } = await getSession();
  if (!session) throw new Error("Unauthorized");

  const { databases } = await createSessionClient(session);
  const loggedInUser = await getLoggedInUser();
  if (!loggedInUser) throw new Error("Unauthorized");
  const userId = loggedInUser.$id;
  const chat = await databases.getDocument(
    DatabaseId,
    chatsCollectionId,
    chatId
  );
  if (chat.userId !== userId) {
    throw new Error("Forbidden: You don't own this chat");
  }

  try {
    // Delete all messages first
    const messages = await databases.listDocuments(
      DatabaseId,
      messagesCollectionId,
      [Query.equal("chatId", chatId), Query.limit(1000)]
    );

    for (const message of messages.documents) {
      await databases.deleteDocument(
        DatabaseId,
        messagesCollectionId,
        message.$id
      );
    }

    // Delete chat
    await databases.deleteDocument(DatabaseId, chatsCollectionId, chatId);
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw new Error("Failed to delete chat");
  }
}
