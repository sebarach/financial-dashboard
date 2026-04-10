// ============================================
// useTransactions — FASE 2: Datos reales desde Supabase
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import type { UseTransactionsReturn, Transaction, Account, DashboardSummary, ChartDataPoint, CategoryBreakdown } from '@/types';

function formatCLP(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

export function useTransactions(userId: string | undefined): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalBalance: 0, totalIncome: 0, totalExpenses: 0, netSavings: 0, savingsRate: 0,
    period: { from: '', to: '' },
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    // Current month range
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).toISOString().slice(0, 10);
    const lastDay = new Date(year, month + 1, 0).toISOString().slice(0, 10);

    try {
      // Fetch current-month transactions with joins
      const { data: txData, error: txErr } = await supabase
        .from('transactions')
        .select('*, category:categories(*), account:accounts(bank:banks(*))')
        .eq('user_id', userId)
        .gte('transaction_date', firstDay)
        .lte('transaction_date', lastDay)
        .order('transaction_date', { ascending: false });

      if (txErr) throw txErr;

      // Fetch accounts with banks
      const { data: accData, error: accErr } = await supabase
        .from('accounts')
        .select('*, bank:banks(*)')
        .eq('is_active', true)
        .eq('user_id', userId);

      if (accErr) throw accErr;

      // Map transactions
      const mappedTx: Transaction[] = (txData || []).map((tx: any) => ({
        id: tx.id,
        date: tx.transaction_date,
        description: tx.description,
        amount: tx.amount,
        type: tx.type,
        category: tx.category?.slug || 'other',
        bank: tx.account?.bank ? {
          id: tx.account.bank.id,
          name: tx.account.bank.name,
          color: tx.account.bank.color,
          colorAlt: tx.account.bank.color_alt,
        } : { id: '', name: '', color: '#666', colorAlt: '#333' },
        status: tx.status,
      }));

      // Map accounts
      const mappedAcc: Account[] = (accData || []).map((acc: any) => ({
        id: acc.id,
        bank: acc.bank ? {
          id: acc.bank.id,
          name: acc.bank.name,
          color: acc.bank.color,
          colorAlt: acc.bank.color_alt,
        } : { id: '', name: '', color: '#666', colorAlt: '#333' },
        accountType: acc.account_type,
        balance: acc.balance,
        currency: acc.currency,
        lastSync: acc.last_sync,
      }));

      setTransactions(mappedTx);
      setAccounts(mappedAcc);

      // Compute summary
      const totalBalance = mappedAcc.reduce((s, a) => s + a.balance, 0);
      const totalIncome = mappedTx.filter(t => t.type === 'income' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
      const totalExpenses = mappedTx.filter(t => t.type === 'expense' && t.status === 'completed').reduce((s, t) => s + Math.abs(t.amount), 0);
      const netSavings = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 1000) / 10 : 0;

      setSummary({
        totalBalance,
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate,
        period: { from: firstDay, to: lastDay },
      });

      // Compute chart data (daily for current month)
      const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const days: ChartDataPoint[] = [];
      for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayLabel = dayLabels[new Date(dateStr + 'T12:00:00').getDay()];
        const dayTx = mappedTx.filter(t => t.date.startsWith(dateStr));
        days.push({
          label: `${dayLabel} ${d}`,
          income: dayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
          expense: dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0),
          date: dateStr,
        });
      }
      setChartData(days);

      // Compute category breakdown (expenses only)
      const catMap = new Map<string, { amount: number; slug: string; color: string }>();
      const catColors: Record<string, string> = {
        food: '#FF6B6B', transport: '#F59E0B', entertainment: '#A78BFA',
        bills: '#4ECDC4', investment: '#06B6D4', other: '#9CA3AF',
      };
      mappedTx
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .forEach(t => {
          const slug = t.category;
          const prev = catMap.get(slug) || { amount: 0, slug, color: catColors[slug] || '#9CA3AF' };
          prev.amount += Math.abs(t.amount);
          catMap.set(slug, prev);
        });

      const totalExp = [...catMap.values()].reduce((s, c) => s + c.amount, 0);
      const breakdown: CategoryBreakdown[] = [...catMap.values()]
        .sort((a, b) => b.amount - a.amount)
        .map(c => ({
          category: c.slug as any,
          amount: c.amount,
          percentage: totalExp > 0 ? Math.round((c.amount / totalExp) * 1000) / 10 : 0,
          color: c.color,
        }));
      setCategoryBreakdown(breakdown);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { if (userId) loadData(); }, [loadData, userId]);

  return { transactions, summary, accounts, chartData, categoryBreakdown, isLoading, error, refetch: loadData };
}
