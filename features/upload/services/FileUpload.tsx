import { generateDocumentation } from "@/features/documentation/generateDocumentation";
import checkExistingProject from "@/features/projects/services/checkExistingProject";
import { generateContentHash } from "@/lib/hashing";
import { Index } from "@pinecone-database/pinecone";
import path from "path";
import fs from "fs/promises";

export const fileUpload = async (
  zipFile: File,
  userQuery: string,
  index: Index,
  userId: string
) => {
  const buffer = await zipFile.arrayBuffer();
  const contentHash = generateContentHash(Buffer.from(buffer));
  console.log(`Content hash: ${contentHash.slice(0, 16)}...`);

  // Step 2: Check if we've seen this exact code before
  const existingProjectId = await checkExistingProject(contentHash, userId);

  if (existingProjectId) {
    console.log(`Found cached project: ${existingProjectId}`);

    // Skip extraction/embedding, just generate docs from existing data
    const documentation = await generateDocumentation(
      existingProjectId.$id,
      userQuery,
      "generate documentation",
      index
    );

    return {
      success: true,
      projectId: existingProjectId.$id,
      documentation,
      cached: true,
    };
  }

  // Step 3: New content - process everything
  console.log("New content detected, processing...");

  // Save file temporarily
  const tempPath = path.join(
    process.cwd(),
    "temp",
    `upload-${Date.now()}-${zipFile.name}`
  );
  await fs.mkdir(path.dirname(tempPath), { recursive: true });
  await fs.writeFile(tempPath, Buffer.from(buffer));
  return { tempPath, contentHash };
};
