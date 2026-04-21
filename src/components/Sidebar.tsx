'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const menuItems = [
  { label: 'Dashboard', href: '/', icon: IconGrid },
  { label: 'Transacciones', href: '/transactions', icon: IconArrows },
  { label: 'Cuentas', href: '/accounts', icon: IconCard },
  { label: 'Presupuesto', href: '/budget', icon: IconClock },
  { label: 'Inversiones', href: '/investments', icon: IconTrend },
  { label: 'Reportes', href: '/reports', icon: IconChart },
  { label: 'Configuración', href: '/settings', icon: IconGear },
];

function IconGrid({ active }: { active: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
}
function IconArrows({ active }: { active: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round"><path d="M17 3L21 7L17 11" /><path d="M21 7H9" /><path d="M7 21L3 17L7 13" /><path d="M3 17H15" /></svg>;
}
function IconCard({ active }: { active: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10H22" /></svg>;
}
function IconClock({ active }: { active: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 3V12L16.5 16.5" /></svg>;
}
function IconTrend({ active }: { active: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>;
}
function IconChart({ active }: { active: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20V14" /></svg>;
}
function IconGear({ active }: { active: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
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

interface SidebarProps {
  onNavigate?: () => void;
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
    <aside className="w-[220px] h-screen flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-sidebar-border">
        <div className="w-7 h-7 rounded bg-green-ghost flex items-center justify-center border border-[var(--border-accent)]">
          <span className="text-primary font-mono font-bold text-xs">$</span>
        </div>
        <span className="text-sm font-semibold tracking-tight font-mono">
          <span className="text-[#00ff41]">fin</span>
          <span className="text-muted-foreground">dash</span>
        </span>
      </div>

      {/* Greeting */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.14em] font-mono">{getGreeting()}</p>
        <p className="text-sm font-semibold text-foreground mt-1 truncate">{firstName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-1 px-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200',
                active
                  ? 'text-[#00ff41] bg-green-ghost'
                  : 'text-[#4a7a4a] hover:text-[#00ff41] hover:bg-green-ghost/50'
              )}
            >
              <item.icon active={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User card */}
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8 ring-1 ring-[var(--border-accent)]">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
            <AvatarFallback className="bg-green-ghost text-[#00ff41] text-[10px] font-mono font-bold">
              {initials.toLowerCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{fullName}</p>
            <p className="text-[10px] text-muted-foreground truncate font-mono">{email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
