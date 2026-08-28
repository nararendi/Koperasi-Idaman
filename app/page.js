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
  const [selectedBar, setSelectedBar] = useState(9); // Default active bar like image (day 9)
  const [period, setPeriod] = useState('1 Mar - 14 Mar');

  // Chart daily mock data points for the 14-day visual chart matching the image
  const chartData = [
    { day: 1, val: 35, amount: 'Rp 3.500.000' },
    { day: 2, val: 50, amount: 'Rp 5.000.000' },
    { day: 3, val: 75, amount: 'Rp 7.500.000' },
    { day: 4, val: 40, amount: 'Rp 4.000.000' },
    { day: 5, val: 65, amount: 'Rp 6.500.000' },
    { day: 6, val: 30, amount: 'Rp 3.000.000' },
    { day: 7, val: 20, amount: 'Rp 2.000.000' },
    { day: 8, val: 45, amount: 'Rp 4.500.000' },
    { day: 9, val: 60, amount: 'Rp 6.894.000', label: 'Hari Ini' },
    { day: 10, val: 48, amount: 'Rp 4.800.000' },
    { day: 11, val: 32, amount: 'Rp 3.200.000' },
    { day: 12, val: 70, amount: 'Rp 7.000.000' },
    { day: 13, val: 42, amount: 'Rp 4.200.000' },
    { day: 14, val: 55, amount: 'Rp 5.500.000' }
  ];

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

    setRecentTransactions(kasList.slice(0, 5));
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

  // Pastel icon colors for transaction list
  const avatarColors = [
    'bg-[#ffd6a5] text-[#b45309]',
    'bg-[#caffbf] text-[#15803d]',
    'bg-[#9bf6ff] text-[#0369a1]',
    'bg-[#a0c4ff] text-[#1d4ed8]',
    'bg-[#bdb2ff] text-[#6d28d9]'
  ];

  return (
    <AppLayout
      title="My Bookings & Finansial"
      subtitle={`Selamat datang di sistem manajemen ${settings.namaKoperasi || 'Koperasi Idaman'}`}
      rightAction={
        <Link
          href="/laporan"
          className="bg-[#139a8c] hover:bg-[#0e8074] text-white rounded-full px-5 py-2.5 text-xs font-extrabold flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">download</span>
          <span>Download report</span>
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        
        {/* Period Filter & Legend Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-semibold">
            <span>Period:</span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4faf8] border border-slate-200 text-[#14293d] font-bold hover:border-[#139a8c] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#139a8c]">calendar_today</span>
              <span>1 March - 14 March</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffd159]"></span>
              Today (Aktif)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a2e0f0]"></span>
              Earned (Simpanan & Kas)
            </span>
          </div>
        </div>

        {/* INTERACTIVE VERTICAL BAR CHART (Matching Reference Design) */}
        <div className="bg-[#fafdfc] border border-slate-100 rounded-3xl p-5 md:p-6 shadow-inner relative">
          <div className="relative h-56 flex items-end justify-between gap-1 sm:gap-2 pt-10 pb-4 border-b border-slate-200/80">
            
            {/* Background horizontal grid lines */}
            <div className="absolute inset-x-0 top-6 border-b border-dashed border-slate-200/60 pointer-events-none flex justify-between text-[10px] text-slate-400 font-semibold px-1">
              <span>Rp 3.000.000</span>
            </div>
            <div className="absolute inset-x-0 top-24 border-b border-dashed border-slate-200/60 pointer-events-none flex justify-between text-[10px] text-slate-400 font-semibold px-1">
              <span>Rp 2.000.000</span>
            </div>
            <div className="absolute inset-x-0 top-40 border-b border-dashed border-slate-200/60 pointer-events-none flex justify-between text-[10px] text-slate-400 font-semibold px-1">
              <span>Rp 1.000.000</span>
            </div>

            {/* 14 Vertical Bars */}
            {chartData.map((item) => {
              const isSelected = selectedBar === item.day;
              return (
                <div
                  key={item.day}
                  onClick={() => setSelectedBar(item.day)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative z-10"
                >
                  {/* Floating Tooltip if selected/today */}
                  {isSelected && (
                    <div className="absolute -top-6 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-lg flex flex-col items-center whitespace-nowrap animate-in fade-in zoom-in-90 duration-150 z-30">
                      <span className="text-xs font-extrabold text-[#139a8c]">{item.amount}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">Total per day</span>
                      <div className="w-2 h-2 bg-white rotate-45 border-r border-b border-slate-100 absolute -bottom-1"></div>
                    </div>
                  )}

                  {/* The Bar */}
                  <div
                    style={{ height: `${item.val}%` }}
                    className={`w-3 sm:w-4 md:w-5 rounded-t-lg transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#ffd159] shadow-md scale-y-105 ring-2 ring-[#ffd159]/40'
                        : 'bg-[#b6e4ef] hover:bg-[#9bdced] group-hover:scale-y-105'
                    }`}
                  ></div>
                </div>
              );
            })}
          </div>

          {/* X-Axis Numbers */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold pt-2 px-1">
            {chartData.map((item) => (
              <span
                key={item.day}
                onClick={() => setSelectedBar(item.day)}
                className={`flex-1 text-center cursor-pointer transition-colors ${
                  selectedBar === item.day ? 'text-[#14293d] font-extrabold underline' : 'hover:text-slate-600'
                }`}
              >
                {item.day}
              </span>
            ))}
          </div>
        </div>

        {/* 4 SUMMARY STAT CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Anggota */}
          <div className="bg-[#f4faf8] border border-[#d8eee8] rounded-2xl p-4 shadow-sm hover:shadow transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Anggota Aktif</span>
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#139a8c] shadow-xs">
                <span className="material-symbols-outlined text-lg">group</span>
              </div>
            </div>
            <div className="text-xl font-extrabold text-[#14293d] mt-2">
              {stats.totalAnggota} <span className="text-xs font-semibold text-slate-400">Orang</span>
            </div>
            <Link href="/anggota" className="mt-2 text-[11px] font-bold text-[#139a8c] hover:underline flex items-center gap-1">
              Kelola Data &rarr;
            </Link>
          </div>

          {/* Total Simpanan */}
          <div className="bg-[#f4faf8] border border-[#d8eee8] rounded-2xl p-4 shadow-sm hover:shadow transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Simpanan</span>
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#139a8c] shadow-xs">
                <span className="material-symbols-outlined text-lg">savings</span>
              </div>
            </div>
            <div className="text-xl font-extrabold text-[#139a8c] mt-2">
              {formatRupiah(stats.totalSimpanan)}
            </div>
            <Link href="/simpanan" className="mt-2 text-[11px] font-bold text-[#139a8c] hover:underline flex items-center gap-1">
              Buku Simpanan &rarr;
            </Link>
          </div>

          {/* Total Pinjaman */}
          <div className="bg-[#fefbf2] border border-[#faecd2] rounded-2xl p-4 shadow-sm hover:shadow transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pinjaman Berjalan</span>
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#df9800] shadow-xs">
                <span className="material-symbols-outlined text-lg">payments</span>
              </div>
            </div>
            <div className="text-xl font-extrabold text-[#df9800] mt-2">
              {formatRupiah(stats.totalPinjaman)}
            </div>
            <Link href="/pinjaman" className="mt-2 text-[11px] font-bold text-[#df9800] hover:underline flex items-center gap-1">
              Tagihan & Angsuran &rarr;
            </Link>
          </div>

          {/* Saldo Kas */}
          <div className="bg-[#f4faf8] border border-[#d8eee8] rounded-2xl p-4 shadow-sm hover:shadow transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Saldo Kas</span>
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#139a8c] shadow-xs">
                <span className="material-symbols-outlined text-lg">account_balance</span>
              </div>
            </div>
            <div className="text-xl font-extrabold text-[#14293d] mt-2">
              {formatRupiah(stats.saldoKas)}
            </div>
            <Link href="/kas" className="mt-2 text-[11px] font-bold text-[#139a8c] hover:underline flex items-center gap-1">
              Arus Kas &rarr;
            </Link>
          </div>
        </section>

        {/* LOWER SECTION: ARRIVING TODAY LIST & PROMO BANNER (Matching Reference) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          
          {/* Left 2 Cols: "Arriving today" Style Activity List */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#14293d]">
                Arriving today <span className="text-xs font-semibold text-slate-400">(Transaksi Terkini)</span>
              </h3>
              <Link href="/kas" className="text-xs font-bold text-[#139a8c] hover:underline flex items-center gap-0.5">
                Show all &gt;
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentTransactions.length === 0 ? (
                <div className="p-8 text-center bg-[#fafdfc] rounded-2xl border border-slate-100 text-xs text-slate-400 font-semibold">
                  Belum ada transaksi terbaru hari ini.
                </div>
              ) : (
                recentTransactions.map((tx, idx) => {
                  const isPenerimaan = tx.jenis === 'Penerimaan';
                  const avatarColor = avatarColors[idx % avatarColors.length];

                  return (
                    <div
                      key={tx.id || idx}
                      className="bg-white border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:border-[#139a8c]/40 hover:shadow-sm transition-all"
                    >
                      {/* Left: Avatar / Art icon & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl ${avatarColor} flex items-center justify-center font-bold text-xs shrink-0 shadow-inner`}>
                          <span className="material-symbols-outlined text-xl">
                            {isPenerimaan ? 'arrow_downward' : 'arrow_upward'}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[#14293d] truncate">
                            {tx.keterangan || tx.kategori || 'Transaksi Keuangan'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium truncate">
                            {tx.kategori || 'Umum'} &bull; {tx.tanggal}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Status Badge */}
                      <div className="hidden sm:block">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold ${
                            isPenerimaan
                              ? 'bg-[#e0f7f4] text-[#139a8c]'
                              : 'bg-[#fef8e7] text-[#b88000]'
                          }`}
                        >
                          {isPenerimaan ? 'Approved' : 'Pending'}
                        </span>
                      </div>

                      {/* Right: Amount & Timestamp */}
                      <div className="flex items-center gap-4 text-right">
                        <div className="flex flex-col">
                          <span className={`text-xs font-extrabold ${isPenerimaan ? 'text-[#139a8c]' : 'text-slate-800'}`}>
                            {formatRupiah(tx.jumlah)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {tx.tanggal ? `Maret ${tx.tanggal.split('-')[2] || '1'}, at 12:00` : 'Hari ini'}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="text-slate-300 hover:text-slate-600 p-1 rounded-lg"
                        >
                          <span className="material-symbols-outlined text-base">more_vert</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right 1 Col: Illustrated Summary Banner ("Low occupancy!" style) */}
          <div className="bg-[#dff3f0] border border-[#c3e8e1] rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden shadow-xs min-h-[220px]">
            {/* Background Decorative Palms & Geometric Art */}
            <div className="absolute -bottom-6 -right-6 w-36 h-36 opacity-70 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#139a8c]/40 fill-current">
                <path d="M50 0 C40 30 10 40 0 50 C30 60 40 90 50 100 C60 70 90 60 100 50 C70 40 60 10 50 0 Z" />
              </svg>
            </div>
            
            {/* Top Text Content */}
            <div className="relative z-10">
              <h4 className="text-base font-extrabold text-[#14293d]">
                Kinerja Koperasi!
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                Likuiditas kas dan perputaran dana anggota bulan ini dalam performa optimal.
              </p>
            </div>

            {/* Bottom Yellow Action Button */}
            <div className="pt-6 relative z-10">
              <Link
                href="/kas"
                className="inline-block px-5 py-2 bg-[#ffd159] hover:bg-[#f7be38] text-[#14293d] rounded-xl font-extrabold text-xs shadow-sm transition-all"
              >
                Kelola Kas
              </Link>
            </div>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
