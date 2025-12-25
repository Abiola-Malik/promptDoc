interface User {
  username?: string;
  email?: string;
  userId?: string;
  [key: string]: unknown;
}
interface AuthResponse {
  success: boolean;
  errors?: Record<string, string>;
}
interface SignInFormClient {
  handleSubmit: (formdata: FormData) => Promise<AuthResponse | undefined>;
  signUpWithGoogle: () => Promise<void>;
}

interface SignUpFormClientProps {
  handleSubmit: (formdata: FormData) => Promise<AuthResponse | undefined>;
  signUpWithGoogle: () => Promise<void>;
}

interface userProps {
  $id?: string;
  username: string;
  email: string;
  password: string;
}

export interface appwriteConfig {
  AppwriteKey: string;
  ProjectId: string;
  EndpointUrl: string;
  DatabaseId: string;
  usersCollectionId: string;
  chatsCollectionId: string;
  projectsCollectionId: string;
  messagesCollectionId: string;
  storageBucketId: string;
  filesCollectionId: string;
}

interface session {
  success: boolean;
  session: string;
}

export interface Vector {
  id: string;
  values: number[];
  metadata?: Record<string, unknown>;
}
