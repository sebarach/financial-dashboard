'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Register SW
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/financial-dashboard/sw.js').catch(() => {});
    }
    // Mobile detection
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <>
      {/* Mobile top bar */}
      {isMobile && (
        <header
          className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4"
          style={{
            background: 'rgba(10, 10, 26, 0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(0, 240, 255, 0.08)',
          }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--cyan-accent)] text-xl"
          >
            ☰
          </button>
          <span className="text-sm font-semibold tracking-wide">
            <span className="text-[var(--cyan-accent)]">Fin</span>
            <span className="text-[var(--magenta-accent)]">Dash</span>
          </span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--cyan-accent)] to-[var(--magenta-accent)] flex items-center justify-center text-[10px] font-bold text-[#0a0a1a]">
            SS
          </div>
        </header>
      )}

      {/* Mobile drawer overlay */}
      {isMobile && drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar — always visible on desktop, drawer on mobile */}
      <div
        className={
          isMobile
            ? `fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${
                drawerOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : ''
        }
      >
        <Sidebar onNavigate={() => setDrawerOpen(false)} />
      </div>

      {/* Main content */}
      <div className={`${isMobile ? 'mt-14' : 'md:ml-[220px]'} transition-all duration-300`}>
        {children}
      </div>
    </>
  );
}
