'use client';

import type { CategoryBreakdown as CategoryBreakdownType } from '@/types';

const categoryLabels: Record<string, string> = {
  food: '🍔 Comida',
  transport: '🚇 Transporte',
  entertainment: '🎬 Entretenimiento',
  bills: '💡 Cuentas',
  investment: '📈 Inversión',
  transfer: '⇄ Transferencia',
  salary: '💼 Sueldo',
  freelance: '💻 Freelance',
  other: '📌 Otro',
};

function formatCLP(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

export function CategoryBreakdown({ breakdown }: { breakdown: CategoryBreakdownType[] }) {
  return (
    <div className="card-static">
      <h2 className="text-sm uppercase tracking-widest text-[var(--text-secondary)] mb-4">
        Gastos por Categoría
      </h2>
      <div className="space-y-3">
        {breakdown.map((cat) => (
          <div key={cat.category}>
            <div className="flex justify-between text-sm mb-1">
              <span>{categoryLabels[cat.category] || cat.category}</span>
              <span className="text-[var(--text-secondary)]">
                {formatCLP(cat.amount)} · {cat.percentage}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${cat.percentage}%`,
                  background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
                  boxShadow: `0 0 8px ${cat.color}44`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
