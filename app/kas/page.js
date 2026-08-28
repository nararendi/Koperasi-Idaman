'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { dataService } from '../../lib/dataService';
import { excelExport } from '../../lib/excelExport';

export default function KasPage() {
  const [summary, setSummary] = useState({
    masuk: 0,
    keluar: 0,
    saldo: 0
  });

  const [kasList, setKasList] = useState([]);
  const [settings, setSettings] = useState({});
  const [filterJenis, setFilterJenis] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    jenis: 'Pengeluaran',
    kategori: 'Operasional',
    jumlah: '',
    keterangan: '',
    tanggal: ''
  });

  const loadData = () => {
    const s = dataService.getKasSummary();
    const list = dataService.getKasList();
    const sett = dataService.getSettings();
    setSummary(s);
    setKasList(list);
    setSettings(sett);
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

  const handleOpenModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      jenis: 'Pengeluaran',
      kategori: 'Operasional',
      jumlah: '',
      keterangan: '',
      tanggal: today
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.jumlah || Number(formData.jumlah) <= 0) {
      alert('Masukkan nominal transaksi yang valid.');
      return;
    }

    dataService.addKasTransaction(formData);
    setModalOpen(false);
    showToast(`Transaksi ${formData.jenis} sebesar Rp ${Number(formData.jumlah).toLocaleString('id-ID')} berhasil dicatat.`);
  };

  const filteredKas = kasList.filter((item) => {
    const kat = (item.kategori || '').toLowerCase();
    const ket = (item.keterangan || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchSearch = kat.includes(query) || ket.includes(query);
    const matchJenis = filterJenis === 'all' || item.jenis.toLowerCase() === filterJenis.toLowerCase();
    return matchSearch && matchJenis;
  });

  // Export Professional Excel Document
  const handleExportExcel = () => {
    excelExport.exportBukuKas(filteredKas, summary, settings);
  };

  const formatRupiah = (num) => {
    return `Rp ${(Number(num) || 0).toLocaleString('id-ID')}`;
  };

  return (
    <AppLayout
      title="Buku Kas Harian & Arus Kas"
      subtitle="Pencatatan real-time penerimaan dan pengeluaran dana kas koperasi."
      rightAction={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-700">description</span>
            Ekspor Excel
          </button>
          <button
            type="button"
            onClick={handleOpenModal}
            className="bg-[#002045] hover:bg-[#1a365d] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Catat Mutasi Kas
          </button>
        </div>
      }
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Kas Masuk */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kas Masuk (Penerimaan)</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">arrow_downward</span>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{formatRupiah(summary.masuk)}</div>
          <p className="text-xs text-slate-400 mt-1">Setoran simpanan, angsuran kredit & pendapatan</p>
        </div>

        {/* Total Kas Keluar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kas Keluar (Pengeluaran)</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">arrow_upward</span>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{formatRupiah(summary.keluar)}</div>
          <p className="text-xs text-slate-400 mt-1">Pencairan pinjaman, tarik simpanan & operasional</p>
        </div>

        {/* Saldo Kas Bersih */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Kas Likuid</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#002045] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
            </div>
          </div>
          <div className={`text-2xl font-extrabold ${summary.saldo >= 0 ? 'text-[#002045]' : 'text-rose-600'}`}>
            {formatRupiah(summary.saldo)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Kas riil yang tersedia di brankas / bank koperasi</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Filter & Search Bar */}
        <div className="p-4 md:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Cari kategori atau keterangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:border-blue-600 outline-none bg-white font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-bold text-slate-500">Filter:</span>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs focus:border-blue-600 outline-none bg-white font-medium"
            >
              <option value="all">Semua Mutasi</option>
              <option value="penerimaan">Penerimaan (Masuk)</option>
              <option value="pengeluaran">Pengeluaran (Keluar)</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="px-4 py-3">ID Kas</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Keterangan Transaksi</th>
                <th className="px-4 py-3 text-right">Debit (Masuk)</th>
                <th className="px-4 py-3 text-right">Kredit (Keluar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl text-slate-300 block mb-1">receipt_long</span>
                    Belum ada riwayat mutasi kas ditemukan.
                  </td>
                </tr>
              ) : (
                filteredKas.map((k) => {
                  const isPenerimaan = k.jenis === 'Penerimaan';
                  return (
                    <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {k.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                        {k.tanggal}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            isPenerimaan ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPenerimaan ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#002045]">
                        {k.kategori}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={k.keterangan}>
                        {k.keterangan}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                        {isPenerimaan ? formatRupiah(k.jumlah) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600 whitespace-nowrap">
                        {!isPenerimaan ? formatRupiah(k.jumlah) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CATAT MUTASI KAS MANUAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-[#002045] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">receipt_long</span>
                <h3 className="text-base font-bold">Catat Mutasi Kas Manual</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Mutasi *</label>
                  <select
                    value={formData.jenis}
                    onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none bg-white font-medium"
                  >
                    <option value="Pengeluaran">Pengeluaran (Kas Keluar)</option>
                    <option value="Penerimaan">Penerimaan (Kas Masuk)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori Transaksi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Operasional, ATK, Listrik, Konsumsi, dll"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nominal Transaksi (Rp) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400 text-xs">Rp</span>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="Contoh: 20000"
                    value={formData.jumlah}
                    onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none text-sm font-bold text-[#002045]"
                  />
                </div>
                {formData.jumlah && (
                  <p className="text-[11px] text-blue-800 font-bold mt-1">
                    Format: {formatRupiah(formData.jumlah)}
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan / Rincian</label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan keterangan detail transaksi..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002045] text-white rounded-lg font-bold hover:bg-[#1a365d] shadow-sm"
                >
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
