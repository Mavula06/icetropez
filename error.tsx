'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertOctagon className="h-10 w-10 text-destructive" />
      </div>
      <div>
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">An unexpected error occurred. Please try again.</p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}><RotateCcw className="mr-2 h-4 w-4" /> Try again</Button>
        <Button variant="outline" asChild><Link href="/"><Home className="mr-2 h-4 w-4" /> Home</Link></Button>
      </div>
    </div>
  );
}
