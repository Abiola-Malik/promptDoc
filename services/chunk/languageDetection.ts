import { languageMap } from "@/constants"

export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  
 return languageMap[ext || ''] || 'unknown'
}