'use client';

import type { CategoryBreakdown as CategoryBreakdownType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm uppercase tracking-[0.1em] text-muted-foreground font-mono">
          Gastos por Categoría
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {breakdown.map((cat) => (
            <div key={cat.category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">{categoryLabels[cat.category] || cat.category}</span>
                <span className="text-muted-foreground font-mono">
                  {formatCLP(cat.amount)} · {cat.percentage}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
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
      </CardContent>
    </Card>
  );
}
