import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

const LINKS = {
  Platform: [
    { label: 'Features', href: '/#features' },
    { label: 'Investment plans', href: '/#plans' },
    { label: 'About us', href: '/#about' },
    { label: 'FAQ', href: '/#faq' },
  ],
  Account: [
    { label: 'Sign in', href: '/auth/login' },
    { label: 'Create account', href: '/auth/register' },
    { label: 'Forgot password', href: '/auth/forgot-password' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  Legal: [
    { label: 'Terms of service', href: '/terms' },
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Contact', href: '/#contact' },
  ],
};

export function FooterSection() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="h-6 w-6 text-primary" />
              {APP_NAME}
            </Link>
            <p className="text-sm text-muted-foreground">
              Smart investing, steady growth. A transparent investment platform built for everyone.
            </p>
          </div>
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <p className="text-sm font-semibold">{heading}</p>
              <ul className="mt-4 space-y-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p>Built with care in South Africa</p>
        </div>
      </div>
    </footer>
  );
}
