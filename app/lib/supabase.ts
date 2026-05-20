import { createClient } from '@supabase/supabase-js';
import type { Chassis } from '../types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const supabase = url && key ? createClient(url, key) : null;

export function isConfigured(): boolean {
  return !!supabase;
}

export async function loadChassis(): Promise<Chassis[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('value')
      .eq('key', 'chassis')
      .single();
    if (error) {
      console.error('[Supabase] load error:', error.message);
      return null;
    }
    return (data?.value ?? []) as Chassis[];
  } catch (e) {
    console.error('[Supabase] load exception:', e);
    return null;
  }
}

export async function saveChassis(list: Chassis[]): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('app_data')
      .upsert({ key: 'chassis', value: list, updated_at: new Date().toISOString() });
    if (error) {
      console.error('[Supabase] save error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[Supabase] save exception:', e);
    return false;
  }
}
