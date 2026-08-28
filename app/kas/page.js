'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { dataService } from '../../lib/dataService';

export default function KasPage() {
  const [summary, setSummary] = useState({
    masuk: 0,
    keluar: 0,
    saldo: 0
  });

  const [kasList, setKasList] = useState([]);
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
    setSummary(s);
    setKasList(list);
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
      alert('Nominal harus lebih dari 0.');
      return;
    }

    dataService.addKasTransaction(formData);
    setModalOpen(false);
    showToast(`Transaksi ${formData.jenis} sebesar Rp ${Number(formData.jumlah).toLocaleString('id-ID')} berhasil dicatat.`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Nominal'];
    const rows = filteredKas.map((k) => [
      k.id,
      k.tanggal,
      k.jenis,
      `"${k.kategori}"`,
      `"${(k.keterangan || '').replace(/"/g, '""')}"`,
      k.jumlah
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Buku_Kas_Koperasi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredKas = kasList.filter((item) => {
    const kat = (item.kategori || '').toLowerCase();
    const ket = (item.keterangan || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchSearch = kat.includes(query) || ket.includes(query);
    const matchJenis = filterJenis === 'all' || item.jenis.toLowerCase() === filterJenis.toLowerCase();
    return matchSearch && matchJenis;
  });

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
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Ekspor CSV
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
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Kas Masuk (Penerimaan)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">arrow_downward</span>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">{formatRupiah(summary.masuk)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Simpanan, angsuran kredit & pendapatan</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Kas Keluar (Pengeluaran)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">arrow_upward</span>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600">{formatRupiah(summary.keluar)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Pencairan pinjaman, penarikan & operasional</p>
        </div>

        <div className="bg-gradient-to-br from-[#002045] to-[#1a365d] text-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-200 uppercase">Saldo Kas Bersih Saat Ini</span>
            <span className="material-symbols-outlined text-blue-300">account_balance</span>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white mt-1">{formatRupiah(summary.saldo)}</p>
            <p className="text-[11px] text-blue-200/80 mt-0.5">Likuiditas dana riil koperasi</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-slate-500 mr-1">Tipe Mutasi:</span>
            {['all', 'penerimaan', 'pengeluaran'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterJenis(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterJenis === t
                    ? 'bg-[#002045] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t === 'all' ? 'Semua Mutasi' : t === 'penerimaan' ? 'Kas Masuk (+)' : 'Kas Keluar (-)'}
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
              placeholder="Cari kategori atau keterangan..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:border-blue-600 outline-none bg-white"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Keterangan / Uraian</th>
                <th className="px-4 py-3 text-right">Nominal Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada transaksi kas yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredKas.map((k) => {
                  const isPenerimaan = k.jenis === 'Penerimaan';
                  return (
                    <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">{k.tanggal}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            isPenerimaan ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPenerimaan ? 'Kas Masuk' : 'Kas Keluar'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#002045] whitespace-nowrap">{k.kategori}</td>
                      <td className="px-4 py-3 text-slate-600">{k.keterangan}</td>
                      <td
                        className={`px-4 py-3 text-right font-bold whitespace-nowrap ${
                          isPenerimaan ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {isPenerimaan ? `+${formatRupiah(k.jumlah)}` : `-${formatRupiah(k.jumlah)}`}
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
                <span className="material-symbols-outlined">edit_note</span>
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
              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenis Mutasi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, jenis: 'Penerimaan', kategori: 'Pendapatan Lain' })}
                    className={`py-2 rounded-lg font-bold border transition-all ${
                      formData.jenis === 'Penerimaan'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    + Kas Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, jenis: 'Pengeluaran', kategori: 'Operasional' })}
                    className={`py-2 rounded-lg font-bold border transition-all ${
                      formData.jenis === 'Pengeluaran'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    - Kas Keluar
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori Transaksi</label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none bg-white font-medium"
                >
                  {formData.jenis === 'Penerimaan' ? (
                    <>
                      <option value="Pendapatan Administrasi">Pendapatan Administrasi</option>
                      <option value="Pendapatan Jasa / Bunga">Pendapatan Jasa / Bunga</option>
                      <option value="Hibah / Bantuan">Hibah / Bantuan Modal</option>
                      <option value="Penerimaan Lain">Penerimaan Lain-lain</option>
                    </>
                  ) : (
                    <>
                      <option value="Operasional">Biaya Operasional & Kantor</option>
                      <option value="Pembelian ATK & Inventaris">Pembelian ATK & Inventaris</option>
                      <option value="Listrik, Air & Internet">Listrik, Air & Internet</option>
                      <option value="Konsumsi & Rapat">Konsumsi & Rapat Pengurus</option>
                      <option value="Honor / Transport">Honor / Transport Pengelola</option>
                      <option value="Pengeluaran Lain">Pengeluaran Lain-lain</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Transaksi</label>
                <input
                  type="date"
                  required
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nominal Jumlah (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={formData.jumlah}
                  onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                  placeholder="Contoh: 150000"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-blue-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Uraian / Keterangan *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Keterangan detail transaksi..."
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
