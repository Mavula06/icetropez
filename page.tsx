'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { planSchema, type PlanInput } from '@/lib/validation';
import { formatCurrency } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

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

export default function AdminPlansPage() {
  const supabase = createClient();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors },
  } = useForm<PlanInput>({ resolver: zodResolver(planSchema) });

  const isActive = watch('is_active');

  const load = async () => {
    const { data } = await supabase.from('investment_plans').select('*').order('min_amount');
    setPlans((data as Plan[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', description: '', min_amount: 80, max_amount: 10000, duration_days: 30, return_rate: 10, earnings_type: 'maturity', is_active: true });
    setOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    reset({
      name: plan.name, description: plan.description ?? '', min_amount: plan.min_amount,
      max_amount: plan.max_amount, duration_days: plan.duration_days, return_rate: plan.return_rate,
      earnings_type: plan.earnings_type, is_active: plan.is_active,
    });
    setOpen(true);
  };

  const onSubmit = async (values: PlanInput) => {
    setSubmitting(true);
    const payload = { ...values, description: values.description || undefined };
    if (editing) {
      const res = await fetch('/api/admin/plans', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: editing.id, ...payload }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); setSubmitting(false); return; }
      toast.success('Plan updated.');
    } else {
      const res = await fetch('/api/admin/plans', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); setSubmitting(false); return; }
      toast.success('Plan created.');
    }
    setSubmitting(false);
    setOpen(false);
    load();
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Delete this plan? Active investments referencing it will remain.')) return;
    const res = await fetch(`/api/admin/plans?id=${id}`, { method: 'DELETE' });
    if (!res.ok) { toast.error('Failed to delete plan'); return; }
    toast.success('Plan deleted.');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Investment Plans</h1>
          <p className="text-sm text-muted-foreground">Configure plans, rates, and durations.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New plan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit plan' : 'New investment plan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={2} {...register('description')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="min_amount">Min amount</Label>
                  <Input id="min_amount" type="number" step="0.01" {...register('min_amount', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_amount">Max amount</Label>
                  <Input id="max_amount" type="number" step="0.01" {...register('max_amount', { valueAsNumber: true })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="duration_days">Duration (days)</Label>
                  <Input id="duration_days" type="number" {...register('duration_days', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return_rate">Return rate (%)</Label>
                  <Input id="return_rate" type="number" step="0.01" {...register('return_rate', { valueAsNumber: true })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="earnings_type">Earnings type</Label>
                <select id="earnings_type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('earnings_type')}>
                  <option value="maturity">Maturity</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isActive} onCheckedChange={(v) => setValue('is_active', v, { shouldValidate: true })} />
                <Label>Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? 'Save' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">No plans configured.</p>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{plan.name}</CardTitle>
                <Badge variant={plan.is_active ? 'default' : 'secondary'}>{plan.is_active ? 'Active' : 'Inactive'}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {plan.description && <p className="text-muted-foreground">{plan.description}</p>}
                <div className="flex justify-between"><span className="text-muted-foreground">Return</span><span className="font-medium">{plan.return_rate}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">{plan.duration_days} days</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Range</span><span className="font-medium">{formatCurrency(plan.min_amount)} – {formatCurrency(plan.max_amount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Earnings</span><span className="font-medium capitalize">{plan.earnings_type}</span></div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(plan)}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deletePlan(plan.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
