'use client';

import type { DashboardSummary } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

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
      type: 'neutral' as const,
      symbol: '█',
    },
    {
      label: 'Ingresos',
      value: formatCLP(summary.totalIncome),
      type: 'positive' as const,
      symbol: '▲',
    },
    {
      label: 'Gastos',
      value: formatCLP(summary.totalExpenses),
      type: 'negative' as const,
      symbol: '▼',
    },
    {
      label: 'Tasa de Ahorro',
      value: `${summary.savingsRate}%`,
      type: 'neutral' as const,
      symbol: '◆',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger">
      {cards.map((card) => (
        <Card key={card.label} className="card-glow transition-all duration-300 border-border hover:border-[var(--border-accent)]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-mono">
                {card.label}
              </p>
              <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono ${
                card.type === 'positive' ? 'text-[#00ff41] bg-green-ghost' :
                card.type === 'negative' ? 'text-[#ff3b3b] bg-red-500/10' :
                'text-[#00ff41] bg-green-ghost'
              }`}>
                {card.symbol}
              </span>
            </div>
            <p className={`value-mono text-lg sm:text-xl font-bold ${
              card.type === 'positive' ? 'text-[#00ff41]' :
              card.type === 'negative' ? 'text-[#ff3b3b]' :
              'text-[#00ff41]'
            }`}>
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
