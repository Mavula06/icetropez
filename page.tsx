import Link from 'next/link';
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, Users, Wallet } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/constants';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const supabase = await createClient();

  const [{ count: userCount }, { count: depositCount }, { count: withdrawalCount }, { count: investmentCount }] =
    await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('deposits').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('investments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    ]);

  const { data: pendingDeposits } = await supabase
    .from('deposits')
    .select('*, user:profiles(email, full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: pendingWithdrawals } = await supabase
    .from('withdrawals')
    .select('*, user:profiles(email, full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('email, full_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Platform summary and pending actions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={String(userCount ?? 0)} icon={Users} accent="primary" />
        <StatCard label="Pending deposits" value={String(depositCount ?? 0)} icon={ArrowDownToLine} accent="success" />
        <StatCard label="Pending withdrawals" value={String(withdrawalCount ?? 0)} icon={ArrowUpFromLine} accent="warning" />
        <StatCard label="Active investments" value={String(investmentCount ?? 0)} icon={TrendingUp} accent="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Pending deposits</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/deposits">Review all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(pendingDeposits ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending deposits.</p>
            ) : (
              (pendingDeposits ?? []).map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{d.user?.full_name ?? d.user?.email}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(d.created_at)}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(Number(d.amount))}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Pending withdrawals</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/withdrawals">Review all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(pendingWithdrawals ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending withdrawals.</p>
            ) : (
              (pendingWithdrawals ?? []).map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{w.user?.full_name ?? w.user?.email}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(w.created_at)}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(Number(w.amount))}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent sign-ups</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(recentUsers ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          ) : (
            (recentUsers ?? []).map((u) => (
              <div key={u.email} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{u.full_name ?? u.email}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant="secondary">{formatDate(u.created_at)}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
