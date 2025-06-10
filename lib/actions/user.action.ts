import { Query } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '../appwrite';
import { appwriteConfig } from '../appwrite/config';

interface userProps {
  username: string;
  email: string;
  password: string;
}

const { AppwriteKey, EndpointUrl, ProjectId, DatabaseId, UsersCollectionId } =
  appwriteConfig;

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const existingUser = databases.listDocuments(DatabaseId, UsersCollectionId, [
    Query.equal('email', email),
  ]);
  if (!existingUser) {
    throw new Error('User not found');
  }
  return existingUser;
};
const createNewUser = async ({ username, email, password }: userProps) => {
  const { databases } = await createAdminClient();
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists, login instead');
  }
  const user = await databases.createDocument(
    DatabaseId,
    UsersCollectionId,
    'unique()',
    {
      username,
      email,
      password,
    }
  );
  return JSON.stringify(user);
};

export { createNewUser, getUserByEmail };
