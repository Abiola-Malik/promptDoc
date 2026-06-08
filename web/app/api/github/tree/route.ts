import { createSessionClient } from "@/db/appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".go",
  ".java",
  ".rs",
  ".cpp",
  ".c",
  ".cs",
  ".rb",
  ".php",
  ".swift",
  ".kt",
  ".md",
  ".json",
  ".yaml",
  ".yml",
  ".env.example",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const repo = searchParams.get("repo"); // e.g. "Abiola-Malik/promptdoc"
    const branch = searchParams.get("branch") ?? "main";

    if (!repo)
      return NextResponse.json(
        { error: "repo param required" },
        { status: 400 },
      );

    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { account } = await createSessionClient(session);
    const identities = await account.listIdentities();
    const githubIdentity = identities.identities.find(
      (i) => i.provider === "github",
    );
    if (!githubIdentity?.providerAccessToken) {
      return NextResponse.json({ error: "No GitHub token" }, { status: 400 });
    }

    const token = githubIdentity.providerAccessToken;

    // get default branch sha
    const branchRes = await fetch(
      `https://api.github.com/repos/${repo}/branches/${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!branchRes.ok) {
      const errorData = await branchRes.json().catch(() => ({}));
      console.error("GitHub branch API error:", branchRes.status, errorData);
      return NextResponse.json(
        {
          error:
            branchRes.status === 404
              ? "Branch not found"
              : "Failed to fetch branch",
        },
        { status: branchRes.status === 404 ? 404 : 502 },
      );
    }

    const branchData = await branchRes.json();
    const sha = branchData.commit?.sha;
    if (!sha)
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });

    // get full recursive tree
    const treeRes = await fetch(
      `https://api.github.com/repos/${repo}/git/trees/${sha}?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!treeRes.ok) {
      const errorText = await treeRes.text();
      let errorMessage = `GitHub tree fetch failed: ${treeRes.status} ${treeRes.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson?.message) {
          errorMessage += ` - ${errorJson.message}`;
        }
      } catch {
        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
      }
      console.error(errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: treeRes.status },
      );
    }

    const treeData = await treeRes.json();

    // filter to supported code files only
    const filtered = treeData.tree.filter(
      (item: any) =>
        item.type === "blob" &&
        SUPPORTED_EXTENSIONS.some((ext) => item.path.endsWith(ext)),
    );

    return NextResponse.json({
      tree: filtered,
      sha,
      truncated: treeData.truncated,
    });
  } catch (error) {
    console.error("GitHub tree error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tree" },
      { status: 500 },
    );
  }
}
