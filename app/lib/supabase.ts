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

async function saveChassisPhotos(
  id: string,
  photosBefore: string[],
  photosDetail: string[],
  photosAfter: string[]
): Promise<boolean> {
  try {
    const res = await fetch('/api/chassis', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, photosBefore, photosDetail, photosAfter }),
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json.ok === true;
  } catch (e) {
    console.error('[sync] photo save error:', e);
    return false;
  }
}

export async function saveChassis(list: Chassis[]): Promise<boolean> {
  // 1. Save photos per-chassis first (each request is one chassis — no size limit issues)
  const chassisWithPhotos = list.filter(
    c => c.photosBefore.length || c.photosDetail.length || c.photosAfter.length
  );
  const photoResults = await Promise.all(
    chassisWithPhotos.map(c =>
      saveChassisPhotos(c.id, c.photosBefore, c.photosDetail, c.photosAfter)
    )
  );

  // 2. Save structural list with photos stripped (small payload)
  const stripped = list.map(c => ({
    ...c,
    photosBefore: [] as string[],
    photosDetail: [] as string[],
    photosAfter:  [] as string[],
  }));
  try {
    const res = await fetch('/api/chassis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stripped),
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json.ok === true && photoResults.every(Boolean);
  } catch (e) {
    console.error('[sync] save error:', e);
    return false;
  }
}
