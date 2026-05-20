import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: Request) {
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });

  const { userId, passwordHash } = await request.json();
  if (!userId || !passwordHash) return NextResponse.json({ ok: false });

  const { data, error } = await db
    .from('users')
    .select('id, name, initials, color, role')
    .eq('id', userId)
    .eq('password_hash', passwordHash);

  if (error || !data || data.length === 0) {
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true, user: data[0] });
}
