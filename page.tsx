'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success('Reset link sent. Check your inbox.');
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="space-y-3 text-center">
        <Link href="/" className="mx-auto flex items-center gap-2 text-lg font-bold lg:hidden">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Icetropez.Vest
        </Link>
        <div>
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            {sent ? 'Check your inbox for a reset link.' : 'Enter your email to receive a reset link.'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              We sent a password reset link to your email. The link expires in a few hours.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send reset link
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered your password?{' '}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
