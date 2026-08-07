'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

export function ContactSection() {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success('Thanks for reaching out. We will get back to you shortly.');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section id="contact" className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Contact</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Get in touch with our team
            </h2>
            <p className="text-muted-foreground">
              Have a question about a plan, a deposit, or your account? We are here to help.
            </p>
            <div className="space-y-4 pt-2">
              {[
                { icon: Mail, label: 'Email', value: 'support@icetropez.vest' },
                { icon: Phone, label: 'Phone', value: '+27 11 555 0100' },
                { icon: MapPin, label: 'Address', value: 'Sandton, Johannesburg, South Africa' },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-sm text-muted-foreground">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Jane Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Your message..." rows={4} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
