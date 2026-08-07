'use client';

import Link from 'next/link';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <AlertTriangle className="h-10 w-10 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <Button asChild>
        <Link href="/"><Home className="mr-2 h-4 w-4" /> Back home</Link>
      </Button>
    </div>
  );
}
