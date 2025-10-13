'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';



export function SignUpFormClient({ handleSubmit, signUpWithGoogle }: SignUpFormClientProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
    const router = useRouter();
  const validateField = (name: string, value: string) => {
    let error = '';

    if (name === 'username') {
      if (!value || value.trim().length < 3) {
        error = 'Username must be at least 3 characters';
      } else if (value.trim().length > 20) {
        error = 'Username must not exceed 20 characters';
      }
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value || !emailRegex.test(value)) {
        error = 'Please enter a valid email address';
      }
    }

    if (name === 'password') {
      if (!value || value.length < 8) {
        error = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])/.test(value)) {
        error = 'Must contain lowercase letter';
      } else if (!/(?=.*[A-Z])/.test(value)) {
        error = 'Must contain uppercase letter';
      } else if (!/(?=.*\d)/.test(value)) {
        error = 'Must contain a number';
      }
    }

    return error;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Validate all fields
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    
    ['username', 'email', 'password'].forEach(field => {
      const value = formData.get(field) as string;
      newTouched[field] = true;
      const error = validateField(field, value);
      if (error) newErrors[field] = error;
    });

    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    startTransition(async () => {
      const result = await handleSubmit(formData);
      if(result?.success){
        router.push('/dashboard');
      }
      if (result?.errors) {
        setErrors(result.errors);
      }
    });
  };

  return (
    <>
      {errors.general && (
        <div className="p-3 rounded-lg bg-promptdoc-error/10 border border-promptdoc-error/20 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-promptdoc-error mt-0.5 flex-shrink-0" />
          <p className="text-sm text-promptdoc-error font-medium">{errors.general}</p>
        </div>
      )}

      <form action={signUpWithGoogle}>
        <Button
          type="submit"
          variant="outline"
          className="w-full h-11 border-border bg-promptdoc-primary hover:bg-promptdoc-primary-hover text-white"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-card-foreground">
            Username
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="johndoe"
            name="username"
            required
            disabled={isPending}
            onBlur={handleBlur}
            onChange={handleChange}
            className={`h-11 bg-background text-foreground placeholder:text-muted-foreground transition-colors ${
              errors.username && touched.username
                ? 'border-promptdoc-error focus-visible:ring-promptdoc-error'
                : 'border-border'
            }`}
          />
          {errors.username && touched.username && (
            <div className="flex items-center gap-1.5 text-promptdoc-error">
              <AlertCircle className="h-3.5 w-3.5" />
              <p className="text-xs">{errors.username}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            name="email"
            required
            disabled={isPending}
            onBlur={handleBlur}
            onChange={handleChange}
            className={`h-11 bg-background text-foreground placeholder:text-muted-foreground transition-colors ${
              errors.email && touched.email
                ? 'border-promptdoc-error focus-visible:ring-promptdoc-error'
                : 'border-border'
            }`}
          />
          {errors.email && touched.email && (
            <div className="flex items-center gap-1.5 text-promptdoc-error">
              <AlertCircle className="h-3.5 w-3.5" />
              <p className="text-xs">{errors.email}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-card-foreground">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a strong password"
            name="password"
            required
            disabled={isPending}
            onBlur={handleBlur}
            onChange={handleChange}
            className={`h-11 bg-background text-foreground placeholder:text-muted-foreground transition-colors ${
              errors.password && touched.password
                ? 'border-promptdoc-error focus-visible:ring-promptdoc-error'
                : 'border-border'
            }`}
          />
          {errors.password && touched.password && (
            <div className="flex items-center gap-1.5 text-promptdoc-error">
              <AlertCircle className="h-3.5 w-3.5" />
              <p className="text-xs">{errors.password}</p>
            </div>
          )}
          {!errors.password && (
            <p className="text-xs text-muted-foreground">
              8+ characters with uppercase, lowercase, and number
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </>
  );
}