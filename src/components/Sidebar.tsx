'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { label: 'Dashboard', href: '/', icon: '◈' },
  { label: 'Transacciones', href: '/transactions', icon: '⇄' },
  { label: 'Cuentas', href: '/accounts', icon: '◫' },
  { label: 'Presupuesto', href: '/budget', icon: '◉' },
  { label: 'Inversiones', href: '/investments', icon: '📈' },
  { label: 'Reportes', href: '/reports', icon: '▤' },
  { label: 'Configuración', href: '/settings', icon: '⚙' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[220px]'
      }`}
      style={{
        background: 'linear-gradient(180deg, #0d0d24 0%, #0a0a1a 100%)',
        borderRight: '1px solid rgba(0, 240, 255, 0.08)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-white/5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold"
          style={{
            background: 'linear-gradient(135deg, var(--cyan-accent), var(--magenta-accent))',
            color: '#0a0a1a',
          }}
        >
          ◆
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-wide text-[var(--text-primary)] whitespace-nowrap">
            FinDash
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                active
                  ? 'text-[var(--cyan-accent)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              style={
                active
                  ? {
                      background: 'rgba(0, 240, 255, 0.08)',
                      boxShadow: '0 0 12px rgba(0, 240, 255, 0.1)',
                    }
                  : undefined
              }
            >
              <span className={`text-base ${active ? 'glow-cyan' : ''}`}>{item.icon}</span>
              {!collapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-4 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--cyan-accent)] transition-colors border border-white/5 hover:border-[var(--cyan-accent)]/20"
      >
        {collapsed ? '→ Expandir' : '← Colapsar'}
      </button>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--cyan-accent)] to-[var(--magenta-accent)] flex items-center justify-center text-xs font-bold text-[#0a0a1a]">
            SS
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">Sebastián S.</p>
              <p className="text-[10px] text-[var(--text-secondary)]">Plan Pro ✨</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
