'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { label: 'Dashboard', href: '/', icon: '◈' },
  { label: 'Transacciones', href: '/transactions', icon: '⇄' },
  { label: 'Cuentas', href: '/accounts', icon: '◫' },
  { label: 'Bancos', href: '/banks', icon: '🏛' },
  { label: 'Presupuesto', href: '/budget', icon: '◉' },
  { label: 'Inversiones', href: '/investments', icon: '📈' },
  { label: 'Reportes', href: '/reports', icon: '▤' },
  { label: 'Configuración', href: '/settings', icon: '⚙' },
];

interface SidebarProps {
  onNavigate?: () => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function getFirstName(name?: string): string {
  if (!name) return '';
  return name.split(' ')[0];
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const meta = user?.user_metadata || {};
  const fullName = meta.full_name || meta.name || user?.email?.split('@')[0] || 'Usuario';
  const avatarUrl = meta.avatar_url || meta.picture;
  const email = user?.email || '';
  const firstName = getFirstName(fullName);
  const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <aside
      className="w-[220px] h-screen flex flex-col"
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
        <span className="text-sm font-semibold tracking-wide text-[var(--text-primary)] whitespace-nowrap">
          FinDash
        </span>
      </div>

      {/* Greeting */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">{getGreeting()}</p>
        <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5 truncate">{firstName} ✨</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-1 px-2 overflow-y-auto">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
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
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <div className="flex items-center gap-2.5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[var(--cyan-accent)]/30"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--cyan-accent)] to-[var(--magenta-accent)] flex items-center justify-center text-xs font-bold text-[#0a0a1a] ring-2 ring-[var(--cyan-accent)]/30">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--text-primary)] truncate">{fullName}</p>
            <p className="text-[10px] text-[var(--text-secondary)] truncate">{email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
