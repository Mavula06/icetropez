'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowDownToLine, Copy, Loader2, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { depositSchema, type DepositInput } from '@/lib/validation';
import { generateReference, formatCurrency, formatDate } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Settings {
  company_name: string;
  bank_name: string;
  account_number: string;
  branch_code: string;
  account_holder: string;
  minimum_deposit: number;
}

interface DepositRow {
  id: string;
  amount: number;
  reference: string;
  proof_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function DepositsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<DepositInput>({ resolver: zodResolver(depositSchema) });

  const amount = watch('amount');

  const load = async () => {
    const [{ data: s }, { data: d }] = await Promise.all([
      supabase.from('settings').select('*').maybeSingle(),
      supabase.from('deposits').select('*').order('created_at', { ascending: false }),
    ]);
    setSettings(s as Settings | null);
    setDeposits((d as DepositRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generateRef = () => {
    const ref = generateReference('DEP');
    setReference(ref);
    return ref;
  };

  const onAmountFocus = () => {
    if (!reference) generateRef();
  };

  const onSubmit = async (values: DepositInput) => {
    const min = settings?.minimum_deposit ?? 80;
    if (values.amount < min) {
      toast.error(`Minimum deposit is ${formatCurrency(min)}.`);
      return;
    }
    setSubmitting(true);
    const ref = reference || generateRef();
    let proofUrl: string | null = null;

    if (proofFile) {
      setUploading(true);
      const ext = proofFile.name.split('.').pop();
      const path = `${ref}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('proofs')
        .upload(path, proofFile, { upsert: true });
      setUploading(false);
      if (upErr) {
        toast.error('Failed to upload proof: ' + upErr.message);
        setSubmitting(false);
        return;
      }
      const { data: pub } = supabase.storage.from('proofs').getPublicUrl(path);
      proofUrl = pub.publicUrl;
    }

    const { error } = await supabase.from('deposits').insert({
      amount: values.amount,
      reference: ref,
      proof_url: proofUrl,
      status: 'pending',
    });

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Deposit submitted. We will review your proof of payment.');
    reset();
    setReference('');
    setProofFile(null);
    load();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard.');
  };

  const minDeposit = settings?.minimum_deposit ?? 80;

  const statusVariant = (s: DepositRow['status']) =>
    s === 'approved' ? 'default' : s === 'rejected' ? 'destructive' : 'secondary';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deposits</h1>
        <p className="text-sm text-muted-foreground">Fund your wallet with an EFT deposit.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New deposit</CardTitle>
            <CardDescription>Minimum deposit: {formatCurrency(minDeposit)}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (R)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="80.00"
                  {...register('amount', { valueAsNumber: true })}
                  onFocus={onAmountFocus}
                />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>

              {reference && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Your unique payment reference</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="font-mono text-sm font-medium">{reference}</p>
                    <Button type="button" size="sm" variant="ghost" onClick={() => copyToClipboard(reference)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Use this exact reference as your payment reference so we can match your deposit.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="proof">Proof of payment (optional)</Label>
                <Input
                  id="proof"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">Upload a screenshot or PDF of your payment confirmation.</p>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {uploading ? 'Uploading proof...' : 'Submit deposit'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank details</CardTitle>
            <CardDescription>Transfer to these details using your reference.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading || !settings ? (
              <p className="text-sm text-muted-foreground">Loading bank details...</p>
            ) : (
              <>
                {[
                  { label: 'Company name', value: settings.company_name },
                  { label: 'Bank', value: settings.bank_name },
                  { label: 'Account holder', value: settings.account_holder },
                  { label: 'Account number', value: settings.account_number },
                  { label: 'Branch code', value: settings.branch_code },
                  { label: 'Reference', value: reference || '— generate after entering amount —' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{row.value}</span>
                      {row.value !== '— generate after entering amount —' && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => copyToClipboard(row.value)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Deposit history</CardTitle></CardHeader>
        <CardContent>
          {deposits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deposits yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(d.created_at)}</TableCell>
                    <TableCell className="font-mono text-xs">{d.reference}</TableCell>
                    <TableCell>
                      {d.proof_url ? (
                        <a href={d.proof_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(Number(d.amount))}</TableCell>
                    <TableCell><Badge variant={statusVariant(d.status)} className="capitalize">{d.status}</Badge></TableCell>
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
