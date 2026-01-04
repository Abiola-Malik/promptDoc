export interface ExtractedFile {
  path: string;
  content: string;
  filename: string;
  extension: string;
  size?: number;
}
export interface ExtractionResult {
  success: boolean;
  files: ExtractedFile[];
  stats: {
    totalFiles: number;
    totalSize: number;
    skipped: number;
  };
  error?: string;
  extractionPath?: string;
}
