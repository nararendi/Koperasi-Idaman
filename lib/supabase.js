import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'koperasi_supabase_config_v1';

export function getSupabaseConfig() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (_) {}
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ktfbqwbjvtppyypjrxqs.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmJxd2JqdnRwcHl5cGpyeHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTI4MzIsImV4cCI6MjEwMzQyODgzMn0.NkdSVa5yPwQ7qnn2zQMf1mlblzhz3Wq8iVVKgPrCqF4'
  };
}

export function saveSupabaseConfig(url, anonKey) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      SUPABASE_CONFIG_KEY,
      JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
    );
    window.dispatchEvent(new Event('koperasi_supabase_config_updated'));
  }
}

export function getSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey || config.url.includes('placeholder')) {
    return null;
  }
  try {
    return createClient(config.url, config.anonKey);
  } catch (e) {
    console.error('Error creating Supabase client:', e);
    return null;
  }
}

export const supabase = getSupabaseClient() || createClient('https://placeholder.supabase.co', 'placeholder');

// Test connection function
export async function testSupabaseConnection(customUrl, customKey) {
  try {
    const url = customUrl || getSupabaseConfig().url;
    const anonKey = customKey || getSupabaseConfig().anonKey;

    if (!url || !anonKey || url.includes('placeholder')) {
      return { success: false, message: 'URL atau Anon Key Supabase belum diisi.' };
    }

    const client = createClient(url, anonKey);
    const { data, error } = await client.from('anggota').select('count', { count: 'exact', head: true });

    if (error) {
      // If table doesn't exist yet
      if (error.code === '42P01') {
        return {
          success: false,
          code: 'TABLE_NOT_FOUND',
          message: 'Terkoneksi ke Supabase, namun tabel belum dibuat. Harap jalankan script supabase_schema.sql di SQL Editor Supabase.'
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Koneksi ke Supabase berhasil terhubung!' };
  } catch (err) {
    return { success: false, message: err.message || 'Gagal terhubung ke Supabase.' };
  }
}
