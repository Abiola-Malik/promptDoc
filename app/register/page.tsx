import { createNewUser } from '@/lib/actions/user.action';
import { createAdminClient } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwrite/config';
import { cookies } from 'next/headers';

const page = async () => {
  async function handleSubmit(formdata: FormData) {
    'use server';

    const data = Object.fromEntries(formdata);
    const username = data.username as string;
    const email = data.email as string;
    const password = data.password as string;

    try {
      const result = await createNewUser({
        username,
        email,
        password,
      });
      if (result) {
        const { account } = await createAdminClient();

        const session = await account.createEmailPasswordSession(
          email,
          password
        );
        const cookieStore = await cookies();
        cookieStore.set('session', session.secret);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <form
        action={handleSubmit}
        className='bg-white p-8 rounded-lg shadow-md w-96'
      >
        <h2 className='text-2xl font-bold mb-6 text-center'>Register</h2>
        <div className='mb-4'>
          <label
            htmlFor='username'
            className='block text-gray-700 text-sm font-bold mb-2'
          >
            Username
          </label>
          <input
            type='text'
            id='username'
            name='username'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
            placeholder='Enter your username'
          />
        </div>
        <div className='mb-4'>
          <label
            htmlFor='email'
            className='block text-gray-700 text-sm font-bold mb-2'
          >
            Email
          </label>
          <input
            type='email'
            name='email'
            id='email'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
            placeholder='Enter your email'
          />
        </div>
        <div className='mb-6'>
          <label
            htmlFor='password'
            className='block text-gray-700 text-sm font-bold mb-2'
          >
            Password
          </label>
          <input
            type='password'
            id='password'
            name='password'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
            placeholder='Enter your password'
          />
        </div>
        <button
          type='submit'
          className='w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors'
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default page;
