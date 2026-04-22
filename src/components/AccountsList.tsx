'use client';

import { useState } from 'react';
import type { Account, Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase-client';

function formatCLP(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

const typeLabels: Record<string, string> = {
  checking: 'Cuenta Corriente',
  savings: 'Caja de Ahorro',
  credit: 'Tarjeta de Crédito',
  investment: 'Inversión',
};

export function AccountsList({ accounts, transactions = [], onBalanceUpdate }: { accounts: Account[]; transactions?: Transaction[]; onBalanceUpdate?: () => void }) {
  const [editing, setEditing] = useState<Account | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalBalance = accounts.reduce((s, a) => {
    if (a.accountType === 'credit') return s - Math.abs(a.balance);
    return s + a.balance;
  }, 0);

  function openEdit(acc: Account) {
    if (acc.accountType === 'credit') return; // credit balance is computed from transactions
    setEditing(acc);
    setEditValue(String(acc.balance));
    setSaved(false);
  }

  async function saveBalance() {
    if (!editing) return;
    setSaving(true);
    try {
      const sb = createClient();
      const { error } = await (sb as any)
        .from('accounts')
        .update({ balance: parseInt(editValue) || 0 })
        .eq('id', editing.id);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => {
        setEditing(null);
        onBalanceUpdate?.();
      }, 800);
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-muted-foreground font-mono">
              Cuentas
            </CardTitle>
            <p className="text-xs text-muted-foreground font-mono">
              Total: <span className={totalBalance >= 0 ? 'text-[#00ff41]' : 'text-red-500'}>{formatCLP(totalBalance)}</span>
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {accounts.map((acc) => {
              const isCredit = acc.accountType === 'credit';
              const balanceColor = isCredit
                ? (acc.balance > 0 ? 'text-red-400' : 'text-[#00ff41]')
                : (acc.balance >= 0 ? 'text-[#00ff41]' : 'text-red-400');

              return (
                <div
                  key={acc.id}
                  onClick={() => openEdit(acc)}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    !isCredit ? 'cursor-pointer hover:brightness-110' : ''
                  }`}
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
                      {typeLabels[acc.accountType]}{acc.name ? ` · ${acc.name}` : ''}
                      {!isCredit && <span className="ml-1 opacity-40">✏️</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`value-mono text-sm font-semibold ${balanceColor}`}>
                      {isCredit ? '-' : ''}{formatCLP(Math.abs(acc.balance))}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {isCredit ? 'deuda' : 'saldo'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Balance Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setEditing(null)} />
          <div
            className="relative w-full max-w-sm rounded-2xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid hsl(var(--border))' }}
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-foreground">Editar Saldo</h2>
                <button
                  onClick={() => !saving && setEditing(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground border border-white/5"
                >
                  ✕
                </button>
              </div>

              {/* Account info */}
              <div className="mb-4 p-3 rounded-xl" style={{ background: `${editing.bank.color}11`, borderLeft: `3px solid ${editing.bank.color}` }}>
                <p className="text-sm font-medium" style={{ color: editing.bank.color }}>{editing.bank.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{typeLabels[editing.accountType]}{editing.name ? ` · ${editing.name}` : ''}</p>
              </div>

              {/* Current */}
              <div className="mb-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Saldo actual</p>
                <p className="text-lg font-mono text-muted-foreground">{formatCLP(editing.balance)}</p>
              </div>

              {/* New value */}
              {saved ? (
                <div className="text-center py-4">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="text-[#00ff41] font-medium">Saldo actualizado</p>
                </div>
              ) : (
                <div className="mb-5">
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Nuevo saldo (CLP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="w-full pl-7 pr-4 py-3 rounded-xl text-lg bg-transparent border border-white/10 focus:border-[#00ff41]/40 text-foreground font-mono outline-none transition-all"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              {!saved && (
                <div className="flex gap-2">
                  <button
                    onClick={saveBalance}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #00ff41, #00cc33)',
                      color: '#0a0a1a',
                    }}
                  >
                    {saving ? 'Guardando...' : '💾 Guardar'}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-muted-foreground hover:text-foreground transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
