'use client';

import type { Account } from '@/types';
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

export function AccountsList({ accounts }: { accounts: Account[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm uppercase tracking-[0.1em] text-muted-foreground font-mono">
          Cuentas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {accounts.map((acc) => (
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
                  {typeLabels[acc.accountType]}
                </p>
              </div>
              <p className="value-mono text-sm text-foreground">
                {formatCLP(acc.balance)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
