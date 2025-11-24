"use server";
import fs from "fs/promises";
/**
 * Cleans up temporary directory
 */
export async function cleanupTempDir(
  tempDir: string
): Promise<{ success: boolean; error?: string }> {
  // Validate tempDir is not empty and looks like a temp directory
  if (!tempDir || tempDir.trim() === "") {
    throw new Error("tempDir parameter is required");
  }
  if (!tempDir.includes("temp") && !tempDir.includes("tmp")) {
    throw new Error(
      `Warning: Attempting to delete directory that doesn't appear to be temporary: ${tempDir}`
    );
  }

  try {
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log(` Cleaned up temp directory: ${tempDir}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to cleanup temp directory: ${error}`);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to cleanup temp directory: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}
