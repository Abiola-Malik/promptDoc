import { Models } from "appwrite";

export interface Project extends Models.Document {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  status: "processing" | "ready" | "error";
  processingProgress?: number;
  fileCount: number;
  chunksCount?: number;
  framework?: string;
  projectSummary?: string;
  contentHash: string;
  userId: string;
  namespace: string;
  [key: string]: any;
}
export interface UserProjectReturn {
  project: Project;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}
