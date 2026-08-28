'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { dataService } from '../../lib/dataService';

export default function PengaturanPage() {
  const [formData, setFormData] = useState({
    namaKoperasi: '',
    badanHukum: '',
    alamat: '',
    telepon: '',
    email: '',
    ketua: '',
    bendahara: '',
    simpananPokok: 500000,
    simpananWajib: 100000,
    sukuBungaPinjaman: 1.5,
    shuPersenAnggota: 40,
    shuPersenModal: 30,
    shuPersenPengurus: 20,
    shuPersenCadangan: 10
  });

  const [toastMessage, setToastMessage] = useState('');
  const [importStatus, setImportStatus] = useState('');

  useEffect(() => {
    const s = dataService.getSettings();
    setFormData(s);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dataService.updateSettings({
      ...formData,
      simpananPokok: Number(formData.simpananPokok),
      simpananWajib: Number(formData.simpananWajib),
      sukuBungaPinjaman: Number(formData.sukuBungaPinjaman),
      shuPersenAnggota: Number(formData.shuPersenAnggota),
      shuPersenModal: Number(formData.shuPersenModal),
      shuPersenPengurus: Number(formData.shuPersenPengurus),
      shuPersenCadangan: Number(formData.shuPersenCadangan)
    });
    showToast('Konfigurasi dan profil koperasi berhasil disimpan!');
  };

  // Export Backup Database JSON
  const handleExportBackup = () => {
    const json = dataService.exportDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_koperasi_idaman_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(a);
    showToast('Backup database JSON berhasil diunduh.');
  };

  // Import Backup Database JSON
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = dataService.importDatabaseJSON(content);
      if (res.success) {
        setFormData(dataService.getSettings());
        showToast('Database berhasil dipulihkan dari file backup!');
      } else {
        alert('Gagal memulihkan database: ' + res.message);
      }
    };
    reader.readAsText(file);
  };

  // Reset to default
  const handleResetDatabase = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh database ke data contoh default? Seluruh data yang Anda ubah akan diganti ke konfigurasi awal.')) {
      dataService.resetDatabase();
      setFormData(dataService.getSettings());
      showToast('Database berhasil direset ke data contoh default.');
    }
  };

  return (
    <AppLayout
      title="Pengaturan & Konfigurasi Koperasi"
      subtitle="Kelola profil institusi, parameter bunga, tarif simpanan, dan pemeliharaan database."
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Card 1: Profil Koperasi */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-700">account_balance</span>
              <h2 className="text-sm font-bold text-[#002045]">Profil Lembaga Koperasi</h2>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Nama Resmi Koperasi *</label>
                <input
                  type="text"
                  required
                  name="namaKoperasi"
                  value={formData.namaKoperasi || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor Badan Hukum / SK Kemenkumham</label>
                <input
                  type="text"
                  name="badanHukum"
                  value={formData.badanHukum || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor Telepon Kantor</label>
                <input
                  type="text"
                  name="telepon"
                  value={formData.telepon || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Resmi</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Ketua Pengurus</label>
                <input
                  type="text"
                  name="ketua"
                  value={formData.ketua || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Alamat Kantor Koperasi</label>
                <textarea
                  rows={2}
                  name="alamat"
                  value={formData.alamat || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Parameter Simpan Pinjam & Suku Bunga */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-700">tune</span>
              <h2 className="text-sm font-bold text-[#002045]">Parameter Simpan Pinjam & Suku Bunga</h2>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tarif Simpanan Pokok (Rp)</label>
                <input
                  type="number"
                  name="simpananPokok"
                  value={formData.simpananPokok || 0}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-blue-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Biaya saat pendaftaran</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tarif Simpanan Wajib (Rp / Bln)</label>
                <input
                  type="number"
                  name="simpananWajib"
                  value={formData.simpananWajib || 0}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-blue-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Iuran bulanan anggota</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Suku Bunga Pinjaman (% / Bln)</label>
                <input
                  type="number"
                  step="0.1"
                  name="sukuBungaPinjaman"
                  value={formData.sukuBungaPinjaman || 1.5}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-blue-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Bunga flat pinjaman</span>
              </div>
            </div>
          </div>

          {/* Card 3: Persentase Alokasi SHU */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-700">pie_chart</span>
              <h2 className="text-sm font-bold text-[#002045]">Konfigurasi Pembagian Alokasi SHU (%)</h2>
            </div>

            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Jasa Anggota (%)</label>
                <input
                  type="number"
                  name="shuPersenAnggota"
                  value={formData.shuPersenAnggota || 40}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jasa Modal (%)</label>
                <input
                  type="number"
                  name="shuPersenModal"
                  value={formData.shuPersenModal || 30}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dana Pengurus (%)</label>
                <input
                  type="number"
                  name="shuPersenPengurus"
                  value={formData.shuPersenPengurus || 20}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dana Cadangan (%)</label>
                <input
                  type="number"
                  name="shuPersenCadangan"
                  value={formData.shuPersenCadangan || 10}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-purple-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#002045] hover:bg-[#1a365d] text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">save</span>
              Simpan Pengaturan
            </button>
          </div>
        </form>

        {/* Card 4: Backup & Restore Database */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-700">database</span>
            <h2 className="text-sm font-bold text-[#002045]">Manajemen Database & Pemulihan</h2>
          </div>

          <div className="p-6 flex flex-col gap-4 text-xs">
            <p className="text-slate-500">
              Anda dapat mengunduh seluruh salinan data (Anggota, Simpanan, Pinjaman, Buku Kas) dalam format JSON untuk keamanan data, atau mengimpor file backup untuk memulihkan sistem.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Backup */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3 bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-800">Backup Data (JSON)</h3>
                  <p className="text-slate-500 text-[11px] mt-1">Unduh seluruh rekaman database koperasi ke komputer Anda.</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-2 bg-[#002045] hover:bg-[#1a365d] text-white rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">cloud_download</span>
                  Unduh Backup JSON
                </button>
              </div>

              {/* Restore */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3 bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-800">Restore Data (JSON)</h3>
                  <p className="text-slate-500 text-[11px] mt-1">Unggah file backup .json untuk memulihkan rekaman.</p>
                </div>
                <label className="w-full py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                  <span className="material-symbols-outlined text-base">upload_file</span>
                  Pilih File Backup
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Reset */}
              <div className="border border-rose-200 rounded-xl p-4 flex flex-col justify-between gap-3 bg-rose-50/30">
                <div>
                  <h3 className="font-bold text-rose-800">Reset Data Default</h3>
                  <p className="text-slate-500 text-[11px] mt-1">Kembalikan seluruh data ke contoh awal sistem.</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetDatabase}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">restart_alt</span>
                  Reset ke Awal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
