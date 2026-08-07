'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ReportData {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalInvestments: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalDepositedAmount: number;
  totalWithdrawnAmount: number;
  totalInvestedAmount: number;
  recentTransactions: {
    id: string;
    type: string;
    amount: number;
    description: string;
    created_at: string;
    user: { email: string } | { email: string }[] | null;
  }[];
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const supabase = createClient();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [users, deposits, withdrawals, investments, pendingDep, pendingWd, txns] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
        supabase.from('deposits').select('*', { count: 'exact', head: true }),
        supabase.from('withdrawals').select('*', { count: 'exact', head: true }),
        supabase.from('investments').select('*', { count: 'exact', head: true }),
        supabase.from('deposits').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('transactions').select('id, type, amount, description, created_at, user:profiles(email)').order('created_at', { ascending: false }).limit(20),
      ]);

      const { data: depAmounts } = await supabase.from('deposits').select('amount').eq('status', 'approved');
      const { data: wdAmounts } = await supabase.from('withdrawals').select('amount').eq('status', 'approved');
      const { data: invAmounts } = await supabase.from('investments').select('amount').eq('status', 'active');

      setData({
        totalUsers: users.count ?? 0,
        totalDeposits: deposits.count ?? 0,
        totalWithdrawals: withdrawals.count ?? 0,
        totalInvestments: investments.count ?? 0,
        pendingDeposits: pendingDep.count ?? 0,
        pendingWithdrawals: pendingWd.count ?? 0,
        totalDepositedAmount: (depAmounts ?? []).reduce((s, d) => s + Number(d.amount), 0),
        totalWithdrawnAmount: (wdAmounts ?? []).reduce((s, w) => s + Number(w.amount), 0),
        totalInvestedAmount: (invAmounts ?? []).reduce((s, i) => s + Number(i.amount), 0),
        recentTransactions: (txns.data ?? []) as ReportData['recentTransactions'],
      });
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p className="text-sm text-muted-foreground">Loading reports...</p>;

  const exportSummary = () => {
    if (!data) return;
    downloadCsv('report-summary.csv', ['Metric', 'Value'], [
      ['Total users', String(data.totalUsers)],
      ['Total deposits', String(data.totalDeposits)],
      ['Pending deposits', String(data.pendingDeposits)],
      ['Total deposited amount', formatCurrency(data.totalDepositedAmount)],
      ['Total withdrawals', String(data.totalWithdrawals)],
      ['Pending withdrawals', String(data.pendingWithdrawals)],
      ['Total withdrawn amount', formatCurrency(data.totalWithdrawnAmount)],
      ['Active investments', String(data.totalInvestments)],
      ['Total invested amount', formatCurrency(data.totalInvestedAmount)],
    ]);
  };

  const exportTransactions = () => {
    if (!data) return;
    downloadCsv('transactions.csv', ['Date', 'Type', 'Amount', 'Description', 'User'], data.recentTransactions.map((t) => {
      const userVal = Array.isArray(t.user) ? t.user[0]?.email ?? '' : t.user?.email ?? '';
      return [formatDate(t.created_at), t.type, formatCurrency(Number(t.amount)), t.description, userVal];
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">Platform-wide financial summary and exports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportSummary}><Download className="mr-2 h-4 w-4" /> Summary CSV</Button>
          <Button variant="outline" size="sm" onClick={exportTransactions}><Download className="mr-2 h-4 w-4" /> Transactions CSV</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Total users</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{data!.totalUsers}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Total deposited</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(data!.totalDepositedAmount)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Total withdrawn</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(data!.totalWithdrawnAmount)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Active investments</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(data!.totalInvestedAmount)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent transactions</CardTitle></CardHeader>
        <CardContent>
          {data!.recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data!.recentTransactions.map((t) => {
                  const userVal = Array.isArray(t.user) ? t.user[0]?.email ?? '' : t.user?.email ?? '';
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(t.created_at)}</TableCell>
                      <TableCell className="capitalize">{t.type}</TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell>{userVal}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(Number(t.amount))}</TableCell>
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
