import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/helpers";

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL!;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const sessionResult = await getSession();
  if (!sessionResult.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;

  try {
    const res = await fetch(`${RAG_SERVICE_URL}/job/${jobId}`, {
      headers: { "x-internal-secret": INTERNAL_API_SECRET },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 },
    );
  }
}
