export interface EmbeddingResult {
  success: boolean
  totalChunks: number
  successfulChunks: number
  failedChunks: number
  errors: Array<{ chunkIndex: number; error: string }>
}