export interface CodeChunk {
  content: string;
  metadata: {
    startLine: number;
    endLine: number;
    filename: string;
    language?: string;
    chunkIndex: number;
    type: "function" | "class" | "block" | "generic";
  };
}

export interface ChunkOptions {
  maxChunkSize?: number;
  minChunkSize?: number;
  overlap?: number;
  preserveStructure?: boolean;
  semantic?: boolean;
}
