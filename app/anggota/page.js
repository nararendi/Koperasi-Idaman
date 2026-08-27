'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DaftarAnggotaPage() {
  const [anggotaList, setAnggotaList] = useState([
    {
      id: 'ANG-2023-001',
      nama: 'Budi Santoso',
      alamat: 'Jl. Merdeka No. 10, Jakarta',
      nomor_hp: '0812-3456-7890',
      tanggal_daftar: '15 Jan 2023',
      status: 'Aktif'
    },
    {
      id: 'ANG-2023-002',
      nama: 'Siti Aminah',
      alamat: 'Jl. Sudirman Blok B4, Bandung',
      nomor_hp: '0856-7890-1234',
      tanggal_daftar: '02 Feb 2023',
      status: 'Aktif'
    },
    {
      id: 'ANG-2022-145',
      nama: 'Ahmad Dahlan',
      alamat: 'Jl. Diponegoro No. 88, Surabaya',
      nomor_hp: '0811-2233-4455',
      tanggal_daftar: '10 Nov 2022',
      status: 'Keluar'
    },
    {
      id: 'ANG-2023-018',
      nama: 'Dewi Lestari',
      alamat: 'Komp. Mawar Hijau, Semarang',
      nomor_hp: '0899-8877-6655',
      tanggal_daftar: '05 Mar 2023',
      status: 'Berhenti'
    },
    {
      id: 'ANG-2024-001',
      nama: 'Eko Prasetyo',
      alamat: 'Jl. Pahlawan Gg. 3, Malang',
      nomor_hp: '0813-5555-4444',
      tanggal_daftar: '01 Jan 2024',
      status: 'Aktif'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnggota() {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('anggota')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            setAnggotaList(
              data.map((item) => ({
                id: item.nomor_anggota || item.id || `ANG-${item.id}`,
                nama: item.nama_lengkap || item.nama,
                alamat: item.alamat_lengkap || item.alamat,
                nomor_hp: item.nomor_hp,
                tanggal_daftar: item.tanggal_daftar || item.created_at,
                status: item.status_keanggotaan || item.status || 'Aktif'
              }))
            );
          }
        }
      } catch (err) {
        console.info('Supabase fetch initialized:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnggota();
  }, []);

  const handleDelete = async (id) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data anggota ${id}?`)) {
      try {
        if (supabase) {
          await supabase.from('anggota').delete().eq('nomor_anggota', id);
        }
      } catch (err) {
        console.error('Gagal menghapus dari Supabase:', err);
      }
      setAnggotaList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const filteredAnggota = anggotaList.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alamat.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'aktif') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#E6FFFA] text-[#234E52] text-xs font-semibold uppercase tracking-wide">
          Aktif
        </span>
      );
    }
    if (s === 'keluar') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EDF2F7] text-[#4A5568] text-xs font-semibold uppercase tracking-wide">
          Keluar
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FED7D7] text-[#9B2C2C] text-xs font-semibold uppercase tracking-wide">
        Berhenti
      </span>
    );
  };

  return (
    <div className="bg-[#f0f3ff] text-[#111c2c] min-h-screen flex flex-col md:flex-row font-sans">
      {/* SideNavBar (Desktop) */}
      <nav className="hidden md:flex h-full w-64 fixed left-0 top-0 bg-[#002045] text-white flex-col py-6 shadow-sm z-50">
        <div className="px-4 mb-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">account_balance</span>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              Koperasi Idaman
            </h1>
            <p className="text-xs text-white/70">Management System</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1 px-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150 text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            Beranda
          </Link>
          <Link
            href="/anggota"
            className="flex items-center gap-3 px-4 py-2 rounded bg-white/10 text-white border-l-4 border-[#adc7f7] transition-all duration-150 text-xs font-bold"
          >
            <span className="material-symbols-outlined text-lg">group</span>
            Anggota
          </Link>
          <Link
            href="/simpanan"
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150 text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">
              account_balance_wallet
            </span>
            Simpanan
          </Link>
          <Link
            href="/pinjaman"
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150 text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">payments</span>
            Pinjaman
          </Link>
          <Link
            href="/kas"
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150 text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            Transaksi Kas
          </Link>
          <Link
            href="/laporan"
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150 text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">assessment</span>
            Laporan
          </Link>
        </div>

        <div className="mt-auto flex flex-col gap-1 px-2">
          <Link
            href="/pengaturan"
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150 text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            Pengaturan
          </Link>
          <button
            type="button"
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150 text-xs font-semibold text-left"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Keluar
          </button>
        </div>
      </nav>

      {/* TopNavBar (Mobile) */}
      <header className="md:hidden bg-white text-[#002045] border-b border-[#c4c6cf] flex justify-between items-center px-4 w-full h-16 z-50 fixed top-0 left-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">account_balance</span>
          <h1 className="text-base font-bold text-[#002045]">
            Sistem Informasi Koperasi
          </h1>
        </div>
        <Link
          href="/"
          className="text-[#595f66] hover:bg-[#f0f3ff] transition-colors p-2 rounded-full cursor-pointer"
        >
          <span className="material-symbols-outlined">menu</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-64 mt-16 md:mt-0 max-w-[1280px] w-full mx-auto relative min-h-screen">
        <div className="flex-1 p-4 md:p-10 flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#111c2c]">
                Daftar Anggota
              </h2>
              <p className="text-sm text-[#595f66] mt-1">
                Kelola data seluruh anggota Koperasi Idaman.
              </p>
            </div>
            <Link
              href="/anggota/tambah"
              className="bg-[#2f855a] text-white px-4 py-2 rounded text-xs font-semibold flex items-center gap-1.5 hover:bg-[#276749] transition-colors shadow-[0px_4px_12px_rgba(0,0,0,0.05)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah Anggota Baru
            </Link>
          </div>

          {/* Card Container */}
          <div className="bg-white border border-[#c4c6cf] rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-[#c4c6cf] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#f9f9ff]">
              <div className="relative w-full sm:w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-[#c4c6cf] rounded text-sm text-[#111c2c] focus:outline-none focus:border-[#2B6CB0] focus:ring-1 focus:ring-[#2B6CB0] placeholder:text-[#A0AEC0] bg-white transition-all"
                  placeholder="Cari nama / nomor anggota..."
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-semibold text-[#595f66] shrink-0">
                  Status:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto border border-[#c4c6cf] rounded px-3 py-2 text-sm text-[#111c2c] focus:outline-none focus:border-[#2B6CB0] focus:ring-1 focus:ring-[#2B6CB0] bg-white cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="keluar">Keluar</option>
                  <option value="berhenti">Berhenti</option>
                </select>
              </div>
            </div>

            {/* Table Wrapper */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F7FAFC] border-b border-[#c4c6cf]">
                    <th className="py-2.5 px-4 text-xs font-semibold text-[#595f66] uppercase whitespace-nowrap">
                      No. Anggota
                    </th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-[#595f66] uppercase whitespace-nowrap">
                      Nama Lengkap
                    </th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-[#595f66] uppercase whitespace-nowrap">
                      Alamat
                    </th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-[#595f66] uppercase whitespace-nowrap">
                      Nomor HP
                    </th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-[#595f66] uppercase whitespace-nowrap">
                      Tanggal Daftar
                    </th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-[#595f66] uppercase whitespace-nowrap">
                      Status
                    </th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-[#595f66] uppercase whitespace-nowrap text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm text-[#111c2c] divide-y divide-[#c4c6cf]">
                  {filteredAnggota.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-sm text-[#595f66]"
                      >
                        Tidak ada data anggota yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    filteredAnggota.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-[#F0F4F8] transition-colors group"
                      >
                        <td
                          className={`py-3 px-4 font-semibold ${
                            item.status.toLowerCase() !== 'aktif'
                              ? 'text-[#74777f]'
                              : ''
                          }`}
                        >
                          {item.id}
                        </td>
                        <td
                          className={`py-3 px-4 font-medium ${
                            item.status.toLowerCase() !== 'aktif'
                              ? 'text-[#74777f]'
                              : ''
                          }`}
                        >
                          {item.nama}
                        </td>
                        <td className="py-3 px-4 text-[#595f66] truncate max-w-[200px]">
                          {item.alamat}
                        </td>
                        <td className="py-3 px-4 text-[#595f66]">{item.nomor_hp}</td>
                        <td className="py-3 px-4 text-[#595f66]">
                          {item.tanggal_daftar}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              className="text-[#002045] hover:text-[#2d476f] p-1 rounded hover:bg-[#e7eeff] transition-colors"
                              title="Lihat Detail"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                visibility
                              </span>
                            </button>
                            <Link
                              href={`/anggota/edit?id=${encodeURIComponent(item.id)}`}
                              className="text-[#002045] hover:text-[#2d476f] p-1 rounded hover:bg-[#e7eeff] transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                edit
                              </span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="text-[#ba1a1a] hover:text-[#93000a] p-1 rounded hover:bg-[#ffdad6] transition-colors"
                              title="Hapus"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-[#c4c6cf] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#f9f9ff]">
              <span className="text-sm text-[#595f66]">
                Menampilkan 1-{filteredAnggota.length} dari {anggotaList.length} anggota
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="px-2 py-1 border border-[#c4c6cf] rounded bg-white text-[#595f66] hover:bg-[#f0f3ff] disabled:opacity-50"
                  disabled
                >
                  <span className="material-symbols-outlined text-[18px] leading-none">
                    chevron_left
                  </span>
                </button>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center border border-[#002045] bg-[#002045] text-white text-xs font-semibold rounded"
                >
                  1
                </button>
                <button
                  type="button"
                  className="px-2 py-1 border border-[#c4c6cf] rounded bg-white text-[#595f66] hover:bg-[#f0f3ff]"
                >
                  <span className="material-symbols-outlined text-[18px] leading-none">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#f0f3ff] border-t border-[#c4c6cf] py-4">
          <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-10 w-full max-w-[1280px] mx-auto gap-2">
            <span className="text-xs font-bold text-[#002045]">
              © 2024 Koperasi Idaman. v2.1.0-stable
            </span>
            <div className="flex gap-4 text-xs text-[#595f66]">
              <a href="#" className="hover:text-[#002045] transition-colors">
                Panduan Pengguna
              </a>
              <a href="#" className="hover:text-[#002045] transition-colors">
                Bantuan
              </a>
              <a href="#" className="hover:text-[#002045] transition-colors">
                Kebijakan Privasi
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
