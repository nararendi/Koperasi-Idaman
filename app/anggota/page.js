'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '../../components/AppLayout';
import { dataService } from '../../lib/dataService';

export default function DaftarAnggotaPage() {
  const [anggotaList, setAnggotaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [selectedAnggota, setSelectedAnggota] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  const loadAnggota = () => {
    const list = dataService.getAnggotaList();
    setAnggotaList(list);
  };

  useEffect(() => {
    loadAnggota();

    const handleUpdate = () => {
      loadAnggota();
    };

    window.addEventListener('koperasi_db_updated', handleUpdate);
    return () => window.removeEventListener('koperasi_db_updated', handleUpdate);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Open Detail Modal with personal savings & loan history
  const handleOpenDetail = (item) => {
    const simpanan = dataService.getSimpananByAnggota(item.nomor_anggota || item.id);
    const pinjaman = dataService.getPinjamanByAnggota(item.nomor_anggota || item.id);
    
    let totalSimpanan = 0;
    simpanan.forEach((s) => {
      const isWithdrawal = s.tipe === 'Penarikan' || (s.keterangan || '').toLowerCase().includes('tarik');
      totalSimpanan += isWithdrawal ? -Number(s.jumlah || 0) : Number(s.jumlah || 0);
    });

    setSelectedAnggota({
      ...item,
      simpananList: simpanan,
      pinjamanList: pinjaman,
      totalSimpanan
    });
    setDetailModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditFormData({
      id: item.id || item.nomor_anggota,
      nomor_anggota: item.nomor_anggota || item.id,
      nama: item.nama || item.nama_lengkap || '',
      alamat: item.alamat || item.alamat_lengkap || '',
      nomor_hp: item.nomor_hp || '',
      pekerjaan: item.pekerjaan || '',
      tempat_lahir: item.tempat_lahir || '',
      tanggal_lahir: item.tanggal_lahir || '',
      status: item.status || item.status_keanggotaan || 'Aktif'
    });
    setEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    dataService.updateAnggota(editFormData.id, editFormData);
    setEditModalOpen(false);
    showToast(`Data anggota ${editFormData.nama} berhasil diperbarui!`);
  };

  // Delete Anggota
  const handleDelete = (item) => {
    const id = item.nomor_anggota || item.id;
    if (confirm(`Apakah Anda yakin ingin menghapus data anggota "${item.nama || item.nama_lengkap}" (${id})?`)) {
      dataService.deleteAnggota(id);
      showToast(`Data anggota ${id} berhasil dihapus.`);
    }
  };

  const filteredAnggota = anggotaList.filter((item) => {
    const nama = (item.nama || item.nama_lengkap || '').toLowerCase();
    const id = (item.nomor_anggota || item.id || '').toLowerCase();
    const alamat = (item.alamat || item.alamat_lengkap || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = nama.includes(query) || id.includes(query) || alamat.includes(query);
    const itemStatus = (item.status || item.status_keanggotaan || 'aktif').toLowerCase();
    const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'aktif') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase">
          Aktif
        </span>
      );
    }
    if (s === 'keluar') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase">
          Keluar
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold uppercase">
        Berhenti
      </span>
    );
  };

  return (
    <AppLayout
      title="Manajemen Anggota Koperasi"
      subtitle="Kelola data pendaftaran, keanggotaan aktif, dan profil anggota koperasi."
      rightAction={
        <Link
          href="/anggota/tambah"
          className="bg-[#002045] hover:bg-[#1a365d] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Tambah Anggota Baru
        </Link>
      }
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Total Anggota Terdaftar</div>
            <div className="text-2xl font-extrabold text-[#002045] mt-1">{anggotaList.length} Orang</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">group</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Anggota Status Aktif</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              {anggotaList.filter((a) => (a.status || a.status_keanggotaan || '').toLowerCase() === 'aktif').length} Orang
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">verified_user</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Tidak Aktif / Keluar</div>
            <div className="text-2xl font-extrabold text-slate-600 mt-1">
              {anggotaList.filter((a) => (a.status || a.status_keanggotaan || '').toLowerCase() !== 'aktif').length} Orang
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">person_off</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-slate-500 mr-1">Status:</span>
            {['all', 'aktif', 'keluar', 'berhenti'].map((st) => (
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
                {st === 'all' ? 'Semua Status' : st.charAt(0).toUpperCase() + st.slice(1)}
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
              placeholder="Cari nama, no. anggota, alamat..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white"
            />
          </div>
        </div>

        {/* Anggota List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="px-4 py-3">No. Anggota</th>
                <th className="px-4 py-3">Nama Anggota</th>
                <th className="px-4 py-3">No. Telepon / WA</th>
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3">Tgl Daftar</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAnggota.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Tidak ditemukan data anggota yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredAnggota.map((item) => (
                  <tr key={item.id || item.nomor_anggota} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {item.nomor_anggota || item.id}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#002045] whitespace-nowrap">
                      {item.nama || item.nama_lengkap}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {item.nomor_hp || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={item.alamat || item.alamat_lengkap}>
                      {item.alamat || item.alamat_lengkap || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {item.tanggal_daftar || '-'}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {getStatusBadge(item.status || item.status_keanggotaan)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(item)}
                          title="Lihat Detail & Tabungan"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Data Anggota"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          title="Hapus Anggota"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
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

      {/* DETAIL MODAL */}
      {detailModalOpen && selectedAnggota && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-5 bg-[#002045] text-white flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-base">
                  {(selectedAnggota.nama || selectedAnggota.nama_lengkap || 'A').charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold">{selectedAnggota.nama || selectedAnggota.nama_lengkap}</h3>
                  <p className="text-xs text-blue-200/80 font-mono">No. {selectedAnggota.nomor_anggota || selectedAnggota.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6 text-xs">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-semibold block">Nomor HP / WA:</span>
                  <span className="font-bold text-slate-800">{selectedAnggota.nomor_hp || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Pekerjaan:</span>
                  <span className="font-bold text-slate-800">{selectedAnggota.pekerjaan || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Tempat, Tgl Lahir:</span>
                  <span className="font-bold text-slate-800">
                    {selectedAnggota.tempat_lahir || '-'}, {selectedAnggota.tanggal_lahir || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Tanggal Bergabung:</span>
                  <span className="font-bold text-slate-800">{selectedAnggota.tanggal_daftar || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Status Keanggotaan:</span>
                  <span className="font-bold">{getStatusBadge(selectedAnggota.status || selectedAnggota.status_keanggotaan)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Total Saldo Simpanan:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    Rp {Number(selectedAnggota.totalSimpanan || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-400 font-semibold block">Alamat Lengkap:</span>
                  <span className="font-medium text-slate-800">{selectedAnggota.alamat || selectedAnggota.alamat_lengkap || '-'}</span>
                </div>
              </div>

              {/* Savings History for this member */}
              <div>
                <h4 className="text-sm font-bold text-[#002045] mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-emerald-600">savings</span>
                  Riwayat Simpanan Anggota ({selectedAnggota.simpananList?.length || 0})
                </h4>
                {selectedAnggota.simpananList?.length === 0 ? (
                  <p className="text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">Belum ada transaksi simpanan tercatat.</p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Tgl</th>
                          <th className="px-3 py-2">Jenis</th>
                          <th className="px-3 py-2 text-right">Nominal</th>
                          <th className="px-3 py-2">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedAnggota.simpananList.map((s) => (
                          <tr key={s.id}>
                            <td className="px-3 py-2 text-slate-600">{s.tanggal}</td>
                            <td className="px-3 py-2 font-semibold text-emerald-700">{s.jenis}</td>
                            <td className="px-3 py-2 text-right font-bold">Rp {Number(s.jumlah || 0).toLocaleString('id-ID')}</td>
                            <td className="px-3 py-2 text-slate-500">{s.keterangan}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Loan History for this member */}
              <div>
                <h4 className="text-sm font-bold text-[#002045] mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-amber-600">payments</span>
                  Riwayat Pinjaman Anggota ({selectedAnggota.pinjamanList?.length || 0})
                </h4>
                {selectedAnggota.pinjamanList?.length === 0 ? (
                  <p className="text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">Tidak ada pengajuan pinjaman aktif/lunas.</p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">No. Pinjaman</th>
                          <th className="px-3 py-2">Plafon</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2 text-right">Sisa Hutang</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedAnggota.pinjamanList.map((p) => (
                          <tr key={p.id}>
                            <td className="px-3 py-2 font-mono font-semibold">{p.nomor_pinjaman || p.id}</td>
                            <td className="px-3 py-2 font-bold">Rp {Number(p.jumlah || 0).toLocaleString('id-ID')}</td>
                            <td className="px-3 py-2 font-semibold text-amber-700">{p.status}</td>
                            <td className="px-3 py-2 text-right font-bold text-rose-600">Rp {Number(p.sisa_hutang || 0).toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-[#002045] text-white rounded-lg text-xs font-bold hover:bg-[#1a365d]"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-5 bg-[#002045] text-white flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">edit_square</span>
                <h3 className="text-base font-bold">Edit Data Anggota</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Anggota (ID)</label>
                  <input
                    type="text"
                    disabled
                    value={editFormData.nomor_anggota || ''}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.nama || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor HP / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.nomor_hp || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nomor_hp: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={editFormData.pekerjaan || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, pekerjaan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={editFormData.tempat_lahir || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, tempat_lahir: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Keanggotaan</label>
                  <select
                    value={editFormData.status || 'Aktif'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none bg-white font-semibold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Keluar">Keluar</option>
                    <option value="Berhenti">Berhenti</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap</label>
                  <textarea
                    rows={3}
                    value={editFormData.alamat || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, alamat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002045] text-white rounded-lg font-bold hover:bg-[#1a365d]"
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
