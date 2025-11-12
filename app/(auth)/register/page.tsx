import { createNewUser } from '@/lib/actions/user.action';
import { createAdminClient } from '@/db/appwrite';
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" 
import Link from 'next/link';
import { signUpWithGoogle } from '@/server/oauth';
import { SignUpFormClient } from '@/app/(auth)/components/auth/SignUpFormClient';
const page = async () => {
  async function handleSubmit(formdata: FormData) {
    'use server';

    const data = Object.fromEntries(formdata);
    const username = data.username as string;
    const email = data.email as string;
    const password = data.password as string;

    // Server-side validation (backup)
    const errors: Record<string, string> = {};

    if (!username || username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    } else if (username.trim().length > 20) {
      errors.username = 'Username must not exceed 20 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = 'Please provide a valid email address';
    }

    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least one number';
    }

    if (Object.keys(errors).length > 0) {
      return { errors, success: false };
    }

    try {
      const result = await createNewUser({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password,
      });

      if (result) {
        const { account } = await createAdminClient();

        const session = await account.createEmailPasswordSession(
          email.toLowerCase().trim(),
          password
        );
        
        const cookieStore = await cookies();
        cookieStore.set('session', session.secret, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
        return { success: true };
      } else {
        return { 
          errors: { general: 'Failed to create account. Please try again.' }, 
          success: false 
        };
      }
    } catch (error: unknown) {
      console.error('Signup error:', error);
      let errorMsg = 'An unexpected error occurred. Please try again.';
      
      if (error instanceof Error && error.message) {
        errorMsg = error.message;
      }
      
      return { errors: { general: errorMsg }, success: false };
    }  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight text-card-foreground">
            Create an account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your details below to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SignUpFormClient 
            handleSubmit={handleSubmit}
            signUpWithGoogle={signUpWithGoogle}
          />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default page;