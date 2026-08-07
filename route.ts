import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';
import { announcementSchema } from '@/lib/validation';

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
  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service.from('announcements').insert({
    title: parsed.data.title,
    message: parsed.data.message,
    is_active: parsed.data.is_active,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from('audit_logs').insert({
    actor_id: user.id,
    action: 'create_announcement',
    entity: 'announcements',
    entity_id: data.id,
    metadata: parsed.data,
  });

  return NextResponse.json({ ok: true, announcement: data });
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
  const { announcementId, ...updates } = body as { announcementId: string } & Record<string, unknown>;
  if (!announcementId) return NextResponse.json({ error: 'Missing announcementId' }, { status: 400 });

  const parsed = announcementSchema.partial().safeParse(updates);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service.from('announcements')
    .update(parsed.data)
    .eq('id', announcementId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from('audit_logs').insert({
    actor_id: user.id,
    action: 'update_announcement',
    entity: 'announcements',
    entity_id: announcementId,
    metadata: parsed.data,
  });

  return NextResponse.json({ ok: true, announcement: data });
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
  const announcementId = searchParams.get('id');
  if (!announcementId) return NextResponse.json({ error: 'Missing announcement id' }, { status: 400 });

  const service = createServiceClient();
  const { error } = await service.from('announcements').delete().eq('id', announcementId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from('audit_logs').insert({
    actor_id: user.id,
    action: 'delete_announcement',
    entity: 'announcements',
    entity_id: announcementId,
    metadata: {},
  });

  return NextResponse.json({ ok: true });
}
