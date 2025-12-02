const filesREGEX =
  /\.(js|ts|jsx|tsx|py|java|go|rb|php|html|css|json|md|mdx|yaml|yml|xml|sh|bash|zsh|txt)$/i;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB total
const MAX_FILES = 1000;
const BATCH_SIZE = 120;
const MAX_RETRIES = 5;
const RATE_LIMIT = 25;
const PINECONE_BATCH_SIZE = 100;

const ALLOWED_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".go",
  ".java",
  ".rb",
  ".rs",
  ".php",
  ".c",
  ".cpp",
  ".txt",
  ".html",
  ".css",
  ".json",
  ".md",
  ".mdx",
  ".yaml",
  ".yml",
  ".xml",
  ".sh",
  ".bash",
  ".zsh",
];

const languageMap: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  py: "python",
  go: "go",
  java: "java",
  rb: "ruby",
  rs: "rust",
  php: "php",
  c: "c",
  cpp: "cpp",
  html: "html",
  css: "css",
  json: "json",
  md: "markdown",
  mdx: "markdown",
  yaml: "yaml",
  yml: "yaml",
  xml: "xml",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  txt: "text",
  cs: "csharp",
  swift: "swift",
  kt: "kotlin",
};

const patterns: Record<string, RegExp[]> = {
  typescript: [
    /^(export\s+)?(async\s+)?function\s+/,
    /^(export\s+)?(default\s+)?class\s+/,
    /^interface\s+/,
    /^type\s+/,
    /^enum\s+/,
    /^(export\s+)?(const|let|var)\s+\w+\s*=\s*(async\s+)?\(/,
  ],

  javascript: [
    /^(export\s+)?(async\s+)?function\s+/,
    /^(export\s+)?(default\s+)?class\s+/,
    /^(const|let|var)\s+\w+\s*=\s*(async\s+)?\(/,
  ],

  python: [/^(async\s+)?def\s+/, /^class\s+/, /^@\w+/],

  go: [/^package\s+\w+/, /^func\s+\w+\(/, /^import\s+\(/],

  java: [
    /^package\s+[\w.]+;/,
    /^public\s+class\s+/,
    /^(public|private|protected)\s+(static\s+)?\w+\s+\w+\(/,
  ],

  ruby: [/^def\s+\w+/, /^class\s+\w+/, /^module\s+\w+/],

  rust: [/^fn\s+\w+\(/, /^struct\s+\w+/, /^impl\s+/],

  php: [/^<\?php/, /^class\s+\w+/, /^function\s+\w+\(/],

  c: [
    /^#include\s+</,
    /^\w+\s+\**\w+\s*\(/, // function signature
  ],

  cpp: [/^#include\s+</, /^template\s*</, /^\w+::\w+\(/],

  html: [/^<!DOCTYPE html>/i, /^<html/i, /^<\w+.*>/],

  css: [/^\.\w+/, /^#\w+/, /^\*\s*\{/, /^\w+\s*\{/],

  json: [/^\{\s*"/, /^\[\s*[\{"]/],

  markdown: [/^#\s+/, /^##\s+/, /^-\s+/, /^\*\s+/, /```[\w-]*/],

  yaml: [/^\w+:\s+/, /^-\s+\w+/],

  xml: [/^<\?xml/, /^<\w+.*>/],

  shell: [/^#!\/bin\/(bash|sh|zsh)/, /^\w+=["']?.+["']?$/, /^echo\s+/],

  text: [
    /^\s*$/, // match empty lines (paragraph boundaries)
  ],
  csharp: [/^using\s+[\w.]+;/, /^namespace\s+[\w.]+/, /^public\s+class\s+/],

  swift: [/^import\s+\w+/, /^class\s+\w+/, /^func\s+\w+\(/],

  kotlin: [/^package\s+[\w.]+/, /^class\s+\w+/, /^fun\s+\w+\(/],
};

export {
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
  MAX_FILES,
  filesREGEX,
  ALLOWED_EXTENSIONS,
  languageMap,
  patterns,
  BATCH_SIZE,
  MAX_RETRIES,
  RATE_LIMIT,
  PINECONE_BATCH_SIZE,
};
