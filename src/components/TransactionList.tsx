'use client';

import type { Transaction } from '@/types';

function formatCLP(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
}

const typeIcon: Record<string, string> = {
  income: '↑',
  expense: '↓',
  transfer: '⇄',
};

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="card-static">
      <h2 className="text-sm uppercase tracking-widest text-[var(--text-secondary)] mb-4">
        Últimas Transacciones
      </h2>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  tx.type === 'income'
                    ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]'
                    : tx.type === 'expense'
                    ? 'bg-[var(--accent-rose)]/10 text-[var(--accent-rose)]'
                    : 'bg-yellow-400/10 text-yellow-400'
                }`}
              >
                {typeIcon[tx.type]}
              </span>
              <div>
                <p className="text-sm">{tx.description}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {tx.bank.name} · {formatDate(tx.date)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-mono text-sm ${
                  tx.amount >= 0 ? 'text-[var(--accent-gold)]' : 'text-[var(--accent-rose)]'
                }`}
              >
                {tx.amount >= 0 ? '+' : ''}{formatCLP(tx.amount)}
              </p>
              {tx.status === 'pending' && (
                <span className="text-[10px] uppercase tracking-wider text-yellow-400">
                  pendiente
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
