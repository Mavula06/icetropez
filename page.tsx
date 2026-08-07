'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, Loader2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DepositRow {
  id: string;
  amount: number;
  reference: string;
  proof_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user: { email: string; full_name: string | null } | null;
}

export default function AdminDepositsPage() {
  const supabase = createClient();
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const load = async () => {
    let q = supabase.from('deposits').select('*, user:profiles(email, full_name)').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    setDeposits((data as DepositRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const processDeposit = async (depositId: string, action: 'approve' | 'reject') => {
    setProcessing(depositId);
    const res = await fetch('/api/admin/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId, action }),
    });
    const json = await res.json();
    setProcessing(null);
    if (!res.ok) {
      toast.error(json.error ?? 'Failed to process deposit');
      return;
    }
    toast.success(`Deposit ${json.status}.`);
    load();
  };

  const statusVariant = (s: DepositRow['status']) =>
    s === 'approved' ? 'default' : s === 'rejected' ? 'destructive' : 'secondary';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deposits</h1>
        <p className="text-sm text-muted-foreground">Review and approve user deposit requests.</p>
      </div>

      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : deposits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deposits found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(d.created_at)}</TableCell>
                    <TableCell>{d.user?.full_name ?? d.user?.email ?? 'Unknown'}</TableCell>
                    <TableCell className="font-mono text-xs">{d.reference}</TableCell>
                    <TableCell>
                      {d.proof_url ? (
                        <a href={d.proof_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(Number(d.amount))}</TableCell>
                    <TableCell><Badge variant={statusVariant(d.status)} className="capitalize">{d.status}</Badge></TableCell>
                    <TableCell>
                      {d.status === 'pending' ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => processDeposit(d.id, 'approve')}
                            disabled={processing === d.id}
                          >
                            {processing === d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => processDeposit(d.id, 'reject')}
                            disabled={processing === d.id}
                          >
                            {processing === d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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
