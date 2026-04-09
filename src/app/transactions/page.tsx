'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import {
  createTransaction,
  createTransfer,
  deleteTransaction,
  validateTransaction,
  validateTransfer,
  type CreateTransactionInput,
  type TransferInput,
  type ValidationErrors,
} from '@/services/transactions';

// ============================================
// Types locales
// ============================================
interface AccountOption { id: string; name: string; bank_name: string; bank_color: string; }
interface CategoryOption { id: string; name: string; icon: string; color: string; type: string; slug: string; }

type TabType = 'all' | 'income' | 'expense' | 'transfer';

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

// ============================================
// Main Component
// ============================================
export default function TransactionsPage() {
  const { user } = useAuth();
  const { transactions, isLoading, refetch } = useTransactions(user?.id);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // List state
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<typeof transactions[0] | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'simple' | 'transfer'>('simple');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  // Form state — simple
  const [formType, setFormType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [formAccountId, setFormAccountId] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  // Form state — transfer
  const [formFromAccount, setFormFromAccount] = useState('');
  const [formToAccount, setFormToAccount] = useState('');
  const [formTransferAmount, setFormTransferAmount] = useState('');
  const [formTransferDesc, setFormTransferDesc] = useState('');
  const [formTransferDate, setFormTransferDate] = useState(new Date().toISOString().split('T')[0]);

  // Load accounts & categories
  useEffect(() => {
    if (!user) return;
    async function load() {
      const sb = createClient();
      const [accRes, catRes] = await Promise.all([
        sb.from('accounts').select('id, name, bank:banks(name, color)').eq('is_active', true).eq('user_id', user!.id),
        sb.from('categories').select('*').order('type').order('name'),
      ]);
      if (accRes.data) {
        setAccounts(accRes.data.map((a: any) => ({
          id: a.id, name: a.name,
          bank_name: a.bank?.name || '', bank_color: a.bank?.color || '#666',
        })));
      }
      if (catRes.data) setCategories(catRes.data);
    }
    load();
  }, [user]);

  // Filter categories by type
  const filteredCategories = categories.filter(c =>
    formType === 'transfer' ? c.slug === 'transfer' : c.type === formType
  );

  // Filter transactions
  const filtered = transactions.filter(tx => {
    if (activeTab !== 'all' && tx.type !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return tx.description.toLowerCase().includes(q) || tx.bank.name.toLowerCase().includes(q);
    }
    return true;
  });

  // Totals
  const totals = {
    income: filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0),
  };

  // Reset form
  function resetForm() {
    setFormType('expense'); setFormAccountId(''); setFormCategoryId('');
    setFormAmount(''); setFormDescription('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormFromAccount(''); setFormToAccount('');
    setFormTransferAmount(''); setFormTransferDesc('');
    setFormTransferDate(new Date().toISOString().split('T')[0]);
    setFieldErrors({}); setSubmitError(null); setSuccess(false);
  }

  function openModal(m: 'simple' | 'transfer') {
    resetForm();
    setMode(m);
    if (m === 'simple') setFormType('expense');
    setShowModal(true);
  }

  // Validate field in real time
  function touchField(field: string) {
    const input = buildInput();
    if (mode === 'simple') {
      const errors = validateTransaction(input);
      setFieldErrors(prev => ({ ...prev, [field]: errors[field] || '' }));
    } else {
      const errors = validateTransfer(buildTransferInput());
      setFieldErrors(prev => ({ ...prev, [field]: errors[field] || '' }));
    }
  }

  function buildInput(): Partial<CreateTransactionInput> {
    return {
      account_id: formAccountId,
      category_id: formCategoryId,
      amount: parseFloat(formAmount) || 0,
      type: formType,
      description: formDescription,
      transaction_date: formDate ? new Date(formDate).toISOString() : '',
    };
  }

  function buildTransferInput(): Partial<TransferInput> {
    return {
      from_account_id: formFromAccount,
      to_account_id: formToAccount,
      amount: parseFloat(formTransferAmount) || 0,
      description: formTransferDesc,
      transaction_date: formTransferDate ? new Date(formTransferDate).toISOString() : '',
    };
  }

  // Submit
  async function handleSubmit() {
    setSubmitError(null);

    if (mode === 'simple') {
      const input = { ...buildInput(), user_id: user!.id };
      const errors = validateTransaction(input as CreateTransactionInput);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
      setSubmitting(true);
      try {
        await createTransaction(input as CreateTransactionInput);
        setSuccess(true);
        setTimeout(() => { setShowModal(false); refetch(); }, 800);
      } catch (e: any) {
        setSubmitError(e.message || 'Error al crear transacción');
      } finally {
        setSubmitting(false);
      }
    } else {
      const input = { ...buildTransferInput(), user_id: user!.id };
      const errors = validateTransfer(input as TransferInput);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
      setSubmitting(true);
      try {
        await createTransfer(input as TransferInput);
        setSuccess(true);
        setTimeout(() => { setShowModal(false); refetch(); }, 800);
      } catch (e: any) {
        setSubmitError(e.message || 'Error al crear transferencia');
      } finally {
        setSubmitting(false);
      }
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id);
      setDeleteConfirm(null);
      refetch();
    } catch (e: any) {
      alert(e.message);
    }
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
            <span className="glow-cyan text-[var(--cyan-accent)]">Transacciones</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {filtered.length} transacciones
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('simple')}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--cyan-accent), var(--magenta-accent))',
              color: '#0a0a1a',
            }}
          >
            + Nueva Transacción
          </button>
          <button
            onClick={() => openModal('transfer')}
            className="px-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--cyan-accent)]/30 text-[var(--cyan-accent)] hover:border-[var(--cyan-accent)]/60 transition-all"
          >
            ⇄ Transferencia
          </button>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {(['all', 'income', 'expense', 'transfer'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'text-[var(--cyan-accent)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              style={activeTab === tab ? { background: 'rgba(0, 240, 255, 0.08)' } : undefined}
            >
              {tab === 'all' ? 'Todas' : tab === 'income' ? '↑ Ingresos' : tab === 'expense' ? '↓ Gastos' : '⇄ Transfer.'}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar transacción..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border border-white/5 focus:border-[var(--cyan-accent)]/40 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 outline-none transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-xs">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card-futuristic-static py-3 px-4 flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Ingresos</span>
          <span className="font-mono text-sm text-[var(--cyan-accent)] glow-cyan">{formatCLP(totals.income)}</span>
        </div>
        <div className="card-futuristic-static py-3 px-4 flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Gastos</span>
          <span className="font-mono text-sm text-[var(--magenta-accent)] glow-magenta">{formatCLP(totals.expense)}</span>
        </div>
      </div>

      {/* Transaction List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-futuristic-static text-center py-12">
          <p className="text-3xl mb-3">📭</p>
          <p className="text-sm text-[var(--text-secondary)]">
            {searchQuery ? 'Sin resultados para esa búsqueda' : 'No hay transacciones aún'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(tx => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="card-futuristic-static py-3 px-4 flex items-center gap-3 group cursor-pointer hover:border-[var(--cyan-accent)]/20 transition-all"
            >
              {/* Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${
                  tx.type === 'income'
                    ? 'bg-[var(--cyan-accent)]/10 text-[var(--cyan-accent)]'
                    : tx.type === 'expense'
                    ? 'bg-[var(--magenta-accent)]/10 text-[var(--magenta-accent)]'
                    : 'bg-yellow-400/10 text-yellow-400'
                }`}
              >
                {tx.type === 'income' ? '↑' : tx.type === 'expense' ? '↓' : '⇄'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{tx.description}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {tx.bank.name} · {formatDate(tx.date)} {formatTime(tx.date)}
                  {tx.status === 'pending' && <span className="ml-2 text-yellow-400">pendiente</span>}
                </p>
              </div>

              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <p className={`font-mono text-sm ${tx.amount >= 0 ? 'text-[var(--cyan-accent)]' : 'text-[var(--magenta-accent)]'}`}>
                  {tx.amount >= 0 ? '+' : ''}{formatCLP(tx.amount)}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  {CATEGORY_LABELS[tx.category] || tx.category}
                </p>
              </div>

              {/* Delete */}
              {deleteConfirm === tx.id ? (
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleDelete(tx.id)} className="px-2 py-1 rounded-lg text-[10px] bg-red-500/20 text-red-400">Sí</button>
                  <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg text-[10px] border border-white/10 text-[var(--text-secondary)]">No</button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(tx.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-secondary)] hover:text-red-400 text-xs flex-shrink-0"
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ============================================
          MODAL — Detalle de Transacción
          ============================================ */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTx(null)} />
          <div
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl"
            style={{ background: 'var(--deep-space-surface)', border: '1px solid rgba(0, 240, 255, 0.15)' }}
          >
            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Detalle</h2>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-white/5"
                >
                  ✕
                </button>
              </div>

              {/* Amount hero */}
              <div className="text-center mb-6 py-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <p className={`text-3xl font-mono font-bold ${
                  selectedTx.amount >= 0 ? 'text-[var(--cyan-accent)] glow-cyan' : 'text-[var(--magenta-accent)] glow-magenta'
                }`}>
                  {selectedTx.amount >= 0 ? '+' : ''}{formatCLP(selectedTx.amount)}
                </p>
                <p className={`text-xs mt-2 uppercase tracking-widest ${
                  selectedTx.type === 'income' ? 'text-[var(--cyan-accent)]' :
                  selectedTx.type === 'expense' ? 'text-[var(--magenta-accent)]' : 'text-yellow-400'
                }`}>
                  {selectedTx.type === 'income' ? '↑ Ingreso' : selectedTx.type === 'expense' ? '↓ Gasto' : '⇄ Transferencia'}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Descripción</span>
                  <span className="text-sm text-[var(--text-primary)] text-right max-w-[60%]">{selectedTx.description}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Categoría</span>
                  <span className="text-sm text-[var(--text-primary)]">{CATEGORY_LABELS[selectedTx.category] || selectedTx.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Cuenta</span>
                  <span className="text-sm text-[var(--text-primary)]">{selectedTx.bank.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Fecha</span>
                  <span className="text-sm text-[var(--text-primary)]">{formatDate(selectedTx.date)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Hora</span>
                  <span className="text-sm text-[var(--text-primary)]">{formatTime(selectedTx.date)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Estado</span>
                  <span className={`text-sm ${selectedTx.status === 'completed' ? 'text-green-400' : selectedTx.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {selectedTx.status === 'completed' ? '✓ Completada' : selectedTx.status === 'pending' ? '◐ Pendiente' : '✗ Fallida'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">ID</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono">{selectedTx.id}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                {deleteConfirm === selectedTx.id ? (
                  <>
                    <button onClick={() => { handleDelete(selectedTx.id); setSelectedTx(null); }} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 border border-red-400/30">
                      Confirmar eliminación
                    </button>
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-[var(--text-secondary)]">
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(selectedTx.id)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-red-400/20 text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    🗑 Eliminar
                  </button>
                )}
                <button
                  onClick={() => setSelectedTx(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL — Nueva Transacción / Transferencia
          ============================================ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !submitting && setShowModal(false)} />

          {/* Modal content */}
          <div
            className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--deep-space-surface)', border: '1px solid rgba(0, 240, 255, 0.15)' }}
          >
            {/* Success overlay */}
            {success && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl" style={{ background: 'rgba(10, 10, 26, 0.9)' }}>
                <div className="text-center">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-[var(--cyan-accent)] glow-cyan font-medium">
                    {mode === 'transfer' ? 'Transferencia creada' : 'Transacción creada'}
                  </p>
                </div>
              </div>
            )}

            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  {mode === 'transfer' ? '⇄ Nueva Transferencia' : '+ Nueva Transacción'}
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

              {mode === 'simple' ? (
                /* ===== SIMPLE FORM ===== */
                <>
                  {/* Type selector */}
                  <div className="mb-5">
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Tipo</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['expense', 'income', 'transfer'] as const).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => { setFormType(t); setFormCategoryId(''); setFieldErrors({}); }}
                          className={`py-2.5 rounded-xl text-xs font-medium transition-all border ${
                            formType === t
                              ? t === 'income'
                                ? 'border-[var(--cyan-accent)]/50 text-[var(--cyan-accent)] bg-[var(--cyan-accent)]/5'
                                : t === 'expense'
                                ? 'border-[var(--magenta-accent)]/50 text-[var(--magenta-accent)] bg-[var(--magenta-accent)]/5'
                                : 'border-yellow-400/50 text-yellow-400 bg-yellow-400/5'
                              : 'border-white/5 text-[var(--text-secondary)] hover:border-white/10'
                          }`}
                        >
                          {t === 'income' ? '↑ Ingreso' : t === 'expense' ? '↓ Gasto' : '⇄ Transfer.'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="mb-4">
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Monto (CLP)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm">$</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={formAmount}
                        onChange={e => setFormAmount(e.target.value)}

                        className={`w-full pl-7 pr-10 py-3 rounded-xl text-sm bg-transparent border-b-2 text-[var(--text-primary)] font-mono outline-none transition-all ${
                          fieldErrors.amount ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--cyan-accent)]/40'
                        }`}
                      />
                      {formAmount && !fieldErrors.amount && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-xs">✓</span>
                      )}
                    </div>
                    {fieldErrors.amount && <p className="text-red-400 text-xs mt-1">{fieldErrors.amount}</p>}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Descripción</label>
                    <input
                      type="text"
                      placeholder="Ej: Supermercado, Netflix, Sueldo..."
                      value={formDescription}
                      onChange={e => setFormDescription(e.target.value)}

                      maxLength={120}
                      className={`w-full px-4 py-3 rounded-xl text-sm bg-transparent border-b-2 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30 outline-none transition-all ${
                        fieldErrors.description ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--cyan-accent)]/40'
                      }`}
                    />
                    {fieldErrors.description && <p className="text-red-400 text-xs mt-1">{fieldErrors.description}</p>}
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1 text-right">{formDescription.length}/120</p>
                  </div>

                  {/* Account + Category row */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Cuenta</label>
                      <select
                        value={formAccountId}
                        onChange={e => setFormAccountId(e.target.value)}

                        className={`w-full px-3 py-3 rounded-xl text-sm bg-[var(--deep-space-bg)] border-b-2 text-[var(--text-primary)] outline-none transition-all appearance-none ${
                          fieldErrors.account_id ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--cyan-accent)]/40'
                        }`}
                      >
                        <option value="">Seleccionar...</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.bank_name} · {a.name}</option>
                        ))}
                      </select>
                      {fieldErrors.account_id && <p className="text-red-400 text-xs mt-1">{fieldErrors.account_id}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Categoría</label>
                      <select
                        value={formCategoryId}
                        onChange={e => setFormCategoryId(e.target.value)}

                        className={`w-full px-3 py-3 rounded-xl text-sm bg-[var(--deep-space-bg)] border-b-2 text-[var(--text-primary)] outline-none transition-all appearance-none ${
                          fieldErrors.category_id ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--cyan-accent)]/40'
                        }`}
                      >
                        <option value="">Seleccionar...</option>
                        {filteredCategories.map(c => (
                          <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                      </select>
                      {fieldErrors.category_id && <p className="text-red-400 text-xs mt-1">{fieldErrors.category_id}</p>}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="mb-6">
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Fecha</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}

                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 rounded-xl text-sm bg-[var(--deep-space-bg)] border-b-2 text-[var(--text-primary)] outline-none transition-all ${
                        fieldErrors.transaction_date ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--cyan-accent)]/40'
                      }`}
                    />
                    {fieldErrors.transaction_date && <p className="text-red-400 text-xs mt-1">{fieldErrors.transaction_date}</p>}
                  </div>
                </>
              ) : (
                /* ===== TRANSFER FORM ===== */
                <>
                  {/* From account */}
                  <div className="mb-4">
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Cuenta Origen</label>
                    <select
                      value={formFromAccount}
                      onChange={e => setFormFromAccount(e.target.value)}

                      className={`w-full px-3 py-3 rounded-xl text-sm bg-[var(--deep-space-bg)] border-b-2 text-[var(--text-primary)] outline-none transition-all appearance-none ${
                        fieldErrors.from_account_id ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--cyan-accent)]/40'
                      }`}
                    >
                      <option value="">Seleccionar...</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.bank_name} · {a.name}</option>
                      ))}
                    </select>
                    {fieldErrors.from_account_id && <p className="text-red-400 text-xs mt-1">{fieldErrors.from_account_id}</p>}
                  </div>

                  <div className="flex justify-center mb-4">
                    <span className="text-[var(--cyan-accent)] text-lg">↓</span>
                  </div>

                  {/* To account */}
                  <div className="mb-4">
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Cuenta Destino</label>
                    <select
                      value={formToAccount}
                      onChange={e => setFormToAccount(e.target.value)}

                      className={`w-full px-3 py-3 rounded-xl text-sm bg-[var(--deep-space-bg)] border-b-2 text-[var(--text-primary)] outline-none transition-all appearance-none ${
                        fieldErrors.to_account_id ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--cyan-accent)]/40'
                      }`}
                    >
                      <option value="">Seleccionar...</option>
                      {accounts.filter(a => a.id !== formFromAccount).map(a => (
                        <option key={a.id} value={a.id}>{a.bank_name} · {a.name}</option>
                      ))}
                    </select>
                    {fieldErrors.to_account_id && <p className="text-red-400 text-xs mt-1">{fieldErrors.to_account_id}</p>}
                  </div>

                  {/* Amount */}
                  <div className="mb-4">
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Monto (CLP)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm">$</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={formTransferAmount}
                        onChange={e => setFormTransferAmount(e.target.value)}

                        className={`w-full pl-7 pr-10 py-3 rounded-xl text-sm bg-transparent border-b-2 text-[var(--text-primary)] font-mono outline-none transition-all ${
                          fieldErrors.amount ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--cyan-accent)]/40'
                        }`}
                      />
                    </div>
                    {fieldErrors.amount && <p className="text-red-400 text-xs mt-1">{fieldErrors.amount}</p>}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Descripción</label>
                    <input
                      type="text"
                      placeholder="Motivo de la transferencia"
                      value={formTransferDesc}
                      onChange={e => setFormTransferDesc(e.target.value)}

                      maxLength={120}
                      className={`w-full px-4 py-3 rounded-xl text-sm bg-transparent border-b-2 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30 outline-none transition-all ${
                        fieldErrors.description ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--cyan-accent)]/40'
                      }`}
                    />
                    {fieldErrors.description && <p className="text-red-400 text-xs mt-1">{fieldErrors.description}</p>}
                  </div>

                  {/* Date */}
                  <div className="mb-6">
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Fecha</label>
                    <input
                      type="date"
                      value={formTransferDate}
                      onChange={e => setFormTransferDate(e.target.value)}

                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 rounded-xl text-sm bg-[var(--deep-space-bg)] border-b-2 text-[var(--text-primary)] outline-none transition-all ${
                        fieldErrors.transaction_date ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--cyan-accent)]/40'
                      }`}
                    />
                    {fieldErrors.transaction_date && <p className="text-red-400 text-xs mt-1">{fieldErrors.transaction_date}</p>}
                  </div>
                </>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  submitting
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg'
                }`}
                style={{
                  background: 'linear-gradient(135deg, var(--cyan-accent), var(--magenta-accent))',
                  color: '#0a0a1a',
                }}
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0a0a1a]/30 border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : mode === 'transfer' ? '⇄ Crear Transferencia' : '+ Crear Transacción'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
