'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { investmentSchema, type InvestmentInput } from '@/lib/validation';
import { formatCurrency, formatDate, daysBetween } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  min_amount: number;
  max_amount: number;
  duration_days: number;
  return_rate: number;
  earnings_type: 'daily' | 'maturity';
  is_active: boolean;
}

interface InvestmentRow {
  id: string;
  amount: number;
  expected_return: number;
  earnings_to_date: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  plan: Plan | null;
}

export default function InvestmentsPage() {
  const supabase = createClient();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [investments, setInvestments] = useState<InvestmentRow[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvestmentInput>({ resolver: zodResolver(investmentSchema) });

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: p }, { data: inv }, { data: w }] = await Promise.all([
      supabase.from('investment_plans').select('*').eq('is_active', true).order('min_amount'),
      supabase
        .from('investments')
        .select('*, plan:investment_plans(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle(),
    ]);
    setPlans((p as Plan[]) ?? []);
    setInvestments((inv as InvestmentRow[]) ?? []);
    setWalletBalance(w?.balance ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openInvestDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    reset({ plan_id: plan.id });
  };

  const onSubmit = async (values: InvestmentInput) => {
    const plan = plans.find((p) => p.id === values.plan_id);
    if (!plan) {
      toast.error('Please select a valid plan.');
      return;
    }
    if (values.amount < plan.min_amount) {
      toast.error(`Minimum for ${plan.name} is ${formatCurrency(plan.min_amount)}.`);
      return;
    }
    if (values.amount > plan.max_amount) {
      toast.error(`Maximum for ${plan.name} is ${formatCurrency(plan.max_amount)}.`);
      return;
    }
    if (values.amount > walletBalance) {
      toast.error('Insufficient wallet balance.');
      return;
    }

    setSubmitting(true);
    const expectedReturn = (values.amount * plan.return_rate) / 100;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);

    const { error } = await supabase.from('investments').insert({
      plan_id: plan.id,
      amount: values.amount,
      expected_return: expectedReturn,
      end_date: endDate.toISOString(),
      status: 'active',
    });

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Invested ${formatCurrency(values.amount)} in ${plan.name}.`);
    setSelectedPlan(null);
    reset();
    load();
  };

  const calcEarningsToDate = (inv: InvestmentRow): number => {
    if (inv.status === 'completed') return Number(inv.expected_return);
    if (inv.status === 'cancelled') return Number(inv.earnings_to_date);
    const plan = inv.plan;
    if (!plan) return Number(inv.earnings_to_date);
    const elapsed = Math.max(0, daysBetween(inv.start_date, new Date()));
    const totalDays = plan.duration_days;
    if (plan.earnings_type === 'daily') {
      const dailyRate = Number(inv.expected_return) / totalDays;
      return Math.min(Number(inv.expected_return), dailyRate * elapsed);
    }
    // maturity: no earnings until end
    return 0;
  };

  const active = investments.filter((i) => i.status === 'active');
  const history = investments.filter((i) => i.status !== 'active');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Investments</h1>
        <p className="text-sm text-muted-foreground">Choose a plan and watch your earnings grow.</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading plans...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  <Badge variant={plan.earnings_type === 'daily' ? 'default' : 'secondary'} className="capitalize">
                    {plan.earnings_type}
                  </Badge>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Return rate</span>
                    <span className="font-semibold">{plan.return_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{plan.duration_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Range</span>
                    <span className="font-medium">{formatCurrency(plan.min_amount)} – {formatCurrency(plan.max_amount)}</span>
                  </div>
                </div>
                <Button className="mt-4 w-full" onClick={() => openInvestDialog(plan)}>
                  <TrendingUp className="mr-2 h-4 w-4" /> Invest
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {active.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Active investments</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {active.map((inv) => {
              const earned = calcEarningsToDate(inv);
              const total = Number(inv.expected_return);
              const pct = total > 0 ? Math.min(100, (earned / total) * 100) : 0;
              const remaining = Math.max(0, daysBetween(new Date(), inv.end_date));
              return (
                <div key={inv.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{inv.plan?.name ?? 'Plan'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(Number(inv.amount))} · ends {formatDate(inv.end_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-success">{formatCurrency(earned)}</p>
                      <p className="text-xs text-muted-foreground">of {formatCurrency(total)}</p>
                    </div>
                  </div>
                  <Progress value={pct} className="mt-3" />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>{remaining} days remaining</span>
                    <Badge variant="default" className="capitalize">{inv.status}</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Investment history</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {history.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{inv.plan?.name ?? 'Plan'}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(inv.start_date)} – {formatDate(inv.end_date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{formatCurrency(Number(inv.amount))}</span>
                  <Badge variant={inv.status === 'completed' ? 'default' : 'destructive'} className="capitalize">{inv.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invest in {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Return rate: {selectedPlan?.return_rate}% over {selectedPlan?.duration_days} days ({selectedPlan?.earnings_type}).
              Available balance: {formatCurrency(walletBalance)}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (R)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder={`${selectedPlan?.min_amount ?? 0}`}
                  {...register('amount', { valueAsNumber: true })}
                />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                {selectedPlan && (
                  <p className="text-xs text-muted-foreground">
                    Min: {formatCurrency(selectedPlan.min_amount)} · Max: {formatCurrency(selectedPlan.max_amount)}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSelectedPlan(null)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm investment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
