'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PinjamanPage() {
  const [summary] = useState({
    berjalan: 'Rp 1.250.000.000',
    lunas: 'Rp 3.400.000.000',
    tunggakan: 'Rp 45.500.000'
  });

  const [pinjamanList, setPinjamanList] = useState([
    {
      id: 1,
      tanggal: '12 Okt 2024',
      nama: 'Budi Santoso',
      jumlah: 'Rp 15.000.000',
      bunga: '2.5%',
      tenor: '12 Bln',
      status: 'Berjalan',
      sisa: 'Rp 10.000.000'
    },
    {
      id: 2,
      tanggal: '15 Okt 2024',
      nama: 'Siti Aminah',
      jumlah: 'Rp 5.000.000',
      bunga: '2.5%',
      tenor: '6 Bln',
      status: 'Diajukan',
      sisa: '-'
    },
    {
      id: 3,
      tanggal: '01 Sep 2024',
      nama: 'Agus Setiawan',
      jumlah: 'Rp 50.000.000',
      bunga: '2.5%',
      tenor: '24 Bln',
      status: 'Disetujui',
      sisa: 'Rp 50.000.000'
    },
    {
      id: 4,
      tanggal: '20 Jun 2023',
      nama: 'Rina Melati',
      jumlah: 'Rp 20.000.000',
      bunga: '2.5%',
      tenor: '12 Bln',
      status: 'Lunas',
      sisa: 'Rp 0'
    },
    {
      id: 5,
      tanggal: '18 Okt 2024',
      nama: 'Hendra Gunawan',
      jumlah: 'Rp 100.000.000',
      bunga: '2.5%',
      tenor: '36 Bln',
      status: 'Ditolak',
      sisa: '-'
    }
  ]);

  const [statusFilter, setStatusFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadPinjaman() {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('pinjaman')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            setPinjamanList(
              data.map((item) => ({
                id: item.id,
                tanggal: item.tanggal_pengajuan || item.created_at,
                nama: item.nama_anggota || item.nama,
                jumlah: `Rp ${Number(item.jumlah || 0).toLocaleString('id-ID')}`,
                bunga: `${item.bunga || 2.5}%`,
                tenor: `${item.tenor || 12} Bln`,
                status: item.status || 'Diajukan',
                sisa: item.sisa_hutang ? `Rp ${Number(item.sisa_hutang).toLocaleString('id-ID')}` : '-'
              }))
            );
          }
        }
      } catch (err) {
        console.info('Supabase pinjaman check:', err);
      }
    }

    loadPinjaman();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Berjalan':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">Berjalan</span>;
      case 'Diajukan':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">Diajukan</span>;
      case 'Disetujui':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">Disetujui</span>;
      case 'Lunas':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">Lunas</span>;
      case 'Ditolak':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">Ditolak</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const filteredList = pinjamanList.filter((item) => {
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || item.status === statusFilter;
    return matchSearch && matchStatus;
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
            className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">
              account_balance_wallet
            </span>
            Simpanan
          </Link>
          <Link
            href="/pinjaman"
            className="flex items-center gap-3 px-4 py-2 rounded bg-white/10 text-white border-l-4 border-[#adc7f7] transition-all text-xs font-bold"
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:ml-64 mt-16 md:mt-0 max-w-[1280px] w-full mx-auto relative min-h-screen">
        <div className="flex-1 p-4 md:p-10 flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#111c2c]">
                Manajemen Pinjaman
              </h2>
              <p className="text-sm text-[#595f66] mt-1">
                Kelola data pengajuan, status persetujuan, dan angsuran pinjaman anggota.
              </p>
            </div>
            <button
              type="button"
              className="bg-[#2f855a] hover:bg-[#276749] text-white px-4 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-[0px_4px_12px_rgba(0,0,0,0.05)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Ajukan Pinjaman Baru
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-[#c4c6cf] p-5 flex items-center justify-between shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
              <div>
                <div className="text-xs font-semibold text-[#595f66] uppercase tracking-wider mb-1">
                  Total Pinjaman Berjalan
                </div>
                <div className="text-2xl font-bold text-[#002045]">
                  {summary.berjalan}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#d6e3ff]/50 flex items-center justify-center text-[#002045]">
                <span className="material-symbols-outlined text-2xl">trending_up</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#c4c6cf] p-5 flex items-center justify-between shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
              <div>
                <div className="text-xs font-semibold text-[#595f66] uppercase tracking-wider mb-1">
                  Total Sudah Lunas
                </div>
                <div className="text-2xl font-bold text-[#002045]">
                  {summary.lunas}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#c4c6cf] p-5 flex items-center justify-between shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
              <div>
                <div className="text-xs font-semibold text-[#595f66] uppercase tracking-wider mb-1">
                  Total Tunggakan
                </div>
                <div className="text-2xl font-bold text-[#ba1a1a]">
                  {summary.tunggakan}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-[#c4c6cf] overflow-hidden shadow-[0px_4px_12px_rgba(0,0,0,0.05)] flex flex-col">
            {/* Filter Buttons */}
            <div className="p-4 border-b border-[#c4c6cf] bg-[#f9f9ff] flex flex-wrap gap-4 justify-between items-center">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-[#595f66] mr-1">Status:</span>
                {['Semua', 'Diajukan', 'Disetujui', 'Berjalan', 'Lunas', 'Ditolak'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      statusFilter === st
                        ? 'bg-[#002045] text-white'
                        : 'bg-white text-[#595f66] border border-[#c4c6cf] hover:bg-[#f0f3ff]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f] text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama anggota..."
                  className="w-full pl-9 pr-3 py-1.5 border border-[#c4c6cf] rounded text-sm focus:border-[#2B6CB0] focus:ring-1 focus:ring-[#2B6CB0] outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f3ff] border-b border-[#c4c6cf]">
                    <th className="px-4 py-2.5 text-xs font-semibold text-[#595f66] uppercase">Tanggal</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-[#595f66] uppercase">Nama Anggota</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-[#595f66] uppercase text-right">Jumlah Pinjaman</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-[#595f66] uppercase">Bunga</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-[#595f66] uppercase">Tenor</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-[#595f66] uppercase">Status</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-[#595f66] uppercase text-right">Sisa Hutang</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[#c4c6cf]">
                  {filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f0f3ff] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-[#111c2c]">{item.tanggal}</td>
                      <td className="px-4 py-3 font-bold text-[#002045]">{item.nama}</td>
                      <td className="px-4 py-3 text-right font-medium">{item.jumlah}</td>
                      <td className="px-4 py-3">{item.bunga}</td>
                      <td className="px-4 py-3">{item.tenor}</td>
                      <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#595f66]">{item.sisa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
