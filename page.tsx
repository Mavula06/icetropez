'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AuditLogRow {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor: { email: string; full_name: string | null } | { email: string; full_name: string | null }[] | null;
}

export default function AdminAuditLogsPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*, actor:profiles(email, full_name)')
        .order('created_at', { ascending: false })
        .limit(100);
      setLogs((data as unknown as AuditLogRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const exportCsv = () => {
    const headers = ['Date', 'Actor', 'Action', 'Entity', 'Entity ID', 'Metadata'];
    const rows = logs.map((l) => {
      const actorVal = Array.isArray(l.actor) ? l.actor[0]?.email ?? '' : l.actor?.email ?? '';
      return [
        formatDateTime(l.created_at), actorVal, l.action, l.entity,
        l.entity_id ?? '', l.metadata ? JSON.stringify(l.metadata) : '',
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">Immutable record of all admin actions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={logs.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit logs yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => {
                  const actorVal = Array.isArray(l.actor) ? l.actor[0]?.email ?? '' : l.actor?.email ?? '';
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="whitespace-nowrap text-xs">{formatDateTime(l.created_at)}</TableCell>
                      <TableCell className="text-sm">{actorVal}</TableCell>
                      <TableCell><Badge variant="secondary" className="font-mono text-xs">{l.action}</Badge></TableCell>
                      <TableCell className="text-sm">{l.entity}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{l.entity_id?.slice(0, 8) ?? '—'}</TableCell>
                      <TableCell className="max-w-xs truncate font-mono text-xs text-muted-foreground">
                        {l.metadata ? JSON.stringify(l.metadata).slice(0, 80) : '—'}
                      </TableCell>
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
