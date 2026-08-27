'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LaporanPage() {
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
          <Link href="/kas" className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 text-xs font-semibold">
            <span className="material-symbols-outlined text-lg">receipt_long</span> Transaksi Kas
          </Link>
          <Link href="/laporan" className="flex items-center gap-3 px-4 py-2 rounded bg-white/10 text-white border-l-4 border-[#adc7f7] text-xs font-bold">
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
        <h2 className="text-2xl md:text-3xl font-bold text-[#111c2c] mb-2">Laporan Keuangan & Koperasi</h2>
        <p className="text-sm text-[#595f66] mb-6">Rekapitulasi keuangan, neraca saldo, dan sisa hasil usaha (SHU).</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#c4c6cf] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#002045] mb-4">Laporan Arus Kas Periode Ini</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-600">Total Pemasukan Simpanan</span>
                <span className="font-semibold text-green-700">Rp 2.500.000.000</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-600">Total Angsuran Diterima</span>
                <span className="font-semibold text-green-700">Rp 420.000.000</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-600">Total Penyaluran Pinjaman</span>
                <span className="font-semibold text-red-700">Rp 1.800.000.000</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold text-base">
                <span>Saldo Kas Bersih</span>
                <span className="text-[#002045]">Rp 1.120.000.000</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#c4c6cf] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#002045] mb-2">Unduh Laporan Format PDF / Excel</h3>
              <p className="text-sm text-gray-500 mb-4">Pilih jenis laporan dan periode untuk diexport.</p>
              <div className="space-y-3">
                <button className="w-full py-2.5 px-4 rounded border border-[#c4c6cf] hover:bg-[#f0f3ff] text-left text-sm font-medium flex items-center justify-between">
                  <span>Laporan Neraca Bulanan</span>
                  <span className="material-symbols-outlined text-lg">download</span>
                </button>
                <button className="w-full py-2.5 px-4 rounded border border-[#c4c6cf] hover:bg-[#f0f3ff] text-left text-sm font-medium flex items-center justify-between">
                  <span>Laporan Pembagian SHU</span>
                  <span className="material-symbols-outlined text-lg">download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
