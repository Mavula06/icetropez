import Link from 'next/link';
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, Wallet as WalletIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/constants';
import { StatCard } from '@/components/dashboard/stat-card';
import { WalletChart } from '@/components/dashboard/wallet-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: wallet }, { data: transactions }, { data: investments }] = await Promise.all([
    supabase.from('wallets').select('*').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('investments')
      .select('*, plan:investment_plans(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const balance = wallet?.balance ?? 0;
  const totalDeposited = wallet?.total_deposited ?? 0;
  const totalWithdrawn = wallet?.total_withdrawn ?? 0;
  const totalEarnings = wallet?.total_earnings ?? 0;

  // Build chart data from last 14 transactions (reversed for chronological order)
  const chartData = (transactions ?? [])
    .slice()
    .reverse()
    .slice(-14)
    .map((t) => ({
      label: formatDate(t.created_at).split(' ')[1] ?? formatDate(t.created_at),
      value: Number(t.balance_after),
    }));

  const recent = (transactions ?? []).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">An overview of your wallet and investments.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Wallet balance" value={formatCurrency(balance)} icon={WalletIcon} accent="primary" />
        <StatCard label="Total deposited" value={formatCurrency(totalDeposited)} icon={ArrowDownToLine} accent="success" />
        <StatCard label="Total withdrawn" value={formatCurrency(totalWithdrawn)} icon={ArrowUpFromLine} accent="warning" />
        <StatCard label="Total earnings" value={formatCurrency(totalEarnings)} icon={TrendingUp} accent="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Wallet balance history</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <WalletChart data={chartData} />
            ) : (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No transactions yet. Make your first deposit to see your balance grow.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Active investments</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/investments">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(investments ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No investments yet.</p>
            )}
            {(investments ?? []).map((inv) => (
              <div key={inv.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{inv.plan?.name ?? 'Plan'}</p>
                  <Badge variant={inv.status === 'active' ? 'default' : 'secondary'}>
                    {inv.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(Number(inv.amount))} · ends {formatDate(inv.end_date)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Recent transactions</CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/transactions">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {recent.map((t) => {
                const positive = ['deposit', 'earnings', 'referral', 'bonus'].includes(t.type);
                return (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.created_at)}</p>
                    </div>
                    <p className={`text-sm font-semibold ${positive ? 'text-success' : 'text-destructive'}`}>
                      {positive ? '+' : '-'}{formatCurrency(Number(t.amount))}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
