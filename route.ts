import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';
import { planSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile || profile.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = planSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service.from('investment_plans').insert({
    name: parsed.data.name,
    description: parsed.data.description || null,
    min_amount: parsed.data.min_amount,
    max_amount: parsed.data.max_amount,
    duration_days: parsed.data.duration_days,
    return_rate: parsed.data.return_rate,
    earnings_type: parsed.data.earnings_type,
    is_active: parsed.data.is_active,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from('audit_logs').insert({
    actor_id: user.id,
    action: 'create_plan',
    entity: 'investment_plans',
    entity_id: data.id,
    metadata: parsed.data,
  });

  return NextResponse.json({ ok: true, plan: data });
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile || profile.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { planId, ...updates } = body as { planId: string } & Record<string, unknown>;
  if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 });

  const parsed = planSchema.partial().safeParse(updates);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service.from('investment_plans')
    .update(parsed.data)
    .eq('id', planId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from('audit_logs').insert({
    actor_id: user.id,
    action: 'update_plan',
    entity: 'investment_plans',
    entity_id: planId,
    metadata: parsed.data,
  });

  return NextResponse.json({ ok: true, plan: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile || profile.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const planId = searchParams.get('id');
  if (!planId) return NextResponse.json({ error: 'Missing plan id' }, { status: 400 });

  const service = createServiceClient();
  const { error } = await service.from('investment_plans').delete().eq('id', planId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from('audit_logs').insert({
    actor_id: user.id,
    action: 'delete_plan',
    entity: 'investment_plans',
    entity_id: planId,
    metadata: {},
  });

  return NextResponse.json({ ok: true });
}
