'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

export function LandingNav() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Icetropez.Vest
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</Link>
          <Link href="/#plans" className="text-muted-foreground transition-colors hover:text-foreground">Plans</Link>
          <Link href="/#about" className="text-muted-foreground transition-colors hover:text-foreground">About</Link>
          <Link href="/#faq" className="text-muted-foreground transition-colors hover:text-foreground">FAQ</Link>
          <Link href="/#contact" className="text-muted-foreground transition-colors hover:text-foreground">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
