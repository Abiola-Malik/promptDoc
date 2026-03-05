import { GoogleGenerativeAI } from "@google/generative-ai";
import pLimit from "p-limit";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateChunkId, sleep } from "@/lib/helpers";
import type { CodeChunk } from "../chunk/chunk.types";
import type { EmbeddingResult } from "./embed.types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const GEMINI_MODEL = "gemini-embedding-001";
const BATCH_SIZE = 100; // Gemini supports up to 100 per batch
const CONCURRENCY = 5; // Number of concurrent batch requests
const MAX_RETRIES = 6;

export const embedAndStoreCodeChunks = async (
  projectId: string,
  chunks: CodeChunk[],
  pineconeIndex: ReturnType<Pinecone["index"]>,
  onProgress?: (current: number, total: number) => void,
): Promise<EmbeddingResult> => {
  const result: EmbeddingResult = {
    success: true,
    totalChunks: chunks.length,
    successfulChunks: 0,
    failedChunks: 0,
    errors: [],
  };

  if (chunks.length === 0) return result;

  console.log(
    ` Embedding ${chunks.length} code chunks with Gemini (${GEMINI_MODEL}) in batches of ${BATCH_SIZE}`,
  );

  // Pre-generate all IDs (parallel, fast)
  const chunksWithId = await Promise.all(
    chunks.map(async (chunk, idx) => ({
      index: idx,
      chunk,
      id: await generateChunkId(projectId, chunk),
    })),
  );

  const limit = pLimit(CONCURRENCY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const batchTasks = [];

  for (let i = 0; i < chunksWithId.length; i += BATCH_SIZE) {
    const batch = chunksWithId.slice(i, i + BATCH_SIZE);

    batchTasks.push(
      limit(async () => {
        let attempt = 0;
        while (attempt < MAX_RETRIES) {
          try {
            // Create batch embedding requests
            const requests = batch.map((b) => ({
              content: {
                role: "user" as const,
                parts: [{ text: b.chunk.content }],
              },
            }));

            // Use batchEmbedContents for async batching
            const response = await model.batchEmbedContents({
              requests,
            });

            const embeddings = response.embeddings;

            if (!embeddings || embeddings.length === 0) {
              throw new Error("Empty response from Gemini");
            }

            if (embeddings.length !== batch.length) {
              throw new Error(
                `Mismatch: expected ${batch.length} embeddings, got ${embeddings.length}`,
              );
            }

            // Build vectors
            const vectors = batch.map((item, idx) => {
              const embedding = embeddings[idx]?.values;
              if (!embedding || embedding.length === 0) {
                throw new Error(`Missing embedding for chunk ${item.index}`);
              }

              return {
                id: item.id,
                values: embedding,
                metadata: {
                  projectId,
                  filename: item.chunk.metadata.filename,
                  startLine: item.chunk.metadata.startLine,
                  endLine: item.chunk.metadata.endLine,
                  language: item.chunk.metadata.language ?? "unknown",
                  type: item.chunk.metadata.type,
                  chunkIndex: item.chunk.metadata.chunkIndex,
                  content: item.chunk.content.slice(0, 500),
                  contentLength: item.chunk.content.length,
                  timestamp: new Date().toISOString(),
                },
              };
            });

            // Upsert to Pinecone in sub-batches of 100
            for (let j = 0; j < vectors.length; j += 100) {
              await pineconeIndex
                .namespace(projectId)
                .upsert(vectors.slice(j, j + 100));
            }

            result.successfulChunks += vectors.length;
            onProgress?.(
              result.successfulChunks + result.failedChunks,
              chunks.length,
            );

            return vectors.length;
          } catch (err: any) {
            attempt++;

            // Handle rate limiting
            if (
              err.status === 429 ||
              err.message?.includes("rate limit") ||
              err.message?.includes("quota")
            ) {
              const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
              console.warn(
                `Rate limited (attempt ${attempt}/${MAX_RETRIES}), waiting ${delay.toFixed(
                  0,
                )}ms...`,
              );
              await sleep(delay);
              continue;
            }

            // Max retries reached
            if (attempt === MAX_RETRIES) {
              console.error("Failed batch after retries:", err.message || err);
              batch.forEach((item) => {
                result.errors.push({
                  chunkIndex: item.index,
                  error: err.message || "Embedding failed",
                });
                result.failedChunks++;
              });
              onProgress?.(
                result.successfulChunks + result.failedChunks,
                chunks.length,
              );
              break;
            }

            // Retry for other errors
            const delay = Math.pow(2, attempt) * 500;
            console.warn(
              `Error on attempt ${attempt}/${MAX_RETRIES}, retrying in ${delay}ms...`,
              err.message,
            );
            await sleep(delay);
          }
        }
        return 0;
      }),
    );
  }

  await Promise.all(batchTasks);

  result.success = result.failedChunks === 0;
  console.log(
    ` Done! ${result.successfulChunks}/${result.totalChunks} embedded & stored`,
  );

  return result;
};
