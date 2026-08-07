'use client';

import { BarChart3, Clock, Lock, RefreshCw, ShieldCheck, TrendingUp } from 'lucide-react';

const FEATURES = [
  {
    icon: TrendingUp,
    title: 'Transparent returns',
    description:
      'See your earnings calculated in real time based on the plan you choose — no hidden formulas, no surprises.',
  },
  {
    icon: Clock,
    title: 'Flexible durations',
    description:
      'Pick a plan that fits your goals, from 30-day starter plans to 90-day premium commitments.',
  },
  {
    icon: RefreshCw,
    title: 'Daily or maturity payouts',
    description:
      'Choose daily earnings credited to your wallet, or a single payout when your plan matures.',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-grade security',
    description:
      'Your account is protected with JWT authentication and encrypted password hashing.',
  },
  {
    icon: BarChart3,
    title: 'Real-time dashboard',
    description:
      'Track your wallet balance, active investments, and transaction history in one place.',
  },
  {
    icon: Lock,
    title: 'Withdraw anytime',
    description:
      'Request withdrawals to your bank account with a simple approval flow and full history.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-y bg-muted/30">
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Features</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to grow your wealth
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete investment toolkit built for clarity, control, and confidence.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
