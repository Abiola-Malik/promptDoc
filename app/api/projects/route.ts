import { getUserProjects } from "@/features/projects/services/getUserProjects";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const projects = await getUserProjects();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}
