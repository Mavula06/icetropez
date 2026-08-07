'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-chart-2/10 blur-3xl animate-float [animation-delay:2s]" />

      <div className="container relative mx-auto grid gap-12 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <div className="animate-fade-in-up space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />
            Trusted investment platform
          </div>
          <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Smart investing for{' '}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              steady growth
            </span>
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            Grow your wealth with managed investment plans that offer transparent
            daily and maturity-based earnings. Start from as little as R80.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group">
              <Link href="/auth/register">
                Start investing
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#plans">View plans</Link>
            </Button>
          </div>
          <div className="flex items-center gap-8 pt-4">
            {[
              { icon: Wallet, label: 'R80 min deposit' },
              { icon: TrendingUp, label: 'Up to 32% returns' },
              { icon: ShieldCheck, label: 'Bank-grade security' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <s.icon className="h-4 w-4 text-primary" />
                {s.label}
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-in relative [animation-delay:200ms]">
          <div className="relative mx-auto max-w-md">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary/30 to-chart-2/20 blur-2xl" />
            <div className="relative rounded-3xl border bg-card/80 p-6 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Portfolio value</p>
                <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                  +18.4%
                </span>
              </div>
              <p className="mt-1 text-3xl font-bold">R 48,250.00</p>
              <div className="mt-6 space-y-3">
                {[
                  { label: 'Growth Plan', value: 'R 30,000', pct: 62 },
                  { label: 'Premium Plan', value: 'R 18,250', pct: 38 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{row.label}</span>
                      <span className="text-muted-foreground">{row.value}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[
                  { k: 'Active', v: '2' },
                  { k: 'Earned', v: 'R 7,420' },
                  { k: 'Referrals', v: '5' },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl bg-muted/50 p-3">
                    <p className="text-lg font-bold">{s.v}</p>
                    <p className="text-xs text-muted-foreground">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
