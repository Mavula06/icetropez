import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardMobileNav } from '@/components/dashboard/dashboard-mobile-nav';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) redirect('/auth/login');

  return (
    <div className="flex min-h-screen bg-muted/20">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Welcome back, <span className="text-foreground">{profile.full_name ?? profile.email}</span>
            </span>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
        <DashboardMobileNav />
      </div>
    </div>
  );
}
