import { loginUser } from '@/lib/actions/user.action';


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" 
import Link from 'next/link';
import { signUpWithGoogle } from '@/server/oauth';
import { SignInFormClient } from '@/app/(auth)/components/auth/SignInFormClient';
const page = async () => {
  async function handleSubmit(formdata: FormData) {
    'use server';
    const formData = Object.fromEntries(formdata);
    const email = formData.email as string;
    const password = formData.password as string;    
    const errors: Record<string, string> = {};

  

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
      const result = await loginUser({
      email,
      password,
    });
    
    if (result.success) {
       return { success: true };
    } else {
      return { errors: { general: 'Invalid credentials' }, success: false };
    }
    } catch (error: unknown) {
      if(error instanceof Error){
        console.error('login error message:', error.message);
      }
      
      const errorMsg = 'Invalid credentials';
      
      // Handle specific Appwrite errors
    

      return { errors: { general: errorMsg }, success: false };
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight text-card-foreground">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email and password to continue
          </CardDescription>        </CardHeader>
        <CardContent className="space-y-6">
          <SignInFormClient 
            handleSubmit={handleSubmit}
            signUpWithGoogle={signUpWithGoogle}
          />

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?
            <Link href="/register" className="font-medium text-foreground hover:underline">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default page;