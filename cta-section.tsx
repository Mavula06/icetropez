'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-primary to-chart-2 px-6 py-16 text-center text-white sm:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to grow your wealth?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/80">
            Join thousands of investors earning transparent, steady returns. Start from just R80.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="group">
              <Link href="/auth/register">
                Create your free account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
