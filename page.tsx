'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@/lib/validation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { referral_code: searchParams.get('ref') ?? '' },
  });

  const onSubmit = async (values: RegisterInput) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.full_name, phone: values.phone ?? '' },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Registration failed');
      const userId = data.user.id;

      // Profile + wallet are auto-created by database triggers on auth.users insert.
      if (values.referral_code) {
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', values.referral_code.toUpperCase())
          .maybeSingle();
        if (referrer) {
          await supabase
            .from('profiles')
            .update({ referred_by: referrer.id })
            .eq('id', userId);
        }
      }

      toast.success('Account created. Welcome to Icetropez.Vest!');
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="space-y-3 text-center">
        <Link href="/" className="mx-auto flex items-center gap-2 text-lg font-bold lg:hidden">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Icetropez.Vest
        </Link>
        <div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Start investing in minutes</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" placeholder="Jane Doe" {...register('full_name')} />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" placeholder="+27 71 234 5678" {...register('phone')} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="referral_code">Referral code (optional)</Label>
            <Input id="referral_code" placeholder="ABCD12" {...register('referral_code')} />
            {errors.referral_code && (
              <p className="text-sm text-destructive">{errors.referral_code.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
