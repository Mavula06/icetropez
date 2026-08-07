'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationRow {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    setNotifications((data as NotificationRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unread.length === 0) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unread);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('All notifications marked as read.');
    load();
  };

  const variantMap: Record<NotificationRow['type'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
    info: 'secondary',
    success: 'default',
    warning: 'outline',
    error: 'destructive',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Stay up to date with your account activity.</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Inbox</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                  n.read ? 'bg-card' : 'bg-primary/5'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    <Badge variant={variantMap[n.type]} className="capitalize">{n.type}</Badge>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
