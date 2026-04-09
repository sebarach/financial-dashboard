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
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-[var(--text-secondary)] text-xs tracking-widest uppercase">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="card-futuristic-static text-center max-w-md">
          <p className="text-red-400 text-lg mb-2">⚠️ Error</p>
          <p className="text-[var(--text-secondary)] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <header className="mb-6 sm:mb-10">
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
          <span className="glow-cyan text-[var(--cyan-accent)]">Financial</span>{' '}
          <span className="glow-magenta text-[var(--magenta-accent)]">Dashboard</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">
          {summary.period.from} → {summary.period.to} · Deep Space Edition
        </p>
      </header>

      {/* Summary — 2 cols mobile, 4 desktop */}
      <SummaryCards summary={summary} />

      {/* Chart + Categories — stacked mobile, 2/3 + 1/3 desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
        <div className="lg:col-span-2">
          <ChartSection data={chartData} />
        </div>
        <CategoryBreakdown breakdown={categoryBreakdown} />
      </div>

      {/* Accounts + Transactions — stacked mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
        <AccountsList accounts={accounts} />
        <div className="lg:col-span-2">
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </main>
  );
}
