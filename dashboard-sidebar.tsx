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
  Bell,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/deposits', label: 'Deposits', icon: ArrowDownToLine },
  { href: '/dashboard/withdrawals', label: 'Withdrawals', icon: ArrowUpFromLine },
  { href: '/dashboard/investments', label: 'Investments', icon: TrendingUp },
  { href: '/dashboard/referrals', label: 'Referrals', icon: Users },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-5 font-bold">
        <ShieldCheck className="h-6 w-6 text-primary" />
        Icetropez.Vest
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin Panel
          </Link>
        )}
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {(profile?.full_name ?? profile?.email ?? 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{profile?.full_name ?? 'User'}</p>
            <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 w-full justify-start text-muted-foreground"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
