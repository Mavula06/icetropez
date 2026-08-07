'use client';

import { CheckCircle2 } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    description: 'A beginner-friendly plan with maturity-based returns.',
    min: 'R80',
    max: 'R5,000',
    duration: '30 days',
    rate: '8%',
    type: 'Paid at maturity',
    features: ['Minimum R80 deposit', '30-day duration', 'Single payout at maturity', 'Full dashboard access'],
    highlight: false,
  },
  {
    name: 'Growth',
    description: 'Balanced plan with daily earnings credited to your wallet.',
    min: 'R1,000',
    max: 'R50,000',
    duration: '60 days',
    rate: '18%',
    type: 'Daily earnings',
    features: ['Daily earnings to wallet', '60-day duration', 'Reinvest or withdraw anytime', 'Priority support'],
    highlight: true,
  },
  {
    name: 'Premium',
    description: 'Higher returns for larger commitments, paid at maturity.',
    min: 'R10,000',
    max: 'R250,000',
    duration: '90 days',
    rate: '32%',
    type: 'Paid at maturity',
    features: ['Highest return rate', '90-day duration', 'Dedicated account manager', 'Referral bonuses'],
    highlight: false,
  },
];

export function PlansSection() {
  return (
    <section id="plans" className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Investment plans</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Choose a plan that fits your goals
        </h2>
        <p className="mt-4 text-muted-foreground">
          Rates are fully configurable by our team and shown transparently. No hidden fees.
        </p>
      </div>
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-8 transition-all hover:shadow-lg ${
              plan.highlight ? 'border-primary bg-primary/5 shadow-lg' : 'bg-card'
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                Most popular
              </span>
            )}
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{plan.rate}</span>
              <span className="text-sm text-muted-foreground">return</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{plan.type}</p>
            <div className="mt-6 space-y-2 border-t pt-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Range</span>
                <span className="font-medium">{plan.min} – {plan.max}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{plan.duration}</span>
              </div>
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Return rates are set by platform administrators and may change. Your investment terms are locked at the time you invest.
      </p>
    </section>
  );
}
