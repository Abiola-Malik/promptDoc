import { generateContentHash } from "@/lib/hashing";
import { chunkCode } from "@/services/chunk/chunkCode";
import { embedAndStoreCodeChunks } from "@/services/embed/embedAndStore";
import { createSessionClient } from "@/db/appwrite";
import { appwriteConfig } from "@/db/appwrite/config";
import { ID } from "node-appwrite";
import { index } from "@/db/pinecone";
import path from "path";
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

  const tempDir = path.join(process.cwd(), "temp");
  await fs.mkdir(tempDir, { recursive: true });

  // 2. Extract + Smart Filter
  const tempPath = path.join(tempDir, `upload-${Date.now()}.zip`);
  await fs.writeFile(tempPath, buffer);

  const extracted = await extractZipFile(tempPath);
  if (!extracted.success) {
    return { success: false, error: "Failed to extract ZIP" };
  }

  // SMART FILTERING
  const relevantFiles = extracted.files.filter((f) => {
    const lower = f.filename.toLowerCase();
    const ext = path.extname(lower);

    // Always exclude
    if (lower.includes("node_modules")) return false;
    if (lower.includes(".git")) return false;
    if (
      lower.includes("dist") ||
      lower.includes(".next") ||
      lower.includes("build")
    )
      return false;
    if (
      lower.endsWith(".log") ||
      lower.includes("package-lock") ||
      lower.includes("yarn.lock")
    )
      return false;

    // Conditional
    if (
      !includeTests &&
      (lower.includes("__tests__") ||
        lower.includes(".test.") ||
        lower.includes(".spec."))
    )
      return false;
    if (!includeDotfiles && path.basename(lower).startsWith(".")) return false;

    // Only code/config files

    if (!ALLOWED_EXTENSIONS.some((e) => lower.endsWith(e))) return false;

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

  const { databases } = await createSessionClient(session);
  const projectId = ID.unique();

  await databases.createDocument(DatabaseId, projectsCollectionId, projectId, {
    name: projectName,
    userId: user.$id,
    contentHash,
    filesCount: relevantFiles.length,
    status: "processing",
    chunksCount: chunks.length,
    projectSummary: summary, // ← NEW
    framework: projectType.framework, // e.g., "Next.js App Router"
    language: projectType.language,
    hasTests: relevantFiles.some((f) => f.filename.includes(".test.")),
  });

  // 6. Embed + Store
  await embedAndStoreCodeChunks(projectId, chunks, index);

  // 7. Cleanup
  await fs.unlink(tempPath);

  return {
    success: true,
    projectId,
    stats: {
      filesExtracted: extracted.files.length,
      filesFiltered: relevantFiles.length,
      chunks: chunks.length,
    },
  };
}
