import { MAX_FILE_SIZE } from "@/constants";
import path from "path";
import AdmZip from "adm-zip";
/**
 * Validates ZIP file before extraction
 */
export function validateZipEntry(entry: AdmZip.IZipEntry): boolean {
  const entryName = entry.entryName;

  // Check for path traversal (Zip Slip vulnerability)
  if (entryName.includes("..") || path.isAbsolute(entryName)) {
    console.warn(` Suspicious entry detected: ${entryName}`);
    return false;
  }

  // Check file size (Zip Bomb protection)
  if (entry.header.size > MAX_FILE_SIZE) {
    console.warn(`File too large: ${entryName} (${entry.header.size} bytes)`);
    return false;
  }

  return true;
}
