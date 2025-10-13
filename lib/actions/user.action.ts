import { Query, ID } from 'node-appwrite';
import { createAdminClient } from '../appwrite';
import { appwriteConfig } from '../appwrite/config';
import { cookies } from 'next/headers';
import { isProduction } from '../utils';



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
export { createNewUser, getUserByEmail, loginUser };
