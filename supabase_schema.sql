-- ==============================================================================
-- SKRIP DATABASE SUPABASE LENGKAP - KOPERASI SIMPAN PINJAM IDAMAN (BERSIH / TANPA DATA DEMO)
-- ==============================================================================

-- 1. BERSIHKAN STRUKTUR TABEL LAMA JIKA ADA (CASCADE)
DROP TABLE IF EXISTS public.riwayat_angsuran CASCADE;
DROP TABLE IF EXISTS public.kas CASCADE;
DROP TABLE IF EXISTS public.simpanan CASCADE;
DROP TABLE IF EXISTS public.pinjaman CASCADE;
DROP TABLE IF EXISTS public.anggota CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- 2. TABEL PENGATURAN & PARAMETER KOPERASI
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_koperasi VARCHAR(255) NOT NULL DEFAULT 'Koperasi Simpan Pinjam Idaman',
    badan_hukum VARCHAR(255) DEFAULT 'AHU-0012948.AH.01.26.TAHUN 2020',
    alamat TEXT DEFAULT 'Jl. Jenderal Sudirman No. 45, Jakarta Pusat',
    telepon VARCHAR(50) DEFAULT '(021) 5798-2345',
    email VARCHAR(100) DEFAULT 'info@koperasi-idaman.co.id',
    ketua VARCHAR(150) DEFAULT 'Drs. H. M. Supriyadi, M.M.',
    bendahara VARCHAR(150) DEFAULT 'Ratna Kusuma, S.E.',
    simpanan_pokok NUMERIC(15, 2) DEFAULT 500000.00,
    simpanan_wajib NUMERIC(15, 2) DEFAULT 100000.00,
    suku_bunga_pinjaman NUMERIC(5, 2) DEFAULT 1.50,
    shu_persen_anggota NUMERIC(5, 2) DEFAULT 40.00,
    shu_persen_modal NUMERIC(5, 2) DEFAULT 30.00,
    shu_persen_pengurus NUMERIC(5, 2) DEFAULT 20.00,
    shu_persen_cadangan NUMERIC(5, 2) DEFAULT 10.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABEL ANGGOTA
CREATE TABLE public.anggota (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_anggota VARCHAR(50) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    alamat_lengkap TEXT,
    nomor_hp VARCHAR(30),
    pekerjaan VARCHAR(100),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    tanggal_daftar DATE DEFAULT CURRENT_DATE,
    status_keanggotaan VARCHAR(20) DEFAULT 'Aktif' CHECK (status_keanggotaan IN ('Aktif', 'Keluar', 'Berhenti')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABEL TRANSAKSI SIMPANAN
CREATE TABLE public.simpanan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_transaksi VARCHAR(50) UNIQUE NOT NULL,
    nomor_anggota VARCHAR(50) NOT NULL REFERENCES public.anggota(nomor_anggota) ON DELETE CASCADE,
    nama_anggota VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jenis_simpanan VARCHAR(20) NOT NULL CHECK (jenis_simpanan IN ('Pokok', 'Wajib', 'Sukarela')),
    tipe VARCHAR(20) NOT NULL DEFAULT 'Setoran' CHECK (tipe IN ('Setoran', 'Penarikan')),
    jumlah NUMERIC(15, 2) NOT NULL CHECK (jumlah > 0),
    metode VARCHAR(30) DEFAULT 'Tunai',
    pencatat VARCHAR(100) DEFAULT 'Admin Kasir',
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABEL PINJAMAN & PENGAJUAN KREDIT
CREATE TABLE public.pinjaman (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_pinjaman VARCHAR(50) UNIQUE NOT NULL,
    nomor_anggota VARCHAR(50) NOT NULL REFERENCES public.anggota(nomor_anggota) ON DELETE CASCADE,
    nama VARCHAR(255) NOT NULL,
    tanggal_pengajuan DATE NOT NULL DEFAULT CURRENT_DATE,
    jumlah NUMERIC(15, 2) NOT NULL CHECK (jumlah > 0),
    bunga NUMERIC(5, 2) NOT NULL DEFAULT 1.50,
    tenor INT NOT NULL CHECK (tenor > 0),
    angsuran_pokok NUMERIC(15, 2) NOT NULL,
    angsuran_bunga NUMERIC(15, 2) NOT NULL,
    total_angsuran_bulanan NUMERIC(15, 2) NOT NULL,
    total_pinjaman NUMERIC(15, 2) NOT NULL,
    total_terbayar NUMERIC(15, 2) DEFAULT 0.00,
    sisa_hutang NUMERIC(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Diajukan' CHECK (status IN ('Diajukan', 'Disetujui', 'Berjalan', 'Lunas', 'Ditolak')),
    keperluan TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TABEL RIWAYAT ANGSURAN PINJAMAN
CREATE TABLE public.riwayat_angsuran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_pinjaman VARCHAR(50) NOT NULL REFERENCES public.pinjaman(nomor_pinjaman) ON DELETE CASCADE,
    angsuran_ke INT NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jumlah NUMERIC(15, 2) NOT NULL CHECK (jumlah > 0),
    metode VARCHAR(30) DEFAULT 'Tunai',
    penerima VARCHAR(100) DEFAULT 'Admin Kasir',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TABEL BUKU KAS HARIAN
CREATE TABLE public.kas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_transaksi VARCHAR(50) UNIQUE NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('Penerimaan', 'Pengeluaran')),
    kategori VARCHAR(100) NOT NULL,
    jumlah NUMERIC(15, 2) NOT NULL CHECK (jumlah > 0),
    keterangan TEXT,
    ref_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. INDEXING UNTUK KECEPATAN QUERY
CREATE INDEX idx_anggota_nomor ON public.anggota(nomor_anggota);
CREATE INDEX idx_anggota_status ON public.anggota(status_keanggotaan);
CREATE INDEX idx_simpanan_anggota ON public.simpanan(nomor_anggota);
CREATE INDEX idx_simpanan_tanggal ON public.simpanan(tanggal);
CREATE INDEX idx_pinjaman_anggota ON public.pinjaman(nomor_anggota);
CREATE INDEX idx_pinjaman_status ON public.pinjaman(status);
CREATE INDEX idx_riwayat_pinjaman ON public.riwayat_angsuran(nomor_pinjaman);
CREATE INDEX idx_kas_tanggal ON public.kas(tanggal);
CREATE INDEX idx_kas_jenis ON public.kas(jenis);
CREATE INDEX idx_kas_kategori ON public.kas(kategori);

-- 9. ROW LEVEL SECURITY (RLS) & PERMISSIONS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggota ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simpanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinjaman ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat_angsuran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public All settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All anggota" ON public.anggota FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All simpanan" ON public.simpanan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All pinjaman" ON public.pinjaman FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All riwayat_angsuran" ON public.riwayat_angsuran FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All kas" ON public.kas FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 10. INISIALISASI SETTINGS DEFAULT
INSERT INTO public.settings (nama_koperasi, badan_hukum, alamat, telepon, email, ketua, bendahara, simpanan_pokok, simpanan_wajib, suku_bunga_pinjaman, shu_persen_anggota, shu_persen_modal, shu_persen_pengurus, shu_persen_cadangan)
VALUES ('Koperasi Simpan Pinjam Idaman', 'AHU-0012948.AH.01.26.TAHUN 2020', 'Jl. Jenderal Sudirman No. 45, Jakarta Pusat', '(021) 5798-2345', 'info@koperasi-idaman.co.id', 'Drs. H. M. Supriyadi, M.M.', 'Ratna Kusuma, S.E.', 500000.00, 100000.00, 1.50, 40.00, 30.00, 20.00, 10.00);
