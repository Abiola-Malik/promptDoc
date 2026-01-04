// features/upload/usecases/handleSmartUpload.ts
import { generateContentHash } from "@/lib/hashing";
import { chunkCode } from "@/services/chunk/chunkCode";
import { embedAndStoreCodeChunks } from "@/services/embed/embedAndStore";
import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { ID, Databases } from "node-appwrite";
import { index } from "@/db/pinecone";
import path from "path";
import { tmpdir } from "os"; // ← Critical import
import { ALLOWED_EXTENSIONS } from "@/constants";
import checkExistingProject from "@/features/projects/services/checkExistingProject";
import { extractZipFile } from "@/services/extract/extractZIpFile";
import { getSession } from "@/lib/helpers";
import fs from "fs/promises";
import { generateProjectSummary } from "@/services/analysis/generateProjectSummary";
import { detectProjectType } from "@/services/analysis/detectProjectType";
import { getLoggedInUser } from "@/lib/actions/user.action";

const { DatabaseId, projectsCollectionId } = appwriteConfig;

interface SmartUploadResult {
  success: boolean;
  projectId: string;
  stats: {
    filesExtracted: number;
    filesFiltered: number;
    chunks: number;
  };
  cached?: boolean;
}

export async function handleSmartUpload(
  formData: FormData
): Promise<SmartUploadResult | { success: false; error: string }> {
  const file = formData.get("file") as File;
  const projectName =
    (formData.get("name") as string)?.trim() || "Untitled Project";
  const includeTests = formData.get("includeTests") === "true";
  const includeDotfiles = formData.get("includeDotfiles") === "true";

  if (!file || !file.name.endsWith(".zip")) {
    return { success: false, error: "Invalid file" };
  }

  const sessionResult = await getSession();
  if (!sessionResult || sessionResult.error)
    throw new Error(sessionResult.error);
  const session = await sessionResult.session!;

  const user = await getLoggedInUser();

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentHash = generateContentHash(buffer);

  // 1. Check cache
  const existing = await checkExistingProject(contentHash, user.$id);
  if (existing) {
    return {
      success: true,
      projectId: existing.$id,
      cached: true,
      stats: existing.stats,
    };
  }

  const tempDir = path.join(tmpdir(), "promptdoc-uploads");
  await fs.mkdir(tempDir, { recursive: true });

  // 2. Extract + Smart Filter
  const tempPath = path.join(
    tempDir,
    `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.zip`
  );

  // Declare variables for access in catch block
  let projectId: string | undefined;
  let databases: Databases | undefined;
  let extractionPath: string | undefined;
  try {
    await fs.writeFile(tempPath, buffer);

    const extracted = await extractZipFile(tempPath);
    extractionPath = extracted.extractionPath;
    if (!extracted.success) {
      return { success: false, error: "Failed to extract ZIP" };
    }

    // SMART FILTERING
    const relevantFiles = extracted.files.filter((f) => {
      const normalizedPath = path.normalize(f.filename).replace(/\\/g, "/");
      const lowerNormalized = normalizedPath.toLowerCase();
      const segments = lowerNormalized.split("/");
      const basename = path.basename(lowerNormalized);
      const ext = path.extname(lowerNormalized);

      // Always exclude directories
      if (
        segments.some(
          (seg) =>
            seg === "node_modules" ||
            seg === ".git" ||
            seg === "dist" ||
            seg === ".next" ||
            seg === "build" ||
            seg === "out" ||
            seg === "public"
        )
      )
        return false;

      // File-specific excludes
      if (
        ext === ".log" ||
        basename === "package-lock.json" ||
        basename === "yarn.lock"
      )
        return false;

      // Conditional
      if (
        !includeTests &&
        (segments.some((seg) => seg === "__tests__") ||
          basename.includes(".test.") ||
          basename.includes(".spec."))
      )
        return false;
      if (!includeDotfiles && basename.startsWith(".")) return false;

      // Only code/config files
      if (!ALLOWED_EXTENSIONS.some((e) => lowerNormalized.endsWith(e)))
        return false;

      return true;
    });

    console.log(
      `Filtered ${extracted.files.length} → ${relevantFiles.length} relevant files`
    );

    // 3. Chunk
    const chunks = (
      await Promise.all(
        relevantFiles.map((f) =>
          chunkCode(f.content, f.filename, { semantic: true })
        )
      )
    ).flat();

    // 4. Detect project type + generate summary
    const projectType = await detectProjectType(relevantFiles);
    const summary = await generateProjectSummary(relevantFiles, projectType);

    // 5. Create project in Appwrite
    const sessionClient = await createSessionClient(session);
    databases = sessionClient.databases;
    projectId = ID.unique();

    await databases.createDocument(
      DatabaseId,
      projectsCollectionId,
      projectId,
      {
        name: projectName,
        userId: user.$id,
        contentHash,
        filesCount: relevantFiles.length,
        hasTests: relevantFiles.some(
          (f) => f.filename.includes(".test.") || f.filename.includes(".spec.")
        ),
        chunksCount: chunks.length,
        projectSummary: summary,
        framework: projectType.framework,
        language: projectType.language,
      }
    );

    // 6. Embed + Store
    await embedAndStoreCodeChunks(projectId, chunks, index);

    // 7. Mark as ready
    await databases.updateDocument(
      DatabaseId,
      projectsCollectionId,
      projectId,
      {
        status: "ready",
      }
    );

    return {
      success: true,
      projectId,
      stats: {
        filesExtracted: extracted.files.length,
        filesFiltered: relevantFiles.length,
        chunks: chunks.length,
      },
    };
  } catch (error) {
    // Mark project as failed if it was created
    if (projectId && databases) {
      try {
        await databases.updateDocument(
          DatabaseId,
          projectsCollectionId,
          projectId,
          {
            status: "failed",
          }
        );
      } catch (updateError) {
        console.error(
          "Failed to update project status to failed:",
          updateError
        );
      }
    }

    console.error("Error in handleSmartUpload:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Upload processing failed",
    };
  } finally {
    // === ALWAYS CLEAN UP TEMP FILES ===
    try {
      await fs.unlink(tempPath).catch(() => {}); // Ignore if already gone
      if (extractionPath) {
        await fs
          .rm(extractionPath, { recursive: true, force: true })
          .catch(() => {});
      }
    } catch (cleanupError) {
      console.warn("Failed to clean up temp files:", cleanupError);
    }
  }
}
