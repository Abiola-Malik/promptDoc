'use server';

import { Client, Account, Databases, Storage } from 'node-appwrite';
import { appwriteConfig } from './config';
import { cookies } from 'next/headers';
const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.EndpointUrl)
    .setProject(appwriteConfig.ProjectId)
    .setKey(appwriteConfig.AppwriteKey);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
  };
};

const createSessionClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.EndpointUrl)
    .setProject(appwriteConfig.ProjectId);

  const cookieStore = await cookies();

  const session = cookieStore.get('session');

  if (session && session.value) {
    client.setSession(session.value);
  } else {
    throw new Error(' no session');
  }
  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
};

export { createAdminClient, createSessionClient };
