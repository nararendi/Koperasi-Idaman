'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { dataService } from '../../lib/dataService';
import { excelExport } from '../../lib/excelExport';
import { pdfExport } from '../../lib/pdfExport';

export default function LaporanPage() {
  const d = new Date();
  const currentYear = d.getFullYear();
  const currentMonthNum = String(d.getMonth() + 1).padStart(2, '0');
  const currentMonthStr = `${currentYear}-${currentMonthNum}`;
  const firstMonthOfYear = `${currentYear}-01`;

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

  const handleExportPDF = () => {
    pdfExport.exportLaporanKeuanganPDF(laporan, settings, getPeriodeLabel());
  };

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

  const getPeriodeLabel = () => {
    if (!bulanMulai && !bulanSelesai) return 'Semua Periode (Semua Waktu)';
    if (bulanMulai === bulanSelesai) return `Bulan ${formatBulanTahun(bulanMulai)}`;
    return `${formatBulanTahun(bulanMulai) || 'Awal'} s/d ${formatBulanTahun(bulanSelesai) || 'Sekarang'}`;
  };

  // Export Professional Excel Document
  const handleExportExcel = () => {
    excelExport.exportLaporanKeuangan(laporan, settings, getPeriodeLabel());
  };

  return (
    <AppLayout
      title="Laporan Keuangan & Rekapitulasi"
      subtitle="Pilih kalender bulan dan tahun untuk merekapitulasi arus kas, neraca saldo, dan alokasi SHU."
      rightAction={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-4 py-2 border border-[#139a8c]/30 bg-[#e0f7f4] hover:bg-[#cbf1ea] text-[#139a8c] rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            Ekspor Excel
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="bg-[#139a8c] hover:bg-[#0e8074] text-white px-5 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Ekspor PDF
          </button>
        </div>
      }
    >
      {/* Month & Year Calendar Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Month Picker Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#139a8c] text-2xl">calendar_month</span>
            <span className="text-xs font-extrabold text-slate-700">Pilih Periode:</span>
          </div>

          <div className="flex items-center gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Dari Bulan</label>
              <input
                type="month"
                value={bulanMulai}
                onChange={(e) => setBulanMulai(e.target.value)}
                className="px-3.5 py-1.5 bg-[#f4faf8] border border-slate-200 rounded-full text-xs focus:border-[#139a8c] outline-none font-bold text-[#14293d] cursor-pointer shadow-2xs"
              />
            </div>

            <span className="text-slate-400 font-bold self-end mb-2">s/d</span>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Sampai Bulan</label>
              <input
                type="month"
                value={bulanSelesai}
                onChange={(e) => setBulanSelesai(e.target.value)}
                className="px-3.5 py-1.5 bg-[#f4faf8] border border-slate-200 rounded-full text-xs focus:border-[#139a8c] outline-none font-bold text-[#14293d] cursor-pointer shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Preset:</span>
          <button
            type="button"
            onClick={setPresetBulanIni}
            className="px-3.5 py-1.5 rounded-full border border-slate-200 hover:bg-[#f4faf8] text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Bulan Ini ({formatBulanTahun(currentMonthStr)})
          </button>
          <button
            type="button"
            onClick={setPresetTahunIni}
            className="px-3.5 py-1.5 rounded-full bg-[#e0f7f4] border border-[#139a8c]/30 hover:bg-[#cbf1ea] text-[11px] font-extrabold text-[#139a8c] transition-colors cursor-pointer"
          >
            Tahun {currentYear} (Jan - Des)
          </button>
          <button
            type="button"
            onClick={setPresetSemuaWaktu}
            className="px-3.5 py-1.5 rounded-full border border-slate-200 hover:bg-[#f4faf8] text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer"
          >
            Semua Waktu
          </button>
        </div>
      </div>

      {/* Printable Report Container */}
      <div id="laporanContainer" className="flex flex-col gap-6">
        {/* Report Header for Print */}
        <div className="text-center pb-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-[#14293d] tracking-wide">{settings.namaKoperasi || 'KOPERASI SIMPAN PINJAM IDAMAN'}</h2>
          <p className="text-xs text-slate-500">{settings.alamat || 'Jakarta, Indonesia'}</p>
          <div className="inline-flex items-center gap-1.5 bg-[#e0f7f4] border border-[#139a8c]/20 px-4 py-1.5 rounded-full text-xs font-bold text-[#139a8c] mt-2 shadow-2xs">
            <span className="material-symbols-outlined text-sm">date_range</span>
            <span>
              Periode Laporan: {getPeriodeLabel()}
            </span>
          </div>
        </div>

        {/* Section 1 & Section 2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Laporan Arus Kas */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#139a8c]">receipt_long</span>
                  <h3 className="text-sm font-extrabold text-[#14293d]">Laporan Arus Kas (Cashflow)</h3>
                </div>
                <span className="text-[11px] font-extrabold text-[#139a8c] bg-[#e0f7f4] px-2.5 py-0.5 rounded-full">
                  Realisasi Periode
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Arus Kas Masuk:</div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Penerimaan Setoran Simpanan</span>
                  <span className="font-semibold text-[#139a8c]">{formatRupiah(laporan.arusKas.totalSimpananMasuk)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Penerimaan Angsuran Pinjaman</span>
                  <span className="font-semibold text-[#139a8c]">{formatRupiah(laporan.arusKas.totalAngsuranMasuk)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Pendapatan Lain / Administrasi</span>
                  <span className="font-semibold text-[#139a8c]">{formatRupiah(laporan.arusKas.totalPendapatanLain)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-100 font-extrabold text-[#139a8c]">
                  <span>Total Pemasukan Kas</span>
                  <span>{formatRupiah(laporan.arusKas.totalPemasukan)}</span>
                </div>

                <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] pt-3">Arus Kas Keluar:</div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Penyaluran Pinjaman Anggota</span>
                  <span className="font-semibold text-rose-500">{formatRupiah(laporan.arusKas.totalPenyaluranPinjaman)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Penarikan Simpanan Sukarela</span>
                  <span className="font-semibold text-rose-500">{formatRupiah(laporan.arusKas.totalPenarikanSimpanan)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Biaya Operasional & Kantor</span>
                  <span className="font-semibold text-rose-500">{formatRupiah(laporan.arusKas.totalBiayaOperasional)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-100 font-extrabold text-rose-600">
                  <span>Total Pengeluaran Kas</span>
                  <span>{formatRupiah(laporan.arusKas.totalPengeluaran)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-extrabold">
              <span className="text-[#14293d]">Saldo Bersih Kas Periode Ini:</span>
              <span className={`text-base ${laporan.arusKas.saldoKasBersih >= 0 ? 'text-[#139a8c]' : 'text-rose-500'}`}>
                {formatRupiah(laporan.arusKas.saldoKasBersih)}
              </span>
            </div>
          </div>

          {/* Neraca Saldo Koperasi */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#139a8c]">balance</span>
                  <h3 className="text-sm font-extrabold text-[#14293d]">Neraca Keuangan Koperasi</h3>
                </div>
                <span className="text-[11px] font-extrabold text-[#139a8c] bg-[#e0f7f4] px-2.5 py-0.5 rounded-full">
                  Posisi Keuangan
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Aset / Aktiva:</div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Kas Likuid</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(laporan.neraca.kas)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Piutang Pinjaman Anggota (Kredit)</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(laporan.neraca.piutangPinjaman)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-100 font-extrabold text-[#139a8c]">
                  <span>Total Aset Koperasi</span>
                  <span>{formatRupiah(laporan.neraca.totalAset)}</span>
                </div>

                <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] pt-3">Kewajiban & Ekuitas / Pasiva:</div>
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
                <div className="flex justify-between pt-1.5 border-t border-slate-100 font-extrabold text-[#14293d]">
                  <span>Total Dana Simpanan Anggota</span>
                  <span>{formatRupiah(laporan.neraca.totalKewajibanModal)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
              * Neraca disusun berdasarkan pembukuan kas dan buku piutang riil.
            </div>
          </div>
        </div>

        {/* Section 3: Sisa Hasil Usaha (SHU) */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#139a8c]">pie_chart</span>
              <h3 className="text-sm font-extrabold text-[#14293d]">Simulasi Perhitungan Sisa Hasil Usaha (SHU)</h3>
            </div>
            <span className="text-[11px] font-extrabold text-[#139a8c] bg-[#e0f7f4] px-2.5 py-0.5 rounded-full">
              Alokasi RAT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Pendapatan Jasa Bunga Pinjaman:</span>
                <span className="font-semibold text-[#139a8c]">{formatRupiah(laporan.shu.pendapatanBunga)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pendapatan Administrasi & Lainnya:</span>
                <span className="font-semibold text-[#139a8c]">{formatRupiah(laporan.shu.pendapatanLain)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Beban Biaya Operasional:</span>
                <span className="font-semibold text-rose-500">-{formatRupiah(laporan.shu.biayaOperasional)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 font-extrabold text-sm text-[#14293d]">
                <span>Estimasi SHU Bersih Koperasi:</span>
                <span className="text-[#139a8c]">{formatRupiah(laporan.shu.shuBersih)}</span>
              </div>
            </div>

            <div className="bg-[#f4faf8] p-4 rounded-2xl border border-[#d8eee8] space-y-2">
              <span className="font-extrabold text-[#14293d] block">Rencana Alokasi Pembagian Sesuai AD/ART:</span>
              <div className="flex justify-between">
                <span className="text-slate-600">Jasa Anggota ({settings.shuPersenAnggota || 40}%):</span>
                <span className="font-bold text-[#139a8c]">{formatRupiah(laporan.shu.alokasi.anggota)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Jasa Modal / Simpanan ({settings.shuPersenModal || 30}%):</span>
                <span className="font-bold text-[#139a8c]">{formatRupiah(laporan.shu.alokasi.modal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dana Pengurus & Pengawas ({settings.shuPersenPengurus || 20}%):</span>
                <span className="font-bold text-[#139a8c]">{formatRupiah(laporan.shu.alokasi.pengurus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dana Cadangan Koperasi ({settings.shuPersenCadangan || 10}%):</span>
                <span className="font-bold text-[#139a8c]">{formatRupiah(laporan.shu.alokasi.cadangan)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
