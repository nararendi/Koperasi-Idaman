-- ==============================================================================
-- SKRIP TABEL USERS SUPABASE - KOPERASI IDAMAN
-- ==============================================================================

-- 1. Mengaktifkan ekstensi UUID (jika belum aktif)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Membuat tabel users (jika belum ada)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL DEFAULT 'USR-001',
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'Kasir & Teller' CHECK (role IN ('Super Admin', 'Bendahara', 'Kasir & Teller', 'Pengurus', 'admin', 'petugas')),
  status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
  avatar VARCHAR(10) DEFAULT 'US',
  last_login VARCHAR(100) DEFAULT '-',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Mengaktifkan Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Menghapus policy lama agar tidak bentrok
DROP POLICY IF EXISTS "Public users" ON public.users;
DROP POLICY IF EXISTS "allow_read_all" ON public.users;
DROP POLICY IF EXISTS "allow_all_users" ON public.users;

-- 5. Membuat Policy Akses Penuh (SELECT, INSERT, UPDATE, DELETE) untuk anon & authenticated
CREATE POLICY "allow_all_users" ON public.users
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Memberi izin operasi skema ke role Supabase
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;

-- 6. Memasukkan / Memperbarui Data Akun Default (admin, bendahara, kasir)
INSERT INTO public.users (user_id, username, password, nama, email, role, status, avatar)
VALUES
  ('USR-001', 'admin', 'password123', 'Administrator Utama', 'admin@koperasi-idaman.co.id', 'Super Admin', 'Aktif', 'AD'),
  ('USR-002', 'bendahara', 'password123', 'Ica Cahyani', 'ica.bendahara@koperasi-idaman.co.id', 'Bendahara', 'Aktif', 'IC'),
  ('USR-003', 'kasir', 'password123', 'Siti Rahayu', 'siti.kasir@koperasi-idaman.co.id', 'Kasir & Teller', 'Aktif', 'SR')
ON CONFLICT (username) DO UPDATE
SET 
  password = EXCLUDED.password,
  status = 'Aktif',
  role = EXCLUDED.role,
  updated_at = now();
