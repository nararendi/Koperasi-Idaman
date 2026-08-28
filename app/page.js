'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalAnggota: 1250,
    totalSimpanan: 'Rp 2.500.000.000',
    totalPinjaman: 'Rp 1.800.000.000',
    saldoKas: 'Rp 700.000.000'
  });

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: 1,
      tanggal: '2024-05-20',
      nama: 'Ahmad Fauzi',
      jenis: 'Setoran Pokok',
      jumlah: 'Rp 500.000',
      status: 'Sukses'
    },
    {
      id: 2,
      tanggal: '2024-05-20',
      nama: 'Budi Santoso',
      jenis: 'Angsuran Pinjaman',
      jumlah: 'Rp 1.200.000',
      status: 'Sukses'
    },
    {
      id: 3,
      tanggal: '2024-05-19',
      nama: 'Citra Kirana',
      jenis: 'Tarik Simpanan Sukarela',
      jumlah: 'Rp 300.000',
      status: 'Proses'
    },
    {
      id: 4,
      tanggal: '2024-05-19',
      nama: 'Dewi Lestari',
      jenis: 'Setoran Wajib',
      jumlah: 'Rp 100.000',
      status: 'Sukses'
    },
    {
      id: 5,
      tanggal: '2024-05-18',
      nama: 'Eko Prasetyo',
      jenis: 'Pencairan Pinjaman',
      jumlah: 'Rp 5.000.000',
      status: 'Sukses'
    }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (supabase) {
          const { count, error } = await supabase
            .from('anggota')
            .select('*', { count: 'exact', head: true });
          
          if (!error && count !== null) {
            setStats(prev => ({ ...prev, totalAnggota: count }));
          }
        }
      } catch (err) {
        console.info('Supabase data load initialized:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="bg-[#f9f9ff] text-[#111c2c] min-h-screen font-sans">
      {/* TopNavBar */}
      <nav className="bg-white border-b border-[#c4c6cf] sticky top-0 z-50">
        <div className="flex justify-between items-center px-4 md:px-10 w-full max-w-[1280px] mx-auto h-16">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#002045] text-2xl font-bold">
              account_balance
            </span>
            <span className="text-xl font-bold text-[#002045]">
              Sistem Informasi Koperasi
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 h-full">
            <Link
              href="/"
              className="h-full flex items-center text-[#002045] font-bold border-b-2 border-[#002045] text-sm hover:bg-[#f0f3ff] transition-colors duration-200 cursor-pointer px-2"
            >
              Beranda
            </Link>
            <Link
              href="/anggota"
              className="h-full flex items-center text-[#595f66] hover:text-[#002045] font-medium text-sm hover:bg-[#f0f3ff] transition-colors duration-200 cursor-pointer px-2"
            >
              Anggota
            </Link>
            <Link
              href="/simpanan"
              className="h-full flex items-center text-[#595f66] hover:text-[#002045] font-medium text-sm hover:bg-[#f0f3ff] transition-colors duration-200 cursor-pointer px-2"
            >
              Simpanan
            </Link>
            <Link
              href="/pinjaman"
              className="h-full flex items-center text-[#595f66] hover:text-[#002045] font-medium text-sm hover:bg-[#f0f3ff] transition-colors duration-200 cursor-pointer px-2"
            >
              Pinjaman
            </Link>
            <Link
              href="/kas"
              className="h-full flex items-center text-[#595f66] hover:text-[#002045] font-medium text-sm hover:bg-[#f0f3ff] transition-colors duration-200 cursor-pointer px-2"
            >
              Transaksi Kas
            </Link>
            <Link
              href="/laporan"
              className="h-full flex items-center text-[#595f66] hover:text-[#002045] font-medium text-sm hover:bg-[#f0f3ff] transition-colors duration-200 cursor-pointer px-2"
            >
              Laporan
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Settings"
              className="text-[#595f66] hover:text-[#002045] hover:bg-[#f0f3ff] transition-colors duration-200 p-2 rounded-full flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#1a365d] text-white flex items-center justify-center font-semibold text-xs border border-[#c4c6cf]">
              AD
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-10 py-8 flex flex-col gap-8">
        {/* Hero/Greeting */}
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-bold text-[#002045]">
            Selamat Datang, Admin
          </h1>
          <p className="text-sm text-[#595f66]">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </header>

        {/* Summary Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-[#c4c6cf] rounded-lg p-4 flex flex-col gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#595f66]">Total Anggota</h3>
              <div className="bg-[#1a365d]/10 p-2 rounded-full">
                <span className="material-symbols-outlined text-[#1a365d] text-[20px]">
                  group
                </span>
              </div>
            </div>
            <p className="text-2xl font-semibold text-[#111c2c]">
              {stats.totalAnggota.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#c4c6cf] rounded-lg p-4 flex flex-col gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#595f66]">Total Simpanan</h3>
              <div className="bg-[#1a365d]/10 p-2 rounded-full">
                <span className="material-symbols-outlined text-[#1a365d] text-[20px]">
                  account_balance_wallet
                </span>
              </div>
            </div>
            <p className="text-2xl font-semibold text-[#111c2c]">{stats.totalSimpanan}</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#c4c6cf] rounded-lg p-4 flex flex-col gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#595f66]">Total Pinjaman Berjalan</h3>
              <div className="bg-[#1a365d]/10 p-2 rounded-full">
                <span className="material-symbols-outlined text-[#1a365d] text-[20px]">
                  payments
                </span>
              </div>
            </div>
            <p className="text-2xl font-semibold text-[#111c2c]">{stats.totalPinjaman}</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-[#c4c6cf] rounded-lg p-4 flex flex-col gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#595f66]">Saldo Kas</h3>
              <div className="bg-[#1a365d]/10 p-2 rounded-full">
                <span className="material-symbols-outlined text-[#1a365d] text-[20px]">
                  account_balance
                </span>
              </div>
            </div>
            <p className="text-2xl font-semibold text-[#111c2c]">{stats.saldoKas}</p>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[#002045]">Aksi Cepat</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link
              href="/anggota"
              className="bg-white border border-[#c4c6cf] rounded-lg p-4 flex flex-col items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-[#002045] hover:bg-[#f0f3ff] transition-colors group cursor-pointer text-center"
            >
              <div className="bg-[#1a365d] p-3 rounded-lg group-hover:scale-105 transition-transform text-white">
                <span className="material-symbols-outlined text-white">person_add</span>
              </div>
              <span className="text-xs font-semibold text-[#111c2c]">Kelola Anggota</span>
            </Link>

            <Link
              href="/simpanan"
              className="bg-white border border-[#c4c6cf] rounded-lg p-4 flex flex-col items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-[#002045] hover:bg-[#f0f3ff] transition-colors group cursor-pointer text-center"
            >
              <div className="bg-[#1a365d] p-3 rounded-lg group-hover:scale-105 transition-transform text-white">
                <span className="material-symbols-outlined text-white">savings</span>
              </div>
              <span className="text-xs font-semibold text-[#111c2c]">Catat Setoran</span>
            </Link>

            <Link
              href="/pinjaman"
              className="bg-white border border-[#c4c6cf] rounded-lg p-4 flex flex-col items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-[#002045] hover:bg-[#f0f3ff] transition-colors group cursor-pointer text-center"
            >
              <div className="bg-[#1a365d] p-3 rounded-lg group-hover:scale-105 transition-transform text-white">
                <span className="material-symbols-outlined text-white">request_quote</span>
              </div>
              <span className="text-xs font-semibold text-[#111c2c]">Ajukan Pinjaman</span>
            </Link>

            <Link
              href="/kas"
              className="bg-white border border-[#c4c6cf] rounded-lg p-4 flex flex-col items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-[#002045] hover:bg-[#f0f3ff] transition-colors group cursor-pointer text-center"
            >
              <div className="bg-[#1a365d] p-3 rounded-lg group-hover:scale-105 transition-transform text-white">
                <span className="material-symbols-outlined text-white">receipt_long</span>
              </div>
              <span className="text-xs font-semibold text-[#111c2c]">Transaksi Kas</span>
            </Link>

            <Link
              href="/laporan"
              className="bg-white border border-[#c4c6cf] rounded-lg p-4 flex flex-col items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-[#002045] hover:bg-[#f0f3ff] transition-colors group cursor-pointer text-center"
            >
              <div className="bg-[#1a365d] p-3 rounded-lg group-hover:scale-105 transition-transform text-white">
                <span className="material-symbols-outlined text-white">assessment</span>
              </div>
              <span className="text-xs font-semibold text-[#111c2c]">Lihat Laporan</span>
            </Link>
          </div>
        </section>

        {/* Recent Activity Section */}
        <section className="flex flex-col gap-4 bg-white border border-[#c4c6cf] rounded-lg p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between border-b border-[#c4c6cf] pb-3">
            <h2 className="text-lg font-semibold text-[#002045]">5 Transaksi Terakhir</h2>
            <Link
              href="/kas"
              className="text-xs font-semibold text-[#1a365d] hover:underline flex items-center gap-1"
            >
              Lihat Semua
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f9f9ff] border-b border-[#c4c6cf]">
                  <th className="py-2 px-4 text-xs font-semibold text-[#595f66] uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="py-2 px-4 text-xs font-semibold text-[#595f66] uppercase tracking-wider">
                    Nama Anggota
                  </th>
                  <th className="py-2 px-4 text-xs font-semibold text-[#595f66] uppercase tracking-wider">
                    Jenis Transaksi
                  </th>
                  <th className="py-2 px-4 text-xs font-semibold text-[#595f66] uppercase tracking-wider text-right">
                    Jumlah
                  </th>
                  <th className="py-2 px-4 text-xs font-semibold text-[#595f66] uppercase tracking-wider text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#111c2c] divide-y divide-[#c4c6cf]">
                {recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#f0f3ff] transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">{tx.tanggal}</td>
                    <td className="py-3 px-4 font-medium">{tx.nama}</td>
                    <td className="py-3 px-4">{tx.jenis}</td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">
                      {tx.jumlah}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          tx.status === 'Sukses'
                            ? 'bg-[#E6F4EA] text-[#137333]'
                            : 'bg-[#FFF8E1] text-[#F57F17]'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#f0f3ff] border-t border-[#c4c6cf] py-4 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-10 w-full max-w-[1280px] mx-auto gap-4">
          <span className="text-xs font-semibold text-[#002045]">
            © 2024 Koperasi Idaman. v2.1.0-stable
          </span>
          <div className="flex gap-6 text-xs text-[#595f66]">
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
    </div>
  );
}
