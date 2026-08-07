import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-muted-foreground">Every movement in and out of your wallet.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All transactions</CardTitle></CardHeader>
        <CardContent>
          {(transactions ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance after</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(transactions ?? []).map((t) => {
                  const positive = ['deposit', 'earnings', 'referral', 'bonus'].includes(t.type);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(t.created_at)}</TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell className="capitalize">{t.type}</TableCell>
                      <TableCell className="font-mono text-xs">{t.reference}</TableCell>
                      <TableCell className={`text-right font-medium ${positive ? 'text-success' : 'text-destructive'}`}>
                        {positive ? '+' : '-'}{formatCurrency(Number(t.amount))}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(t.balance_after))}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
