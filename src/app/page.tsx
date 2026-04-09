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

  const meta = user?.user_metadata || {};
  const fullName = meta.full_name || meta.name || '';
  const firstName = fullName ? fullName.split(' ')[0] : '';
  const avatarUrl = meta.avatar_url || meta.picture;

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <header className="mb-6 sm:mb-10">
        <div className="flex items-center gap-3 sm:gap-4">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-[var(--cyan-accent)]/20 hidden sm:block"
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest">
              {firstName ? `${getGreeting()},` : 'Deep Space Edition'}
            </p>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
              {firstName ? (
                <>
                  <span className="glow-cyan text-[var(--cyan-accent)]">{firstName}</span>
                  <span className="text-[var(--text-secondary)] text-lg sm:text-xl ml-2 font-normal">✨</span>
                </>
              ) : (
                <>
                  <span className="glow-cyan text-[var(--cyan-accent)]">Financial</span>{' '}
                  <span className="glow-magenta text-[var(--magenta-accent)]">Dashboard</span>
                </>
              )}
            </h1>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-0.5">
              {summary.period.from} → {summary.period.to}
            </p>
          </div>
        </div>
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
