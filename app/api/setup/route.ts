import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

const INITIAL_USERS = [
  { id: 'sergio-barrera',    name: 'Sergio Barrera',    initials: 'SB', color: '#3b82f6' },
  { id: 'yesenia-acevedo',   name: 'Yesenia Acevedo',   initials: 'YA', color: '#ec4899' },
  { id: 'edgar-agreda',      name: 'Edgar Agreda',      initials: 'EA', color: '#f97316' },
  { id: 'victor-juarez',     name: 'Victor Juarez',     initials: 'VJ', color: '#8b5cf6' },
  { id: 'monica-romero',     name: 'Mónica Romero',     initials: 'MR', color: '#06b6d4' },
  { id: 'leonardo-morales',  name: 'Leonardo Morales',  initials: 'LM', color: '#22c55e' },
  { id: 'grupo-civaz',       name: 'Grupo Civaz',       initials: 'GC', color: '#f59e0b' },
];

export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const hash = createHash('sha256').update('FERROVALLE', 'utf8').digest('hex');
  const users = INITIAL_USERS.map(u => ({ ...u, password_hash: hash }));

  const { error } = await db.from('users').upsert(users);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, message: 'Usuarios creados con contraseña FERROVALLE', users: INITIAL_USERS.map(u => u.name) });
}
