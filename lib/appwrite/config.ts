interface appwriteConfig {
  AppwriteKey: string;
  ProjectId: string;
  EndpointUrl: string;
  DatabaseId: string;
  usersCollectionId: string;
  chatsCollectionId: string;
  projectsCollectionId: string;
  messagesCollectionId: string;
}

export const appwriteConfig: appwriteConfig = {
  AppwriteKey: process.env.NEXT_PUBLIC_APPWRITE_KEY || '',
  ProjectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
  EndpointUrl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL || '',
  DatabaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
  usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '',
  chatsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_CHATS_ID || '',
  projectsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID || '',
  messagesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_ID || '',
};
