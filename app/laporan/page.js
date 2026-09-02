'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { dataService } from '../../lib/dataService';
import { excelExport } from '../../lib/excelExport';
import { pdfExport } from '../../lib/pdfExport';
import { formatRupiah } from '../../lib/formatters';

export default function LaporanPage() {
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

  const getPeriodeLabel = () => {
    const d = new Date();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  const loadLaporan = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
    const startDate = `${y}-${m}-01`;
    const endDate = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;

    const data = dataService.getLaporanData({ startDate, endDate });
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
  }, []);

  const handleExportPDF = () => {
    pdfExport.exportLaporanKeuanganPDF(laporan, settings, getPeriodeLabel());
  };

  // Export Professional Excel Document
  const handleExportExcel = () => {
    excelExport.exportLaporanKeuangan(laporan, settings, getPeriodeLabel());
  };

  return (
    <AppLayout
      title="Laporan Keuangan & Rekapitulasi"
      subtitle="Rekapitulasi otomatis arus kas, neraca saldo, dan alokasi SHU periode berjalan."
      rightAction={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-4 py-2 border border-[#2563eb]/30 bg-[#eff6ff] hover:bg-[#dbeafe] text-[#2563eb] rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            Ekspor Excel
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Ekspor PDF
          </button>
        </div>
      }
    >
      {/* Printable Report Container */}
      <div id="laporanContainer" className="flex flex-col gap-6">
        {/* Report Header for Print */}
        <div className="text-center pb-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-[#0f172a] tracking-wide">{settings.namaKoperasi || 'KOPERASI IDAMAN'}</h2>
          {settings.alamat && (
            <p className="text-xs text-slate-500">{settings.alamat}{settings.telepon ? ` • Telp: ${settings.telepon}` : ''}</p>
          )}
          <div className="inline-flex items-center gap-1.5 bg-[#eff6ff] border border-[#2563eb]/20 px-4 py-1.5 rounded-full text-xs font-bold text-[#2563eb] mt-2 shadow-2xs">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
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
                  <span className="material-symbols-outlined text-[#2563eb]">receipt_long</span>
                  <h3 className="text-sm font-extrabold text-[#0f172a]">Laporan Arus Kas (Cashflow)</h3>
                </div>
                <span className="text-[11px] font-extrabold text-[#2563eb] bg-[#eff6ff] px-2.5 py-0.5 rounded-full">
                  Realisasi Periode
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Arus Kas Masuk:</div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Penerimaan Setoran Simpanan</span>
                  <span className="font-semibold text-[#2563eb]">{formatRupiah(laporan.arusKas.totalSimpananMasuk)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Penerimaan Angsuran Pinjaman</span>
                  <span className="font-semibold text-[#2563eb]">{formatRupiah(laporan.arusKas.totalAngsuranMasuk)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span className="text-slate-600">Pendapatan Lain / Administrasi</span>
                  <span className="font-semibold text-[#2563eb]">{formatRupiah(laporan.arusKas.totalPendapatanLain)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-100 font-extrabold text-[#2563eb]">
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
              <span className="text-[#0f172a]">Saldo Bersih Kas Periode Ini:</span>
              <span className={`text-base ${laporan.arusKas.saldoKasBersih >= 0 ? 'text-[#2563eb]' : 'text-rose-500'}`}>
                {formatRupiah(laporan.arusKas.saldoKasBersih)}
              </span>
            </div>
          </div>

          {/* Neraca Saldo Koperasi */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2563eb]">balance</span>
                  <h3 className="text-sm font-extrabold text-[#0f172a]">Neraca Keuangan Koperasi</h3>
                </div>
                <span className="text-[11px] font-extrabold text-[#2563eb] bg-[#eff6ff] px-2.5 py-0.5 rounded-full">
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
                <div className="flex justify-between pt-1.5 border-t border-slate-100 font-extrabold text-[#2563eb]">
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
                <div className="flex justify-between pt-1.5 border-t border-slate-100 font-extrabold text-[#0f172a]">
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
              <span className="material-symbols-outlined text-[#2563eb]">pie_chart</span>
              <h3 className="text-sm font-extrabold text-[#0f172a]">Simulasi Perhitungan Sisa Hasil Usaha (SHU)</h3>
            </div>
            <span className="text-[11px] font-extrabold text-[#2563eb] bg-[#eff6ff] px-2.5 py-0.5 rounded-full">
              Alokasi RAT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Pendapatan Jasa Bunga Pinjaman:</span>
                <span className="font-semibold text-[#2563eb]">{formatRupiah(laporan.shu.pendapatanBunga)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pendapatan Administrasi & Lainnya:</span>
                <span className="font-semibold text-[#2563eb]">{formatRupiah(laporan.shu.pendapatanLain)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Beban Biaya Operasional:</span>
                <span className="font-semibold text-rose-500">-{formatRupiah(laporan.shu.biayaOperasional)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 font-extrabold text-sm text-[#0f172a]">
                <span>Estimasi SHU Bersih Koperasi:</span>
                <span className="text-[#2563eb]">{formatRupiah(laporan.shu.shuBersih)}</span>
              </div>
            </div>

            <div className="bg-[#eff6ff] p-4 rounded-2xl border border-[#bfdbfe] space-y-2">
              <span className="font-extrabold text-[#0f172a] block">Rencana Alokasi Pembagian Sesuai AD/ART:</span>
              <div className="flex justify-between">
                <span className="text-slate-600">Jasa Anggota ({settings.shuPersenAnggota || 40}%):</span>
                <span className="font-bold text-[#2563eb]">{formatRupiah(laporan.shu.alokasi.anggota)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Jasa Modal / Simpanan ({settings.shuPersenModal || 30}%):</span>
                <span className="font-bold text-[#2563eb]">{formatRupiah(laporan.shu.alokasi.modal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dana Pengurus & Pengawas ({settings.shuPersenPengurus || 20}%):</span>
                <span className="font-bold text-[#2563eb]">{formatRupiah(laporan.shu.alokasi.pengurus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dana Cadangan Koperasi ({settings.shuPersenCadangan || 10}%):</span>
                <span className="font-bold text-[#2563eb]">{formatRupiah(laporan.shu.alokasi.cadangan)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Tanda Tangan Pengurus (Kiri: Ketua, Kanan: Bendahara) */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-center">
            {/* Kiri: Ketua Pengurus */}
            <div className="w-full sm:w-64 flex flex-col items-center">
              <span className="text-slate-500 font-semibold mb-1">Mengetahui,</span>
              <span className="font-extrabold text-[#0f172a] text-sm">Ketua Pengurus</span>
              <div className="h-16"></div>
              <span className="font-extrabold text-[#0f172a] text-sm border-b border-slate-800 pb-0.5 min-w-36">
                {settings.ketua || '-'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Ketua Koperasi</span>
            </div>

            {/* Kanan: Bendahara */}
            <div className="w-full sm:w-64 flex flex-col items-center">
              <span className="text-slate-500 font-semibold mb-1">
                {settings.alamat ? `${settings.alamat.split(',').pop().trim()}, ` : ''}{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="font-extrabold text-[#0f172a] text-sm">Bendahara</span>
              <div className="h-16"></div>
              <span className="font-extrabold text-[#0f172a] text-sm border-b border-slate-800 pb-0.5 min-w-36">
                {settings.bendahara || '-'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Penanggung Jawab Keuangan</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
