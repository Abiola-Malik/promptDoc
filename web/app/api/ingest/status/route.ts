import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/helpers";

const EMBED_SERVICE_URL = process.env.EMBED_SERVICE_URL!;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET!;

export async function GET(request: NextRequest) {
  const sessionResult = await getSession();
  if (!sessionResult.success || !sessionResult.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobId = request.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${EMBED_SERVICE_URL}/job/${jobId}`, {
      headers: { "x-internal-secret": INTERNAL_API_SECRET },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const status = await res.json();
    return NextResponse.json(status);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch job status" },
      { status: 500 },
    );
  }
}
