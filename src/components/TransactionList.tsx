'use client';

import { useState } from 'react';
import type { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase-client';

const CATEGORY_LABELS: Record<string, string> = {
  salary: '💼 Sueldo', freelance: '💻 Freelance', food: '🍔 Comida',
  transport: '🚇 Transporte', entertainment: '🎬 Entretenimiento',
  bills: '💡 Cuentas', investment: '📈 Inversión', transfer: '⇄ Transferencia', other: '📌 Otro',
};

function formatCLP(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

const typeIcon: Record<string, string> = {
  income: '↑',
  expense: '↓',
  transfer: '⇄',
};

function getAccountLast4(name: string) {
  const match = name.match(/\*{0,4}(\d{4})/);
  return match ? match[1] : '';
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  async function saveNotes() {
    if (!selectedTx) return;
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      const sb = createClient();
      const { error } = await (sb as any)
        .from('transactions')
        .update({ notes: selectedTx.notes })
        .eq('id', selectedTx.id);
      if (error) throw error;
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setSavingNotes(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-[0.1em] text-muted-foreground font-mono">
            Últimas Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      tx.type === 'income'
                        ? 'bg-[rgba(0,255,65,0.08)] text-[#00ff41]'
                        : tx.type === 'expense'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-yellow-400/10 text-yellow-400'
                    }`}
                  >
                    {typeIcon[tx.type]}
                  </span>
                  <div>
                    <p className="text-sm text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {tx.bank.name}{tx.accountName ? ` · ****${getAccountLast4(tx.accountName)}` : ''} · {formatDate(tx.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`value-mono text-sm ${tx.amount >= 0 ? 'text-[#00ff41]' : 'text-[#ff3b3b]'}`}>
                    {tx.amount >= 0 ? '+' : ''}{formatCLP(tx.amount)}
                  </p>
                  {tx.status === 'pending' && (
                    <span className="text-[10px] uppercase tracking-wider text-yellow-400">
                      pendiente
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTx(null)} />
          <div
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid hsl(var(--border))' }}
          >
            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-foreground">Detalle</h2>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground border border-white/5"
                >
                  ✕
                </button>
              </div>

              {/* Amount hero */}
              <div className="text-center mb-6 py-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <p className={`text-3xl font-mono font-bold ${
                  selectedTx.amount >= 0 ? 'text-[#00ff41]' : 'text-[#ff3b3b]'
                }`}>
                  {selectedTx.amount >= 0 ? '+' : ''}{formatCLP(selectedTx.amount)}
                </p>
                <p className={`text-xs mt-2 uppercase tracking-widest ${
                  selectedTx.type === 'income' ? 'text-[#00ff41]' :
                  selectedTx.type === 'expense' ? 'text-[#ff3b3b]' : 'text-yellow-400'
                }`}>
                  {selectedTx.type === 'income' ? '↑ Ingreso' : selectedTx.type === 'expense' ? '↓ Gasto' : '⇄ Transferencia'}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Descripción</span>
                  <span className="text-sm text-foreground text-right max-w-[60%]">{selectedTx.description}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Categoría</span>
                  <span className="text-sm text-foreground">{CATEGORY_LABELS[selectedTx.category] || selectedTx.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Cuenta</span>
                  <span className="text-sm text-foreground">
                    {selectedTx.bank.name}{selectedTx.accountName ? ` · ****${getAccountLast4(selectedTx.accountName)}` : ''}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Fecha</span>
                  <span className="text-sm text-foreground">{formatDate(selectedTx.date)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Hora</span>
                  <span className="text-sm text-foreground">{formatTime(selectedTx.date)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Estado</span>
                  <span className={`text-sm ${selectedTx.status === 'completed' ? 'text-green-400' : selectedTx.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {selectedTx.status === 'completed' ? '✓ Completada' : selectedTx.status === 'pending' ? '◐ Pendiente' : '✗ Fallida'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">ID</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{selectedTx.id}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4">
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">📝 Notas / Observaciones</label>
                  <textarea
                    value={selectedTx.notes || ''}
                    onChange={e => setSelectedTx({ ...selectedTx, notes: e.target.value })}
                    placeholder="Ej: Compré pollo, arroz y verduras para la semana..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-transparent border border-white/10 focus:border-[#00ff41]/40 text-foreground placeholder:text-muted-foreground/30 outline-none transition-all resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={saveNotes}
                      disabled={savingNotes}
                      className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: savingNotes ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00ff41, #00cc33)',
                        color: '#0a0a1a',
                      }}
                    >
                      {notesSaved ? '✓ Guardado' : savingNotes ? 'Guardando...' : '💾 Guardar notas'}
                    </button>
                  </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-muted-foreground hover:text-foreground transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
