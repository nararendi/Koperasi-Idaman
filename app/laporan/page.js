'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { dataService } from '../../lib/dataService';

export default function LaporanPage() {
  const d = new Date();
  const currentYear = d.getFullYear();
  const currentMonthNum = String(d.getMonth() + 1).padStart(2, '0');
  const currentMonthStr = `${currentYear}-${currentMonthNum}`; // '2026-08'
  const firstMonthOfYear = `${currentYear}-01`;

  // State in YYYY-MM format
  const [bulanMulai, setBulanMulai] = useState(firstMonthOfYear);
  const [bulanSelesai, setBulanSelesai] = useState(currentMonthStr);

  const [laporan, setLaporan] = useState({
    arusKas: {
      totalSimpananMasuk: 0,
      totalAngsuranMasuk: 0,
      totalPendapatanLain: 0,
      totalPemasukan: 0,
      totalPenyaluranPinjaman: 0,
      totalBiayaOperasional: 0,
      totalPenarikanSimpanan: 0,
      totalPengeluaran: 0,
      saldoKasBersih: 0
    },
    neraca: {
      kas: 0,
      piutangPinjaman: 0,
      totalAset: 0,
      simpananPokok: 0,
      simpananWajib: 0,
      simpananSukarela: 0,
      totalKewajibanModal: 0
    },
    shu: {
      pendapatanBunga: 0,
      pendapatanLain: 0,
      totalPendapatan: 0,
      biayaOperasional: 0,
      shuBersih: 0,
      alokasi: {
        anggota: 0,
        modal: 0,
        pengurus: 0,
        cadangan: 0
      }
    }
  });

  const [settings, setSettings] = useState({});

  // Helper to format YYYY-MM into Indonesian Month-Year string
  const formatBulanTahun = (ym) => {
    if (!ym) return '';
    const [year, month] = ym.split('-');
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex] || month} ${year}`;
  };

  const loadLaporan = () => {
    // Convert YYYY-MM to full start and end dates
    const startDate = bulanMulai ? `${bulanMulai}-01` : '';
    let endDate = '';
    if (bulanSelesai) {
      const [y, m] = bulanSelesai.split('-');
      const lastDay = new Date(Number(y), Number(m), 0).getDate();
      endDate = `${bulanSelesai}-${String(lastDay).padStart(2, '0')}`;
    }

    const data = dataService.getLaporanData({
      startDate,
      endDate
    });
    const s = dataService.getSettings();
    setLaporan(data);
    setSettings(s);
  };

  useEffect(() => {
    loadLaporan();

    const handleUpdate = () => {
      loadLaporan();
    };

    window.addEventListener('koperasi_db_updated', handleUpdate);
    return () => window.removeEventListener('koperasi_db_updated', handleUpdate);
  }, [bulanMulai, bulanSelesai]);

  const formatRupiah = (num) => {
    return `Rp ${(Number(num) || 0).toLocaleString('id-ID')}`;
  };

  const handlePrint = () => {
    window.print();
  };

  // Quick Preset Helper Functions
  const setPresetBulanIni = () => {
    setBulanMulai(currentMonthStr);
    setBulanSelesai(currentMonthStr);
  };

  const setPresetTahunIni = () => {
    setBulanMulai(firstMonthOfYear);
    setBulanSelesai(currentMonthStr);
  };

  const setPresetSemuaWaktu = () => {
    setBulanMulai('');
    setBulanSelesai('');
  };

  // Periode Label Text
  const getPeriodeLabel = () => {
    if (!bulanMulai && !bulanSelesai) return 'Semua Periode (Semua Waktu)';
    if (bulanMulai === bulanSelesai) return `Bulan ${formatBulanTahun(bulanMulai)}`;
    return `${formatBulanTahun(bulanMulai) || 'Awal'} s/d ${formatBulanTahun(bulanSelesai) || 'Sekarang'}`;
  };

  // Export CSV of Financial Summary
  const handleExportCSV = () => {
    const labelPeriode = getPeriodeLabel();

    const rows = [
      ['LAPORAN KEUANGAN KOPERASI IDAMAN'],
      ['Periode Bulan & Tahun', labelPeriode],
      [''],
      ['1. LAPORAN ARUS KAS'],
      ['Pemasukan Simpanan', laporan.arusKas.totalSimpananMasuk],
      ['Pemasukan Angsuran Pinjaman', laporan.arusKas.totalAngsuranMasuk],
      ['Pendapatan Lain', laporan.arusKas.totalPendapatanLain],
      ['Total Pemasukan Kas', laporan.arusKas.totalPemasukan],
      ['Penyaluran Pinjaman Baru', laporan.arusKas.totalPenyaluranPinjaman],
      ['Penarikan Simpanan', laporan.arusKas.totalPenarikanSimpanan],
      ['Biaya Operasional', laporan.arusKas.totalBiayaOperasional],
      ['Total Pengeluaran Kas', laporan.arusKas.totalPengeluaran],
      ['Saldo Kas Bersih Periode Ini', laporan.arusKas.saldoKasBersih],
      [''],
      ['2. NERACA KEUANGAN'],
      ['Aset Kas', laporan.neraca.kas],
      ['Piutang Pinjaman Anggota', laporan.neraca.piutangPinjaman],
      ['Total Aset', laporan.neraca.totalAset],
      ['Simpanan Pokok', laporan.neraca.simpananPokok],
      ['Simpanan Wajib', laporan.neraca.simpananWajib],
      ['Simpanan Sukarela', laporan.neraca.simpananSukarela],
      ['Total Kewajiban Simpanan', laporan.neraca.totalKewajibanModal],
      [''],
      ['3. SIMULASI SHU'],
      ['Pendapatan Jasa Bunga', laporan.shu.pendapatanBunga],
      ['Pendapatan Lain', laporan.shu.pendapatanLain],
      ['Beban Operasional', laporan.shu.biayaOperasional],
      ['SHU Bersih Koperasi', laporan.shu.shuBersih],
      ['Alokasi Jasa Anggota', laporan.shu.alokasi.anggota],
      ['Alokasi Jasa Modal', laporan.shu.alokasi.modal],
      ['Alokasi Pengurus', laporan.shu.alokasi.pengurus],
      ['Alokasi Dana Cadangan', laporan.shu.alokasi.cadangan]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_Koperasi_${bulanMulai || 'Awal'}_sd_${bulanSelesai || 'Sekarang'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout
      title="Laporan Keuangan & Rekapitulasi"
      subtitle="Pilih kalender bulan dan tahun untuk merekapitulasi arus kas, neraca saldo, dan alokasi SHU."
      rightAction={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            Ekspor CSV
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="bg-[#002045] hover:bg-[#1a365d] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Cetak Laporan / PDF
          </button>
        </div>
      }
    >
      {/* Month & Year Calendar Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Month Picker Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700 text-2xl">calendar_month</span>
            <span className="text-xs font-bold text-slate-700">Pilih Bulan & Tahun:</span>
          </div>

          <div className="flex items-center gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Dari Bulan</label>
              <input
                type="month"
                value={bulanMulai}
                onChange={(e) => setBulanMulai(e.target.value)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-blue-600 outline-none bg-white font-bold text-[#002045] cursor-pointer shadow-sm"
              />
            </div>

            <span className="text-slate-400 font-bold self-end mb-2">s/d</span>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Sampai Bulan</label>
              <input
                type="month"
                value={bulanSelesai}
                onChange={(e) => setBulanSelesai(e.target.value)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-blue-600 outline-none bg-white font-bold text-[#002045] cursor-pointer shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Preset:</span>
          <button
            type="button"
            onClick={setPresetBulanIni}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Bulan Ini ({formatBulanTahun(currentMonthStr)})
          </button>
          <button
            type="button"
            onClick={setPresetTahunIni}
            className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-[11px] font-bold text-blue-800 transition-colors cursor-pointer"
          >
            Tahun {currentYear} (Jan - Des)
          </button>
          <button
            type="button"
            onClick={setPresetSemuaWaktu}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer"
          >
            Semua Waktu
          </button>
        </div>
      </div>

      {/* Printable Report Container */}
      <div id="laporanContainer" className="flex flex-col gap-6">
        {/* Report Header for Print */}
        <div className="text-center pb-4 border-b border-slate-200">
          <h2 className="text-lg font-black text-[#002045] tracking-wide">{settings.namaKoperasi || 'KOPERASI SIMPAN PINJAM IDAMAN'}</h2>
          <p className="text-xs text-slate-500">{settings.alamat || 'Jakarta, Indonesia'}</p>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3.5 py-1 rounded-full text-xs font-bold text-blue-950 mt-2">
            <span className="material-symbols-outlined text-sm text-blue-700">date_range</span>
            <span>
              Periode Laporan: {getPeriodeLabel()}
            </span>
          </div>
        </div>

        {/* Section 1 & Section 2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Laporan Arus Kas */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700">receipt_long</span>
                  <h3 className="text-sm font-bold text-[#002045]">Laporan Arus Kas (Cashflow)</h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Realisasi Periode
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Arus Kas Masuk:</div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Penerimaan Setoran Simpanan</span>
                  <span className="font-semibold text-emerald-700">{formatRupiah(laporan.arusKas.totalSimpananMasuk)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Penerimaan Angsuran Pinjaman</span>
                  <span className="font-semibold text-emerald-700">{formatRupiah(laporan.arusKas.totalAngsuranMasuk)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Pendapatan Lain / Administrasi</span>
                  <span className="font-semibold text-emerald-700">{formatRupiah(laporan.arusKas.totalPendapatanLain)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-emerald-800">
                  <span>Total Pemasukan Kas</span>
                  <span>{formatRupiah(laporan.arusKas.totalPemasukan)}</span>
                </div>

                <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] pt-3">Arus Kas Keluar:</div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Penyaluran Pinjaman Anggota</span>
                  <span className="font-semibold text-rose-600">{formatRupiah(laporan.arusKas.totalPenyaluranPinjaman)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Penarikan Simpanan Sukarela</span>
                  <span className="font-semibold text-rose-600">{formatRupiah(laporan.arusKas.totalPenarikanSimpanan)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Biaya Operasional & Kantor</span>
                  <span className="font-semibold text-rose-600">{formatRupiah(laporan.arusKas.totalBiayaOperasional)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-rose-700">
                  <span>Total Pengeluaran Kas</span>
                  <span>{formatRupiah(laporan.arusKas.totalPengeluaran)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold">
              <span className="text-[#002045]">Saldo Bersih Kas Periode Ini:</span>
              <span className={`text-base ${laporan.arusKas.saldoKasBersih >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {formatRupiah(laporan.arusKas.saldoKasBersih)}
              </span>
            </div>
          </div>

          {/* Neraca Saldo Koperasi */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-700">balance</span>
                  <h3 className="text-sm font-bold text-[#002045]">Neraca Keuangan Koperasi</h3>
                </div>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Posisi Keuangan
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Aset / Aktiva:</div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Kas Likuid</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(laporan.neraca.kas)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Piutang Pinjaman Anggota (Kredit)</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(laporan.neraca.piutangPinjaman)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-blue-900">
                  <span>Total Aset Koperasi</span>
                  <span>{formatRupiah(laporan.neraca.totalAset)}</span>
                </div>

                <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] pt-3">Kewajiban & Ekuitas / Pasiva:</div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Simpanan Pokok Anggota</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(laporan.neraca.simpananPokok)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Simpanan Wajib Anggota</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(laporan.neraca.simpananWajib)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Simpanan Sukarela Anggota</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(laporan.neraca.simpananSukarela)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-[#002045]">
                  <span>Total Dana Simpanan Anggota</span>
                  <span>{formatRupiah(laporan.neraca.totalKewajibanModal)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-400">
              * Neraca disusun berdasarkan pembukuan kas dan buku piutang riil.
            </div>
          </div>
        </div>

        {/* Section 3: Sisa Hasil Usaha (SHU) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-700">pie_chart</span>
              <h3 className="text-sm font-bold text-[#002045]">Simulasi Perhitungan Sisa Hasil Usaha (SHU)</h3>
            </div>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
              Alokasi RAT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Pendapatan Jasa Bunga Pinjaman:</span>
                <span className="font-semibold text-emerald-700">{formatRupiah(laporan.shu.pendapatanBunga)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pendapatan Administrasi & Lainnya:</span>
                <span className="font-semibold text-emerald-700">{formatRupiah(laporan.shu.pendapatanLain)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Beban Biaya Operasional:</span>
                <span className="font-semibold text-rose-600">-{formatRupiah(laporan.shu.biayaOperasional)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-extrabold text-sm text-purple-900">
                <span>Estimasi SHU Bersih Koperasi:</span>
                <span>{formatRupiah(laporan.shu.shuBersih)}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block">Rencana Alokasi Pembagian Sesuai AD/ART:</span>
              <div className="flex justify-between">
                <span className="text-slate-600">Jasa Anggota ({settings.shuPersenAnggota || 40}%):</span>
                <span className="font-bold text-purple-800">{formatRupiah(laporan.shu.alokasi.anggota)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Jasa Modal / Simpanan ({settings.shuPersenModal || 30}%):</span>
                <span className="font-bold text-purple-800">{formatRupiah(laporan.shu.alokasi.modal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dana Pengurus & Pengawas ({settings.shuPersenPengurus || 20}%):</span>
                <span className="font-bold text-purple-800">{formatRupiah(laporan.shu.alokasi.pengurus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dana Cadangan Koperasi ({settings.shuPersenCadangan || 10}%):</span>
                <span className="font-bold text-purple-800">{formatRupiah(laporan.shu.alokasi.cadangan)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
