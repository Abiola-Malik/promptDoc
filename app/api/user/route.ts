// app/api/auth/current-user/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwrite/config';
import { Query } from 'node-appwrite';

const { DatabaseId, usersCollectionId } = appwriteConfig;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    if (!session) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const { account, databases } = await createSessionClient(session);

    // Get Appwrite Auth user
    const authUser = await account.get();

    console.log('authUser', authUser);
    // Now get the user's profile from your database
    const dbUserList = await databases.listDocuments(
      DatabaseId,
      usersCollectionId,
      [Query.equal('email', authUser.email)]
    );

    const dbUser = dbUserList.documents[0];

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        email: dbUser.email,
        username: dbUser.username,
        userId: dbUser.$id,
      },
    });
  } catch (err: any) {
    console.error('[API] /api/auth/user error:', err.message);
    return NextResponse.json({ error: 'Invalid session' }, { status: 403 });
  }
}
