import { NextResponse } from 'next/server';
import { createSessionClient } from '@/db/appwrite';
import { appwriteConfig } from '@/db/appwrite/config';
import { Query } from 'node-appwrite';
import { getSession } from '@/lib/helpers';

const { DatabaseId, usersCollectionId } = appwriteConfig;

export async function GET() {
  try {
    const sessionResult = await getSession()

    if (!sessionResult.success || !sessionResult.session) {
       return NextResponse.json({ error: 'No session' }, { status: 401 });
     }


 const { account, databases } = await createSessionClient(sessionResult.session);
    const authUser = await account.get();

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
  } catch (error: unknown) {
    if (error instanceof Error){
      console.error('[API] /api/auth/user error:', error.message);
    }else{
      console.error('[API] /api/auth/user unknown error:', error);
    }
    
    return NextResponse.json({ error: 'Invalid session' }, { status: 403 });
  }
}
