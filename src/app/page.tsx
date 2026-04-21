'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { SummaryCards } from '@/components/SummaryCards';
import { AccountsList } from '@/components/AccountsList';
import { TransactionList } from '@/components/TransactionList';
import { ChartSection } from '@/components/ChartSection';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    transactions,
    summary,
    accounts,
    chartData,
    categoryBreakdown,
    isLoading,
    error,
  } = useTransactions(user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="skeleton w-10 h-10 mx-auto rounded-full" style={{ animation: 'pulse-subtle 1.2s ease-in-out infinite' }} />
          <p className="text-muted-foreground text-[10px] tracking-[0.14em] uppercase font-mono">
            loading...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="py-4 px-4 rounded-xl bg-card border border-border backdrop-blur-sm text-center max-w-md">
          <p className="text-destructive text-lg font-mono mb-2">{'>'} error</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const meta = user?.user_metadata || {};
  const fullName = meta.full_name || meta.name || '';
  const firstName = fullName ? fullName.split(' ')[0] : '';

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 scanline-overlay" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      {/* Header */}
      <header className="mb-8 sm:mb-12">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] font-mono mb-1.5">
          {'>'} {dateStr}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {firstName ? (
            <>{getGreeting()}, <span className="text-matrix">{firstName}</span></>
          ) : (
            <><span className="text-matrix">fin</span><span className="text-muted-foreground">dash</span></>
          )}
        </h1>
        <p className="text-muted-foreground text-xs mt-1 font-mono">
          {summary.period.from} → {summary.period.to}
        </p>
      </header>

      {/* Summary */}
      <SummaryCards summary={summary} />

      {/* Chart + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <div className="lg:col-span-2">
          <ChartSection data={chartData} />
        </div>
        <CategoryBreakdown breakdown={categoryBreakdown} />
      </div>

      {/* Accounts + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <AccountsList accounts={accounts} />
        <div className="lg:col-span-2">
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </main>
  );
}
