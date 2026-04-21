'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    const basePath = process.env.NODE_ENV === 'production' ? '/financial-dashboard' : '';
    if (!user && pathname !== '/auth' && !pathname.startsWith('/auth/')) {
      window.location.href = `${basePath}/auth/`;
    } else if (user && (pathname === '/auth' || pathname.startsWith('/auth/'))) {
      window.location.href = `${basePath}/`;
    }
  }, [user, isLoading, pathname]);

  if (pathname === '/auth' || pathname.startsWith('/auth/')) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="skeleton-matrix size-8 rounded-full" style={{ animation: 'pulse-subtle 1.2s ease-in-out infinite' }} />
      </div>
    );
  }

  if (!user) return null;

  return <AppLayout>{children}</AppLayout>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/financial-dashboard/sw.js').catch(() => {});
    }
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const meta = user?.user_metadata || {};
  const fullName = meta.full_name || meta.name || user?.email?.split('@')[0] || 'Usuario';
  const avatarUrl = meta.avatar_url || meta.picture;
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <>
      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="fixed top-0 left-0 h-screen z-30">
          <Sidebar onNavigate={() => setOpen(false)} />
        </div>
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <header
          className="fixed top-0 left-0 right-0 h-12 z-50 flex items-center justify-between px-4 bg-background/95 backdrop-blur-sm border-b border-border"
        >
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={(props) => <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" {...props} />}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 12H21M3 6H21M3 18H21" />
              </svg>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[220px] bg-sidebar border-sidebar-border">
              <SheetTitle className="sr-only">Navegación</SheetTitle>
              <Sidebar onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <span className="text-sm font-semibold tracking-tight font-mono">
            <span className="text-[#00ff41]">fin</span>
            <span className="text-muted-foreground">dash</span>
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="rounded-full"
            title={`Logout (${fullName})`}
          >
            <Avatar className="size-7 border border-[var(--border-accent)]">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
              <AvatarFallback className="bg-green-ghost text-primary text-[9px] font-mono font-bold">
                {initials.toLowerCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </header>
      )}

      {/* Main content */}
      <div className={`${isMobile ? 'mt-12' : 'md:ml-[220px]'} transition-all duration-300`}>
        {children}
      </div>
    </>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  );
}
