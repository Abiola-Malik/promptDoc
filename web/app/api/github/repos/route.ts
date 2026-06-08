import { createSessionClient } from "@/db/appwrite";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionSecret = cookieStore.get("session")?.value;
    if (!sessionSecret)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { account } = await createSessionClient(sessionSecret);

    // get OAuth identities — includes providerAccessToken
    const identities = await account.listIdentities();
    const githubIdentity = identities.identities.find(
      (i) => i.provider === "github",
    );

    if (!githubIdentity?.providerAccessToken) {
      return NextResponse.json(
        { error: "No GitHub identity found — re-login with GitHub" },
        { status: 400 },
      );
    }

    const token = githubIdentity.providerAccessToken;
    const res = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=50&type=owner",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `GitHub repos fetch failed: ${res.status} ${res.statusText}`;
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
      return NextResponse.json({ error: errorMessage }, { status: res.status });
    }

    const repos = await res.json();
    return NextResponse.json({ repos });
  } catch (error) {
    console.error("GitHub repos error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repos" },
      { status: 500 },
    );
  }
}
