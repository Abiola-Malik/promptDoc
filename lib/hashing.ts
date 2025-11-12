import crypto from "crypto";
export function generateContentHash(buffer: Buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}



