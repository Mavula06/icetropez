'use client';

import { Award, Target, Users } from 'lucide-react';

const STATS = [
  { value: 'R 12M+', label: 'Total invested' },
  { value: '3,400+', label: 'Active investors' },
  { value: 'R 2.1M+', label: 'Earnings paid out' },
  { value: '99.9%', label: 'Uptime' },
];

export function AboutSection() {
  return (
    <section id="about" className="border-y bg-muted/30">
      <div className="container mx-auto px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">About us</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for investors who value transparency
            </h2>
            <p className="text-muted-foreground">
              Icetropez.Vest was founded on a simple principle: investing should be
              clear, accessible, and fair. We remove the jargon and the guesswork,
              giving you a platform where every return is calculated from rules you
              can see and every rand is accounted for.
            </p>
            <p className="text-muted-foreground">
              From your first R80 deposit to your largest maturity payout, our team
              manages the process end-to-end with bank-grade security and a human
              review on every transaction.
            </p>
            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              {[
                { icon: Target, title: 'Our mission', desc: 'Make investing accessible to everyone.' },
                { icon: Award, title: 'Our promise', desc: 'Transparent terms, no hidden fees.' },
                { icon: Users, title: 'Our community', desc: 'Thousands of investors growing together.' },
              ].map((v) => (
                <div key={v.title} className="rounded-xl border bg-card p-4">
                  <v.icon className="h-5 w-5 text-primary" />
                  <p className="mt-2 text-sm font-semibold">{v.title}</p>
                  <p className="text-xs text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border bg-card p-6 text-center transition-all hover:shadow-md"
              >
                <p className="text-3xl font-bold text-primary sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
