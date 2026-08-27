'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function TambahAnggotaPage() {
  const [formData, setFormData] = useState({
    nomor_anggota: '',
    nama_lengkap: '',
    alamat_lengkap: '',
    nomor_hp: '',
    pekerjaan: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    tanggal_daftar: '',
    status_keanggotaan: 'aktif'
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Generate nomor anggota and set default today's date
    const today = new Date().toISOString().split('T')[0];
    const year = new Date().getFullYear();
    const randomSeq = String(Math.floor(Math.random() * 900) + 100);
    const autoNumber = `ANG-${year}-${randomSeq}`;

    setFormData((prev) => ({
      ...prev,
      nomor_anggota: autoNumber,
      tanggal_daftar: today
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      if (supabase) {
        const { error } = await supabase.from('anggota').insert([
          {
            nomor_anggota: formData.nomor_anggota,
            nama_lengkap: formData.nama_lengkap,
            alamat_lengkap: formData.alamat_lengkap,
            nomor_hp: formData.nomor_hp,
            pekerjaan: formData.pekerjaan,
            tempat_lahir: formData.tempat_lahir,
            tanggal_lahir: formData.tanggal_lahir || null,
            tanggal_daftar: formData.tanggal_daftar,
            status_keanggotaan: formData.status_keanggotaan
          }
        ]);

        if (error) {
          console.warn('Supabase insert note:', error.message);
        }
      }

      setSuccessMessage(
        `Anggota baru "${formData.nama_lengkap}" dengan No. ${formData.nomor_anggota} berhasil didaftarkan!`
      );

      // Generate next auto-number for subsequent entries
      const year = new Date().getFullYear();
      const randomSeq = String(Math.floor(Math.random() * 900) + 100);
      setFormData({
        nomor_anggota: `ANG-${year}-${randomSeq}`,
        nama_lengkap: '',
        alamat_lengkap: '',
        nomor_hp: '',
        pekerjaan: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        tanggal_daftar: new Date().toISOString().split('T')[0],
        status_keanggotaan: 'aktif'
      });
    } catch (err) {
      setErrorMessage('Terjadi kesalahan saat menyimpan data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f9f9ff] text-[#111c2c] min-h-screen flex flex-col md:flex-row font-sans">
      {/* SideNavBar (Desktop) */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#002045] text-white border-r border-[#c4c6cf] py-6 z-20">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-bold text-white leading-tight">
            Koperasi Idaman
          </h1>
          <p className="text-xs text-white/70">Admin Portal</p>
        </div>

        <div className="px-6 mb-6">
          <Link
            href="/anggota/tambah"
            className="w-full bg-white text-[#002045] text-xs font-bold py-2.5 px-4 rounded flex items-center justify-center gap-2 hover:bg-white/90 transition-colors shadow"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Baru
          </Link>
        </div>

        <ul className="flex flex-col flex-1 px-3 gap-1">
          <li>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded text-white/70 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium"
            >
              <span className="material-symbols-outlined text-lg">dashboard</span>
              <span>Beranda</span>
            </Link>
          </li>
          <li>
            <Link
              href="/anggota"
              className="flex items-center gap-3 px-3 py-2 rounded bg-white/10 border-l-4 border-white text-white font-bold transition-colors text-xs"
            >
              <span className="material-symbols-outlined text-lg">group</span>
              <span>Anggota</span>
            </Link>
          </li>
          <li>
            <Link
              href="/simpanan"
              className="flex items-center gap-3 px-3 py-2 rounded text-white/70 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium"
            >
              <span className="material-symbols-outlined text-lg">
                account_balance_wallet
              </span>
              <span>Simpanan</span>
            </Link>
          </li>
          <li>
            <Link
              href="/pinjaman"
              className="flex items-center gap-3 px-3 py-2 rounded text-white/70 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium"
            >
              <span className="material-symbols-outlined text-lg">payments</span>
              <span>Pinjaman</span>
            </Link>
          </li>
          <li>
            <Link
              href="/kas"
              className="flex items-center gap-3 px-3 py-2 rounded text-white/70 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium"
            >
              <span className="material-symbols-outlined text-lg">receipt_long</span>
              <span>Transaksi Kas</span>
            </Link>
          </li>
          <li>
            <Link
              href="/laporan"
              className="flex items-center gap-3 px-3 py-2 rounded text-white/70 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium"
            >
              <span className="material-symbols-outlined text-lg">assessment</span>
              <span>Laporan</span>
            </Link>
          </li>
        </ul>

        <div className="mt-auto px-3 flex flex-col gap-1 border-t border-white/10 pt-3 mx-2">
          <Link
            href="/pengaturan"
            className="flex items-center gap-3 px-3 py-2 rounded text-white/70 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            <span>Pengaturan</span>
          </Link>
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-2 rounded text-white/70 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium text-left"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Keluar</span>
          </button>
        </div>
      </nav>

      {/* TopAppBar (Desktop) */}
      <header className="hidden md:flex items-center justify-between px-10 ml-64 bg-[#f9f9ff] text-[#002045] border-b border-[#c4c6cf] fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-10 shadow-sm">
        <div className="text-lg font-bold text-[#002045]">
          Pendaftaran Anggota
        </div>
        <div className="flex items-center gap-3">
          <button
            aria-label="Notifikasi"
            className="text-[#595f66] hover:text-[#002045] hover:bg-[#f0f3ff] transition-colors p-2 rounded-full cursor-pointer"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#1a365d] text-white flex items-center justify-center font-semibold text-xs border border-[#c4c6cf]">
            AD
          </div>
        </div>
      </header>

      {/* TopNavBar (Mobile) */}
      <header className="md:hidden bg-white text-[#002045] border-b border-[#c4c6cf] flex justify-between items-center px-4 w-full h-16 z-50 fixed top-0 left-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">account_balance</span>
          <h1 className="text-base font-bold text-[#002045]">Koperasi Idaman</h1>
        </div>
        <Link
          href="/anggota"
          className="text-[#595f66] hover:bg-[#f0f3ff] transition-colors p-2 rounded-full cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-20 md:pt-20 min-h-screen px-4 md:px-10 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-[#595f66] mb-2">
              <Link href="/anggota" className="hover:underline text-[#1a365d]">
                Daftar Anggota
              </Link>
              <span>/</span>
              <span>Tambah Baru</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#111c2c] mb-1">
              Pendaftaran Anggota Baru
            </h2>
            <p className="text-sm text-[#43474e]">
              Lengkapi formulir di bawah ini untuk mendaftarkan anggota baru ke dalam sistem.
            </p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 rounded-lg bg-[#E6F4EA] border border-[#A8DAB5] text-[#137333] text-sm flex items-center gap-3">
              <span className="material-symbols-outlined">check_circle</span>
              <span className="flex-1">{successMessage}</span>
              <Link
                href="/anggota"
                className="underline font-semibold text-xs text-[#137333]"
              >
                Lihat Daftar Anggota
              </Link>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-lg bg-[#FFDAD6] border border-[#FFB4AB] text-[#93000A] text-sm flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="bg-white border border-[#c4c6cf] rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-[#c4c6cf] bg-[#f9f9ff]">
              <h3 className="text-lg font-semibold text-[#111c2c]">
                Informasi Data Diri
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-bold text-[#111c2c]"
                    htmlFor="nomor_anggota"
                  >
                    Nomor Anggota
                  </label>
                  <input
                    id="nomor_anggota"
                    name="nomor_anggota"
                    value={formData.nomor_anggota}
                    readOnly
                    type="text"
                    className="bg-[#f0f3ff] border border-[#c4c6cf] rounded px-4 py-2 text-sm text-[#595f66] cursor-not-allowed focus:outline-none"
                    placeholder="Akan diisi otomatis oleh sistem"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-bold text-[#111c2c]"
                    htmlFor="nama_lengkap"
                  >
                    Nama Lengkap <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    id="nama_lengkap"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    required
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    className="border border-[#c4c6cf] rounded px-4 py-2 text-sm focus:border-[#2B6CB0] focus:ring-1 focus:ring-[#2B6CB0] focus:outline-none transition-shadow placeholder:text-[#A0AEC0]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-bold text-[#111c2c]"
                  htmlFor="alamat_lengkap"
                >
                  Alamat Lengkap <span className="text-[#ba1a1a]">*</span>
                </label>
                <textarea
                  id="alamat_lengkap"
                  name="alamat_lengkap"
                  value={formData.alamat_lengkap}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Masukkan alamat domisili lengkap"
                  className="border border-[#c4c6cf] rounded px-4 py-2 text-sm focus:border-[#2B6CB0] focus:ring-1 focus:ring-[#2B6CB0] focus:outline-none transition-shadow placeholder:text-[#A0AEC0] resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-bold text-[#111c2c]"
                    htmlFor="nomor_hp"
                  >
                    Nomor HP <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    id="nomor_hp"
                    name="nomor_hp"
                    value={formData.nomor_hp}
                    onChange={handleChange}
                    required
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    className="border border-[#c4c6cf] rounded px-4 py-2 text-sm focus:border-[#2B6CB0] focus:ring-1 focus:ring-[#2B6CB0] focus:outline-none transition-shadow placeholder:text-[#A0AEC0]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-bold text-[#111c2c]"
                    htmlFor="pekerjaan"
                  >
                    Pekerjaan
                  </label>
                  <input
                    id="pekerjaan"
                    name="pekerjaan"
                    value={formData.pekerjaan}
                    onChange={handleChange}
                    type="text"
                    placeholder="Contoh: Karyawan Swasta / Wiraswasta"
                    className="border border-[#c4c6cf] rounded px-4 py-2 text-sm focus:border-[#2B6CB0] focus:ring-1 focus:ring-[#2B6CB0] focus:outline-none transition-shadow placeholder:text-[#A0AEC0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-bold text-[#111c2c]"
                    htmlFor="tempat_lahir"
                  >
                    Tempat Lahir
                  </label>
                  <input
                    id="tempat_lahir"
                    name="tempat_lahir"
                    value={formData.tempat_lahir}
                    onChange={handleChange}
                    type="text"
                    placeholder="Contoh: Jakarta"
                    className="border border-[#c4c6cf] rounded px-4 py-2 text-sm focus:border-[#2B6CB0] focus:ring-1 focus:ring-[#2B6CB0] focus:outline-none transition-shadow placeholder:text-[#A0AEC0]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-bold text-[#111c2c]"
                    htmlFor="tanggal_lahir"
                  >
                    Tanggal Lahir
                  </label>
                  <input
                    id="tanggal_lahir"
                    name="tanggal_lahir"
                    value={formData.tanggal_lahir}
                    onChange={handleChange}
                    type="date"
                    className="border border-[#c4c6cf] rounded px-4 py-2 text-sm focus:border-[#2B6CB0] focus:ring-1 focus:ring-[#2B6CB0] focus:outline-none transition-shadow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#c4c6cf] pt-6 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-bold text-[#111c2c]"
                    htmlFor="tanggal_daftar"
                  >
                    Tanggal Daftar
                  </label>
                  <input
                    id="tanggal_daftar"
                    name="tanggal_daftar"
                    value={formData.tanggal_daftar}
                    onChange={handleChange}
                    type="date"
                    className="border border-[#c4c6cf] rounded px-4 py-2 text-sm focus:border-[#2B6CB0] focus:ring-1 focus:ring-[#2B6CB0] focus:outline-none transition-shadow"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-bold text-[#111c2c]"
                    htmlFor="status_keanggotaan"
                  >
                    Status Keanggotaan
                  </label>
                  <select
                    id="status_keanggotaan"
                    name="status_keanggotaan"
                    value={formData.status_keanggotaan}
                    onChange={handleChange}
                    className="border border-[#c4c6cf] rounded px-4 py-2 text-sm focus:border-[#2B6CB0] focus:ring-1 focus:ring-[#2B6CB0] focus:outline-none transition-shadow bg-white cursor-pointer"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="keluar">Keluar</option>
                    <option value="berhenti">Berhenti</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 mt-4 pt-6 border-t border-[#c4c6cf]">
                <Link
                  href="/anggota"
                  className="text-sm font-semibold text-[#595f66] px-6 py-2.5 rounded hover:bg-[#f0f3ff] transition-colors inline-flex items-center justify-center cursor-pointer"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#1a365d] text-white text-sm font-semibold px-6 py-2.5 rounded hover:bg-[#002045] transition-colors shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    'Menyimpan...'
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">
                        save
                      </span>
                      Simpan Anggota
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
