-- ==============================================================================
-- SKRIP DATABASE SUPABASE LENGKAP - KOPERASI IDAMAN (EDISI LENGKAP & TERBARU)
-- Mencakup: Pengaturan, Pengguna Admin, Anggota, Simpanan, Pinjaman, Kas, Sembako, Tabungan Qurban, & Rekap Tagihan
-- ==============================================================================

-- 1. BERSIHKAN STRUKTUR TABEL LAMA JIKA INGIN RESET ULANG (CASCADE)
DROP TABLE IF EXISTS public.tagihan_override CASCADE;
DROP TABLE IF EXISTS public.qurban_mutasi CASCADE;
DROP TABLE IF EXISTS public.qurban_peserta CASCADE;
DROP TABLE IF EXISTS public.sembako_transaksi CASCADE;
DROP TABLE IF EXISTS public.sembako_produk CASCADE;
DROP TABLE IF EXISTS public.riwayat_angsuran CASCADE;
DROP TABLE IF EXISTS public.kas CASCADE;
DROP TABLE IF EXISTS public.simpanan CASCADE;
DROP TABLE IF EXISTS public.pinjaman CASCADE;
DROP TABLE IF EXISTS public.anggota CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- ------------------------------------------------------------------------------
-- 2. TABEL PENGATURAN & IDENTITAS KOPERASI
-- ------------------------------------------------------------------------------
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_koperasi VARCHAR(255) NOT NULL DEFAULT 'Koperasi Idaman',
    badan_hukum VARCHAR(255) DEFAULT 'AHU-0012948.AH.01.26.TAHUN 2020',
    alamat TEXT DEFAULT 'Jl. Situtarate - Cibaduyut, Bandung',
    telepon VARCHAR(50) DEFAULT '085323066335',
    email VARCHAR(100) DEFAULT 'info@koperasi-idaman.co.id',
    ketua VARCHAR(150) DEFAULT 'Asep Solehudin, S.Pd.',
    sekretaris VARCHAR(150) DEFAULT '',
    bendahara VARCHAR(150) DEFAULT 'Ica Cahyani',
    pengawas VARCHAR(150) DEFAULT '',
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

-- ------------------------------------------------------------------------------
-- 3. TABEL PENGGUNA ADMIN (LOGIN & AKSES)
-- ------------------------------------------------------------------------------
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(50) UNIQUE NOT NULL DEFAULT 'USR-001',
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'Super Admin' CHECK (role IN ('Super Admin', 'Bendahara', 'Kasir & Teller', 'Pengurus')),
    status VARCHAR(20) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
    avatar VARCHAR(10) DEFAULT 'AD',
    last_login VARCHAR(100) DEFAULT '-',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. TABEL ANGGOTA
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 5. TABEL TRANSAKSI SIMPANAN (POKOK, WAJIB, SUKARELA)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 6. TABEL PINJAMAN ANGGOTA
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 7. TABEL RIWAYAT ANGSURAN PINJAMAN
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 8. TABEL BUKU KAS HARIAN (ARUS KAS)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 9. TABEL PRODUK TOKO & SEMBAKO
-- ------------------------------------------------------------------------------
CREATE TABLE public.sembako_produk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_produk VARCHAR(50) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    satuan VARCHAR(50) DEFAULT 'Pcs',
    harga_beli NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    harga_jual NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    stok INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 10. TABEL TRANSAKSI PENJUALAN SEMBAKO / KASIR
-- ------------------------------------------------------------------------------
CREATE TABLE public.sembako_transaksi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_transaksi VARCHAR(50) UNIQUE NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    pembeli VARCHAR(255) NOT NULL,
    nomor_anggota VARCHAR(50) DEFAULT '-',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    bayar NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    kembali NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    metode VARCHAR(30) DEFAULT 'Tunai',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 11. TABEL PESERTA TABUNGAN QURBAN
-- ------------------------------------------------------------------------------
CREATE TABLE public.qurban_peserta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_peserta VARCHAR(50) UNIQUE NOT NULL,
    nomor_anggota VARCHAR(50) DEFAULT '-',
    nama VARCHAR(255) NOT NULL,
    tipe_hewan VARCHAR(100) NOT NULL,
    target_nominal NUMERIC(15, 2) NOT NULL DEFAULT 3500000.00,
    total_terkumpul NUMERIC(15, 2) DEFAULT 0.00,
    sisa_target NUMERIC(15, 2) NOT NULL,
    tahun_qurban VARCHAR(50) DEFAULT '1448 H / 2026',
    status VARCHAR(30) DEFAULT 'Berjalan' CHECK (status IN ('Berjalan', 'Tercapai', 'Tersalurkan')),
    tanggal_daftar DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 12. TABEL MUTASI TABUNGAN QURBAN (SETORAN / PENYALURAN)
-- ------------------------------------------------------------------------------
CREATE TABLE public.qurban_mutasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_mutasi VARCHAR(50) UNIQUE NOT NULL,
    peserta_id VARCHAR(50) NOT NULL REFERENCES public.qurban_peserta(kode_peserta) ON DELETE CASCADE,
    nomor_anggota VARCHAR(50) DEFAULT '-',
    nama_peserta VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    tipe VARCHAR(20) NOT NULL DEFAULT 'Setoran' CHECK (tipe IN ('Setoran', 'Penyaluran')),
    jumlah NUMERIC(15, 2) NOT NULL CHECK (jumlah > 0),
    metode VARCHAR(30) DEFAULT 'Tunai',
    keterangan TEXT,
    pencatat VARCHAR(100) DEFAULT 'Admin Kasir',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 13. TABEL PENYESUAIAN TAGIHAN BULANAN (OVERRIDE POTONGAN)
