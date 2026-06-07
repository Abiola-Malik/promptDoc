import { CodeChunk } from "./chunk.types"

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