'use client';

import type { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

function getAccountLast4(name: string) {
  const match = name.match(/\*{0,4}(\d{4})/);
  return match ? match[1] : '';
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm uppercase tracking-[0.1em] text-muted-foreground font-mono">
          Últimas Transacciones
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    tx.type === 'income'
                      ? 'bg-[rgba(0,255,65,0.08)] text-[#00ff41]'
                      : tx.type === 'expense'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-yellow-400/10 text-yellow-400'
                  }`}
                >
                  {typeIcon[tx.type]}
                </span>
                <div>
                  <p className="text-sm text-foreground">{tx.description}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {tx.bank.name}{tx.accountName ? ` · ****${getAccountLast4(tx.accountName)}` : ''} · {formatDate(tx.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`value-mono text-sm ${tx.amount >= 0 ? 'text-[#00ff41]' : 'text-[#ff3b3b]'}`}>
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
      </CardContent>
    </Card>
  );
}
