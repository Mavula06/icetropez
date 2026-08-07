'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Gift, Share2, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatCard } from '@/components/dashboard/stat-card';

interface ReferralRow {
  id: string;
  earnings: number;
  status: 'pending' | 'paid';
  created_at: string;
  referred: { email: string; full_name: string | null } | null;
}

export default function ReferralsPage() {
  const supabase = createClient();
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [referredCount, setReferredCount] = useState(0);
  const [percentage, setPercentage] = useState(10);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: profile }, { data: refs }, { data: settings }] = await Promise.all([
      supabase.from('profiles').select('referral_code').eq('id', user.id).maybeSingle(),
      supabase
        .from('referrals')
        .select('id, earnings, status, created_at, referred:referred_id(email, full_name)')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('settings').select('referral_percentage').maybeSingle(),
    ]);
    const code = profile?.referral_code ?? '';
    setReferralCode(code);
    setReferralLink(`${window.location.origin}/auth/register?ref=${code}`);
    const rows = (refs ?? []) as unknown as ReferralRow[];
    setReferrals(rows);
    setTotalEarnings(rows.reduce((s, r) => s + Number(r.earnings), 0));
    setReferredCount(rows.length);
    setPercentage(settings?.referral_percentage ?? 10);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referrals</h1>
        <p className="text-sm text-muted-foreground">
          Invite friends and earn {percentage}% on their investments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total referrals" value={String(referredCount)} icon={Users} accent="primary" />
        <StatCard label="Total earnings" value={formatCurrency(totalEarnings)} icon={Gift} accent="success" />
        <StatCard label="Commission rate" value={`${percentage}%`} icon={Share2} accent="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your referral code</CardTitle>
            <CardDescription>Share this code with friends.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Input readOnly value={referralCode} className="font-mono text-lg" />
              <Button variant="outline" onClick={() => copyToClipboard(referralCode, 'Code')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your referral link</CardTitle>
            <CardDescription>Friends who sign up via this link become your referrals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Input readOnly value={referralLink} className="text-sm" />
              <Button variant="outline" onClick={() => copyToClipboard(referralLink, 'Link')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Referral history</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">No referrals yet. Share your link to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Referred user</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(r.created_at)}</TableCell>
                    <TableCell>{r.referred?.full_name ?? r.referred?.email ?? 'User'}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(Number(r.earnings))}</TableCell>
                    <TableCell><Badge variant={r.status === 'paid' ? 'default' : 'secondary'} className="capitalize">{r.status}</Badge></TableCell>
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
