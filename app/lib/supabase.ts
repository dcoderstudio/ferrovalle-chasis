import type { Chassis } from '../types';

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const REST = url ? `${url}/rest/v1` : '';

export function isConfigured(): boolean {
  return !!(url && key);
}

export async function loadChassis(): Promise<Chassis[] | null> {
  if (!REST || !key) return null;
  try {
    const res = await fetch(`${REST}/app_data?key=eq.chassis&select=value`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      console.error('[DB] load error:', res.status, await res.text());
      return null;
    }
    const rows: { value: Chassis[] }[] = await res.json();
    return rows.length ? rows[0].value : null;
  } catch (e) {
    console.error('[DB] load exception:', e);
    return null;
  }
}

export async function saveChassis(list: Chassis[]): Promise<boolean> {
  if (!REST || !key) return false;
  try {
    const res = await fetch(`${REST}/app_data?key=eq.chassis`, {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ value: list, updated_at: new Date().toISOString() }),
    });
    if (!res.ok) {
      console.error('[DB] save error:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error('[DB] save exception:', e);
    return false;
  }
}
