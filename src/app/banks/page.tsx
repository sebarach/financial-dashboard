'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

// ============================================
// Types
// ============================================
interface Bank {
  id: string;
  slug: string;
  name: string;
  color: string;
  color_alt: string;
  logo_url: string | null;
  created_at: string;
  accountCount?: number;
}

interface ValidationErrors {
  [field: string]: string;
}

function validateBank(input: Partial<CreateBankInput>): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!input.name?.trim()) errors.name = 'Nombre requerido';
  if (!input.slug?.trim()) errors.slug = 'Slug requerido';
  else if (!/^[a-z0-9-]+$/.test(input.slug)) errors.slug = 'Solo minúsculas, números y guiones';
  if (!input.color?.trim()) errors.color = 'Color primario requerido';
  else if (!/^#[0-9a-fA-F]{6}$/.test(input.color)) errors.color = 'Formato: #RRGGBB';
  if (input.color_alt && !/^#[0-9a-fA-F]{6}$/.test(input.color_alt)) errors.color_alt = 'Formato: #RRGGBB';
  return errors;
}

interface CreateBankInput {
  name: string;
  slug: string;
  color: string;
  color_alt: string;
  logo_url: string;
}

// ============================================
// Main Component
// ============================================
export default function BanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
  const [formSlug, setFormSlug] = useState('');
  const [formColor, setFormColor] = useState('#0066FF');
  const [formColorAlt, setFormColorAlt] = useState('#FFFFFF');
  const [formLogoUrl, setFormLogoUrl] = useState('');

  // Load banks
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const sb = createClient();
    const { data, error } = await sb.from('banks').select('*').order('name');
    if (data) {
      // Get account counts
      const { data: accData } = await sb.from('accounts').select('bank_id');
      const counts: Record<string, number> = {};
      (accData || []).forEach((a: any) => {
        counts[a.bank_id] = (counts[a.bank_id] || 0) + 1;
      });
      setBanks((data as any).map((b: any) => ({ ...b, accountCount: counts[b.id] || 0 })));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtered
  const filtered = banks.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset form
  function resetForm() {
    setFormName(''); setFormSlug(''); setFormColor('#0066FF');
    setFormColorAlt('#FFFFFF'); setFormLogoUrl('');
    setFieldErrors({}); setSubmitError(null); setSuccess(false);
    setEditMode(false); setEditingId(null);
  }

  function openCreateModal() {
    resetForm();
    setShowModal(true);
  }

  function openEditModal(bank: Bank) {
    resetForm();
    setEditMode(true);
    setEditingId(bank.id);
    setFormName(bank.name);
    setFormSlug(bank.slug);
    setFormColor(bank.color);
    setFormColorAlt(bank.color_alt);
    setFormLogoUrl(bank.logo_url || '');
    setShowModal(true);
  }

  // Auto-generate slug from name
  function handleNameChange(name: string) {
    setFormName(name);
    if (!editMode) {
      setFormSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }

  function touchField(field: string) {
    const input = buildInput();
    const errors = validateBank(input);
    setFieldErrors(prev => ({ ...prev, [field]: errors[field] || '' }));
  }

  function buildInput(): Partial<CreateBankInput> {
    return {
      name: formName,
      slug: formSlug,
      color: formColor,
      color_alt: formColorAlt,
      logo_url: formLogoUrl,
    };
  }

  // Submit
  async function handleSubmit() {
    setSubmitError(null);
    const input = buildInput();
    const errors = validateBank(input);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setSubmitting(true);
    const sb = createClient();
    try {
      if (editMode && editingId) {
        const { error } = await (sb.from('banks') as any).update({
          name: input.name,
          slug: input.slug,
          color: input.color,
          color_alt: input.color_alt,
          logo_url: input.logo_url || null,
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await (sb.from('banks') as any).insert({
          name: input.name,
          slug: input.slug,
          color: input.color,
          color_alt: input.color_alt,
          logo_url: input.logo_url || null,
        });
        if (error) throw error;
      }
      setSuccess(true);
      setTimeout(() => { setShowModal(false); loadData(); }, 800);
    } catch (e: any) {
      setSubmitError(e.message || 'Error al guardar banco');
    } finally {
      setSubmitting(false);
    }
  }

  // Delete
  async function handleDelete(id: string) {
    const sb = createClient();
    const { error } = await (sb.from('banks') as any).delete().eq('id', id);
    if (error) {
      alert('No se puede eliminar: probablemente tiene cuentas asociadas.');
    }
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
            <span className="text-primary">Bancos</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {banks.length} banco{banks.length !== 1 ? 's' : ''} registrado{banks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--green-bright), var(--green-mid))',
            color: '#0a0a1a',
          }}
        >
          + Nuevo Banco
        </button>
      </div>

      {/* Search */}
      <div className="mb-5 relative">
        <input
          type="text"
          placeholder="Buscar banco..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border border-white/5 focus:border-[var(--green-bright)]/40 text-foreground placeholder:text-muted-foreground/50 outline-none transition-all"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">✕</button>
        )}
      </div>

      {/* Bank grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-4 px-4 rounded-xl bg-card border border-border backdrop-blur-sm text-center py-12">
          <p className="text-3xl mb-3">🏛</p>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'Sin resultados' : 'No hay bancos registrados'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(bank => (
            <div
              key={bank.id}
              className="py-4 px-4 rounded-xl bg-card border border-border backdrop-blur-sm py-4 px-4 group relative overflow-hidden"
            >
              {/* Background glow */}
              <div
                className="absolute inset-0 opacity-5"
                style={{ background: `radial-gradient(circle at 50% 50%, ${bank.color}, transparent 70%)` }}
              />

              <div className="relative flex items-center gap-3">
                {/* Color circle */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                  style={{
                    background: `${bank.color}20`,
                    border: `2px solid ${bank.color}40`,
                    color: bank.color,
                  }}
                >
                  {bank.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{bank.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{bank.slug}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                    {bank.accountCount} cuenta{bank.accountCount !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Color preview */}
                <div className="flex gap-1 flex-shrink-0">
                  <span className="w-4 h-4 rounded-full border border-white/10" style={{ background: bank.color }} title={bank.color} />
                  <span className="w-4 h-4 rounded-full border border-white/10" style={{ background: bank.color_alt }} title={bank.color_alt} />
                </div>
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(bank)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] border border-white/5 text-muted-foreground hover:text-primary hover:border-[var(--green-bright)]/30 transition-all"
                  title="Editar"
                >
                  ✎
                </button>
                {deleteConfirm === bank.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete(bank.id)} className="px-2 py-1 rounded-lg text-[10px] bg-red-500/20 text-red-400">Sí</button>
                    <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg text-[10px] border border-white/10 text-muted-foreground">No</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(bank.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] border border-white/5 text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition-all"
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
          MODAL — Crear / Editar Banco
          ============================================ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !submitting && setShowModal(false)} />

          <div
            className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--bg-elevated)', border: '1px solid hsl(var(--border))' }}
          >
            {/* Success overlay */}
            {success && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl" style={{ background: 'rgba(10, 10, 26, 0.9)' }}>
                <div className="text-center">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-primary font-medium">
                    {editMode ? 'Banco actualizado' : 'Banco creado'}
                  </p>
                </div>
              </div>
            )}

            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-foreground">
                  {editMode ? '✎ Editar Banco' : '+ Nuevo Banco'}
                </h2>
                <button
                  onClick={() => !submitting && setShowModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground border border-white/5"
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

              {/* Preview card */}
              <div className="mb-5 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all"
                    style={{
                      background: `${formColor}20`,
                      border: `2px solid ${formColor}40`,
                      color: formColor,
                    }}
                  >
                    {formName ? formName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{formName || 'Nombre del Banco'}</p>
                    <p className="text-xs text-muted-foreground font-mono">{formSlug || 'slug'}</p>
                  </div>
                  <div className="ml-auto flex gap-1.5">
                    <span className="w-5 h-5 rounded-full border border-white/10 transition-all" style={{ background: formColor }} />
                    <span className="w-5 h-5 rounded-full border border-white/10 transition-all" style={{ background: formColorAlt }} />
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Nombre</label>
                <input
                  type="text"
                  placeholder="Ej: Banco de Chile, Santander..."
                  value={formName}
                  onChange={e => handleNameChange(e.target.value)}

                  maxLength={50}
                  className={`w-full px-4 py-3 rounded-xl text-sm bg-transparent border-b-2 text-foreground placeholder:text-muted-foreground/30 outline-none transition-all ${
                    fieldErrors.name ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--green-bright)]/40'
                  }`}
                />
                {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
              </div>

              {/* Slug */}
              <div className="mb-4">
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Slug</label>
                <input
                  type="text"
                  placeholder="banco-de-chile"
                  value={formSlug}
                  onChange={e => setFormSlug(e.target.value)}

                  className={`w-full px-4 py-3 rounded-xl text-sm bg-transparent border-b-2 text-foreground font-mono placeholder:text-muted-foreground/30 outline-none transition-all ${
                    fieldErrors.slug ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--green-bright)]/40'
                  }`}
                />
                {fieldErrors.slug && <p className="text-red-400 text-xs mt-1">{fieldErrors.slug}</p>}
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Color Primario</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formColor}
                      onChange={e => setFormColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={formColor}
                      onChange={e => setFormColor(e.target.value)}

                      maxLength={7}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs bg-transparent border-b-2 text-foreground font-mono outline-none transition-all ${
                        fieldErrors.color ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--green-bright)]/40'
                      }`}
                    />
                  </div>
                  {fieldErrors.color && <p className="text-red-400 text-xs mt-1">{fieldErrors.color}</p>}
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Color Secundario</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formColorAlt}
                      onChange={e => setFormColorAlt(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={formColorAlt}
                      onChange={e => setFormColorAlt(e.target.value)}

                      maxLength={7}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs bg-transparent border-b-2 text-foreground font-mono outline-none transition-all ${
                        fieldErrors.color_alt ? 'border-red-400/50' : 'border-white/10 focus:border-[var(--green-bright)]/40'
                      }`}
                    />
                  </div>
                  {fieldErrors.color_alt && <p className="text-red-400 text-xs mt-1">{fieldErrors.color_alt}</p>}
                </div>
              </div>

              {/* Logo URL */}
              <div className="mb-6">
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Logo URL (opcional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formLogoUrl}
                  onChange={e => setFormLogoUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-transparent border-b-2 text-foreground placeholder:text-muted-foreground/30 outline-none transition-all border-white/10 focus:border-[var(--green-bright)]/40"
                />
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  submitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
                style={{
                  background: 'linear-gradient(135deg, var(--green-bright), var(--green-mid))',
                  color: '#0a0a1a',
                }}
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0a0a1a]/30 border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : editMode ? '✎ Guardar Cambios' : '+ Crear Banco'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
