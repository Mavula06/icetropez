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
  const { withdrawalId, action } = body as { withdrawalId: string; action: 'approve' | 'reject' };
  if (!withdrawalId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const service = createServiceClient();

  const { data: withdrawal } = await service
    .from('withdrawals')
    .select('*')
    .eq('id', withdrawalId)
    .maybeSingle();
  if (!withdrawal) return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
  if (withdrawal.status !== 'pending')
    return NextResponse.json({ error: 'Withdrawal already processed' }, { status: 400 });

  const { data: wallet } = await service
    .from('wallets')
    .select('*')
    .eq('user_id', withdrawal.user_id)
    .maybeSingle();
  if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 500 });

  if (action === 'reject') {
    await service.from('withdrawals').update({ status: 'rejected' }).eq('id', withdrawalId);
    await service.from('notifications').insert({
      user_id: withdrawal.user_id,
      type: 'warning',
      title: 'Withdrawal rejected',
      message: `Your withdrawal request of ${formatCurrency(Number(withdrawal.amount))} was rejected.`,
    });
    await service.from('audit_logs').insert({
      actor_id: user.id,
      action: 'reject_withdrawal',
      entity: 'withdrawals',
      entity_id: withdrawalId,
      metadata: { amount: withdrawal.amount },
    });
    return NextResponse.json({ ok: true, status: 'rejected' });
  }

  // Approve: deduct from wallet + create transaction
  const newBalance = Number(wallet.balance) - Number(withdrawal.amount);
  const newTotalWithdrawn = Number(wallet.total_withdrawn) + Number(withdrawal.amount);

  await service.from('wallets').update({
    balance: newBalance,
    total_withdrawn: newTotalWithdrawn,
  }).eq('id', wallet.id);

  await service.from('withdrawals').update({ status: 'approved' }).eq('id', withdrawalId);

  await service.from('transactions').insert({
    user_id: withdrawal.user_id,
    type: 'withdrawal',
    amount: withdrawal.amount,
    description: `Withdrawal approved to ${withdrawal.bank_name} (${withdrawal.account_number})`,
    reference: `WDR-${withdrawal.id.slice(0, 8).toUpperCase()}`,
    balance_after: newBalance,
  });

  await service.from('notifications').insert({
    user_id: withdrawal.user_id,
    type: 'success',
    title: 'Withdrawal approved',
    message: `Your withdrawal of ${formatCurrency(Number(withdrawal.amount))} has been approved and is being processed.`,
  });

  await service.from('audit_logs').insert({
    actor_id: user.id,
    action: 'approve_withdrawal',
    entity: 'withdrawals',
    entity_id: withdrawalId,
    metadata: { amount: withdrawal.amount, new_balance: newBalance },
  });

  return NextResponse.json({ ok: true, status: 'approved' });
}
