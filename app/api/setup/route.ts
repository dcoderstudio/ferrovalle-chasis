import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

const ADMIN_USERS = [
  { id: 'sergio-barrera',    name: 'Sergio Barrera',    initials: 'SB', color: '#3b82f6', role: 'admin' },
  { id: 'yesenia-acevedo',   name: 'Yesenia Acevedo',   initials: 'YA', color: '#ec4899', role: 'admin' },
  { id: 'edgar-agreda',      name: 'Edgar Agreda',      initials: 'EA', color: '#f97316', role: 'admin' },
  { id: 'victor-juarez',     name: 'Victor Juarez',     initials: 'VJ', color: '#8b5cf6', role: 'admin' },
  { id: 'monica-romero',     name: 'Mónica Romero',     initials: 'MR', color: '#06b6d4', role: 'admin' },
  { id: 'leonardo-morales',  name: 'Leonardo Morales',  initials: 'LM', color: '#22c55e', role: 'admin' },
  { id: 'grupo-civaz',       name: 'Grupo Civaz',       initials: 'GC', color: '#f59e0b', role: 'admin' },
];

const DIAGNOSIS_USERS = [
  { id: 'tecnico-diag-1', name: 'Técnico Diagnóstico 1', initials: 'T1', color: '#0ea5e9', role: 'diagnostico' },
  { id: 'tecnico-diag-2', name: 'Técnico Diagnóstico 2', initials: 'T2', color: '#0ea5e9', role: 'diagnostico' },
  { id: 'tecnico-diag-3', name: 'Técnico Diagnóstico 3', initials: 'T3', color: '#0ea5e9', role: 'diagnostico' },
];

export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const hash = createHash('sha256').update('FERROVALLE', 'utf8').digest('hex');
  // Only insert columns that are guaranteed to exist (role column requires migration)
  const allUsers = [...ADMIN_USERS, ...DIAGNOSIS_USERS].map(({ id, name, initials, color }) => ({
    id, name, initials, color, password_hash: hash,
  }));

  const { error } = await db.from('users').upsert(allUsers);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    message: 'Usuarios creados/actualizados con contraseña FERROVALLE',
    admins: ADMIN_USERS.map(u => u.name),
    diagnostico: DIAGNOSIS_USERS.map(u => u.name),
  });
}
