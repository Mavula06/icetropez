import Link from 'next/link';
import { ShieldCheck, TrendingUp, Users } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/95 via-primary to-primary/80 p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-float" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <ShieldCheck className="h-7 w-7" />
            Icetropez.Vest
          </Link>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              Smart investing,<br />steady growth.
            </h2>
            <p className="mt-3 max-w-sm text-white/80">
              Managed investment plans with transparent daily and maturity-based earnings.
              Start from as little as R80.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              { icon: TrendingUp, title: 'Transparent returns', desc: 'See your earnings calculated in real time.' },
              { icon: Users, title: 'Referral rewards', desc: 'Earn a percentage on every referred investor.' },
              { icon: ShieldCheck, title: 'Bank-grade security', desc: 'Your funds and data are protected end-to-end.' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-white/70">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-sm text-white/60">
          &copy; {new Date().getFullYear()} Icetropez.Vest. All rights reserved.
        </p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
