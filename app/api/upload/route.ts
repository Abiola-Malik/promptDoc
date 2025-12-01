import { NextRequest, NextResponse } from "next/server";
import { handleSmartUpload } from "@/features/upload/usecases/handleSmartUpload";
import { getSession } from "@/lib/helpers";
import { getLoggedInUser } from "@/lib/actions/user.action";

// Disable Next.js default parser for large ZIP uploads
export const config = {
  api: { bodyParser: false },
};

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for large ZIPs

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const sessionResult = await getSession();
    if (!sessionResult.success || !sessionResult.session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await getLoggedInUser();

    if (!user || !user.$id) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 401 }
      );
    }
    // 2. Parse form-data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // 3. Validate ZIP
    if (!file.name.endsWith(".zip")) {
      return NextResponse.json(
        { success: false, error: "Only ZIP files are allowed" },
        { status: 400 }
      );
    }

    // 4. Validate size (100MB)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Max size is ${MAX_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    console.log(
      `Upload received: ${file.name} (${(file.size / 1024 / 1024).toFixed(
        2
      )}MB)`
    );

    // 5. Inject userId into formData
    formData.set("userId", user.$id);

    const result = await handleSmartUpload(formData);

    if (result.success) return NextResponse.json(result, { status: 200 });

    return NextResponse.json(result, { status: 500 });
  } catch (error) {
    console.error(" Upload API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
