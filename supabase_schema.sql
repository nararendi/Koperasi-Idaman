-- ==============================================================================
-- SKEMA LENGKAP SUPABASE - SISTEM INFORMASI KOPERASI IDAMAN
-- ==============================================================================
-- Cara Penggunaan:
-- 1. Buka Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Pilih Project Anda -> Masuk ke menu "SQL Editor"
-- 3. Klik "New query", salin dan tempel (paste) seluruh script ini, lalu klik "Run".
-- ==============================================================================

-- 1. Aktifkan Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABEL PENGATURAN / KONFIGURASI KOPERASI (settings)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_koperasi VARCHAR(255) NOT NULL DEFAULT 'Koperasi Simpan Pinjam Idaman',
    badan_hukum VARCHAR(255) DEFAULT 'AHU-0012948.AH.01.26.TAHUN 2020',
    alamat TEXT DEFAULT 'Jl. Jenderal Sudirman No. 45, Jakarta Pusat',
    telepon VARCHAR(50) DEFAULT '(021) 5798-2345',
    email VARCHAR(100) DEFAULT 'info@koperasi-idaman.co.id',
    ketua VARCHAR(150) DEFAULT 'Drs. H. M. Supriyadi, M.M.',
    bendahara VARCHAR(150) DEFAULT 'Ratna Kusuma, S.E.',
    simpanan_pokok NUMERIC(15,2) DEFAULT 500000.00,
    simpanan_wajib NUMERIC(15,2) DEFAULT 100000.00,
    suku_bunga_pinjaman NUMERIC(5,2) DEFAULT 1.50, -- % per bulan
    shu_persen_anggota NUMERIC(5,2) DEFAULT 40.00,
    shu_persen_modal NUMERIC(5,2) DEFAULT 30.00,
    shu_persen_pengurus NUMERIC(5,2) DEFAULT 20.00,
    shu_persen_cadangan NUMERIC(5,2) DEFAULT 10.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABEL ANGGOTA (anggota)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.anggota (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nomor_anggota VARCHAR(50) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    alamat_lengkap TEXT,
    nomor_hp VARCHAR(30) NOT NULL,
    pekerjaan VARCHAR(100) DEFAULT '-',
    tempat_lahir VARCHAR(100) DEFAULT '-',
    tanggal_lahir DATE,
    tanggal_daftar DATE DEFAULT CURRENT_DATE,
    status_keanggotaan VARCHAR(20) DEFAULT 'Aktif' CHECK (status_keanggotaan IN ('Aktif', 'Keluar', 'Berhenti')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anggota_nomor ON public.anggota(nomor_anggota);
CREATE INDEX IF NOT EXISTS idx_anggota_nama ON public.anggota(nama_lengkap);
CREATE INDEX IF NOT EXISTS idx_anggota_status ON public.anggota(status_keanggotaan);

-- ==============================================================================
-- 4. TABEL SIMPANAN (simpanan)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.simpanan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_transaksi VARCHAR(50) UNIQUE,
    nomor_anggota VARCHAR(50) NOT NULL REFERENCES public.anggota(nomor_anggota) ON UPDATE CASCADE ON DELETE CASCADE,
    nama_anggota VARCHAR(255) NOT NULL,
    tanggal DATE DEFAULT CURRENT_DATE,
    jenis_simpanan VARCHAR(30) NOT NULL CHECK (jenis_simpanan IN ('Pokok', 'Wajib', 'Sukarela')),
    tipe VARCHAR(20) NOT NULL DEFAULT 'Setoran' CHECK (tipe IN ('Setoran', 'Penarikan')),
    jumlah NUMERIC(15,2) NOT NULL CHECK (jumlah > 0),
    metode VARCHAR(50) DEFAULT 'Tunai',
    pencatat VARCHAR(100) DEFAULT 'Admin',
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_simpanan_nomor_anggota ON public.simpanan(nomor_anggota);
CREATE INDEX IF NOT EXISTS idx_simpanan_tanggal ON public.simpanan(tanggal);
CREATE INDEX IF NOT EXISTS idx_simpanan_jenis ON public.simpanan(jenis_simpanan);

-- ==============================================================================
-- 5. TABEL PINJAMAN (pinjaman)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pinjaman (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nomor_pinjaman VARCHAR(50) UNIQUE NOT NULL,
    nomor_anggota VARCHAR(50) NOT NULL REFERENCES public.anggota(nomor_anggota) ON UPDATE CASCADE ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    tanggal_pengajuan DATE DEFAULT CURRENT_DATE,
    jumlah NUMERIC(15,2) NOT NULL CHECK (jumlah > 0),
    bunga NUMERIC(5,2) NOT NULL DEFAULT 1.50, -- % per bulan
    tenor INTEGER NOT NULL CHECK (tenor > 0), -- dalam bulan
    angsuran_pokok NUMERIC(15,2) NOT NULL,
    angsuran_bunga NUMERIC(15,2) NOT NULL,
    total_angsuran_bulanan NUMERIC(15,2) NOT NULL,
    total_pinjaman NUMERIC(15,2) NOT NULL,
    total_terbayar NUMERIC(15,2) DEFAULT 0.00,
    sisa_hutang NUMERIC(15,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Diajukan' CHECK (status IN ('Diajukan', 'Disetujui', 'Berjalan', 'Lunas', 'Ditolak')),
    keperluan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pinjaman_nomor_anggota ON public.pinjaman(nomor_anggota);
CREATE INDEX IF NOT EXISTS idx_pinjaman_status ON public.pinjaman(status);
CREATE INDEX IF NOT EXISTS idx_pinjaman_tanggal ON public.pinjaman(tanggal_pengajuan);

-- ==============================================================================
-- 6. TABEL RIWAYAT ANGSURAN (riwayat_angsuran)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.riwayat_angsuran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nomor_pinjaman VARCHAR(50) NOT NULL REFERENCES public.pinjaman(nomor_pinjaman) ON UPDATE CASCADE ON DELETE CASCADE,
    angsuran_ke INTEGER NOT NULL,
    tanggal DATE DEFAULT CURRENT_DATE,
    jumlah NUMERIC(15,2) NOT NULL CHECK (jumlah > 0),
    metode VARCHAR(50) DEFAULT 'Tunai',
    penerima VARCHAR(100) DEFAULT 'Admin Kasir',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_angsuran_nomor_pinjaman ON public.riwayat_angsuran(nomor_pinjaman);

-- ==============================================================================
-- 7. TABEL BUKU KAS HARIAN (kas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.kas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_transaksi VARCHAR(50) UNIQUE,
    tanggal DATE DEFAULT CURRENT_DATE,
    jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('Penerimaan', 'Pengeluaran')),
    kategori VARCHAR(100) NOT NULL,
    jumlah NUMERIC(15,2) NOT NULL CHECK (jumlah > 0),
    keterangan TEXT,
    ref_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kas_tanggal ON public.kas(tanggal);
CREATE INDEX IF NOT EXISTS idx_kas_jenis ON public.kas(jenis);
CREATE INDEX IF NOT EXISTS idx_kas_kategori ON public.kas(kategori);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) & HAK AKSES
-- ==============================================================================
-- Aktifkan RLS di setiap tabel
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggota ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simpanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinjaman ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat_angsuran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kas ENABLE ROW LEVEL SECURITY;

-- Buat Kebijakan Akses Penuh untuk Public / Authenticated & Anon (agar Next.js client dapat membaca dan menulis)
CREATE POLICY "Public Read & Write settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read & Write anggota" ON public.anggota FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read & Write simpanan" ON public.simpanan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read & Write pinjaman" ON public.pinjaman FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read & Write riwayat_angsuran" ON public.riwayat_angsuran FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read & Write kas" ON public.kas FOR ALL USING (true) WITH CHECK (true);

-- Berikan izin akses pada role anon dan authenticated
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- ==============================================================================
-- 9. DATA AWAL (SEED DATA)
-- ==============================================================================
-- A. Pengaturan
INSERT INTO public.settings (
    nama_koperasi,
    badan_hukum,
    alamat,
    telepon,
    email,
    ketua,
    bendahara,
    simpanan_pokok,
    simpanan_wajib,
    suku_bunga_pinjaman,
    shu_persen_anggota,
    shu_persen_modal,
    shu_persen_pengurus,
    shu_persen_cadangan
) VALUES (
    'Koperasi Simpan Pinjam Idaman',
    'AHU-0012948.AH.01.26.TAHUN 2020',
    'Jl. Jenderal Sudirman No. 45, Jakarta Pusat',
    '(021) 5798-2345',
    'info@koperasi-idaman.co.id',
    'Drs. H. M. Supriyadi, M.M.',
    'Ratna Kusuma, S.E.',
    500000.00,
    100000.00,
    1.50,
    40.00,
    30.00,
    20.00,
    10.00
) ON CONFLICT DO NOTHING;

-- B. Anggota
INSERT INTO public.anggota (nomor_anggota, nama_lengkap, alamat_lengkap, nomor_hp, pekerjaan, tempat_lahir, tanggal_lahir, tanggal_daftar, status_keanggotaan)
VALUES
('ANG-2023-001', 'Budi Santoso', 'Jl. Merdeka No. 10, Jakarta Pusat', '0812-3456-7890', 'Pegawai Swasta', 'Jakarta', '1985-04-12', '2023-01-15', 'Aktif'),
('ANG-2023-002', 'Siti Aminah', 'Jl. Sudirman Blok B4, Bandung', '0856-7890-1234', 'Wiraswasta', 'Bandung', '1990-08-23', '2023-02-02', 'Aktif'),
('ANG-2023-018', 'Dewi Lestari', 'Komp. Mawar Hijau No. 12, Semarang', '0899-8877-6655', 'Guru', 'Semarang', '1988-11-05', '2023-03-05', 'Aktif'),
('ANG-2024-001', 'Eko Prasetyo', 'Jl. Pahlawan Gg. 3, Malang', '0813-5555-4444', 'Wiraswasta', 'Malang', '1992-06-17', '2024-01-01', 'Aktif'),
('ANG-2024-002', 'Ahmad Dahlan', 'Jl. Diponegoro No. 88, Surabaya', '0811-2233-4455', 'Dosen', 'Surabaya', '1979-02-14', '2024-02-10', 'Aktif')
ON CONFLICT (nomor_anggota) DO NOTHING;

-- C. Simpanan
INSERT INTO public.simpanan (kode_transaksi, nomor_anggota, nama_anggota, tanggal, jenis_simpanan, tipe, jumlah, metode, pencatat, keterangan)
VALUES
('SMP-001', 'ANG-2023-001', 'Budi Santoso', '2024-05-01', 'Pokok', 'Setoran', 500000.00, 'Tunai', 'Admin Kasir', 'Simpanan Pokok saat registrasi'),
('SMP-002', 'ANG-2023-001', 'Budi Santoso', '2024-05-15', 'Wajib', 'Setoran', 100000.00, 'Transfer Bank', 'Admin Kasir', 'Simpanan Wajib Mei 2024'),
('SMP-003', 'ANG-2023-001', 'Budi Santoso', '2024-05-20', 'Sukarela', 'Setoran', 1500000.00, 'Transfer Bank', 'Admin Kasir', 'Tabungan sukarela tambahan'),
('SMP-004', 'ANG-2023-002', 'Siti Aminah', '2024-05-02', 'Pokok', 'Setoran', 500000.00, 'Tunai', 'Admin Kasir', 'Simpanan Pokok awal'),
('SMP-005', 'ANG-2023-002', 'Siti Aminah', '2024-05-18', 'Wajib', 'Setoran', 100000.00, 'Tunai', 'Admin Kasir', 'Simpanan Wajib Mei 2024'),
('SMP-006', 'ANG-2023-018', 'Dewi Lestari', '2024-05-05', 'Pokok', 'Setoran', 500000.00, 'Tunai', 'Admin Kasir', 'Simpanan Pokok awal'),
('SMP-007', 'ANG-2023-018', 'Dewi Lestari', '2024-05-19', 'Wajib', 'Setoran', 100000.00, 'Tunai', 'Admin Kasir', 'Setoran Wajib bulanan'),
('SMP-008', 'ANG-2024-001', 'Eko Prasetyo', '2024-05-10', 'Pokok', 'Setoran', 500000.00, 'Transfer Bank', 'Admin Kasir', 'Setoran Pokok anggota baru'),
('SMP-009', 'ANG-2024-002', 'Ahmad Dahlan', '2024-05-12', 'Pokok', 'Setoran', 500000.00, 'Tunai', 'Admin Kasir', 'Setoran Pokok anggota baru')
ON CONFLICT (kode_transaksi) DO NOTHING;

-- D. Pinjaman
INSERT INTO public.pinjaman (
    nomor_pinjaman,
    nomor_anggota,
    nama,
    tanggal_pengajuan,
    jumlah,
    bunga,
    tenor,
    angsuran_pokok,
    angsuran_bunga,
    total_angsuran_bulanan,
    total_pinjaman,
    total_terbayar,
    sisa_hutang,
    status,
    keperluan
) VALUES
(
    'PJ-2024-001',
    'ANG-2023-001',
    'Budi Santoso',
    '2024-04-10',
    15000000.00,
    1.50,
    12,
    1250000.00,
    225000.00,
    1475000.00,
    17700000.00,
    2950000.00,
    14750000.00,
    'Berjalan',
    'Modal Usaha Toko Kelontong'
),
(
    'PJ-2024-002',
    'ANG-2023-002',
    'Siti Aminah',
    '2024-05-15',
    5000000.00,
    1.50,
    6,
    833333.00,
    75000.00,
    908333.00,
    5450000.00,
    0.00,
    5450000.00,
    'Diajukan',
    'Renovasi Rumah Ringan'
),
(
    'PJ-2024-003',
    'ANG-2024-001',
    'Eko Prasetyo',
    '2024-05-18',
    10000000.00,
    1.50,
    12,
    833333.00,
    150000.00,
    983333.00,
    11800000.00,
    0.00,
    11800000.00,
    'Disetujui',
    'Pembelian Inventaris Kerja'
)
ON CONFLICT (nomor_pinjaman) DO NOTHING;

-- E. Riwayat Angsuran
INSERT INTO public.riwayat_angsuran (nomor_pinjaman, angsuran_ke, tanggal, jumlah, metode, penerima)
VALUES
('PJ-2024-001', 1, '2024-05-10', 1475000.00, 'Transfer Bank', 'Admin Kasir'),
('PJ-2024-001', 2, '2024-06-10', 1475000.00, 'Transfer Bank', 'Admin Kasir');

-- F. Buku Kas Harian
INSERT INTO public.kas (kode_transaksi, tanggal, jenis, kategori, jumlah, keterangan, ref_id)
VALUES
('KAS-001', '2024-05-01', 'Penerimaan', 'Simpanan Pokok', 2500000.00, 'Penerimaan Simpanan Pokok Anggota Baru', 'SMP-001'),
('KAS-002', '2024-05-10', 'Penerimaan', 'Angsuran Pinjaman', 1475000.00, 'Angsuran ke-1 Pinjaman Budi Santoso (PJ-2024-001)', 'ANGS-001'),
('KAS-003', '2024-05-12', 'Pengeluaran', 'Operasional', 350000.00, 'Pembelian Alat Tulis Kantor & Kertas', NULL),
('KAS-004', '2024-05-15', 'Penerimaan', 'Simpanan Wajib', 300000.00, 'Setoran Simpanan Wajib Anggota', 'SMP-002'),
('KAS-005', '2024-05-19', 'Penerimaan', 'Simpanan Sukarela', 1500000.00, 'Setoran Simpanan Sukarela Budi Santoso', 'SMP-003'),
('KAS-006', '2024-05-20', 'Pengeluaran', 'Operasional', 200000.00, 'Biaya Konsumsi Rapat Pengurus Koperasi', NULL)
ON CONFLICT (kode_transaksi) DO NOTHING;
