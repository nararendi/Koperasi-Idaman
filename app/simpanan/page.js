'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function SimpananPage() {
  const [summary, setSummary] = useState({
    pokok: 'Rp 500.000.000',
    wajib: 'Rp 750.000.000',
    sukarela: 'Rp 1.250.000.000'
  });

  const [riwayatSimpanan, setRiwayatSimpanan] = useState([
    {
      id: 1,
      tanggal: '24 Okt 2024',
      nama: 'Budi Santoso',
      nomor_anggota: 'ANG-2023-001',
      jenis: 'Sukarela',
      jumlah: 'Rp 500.000',
      pencatat: 'Admin Pusat',
      keterangan: 'Setoran tunai via teller'
    },
    {
      id: 2,
      tanggal: '24 Okt 2024',
      nama: 'Siti Aminah',
      nomor_anggota: 'ANG-2023-002',
      jenis: 'Wajib',
      jumlah: 'Rp 100.000',
      pencatat: 'Admin Pusat',
      keterangan: 'Potong gaji bulanan'
    },
    {
      id: 3,
      tanggal: '23 Okt 2024',
      nama: 'Ahmad Fauzi',
      nomor_anggota: 'ANG-2022-145',
      jenis: 'Pokok',
      jumlah: 'Rp 1.000.000',
      pencatat: 'Teller 1',
      keterangan: 'Pendaftaran anggota baru'
    },
    {
      id: 4,
      tanggal: '23 Okt 2024',
      nama: 'Rina Wijaya',
      nomor_anggota: 'ANG-2024-001',
      jenis: 'Sukarela',
      jumlah: 'Rp 2.500.000',
      pencatat: 'Admin Pusat',
      keterangan: 'Transfer Bank'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [jenisFilter, setJenisFilter] = useState('all');

  useEffect(() => {
    async function loadSimpanan() {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('simpanan')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            setRiwayatSimpanan(
              data.map((item) => ({
                id: item.id,
                tanggal: item.tanggal || item.created_at,
                nama: item.nama_anggota || item.nama,
                nomor_anggota: item.nomor_anggota,
                jenis: item.jenis_simpanan || item.jenis,
                jumlah: `Rp ${Number(item.jumlah || 0).toLocaleString('id-ID')}`,
                pencatat: item.pencatat || 'Admin',
                keterangan: item.keterangan || '-'
              }))
            );
          }
        }
      } catch (err) {
        console.info('Supabase simpanan check:', err);
      }
    }

    loadSimpanan();
  }, []);

  const filteredData = riwayatSimpanan.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nomor_anggota.toLowerCase().includes(searchQuery.toLowerCase());
    const matchJenis =
      jenisFilter === 'all' ||
      item.jenis.toLowerCase() === jenisFilter.toLowerCase();
    return matchSearch && matchJenis;
  });

  return (
    <div className="bg-[#f9f9ff] text-[#111c2c] min-h-screen flex flex-col md:flex-row font-sans">
      {/* SideNavBar */}
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
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            Beranda
          </Link>
          <Link
            href="/anggota"
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">group</span>
            Anggota
          </Link>
          <Link
            href="/simpanan"
            className="flex items-center gap-3 px-4 py-2 rounded bg-white/10 text-white border-l-4 border-[#adc7f7] transition-all text-xs font-bold"
          >
            <span className="material-symbols-outlined text-lg">
              account_balance_wallet
            </span>
            Simpanan
          </Link>
          <Link
            href="/pinjaman"
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">payments</span>
            Pinjaman
          </Link>
          <Link
            href="/kas"
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            Transaksi Kas
          </Link>
          <Link
            href="/laporan"
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">assessment</span>
            Laporan
          </Link>
        </div>

        <div className="mt-auto flex flex-col gap-1 px-2">
          <Link
            href="/pengaturan"
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            Pengaturan
          </Link>
          <button
            type="button"
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold text-left"
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
                Manajemen Simpanan
              </h2>
              <p className="text-sm text-[#595f66] mt-1">
                Ringkasan total simpanan anggota dan riwayat transaksi setoran.
              </p>
            </div>
            <button
              type="button"
              className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white px-4 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-[0px_4px_12px_rgba(0,0,0,0.05)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Catat Setoran Baru
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#c4c6cf] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xs font-semibold text-[#595f66] uppercase tracking-wider">
                  Total Simpanan Pokok
                </h3>
                <div className="w-8 h-8 rounded bg-[#e7eeff] flex items-center justify-center text-[#1a365d]">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1a365d]">{summary.pokok}</p>
              <div className="mt-3 pt-2 border-t border-[#c4c6cf] flex items-center text-xs text-[#595f66]">
                <span className="material-symbols-outlined text-[16px] text-[#2e7d32] mr-1">
                  trending_up
                </span>
                Wajib saat pendaftaran awal
              </div>
            </div>

            <div className="bg-white border border-[#c4c6cf] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xs font-semibold text-[#595f66] uppercase tracking-wider">
                  Total Simpanan Wajib
                </h3>
                <div className="w-8 h-8 rounded bg-[#e7eeff] flex items-center justify-center text-[#1a365d]">
                  <span className="material-symbols-outlined text-[20px]">autorenew</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1a365d]">{summary.wajib}</p>
              <div className="mt-3 pt-2 border-t border-[#c4c6cf] flex items-center text-xs text-[#595f66]">
                <span className="material-symbols-outlined text-[16px] text-[#2e7d32] mr-1">
                  trending_up
                </span>
                Iuran bulanan anggota
              </div>
            </div>

            <div className="bg-white border border-[#c4c6cf] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xs font-semibold text-[#595f66] uppercase tracking-wider">
                  Total Simpanan Sukarela
                </h3>
                <div className="w-8 h-8 rounded bg-[#e7eeff] flex items-center justify-center text-[#1a365d]">
                  <span className="material-symbols-outlined text-[20px]">savings</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1a365d]">{summary.sukarela}</p>
              <div className="mt-3 pt-2 border-t border-[#c4c6cf] flex items-center text-xs text-[#595f66]">
                <span className="material-symbols-outlined text-[16px] text-[#595f66] mr-1">
                  drag_handle
                </span>
                Simpanan bebas dapat ditarik
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-[#c4c6cf] rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b border-[#c4c6cf] bg-[#f9f9ff] flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-[#595f66] mb-1">
                  Pilih Anggota
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f] text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded border border-[#c4c6cf] text-sm focus:border-[#2B6CB0] focus:ring-1 focus:ring-[#2B6CB0] placeholder:text-[#A0AEC0] bg-white"
                    placeholder="Cari nama atau No. Anggota..."
                  />
                </div>
              </div>

              <div className="w-48 shrink-0">
                <label className="block text-xs font-semibold text-[#595f66] mb-1">
                  Jenis Simpanan
                </label>
                <select
                  value={jenisFilter}
                  onChange={(e) => setJenisFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#c4c6cf] text-sm focus:border-[#2B6CB0] focus:ring-1 focus:ring-[#2B6CB0] bg-white cursor-pointer"
                >
                  <option value="all">Semua Jenis</option>
                  <option value="pokok">Simpanan Pokok</option>
                  <option value="wajib">Simpanan Wajib</option>
                  <option value="sukarela">Simpanan Sukarela</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7FAFC] border-b border-[#c4c6cf]">
                    <th className="py-2.5 px-4 text-xs font-semibold text-[#595f66] uppercase whitespace-nowrap">
                      Tanggal Setor
                    </th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-[#595f66] uppercase whitespace-nowrap">
                      Nama Anggota
                    </th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-[#595f66] uppercase whitespace-nowrap">
                      No. Anggota
                    </th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-[#595f66] uppercase whitespace-nowrap">
                      Jenis Simpanan
                    </th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-[#595f66] uppercase whitespace-nowrap text-right">
                      Jumlah Setoran
                    </th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-[#595f66] uppercase whitespace-nowrap">
                      Pencatat
                    </th>
                    <th className="py-2.5 px-4 text-xs font-semibold text-[#595f66] uppercase whitespace-nowrap">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c6cf] text-sm">
                  {filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F0F4F8] transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-[#111c2c]">
                        {item.tanggal}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#1a365d]">
                        {item.nama}
                      </td>
                      <td className="py-3 px-4 text-[#595f66]">
                        {item.nomor_anggota}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#e7eeff] text-[#003765] border border-[#c4c6cf]">
                          {item.jenis}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-[#2e7d32] font-semibold tabular-nums">
                        {item.jumlah}
                      </td>
                      <td className="py-3 px-4 text-[#595f66]">{item.pencatat}</td>
                      <td className="py-3 px-4 text-[#595f66] truncate max-w-[180px]">
                        {item.keterangan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-[#c4c6cf] flex items-center justify-between bg-[#f9f9ff]">
              <span className="text-xs text-[#595f66]">
                Menampilkan 1-{filteredData.length} data
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="w-8 h-8 rounded border border-[#c4c6cf] flex items-center justify-center text-[#595f66] hover:bg-[#e7eeff] disabled:opacity-50"
                  disabled
                >
                  <span className="material-symbols-outlined text-[16px]">
                    chevron_left
                  </span>
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded border border-[#002045] bg-[#002045] flex items-center justify-center text-white text-xs font-semibold"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded border border-[#c4c6cf] flex items-center justify-center text-[#595f66] hover:bg-[#e7eeff]"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#f0f3ff] border-t border-[#c4c6cf] py-4">
          <div className="w-full max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center px-4 md:px-10 gap-2">
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
