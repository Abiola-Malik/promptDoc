import { loginUser } from '@/lib/actions/user.action';

const page = async () => {
  const handleSubmit = async (formdata: FormData) => {
    'use server';
    const formdate = Object.fromEntries(formdata);
    const email = formdate.email as string;
    const password = formdate.password as string;
    const result = await loginUser({
      email,
      password,
    });
    console.log(result);
  };
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <form
        action={handleSubmit}
        className='bg-white p-8 rounded-lg shadow-md w-96'
      >
        <h2 className='text-2xl font-bold mb-6 text-center'>Register</h2>

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
