import { createClient } from '@supabase/supabase-js';
import type { Chassis } from '../types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const supabase = url && key ? createClient(url, key) : null;

export async function loadChassis(): Promise<Chassis[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('app_data')
    .select('value')
    .eq('key', 'chassis')
    .single();
  if (error || !data) return null;
  return data.value as Chassis[];
}

export async function saveChassis(list: Chassis[]): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('app_data')
    .upsert({ key: 'chassis', value: list, updated_at: new Date().toISOString() });
}
