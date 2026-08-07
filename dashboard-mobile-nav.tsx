'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/deposits', label: 'Deposit', icon: ArrowDownToLine },
  { href: '/dashboard/withdrawals', label: 'Withdraw', icon: ArrowUpFromLine },
  { href: '/dashboard/investments', label: 'Invest', icon: TrendingUp },
];

export function DashboardMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t bg-background px-2 py-2 md:hidden">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-xs',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
