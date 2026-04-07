// ============================================
// useTransactions — Custom Hook
// Fase 1: retorna datos mock
// Fase 2: cambiar la implementación interna por Supabase,
//          la UI no se entera.
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UseTransactionsReturn } from '@/types';

// === FASE 1: Importar datos mock ===
import {
  MOCK_TRANSACTIONS,
  MOCK_SUMMARY,
  MOCK_ACCOUNTS,
  MOCK_CHART_DATA,
  MOCK_CATEGORY_BREAKDOWN,
} from '@/constants/mockData';

// === FASE 2 (comentado): Descomentar cuando Supabase esté listo ===
// import { supabase } from '@/lib/supabase';
//
// async function fetchFromSupabase() {
//   const [txRes, accRes] = await Promise.all([
//     supabase.from('transactions').select('*, bank:banks(*)').order('date', { ascending: false }),
//     supabase.from('accounts').select('*, bank:banks(*)'),
//   ]);
//   if (txRes.error) throw txRes.error;
//   if (accRes.error) throw accRes.error;
//   return { transactions: txRes.data, accounts: accRes.data };
// }

export function useTransactions(): UseTransactionsReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado derivado de la fuente de datos
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [summary] = useState(MOCK_SUMMARY);
  const [accounts] = useState(MOCK_ACCOUNTS);
  const [chartData] = useState(MOCK_CHART_DATA);
  const [categoryBreakdown] = useState(MOCK_CATEGORY_BREAKDOWN);

  // Simula carga inicial (en Fase 2 será real)
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // === FASE 1: datos estáticos ===
      // Simula latencia de red
      await new Promise((r) => setTimeout(r, 400));
      setTransactions(MOCK_TRANSACTIONS);

      // === FASE 2: reemplazar por ===
      // const data = await fetchFromSupabase();
      // setTransactions(data.transactions);
      // setAccounts(data.accounts);
      // ... computar summary, chartData, categoryBreakdown desde los datos reales
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    transactions,
    summary,
    accounts,
    chartData,
    categoryBreakdown,
    isLoading,
    error,
    refetch: loadData,
  };
}
