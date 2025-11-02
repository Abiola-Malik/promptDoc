
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

interface session {
  success: boolean,
  session : string
}
 interface ExtractedFile {
  path: string;
  content: string;
  filename: string;
  extension: string;
  size?: number;
}

 interface ExtractionResult {
  success: boolean
  files: ExtractedFile[]
  stats: {
    totalFiles: number
    totalSize: number
    skipped: number
  }
  error?: string
}

export interface CodeChunk {
  content: string
  metadata: {
    startLine: number
    endLine: number
    filename?: string
    language?: string
    chunkIndex: number
    type: 'function' | 'class' | 'block' | 'generic'
  }
}

export interface ChunkOptions {
  maxChunkSize?: number
  minChunkSize?: number 
  overlap?: number 
  preserveStructure?: boolean 
}