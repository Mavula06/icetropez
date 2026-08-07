'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQS = [
  {
    q: 'How do I get started?',
    a: 'Create a free account, make your first deposit (minimum R80) using the unique reference we generate, and upload your proof of payment. Once an administrator approves your deposit, your wallet is credited and you can invest.',
  },
  {
    q: 'How are returns calculated?',
    a: 'Returns are calculated from the rules configured by our team for each plan — the return rate, the duration, and whether earnings are paid daily or at maturity. The exact terms are shown before you invest and locked in at that point.',
  },
  {
    q: 'When will I receive my earnings?',
    a: 'For daily-earnings plans, earnings are credited to your wallet each day. For maturity plans, the full return is paid into your wallet when the plan reaches its end date.',
  },
  {
    q: 'How do withdrawals work?',
    a: 'You can request a withdrawal to your bank account at any time from your dashboard. Each request is reviewed by an administrator before the funds are released, and you can track the status in your transaction history.',
  },
  {
    q: 'Is there a referral program?',
    a: 'Yes. Every account gets a unique referral code and link. When someone you refer invests, you earn a percentage of their investment — the percentage is set by our team and shown in your referral dashboard.',
  },
  {
    q: 'Is my money safe?',
    a: 'Your account is protected with encrypted password hashing and JWT-based sessions. All balance changes go through an administrator approval flow and are recorded in an immutable audit log.',
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">FAQ</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Questions, answered
        </h2>
        <p className="mt-4 text-muted-foreground">
          Everything you need to know before you invest.
        </p>
      </div>
      <div className="mx-auto mt-12 max-w-3xl">
        <Accordion type="single" collapsible className="rounded-2xl border bg-card px-4">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
