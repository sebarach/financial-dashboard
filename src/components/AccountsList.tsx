'use client';

import type { Account, Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatCLP(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

const typeLabels: Record<string, string> = {
  checking: 'Cuenta Corriente',
  savings: 'Caja de Ahorro',
  credit: 'Tarjeta de Crédito',
  investment: 'Inversión',
};

function computeAccountBalance(account: Account, transactions: Transaction[]): number {
  const accTx = transactions.filter(t => {
    // Match by account id stored in the raw transaction
    return false; // fallback to static balance
  });
  return account.balance;
}

export function AccountsList({ accounts, transactions = [] }: { accounts: Account[]; transactions?: Transaction[] }) {
  const totalBalance = accounts.reduce((s, a) => {
    if (a.accountType === 'credit') return s - Math.abs(a.balance);
    return s + a.balance;
  }, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm uppercase tracking-[0.1em] text-muted-foreground font-mono">
            Cuentas
          </CardTitle>
          <p className="text-xs text-muted-foreground font-mono">
            Total: <span className={totalBalance >= 0 ? 'text-[#00ff41]' : 'text-red-500'}>{formatCLP(totalBalance)}</span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {accounts.map((acc) => {
            const isCredit = acc.accountType === 'credit';
            const displayBalance = isCredit ? -Math.abs(acc.balance) : acc.balance;
            const balanceColor = isCredit
              ? (acc.balance > 0 ? 'text-red-400' : 'text-[#00ff41]')
              : (acc.balance >= 0 ? 'text-[#00ff41]' : 'text-red-400');

            return (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${acc.bank.color}22, transparent)`,
                  borderLeft: `3px solid ${acc.bank.color}`,
                }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: acc.bank.color }}>
                    {acc.bank.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {typeLabels[acc.accountType]}{acc.name ? ` · ${acc.name}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`value-mono text-sm font-semibold ${balanceColor}`}>
                    {isCredit ? '-' : ''}{formatCLP(Math.abs(acc.balance))}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {isCredit ? 'deuda' : 'saldo'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
