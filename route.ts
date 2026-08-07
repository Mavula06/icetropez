import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';
import { settingsSchema } from '@/lib/validation';

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
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });

  const service = createServiceClient();
  const { data: settings } = await service.from('settings').select('id').maybeSingle();
  if (!settings) return NextResponse.json({ error: 'Settings row not found' }, { status: 500 });

  const { data, error } = await service.from('settings')
    .update(parsed.data)
    .eq('id', settings.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from('audit_logs').insert({
    actor_id: user.id,
    action: 'update_settings',
    entity: 'settings',
    entity_id: settings.id,
    metadata: parsed.data,
  });

  return NextResponse.json({ ok: true, settings: data });
}
