'use client';

import { useState } from 'react';
import Image from 'next/image';
import { hashPassword, setSession } from '../lib/auth';

type DisplayUser = {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: 'admin' | 'diagnostico';
};

const ADMIN_USERS: DisplayUser[] = [
  { id: 'sergio-barrera',   name: 'Sergio Barrera',   initials: 'SB', color: '#3b82f6', role: 'admin' },
  { id: 'yesenia-acevedo',  name: 'Yesenia Acevedo',  initials: 'YA', color: '#ec4899', role: 'admin' },
  { id: 'edgar-agreda',     name: 'Edgar Agreda',     initials: 'EA', color: '#f97316', role: 'admin' },
  { id: 'victor-juarez',    name: 'Victor Juarez',    initials: 'VJ', color: '#8b5cf6', role: 'admin' },
  { id: 'monica-romero',    name: 'Mónica Romero',    initials: 'MR', color: '#06b6d4', role: 'admin' },
  { id: 'leonardo-morales', name: 'Leonardo Morales', initials: 'LM', color: '#22c55e', role: 'admin' },
  { id: 'grupo-civaz',      name: 'Grupo Civaz',      initials: 'GC', color: '#f59e0b', role: 'admin' },
];

const DIAGNOSIS_USERS: DisplayUser[] = [
  { id: 'tecnico-diag-1', name: 'Técnico Diagnóstico', initials: 'TD', color: '#0ea5e9', role: 'diagnostico' },
];

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [selected, setSelected] = useState<DisplayUser | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    try {
      const passwordHash = await hashPassword(password);
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selected.id, userName: selected.name, passwordHash }),
      });
      const json = await res.json();
      if (json.ok) {
        setSession({
          userId: json.user?.id ?? selected.id,
          userName: json.user?.name ?? selected.name,
          userColor: json.user?.color ?? selected.color,
          userInitials: json.user?.initials ?? selected.initials,
          userRole: selected.role,
        });
        onLogin();
      } else {
        const msgs: Record<string, string> = {
          wrong_password: 'Contraseña incorrecta',
          user_not_found: 'Usuario no encontrado. Ejecuta /api/setup primero.',
          not_configured: 'Error de servidor: variables de entorno no configuradas.',
          db_error: `Error de base de datos: ${json.detail ?? ''}`,
        };
        setError(msgs[json.reason] ?? `Error: ${json.reason ?? 'desconocido'}`);
        setLoading(false);
      }
    } catch (err) {
      setError(`Sin conexión. (${err instanceof Error ? err.message : 'network error'})`);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: '#080c14' }}
    >
      <Image src="/ferrovalle-logo.svg" alt="Ferrovalle" width={220} height={25} priority className="mb-3 opacity-90" />
      <p className="text-purple-300/40 text-xs mb-10 tracking-wider uppercase">Sistema de Gestión de Chasis</p>

      <h2 className="text-white text-lg font-semibold mb-8 tracking-tight">¿Quién está ingresando?</h2>

      {/* Admin profiles */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-5 max-w-2xl w-full">
        {ADMIN_USERS.map(user => (
          <ProfileButton key={user.id} user={user} onSelect={handleSelect} />
        ))}
      </div>

      {/* Separator */}
      <div className="flex items-center gap-3 max-w-2xl w-full my-7">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sky-400/20" style={{ background: 'rgba(14,165,233,0.06)' }}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-sky-400">
            <path d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
          <span className="text-sky-400/80 text-[10px] font-semibold uppercase tracking-wider">Personal de Revisión</span>
        </div>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      {/* Diagnosis profiles */}
      <div className="flex justify-center gap-5 max-w-2xl w-full">
        {DIAGNOSIS_USERS.map(user => (
          <ProfileButton key={user.id} user={user} onSelect={handleSelect} isDiagnosis />
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
                {selected.role === 'diagnostico' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" className="w-8 h-8">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                ) : (
                  <span>{selected.initials}</span>
                )}
              </div>
              <p className="text-white font-semibold text-sm">{selected.name}</p>
              {selected.role === 'diagnostico' && (
                <p className="text-xs text-sky-400/70 mt-0.5 font-medium">Personal de Revisión</p>
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
              {error && <p className="text-red-400 text-xs text-center font-medium">{error}</p>}
              <button
                type="submit"
                disabled={!password || loading}
                className="w-full py-2.5 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #f97316, #c2410c)' }}
              >
                {loading ? 'Verificando...' : 'Ingresar'}
              </button>
              <button type="button" onClick={() => setSelected(null)}
                className="w-full py-2 text-slate-600 hover:text-slate-400 text-xs transition-colors">
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileButton({ user, onSelect, isDiagnosis = false }: { user: DisplayUser; onSelect: (u: DisplayUser) => void; isDiagnosis?: boolean }) {
  return (
    <button
      onClick={() => onSelect(user)}
      className="flex flex-col items-center gap-2.5 p-3 rounded-2xl hover:bg-white/[0.04] transition-all group"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform select-none"
        style={{
          background: `linear-gradient(135deg, ${user.color}, ${user.color}99)`,
          boxShadow: `0 4px 20px ${user.color}40`,
        }}
      >
        {isDiagnosis ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" className="w-8 h-8">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        ) : (
          <span className="text-white font-bold text-xl">{user.initials}</span>
        )}
      </div>
      <span className="text-slate-500 text-xs text-center font-medium group-hover:text-slate-200 transition-colors leading-tight">
        {user.name}
      </span>
    </button>
  );
}
