
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
  handleSubmit: (formdata: FormData) => Promise<AuthResponse>;
  signUpWithGoogle: () => Promise<void>;
}

interface SignUpFormClientProps {
  handleSubmit: (formdata: FormData) => Promise<AuthResponse>;
  signUpWithGoogle: () => Promise<void>;
}

interface userProps {
  username: string;
  email: string;
  password: string;
}

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