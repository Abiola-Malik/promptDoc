export type UploadResult =
  | {
      success: true
      projectId: string
      documentation: string
      cached: boolean
      stats?: {
        filesProcessed: number
        chunksCreated: number
        embeddingsStored: number
      }
      message?: string
    }
  | {
      success: false
      projectId: ""
      error: string
    }

