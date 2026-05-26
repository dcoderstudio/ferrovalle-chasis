import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Chassis } from '../../types';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(request: Request) {
  const db = getClient();
  const { searchParams } = new URL(request.url);

  if (searchParams.get('test') === 'write') {
    if (!db) return NextResponse.json({ error: 'not_configured', service_key: !!process.env.SUPABASE_SERVICE_KEY, anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY });
    const { error } = await db
      .from('app_data')
      .upsert({ key: 'chassis', value: [{ debug: true, t: Date.now() }], updated_at: new Date().toISOString() });
    return NextResponse.json({ write_error: error?.message ?? null, write_code: error?.code ?? null, ok: !error });
  }

  if (!db) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  // Load structural list (no photos)
  const { data: listData, error: listError } = await db
    .from('app_data')
    .select('value')
    .eq('key', 'chassis');
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  const chassisList: Chassis[] = Array.isArray(listData?.[0]?.value) ? listData[0].value : [];
  if (chassisList.length === 0) return NextResponse.json([]);

  // Load per-chassis photo rows (key = 'chassis-{id}')
  const { data: photoRows } = await db
    .from('app_data')
    .select('key, value')
    .like('key', 'chassis-%');

  const photoMap: Record<string, { photosBefore: string[]; photosDetail: string[]; photosAfter: string[] }> = {};
  for (const row of photoRows ?? []) {
    const id = row.key.slice('chassis-'.length);
    photoMap[id] = row.value;
  }

  // Merge: per-chassis photos take priority over any photos stored inline (legacy)
  const merged = chassisList.map((c: Chassis) => {
    const photos = photoMap[c.id];
    if (!photos) return c;
    return {
      ...c,
      photosBefore: photos.photosBefore ?? c.photosBefore,
      photosDetail: photos.photosDetail ?? c.photosDetail,
      photosAfter:  photos.photosAfter  ?? c.photosAfter,
    };
  });

  return NextResponse.json(merged);
}

// Save full structural list (photos stripped by caller)
export async function POST(request: Request) {
  const db = getClient();
  if (!db) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  try {
    const list = await request.json();
    const { error } = await db
      .from('app_data')
      .upsert({ key: 'chassis', value: list, updated_at: new Date().toISOString() });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

// Save photos for a single chassis (body: { id, photosBefore, photosDetail, photosAfter })
export async function PATCH(request: Request) {
  const db = getClient();
  if (!db) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  try {
    const { id, photosBefore, photosDetail, photosAfter } = await request.json();
    if (!id) return NextResponse.json({ ok: false, error: 'missing id' }, { status: 400 });
    const { error } = await db
      .from('app_data')
      .upsert({
        key: `chassis-${id}`,
        value: {
          photosBefore: photosBefore ?? [],
          photosDetail: photosDetail ?? [],
          photosAfter:  photosAfter  ?? [],
        },
        updated_at: new Date().toISOString(),
      });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
