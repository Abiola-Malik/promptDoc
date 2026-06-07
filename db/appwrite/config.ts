import { appwriteConfig as AppwriteConfig } from "@/types/global";

export const appwriteConfig: AppwriteConfig = {
  AppwriteKey: process.env.APPWRITE_KEY || "",
  ProjectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  EndpointUrl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL || "",
  DatabaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "",
  chatsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_CHATS_ID || "",
  projectsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID || "",
  messagesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_ID || "",
  storageBucketId: process.env.NEXT_PUBLIC_STORAGE_BUCKET_ID || "",
  filesCollectionId: process.env.NEXT_PUBLIC_FILES_COLLECTION_ID || "",
};
const requiredFields = ["ProjectId", "EndpointUrl", "DatabaseId"] as const;
for (const field of requiredFields) {
  if (!appwriteConfig[field]) {
    throw new Error(`Missing required Appwrite configuration: ${field}`);
  }
}
