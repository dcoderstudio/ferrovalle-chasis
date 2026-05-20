import { NextResponse } from 'next/server';

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? '';
const REST = url ? `${url}/rest/v1` : '';

export async function GET() {
  if (!REST || !serviceKey) {
    return NextResponse.json([], { status: 200 });
  }
  try {
    const res = await fetch(`${REST}/app_data?key=eq.chassis&select=value`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[API] GET error:', res.status, await res.text());
      return NextResponse.json(null, { status: 500 });
    }
    const rows: { value: unknown[] }[] = await res.json();
    return NextResponse.json(rows.length ? rows[0].value : []);
  } catch (e) {
    console.error('[API] GET exception:', e);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!REST || !serviceKey) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  try {
    const list = await request.json();
    const res = await fetch(`${REST}/app_data?key=eq.chassis`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ value: list, updated_at: new Date().toISOString() }),
    });
    if (!res.ok) {
      console.error('[API] PATCH error:', res.status, await res.text());
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[API] POST exception:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
