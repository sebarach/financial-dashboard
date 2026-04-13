'use client';

import type { Account } from '@/types';

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
    <div className="card-static">
      <h2 className="text-sm uppercase tracking-widest text-[var(--text-secondary)] mb-4">
        Cuentas
      </h2>
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
              <p className="text-xs text-[var(--text-secondary)]">
                {typeLabels[acc.accountType]}
              </p>
            </div>
            <p className="font-mono text-sm text-[var(--text-primary)]">
              {formatCLP(acc.balance)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
