import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json([]);
  const { data, error } = await db
    .from('users')
    .select('id, name, initials, color, password_hash, role');
  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(request: Request) {
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false }, { status: 503 });
  const { userId, newHash } = await request.json();
  const { error } = await db
    .from('users')
    .update({ password_hash: newHash })
    .eq('id', userId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
