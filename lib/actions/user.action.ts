import { Query, ID } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '../../db/appwrite';
import { appwriteConfig } from '../../db/appwrite/config';
import { cookies } from 'next/headers';
import {  isProduction } from '../utils';
import { userProps } from '@/types/global';
import { getSession } from '../helpers';




const { DatabaseId, usersCollectionId } = appwriteConfig;

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const existingUser = await databases.listDocuments(
    DatabaseId,
    usersCollectionId,
    [Query.equal('email', email)]
  );
  if (existingUser.documents.length < 0) {
    throw new Error('User not found');
  }
  return existingUser;
};
const createNewUser = async ({ username, email, password }: userProps) => {
  const { databases, account } = await createAdminClient();
  const existingUser = await getUserByEmail(email);
  if (existingUser.documents.length > 0) {
    throw new Error('User already exists, login instead');
  }
  const user = await account.create(ID.unique(), email, password, username);
  const userProfileDocument = await databases.createDocument(
    DatabaseId,
    usersCollectionId,
    user.$id,
    {
      username,
      email,
    }
  );
  return {
    success: true,
    user: {
      username: userProfileDocument.username,
      email: userProfileDocument.email,
      userId: userProfileDocument.$id,
    },
    status: 201,
  };
};
const loginUser = async ({ email, password }: Omit<userProps, 'username'>) => {
  const existingUser = await getUserByEmail(email);
  if (existingUser.documents.length === 0) {
    return {
      success: false,
      status: 401,
      error: 'User not found',
    };
  }
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);
    (await cookies()).set('session', session.secret, {
      httpOnly: true,
      path: '/',
      secure: isProduction,
      expires: new Date(session.expire),
    });

    return {
      success: true,
      user: {
        username: existingUser.documents[0].username,
        email: existingUser.documents[0].email,
        userId: existingUser.documents[0].$id,
      },
    };
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error('[loginUser] Error:', error.message);
  } else {
    console.error('[loginUser] Unknown error:', error);
  }

  return {
    success: false,
    status: 401,
    error: 'Invalid credentials',
  }
}
};

const logOutUser = async () => {
  // const {session} = await getSession()
  try {
    const { account } = await createAdminClient();
    await account.deleteSession('current');
    cookieStore.delete('session');
    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[logOutUser] Error:', error.message);
    } else {
      console.error('[logOutUser] Unknown error:', error);
    }   
    return {
      success: false,
      status: 500,
      error: 'Failed to log out',
    };
  }
}
export const getUser = async (userId: string) => {
  const sessionResult = await getSession();
  if(!sessionResult.success){
    throw new Error('No valid session');
  }
  const {databases } = await createSessionClient(sessionResult.session!);

  const user = await databases.getDocument(
    DatabaseId,
    usersCollectionId,
    userId
  );
  return user;

}
export { createNewUser, getUserByEmail, loginUser, logOutUser };
