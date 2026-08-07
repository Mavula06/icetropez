import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';
import { formatCurrency } from '@/lib/constants';

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
  const { depositId, action } = body as { depositId: string; action: 'approve' | 'reject' };
  if (!depositId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const service = createServiceClient();

  const { data: deposit } = await service
    .from('deposits')
    .select('*')
    .eq('id', depositId)
    .maybeSingle();
  if (!deposit) return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
  if (deposit.status !== 'pending')
    return NextResponse.json({ error: 'Deposit already processed' }, { status: 400 });

  if (action === 'reject') {
    await service.from('deposits').update({ status: 'rejected' }).eq('id', depositId);
    await service.from('notifications').insert({
      user_id: deposit.user_id,
      type: 'warning',
      title: 'Deposit rejected',
      message: `Your deposit of ${formatCurrency(Number(deposit.amount))} (ref: ${deposit.reference}) was rejected.`,
    });
    await service.from('audit_logs').insert({
      actor_id: user.id,
      action: 'reject_deposit',
      entity: 'deposits',
      entity_id: depositId,
      metadata: { amount: deposit.amount, reference: deposit.reference },
    });
    return NextResponse.json({ ok: true, status: 'rejected' });
  }

  // Approve: credit wallet + create transaction
  const { data: wallet } = await service
    .from('wallets')
    .select('*')
    .eq('user_id', deposit.user_id)
    .maybeSingle();
  if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 500 });

  const newBalance = Number(wallet.balance) + Number(deposit.amount);
  const newTotalDeposited = Number(wallet.total_deposited) + Number(deposit.amount);

  await service.from('wallets').update({
    balance: newBalance,
    total_deposited: newTotalDeposited,
  }).eq('id', wallet.id);

  await service.from('deposits').update({ status: 'approved' }).eq('id', depositId);

  await service.from('transactions').insert({
    user_id: deposit.user_id,
    type: 'deposit',
    amount: deposit.amount,
    description: `Deposit approved (ref: ${deposit.reference})`,
    reference: deposit.reference,
    balance_after: newBalance,
  });

  await service.from('notifications').insert({
    user_id: deposit.user_id,
    type: 'success',
    title: 'Deposit approved',
    message: `Your deposit of ${formatCurrency(Number(deposit.amount))} has been credited to your wallet.`,
  });

  await service.from('audit_logs').insert({
    actor_id: user.id,
    action: 'approve_deposit',
    entity: 'deposits',
    entity_id: depositId,
    metadata: { amount: deposit.amount, reference: deposit.reference, new_balance: newBalance },
  });

  return NextResponse.json({ ok: true, status: 'approved' });
}
