'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { announcementSchema, type AnnouncementInput } from '@/lib/validation';
import { formatDate } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

interface Announcement {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminAnnouncementsPage() {
  const supabase = createClient();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors },
  } = useForm<AnnouncementInput>({ resolver: zodResolver(announcementSchema) });

  const isActive = watch('is_active');

  const load = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements((data as Announcement[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', message: '', is_active: true });
    setOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    reset({ title: a.title, message: a.message, is_active: a.is_active });
    setOpen(true);
  };

  const onSubmit = async (values: AnnouncementInput) => {
    setSubmitting(true);
    if (editing) {
      const res = await fetch('/api/admin/announcements', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId: editing.id, ...values }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); setSubmitting(false); return; }
      toast.success('Announcement updated.');
    } else {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); setSubmitting(false); return; }
      toast.success('Announcement created.');
    }
    setSubmitting(false);
    setOpen(false);
    load();
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    const res = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
    if (!res.ok) { toast.error('Failed to delete'); return; }
    toast.success('Announcement deleted.');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-sm text-muted-foreground">Publish site-wide announcements for users.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New announcement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit announcement' : 'New announcement'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={4} {...register('message')} />
                {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
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

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{a.title}</h3>
                      <Badge variant={a.is_active ? 'default' : 'secondary'}>{a.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{formatDate(a.created_at)}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => openEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteAnnouncement(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
