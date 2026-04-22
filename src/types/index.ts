// ============================================
// Tipos compartidos — Mock y DB usan las mismas interfaces
// ============================================

export interface Transaction {
  id: string;
  date: string; // ISO 8601
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: TransactionCategory;
  bank: Bank;
  status: 'completed' | 'pending' | 'failed';
  accountId?: string;
  accountName?: string;
}

export type TransactionCategory =
  | 'salary'
  | 'freelance'
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'bills'
  | 'investment'
  | 'transfer'
  | 'other';

export interface Bank {
  id: string;
  name: string;
  color: string;       // Color corporativo primario
  colorAlt: string;    // Color corporativo secundario
  logo?: string;       // URL del logo (placeholder por ahora)
}

export interface Account {
  id: string;
  name: string;
  bank: Bank;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: 'CLP' | 'USD';
  lastSync: string;    // ISO 8601
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // 0-100 percentage
  period: {
    from: string;
    to: string;
  };
}

export interface ChartDataPoint {
  label: string;
  income: number;
  expense: number;
  date: string;
}

export interface CategoryBreakdown {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  color: string;
}

// Respuesta genérica del hook — cambiar de mock a real es transparente
export interface UseTransactionsReturn {
  transactions: Transaction[];
  summary: DashboardSummary;
  accounts: Account[];
  chartData: ChartDataPoint[];
  categoryBreakdown: CategoryBreakdown[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
