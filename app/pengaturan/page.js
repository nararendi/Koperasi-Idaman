'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PengaturanPage() {
  const [namaKoperasi, setNamaKoperasi] = useState('Koperasi Idaman');
  const [alamat, setAlamat] = useState('Jl. Jenderal Sudirman No. 45, Jakarta Pusat');

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
          <Link href="/laporan" className="flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:text-white hover:bg-white/10 text-xs font-semibold">
            <span className="material-symbols-outlined text-lg">assessment</span> Laporan
          </Link>
        </div>
        <div className="mt-auto px-2">
          <Link href="/pengaturan" className="flex items-center gap-3 px-4 py-2 rounded bg-white/10 text-white border-l-4 border-[#adc7f7] text-xs font-bold">
            <span className="material-symbols-outlined text-lg">settings</span> Pengaturan
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:ml-64 mt-16 md:mt-0 max-w-[1280px] w-full mx-auto p-4 md:p-10 min-h-screen">
        <h2 className="text-2xl md:text-3xl font-bold text-[#111c2c] mb-2">Pengaturan Koperasi</h2>
        <p className="text-sm text-[#595f66] mb-6">Kelola profil institusi koperasi dan konfigurasi sistem.</p>

        <div className="bg-white rounded-xl border border-[#c4c6cf] p-6 max-w-2xl shadow-sm">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Pengaturan berhasil disimpan!'); }}>
            <div>
              <label className="block text-sm font-bold text-[#111c2c] mb-1">Nama Koperasi</label>
              <input
                type="text"
                value={namaKoperasi}
                onChange={(e) => setNamaKoperasi(e.target.value)}
                className="w-full px-4 py-2 border border-[#c4c6cf] rounded text-sm focus:border-[#2B6CB0] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111c2c] mb-1">Alamat Kantor</label>
              <textarea
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-[#c4c6cf] rounded text-sm focus:border-[#2B6CB0] outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              className="bg-[#002045] hover:bg-[#1a365d] text-white px-6 py-2 rounded text-sm font-semibold transition-colors"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
