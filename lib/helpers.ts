'use server'
import { CodeChunk } from "@/services/chunk/chunk.types";
import { cookies } from "next/headers";

export const getSession = async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    return {
      success: false,
      status: 401,
      error: 'No session',
    };
  }
  return {
    success: true, 
    session,
    status: 200
  }
}


/**
 * Generate unique ID for chunk
 */
export async function  generateChunkId(projectId: string, chunk: CodeChunk): Promise<string> {
  const { filename, chunkIndex } = chunk.metadata;
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${projectId}-${sanitizedFilename}-chunk${chunkIndex}`;
}

/**
 * Sleep utility for retry backoff
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

