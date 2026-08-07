'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, Loader2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface WithdrawalRow {
  id: string;
  amount: number;
  bank_name: string | null;
  account_number: string | null;
  branch_code: string | null;
  account_holder: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user: { email: string; full_name: string | null } | null;
}

export default function AdminWithdrawalsPage() {
  const supabase = createClient();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const load = async () => {
    let q = supabase.from('withdrawals').select('*, user:profiles(email, full_name)').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setWithdrawals((data as WithdrawalRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const processWithdrawal = async (withdrawalId: string, action: 'approve' | 'reject') => {
    setProcessing(withdrawalId);
    const res = await fetch('/api/admin/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId, action }),
    });
    const json = await res.json();
    setProcessing(null);
    if (!res.ok) {
      toast.error(json.error ?? 'Failed to process withdrawal');
      return;
    }
    toast.success(`Withdrawal ${json.status}.`);
    load();
  };

  const statusVariant = (s: WithdrawalRow['status']) =>
    s === 'approved' ? 'default' : s === 'rejected' ? 'destructive' : 'secondary';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Withdrawals</h1>
        <p className="text-sm text-muted-foreground">Review and approve user withdrawal requests.</p>
      </div>

      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize">
            {f}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No withdrawals found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Holder</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(w.created_at)}</TableCell>
                    <TableCell>{w.user?.full_name ?? w.user?.email ?? 'Unknown'}</TableCell>
                    <TableCell>{w.bank_name ?? '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{w.account_number ?? '—'}</TableCell>
                    <TableCell>{w.account_holder ?? '—'}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(Number(w.amount))}</TableCell>
                    <TableCell><Badge variant={statusVariant(w.status)} className="capitalize">{w.status}</Badge></TableCell>
                    <TableCell>
                      {w.status === 'pending' ? (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => processWithdrawal(w.id, 'approve')} disabled={processing === w.id}>
                            {processing === w.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => processWithdrawal(w.id, 'reject')} disabled={processing === w.id}>
                            {processing === w.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      ) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
