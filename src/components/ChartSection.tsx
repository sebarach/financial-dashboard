'use client';

import type { ChartDataPoint } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ChartSection({ data }: { data: ChartDataPoint[] }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm uppercase tracking-[0.1em] text-muted-foreground font-mono">
          Flujo Semanal
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end justify-between gap-2 h-48">
          {data.map((point) => (
            <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-end gap-1 h-36 w-full">
                <div className="flex-1 flex flex-col justify-end">
                  <div
                    className="rounded-t-sm bg-primary/80 transition-all duration-500"
                    style={{
                      height: `${(point.income / maxVal) * 100}%`,
                      minHeight: point.income > 0 ? '4px' : '0',
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <div
                    className="rounded-t-sm bg-destructive/80 transition-all duration-500"
                    style={{
                      height: `${(point.expense / maxVal) * 100}%`,
                      minHeight: point.expense > 0 ? '4px' : '0',
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">{point.label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary/80" />
            <span className="text-xs text-muted-foreground">Ingresos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-destructive/80" />
            <span className="text-xs text-muted-foreground">Gastos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
