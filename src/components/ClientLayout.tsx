'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="skeleton w-8 h-8 rounded-full" style={{ animation: 'pulse-subtle 1.2s ease-in-out infinite' }} />
      </div>
    );
  }

  if (!user) return null;

  return <AppLayout>{children}</AppLayout>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
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
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
        </div>
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <header
          className="fixed top-0 left-0 right-0 h-12 z-50 flex items-center justify-between px-4"
          style={{
            background: 'rgba(2, 2, 2, 0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--green-bright)] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 12H21M3 6H21M3 18H21" />
            </svg>
          </button>
          <span className="text-sm font-semibold tracking-tight font-mono">
            <span className="text-[var(--green-bright)]">fin</span>
            <span className="text-[var(--text-secondary)]">dash</span>
          </span>
          <button
            onClick={signOut}
            className="w-7 h-7 rounded-full overflow-hidden border border-[var(--border-accent)] flex-shrink-0"
            title={`Logout (${fullName})`}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-[var(--green-ghost)] flex items-center justify-center text-[9px] font-bold text-[var(--green-bright)] font-mono">
                {initials.toLowerCase()}
              </div>
            )}
          </button>
        </header>
      )}

      {/* Mobile drawer overlay */}
      {isMobile && drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      {isMobile && (
        <div
          className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-out ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
        </div>
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
