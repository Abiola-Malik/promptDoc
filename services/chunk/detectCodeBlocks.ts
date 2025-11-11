import { patterns } from "@/constants"

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