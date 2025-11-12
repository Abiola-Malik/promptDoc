import { BATCH_SIZE, MAX_RETRIES, PINECONE_BATCH_SIZE, RATE_LIMIT } from "@/constants";
import { ai } from "@/lib/gemini";
import { EmbeddingResult } from "./embed.types";
import pLimit from "p-limit";
import { CodeChunk } from "../chunk/chunk.types";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateChunkId, sleep } from "@/lib/helpers";

export const embedAndStoreCodeChunks = async (
  projectId: string,
  chunks: CodeChunk[],
  pineconeIndex: ReturnType<Pinecone["index"]>,
  onProgress?: (current: number, total: number) => void
): Promise<EmbeddingResult> => {
  const result: EmbeddingResult = {
    success: true,
    totalChunks: chunks.length,
    successfulChunks: 0,
    failedChunks: 0,
    errors: [],
  };

  if (chunks.length === 0) return result;

  const limit = pLimit(RATE_LIMIT);

  console.log(` Embedding ${chunks.length} chunks for project ${projectId}`);

  try {
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      // --- EMBEDDING STAGE ---
      const embeddingPromises = batch.map((chunk, batchIndex) =>
        limit(async () => {
          const globalIndex = i + batchIndex;

          for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
              const embeddingResult = await ai.models.embedContent({
                model: "gemini-embedding-001",
                contents: [chunk.content],
              });

              const embedding = embeddingResult.embeddings?.[0]?.values;

              if (!embedding || embedding.length === 0) {
                throw new Error("Invalid embedding response");
              }

              return {
                globalIndex,
                vector: {
                  id: generateChunkId(projectId, chunk),
                  values: embedding,
                  metadata: {
                    projectId,
                    filename: chunk.metadata.filename,
                    startLine: chunk.metadata.startLine,
                    endLine: chunk.metadata.endLine,
                    language: chunk.metadata.language,
                    type: chunk.metadata.type,
                    chunkIndex: chunk.metadata.chunkIndex,
                    content: chunk.content.slice(0, 500),
                    contentLength: chunk.content.length,
                    timestamp: new Date().toISOString(),
                  },
                },
              };
            } catch (err) {
              if (attempt === MAX_RETRIES - 1) {
                const msg =
                  err instanceof Error
                    ? err.message
                    : "Unknown embedding error";

                result.errors.push({
                  chunkIndex: globalIndex,
                  error: msg,
                });

                result.failedChunks++;
                return null;
              }

              await sleep(2 ** attempt * 1000);
            }
          }

          return null;
        })
      );

      const embedResults = await Promise.all(embeddingPromises);

      // Filter valid vectors
      const validVectors = embedResults
        .filter((r): r is { globalIndex: number; vector: any } => r !== null)
        .map((r) => r.vector);

      const vectorIndexes = embedResults
        .filter((r): r is { globalIndex: number; vector: any } => r !== null)
        .map((r) => r.globalIndex);

      if (validVectors.length > 0) {
        try {
          for (let j = 0; j < validVectors.length; j += PINECONE_BATCH_SIZE) {
            const pineconeBatch = validVectors.slice(
              j,
              j + PINECONE_BATCH_SIZE
            );

            await pineconeIndex.upsert(pineconeBatch);
          }

          result.successfulChunks += validVectors.length;
          console.log(`Upserted ${validVectors.length} vectors`);
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Pinecone upsert failed";

          console.error(" Pinecone error:", msg);

          vectorIndexes.forEach((chunkIndex) => {
            result.errors.push({
              chunkIndex,
              error: msg,
            });
          });

          result.failedChunks += validVectors.length;
        }
      }

      const processed = Math.min(i + BATCH_SIZE, chunks.length);
      onProgress?.(processed, chunks.length);
    }

    result.success = result.failedChunks === 0;

    console.log(
      `Embedding complete — ${result.successfulChunks}/${result.totalChunks} succeeded`
    );

    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fatal error";

    console.error(" Fatal error:", msg);

    result.success = false;
    result.errors.push({ chunkIndex: -1, error: msg });

    return result;
  }
};