'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { settingsSchema, type SettingsInput } from '@/lib/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema) });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('settings').select('*').maybeSingle();
      if (data) {
        reset({
          company_name: data.company_name,
          bank_name: data.bank_name,
          account_number: data.account_number,
          branch_code: data.branch_code,
          account_holder: data.account_holder,
          minimum_deposit: Number(data.minimum_deposit),
          referral_percentage: Number(data.referral_percentage),
          support_email: data.support_email,
          contact_phone: data.contact_phone,
        });
      }
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (values: SettingsInput) => {
    setSubmitting(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) { toast.error(json.error ?? 'Failed to save settings'); return; }
    toast.success('Settings saved.');
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure company, bank, and platform settings.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Company & Bank Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company name</Label>
              <Input id="company_name" {...register('company_name')} />
              {errors.company_name && <p className="text-sm text-destructive">{errors.company_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank name</Label>
              <Input id="bank_name" {...register('bank_name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Account number</Label>
              <Input id="account_number" {...register('account_number')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch_code">Branch code</Label>
              <Input id="branch_code" {...register('branch_code')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="account_holder">Account holder</Label>
              <Input id="account_holder" {...register('account_holder')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Platform Configuration</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="minimum_deposit">Minimum deposit (R)</Label>
              <Input id="minimum_deposit" type="number" step="0.01" {...register('minimum_deposit', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referral_percentage">Referral percentage (%)</Label>
              <Input id="referral_percentage" type="number" step="0.01" {...register('referral_percentage', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support_email">Support email</Label>
              <Input id="support_email" type="email" {...register('support_email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact phone</Label>
              <Input id="contact_phone" {...register('contact_phone')} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save settings
        </Button>
      </form>
    </div>
  );
}
