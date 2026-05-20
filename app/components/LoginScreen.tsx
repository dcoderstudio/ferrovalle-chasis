'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { hashPassword, setSession } from '../lib/auth';

type DisplayUser = {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: 'admin' | 'diagnostico';
};

type ApiUser = DisplayUser & { password_hash: string };

const CACHE_KEY = 'ferrovalle-users-v2';

// Hardcoded for instant display — only visual, auth uses real DB data
const DISPLAY_USERS: DisplayUser[] = [
  { id: 'sergio-barrera',   name: 'Sergio Barrera',        initials: 'SB', color: '#3b82f6', role: 'admin' },
  { id: 'yesenia-acevedo',  name: 'Yesenia Acevedo',       initials: 'YA', color: '#ec4899', role: 'admin' },
  { id: 'edgar-agreda',     name: 'Edgar Agreda',          initials: 'EA', color: '#f97316', role: 'admin' },
  { id: 'victor-juarez',    name: 'Victor Juarez',         initials: 'VJ', color: '#8b5cf6', role: 'admin' },
  { id: 'monica-romero',    name: 'Mónica Romero',         initials: 'MR', color: '#06b6d4', role: 'admin' },
  { id: 'leonardo-morales', name: 'Leonardo Morales',      initials: 'LM', color: '#22c55e', role: 'admin' },
  { id: 'grupo-civaz',      name: 'Grupo Civaz',           initials: 'GC', color: '#f59e0b', role: 'admin' },
  { id: 'tecnico-diag-1',   name: 'Técnico Diagnóstico 1', initials: 'T1', color: '#0ea5e9', role: 'diagnostico' },
  { id: 'tecnico-diag-2',   name: 'Técnico Diagnóstico 2', initials: 'T2', color: '#0ea5e9', role: 'diagnostico' },
  { id: 'tecnico-diag-3',   name: 'Técnico Diagnóstico 3', initials: 'T3', color: '#0ea5e9', role: 'diagnostico' },
];

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [selected, setSelected] = useState<DisplayUser | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Real user data (with hashes) loaded in background
  const apiUsersRef = useRef<ApiUser[]>([]);

  useEffect(() => {
    // Load from cache immediately so first login attempt is instant
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) apiUsersRef.current = parsed;
      }
    } catch {}

    // Refresh from API in background
    fetch('/api/users')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          apiUsersRef.current = data;
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const handleSelect = (user: DisplayUser) => {
    setSelected(user);
    setPassword('');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !password) return;
    setLoading(true);
    setError('');

    // Match by name (robust against ID format differences in DB)
    let apiUser = apiUsersRef.current.find(u => u.name === selected.name);

    // If not in cache yet, fetch now (user just typed their password so small wait is ok)
    if (!apiUser) {
      try {
        const data = await fetch('/api/users').then(r => r.json());
        if (Array.isArray(data) && data.length > 0) {
          apiUsersRef.current = data;
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
          apiUser = data.find((u: ApiUser) => u.name === selected.name);
        }
      } catch {}
    }

    if (!apiUser) {
      setError('No se pudo conectar al servidor. Intenta de nuevo.');
      setLoading(false);
      return;
    }

    const hash = await hashPassword(password);
    if (hash === apiUser.password_hash) {
      setSession({
        userId: apiUser.id,
        userName: apiUser.name,
        userColor: apiUser.color,
        userInitials: apiUser.initials,
        userRole: (apiUser.role as 'admin' | 'diagnostico') ?? 'admin',
      });
      onLogin();
    } else {
      setError('Contraseña incorrecta');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#080c14' }}
    >
      <Image
        src="/ferrovalle-logo.svg"
        alt="Ferrovalle"
        width={220}
        height={25}
        priority
        className="mb-3 opacity-90"
      />
      <p className="text-purple-300/40 text-xs mb-10 tracking-wider uppercase">
        Sistema de Gestión de Chasis
      </p>

      <h2 className="text-white text-lg font-semibold mb-8 tracking-tight">
        ¿Quién está ingresando?
      </h2>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-5 max-w-2xl w-full">
        {DISPLAY_USERS.map(user => (
          <button
            key={user.id}
            onClick={() => handleSelect(user)}
            className="flex flex-col items-center gap-2.5 p-3 rounded-2xl hover:bg-white/[0.04] transition-all group"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform select-none"
              style={{
                background: `linear-gradient(135deg, ${user.color}, ${user.color}99)`,
                boxShadow: `0 4px 20px ${user.color}40`,
              }}
            >
              {user.initials}
            </div>
            <span className="text-slate-500 text-xs text-center font-medium group-hover:text-slate-200 transition-colors leading-tight">
              {user.name}
            </span>
          </button>
        ))}
      </div>

      {/* Password modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="rounded-2xl w-full max-w-xs p-6 shadow-2xl border border-white/[0.08]"
            style={{ background: '#0e1420' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-3 select-none"
                style={{
                  background: `linear-gradient(135deg, ${selected.color}, ${selected.color}99)`,
                  boxShadow: `0 4px 24px ${selected.color}50`,
                }}
              >
                {selected.initials}
              </div>
              <p className="text-white font-semibold text-sm">{selected.name}</p>
              {selected.role === 'diagnostico' && (
                <p className="text-xs text-sky-400/70 mt-1 font-medium">Personal de Diagnóstico</p>
              )}
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                className="w-full bg-[#1a2235] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-center tracking-widest text-base"
                placeholder="Contraseña"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-xs text-center font-medium">{error}</p>
              )}
              <button
                type="submit"
                disabled={!password || loading}
                className="w-full py-2.5 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #f97316, #c2410c)' }}
              >
                {loading ? 'Verificando...' : 'Ingresar'}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-full py-2 text-slate-600 hover:text-slate-400 text-xs transition-colors"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
