"use server";

import { createAdminClient } from "../db/appwrite";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OAuthProvider } from "node-appwrite";

export async function signUpWithGoogle() {
  const { account } = await createAdminClient();

  const headersList = await headers();
  const origin =
    headersList.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const redirectUrl = await account.createOAuth2Token(
    OAuthProvider.Google,
    `${origin}/oauth`,
    `${origin}/signup`,
  );

  return redirect(redirectUrl);
}

export async function signInWithGoogle() {
  const { account } = await createAdminClient();
  const headersList = await headers();
  const origin =
    headersList.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  const redirectUrl = await account.createOAuth2Token(
    OAuthProvider.Google,
    `${origin}/oauth`,
    `${origin}/signin`,
  );
  return redirect(redirectUrl);
}

export async function signInWithGitHub() {
  const { account } = await createAdminClient();

  const headersList = await headers();
  const origin =
    headersList.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const redirectUrl = await account.createOAuth2Token(
    OAuthProvider.Github,
    `${origin}/oauth`,
    `${origin}/signin`,
    ["read:user", "user:email", "repo"], // GitHub scopes to access user info, email and repositories
  );

  return redirect(redirectUrl);
}
