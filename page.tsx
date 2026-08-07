'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowUpFromLine, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { withdrawalSchema, type WithdrawalInput } from '@/lib/validation';
import { formatCurrency, formatDate } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Wallet {
  balance: number;
}

interface WithdrawalRow {
  id: string;
  amount: number;
  bank_name: string | null;
  account_number: string | null;
  branch_code: string | null;
  account_holder: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
}

export default function WithdrawalsPage() {
  const supabase = createClient();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WithdrawalInput>({ resolver: zodResolver(withdrawalSchema) });

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: w }, { data: wd }] = await Promise.all([
      supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle(),
      supabase.from('withdrawals').select('*').order('created_at', { ascending: false }),
    ]);
    setWallet(w as Wallet | null);
    setWithdrawals((wd as WithdrawalRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (values: WithdrawalInput) => {
    const balance = wallet?.balance ?? 0;
    if (values.amount > balance) {
      toast.error('Insufficient wallet balance.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('withdrawals').insert({
      amount: values.amount,
      bank_name: values.bank_name,
      account_number: values.account_number,
      branch_code: values.branch_code,
      account_holder: values.account_holder,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Withdrawal request submitted. Pending admin approval.');
    reset();
    load();
  };

  const statusVariant = (s: WithdrawalRow['status']) =>
    s === 'approved' ? 'default' : s === 'rejected' ? 'destructive' : 'secondary';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Withdrawals</h1>
        <p className="text-sm text-muted-foreground">Request a withdrawal to your bank account.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>New withdrawal</CardTitle>
            <CardDescription>
              Available balance: <span className="font-semibold text-foreground">{formatCurrency(wallet?.balance ?? 0)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (R)</Label>
                <Input id="amount" type="number" step="0.01" placeholder="100.00" {...register('amount', { valueAsNumber: true })} />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_holder">Account holder</Label>
                <Input id="account_holder" placeholder="Jane Doe" {...register('account_holder')} />
                {errors.account_holder && <p className="text-sm text-destructive">{errors.account_holder.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank name</Label>
                <Input id="bank_name" placeholder="First National Bank" {...register('bank_name')} />
                {errors.bank_name && <p className="text-sm text-destructive">{errors.bank_name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account number</Label>
                  <Input id="account_number" placeholder="62345678901" {...register('account_number')} />
                  {errors.account_number && <p className="text-sm text-destructive">{errors.account_number.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch_code">Branch code</Label>
                  <Input id="branch_code" placeholder="250655" {...register('branch_code')} />
                  {errors.branch_code && <p className="text-sm text-destructive">{errors.branch_code.message}</p>}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request withdrawal
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Withdrawal history</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : withdrawals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No withdrawal requests yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(w.created_at)}</TableCell>
                      <TableCell>{w.bank_name}</TableCell>
                      <TableCell className="font-mono text-xs">{w.account_number}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(Number(w.amount))}</TableCell>
                      <TableCell><Badge variant={statusVariant(w.status)} className="capitalize">{w.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
