'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { dataService } from '../../lib/dataService';
import { excelExport } from '../../lib/excelExport';
import { pdfExport } from '../../lib/pdfExport';

export default function TagihanPage() {
  const [tagihanData, setTagihanData] = useState({ list: [], totals: {} });
  const [settings, setSettings] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal Edit Tagihan Item
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editForm, setEditForm] = useState({
    wajib: '',
    sukarela: '',
    qurban: '',
    cicilanKe: '',
    pokok: '',
    jasa: '',
    sembako: ''
  });

  const getPeriodeLabel = () => {
    const d = new Date();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  const loadData = () => {
    const data = dataService.getTagihanBulanan();
    const s = dataService.getSettings();
    setTagihanData(data);
    setSettings(s);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('koperasi_db_updated', handleUpdate);
    return () => window.removeEventListener('koperasi_db_updated', handleUpdate);
  }, []);

  const formatRupiah = (num) => `Rp ${(Number(num) || 0).toLocaleString('id-ID')}`;

  const filteredList = (tagihanData.list || []).filter((row) => {
    const q = searchQuery.toLowerCase();
    return (
      (row.nama || '').toLowerCase().includes(q) ||
      (row.nomor_anggota || '').toLowerCase().includes(q)
    );
  });

  const handleOpenEdit = (row) => {
    setSelectedMember(row);
    setEditForm({
      wajib: row.wajib || '',
      sukarela: row.sukarela || '',
      qurban: row.qurban || '',
      cicilanKe: row.cicilanKe || '',
      pokok: row.pokok || '',
      jasa: row.jasa || '',
      sembako: row.sembako || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!selectedMember) return;

    dataService.saveTagihanItem('', selectedMember.nomor_anggota, {
      wajib: Number(editForm.wajib) || 0,
      sukarela: Number(editForm.sukarela) || 0,
      qurban: Number(editForm.qurban) || 0,
      cicilanKe: editForm.cicilanKe || '',
      pokok: Number(editForm.pokok) || 0,
      jasa: Number(editForm.jasa) || 0,
      sembako: Number(editForm.sembako) || 0
    });

    setEditModalOpen(false);
    loadData();
  };

  const handleExportPDF = () => {
    pdfExport.exportDaftarTagihanPDF(tagihanData, settings, getPeriodeLabel());
  };

  const handleExportExcel = () => {
    excelExport.exportDaftarTagihanExcel(tagihanData, settings, getPeriodeLabel());
  };

  const totals = tagihanData.totals || {};
  const today = new Date();
  const kota = settings.alamat ? settings.alamat.split(',').pop().trim() : 'Bandung';
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dateLine = `${kota}, ${lastDayOfMonth} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <AppLayout
      title="Daftar Tagihan & Setoran Bulanan"
      subtitle="Rekapitulasi bukti tagihan dan potongan simpanan, pinjaman, qurban, dan sembako per anggota bulan berjalan."
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
            Cetak / Ekspor PDF
          </button>
        </div>
      }
    >
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">request_quote</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Seluruh Tagihan</span>
            <span className="text-lg font-black text-rose-600">{formatRupiah(totals.total)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">savings</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Simpanan & Qurban</span>
            <span className="text-lg font-black text-[#0f172a]">{formatRupiah((totals.wajib || 0) + (totals.sukarela || 0) + (totals.qurban || 0))}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Potongan Pinjaman</span>
            <span className="text-lg font-black text-[#0f172a]">{formatRupiah((totals.pokok || 0) + (totals.jasa || 0))}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Tagihan Sembako</span>
            <span className="text-lg font-black text-[#0f172a]">{formatRupiah(totals.sembako)}</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 flex flex-col gap-6">
        {/* Document Header */}
        <div className="text-center pb-4 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-black text-[#0f172a] tracking-wide uppercase">
            DAFTAR TAGIHAN {(settings.namaKoperasi || 'KOPERASI GURU KARYAWAN SMK ASSALAAM BANDUNG').toUpperCase()}
          </h2>
          <h3 className="text-xs sm:text-sm font-extrabold text-[#2563eb] uppercase mt-0.5">
            BULAN {getPeriodeLabel().toUpperCase()}
          </h3>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau No. Anggota (KI-XX)..."
              className="w-full pl-10 pr-3.5 py-2 bg-[#f8fafc] border border-slate-200 rounded-full text-xs font-semibold focus:border-[#2563eb] outline-none"
            />
          </div>
          <span className="text-xs font-bold text-slate-400">
            Total {filteredList.length} Anggota
          </span>
        </div>

        {/* Table Matching Spreadsheet Layout */}
        <div className="overflow-x-auto border border-slate-900 rounded-2xl">
          <table className="w-full text-xs border-collapse">
            <thead>
              {/* Header Tingkat 1 */}
              <tr className="bg-[#0f172a] text-white font-black text-center text-[11px]">
                <th rowSpan={2} className="border border-slate-800 py-3 px-2 w-10">NO.</th>
                <th rowSpan={2} className="border border-slate-800 py-3 px-3 w-24">NO. ANGGOTA</th>
                <th rowSpan={2} className="border border-slate-800 py-3 px-4 text-left min-w-44">NAMA</th>
                <th colSpan={3} className="border border-slate-800 py-2 px-3 bg-[#1e293b]">SIMPANAN</th>
                <th colSpan={4} className="border border-slate-800 py-2 px-3 bg-[#1e293b]">POTONGAN</th>
                <th rowSpan={2} className="border border-slate-800 py-3 px-4 w-32">JUMLAH</th>
                <th rowSpan={2} className="border border-slate-800 py-3 px-2 w-12">AKSI</th>
              </tr>
              {/* Header Tingkat 2 */}
              <tr className="bg-[#0f172a] text-white font-bold text-center text-[10px]">
                <th className="border border-slate-800 py-2 px-2.5 w-24">WAJIB</th>
                <th className="border border-slate-800 py-2 px-2.5 w-24">SUKARELA</th>
                <th className="border border-slate-800 py-2 px-2.5 w-24">QURBAN</th>
                <th className="border border-slate-800 py-2 px-2 w-16">CICILAN KE</th>
                <th className="border border-slate-800 py-2 px-2.5 w-28">POKOK</th>
                <th className="border border-slate-800 py-2 px-2.5 w-24">JASA</th>
                <th className="border border-slate-800 py-2 px-2.5 w-24">SEMBAKO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-slate-400">
                    Tidak ada data tagihan anggota.
                  </td>
                </tr>
              ) : (
                filteredList.map((row) => (
                  <tr key={row.nomor_anggota} className="hover:bg-blue-50/40 transition-colors">
                    <td className="border border-slate-300 py-2.5 px-2 text-center font-medium">{row.no}</td>
                    <td className="border border-slate-300 py-2.5 px-2 text-center font-mono font-bold text-[#0f172a]">{row.nomor_anggota}</td>
                    <td className="border border-slate-300 py-2.5 px-3 font-bold text-[#0f172a]">{row.nama}</td>
                    <td className="border border-slate-300 py-2.5 px-3 text-right">{row.wajib > 0 ? formatRupiah(row.wajib) : ''}</td>
                    <td className="border border-slate-300 py-2.5 px-3 text-right">{row.sukarela > 0 ? formatRupiah(row.sukarela) : ''}</td>
                    <td className="border border-slate-300 py-2.5 px-3 text-right">{row.qurban > 0 ? formatRupiah(row.qurban) : ''}</td>
                    <td className="border border-slate-300 py-2.5 px-2 text-center font-bold text-slate-700">{row.cicilanKe || ''}</td>
                    <td className="border border-slate-300 py-2.5 px-3 text-right">{row.pokok > 0 ? formatRupiah(row.pokok) : ''}</td>
                    <td className="border border-slate-300 py-2.5 px-3 text-right">{row.jasa > 0 ? formatRupiah(row.jasa) : ''}</td>
                    <td className="border border-slate-300 py-2.5 px-3 text-right">{row.sembako > 0 ? formatRupiah(row.sembako) : ''}</td>
                    <td className="border border-slate-300 py-2.5 px-3 text-right font-black text-rose-600 bg-rose-50/40">
                      {formatRupiah(row.jumlah)}
                    </td>
                    <td className="border border-slate-300 py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(row)}
                        title="Edit Tagihan Anggota"
                        className="p-1 hover:bg-blue-100 text-[#2563eb] rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {/* Row Total JUMLAH */}
              <tr className="bg-slate-100 font-black text-slate-900 text-xs">
                <td colSpan={3} className="border border-slate-400 py-3 px-4 text-center font-black tracking-wider">
                  JUMLAH
                </td>
                <td className="border border-slate-400 py-3 px-3 text-right">{formatRupiah(totals.wajib)}</td>
                <td className="border border-slate-400 py-3 px-3 text-right">{formatRupiah(totals.sukarela)}</td>
                <td className="border border-slate-400 py-3 px-3 text-right">{formatRupiah(totals.qurban)}</td>
                <td className="border border-slate-400 py-3 px-2 text-center"></td>
                <td className="border border-slate-400 py-3 px-3 text-right">{formatRupiah(totals.pokok)}</td>
                <td className="border border-slate-400 py-3 px-3 text-right">{formatRupiah(totals.jasa)}</td>
                <td className="border border-slate-400 py-3 px-3 text-right">{formatRupiah(totals.sembako)}</td>
                <td className="border border-slate-400 py-3 px-3 text-right font-black text-rose-600 bg-rose-100/60 text-sm">
                  {formatRupiah(totals.total)}
                </td>
                <td className="border border-slate-400 py-3 px-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan Sesuai Referensi Gambar */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          <div className="pl-4">
            <span className="font-semibold text-slate-700 block mb-1">Ketua Koperasi</span>
            <div className="h-16"></div>
            <span className="font-extrabold text-[#0f172a] text-sm block">
              {settings.ketua || 'Asep Solehudin'}
            </span>
          </div>

          <div className="pl-4 sm:pl-16">
            <span className="text-slate-500 font-semibold block mb-0.5">{dateLine}</span>
            <span className="font-semibold text-slate-700 block mb-1">Bendahara Koperasi</span>
            <div className="h-16"></div>
            <span className="font-extrabold text-[#0f172a] text-sm block">
              {settings.bendahara || 'Ica Cahyani'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: EDIT TAGIHAN ANGGOTA */}
      {/* ========================================================================= */}
      {editModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-[#f8fafc] border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 block">{selectedMember.nomor_anggota}</span>
                <h3 className="font-extrabold text-sm text-[#0f172a]">Penyesuaian Tagihan: {selectedMember.nama}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              {/* Simpanan */}
              <div>
                <h4 className="font-extrabold text-slate-800 mb-2 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#2563eb] text-sm">savings</span>
                  Komponen Simpanan
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Simpanan Wajib</label>
                    <input
                      type="number"
                      value={editForm.wajib}
                      onChange={(e) => setEditForm({ ...editForm, wajib: e.target.value })}
                      className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sukarela</label>
                    <input
                      type="number"
                      value={editForm.sukarela}
                      onChange={(e) => setEditForm({ ...editForm, sukarela: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tabungan Qurban</label>
                    <input
                      type="number"
                      value={editForm.qurban}
                      onChange={(e) => setEditForm({ ...editForm, qurban: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Potongan Pinjaman & Sembako */}
              <div>
                <h4 className="font-extrabold text-slate-800 mb-2 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-sm">payments</span>
                  Komponen Potongan Pinjaman & Sembako
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cicilan Ke</label>
                    <input
                      type="text"
                      value={editForm.cicilanKe}
                      onChange={(e) => setEditForm({ ...editForm, cicilanKe: e.target.value })}
                      placeholder="Contoh: 2"
                      className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold text-center text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Pokok Pinjaman</label>
                    <input
                      type="number"
                      value={editForm.pokok}
                      onChange={(e) => setEditForm({ ...editForm, pokok: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Jasa Pinjaman</label>
                    <input
                      type="number"
                      value={editForm.jasa}
                      onChange={(e) => setEditForm({ ...editForm, jasa: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sembako</label>
                    <input
                      type="number"
                      value={editForm.sembako}
                      onChange={(e) => setEditForm({ ...editForm, sembako: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Total Preview */}
              <div className="bg-[#f8fafc] p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Total Tagihan Anggota:</span>
                <span className="text-base font-black text-rose-600">
                  {formatRupiah(
                    (Number(editForm.wajib) || 0) +
                    (Number(editForm.sukarela) || 0) +
                    (Number(editForm.qurban) || 0) +
                    (Number(editForm.pokok) || 0) +
                    (Number(editForm.jasa) || 0) +
                    (Number(editForm.sembako) || 0)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-2xl font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-2xl font-extrabold transition-all shadow-md shadow-[#2563eb]/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
