import { languageMap, patterns } from "@/constants";
import { CodeChunk } from "@/types/global";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const isProduction = process.env.NODE_ENV === 'production';

export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  
 return languageMap[ext || ''] || 'unknown'
}

export function detectCodeBlocks(lines: string[], language: string): number[] {
  const boundaries: number[] = []
  
  
  const languagePatterns = patterns[language as keyof typeof patterns] || patterns.typescript
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    
    if (languagePatterns.some(pattern => pattern.test(trimmedLine))) {
      boundaries.push(index)
    }
    
    // Also mark closing braces as boundaries
    if (trimmedLine === '}' || trimmedLine === '};') {
      boundaries.push(index)
    }
  })
  
  return boundaries
}


export function detectChunkType(code: string): CodeChunk['metadata']['type'] {
  const trimmed = code.trim()
  
  if (/^(export\s+)?(async\s+)?function\s+/m.test(trimmed) || 
      /^(const|let|var)\s+\w+\s*=\s*(async\s+)?\(/m.test(trimmed)) {
    return 'function'
  }
  
  if (/^(export\s+)?(default\s+)?class\s+/m.test(trimmed)) {
    return 'class'
  }
  
  if (/^(interface|type|enum)\s+/m.test(trimmed)) {
    return 'block'
  }
  
  return 'generic'
}