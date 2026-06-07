import { MAX_FILES } from "@/constants";
import path from "path";
import fs from "fs/promises";

/**
 * Recursively reads all files from a directory.
 */
export async function getAllFiles(
  dir: string,
  maxFiles: number = MAX_FILES
): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string) {
    if (files.length >= maxFiles) return;

    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (files.length >= maxFiles) break;

      const fullPath = path.join(currentDir, entry.name);

      // Skip common directories to ignore
      if (entry.isDirectory()) {
        const dirName = entry.name.toLowerCase();
        if (
          !["node_modules", ".git", "dist", "build", ".next"].includes(dirName)
        ) {
          await walk(fullPath);
        }
      } else if (entry.isSymbolicLink()) {
        // Skip symlinks to avoid infinite loops
        continue;
      } else {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}