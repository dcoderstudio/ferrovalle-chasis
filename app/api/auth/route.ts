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
  if (!db) return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });

  const { userId, userName, passwordHash } = await request.json();
  if (!passwordHash) return NextResponse.json({ ok: false, reason: 'missing_fields' });

  // Try by ID first, then fall back to name lookup
  let rows: { id: string; name: string; initials: string; color: string; password_hash: string }[] = [];

  if (userId) {
    const { data } = await db
      .from('users')
      .select('id, name, initials, color, password_hash')
      .eq('id', userId);
    if (data && data.length > 0) rows = data;
  }

  if (rows.length === 0 && userName) {
    const { data } = await db
      .from('users')
      .select('id, name, initials, color, password_hash')
      .eq('name', userName);
    if (data && data.length > 0) rows = data;
  }

  if (rows.length === 0) {
    return NextResponse.json({ ok: false, reason: 'user_not_found' });
  }

  const user = rows[0];
  if (user.password_hash !== passwordHash) {
    return NextResponse.json({ ok: false, reason: 'wrong_password' });
  }

  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, initials: user.initials, color: user.color } });
}

export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json({ status: 'not_configured' });
  const { error } = await db.from('users').select('id').limit(1);
  if (error) return NextResponse.json({ status: 'db_error', detail: error.message });
  return NextResponse.json({ status: 'ok' });
}
