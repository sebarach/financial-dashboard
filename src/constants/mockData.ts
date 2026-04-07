// ============================================
// Datos Mock — Fase 1
// En Fase 2, este archivo se reemplaza por llamadas a Supabase
// ============================================

import type {
  Transaction,
  Bank,
  Account,
  DashboardSummary,
  ChartDataPoint,
  CategoryBreakdown,
} from '@/types';

// --- Bancos con colores corporativos integrados en estética futurista ---

export const BANKS: Bank[] = [
  {
    id: 'banco-chile',
    name: 'Banco de Chile',
    color: '#0033A0',      // Azul corporativo
    colorAlt: '#E4002B',   // Rojo corporativo
  },
  {
    id: 'bci',
    name: 'BCI',
    color: '#00A650',
    colorAlt: '#003D7C',
  },
  {
    id: 'santander',
    name: 'Santander',
    color: '#EC0000',
    colorAlt: '#FFFFFF',
  },
  {
    id: 'mercado-pago',
    name: 'Mercado Pago',
    color: '#009EE3',
    colorAlt: '#FFD100',
  },
];

// --- Cuentas ---

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    bank: BANKS[0],
    accountType: 'checking',
    balance: 1845000,
    currency: 'CLP',
    lastSync: '2026-04-07T20:00:00Z',
  },
  {
    id: 'acc-2',
    bank: BANKS[0],
    accountType: 'savings',
    balance: 3200000,
    currency: 'CLP',
    lastSync: '2026-04-07T20:00:00Z',
  },
  {
    id: 'acc-3',
    bank: BANKS[1],
    accountType: 'checking',
    balance: 920000,
    currency: 'CLP',
    lastSync: '2026-04-07T19:30:00Z',
  },
  {
    id: 'acc-4',
    bank: BANKS[3],
    accountType: 'savings',
    balance: 450000,
    currency: 'CLP',
    lastSync: '2026-04-07T18:00:00Z',
  },
];

// --- Transacciones ---

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    date: '2026-04-07T09:00:00Z',
    description: 'Sueldo Marzo 2026',
    amount: 2500000,
    type: 'income',
    category: 'salary',
    bank: BANKS[0],
    status: 'completed',
  },
  {
    id: 'tx-002',
    date: '2026-04-07T10:30:00Z',
    description: 'Pago freelance - Dashboard React',
    amount: 800000,
    type: 'income',
    category: 'freelance',
    bank: BANKS[1],
    status: 'completed',
  },
  {
    id: 'tx-003',
    date: '2026-04-06T14:00:00Z',
    description: 'Supermercado Líder',
    amount: -85000,
    type: 'expense',
    category: 'food',
    bank: BANKS[0],
    status: 'completed',
  },
  {
    id: 'tx-004',
    date: '2026-04-06T08:00:00Z',
    description: 'Metro Bip! recarga',
    amount: -20000,
    type: 'expense',
    category: 'transport',
    bank: BANKS[3],
    status: 'completed',
  },
  {
    id: 'tx-005',
    date: '2026-04-05T22:00:00Z',
    description: 'Netflix',
    amount: -11990,
    type: 'expense',
    category: 'entertainment',
    bank: BANKS[0],
    status: 'completed',
  },
  {
    id: 'tx-006',
    date: '2026-04-05T10:00:00Z',
    description: 'Cuenta luz abril',
    amount: -45000,
    type: 'expense',
    category: 'bills',
    bank: BANKS[0],
    status: 'pending',
  },
  {
    id: 'tx-007',
    date: '2026-04-04T16:00:00Z',
    description: 'Transferencia a ahorro',
    amount: -500000,
    type: 'transfer',
    category: 'transfer',
    bank: BANKS[0],
    status: 'completed',
  },
  {
    id: 'tx-008',
    date: '2026-04-04T09:00:00Z',
    description: 'ETF IWV compra',
    amount: -200000,
    type: 'expense',
    category: 'investment',
    bank: BANKS[1],
    status: 'completed',
  },
  {
    id: 'tx-009',
    date: '2026-04-03T12:00:00Z',
    description: 'Pago freelance - API REST',
    amount: 600000,
    type: 'income',
    category: 'freelance',
    bank: BANKS[3],
    status: 'completed',
  },
  {
    id: 'tx-010',
    date: '2026-04-02T19:00:00Z',
    description: 'Uber Eats sushi',
    amount: -32000,
    type: 'expense',
    category: 'food',
    bank: BANKS[3],
    status: 'completed',
  },
];

// --- Resumen del Dashboard ---

export const MOCK_SUMMARY: DashboardSummary = {
  totalBalance: 6415000,
  totalIncome: 3900000,
  totalExpenses: 393990,
  netSavings: 3506010,
  savingsRate: 89.8,
  period: {
    from: '2026-04-01',
    to: '2026-04-07',
  },
};

// --- Datos para Gráficos ---

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { label: 'Lun 1', income: 0, expense: 0, date: '2026-04-01' },
  { label: 'Mar 2', income: 0, expense: 32000, date: '2026-04-02' },
  { label: 'Mié 3', income: 600000, expense: 0, date: '2026-04-03' },
  { label: 'Jue 4', income: 0, expense: 700000, date: '2026-04-04' },
  { label: 'Vie 5', income: 0, expense: 56990, date: '2026-04-05' },
  { label: 'Sáb 6', income: 0, expense: 105000, date: '2026-04-06' },
  { label: 'Dom 7', income: 3300000, expense: 0, date: '2026-04-07' },
];

// --- Desglose por Categoría ---

export const MOCK_CATEGORY_BREAKDOWN: CategoryBreakdown[] = [
  { category: 'food', amount: 117000, percentage: 29.7, color: '#FF6B6B' },
  { category: 'bills', amount: 45000, percentage: 11.4, color: '#4ECDC4' },
  { category: 'entertainment', amount: 11990, percentage: 3.0, color: '#A78BFA' },
  { category: 'transport', amount: 20000, percentage: 5.1, color: '#F59E0B' },
  { category: 'investment', amount: 200000, percentage: 50.8, color: '#06B6D4' },
];
