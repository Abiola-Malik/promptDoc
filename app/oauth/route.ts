import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query } from "node-appwrite";

const { DatabaseId, usersCollectionId } = appwriteConfig;

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");

  if (!userId || !secret) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/signup?error=missing_params`
    );
  }

  try {
    // Create a temporary admin client to verify user session
    const { account } = await createAdminClient();

    // Create a new session using OAuth credentials
    const session = await account.createSession(userId, secret);

    // Now use the session to create a user-level client
    const { account: sessionAccount, databases } = await createSessionClient(session.secret);

    // Get the authenticated user's info
    const user = await sessionAccount.get();

    // Check if user already exists in custom users collection
    const existingUser = await databases.listDocuments(
      DatabaseId,
      usersCollectionId,
      [Query.equal("email", user.email)] // match schema field
    );

    if (existingUser.total === 0) {
      // Create a new user document
      await databases.createDocument(DatabaseId, usersCollectionId, user.$id, {
        username: user.name,
        email: user.email,
      });
    }

    //  Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("session", session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/signup?error=auth_failed`
    );
  }
}
