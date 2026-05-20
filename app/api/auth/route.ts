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

  const { userId, passwordHash } = await request.json();
  if (!userId || !passwordHash) return NextResponse.json({ ok: false, reason: 'missing_fields' });

  // Fetch user by ID only, compare hash in JS (avoids DB collation issues)
  const { data, error } = await db
    .from('users')
    .select('id, name, initials, color, password_hash')
    .eq('id', userId);

  if (error) {
    return NextResponse.json({ ok: false, reason: 'db_error', detail: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ ok: false, reason: 'user_not_found' });
  }

  const user = data[0];
  if (user.password_hash !== passwordHash) {
    return NextResponse.json({ ok: false, reason: 'wrong_password' });
  }

  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, initials: user.initials, color: user.color } });
}

// GET for connectivity test
export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json({ status: 'not_configured' });
  const { error } = await db.from('users').select('id').limit(1);
  if (error) return NextResponse.json({ status: 'db_error', detail: error.message });
  return NextResponse.json({ status: 'ok' });
}