-- ------------------------------------------------------------------------------
CREATE TABLE public.tagihan_override (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    periode VARCHAR(20) NOT NULL, -- Format YYYY-MM
    nomor_anggota VARCHAR(50) NOT NULL REFERENCES public.anggota(nomor_anggota) ON DELETE CASCADE,
    wajib NUMERIC(15, 2),
    sukarela NUMERIC(15, 2),
    qurban NUMERIC(15, 2),
    cicilan_ke INT,
    pokok NUMERIC(15, 2),
    jasa NUMERIC(15, 2),
    sembako NUMERIC(15, 2),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(periode, nomor_anggota)
);

-- ------------------------------------------------------------------------------
-- 14. INDEXING UNTUK OPTIMASI PERFORMA QUERY
-- ------------------------------------------------------------------------------
CREATE INDEX idx_anggota_nomor ON public.anggota(nomor_anggota);
CREATE INDEX idx_simpanan_anggota ON public.simpanan(nomor_anggota);
CREATE INDEX idx_simpanan_tanggal ON public.simpanan(tanggal);
CREATE INDEX idx_pinjaman_anggota ON public.pinjaman(nomor_anggota);
CREATE INDEX idx_pinjaman_status ON public.pinjaman(status);
CREATE INDEX idx_riwayat_pinjaman ON public.riwayat_angsuran(nomor_pinjaman);
CREATE INDEX idx_kas_tanggal ON public.kas(tanggal);
CREATE INDEX idx_kas_jenis ON public.kas(jenis);
CREATE INDEX idx_sembako_produk_kode ON public.sembako_produk(kode_produk);
CREATE INDEX idx_qurban_peserta_kode ON public.qurban_peserta(kode_peserta);
CREATE INDEX idx_qurban_mutasi_peserta ON public.qurban_mutasi(peserta_id);
CREATE INDEX idx_tagihan_periode ON public.tagihan_override(periode);

-- ------------------------------------------------------------------------------
-- 15. ROW LEVEL SECURITY (RLS) & HAK AKSES API SUPABASE
-- ------------------------------------------------------------------------------
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggota ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simpanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinjaman ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat_angsuran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sembako_produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sembako_transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qurban_peserta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qurban_mutasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tagihan_override ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Penuh untuk API Client
CREATE POLICY "Public settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public anggota" ON public.anggota FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public simpanan" ON public.simpanan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public pinjaman" ON public.pinjaman FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public riwayat_angsuran" ON public.riwayat_angsuran FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public kas" ON public.kas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public sembako_produk" ON public.sembako_produk FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public sembako_transaksi" ON public.sembako_transaksi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public qurban_peserta" ON public.qurban_peserta FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public qurban_mutasi" ON public.qurban_mutasi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public tagihan_override" ON public.tagihan_override FOR ALL USING (true) WITH CHECK (true);

-- Memberi izin operasi ke role Supabase
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 16. DATA AWAL (SEED INITIAL DATA)
-- ------------------------------------------------------------------------------

-- Pengaturan Koperasi
INSERT INTO public.settings (
    nama_koperasi, badan_hukum, alamat, telepon, email, ketua, bendahara,
    simpanan_pokok, simpanan_wajib, suku_bunga_pinjaman,
    shu_persen_anggota, shu_persen_modal, shu_persen_pengurus, shu_persen_cadangan
) VALUES (
    'Koperasi Idaman', 'AHU-0012948.AH.01.26.TAHUN 2020', 'Jl. Situtarate - Cibaduyut, Bandung',
    '085323066335', 'info@koperasi-idaman.co.id', 'Asep Solehudin, S.Pd.', 'Ica Cahyani',
    500000.00, 100000.00, 1.50, 40.00, 30.00, 20.00, 10.00
);

-- Akun Pengguna Admin Default
INSERT INTO public.users (user_id, username, password, nama, email, role, status, avatar)
VALUES 
('USR-001', 'admin', 'rendi123', 'Rendi Yosandi, A.Md.', 'nararendi@gmail.com', 'Super Admin', 'Aktif', 'AD'),
('USR-002', 'bendahara', 'icacahyani123', 'Ica Cahyani', 'ica@smkassalaambandung.sch.id', 'Bendahara', 'Aktif', 'IC'),
('USR-003', 'kasir', 'wini123', 'Wini Desi', 'wini.kasir@koperasi-idaman.co.id', 'Kasir & Teller', 'Aktif', 'SR');

-- Data Katalog Produk Sembako Awal
INSERT INTO public.sembako_produk (kode_produk, nama, kategori, satuan, harga_beli, harga_jual, stok)
VALUES
('PRD-001', 'Beras Premium Ramos 5 Kg', 'Beras', 'Karung 5kg', 65000.00, 74000.00, 35),
('PRD-002', 'Minyak Goreng Refill 2 Liter', 'Minyak', 'Pouch 2L', 30000.00, 34500.00, 48),
('PRD-003', 'Gula Pasir Kristal Putih 1 Kg', 'Gula', 'Bungkus 1kg', 15000.00, 17500.00, 50),
('PRD-004', 'Tepung Terigu Segitiga Biru 1 Kg', 'Tepung', 'Bungkus 1kg', 11000.00, 13000.00, 40),
('PRD-005', 'Telur Ayam Negeri 1 Kg (Tray)', 'Telur', 'Kg', 26000.00, 29000.00, 25);
