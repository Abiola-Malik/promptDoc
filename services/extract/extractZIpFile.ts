import path from "path";
import { ExtractionResult, ExtractedFile} from "./extraction.types";
import AdmZip from "adm-zip";
import fs from "fs/promises";
import { ALLOWED_EXTENSIONS, filesREGEX, MAX_FILE_SIZE, MAX_FILES, MAX_TOTAL_SIZE } from "@/constants";
import { getAllFiles } from "./getAllFiles";
import { validateZipEntry } from "./validateZipEntry";
import { cleanupTempDir } from "../temp/cleanTempDir";


export const extractZipFile = async (
  filepath: string
): Promise<ExtractionResult> => {
  const tempDir = path.join(process.cwd(), "temp", `extract-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
  try {
    // 1. Validate file exists
    const absolutePath = path.resolve(process.cwd(), filepath);
    await fs.access(absolutePath);

    // 2. Load ZIP
    const zip = new AdmZip(absolutePath);
    const zipEntries = zip.getEntries();

    // 3. Validate ZIP size
    const totalUncompressedSize = zipEntries.reduce<number>(
      (sum: number, entry: AdmZip.IZipEntry): number => {
        const size = entry.header?.size ?? 0;
        return sum + size;
      },
      0
    );

    if (totalUncompressedSize > MAX_TOTAL_SIZE) {
      return {
        success: false,
        files: [],
        stats: { totalFiles: 0, totalSize: 0, skipped: 0 },
        error: `ZIP too large: ${(totalUncompressedSize / 1024 / 1024).toFixed(
          2
        )}MB (max ${MAX_TOTAL_SIZE / 1024 / 1024}MB)`,
      };
    }

    // 4. Create temp directory
    await fs.mkdir(tempDir, { recursive: true });

    // 5. Validate and extract entries
    let skippedCount = 0;
    for (const entry of zipEntries) {
      if (!validateZipEntry(entry)) {
        skippedCount++;
        continue;
      }

      // Extract individual entry (safer than extractAllTo)
      zip.extractEntryTo(entry, tempDir, true, true);
    }

    const allFiles = await getAllFiles(tempDir, MAX_FILES);

    const codeFiles = allFiles.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return filesREGEX.test(f) && ALLOWED_EXTENSIONS.has(ext);
    });

    if (codeFiles.length === 0) {
      return {
        success: false,
        files: [],
        stats: {
          totalFiles: allFiles.length,
          totalSize: 0,
          skipped: skippedCount,
        },
        error: "No supported code files found in ZIP",
      };
    }

    // 8. Read file contents with size check
    const filesWithContent: ExtractedFile[] = [];
    let totalSize = 0;

    for (const f of codeFiles) {
      try {
        const stats = await fs.stat(f);

        // Skip files that are too large
        if (stats.size > MAX_FILE_SIZE) {
          console.warn(
            `Skipping large file: ${path.basename(f)} (${stats.size} bytes)`
          );
          skippedCount++;
          continue;
        }

        const content = await fs.readFile(f, "utf-8");
        totalSize += stats.size;

        filesWithContent.push({
          path: path.relative(tempDir, f).replace(/\\/g, "/"), // Normalize paths
          content,
          filename: path.basename(f),
          extension: path.extname(f),
          size: stats.size,
        });
      } catch (error) {
        console.warn(` Failed to read file: ${path.basename(f)}`);
        skippedCount++;
        console.error(error);
      }
    }

    console.log(
      ` Extracted ${filesWithContent.length} files (${(
        totalSize / 1024
      ).toFixed(2)}KB)`
    );

    return {
      success: true,
      files: filesWithContent,
      stats: {
        totalFiles: filesWithContent.length,
        totalSize,
        skipped: skippedCount,
      },
    };
  } catch (error) {
    console.error(" Error extracting ZIP file:", error);

    // Return safe error message (don't expose file paths)
    return {
      success: false,
      files: [],
      stats: { totalFiles: 0, totalSize: 0, skipped: 0 },
      error:
        error instanceof Error ? "Failed to extract ZIP file" : "Unknown error",
    };
  } finally {
    await cleanupTempDir(tempDir);
  }
};