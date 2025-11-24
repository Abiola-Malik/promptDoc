import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { handleSmartUpload } from "@/features/upload/usecases/handleSmartUpload";
import { getSession } from "@/lib/helpers";
import { getLoggedInUser } from "@/lib/actions/user.action";

// Configure Next.js to handle large files
export const config = {
  api: {
    bodyParser: false, // Disable default body parser
  },
};

// Increase body size limit (100MB)
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for large uploads

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    // 1. Verify session
    const sessionResult = await getSession();
    if (!sessionResult.success || !sessionResult.session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = await getLoggedInUser();

    // 2. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userQuery = formData.get("query") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!userQuery) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    // 3. Validate file type
    if (!file.name.endsWith(".zip")) {
      return NextResponse.json(
        { success: false, error: "Only ZIP files are allowed" },
        { status: 400 }
      );
    }

    // 4. Validate file size (100MB limit)
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    console.log(
      `📦 Received upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(
        2
      )}MB)`
    );

    // 5. Save file temporarily (streaming to avoid memory issues)
    const tempDir = path.join(process.cwd(), "temp");
    await mkdir(tempDir, { recursive: true });

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    tempFilePath = path.join(
      tempDir,
      `upload-${timestamp}-${randomSuffix}.zip`
    );

    // Stream file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempFilePath, buffer);

    console.log(`💾 Saved to: ${tempFilePath}`);

    // 6. Convert temp file to File object for handleSmartUpload
    // Create a new File from the saved buffer
    const uploadFile = new File([buffer], file.name, { type: file.type });

    // 7. Process upload with smart handler
    const result = await handleSmartUpload(userId, uploadFile, userQuery);

    // 8. Cleanup temp file
    if (tempFilePath) {
      await unlink(tempFilePath).catch((err) =>
        console.error("Failed to delete temp file:", err)
      );
    }

    // 9. Return result
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Upload API error:", error);

    // Cleanup on error
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {});
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
