import { ChunkOptions, CodeChunk } from "./chunk.types";
import { detectChunkType } from "./detectChunkType";
import { detectCodeBlocks } from "./detectCodeBlocks";
import { getLanguageFromFilename } from "./languageDetection";

export const chunkCode = async (
  code: string,
  filename: string,
  options: ChunkOptions = {}
): Promise<CodeChunk[]> => {
  const {
    maxChunkSize = 1000,
    minChunkSize = 100,
    overlap = 100,
    preserveStructure = true,
  } = options;

  const language = getLanguageFromFilename(filename);
  const lines = code.split("\n");
  const chunks: CodeChunk[] = [];

  let currentChunk: string[] = [];
  let currentStartLine = 1;
  let chunkIndex = 0;

  const blockBoundaries = preserveStructure
    ? detectCodeBlocks(lines, language)
    : [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    currentChunk.push(line);

    const chunkText = currentChunk.join("\n");
    const isAtBlockBoundary = blockBoundaries.includes(i);

    // Chunk if: reached max size OR at natural boundary
    if (
      chunkText.length >= maxChunkSize ||
      (isAtBlockBoundary && chunkText.length >= minChunkSize)
    ) {
      chunks.push({
        content: chunkText,
        metadata: {
          startLine: currentStartLine,
          endLine: i + 1,
          filename,
          language,
          chunkIndex: chunkIndex++,
          type: detectChunkType(chunkText),
        },
      });

      // Add overlap for context continuity
      const overlapLines = Math.min(
        Math.floor(overlap / (chunkText.length / currentChunk.length)),
        currentChunk.length - 1
      );

      currentChunk = overlapLines > 0 ? currentChunk.slice(-overlapLines) : [];
      currentStartLine = i + 2 - overlapLines;
    }
  }

  // Add final chunk
  if (currentChunk.length > 0) {
    const chunkText = currentChunk.join("\n");
    if (chunkText.length >= minChunkSize) {
      chunks.push({
        content: chunkText,
        metadata: {
          startLine: currentStartLine,
          endLine: lines.length,
          filename,
          language,
          chunkIndex: chunkIndex++,
          type: detectChunkType(chunkText),
        },
      });
    }
  }
  return chunks;
};
