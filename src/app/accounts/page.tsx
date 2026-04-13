'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';

// ============================================
// Types
// ============================================
interface Bank {
  id: string;
  name: string;
  color: string;
  color_alt: string;
}

interface Account {
  id: string;
  name: string;
  account_type: string;
  balance: number;
  currency: string;
  is_active: boolean;
  last_sync: string;
  bank: { id: string; name: string; color: string; color_alt: string };
}

interface ValidationErrors {
  [field: string]: string;
}

const ACCOUNT_TYPES: Record<string, { label: string; icon: string }> = {
  checking: { label: 'Cuenta Corriente', icon: '💳' },
  savings: { label: 'Cuenta de Ahorro', icon: '🏦' },
  credit: { label: 'Tarjeta de Crédito', icon: '💎' },
  investment: { label: 'Inversión', icon: '📈' },
  wallet: { label: 'Billetera Digital', icon: '📱' },
  cash: { label: 'Efectivo', icon: '💵' },
};

function formatCLP(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function validateAccount(input: Partial<CreateAccountInput>): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!input.name?.trim()) errors.name = 'Nombre requerido';
  if (!input.bank_id) errors.bank_id = 'Selecciona un banco';
  if (!input.account_type) errors.account_type = 'Selecciona un tipo';
  if (!input.balance === undefined || input.balance === null || isNaN(input.balance)) errors.balance = 'Ingresa un saldo válido';
  return errors;
}

interface CreateAccountInput {
  name: string;
  bank_id: string;
  account_type: string;
  balance: number;
  currency: string;
  user_id: string;
}

