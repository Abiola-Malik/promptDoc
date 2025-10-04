'use server';

import { createAdminClient } from '../appwrite';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { OAuthProvider } from 'node-appwrite';

export async function signUpWithGithub() {
  const { account } = await createAdminClient();

  const headersList = await headers();
  const origin =
    headersList.get('origin') ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  const redirectUrl = await account.createOAuth2Token(
    OAuthProvider.Google,
    `${origin}/oauth`,
    `${origin}/signup`
  );

  return redirect(redirectUrl);
}
