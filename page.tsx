'use client';

import { useEffect, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  referral_code: string;
  created_at: string;
  wallet: { balance: number; total_deposited: number } | null;
}

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, referral_code, created_at, wallet:wallets(balance, total_deposited)')
      .order('created_at', { ascending: false });
    setUsers((data as unknown as UserRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.email.toLowerCase().includes(q) || (u.full_name ?? '').toLowerCase().includes(q);
  });

  const exportCsv = () => {
    const headers = ['Email', 'Name', 'Role', 'Referral Code', 'Balance', 'Total Deposited', 'Joined'];
    const rows = filtered.map((u) => [
      u.email, u.full_name ?? '', u.role, u.referral_code,
      formatCurrency(u.wallet?.balance ?? 0), formatCurrency(u.wallet?.total_deposited ?? 0),
      formatDate(u.created_at),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage all platform users.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Deposited</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name ?? '—'}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{u.role}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{u.referral_code}</TableCell>
                    <TableCell className="text-right">{formatCurrency(u.wallet?.balance ?? 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(u.wallet?.total_deposited ?? 0)}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(u.created_at)}</TableCell>
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
