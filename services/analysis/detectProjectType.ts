import { ExtractedFile } from "../extract/extraction.types";

export async function detectProjectType(files: ExtractedFile[]) {
  const hasNextConfig = files.some((f) => f.filename.includes("next.config"));
  const hasAppDir = files.some((f) => f.filename.includes("app/"));

  return {
    framework: hasAppDir
      ? "Next.js App Router"
      : hasNextConfig
      ? "Next.js Pages"
      : "Unknown",
    language: files.some((f) => f.filename.endsWith(".tsx"))
      ? "TypeScript"
      : "JavaScript",
    hasAuth: files.some((f) => /auth|session|login/i.test(f.filename)),
  };
}
