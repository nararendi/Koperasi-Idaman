'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '../components/AppLayout';
import { dataService } from '../lib/dataService';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalAnggota: 0,
    totalSimpanan: 0,
    totalPinjaman: 0,
    saldoKas: 0
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [settings, setSettings] = useState({});

  const loadDashboardData = () => {
    const anggota = dataService.getAnggotaList();
    const simpananSum = dataService.getSimpananSummary();
    const pinjamanSum = dataService.getPinjamanSummary();
    const kasSum = dataService.getKasSummary();
    const kasList = dataService.getKasList();
    const currentSettings = dataService.getSettings();

    setStats({
      totalAnggota: (anggota || []).filter((a) => (a.status || a.status_keanggotaan || '').toLowerCase() === 'aktif').length,
      totalSimpanan: simpananSum.total,
      totalPinjaman: pinjamanSum.berjalan,
      saldoKas: kasSum.saldo
    });

    setRecentTransactions(kasList.slice(0, 7));
    setSettings(currentSettings);
  };

  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener('koperasi_db_updated', handleUpdate);
    return () => window.removeEventListener('koperasi_db_updated', handleUpdate);
  }, []);

  const formatRupiah = (num) => {
    return `Rp ${(Number(num) || 0).toLocaleString('id-ID')}`;
  };

  return (
    <AppLayout
      title={`Selamat Datang di ${settings.namaKoperasi || 'Koperasi Idaman'}`}
      subtitle={`${new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })} • Panel Kontrol Manajemen Utama`}
    >
      <div className="flex flex-col gap-8">
        {/* Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Anggota */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Anggota Aktif</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                <span className="material-symbols-outlined text-xl">group</span>
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#002045]">
              {stats.totalAnggota} <span className="text-sm font-semibold text-slate-400">Orang</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Keanggotaan terverifikasi</span>
              <Link href="/anggota" className="text-blue-600 font-semibold hover:underline">Lihat Semua &rarr;</Link>
            </div>
          </div>

          {/* Total Simpanan */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Dana Simpanan</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-700">
              {formatRupiah(stats.totalSimpanan)}
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Pokok, Wajib & Sukarela</span>
              <Link href="/simpanan" className="text-emerald-700 font-semibold hover:underline">Kelola &rarr;</Link>
            </div>
          </div>

          {/* Total Pinjaman Berjalan */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pinjaman Berjalan</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                <span className="material-symbols-outlined text-xl">payments</span>
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-amber-700">
              {formatRupiah(stats.totalPinjaman)}
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Dana kredit aktif di anggota</span>
              <Link href="/pinjaman" className="text-amber-700 font-semibold hover:underline">Rincian &rarr;</Link>
            </div>
          </div>

          {/* Saldo Kas */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Kas Koperasi</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700">
                <span className="material-symbols-outlined text-xl">account_balance</span>
              </div>
            </div>
            <div className={`text-2xl md:text-3xl font-extrabold ${stats.saldoKas >= 0 ? 'text-[#002045]' : 'text-red-600'}`}>
              {formatRupiah(stats.saldoKas)}
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Likuiditas saat ini</span>
              <Link href="/kas" className="text-indigo-600 font-semibold hover:underline">Buku Kas &rarr;</Link>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-[#002045] flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-blue-600">bolt</span>
            Aksi Cepat & Navigasi Operasional
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <Link
              href="/anggota/tambah"
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2.5 shadow-sm hover:border-blue-500 hover:shadow-md hover:bg-blue-50/50 transition-all group text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#002045] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-2xl">person_add</span>
              </div>
              <span className="text-xs font-bold text-[#002045]">Daftar Anggota</span>
            </Link>

            <Link
              href="/simpanan"
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2.5 shadow-sm hover:border-emerald-500 hover:shadow-md hover:bg-emerald-50/50 transition-all group text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-2xl">savings</span>
              </div>
              <span className="text-xs font-bold text-[#002045]">Catat Setoran</span>
            </Link>

            <Link
              href="/pinjaman"
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2.5 shadow-sm hover:border-amber-500 hover:shadow-md hover:bg-amber-50/50 transition-all group text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-2xl">request_quote</span>
              </div>
              <span className="text-xs font-bold text-[#002045]">Ajukan Pinjaman</span>
            </Link>

            <Link
              href="/kas"
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2.5 shadow-sm hover:border-indigo-500 hover:shadow-md hover:bg-indigo-50/50 transition-all group text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <span className="text-xs font-bold text-[#002045]">Mutasi Kas</span>
            </Link>

            <Link
              href="/laporan"
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2.5 shadow-sm hover:border-purple-500 hover:shadow-md hover:bg-purple-50/50 transition-all group text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-2xl">assessment</span>
              </div>
              <span className="text-xs font-bold text-[#002045]">Rekap & Laporan</span>
            </Link>
          </div>
        </section>

        {/* Live Recent Transactions & Info */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table Arus Kas Terbaru */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 md:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-700">history</span>
                <h3 className="text-sm font-bold text-[#002045]">Mutasi Kas & Transaksi Terkini</h3>
              </div>
              <Link
                href="/kas"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                Lihat Seluruh Kas &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Jenis</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Keterangan</th>
                    <th className="px-4 py-3 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Belum ada riwayat transaksi tercatat.
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((tx) => {
                      const isPenerimaan = tx.jenis === 'Penerimaan';
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                            {tx.tanggal}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                isPenerimaan
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isPenerimaan ? 'Masuk' : 'Keluar'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#002045]">
                            {tx.kategori}
                          </td>
                          <td className="px-4 py-3 text-slate-600 max-w-[220px] truncate" title={tx.keterangan}>
                            {tx.keterangan}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-bold whitespace-nowrap ${
                              isPenerimaan ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {isPenerimaan ? `+${formatRupiah(tx.jumlah)}` : `-${formatRupiah(tx.jumlah)}`}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Card: Institutional Summary */}
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-br from-[#002045] to-[#1a365d] text-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-200/80">
                    Informasi Lembaga
                  </span>
                  <span className="material-symbols-outlined text-blue-300">verified</span>
                </div>
                <h4 className="text-base font-bold mb-1">{settings.namaKoperasi || 'Koperasi Idaman'}</h4>
                <p className="text-xs text-blue-100/80 mb-3">{settings.badanHukum || 'Badan Hukum Terdaftar'}</p>
                
                <div className="border-t border-white/10 pt-3 space-y-2 text-xs text-blue-100/90">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-blue-300 mt-0.5">location_on</span>
                    <span>{settings.alamat || 'Jakarta, Indonesia'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-blue-300">call</span>
                    <span>{settings.telepon || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                <span className="text-blue-200/80">Suku Bunga: <strong>{settings.sukuBungaPinjaman || 1.5}% / bln</strong></span>
                <Link href="/pengaturan" className="text-[#adc7f7] font-bold hover:underline">
                  Ubah Aturan &rarr;
                </Link>
              </div>
            </div>

            {/* Quick Summary SHU preview */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Estimasi SHU Berjalan
                </h4>
                <span className="material-symbols-outlined text-purple-700 text-lg">pie_chart</span>
              </div>
              <p className="text-xl font-bold text-[#002045]">
                {formatRupiah(dataService.getLaporanData().shu.shuBersih)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Sisa Hasil Usaha yang siap dialokasikan untuk anggota pada RAT akhir tahun.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <Link href="/laporan" className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1">
                  Lihat Simulasi Pembagian SHU &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
