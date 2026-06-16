import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionClient } from "@/db/appwrite";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { account } = await createSessionClient(session);
    const identities = await account.listIdentities();
    const github = identities.identities.find((i) => i.provider === "github");

    if (!github?.providerAccessToken) {
      return NextResponse.json({ error: "No GitHub token" }, { status: 400 });
    }

    return NextResponse.json({ token: github.providerAccessToken });
  } catch (error) {
    console.error("Failed to fetch GitHub token:", error);
    return NextResponse.json(
      { error: "Failed to retrieve token" },
      { status: 500 },
    );
  }
}