// ============================================
// Main Component
// ============================================
export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formBankId, setFormBankId] = useState('');
  const [formAccountType, setFormAccountType] = useState('');
  const [formBalance, setFormBalance] = useState('');
  const [formCurrency, setFormCurrency] = useState('CLP');

  // Load data
  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const sb = createClient();
    const [accRes, bankRes] = await Promise.all([
      sb.from('accounts').select('*, bank:banks(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
      sb.from('banks').select('*').order('name'),
    ]);
    if (accRes.data) setAccounts(accRes.data as any);
    if (bankRes.data) setBanks(bankRes.data as any);
    setIsLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtered accounts
  const filtered = accounts.filter(a => {
    if (activeFilter === 'active') return a.is_active;
    if (activeFilter === 'inactive') return !a.is_active;
    return true;
  });

  // Totals
  const totalBalance = filtered.filter(a => a.is_active).reduce((s, a) => s + a.balance, 0);
  const activeCount = filtered.filter(a => a.is_active).length;

  // Reset form
  function resetForm() {
    setFormName(''); setFormBankId(''); setFormAccountType('');
    setFormBalance(''); setFormCurrency('CLP');
    setFieldErrors({}); setSubmitError(null); setSuccess(false);
    setEditMode(false); setEditingId(null);
  }

  function openCreateModal() {
    resetForm();
    setShowModal(true);
  }

  function openEditModal(account: Account) {
    resetForm();
    setEditMode(true);
    setEditingId(account.id);
    setFormName(account.name);
    setFormBankId(account.bank.id);
    setFormAccountType(account.account_type);
    setFormBalance(account.balance.toString());
    setFormCurrency(account.currency);
    setShowModal(true);
  }

  function touchField(field: string) {
    const input = buildInput();
    const errors = validateAccount(input);
    setFieldErrors(prev => ({ ...prev, [field]: errors[field] || '' }));
  }

  function buildInput(): Partial<CreateAccountInput> {
    return {
      name: formName,
      bank_id: formBankId,
      account_type: formAccountType,
      balance: parseFloat(formBalance) || 0,
      currency: formCurrency,
    };
  }

  // Submit
  async function handleSubmit() {
    setSubmitError(null);
    const input = { ...buildInput(), user_id: user!.id };
    const errors = validateAccount(input);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setSubmitting(true);
    const sb = createClient();
    try {
      if (editMode && editingId) {
        const { error } = await (sb.from('accounts') as any).update({
          name: input.name,
          bank_id: input.bank_id,
          account_type: input.account_type,
          balance: input.balance,
          currency: input.currency,
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await (sb.from('accounts') as any).insert({
          name: input.name,
          bank_id: input.bank_id,
          account_type: input.account_type,
          balance: input.balance,
          currency: input.currency,
          user_id: input.user_id,
          is_active: true,
          last_sync: new Date().toISOString(),
        });
        if (error) throw error;
      }
      setSuccess(true);
      setTimeout(() => { setShowModal(false); loadData(); }, 800);
    } catch (e: any) {
      setSubmitError(e.message || 'Error al guardar cuenta');
    } finally {
      setSubmitting(false);
    }
  }

  // Toggle active
  async function toggleActive(account: Account) {
    const sb = createClient();
    await (sb.from('accounts') as any).update({ is_active: !account.is_active }).eq('id', account.id);
    loadData();
  }

  // Delete
  async function handleDelete(id: string) {
    const sb = createClient();
    await (sb.from('accounts') as any).delete().eq('id', id);
    setDeleteConfirm(null);
    loadData();
  }

  // ============================================
  // Render
  // ============================================
  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            <span className="text-[var(--accent-gold)]">Cuentas</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {activeCount} cuenta{activeCount !== 1 ? 's' : ''} activa{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--accent-gold), #f59e0b)',
            color: '#0a0a1a',
          }}
        >
          + Nueva Cuenta
        </button>
      </div>

      {/* Balance total */}
      <div className="card-static py-4 px-5 mb-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">Balance Total</p>
          <p className="font-mono text-2xl text-[var(--accent-gold)] mt-1">{formatCLP(totalBalance)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">Cuentas</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{filtered.length}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {(['all', 'active', 'inactive'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === tab
                ? 'text-[var(--accent-gold)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            style={activeFilter === tab ? { background: 'rgba(0, 240, 255, 0.08)' } : undefined}
          >
            {tab === 'all' ? 'Todas' : tab === 'active' ? '✓ Activas' : '✗ Inactivas'}
          </button>
        ))}
      </div>

      {/* Account list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-static text-center py-12">
          <p className="text-3xl mb-3">🏦</p>
          <p className="text-sm text-[var(--text-secondary)]">
            {activeFilter !== 'all' ? 'No hay cuentas en este filtro' : 'No hay cuentas aún. Crea una para empezar.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(account => (
            <div
              key={account.id}
              className="card-static py-4 px-4 flex items-center gap-4 group"
            >
              {/* Bank color indicator */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: `${account.bank.color}20`,
                  border: `1px solid ${account.bank.color}30`,
                }}
              >
                {ACCOUNT_TYPES[account.account_type]?.icon || '💰'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{account.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {account.bank.name} · {ACCOUNT_TYPES[account.account_type]?.label || account.account_type}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)]/50 mt-0.5">
                  Actualizada: {formatDate(account.last_sync)}
                  {!account.is_active && <span className="ml-2 text-red-400">inactiva</span>}
                </p>
              </div>

              {/* Balance */}
              <div className="text-right flex-shrink-0">
                <p className={`font-mono text-sm ${account.balance >= 0 ? 'text-[var(--accent-gold)]' : 'text-[var(--accent-rose)]'}`}>
                  {formatCLP(account.balance)}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)]">{account.currency}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(account)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs border border-white/5 text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/30 transition-all"
                  title="Editar"
                >
                  ✎
                </button>
                <button
                  onClick={() => toggleActive(account)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs border border-white/5 text-[var(--text-secondary)] hover:text-yellow-400 hover:border-yellow-400/30 transition-all"
                  title={account.is_active ? 'Desactivar' : 'Activar'}
                >
                  {account.is_active ? '◉' : '○'}
                </button>
                {deleteConfirm === account.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete(account.id)} className="px-2 py-1 rounded-lg text-[10px] bg-red-500/20 text-red-400">Sí</button>
                    <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg text-[10px] border border-white/10 text-[var(--text-secondary)]">No</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(account.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs border border-white/5 text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400/30 transition-all"
                    title="Eliminar"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================
          MODAL — Crear / Editar Cuenta
          ============================================ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !submitting && setShowModal(false)} />

          <div
            className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            {/* Success overlay */}
            {success && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl" style={{ background: 'rgba(10, 10, 26, 0.9)' }}>
                <div className="text-center">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-[var(--accent-gold)] font-medium">
                    {editMode ? 'Cuenta actualizada' : 'Cuenta creada'}
                  </p>
                </div>
              </div>
            )}

            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  {editMode ? '✎ Editar Cuenta' : '+ Nueva Cuenta'}
                </h2>
                <button
                  onClick={() => !submitting && setShowModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-white/5"
                >
                  ✕
                </button>
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="mb-4 p-3 rounded-xl border border-red-400/30 bg-red-400/5 text-red-400 text-sm">
                  ⚠️ {submitError}
                </div>
              )}

              {/* Bank selector */}
              <div className="mb-5">
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Banco</label>
                <div className="grid grid-cols-2 gap-2">
                  {banks.map(bank => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => { setFormBankId(bank.id); setFieldErrors(prev => { const { bank_id, ...rest } = prev; return rest; }); }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all border flex items-center gap-2 ${
                        formBankId === bank.id
                          ? 'border-white/30 text-white'
                          : 'border-white/5 text-[var(--text-secondary)] hover:border-white/10'
                      }`}
                      style={formBankId === bank.id ? { background: `${bank.color}15`, borderColor: `${bank.color}40` } : undefined}
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: bank.color }}
                      />
                      {bank.name}
                    </button>
                  ))}
                </div>
                {fieldErrors.bank_id && <p className="text-red-400 text-xs mt-1">{fieldErrors.bank_id}</p>}
              </div>

              {/* Account type */}
              <div className="mb-5">
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Tipo de Cuenta</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(ACCOUNT_TYPES).map(([key, { label, icon }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { setFormAccountType(key); setFieldErrors(prev => { const { account_type, ...rest } = prev; return rest; }); }}
                      className={`py-2.5 rounded-xl text-xs font-medium transition-all border ${
                        formAccountType === key
                          ? 'border-[var(--accent-gold)]/50 text-[var(--accent-gold)] bg-[var(--accent-gold)]/5'
                          : 'border-white/5 text-[var(--text-secondary)] hover:border-white/10'
                      }`}
                    >
                      {icon} {label.split(' ').pop()}
                    </button>
                  ))}
                </div>
                {fieldErrors.account_type && <p className="text-red-400 text-xs mt-1">{fieldErrors.account_type}</p>}
              </div>

              {/* Account name */}
              <div className="mb-4">
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Nombre de la Cuenta</label>
                <input
                  type="text"
                  placeholder="Ej: Cuenta Corriente Principal, Ahorro Vacaciones..."
                  value={formName}
                  onChange={e => setFormName(e.target.value)}

                  maxLength={60}
                  className={`w-full px-4 py-3 rounded-xl text-sm bg-transparent border-b-2 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30 outline-none transition-all ${
                    fieldErrors.name ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--accent-gold)]/40'
                  }`}
                />
                {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
                <p className="text-[10px] text-[var(--text-secondary)] mt-1 text-right">{formName.length}/60</p>
              </div>

              {/* Balance */}
              <div className="mb-4">
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Saldo Inicial (CLP)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={formBalance}
                    onChange={e => setFormBalance(e.target.value)}

                    className={`w-full pl-7 pr-10 py-3 rounded-xl text-sm bg-transparent border-b-2 text-[var(--text-primary)] font-mono outline-none transition-all ${
                      fieldErrors.balance ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--accent-gold)]/40'
                    }`}
                  />
                  {formBalance && !fieldErrors.balance && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-xs">✓</span>
                  )}
                </div>
                {fieldErrors.balance && <p className="text-red-400 text-xs mt-1">{fieldErrors.balance}</p>}
              </div>

              {/* Currency (info only for now) */}
              <div className="mb-6">
                <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Moneda</label>
                <div className="px-4 py-3 rounded-xl text-sm border-b-2 border-white/10 text-[var(--text-secondary)]">
                  🇨🇱 Pesos Chilenos (CLP)
                </div>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  submitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
                style={{
                  background: 'linear-gradient(135deg, var(--accent-gold), #f59e0b)',
                  color: '#0a0a1a',
                }}
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0a0a1a]/30 border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : editMode ? '✎ Guardar Cambios' : '+ Crear Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
