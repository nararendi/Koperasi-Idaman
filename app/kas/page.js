'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function KasPage() {
  const [transaksi] = useState([
    { id: 1, tanggal: '2024-05-20', jenis: 'Penerimaan', kategori: 'Setoran Pokok', jumlah: 'Rp 500.000', keterangan: 'Ahmad Fauzi' },
    { id: 2, tanggal: '2024-05-20', jenis: 'Penerimaan', kategori: 'Angsuran Pinjaman', jumlah: 'Rp 1.200.000', keterangan: 'Budi Santoso' },
    { id: 3, tanggal: '2024-05-19', jenis: 'Pengeluaran', kategori: 'Penarikan Sukarela', jumlah: 'Rp 300.000', keterangan: 'Citra Kirana' },
    { id: 4, tanggal: '2024-05-19', jenis: 'Penerimaan', kategori: 'Setoran Wajib', jumlah: 'Rp 100.000', keterangan: 'Dewi Lestari' },
    { id: 5, tanggal: '2024-05-18', jenis: 'Pengeluaran', kategori: 'Pencairan Pinjaman', jumlah: 'Rp 5.000.000', keterangan: 'Eko Prasetyo' }
  ]);

  return (
    <div className="bg-[#f9f9ff] text-[#111c2c] min-h-screen flex flex-col md:flex-row font-sans">
      <nav className="hidden md:flex h-full w-64 fixed left-0 top-0 bg-[#002045] text-white flex-col py-6 shadow-sm z-50">
        <div className="px-4 mb-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">account_balance</span>
          <div>
            <h1 className="text-base font-bold text-white">Koperasi Idaman</h1>
            <p className="text-xs text-white/70">Management System</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1 px-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 text-xs font-semibold">
            <span className="material-symbols-outlined text-lg">dashboard</span> Beranda
          </Link>
          <Link href="/anggota" className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 text-xs font-semibold">
            <span className="material-symbols-outlined text-lg">group</span> Anggota
          </Link>
          <Link href="/simpanan" className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 text-xs font-semibold">
            <span className="material-symbols-outlined text-lg">account_balance_wallet</span> Simpanan
          </Link>
          <Link href="/pinjaman" className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 text-xs font-semibold">
            <span className="material-symbols-outlined text-lg">payments</span> Pinjaman
          </Link>
          <Link href="/kas" className="flex items-center gap-3 px-4 py-2 rounded bg-white/10 text-white border-l-4 border-[#adc7f7] text-xs font-bold">
            <span className="material-symbols-outlined text-lg">receipt_long</span> Transaksi Kas
          </Link>
          <Link href="/laporan" className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 text-xs font-semibold">
            <span className="material-symbols-outlined text-lg">assessment</span> Laporan
          </Link>
        </div>
        <div className="mt-auto px-2">
          <Link href="/pengaturan" className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 text-xs font-semibold">
            <span className="material-symbols-outlined text-lg">settings</span> Pengaturan
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:ml-64 mt-16 md:mt-0 max-w-[1280px] w-full mx-auto p-4 md:p-10 min-h-screen">
        <h2 className="text-2xl md:text-3xl font-bold text-[#111c2c] mb-2">Transaksi Kas Harian</h2>
        <p className="text-sm text-[#595f66] mb-6">Pencatatan arus kas masuk dan keluar Koperasi Idaman.</p>

        <div className="bg-white rounded-xl border border-[#c4c6cf] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f3ff] border-b border-[#c4c6cf]">
                <th className="px-4 py-2.5 text-xs font-semibold text-[#595f66] uppercase">Tanggal</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-[#595f66] uppercase">Jenis</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-[#595f66] uppercase">Kategori</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-[#595f66] uppercase">Keterangan</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-[#595f66] uppercase text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#c4c6cf]">
              {transaksi.map((t) => (
                <tr key={t.id} className="hover:bg-[#f0f3ff] transition-colors">
                  <td className="px-4 py-3">{t.tanggal}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${t.jenis === 'Penerimaan' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {t.jenis}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{t.kategori}</td>
                  <td className="px-4 py-3 text-[#595f66]">{t.keterangan}</td>
                  <td className={`px-4 py-3 text-right font-bold ${t.jenis === 'Penerimaan' ? 'text-green-700' : 'text-red-700'}`}>
                    {t.jenis === 'Penerimaan' ? `+${t.jumlah}` : `-${t.jumlah}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
