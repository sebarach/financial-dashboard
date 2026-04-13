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
      accent: 'gold',
      icon: '⬡',
    },
    {
      label: 'Ingresos',
      value: formatCLP(summary.totalIncome),
      accent: 'emerald',
      icon: '↗',
    },
    {
      label: 'Gastos',
      value: formatCLP(summary.totalExpenses),
      accent: 'rose',
      icon: '↘',
    },
    {
      label: 'Tasa de Ahorro',
      value: `${summary.savingsRate}%`,
      accent: 'gold',
      icon: '◈',
    },
  ];

  const accentMap: Record<string, string> = {
    gold: 'text-gold',
    emerald: 'text-emerald',
    rose: 'text-rose',
  };

  const iconBgMap: Record<string, string> = {
    gold: 'bg-[var(--accent-gold-dim)]',
    emerald: 'bg-emerald-500/10',
    rose: 'bg-rose-500/10',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger">
      {cards.map((card) => (
        <div key={card.label} className="card group cursor-default">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-secondary)] font-medium">
              {card.label}
            </p>
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${iconBgMap[card.accent]} ${accentMap[card.accent]} transition-transform duration-300 group-hover:scale-110`}>
              {card.icon}
            </span>
          </div>
          <p className={`value-mono text-lg sm:text-xl font-bold ${accentMap[card.accent]}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
