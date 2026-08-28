'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { dataService } from '../../lib/dataService';

export default function LaporanPage() {
  const currentYear = new Date().getFullYear();

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
  const [periodeBulan, setPeriodeBulan] = useState('');
  const [periodeTahun, setPeriodeTahun] = useState(String(currentYear));

  // Generate dynamic list of years around current year
  const availableYears = [
    currentYear + 1,
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
    currentYear - 4
  ];

  const loadLaporan = () => {
    const data = dataService.getLaporanData(periodeBulan, periodeTahun);
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
  }, [periodeBulan, periodeTahun]);

  const formatRupiah = (num) => {
    return `Rp ${(Number(num) || 0).toLocaleString('id-ID')}`;
  };

  const handlePrint = () => {
    window.print();
  };

  // Export CSV of Financial Summary
  const handleExportCSV = () => {
    const labelPeriode = `${periodeBulan ? `Bulan ${periodeBulan} ` : 'Semua Bulan '}${periodeTahun || 'Semua Tahun'}`;
    const rows = [
      ['LAPORAN KEUANGAN KOPERASI IDAMAN'],
      ['Periode', labelPeriode],
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
      ['Saldo Kas Bersih', laporan.arusKas.saldoKasBersih],
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
    link.setAttribute('download', `Laporan_Keuangan_Koperasi_${periodeTahun || 'Semua_Tahun'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout
      title="Laporan Keuangan & Rekapitulasi"
      subtitle="Arus kas komprehensif, neraca saldo, dan kalkulasi Sisa Hasil Usaha (SHU)."
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
      {/* Filter Periode */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-700">filter_alt</span>
          <span className="text-xs font-bold text-slate-700">Periode Pelaporan:</span>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <select
              value={periodeBulan}
              onChange={(e) => setPeriodeBulan(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-blue-600 outline-none bg-white font-medium"
            >
              <option value="">Semua Bulan (Tahunan)</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>

          <div>
            <select
              value={periodeTahun}
              onChange={(e) => setPeriodeTahun(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-blue-600 outline-none bg-white font-medium font-bold text-[#002045]"
            >
              <option value="">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={String(yr)}>
                  Tahun {yr} {yr === currentYear ? '(Tahun Sekarang)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div id="laporanContainer" className="flex flex-col gap-6">
        {/* Report Header for Print */}
        <div className="text-center pb-4 border-b border-slate-200">
          <h2 className="text-lg font-black text-[#002045]">{settings.namaKoperasi || 'KOPERASI SIMPAN PINJAM IDAMAN'}</h2>
          <p className="text-xs text-slate-500">{settings.alamat || 'Jakarta, Indonesia'}</p>
          <p className="text-xs font-bold text-blue-900 mt-1">
            Laporan Keuangan & Perkembangan Usaha Periode {periodeBulan ? `Bulan ${periodeBulan} ` : ''}{periodeTahun ? `Tahun ${periodeTahun}` : 'Semua Periode'}
          </p>
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
                  Realisasi
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
              <span className="text-[#002045]">Saldo Kas Riil Koperasi:</span>
              <span className="text-emerald-700 text-base">{formatRupiah(laporan.arusKas.saldoKasBersih)}</span>
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
