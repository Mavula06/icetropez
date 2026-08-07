import Link from 'next/link';
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, Wallet as WalletIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/constants';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function WalletPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const balance = wallet?.balance ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-sm text-muted-foreground">Your balance and full transaction ledger.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Available balance" value={formatCurrency(balance)} icon={WalletIcon} accent="primary" />
        <StatCard label="Total deposited" value={formatCurrency(wallet?.total_deposited ?? 0)} icon={ArrowDownToLine} accent="success" />
        <StatCard label="Total withdrawn" value={formatCurrency(wallet?.total_withdrawn ?? 0)} icon={ArrowUpFromLine} accent="warning" />
        <StatCard label="Total earnings" value={formatCurrency(wallet?.total_earnings ?? 0)} icon={TrendingUp} accent="success" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard/deposits"><ArrowDownToLine className="mr-2 h-4 w-4" />New deposit</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/withdrawals"><ArrowUpFromLine className="mr-2 h-4 w-4" />Withdraw</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/investments"><TrendingUp className="mr-2 h-4 w-4" />Invest</Link>
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Transaction history</CardTitle></CardHeader>
        <CardContent>
          {(transactions ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(transactions ?? []).map((t) => {
                  const positive = ['deposit', 'earnings', 'referral', 'bonus'].includes(t.type);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(t.created_at)}</TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell className="capitalize">{t.type}</TableCell>
                      <TableCell className="font-mono text-xs">{t.reference}</TableCell>
                      <TableCell className={`text-right font-medium ${positive ? 'text-success' : 'text-destructive'}`}>
                        {positive ? '+' : '-'}{formatCurrency(Number(t.amount))}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(t.balance_after))}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
