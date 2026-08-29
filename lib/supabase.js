import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ktfbqwbjvtppyypjrxqs.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZmJxd2JqdnRwcHl5cGpyeHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTI4MzIsImV4cCI6MjEwMzQyODgzMn0.NkdSVa5yPwQ7qnn2zQMf1mlblzhz3Wq8iVVKgPrCqF4';

// Stable global Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function getSupabaseConfig() {
  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
  };
}

export function saveSupabaseConfig() {
  // Config is permanently integrated into system
}

export function getSupabaseClient() {
  return supabase;
}

// Test connection function
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('settings').select('*').limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          code: 'TABLE_NOT_FOUND',
          message: 'Terkoneksi ke Supabase, namun tabel belum dibuat. Harap jalankan script supabase_schema.sql di SQL Editor Supabase.'
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Koneksi ke Supabase Cloud aktif dan tersambung!' };
  } catch (err) {
    return { success: false, message: err.message || 'Gagal terhubung ke Supabase.' };
  }
}
