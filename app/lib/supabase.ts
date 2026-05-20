import type { Chassis } from '../types';

export function isConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export async function loadChassis(): Promise<Chassis[] | null> {
  try {
    const res = await fetch('/api/chassis', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (e) {
    console.error('[sync] load error:', e);
    return null;
  }
}

export async function saveChassis(list: Chassis[]): Promise<boolean> {
  try {
    const res = await fetch('/api/chassis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json.ok === true;
  } catch (e) {
    console.error('[sync] save error:', e);
    return false;
  }
}
