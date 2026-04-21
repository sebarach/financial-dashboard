// ============================================
// Auth Callback — Handles OAuth redirects
// ============================================

'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth callback error:', error.message);
        router.replace('/auth?error=callback_failed');
      } else {
        router.replace('/');
      }
    };
    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-deep)' }}>
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-[var(--green-bright)] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 mt-4 text-sm">Verificando...</p>
      </div>
    </div>
  );
}
