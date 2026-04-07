'use client';

import type { ChartDataPoint } from '@/types';

function formatCLP(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

export function ChartSection({ data }: { data: ChartDataPoint[] }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);

  return (
    <div className="card-futuristic-static">
      <h2 className="text-sm uppercase tracking-widest text-[var(--text-secondary)] mb-4">
        Flujo Semanal
      </h2>
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((point) => (
          <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-1 h-36 w-full">
              {/* Income bar */}
              <div className="flex-1 flex flex-col justify-end">
                <div
                  className="rounded-t-sm bg-[var(--cyan-accent)]/80 transition-all duration-500"
                  style={{
                    height: `${(point.income / maxVal) * 100}%`,
                    minHeight: point.income > 0 ? '4px' : '0',
                    boxShadow: point.income > 0 ? '0 0 8px var(--cyan-glow)' : 'none',
                  }}
                />
              </div>
              {/* Expense bar */}
              <div className="flex-1 flex flex-col justify-end">
                <div
                  className="rounded-t-sm bg-[var(--magenta-accent)]/80 transition-all duration-500"
                  style={{
                    height: `${(point.expense / maxVal) * 100}%`,
                    minHeight: point.expense > 0 ? '4px' : '0',
                    boxShadow: point.expense > 0 ? '0 0 8px var(--magenta-glow)' : 'none',
                  }}
                />
              </div>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)]">{point.label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-[var(--cyan-accent)]/80" />
          <span className="text-xs text-[var(--text-secondary)]">Ingresos</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-[var(--magenta-accent)]/80" />
          <span className="text-xs text-[var(--text-secondary)]">Gastos</span>
        </div>
      </div>
    </div>
  );
}
