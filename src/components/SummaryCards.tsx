'use client';

import type { DashboardSummary } from '@/types';

function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  const cards = [
    {
      label: 'Balance Total',
      value: formatCLP(summary.totalBalance),
      accent: 'cyan',
    },
    {
      label: 'Ingresos',
      value: formatCLP(summary.totalIncome),
      accent: 'cyan',
    },
    {
      label: 'Gastos',
      value: formatCLP(summary.totalExpenses),
      accent: 'magenta',
    },
    {
      label: 'Tasa de Ahorro',
      value: `${summary.savingsRate}%`,
      accent: 'cyan',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="card-futuristic">
          <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">
            {card.label}
          </p>
          <p
            className={`text-xl font-bold ${
              card.accent === 'cyan' ? 'text-[var(--cyan-accent)] glow-cyan' : 'text-[var(--magenta-accent)] glow-magenta'
            }`}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
