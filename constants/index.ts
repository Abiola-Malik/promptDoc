 const filesREGEX = /\.(js|ts|jsx|tsx|py|java|go|rb|php|html|css|json|md|mdx|yaml|yml|xml|sh|bash|zsh|txt)$/i;
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file
const MAX_TOTAL_SIZE = 100 * 1024 * 1024 // 100MB total
const MAX_FILES = 1000 // Max files to process
const ALLOWED_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.go', 
  '.java', '.rb', '.rs', '.php', '.c', '.cpp', '.txt',
  '.html', '.css', '.json', '.md', '.mdx', 
  '.yaml', '.yml', '.xml', '.sh', '.bash', '.zsh'
])
export { MAX_FILE_SIZE, MAX_TOTAL_SIZE, MAX_FILES,  filesREGEX, ALLOWED_EXTENSIONS };