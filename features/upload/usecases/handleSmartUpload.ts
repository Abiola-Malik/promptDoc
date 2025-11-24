"use server";

import { generateContentHash } from "@/lib/hashing";
import { UploadResult } from "../models/uploadResult";
import { generateDocumentation } from "@/features/documentation/generateDocumentation";
import { index } from "@/db/pinecone";
import path from "path";
import { extractZipFile } from "@/services/extract/extractZIpFile";
import { chunkCode } from "@/services/chunk/chunkCode";
import { CodeChunk } from "@/services/chunk/chunk.types";
import { embedAndStoreCodeChunks } from "@/services/embed/embedAndStore";
import { getSession } from "@/lib/helpers";
import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import fs from "fs/promises";
import checkExistingProject from "@/features/projects/services/checkExistingProject";

const { DatabaseId, projectsCollectionId } = appwriteConfig;

export const handleSmartUpload = async (
  userId: string,
  zipFile: File,
  userQuery: string
): Promise<UploadResult> => {
  try {
    console.log(" Processing upload...");

    // Step 1: Generate content hash for deduplication
    const buffer = await zipFile.arrayBuffer();
    const contentHash = generateContentHash(Buffer.from(buffer));
    console.log(`🔍 Content hash: ${contentHash.slice(0, 16)}...`);

    // Step 2: Check if we've seen this exact code before
    const existingProjectId = await checkExistingProject(contentHash, userId);

    if (existingProjectId) {
      console.log(`✅ Found cached project: ${existingProjectId}`);

      // Skip extraction/embedding, just generate docs from existing data
      const documentation = await generateDocumentation(
        existingProjectId.$id,
        userQuery,
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
    // Extract ZIP
    const extractionResult = await extractZipFile(tempPath);

    if (!extractionResult.success || extractionResult.files.length === 0) {
      await fs.unlink(tempPath);
      return {
        success: false,
        projectId: "",
        error: extractionResult.error || "No valid code files found in ZIP",
      };
    }

    // Chunk code
    const chunkPromises = extractionResult.files.map((file) =>
      chunkCode(file.content, file.filename, {
        maxChunkSize: 1000,
        minChunkSize: 200,
        overlap: 100,
      })
    );

    const chunkResults = await Promise.all(chunkPromises);
    const chunks: CodeChunk[] = chunkResults.flat();

    console.log(` Created ${chunks.length} chunks`);
    function sanitizeId(id: string) {
      return id
        .replace(/[^a-zA-Z0-9._-]/g, "") // remove invalid chars
        .slice(0, 36) // truncate to 36 chars
        .replace(/^[._-]/, "a"); // ensure it doesn't start with special char
    }

    const rawProjectId = generateContentHash(
      Buffer.from(userId + Date.now().toString())
    );

    const projectId = sanitizeId(rawProjectId);

    // Embed and store in Pinecone
    const embedResult = await embedAndStoreCodeChunks(
      projectId,
      chunks,
      index,
      (current, total) => {
        console.log(` Embedding progress: ${current}/${total}`);
      }
    );

    if (!embedResult.success) {
      await fs.unlink(tempPath);
      return {
        success: false,
        projectId: "",
        error: `Embedding failed: ${embedResult.errors[0]?.error}`,
      };
    }

    // Save project metadata to database (with hash for future deduplication)
    const sessionResult = await getSession();
    if (!sessionResult.success) {
      throw new Error("No valid session");
    }
    const { databases } = await createSessionClient(sessionResult.session!);
    await databases.createDocument(
      DatabaseId,
      projectsCollectionId,
      projectId,
      {
        name: extractionResult.files[0]?.filename || "Untitled Project",
        userId,
        contentHash,
        // createdAt: new Date().toISOString(),
        filesCount: extractionResult.files.length,
        chuncksCount: chunks.length,
      }
    );

    console.log(` Saved project metadata: ${projectId}`);

    const documentation = await generateDocumentation(
      projectId,
      userQuery,
      index
    );

    // Cleanup temp file
    await fs.unlink(tempPath);

    return {
      success: true,
      projectId,
      documentation,
      cached: false,
      stats: {
        filesProcessed: extractionResult.files.length,
        chunksCreated: chunks.length,
        embeddingsStored: embedResult.successfulChunks,
      },
    };
  } catch (error) {
    console.error(" Upload handler error:", error);
    return {
      success: false,
      projectId: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
