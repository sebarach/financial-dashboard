// ============================================
// Login / Sign Up Page
// ============================================

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'login' | 'register';

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (tab === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error, needsConfirmation } = await signUp(email, password);
      if (error) setError(error);
      else if (needsConfirmation) {
        setSuccess('Revisa tu email para confirmar tu cuenta.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-deep)' }}>
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          background: 'rgba(15, 15, 35, 0.9)',
          border: '1px solid rgba(0, 240, 255, 0.12)',
          boxShadow: '0 0 40px rgba(0, 240, 255, 0.06)',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-primary">Fin</span>
            <span className="text-destructive">Dash</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Tu dashboard financiero personal</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <button
            onClick={() => { setTab('login'); setError(null); setSuccess(null); }}
            className="flex-1 py-2.5 text-sm font-medium transition-all"
            style={{
              background: tab === 'login' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              color: tab === 'login' ? 'var(--green-bright)' : 'var(--text-tertiary)',
            }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); setSuccess(null); }}
            className="flex-1 py-2.5 text-sm font-medium transition-all"
            style={{
              background: tab === 'register' ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
              color: tab === 'register' ? 'var(--green-bright)' : 'var(--text-tertiary)',
            }}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-red-400" style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.2)' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg text-sm text-green-400" style={{ background: 'rgba(50,255,50,0.1)', border: '1px solid rgba(50,255,50,0.2)' }}>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(0, 240, 255, 0.12)',
                color: '#e0e0e0',
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 ml-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(0, 240, 255, 0.12)',
                color: '#e0e0e0',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: loading ? 'rgba(0,240,255,0.2)' : 'linear-gradient(135deg, var(--green-bright), var(--green-mid))',
              color: '#0a0a1a',
            }}
          >
            {loading ? 'Cargando...' : tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: 'rgba(0,240,255,0.1)' }} />
          <span className="text-xs text-gray-500">o</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(0,240,255,0.1)' }} />
        </div>

        {/* Google OAuth */}
        <button
          onClick={signInWithGoogle}
          className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#ccc',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continuar con Google
        </button>
      </div>
    </div>
  );
}
