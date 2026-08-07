'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setVerifying(false);
      else router.replace('/auth/forgot-password');
    });
  }, [router, supabase]);

  const onSubmit = async (values: ResetPasswordInput) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Password updated. Please sign in.');
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (verifying) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="space-y-3 text-center">
        <Link href="/" className="mx-auto flex items-center gap-2 text-lg font-bold lg:hidden">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Icetropez.Vest
        </Link>
        <div>
          <CardTitle className="text-2xl">Set a new password</CardTitle>
          <CardDescription>Choose a strong password for your account</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
