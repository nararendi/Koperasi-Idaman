'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '../../components/AppLayout';
import { dataService } from '../../lib/dataService';
import { excelExport } from '../../lib/excelExport';
import { hitungSimulasiPinjaman, formatRupiah } from '../../lib/formatters';

export default function PinjamanPage() {
  const [summary, setSummary] = useState({
    berjalan: 0,
    lunas: 0,
    diajukan: 0,
    sisaHutang: 0
  });

  const [pinjamanList, setPinjamanList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);
  const [settings, setSettings] = useState({});
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modal: Ajukan Pinjaman Baru
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [showSchedulePreview, setShowSchedulePreview] = useState(false);
  const [applyForm, setApplyForm] = useState({
    nomor_anggota: '',
    jumlah: '10000000',
    bunga: 2.5,
    tenor: 12,
    metodeBunga: 'menurun',
    pembulatan: 50000,
    keperluan: ''
  });

  // Modal: Bayar Angsuran
  const [bayarModalOpen, setBayarModalOpen] = useState(false);
  const [selectedPinjamanBayar, setSelectedPinjamanBayar] = useState(null);
  const [bayarForm, setBayarForm] = useState({
    jumlahBayar: '',
    metode: 'Tunai',
    penerima: 'Admin Kasir'
  });

  // Modal: Detail Pinjaman & Riwayat Angsuran
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPinjamanDetail, setSelectedPinjamanDetail] = useState(null);

  const loadData = () => {
    const s = dataService.getPinjamanSummary();
    const list = dataService.getPinjamanList();
    const anggota = dataService.getAnggotaList();
    const currentSettings = dataService.getSettings();

    setSummary(s);
    setPinjamanList(list);
    setAnggotaList(anggota);
    setSettings(currentSettings);

    if (anggota.length > 0 && !applyForm.nomor_anggota) {
      setApplyForm((prev) => ({
        ...prev,
        nomor_anggota: anggota[0].nomor_anggota || anggota[0].id,
        bunga: 2.5
      }));
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('koperasi_db_updated', handleUpdate);
    return () => window.removeEventListener('koperasi_db_updated', handleUpdate);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Open Apply Modal
  const handleOpenApplyModal = () => {
    setApplyForm({
      nomor_anggota: anggotaList.length > 0 ? (anggotaList[0].nomor_anggota || anggotaList[0].id) : '',
      jumlah: '10000000',
      bunga: 2.5,
      tenor: 12,
      metodeBunga: 'menurun',
      pembulatan: 50000,
      keperluan: ''
    });
    setShowSchedulePreview(false);
    setApplyModalOpen(true);
  };

  // Submit Loan Application
  const handleSubmitApply = (e) => {
    e.preventDefault();
    if (!applyForm.nomor_anggota) {
      alert('Pilih anggota pemohon pinjaman.');
      return;
    }
    if (!applyForm.jumlah || Number(applyForm.jumlah) <= 0) {
      alert('Masukkan nominal pinjaman yang valid.');
      return;
    }

    const newLoan = dataService.applyPinjaman(applyForm);
    setApplyModalOpen(false);
    showToast(`Pengajuan pinjaman baru (${newLoan.nomor_pinjaman}) senilai Rp ${Number(newLoan.jumlah).toLocaleString('id-ID')} berhasil diajukan!`);
  };

  // Change Loan Status (Approve / Reject / Disburse)
  const handleUpdateStatus = (id, newStatus) => {
    if (newStatus === 'Berjalan') {
      if (!confirm('Apakah Anda yakin ingin mencairkan dana pinjaman ini? Saldo Kas Koperasi akan otomatis dipotong untuk pencairan dana pinjaman.')) {
        return;
      }
    }
    const updated = dataService.updatePinjamanStatus(id, newStatus);
    if (updated) {
      showToast(`Status pinjaman ${updated.nomor_pinjaman} diubah menjadi "${newStatus}"`);
    }
  };

  // Open Pay Installment Modal
  const handleOpenBayarModal = (pinjaman) => {
    setSelectedPinjamanBayar(pinjaman);
    setBayarForm({
      jumlahBayar: pinjaman.total_angsuran_bulanan || Math.round(Number(pinjaman.total_pinjaman) / Number(pinjaman.tenor)),
      metode: 'Tunai',
      penerima: 'Admin Kasir'
    });
    setBayarModalOpen(true);
  };

  // Submit Installment Payment
  const handleSubmitBayar = (e) => {
    e.preventDefault();
    if (!selectedPinjamanBayar) return;

    const res = dataService.payPinjamanInstallment({
      pinjamanId: selectedPinjamanBayar.id,
      jumlahBayar: bayarForm.jumlahBayar,
      metode: bayarForm.metode,
      penerima: bayarForm.penerima
    });

    setBayarModalOpen(false);
    showToast(`Pembayaran angsuran Rp ${Number(bayarForm.jumlahBayar).toLocaleString('id-ID')} berhasil dibukukan ke Kas Koperasi!`);
  };

  // Open Detail Modal
  const handleOpenDetailModal = (pinjaman) => {
    setSelectedPinjamanDetail(pinjaman);
    setDetailModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Berjalan':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">Berjalan</span>;
      case 'Diajukan':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">Diajukan</span>;
      case 'Disetujui':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">Disetujui</span>;
      case 'Lunas':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">Lunas</span>;
      case 'Ditolak':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">Ditolak</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const filteredList = pinjamanList.filter((item) => {
    const nama = (item.nama || '').toLowerCase();
    const noPj = (item.nomor_pinjaman || item.id || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchSearch = nama.includes(query) || noPj.includes(query);
    const matchStatus = statusFilter === 'Semua' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatRupiah = (num) => {
    return `Rp ${(Number(num) || 0).toLocaleString('id-ID')}`;
  };

  // Real-time Declining Balance Loan Calculation & Rounding Preview
  const liveSim = hitungSimulasiPinjaman(
    applyForm.jumlah,
    applyForm.tenor,
    applyForm.bunga,
    applyForm.metodeBunga,
    applyForm.pembulatan
  );

  return (
    <AppLayout
      title="Manajemen Pinjaman Koperasi"
      subtitle="Kelola pengajuan kredit, persetujuan, pencairan dana, dan penerimaan angsuran."
      rightAction={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => excelExport.exportPinjaman(filteredPinjaman, summary, settings)}
            className="px-3.5 py-2.5 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-700">description</span>
            Ekspor Excel
          </button>
          <button
            type="button"
            onClick={handleOpenApplyModal}
            className="bg-[#002045] hover:bg-[#1a365d] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            Ajukan Pinjaman Baru
          </button>
        </div>
      }
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Pinjaman Berjalan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">trending_up</span>
            </div>
          </div>
          <p className="text-xl font-extrabold text-emerald-700">{formatRupiah(summary.berjalan)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Total plafon kredit aktif</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Sisa Piutang / Tagihan</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">receipt_long</span>
            </div>
          </div>
          <p className="text-xl font-extrabold text-amber-700">{formatRupiah(summary.sisaHutang)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Belum terbayar dari pinjaman aktif</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Pinjaman Selesai (Lunas)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">check_circle</span>
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#002045]">{formatRupiah(summary.lunas)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Riwayat kredit lunas tuntas</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Menunggu Persetujuan</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">pending_actions</span>
            </div>
          </div>
          <p className="text-xl font-extrabold text-purple-700">{formatRupiah(summary.diajukan)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Pengajuan baru yang perlu ditinjau</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-slate-500 mr-1">Status:</span>
            {['Semua', 'Diajukan', 'Disetujui', 'Berjalan', 'Lunas', 'Ditolak'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-[#002045] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari peminjam, nomor kredit..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:border-blue-600 outline-none bg-white"
            />
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="px-4 py-3">No. Pinjaman</th>
                <th className="px-4 py-3">Peminjam</th>
                <th className="px-4 py-3 text-right">Plafon Pinjaman</th>
                <th className="px-4 py-3">Bunga & Tenor</th>
                <th className="px-4 py-3 text-right">Angsuran / Bln</th>
                <th className="px-4 py-3 text-right">Sisa Hutang</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi / Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    Tidak ditemukan data pinjaman dengan filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {item.nomor_pinjaman || item.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-[#002045]">{item.nama}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.nomor_anggota}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#002045] whitespace-nowrap">
                      {formatRupiah(item.jumlah)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      <div>{item.bunga}% / bln</div>
                      <div className="text-[11px] font-semibold text-blue-800">{item.tenor} Bulan</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700 whitespace-nowrap">
                      {formatRupiah(item.total_angsuran_bulanan || item.angsuran_pokok)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                      {item.status === 'Lunas' ? (
                        <span className="text-emerald-700">Rp 0 (Lunas)</span>
                      ) : (
                        <span className="text-rose-600">{formatRupiah(item.sisa_hutang || item.total_pinjaman)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Action buttons depending on status */}
                        {item.status === 'Diajukan' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item.id, 'Disetujui')}
                              title="Setujui Pengajuan Pinjaman"
                              className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[11px] font-bold"
                            >
                              Setujui
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item.id, 'Ditolak')}
                              title="Tolak Pinjaman"
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold"
                            >
                              Tolak
                            </button>
                          </>
                        )}

                        {item.status === 'Disetujui' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item.id, 'Berjalan')}
                            title="Cairkan Dana & Potong Kas"
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-sm">payments</span>
                            Cairkan Dana
                          </button>
                        )}

                        {item.status === 'Berjalan' && (
                          <button
                            type="button"
                            onClick={() => handleOpenBayarModal(item)}
                            title="Bayar Angsuran Pinjaman"
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-sm">add_card</span>
                            Bayar Angsuran
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenDetailModal(item)}
                          title="Lihat Detail & Jadwal Angsuran"
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded"
                        >
                          <span className="material-symbols-outlined text-lg">info</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AJUKAN PINJAMAN BARU */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-[#002045] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">request_quote</span>
                <h3 className="text-base font-bold">Formulir Pengajuan Pinjaman</h3>
              </div>
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitApply} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex flex-col gap-4 text-xs flex-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pilih Anggota Pemohon *</label>
                  <select
                    required
                    value={applyForm.nomor_anggota}
                    onChange={(e) => setApplyForm({ ...applyForm, nomor_anggota: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none bg-white font-medium"
                  >
                    <option value="">-- Pilih Anggota --</option>
                    {anggotaList.map((a) => (
                      <option key={a.id || a.nomor_anggota} value={a.nomor_anggota || a.id}>
                        {a.nomor_anggota || a.id} - {a.nama || a.nama_lengkap}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="font-bold text-slate-700 block mb-1">Plafon Pinjaman (Rp) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-xs">Rp</span>
                      <input
                        type="number"
                        required
                        min="500000"
                        step="500000"
                        value={applyForm.jumlah}
                        onChange={(e) => setApplyForm({ ...applyForm, jumlah: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-blue-900 text-xs"
                      />
                    </div>
                    {applyForm.jumlah && (
                      <p className="text-[10px] text-blue-700 font-bold mt-1">
                        {formatRupiah(applyForm.jumlah)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tenor (Bulan) *</label>
                    <select
                      value={applyForm.tenor}
                      onChange={(e) => setApplyForm({ ...applyForm, tenor: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none bg-white font-semibold text-xs"
                    >
                      <option value={3}>3 Bulan</option>
                      <option value={6}>6 Bulan</option>
                      <option value={10}>10 Bulan</option>
                      <option value={12}>12 Bulan (1 Tahun)</option>
                      <option value={18}>18 Bulan</option>
                      <option value={24}>24 Bulan (2 Tahun)</option>
                      <option value={36}>36 Bulan (3 Tahun)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Suku Bunga (% / Bln)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={applyForm.bunga}
                      onChange={(e) => setApplyForm({ ...applyForm, bunga: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-semibold text-slate-700 text-xs"
                    />
                  </div>
                </div>

                {/* Metode Bunga & Pembulatan Pokok */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="font-bold text-[#002045] block mb-1">Sistem Perhitungan Bunga</label>
                    <select
                      value={applyForm.metodeBunga}
                      onChange={(e) => setApplyForm({ ...applyForm, metodeBunga: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none bg-white font-bold text-[#002045] text-xs cursor-pointer"
                    >
                      <option value="menurun">Bunga Menurun (Efektif - Dari Sisa Pinjaman) ⭐</option>
                      <option value="flat">Bunga Flat (Tetap Tiap Bulan)</option>
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {applyForm.metodeBunga === 'menurun'
                        ? 'Bunga awal 2.5% x Plafon, bulan selanjutnya 2.5% x Sisa Pokok (menurun).'
                        : 'Bunga tetap flat dihitung dari plafon awal.'}
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-[#002045] block mb-1">Pembulatan Pokok / Bulan</label>
                    <select
                      value={applyForm.pembulatan}
                      onChange={(e) => setApplyForm({ ...applyForm, pembulatan: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none bg-white font-bold text-[#002045] text-xs cursor-pointer"
                    >
                      <option value={50000}>Dibulatkan ke atas Rp 50.000 (contoh: 833.333 &rarr; 850.000)</option>
                      <option value={10000}>Dibulatkan ke atas Rp 10.000 (contoh: 833.333 &rarr; 840.000)</option>
                      <option value={1000}>Dibulatkan ke atas Rp 1.000 (contoh: 833.333 &rarr; 834.000)</option>
                      <option value={0}>Tanpa Pembulatan (Nominal Pas)</option>
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Mencegah pecahan ganjil agar cicilan bulat dan mudah dibayarkan.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tujuan / Keperluan Pinjaman</label>
                  <input
                    type="text"
                    value={applyForm.keperluan}
                    onChange={(e) => setApplyForm({ ...applyForm, keperluan: e.target.value })}
                    placeholder="Contoh: Tambahan modal usaha warung sembako"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>

                {/* Real-time Loan Calculator Preview with Declining Interest Details */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#002045] flex items-center gap-1.5 text-xs">
                      <span className="material-symbols-outlined text-base text-blue-600">calculate</span>
                      Simulasi Angsuran Pinjaman {applyForm.metodeBunga === 'menurun' ? '(Bunga Menurun)' : '(Bunga Flat)'}:
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Pokok Dibulatkan: {formatRupiah(liveSim.pokokPerBulan)}/Bln
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                      <span className="text-slate-500 block text-[10px]">Pokok / Bulan:</span>
                      <span className="font-extrabold text-slate-800">{formatRupiah(liveSim.pokokPerBulan)}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                      <span className="text-slate-500 block text-[10px]">Bunga Bulan ke-1:</span>
                      <span className="font-extrabold text-emerald-700">{formatRupiah(liveSim.bungaBulanPertama)}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                      <span className="text-slate-500 block text-[10px]">Angsuran Bulan ke-1:</span>
                      <span className="font-extrabold text-blue-900">{formatRupiah(liveSim.angsuranBulanPertama)}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                      <span className="text-slate-500 block text-[10px]">Total Estimasi:</span>
                      <span className="font-extrabold text-indigo-900">{formatRupiah(liveSim.totalPengembalian)}</span>
                    </div>
                  </div>

                  {applyForm.metodeBunga === 'menurun' && liveSim.jadwal && liveSim.jadwal.length > 1 && (
                    <div className="text-[11px] bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-emerald-900 flex items-center justify-between">
                      <span>
                        📉 <strong>Bulan ke-2 Menurun:</strong> Pokok {formatRupiah(liveSim.jadwal[1].pokok)} + Bunga <strong>{formatRupiah(liveSim.jadwal[1].bunga)}</strong> (Sisa {formatRupiah(liveSim.jadwal[1].sisaAwal)}) = <strong>{formatRupiah(liveSim.jadwal[1].totalAngsuran)}</strong>
                      </span>
                    </div>
                  )}

                  {/* Collapsible Monthly Schedule */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowSchedulePreview(!showSchedulePreview)}
                      className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {showSchedulePreview ? 'expand_less' : 'expand_more'}
                      </span>
                      {showSchedulePreview ? 'Sembunyikan Rincian Jadwal Angsuran' : `Lihat Jadwal Angsuran Menurun Lengkap (${liveSim.tenor} Bulan)`}
                    </button>

                    {showSchedulePreview && (
                      <div className="mt-2 max-h-48 overflow-y-auto border border-blue-200 rounded-lg bg-white shadow-2xs">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-[#002045] text-white font-bold">
                              <th className="p-1.5 text-center">Bln</th>
                              <th className="p-1.5 text-right">Sisa Pokok Awal</th>
                              <th className="p-1.5 text-right">Pokok</th>
                              <th className="p-1.5 text-right">Bunga ({applyForm.bunga}%)</th>
                              <th className="p-1.5 text-right">Total Tagihan</th>
                              <th className="p-1.5 text-right">Sisa Pokok Akhir</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {liveSim.jadwal.map((j) => (
                              <tr key={j.bulanKe} className="hover:bg-blue-50/50">
                                <td className="p-1.5 text-center font-bold">{j.bulanKe}</td>
                                <td className="p-1.5 text-right text-slate-600">{formatRupiah(j.sisaAwal)}</td>
                                <td className="p-1.5 text-right font-semibold">{formatRupiah(j.pokok)}</td>
                                <td className="p-1.5 text-right text-emerald-700 font-semibold">{formatRupiah(j.bunga)}</td>
                                <td className="p-1.5 text-right font-bold text-blue-900">{formatRupiah(j.totalAngsuran)}</td>
                                <td className="p-1.5 text-right text-slate-500">{formatRupiah(j.sisaAkhir)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002045] text-white rounded-lg font-bold hover:bg-[#1a365d] shadow-sm cursor-pointer"
                >
                  Ajukan Pinjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BAYAR ANGSURAN */}
      {bayarModalOpen && selectedPinjamanBayar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-amber-600 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">payments</span>
                <h3 className="text-base font-bold">Bayar Angsuran Pinjaman</h3>
              </div>
              <button
                type="button"
                onClick={() => setBayarModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitBayar} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex flex-col gap-4 text-xs flex-1">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Peminjam:</span>
                    <span className="font-bold text-[#002045]">{selectedPinjamanBayar.nama}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">No. Pinjaman:</span>
                    <span className="font-mono text-slate-700">{selectedPinjamanBayar.nomor_pinjaman || selectedPinjamanBayar.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sisa Hutang:</span>
                    <span className="font-bold text-rose-600">{formatRupiah(selectedPinjamanBayar.sisa_hutang)}</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nominal Pembayaran (Rp) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">Rp</span>
                    <input
                      type="number"
                      required
                      min="1000"
                      value={bayarForm.jumlahBayar}
                      onChange={(e) => setBayarForm({ ...bayarForm, jumlahBayar: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-lg focus:border-amber-600 outline-none text-base font-bold text-amber-800"
                    />
                  </div>
                  {bayarForm.jumlahBayar && (
                    <p className="text-[11px] text-amber-700 font-bold mt-1">
                      Format: {formatRupiah(bayarForm.jumlahBayar)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Metode Pembayaran</label>
                  <select
                    value={bayarForm.metode}
                    onChange={(e) => setBayarForm({ ...bayarForm, metode: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-amber-600 outline-none bg-white font-medium"
                  >
                    <option value="Tunai">Tunai / Kasir</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="Potong Gaji">Potong Gaji</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Petugas Penerima</label>
                  <input
                    type="text"
                    value={bayarForm.penerima}
                    onChange={(e) => setBayarForm({ ...bayarForm, penerima: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-amber-600 outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setBayarModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 shadow-sm cursor-pointer"
                >
                  Simpan Angsuran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL PINJAMAN */}
      {detailModalOpen && selectedPinjamanDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-5 bg-[#002045] text-white flex justify-between items-center rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold">Rincian & Jadwal Pinjaman</h3>
                <p className="text-xs text-blue-200 font-mono">{selectedPinjamanDetail.nomor_pinjaman || selectedPinjamanDetail.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-semibold block">Nama Peminjam:</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedPinjamanDetail.nama}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Status Pinjaman:</span>
                  <span>{getStatusBadge(selectedPinjamanDetail.status)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Plafon Pinjaman:</span>
                  <span className="font-bold text-slate-800">{formatRupiah(selectedPinjamanDetail.jumlah)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Tenor & Bunga:</span>
                  <span className="font-bold text-slate-800">{selectedPinjamanDetail.tenor} Bulan ({selectedPinjamanDetail.bunga}% / bln)</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Total Kewajiban:</span>
                  <span className="font-bold text-slate-800">{formatRupiah(selectedPinjamanDetail.total_pinjaman)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Sisa Hutang:</span>
                  <span className="font-bold text-rose-600">{formatRupiah(selectedPinjamanDetail.sisa_hutang)}</span>
                </div>
              </div>

              {/* Installment History Table */}
              <div>
                <h4 className="text-sm font-bold text-[#002045] mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-blue-700">history</span>
                  Riwayat Pembayaran Angsuran ({selectedPinjamanDetail.riwayat_angsuran?.length || 0})
                </h4>

                {(!selectedPinjamanDetail.riwayat_angsuran || selectedPinjamanDetail.riwayat_angsuran.length === 0) ? (
                  <p className="text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                    Belum ada riwayat pembayaran angsuran.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Angsuran Ke</th>
                          <th className="px-3 py-2">Tanggal</th>
                          <th className="px-3 py-2">Metode</th>
                          <th className="px-3 py-2 text-right">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPinjamanDetail.riwayat_angsuran.map((ang) => (
                          <tr key={ang.id}>
                            <td className="px-3 py-2 font-bold text-blue-900">Ke-{ang.angsuran_ke}</td>
                            <td className="px-3 py-2 text-slate-600">{ang.tanggal}</td>
                            <td className="px-3 py-2 text-slate-600">{ang.metode}</td>
                            <td className="px-3 py-2 text-right font-bold text-emerald-700">{formatRupiah(ang.jumlah)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Projected Schedule if Available */}
              {selectedPinjamanDetail.jadwal_angsuran && selectedPinjamanDetail.jadwal_angsuran.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#002045] mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-indigo-700">calendar_month</span>
                    Jadwal Estimasi Angsuran Bunga Menurun ({selectedPinjamanDetail.tenor} Bulan)
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-1.5 text-center">Bln</th>
                          <th className="p-1.5 text-right">Sisa Pokok Awal</th>
                          <th className="p-1.5 text-right">Pokok</th>
                          <th className="p-1.5 text-right">Bunga</th>
                          <th className="p-1.5 text-right">Total Tagihan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPinjamanDetail.jadwal_angsuran.map((j) => (
                          <tr key={j.bulanKe}>
                            <td className="p-1.5 text-center font-bold">{j.bulanKe}</td>
                            <td className="p-1.5 text-right text-slate-600">{formatRupiah(j.sisaAwal)}</td>
                            <td className="p-1.5 text-right font-semibold">{formatRupiah(j.pokok)}</td>
                            <td className="p-1.5 text-right text-emerald-700 font-semibold">{formatRupiah(j.bunga)}</td>
                            <td className="p-1.5 text-right font-bold text-blue-900">{formatRupiah(j.totalAngsuran)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-[#002045] text-white rounded-lg text-xs font-bold hover:bg-[#1a365d]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
