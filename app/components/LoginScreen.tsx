'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { UserProfile } from '../lib/auth';
import { hashPassword, setSession } from '../lib/auth';

const CACHE_KEY = 'ferrovalle-users-cache';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show cached users immediately
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) setUsers(parsed);
      }
    } catch {}

    // Fetch fresh data in background and update cache
    fetch('/api/users')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const handleSelect = (user: UserProfile) => {
    setSelected(user);
    setPassword('');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !password) return;
    setLoading(true);
    setError('');
    const hash = await hashPassword(password);
    if (hash === selected.password_hash) {
      setSession({
        userId: selected.id,
        userName: selected.name,
        userColor: selected.color,
        userInitials: selected.initials,
        userRole: selected.role ?? 'admin',
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
      {/* Logo */}
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

      {/* Profile grid */}
      {users.length === 0 ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-2xl animate-pulse"
                style={{ background: 'rgba(255,255,255,0.05)', animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
          <p className="text-slate-700 text-xs">Cargando perfiles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-5 max-w-2xl w-full">
          {users.map(user => (
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
      )}

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
            {/* Avatar */}
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
