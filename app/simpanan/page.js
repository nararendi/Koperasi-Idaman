'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '../../components/AppLayout';
import { dataService } from '../../lib/dataService';
import { excelExport } from '../../lib/excelExport';
import { pdfExport } from '../../lib/pdfExport';

export default function SimpananPage() {
  const [summary, setSummary] = useState({
    pokok: 0,
    wajib: 0,
    sukarela: 0,
    total: 0
  });

  const [simpananList, setSimpananList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);
  const [settings, setSettings] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [jenisFilter, setJenisFilter] = useState('all');

  // Modal: Catat Transaksi Baru
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nomor_anggota: '',
    jenis: 'Sukarela',
    tipe: 'Setoran',
    jumlah: '',
    metode: 'Tunai',
    keterangan: ''
  });

  // Modal: Bukti Kuitansi
  const [kuitansiModalOpen, setKuitansiModalOpen] = useState(false);
  const [selectedKuitansi, setSelectedKuitansi] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = () => {
    const s = dataService.getSimpananSummary();
    const list = dataService.getSimpananList();
    const anggota = dataService.getAnggotaList();
    const sett = dataService.getSettings();

    setSummary(s);
    setSimpananList(list);
    setAnggotaList(anggota);
    setSettings(sett);

    if (anggota.length > 0 && !formData.nomor_anggota) {
      setFormData((prev) => ({
        ...prev,
        nomor_anggota: anggota[0].nomor_anggota || anggota[0].id
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

  const handleOpenModal = () => {
    const settings = dataService.getSettings();
    setFormData({
      nomor_anggota: anggotaList.length > 0 ? (anggotaList[0].nomor_anggota || anggotaList[0].id) : '',
      jenis: 'Sukarela',
      tipe: 'Setoran',
      jumlah: '',
      metode: 'Tunai',
      keterangan: ''
    });
    setModalOpen(true);
  };

  const handleSubmitTransaction = (e) => {
    e.preventDefault();
    if (!formData.nomor_anggota) {
      alert('Pilih anggota terlebih dahulu.');
      return;
    }
    if (!formData.jumlah || Number(formData.jumlah) <= 0) {
      alert('Nominal harus lebih dari 0.');
      return;
    }

    const newTx = dataService.addSimpananTransaction({
      nomor_anggota: formData.nomor_anggota,
      jenis: formData.jenis,
      tipe: formData.tipe,
      jumlah: formData.jumlah,
      metode: formData.metode,
      keterangan: formData.keterangan || `${formData.tipe} Simpanan ${formData.jenis}`
    });

    setModalOpen(false);
    showToast(`Transaksi Simpanan ${formData.jenis} sebesar Rp ${Number(formData.jumlah).toLocaleString('id-ID')} berhasil dicatat!`);
  };

  const handlePrintKuitansi = (item) => {
    setSelectedKuitansi(item);
    setKuitansiModalOpen(true);
  };

  const filteredList = simpananList.filter((item) => {
    const nama = (item.nama_anggota || item.nama || '').toLowerCase();
    const noAnggota = (item.nomor_anggota || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchSearch = nama.includes(query) || noAnggota.includes(query);

    const matchJenis =
      jenisFilter === 'all' ||
      (item.jenis || '').toLowerCase() === jenisFilter.toLowerCase();

    return matchSearch && matchJenis;
  });

  const formatRupiah = (num) => {
    return `Rp ${(Number(num) || 0).toLocaleString('id-ID')}`;
  };

  return (
    <AppLayout
      title="Manajemen Simpanan Anggota"
      subtitle="Pencatatan saldo simpanan pokok, wajib, dan sukarela beserta mutasi rekening anggota."
      rightAction={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => excelExport.exportSimpanan(filteredSimpanan, summary, settings)}
            className="px-3.5 py-2.5 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-700">description</span>
            Ekspor Excel
          </button>
          <button
            type="button"
            onClick={handleOpenModal}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Catat Setoran / Penarikan
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
            <span className="text-xs font-bold text-slate-500 uppercase">Simpanan Pokok</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">lock</span>
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#002045]">{formatRupiah(summary.pokok)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Setoran wajib pendaftaran</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Simpanan Wajib</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">calendar_month</span>
            </div>
          </div>
          <p className="text-xl font-extrabold text-indigo-700">{formatRupiah(summary.wajib)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Iuran rutin bulanan anggota</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Simpanan Sukarela</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">savings</span>
            </div>
          </div>
          <p className="text-xl font-extrabold text-emerald-700">{formatRupiah(summary.sukarela)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Dapat disetor & ditarik sewaktu-waktu</p>
        </div>

        <div className="bg-gradient-to-br from-[#002045] to-[#1a365d] text-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-200 uppercase">Total Seluruh Simpanan</span>
            <span className="material-symbols-outlined text-blue-300">account_balance</span>
          </div>
          <div>
            <p className="text-xl font-extrabold text-white mt-2">{formatRupiah(summary.total)}</p>
            <p className="text-[11px] text-blue-200/80 mt-0.5">Kekayaan dana anggota</p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-slate-500 mr-1">Jenis:</span>
            {['all', 'pokok', 'wajib', 'sukarela'].map((j) => (
              <button
                key={j}
                type="button"
                onClick={() => setJenisFilter(j)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  jenisFilter === j
                    ? 'bg-[#002045] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {j === 'all' ? 'Semua Jenis' : j.charAt(0).toUpperCase() + j.slice(1)}
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
              placeholder="Cari nama atau No. Anggota..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:border-blue-600 outline-none bg-white"
            />
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">No. Anggota</th>
                <th className="px-4 py-3">Nama Anggota</th>
                <th className="px-4 py-3">Jenis Simpanan</th>
                <th className="px-4 py-3">Metode</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
                <th className="px-4 py-3 text-center">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    Belum ada data transaksi simpanan yang cocok.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isWithdrawal = item.tipe === 'Penarikan' || (item.keterangan || '').toLowerCase().includes('tarik');
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                        {item.tanggal}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                        {item.nomor_anggota}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#002045] whitespace-nowrap">
                        {item.nama_anggota || item.nama}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            (item.jenis || '').toLowerCase().includes('pokok')
                              ? 'bg-blue-100 text-blue-800'
                              : (item.jenis || '').toLowerCase().includes('wajib')
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.jenis}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {item.metode || 'Tunai'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={item.keterangan}>
                        {item.keterangan || '-'}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold whitespace-nowrap ${
                          isWithdrawal ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {isWithdrawal ? `-${formatRupiah(item.jumlah)}` : `+${formatRupiah(item.jumlah)}`}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handlePrintKuitansi(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Cetak Bukti Kuitansi"
                        >
                          <span className="material-symbols-outlined text-[18px]">receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CATAT TRANSAKSI SIMPANAN */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-emerald-800 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">payments</span>
                <h3 className="text-base font-bold">Catat Transaksi Simpanan</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitTransaction} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex flex-col gap-4 text-xs flex-1">
                {/* Tipe Transaksi */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipe Transaksi</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipe: 'Setoran' })}
                      className={`py-2 rounded-lg font-bold border transition-all ${
                        formData.tipe === 'Setoran'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      + Setoran Masuk
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, tipe: 'Penarikan', jenis: 'Sukarela' })}
                      className={`py-2 rounded-lg font-bold border transition-all ${
                        formData.tipe === 'Penarikan'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      - Penarikan Saldo
                    </button>
                  </div>
                </div>

                {/* Pilih Anggota */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pilih Anggota Koperasi *</label>
                  <select
                    required
                    value={formData.nomor_anggota}
                    onChange={(e) => setFormData({ ...formData, nomor_anggota: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-emerald-600 outline-none bg-white font-medium"
                  >
                    <option value="">-- Pilih Anggota --</option>
                    {anggotaList.map((a) => (
                      <option key={a.id || a.nomor_anggota} value={a.nomor_anggota || a.id}>
                        {a.nomor_anggota || a.id} - {a.nama || a.nama_lengkap}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Jenis Simpanan */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Simpanan</label>
                  <select
                    value={formData.jenis}
                    disabled={formData.tipe === 'Penarikan'}
                    onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-emerald-600 outline-none bg-white font-medium disabled:bg-slate-100"
                  >
                    <option value="Sukarela">Simpanan Sukarela (Bebas Setor/Tarik)</option>
                    <option value="Wajib">Simpanan Wajib (Bulanan)</option>
                    <option value="Pokok">Simpanan Pokok</option>
                  </select>
                </div>

                {/* Nominal */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nominal Jumlah (Rp) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">Rp</span>
                    <input
                      type="number"
                      required
                      min="1000"
                      step="1000"
                      value={formData.jumlah}
                      onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                      placeholder="Contoh: 20000"
                      className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-lg focus:border-emerald-600 outline-none text-sm font-bold text-emerald-800"
                    />
                  </div>
                  {formData.jumlah && Number(formData.jumlah) > 0 && (
                    <p className="mt-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 flex items-center justify-between">
                      <span>Format: {formatRupiah(formData.jumlah)}</span>
                    </p>
                  )}
                </div>

                {/* Metode Pembayaran */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Metode Penerimaan / Pembayaran</label>
                  <select
                    value={formData.metode}
                    onChange={(e) => setFormData({ ...formData, metode: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-emerald-600 outline-none bg-white font-medium"
                  >
                    <option value="Tunai">Tunai / Kasir</option>
                    <option value="Transfer Bank">Transfer Bank / QRIS</option>
                    <option value="Potong Gaji">Potong Gaji Otomatis</option>
                  </select>
                </div>

                {/* Keterangan */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Keterangan / Catatan</label>
                  <input
                    type="text"
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    placeholder="Contoh: Setoran sukarela tabungan qurban"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800 shadow-sm cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KUITANSI PRINT PREVIEW */}
      {kuitansiModalOpen && selectedKuitansi && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-[#002045] text-white flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider">Kuitansi Resmi Transaksi</span>
              <button
                type="button"
                onClick={() => setKuitansiModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div id="printArea" className="p-6 flex flex-col gap-4 text-xs">
              <div className="text-center border-b border-slate-200 pb-3">
                <h3 className="font-extrabold text-sm text-[#002045]">KOPERASI SIMPAN PINJAM IDAMAN</h3>
                <p className="text-[11px] text-slate-500">Bukti Penerimaan / Penarikan Simpanan</p>
                <p className="font-mono text-[10px] text-slate-400 mt-1">No. Bukti: {selectedKuitansi.id}</p>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal:</span>
                  <span className="font-semibold text-slate-800">{selectedKuitansi.tanggal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Anggota:</span>
                  <span className="font-mono font-bold text-blue-900">{selectedKuitansi.nomor_anggota}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Anggota:</span>
                  <span className="font-bold text-slate-800">{selectedKuitansi.nama_anggota || selectedKuitansi.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jenis Transaksi:</span>
                  <span className="font-semibold text-emerald-700">Simpanan {selectedKuitansi.jenis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode:</span>
                  <span className="text-slate-800">{selectedKuitansi.metode || 'Tunai'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Keterangan:</span>
                  <span className="text-slate-800">{selectedKuitansi.keterangan}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-dashed border-slate-300 text-sm font-bold">
                  <span>Nominal Transaksi:</span>
                  <span className="text-emerald-800 font-extrabold">{formatRupiah(selectedKuitansi.jumlah)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 text-center text-[10px] text-slate-500">
                <div>
                  <p>Penyetor / Anggota,</p>
                  <div className="h-10"></div>
                  <p className="font-bold text-slate-700">({selectedKuitansi.nama_anggota || selectedKuitansi.nama})</p>
                </div>
                <div>
                  <p>Petugas Kasir,</p>
                  <div className="h-10"></div>
                  <p className="font-bold text-slate-700">({selectedKuitansi.pencatat || 'Kasir Koperasi'})</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setKuitansiModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => pdfExport.exportKuitansiSimpananPDF(selectedKuitansi, settings)}
                className="px-4 py-2 bg-[#002045] text-white rounded-lg font-bold hover:bg-[#1a365d] flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                Ekspor PDF Kuitansi
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
