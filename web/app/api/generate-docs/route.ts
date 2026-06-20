import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/helpers";

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL!;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET!;

export const runtime = "nodejs";
export const maxDuration = 30; // this request itself is now fast — just enqueues

export async function POST(request: NextRequest) {
  const sessionResult = await getSession();
  if (!sessionResult.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { query?: string; projectId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { query, projectId } = body;
  if (!query?.trim() || !projectId) {
    return NextResponse.json(
      { error: "query and projectId required" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${RAG_SERVICE_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_API_SECRET,
      },
      body: JSON.stringify({ query, project_id: projectId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.detail || "Failed to start generation" },
        { status: 500 },
      );
    }

    const data = await res.json();
    return NextResponse.json({ jobId: data.job_id, status: data.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach generation service" },
      { status: 500 },
    );
  }
}
