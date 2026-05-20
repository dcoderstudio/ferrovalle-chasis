import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  // Try service key first, fall back to anon key
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const db = getClient();
  if (!db) {
    return NextResponse.json({ error: 'not_configured', url: !!process.env.NEXT_PUBLIC_SUPABASE_URL, key: !!process.env.SUPABASE_SERVICE_KEY }, { status: 503 });
  }
  const { data, error } = await db
    .from('app_data')
    .select('value')
    .eq('key', 'chassis');

  if (error) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }
  return NextResponse.json(data && data.length > 0 ? data[0].value : []);
}

export async function POST(request: Request) {
  const db = getClient();
  if (!db) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }
  try {
    const list = await request.json();
    const { error } = await db
      .from('app_data')
      .upsert({ key: 'chassis', value: list, updated_at: new Date().toISOString() });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
