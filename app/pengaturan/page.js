'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { dataService } from '../../lib/dataService';
import { authService } from '../../lib/authService';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../../lib/supabase';

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState('koperasi'); // 'koperasi' | 'supabase' | 'users' | 'profil_saya' | 'database'

  // Tab 1: Koperasi Settings
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

  // Tab 2: Admin Users Management
  const [usersList, setUsersList] = useState([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    id: '',
    username: '',
    nama: '',
    email: '',
    password: '',
    role: 'Kasir & Teller',
    status: 'Aktif'
  });
  const [isEditingUser, setIsEditingUser] = useState(false);

  // Tab 3: Profil Saya
  const [currentUser, setCurrentUser] = useState({});
  const [myProfileForm, setMyProfileForm] = useState({
    nama: '',
    email: '',
    username: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Tab 4: Supabase Connection
  const [supabaseConfig, setSupabaseConfig] = useState({ url: '', anonKey: '' });
  const [supabaseStatus, setSupabaseStatus] = useState({ checked: false, isConnected: false, message: '' });
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);

  const [toastMessage, setToastMessage] = useState('');

  const loadData = () => {
    const s = dataService.getSettings();
    const uList = authService.getAllUsers();
    const current = authService.getCurrentUser();
    const sbConfig = getSupabaseConfig();

    setFormData(s);
    setUsersList(uList);
    setCurrentUser(current);
    setSupabaseConfig(sbConfig);

    if (current) {
      setMyProfileForm({
        nama: current.nama || '',
        email: current.email || '',
        username: current.username || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  useEffect(() => {
    loadData();

    // Initial check of Supabase connection
    const checkConn = async () => {
      const res = await testSupabaseConnection();
      setSupabaseStatus({
        checked: true,
        isConnected: res.success,
        message: res.message
      });
    };
    checkConn();

    const handleUsersUpdate = () => loadData();
    const handleAuthUpdate = () => loadData();
    const handleDbUpdate = () => loadData();

    window.addEventListener('koperasi_users_updated', handleUsersUpdate);
    window.addEventListener('koperasi_auth_updated', handleAuthUpdate);
    window.addEventListener('koperasi_db_updated', handleDbUpdate);
    return () => {
      window.removeEventListener('koperasi_users_updated', handleUsersUpdate);
      window.removeEventListener('koperasi_auth_updated', handleAuthUpdate);
      window.removeEventListener('koperasi_db_updated', handleDbUpdate);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Handle Save Koperasi Settings
  const handleKoperasiSubmit = (e) => {
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

  // Save Supabase Config
  const handleSaveSupabaseConfig = async (e) => {
    e.preventDefault();
    setTestingSupabase(true);
    saveSupabaseConfig(supabaseConfig.url, supabaseConfig.anonKey);
    const res = await testSupabaseConnection(supabaseConfig.url, supabaseConfig.anonKey);
    setSupabaseStatus({
      checked: true,
      isConnected: res.success,
      message: res.message
    });
    setTestingSupabase(false);
    if (res.success) {
      showToast('Koneksi Supabase berhasil disimpan dan terhubung!');
    } else {
      alert(res.message);
    }
  };

  // Test Supabase Connection Button
  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    const res = await testSupabaseConnection(supabaseConfig.url, supabaseConfig.anonKey);
    setSupabaseStatus({
      checked: true,
      isConnected: res.success,
      message: res.message
    });
    setTestingSupabase(false);
    if (res.success) {
      showToast('Koneksi ke Supabase berhasil terhubung!');
    } else {
      alert(res.message);
    }
  };

  // Pull from Supabase
  const handlePullSupabase = async () => {
    setSyncingCloud(true);
    const res = await dataService.fetchFromSupabase();
    setSyncingCloud(false);
    if (res.success) {
      loadData();
      showToast(res.message);
    } else {
      alert(res.message);
    }
  };

  // Push to Supabase
  const handlePushSupabase = async () => {
    setSyncingCloud(true);
    const res = await dataService.pushAllToSupabase();
    setSyncingCloud(false);
    if (res.success) {
      showToast(res.message);
    } else {
      alert(res.message);
    }
  };

  // User Management Handlers
  const handleOpenAddUser = () => {
    setIsEditingUser(false);
    setUserFormData({
      id: '',
      username: '',
      nama: '',
      email: '',
      password: '',
      role: 'Kasir & Teller',
      status: 'Aktif'
    });
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user) => {
    setIsEditingUser(true);
    setUserFormData({
      id: user.id,
      username: user.username,
      nama: user.nama,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    try {
      if (isEditingUser) {
        const updateData = {
          nama: userFormData.nama,
          email: userFormData.email,
          role: userFormData.role,
          status: userFormData.status
        };
        if (userFormData.password) {
          updateData.password = userFormData.password;
        }
        authService.updateUser(userFormData.id, updateData);
        showToast(`Akun admin ${userFormData.nama} berhasil diperbarui!`);
      } else {
        if (!userFormData.password) {
          alert('Kata sandi wajib diisi untuk pengguna baru.');
          return;
        }
        authService.addUser(userFormData);
        showToast(`Pengguna admin baru "${userFormData.nama}" berhasil ditambahkan!`);
      }
      setUserModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = (user) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun admin "${user.nama}" (${user.username})?`)) {
      try {
        authService.deleteUser(user.id);
        showToast(`Akun ${user.nama} berhasil dihapus.`);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSaveMyProfile = (e) => {
    e.preventDefault();
    try {
      if (myProfileForm.newPassword) {
        if (myProfileForm.newPassword !== myProfileForm.confirmPassword) {
          alert('Konfirmasi kata sandi baru tidak cocok.');
          return;
        }
        if (currentUser.password !== myProfileForm.oldPassword) {
          alert('Kata sandi lama salah.');
          return;
        }
      }

      const updatedFields = {
        nama: myProfileForm.nama,
        email: myProfileForm.email,
        username: myProfileForm.username
      };

      if (myProfileForm.newPassword) {
        updatedFields.password = myProfileForm.newPassword;
      }

      authService.updateUser(currentUser.id, updatedFields);
      showToast('Profil akun Anda berhasil diperbarui!');
      setMyProfileForm((prev) => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

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

  // Clear all demo data
  const handleClearAllData = async () => {
    if (confirm('KONFIRMASI: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA (Anggota, Simpanan, Pinjaman, Buku Kas)?\n\nDatabase akan dikosongkan bersih sehingga siap diisi data operasional riil.')) {
      dataService.clearAllData();

      if (supabaseStatus.isConnected) {
        const wipeCloud = confirm('Apakah Anda juga ingin mengosongkan data di database Supabase Cloud?');
        if (wipeCloud) {
          await dataService.clearSupabaseData();
        }
      }

      showToast('Seluruh data demo berhasil dihapus bersih!');
      loadData();
    }
  };

  return (
    <AppLayout
      title="Pengaturan & Manajemen Sistem"
      subtitle="Kelola konfigurasi koperasi, koneksi Supabase Cloud, manajemen pengguna admin, profil akun, dan database."
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('koperasi')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'koperasi'
                ? 'bg-[#002045] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-lg">account_balance</span>
            Profil Koperasi
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'supabase'
                ? 'bg-[#002045] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-emerald-400">cloud_sync</span>
            Koneksi Supabase Cloud
            <span className={`w-2 h-2 rounded-full ${supabaseStatus.isConnected ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#002045] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-lg">manage_accounts</span>
            Kelola Pengguna Admin ({usersList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profil_saya')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profil_saya'
                ? 'bg-[#002045] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-lg">person</span>
            Profil Saya & Password
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'bg-[#002045] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-lg">database</span>
            Database & Pembersihan Data
          </button>
        </div>

        {/* TAB 1: KOPERASI & PARAMETER */}
        {activeTab === 'koperasi' && (
          <form onSubmit={handleKoperasiSubmit} className="flex flex-col gap-6">
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
                    value={formData.namaKoperasi || ''}
                    onChange={(e) => setFormData({ ...formData, namaKoperasi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor SK / Badan Hukum</label>
                  <input
                    type="text"
                    value={formData.badanHukum || ''}
                    onChange={(e) => setFormData({ ...formData, badanHukum: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Telepon Kantor</label>
                  <input
                    type="text"
                    value={formData.telepon || ''}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Resmi Koperasi</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Ketua Pengurus</label>
                  <input
                    type="text"
                    value={formData.ketua || ''}
                    onChange={(e) => setFormData({ ...formData, ketua: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Alamat Kantor Koperasi</label>
                  <textarea
                    rows={2}
                    value={formData.alamat || ''}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Parameter Simpan Pinjam */}
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
                    value={formData.simpananPokok || 0}
                    onChange={(e) => setFormData({ ...formData, simpananPokok: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-blue-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Biaya saat pendaftaran awal</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tarif Simpanan Wajib (Rp / Bln)</label>
                  <input
                    type="number"
                    value={formData.simpananWajib || 0}
                    onChange={(e) => setFormData({ ...formData, simpananWajib: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-blue-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Iuran rutin bulanan</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Suku Bunga Pinjaman (% / Bln)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.sukuBungaPinjaman || 1.5}
                    onChange={(e) => setFormData({ ...formData, sukuBungaPinjaman: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-blue-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Bunga pinjaman flat per bulan</span>
                </div>
              </div>
            </div>

            {/* Alokasi SHU */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-700">pie_chart</span>
                <h2 className="text-sm font-bold text-[#002045]">Alokasi Pembagian SHU (%)</h2>
              </div>

              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jasa Anggota (%)</label>
                  <input
                    type="number"
                    value={formData.shuPersenAnggota || 40}
                    onChange={(e) => setFormData({ ...formData, shuPersenAnggota: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-purple-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jasa Modal (%)</label>
                  <input
                    type="number"
                    value={formData.shuPersenModal || 30}
                    onChange={(e) => setFormData({ ...formData, shuPersenModal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-purple-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pengurus & Pengawas (%)</label>
                  <input
                    type="number"
                    value={formData.shuPersenPengurus || 20}
                    onChange={(e) => setFormData({ ...formData, shuPersenPengurus: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-bold text-purple-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dana Cadangan (%)</label>
                  <input
                    type="number"
                    value={formData.shuPersenCadangan || 10}
                    onChange={(e) => setFormData({ ...formData, shuPersenCadangan: e.target.value })}
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
                Simpan Konfigurasi Koperasi
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: KONEKSI SUPABASE CLOUD */}
        {activeTab === 'supabase' && (
          <div className="flex flex-col gap-6">
            {/* Status Connection Banner */}
            <div className={`p-5 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
              supabaseStatus.isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 ${
                  supabaseStatus.isConnected ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  <span className="material-symbols-outlined">
                    {supabaseStatus.isConnected ? 'cloud_done' : 'cloud_off'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    Status Koneksi: {supabaseStatus.isConnected ? 'Terhubung ke Supabase Cloud' : 'Belum Terhubung / Mode Offline'}
                  </h3>
                  <p className="text-xs mt-0.5 opacity-90">{supabaseStatus.message || 'Memeriksa status...'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={testingSupabase}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <span className={`material-symbols-outlined text-base ${testingSupabase ? 'animate-spin' : ''}`}>sync</span>
                {testingSupabase ? 'Menguji...' : 'Uji Koneksi Ulang'}
              </button>
            </div>

            {/* Supabase Credentials Form */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">key</span>
                <h2 className="text-sm font-bold text-[#002045]">Kredensial & API Project Supabase</h2>
              </div>

              <form onSubmit={handleSaveSupabaseConfig} className="p-6 flex flex-col gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Supabase Project URL (NEXT_PUBLIC_SUPABASE_URL) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                    value={supabaseConfig.url}
                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-mono text-slate-800"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Dapat dilihat di Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project URL
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Supabase Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseConfig.anonKey}
                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-mono text-slate-800 resize-none text-[11px]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Dapat dilihat di Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project API Keys &rarr; `anon` `public`
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={testingSupabase}
                    className="px-6 py-2.5 bg-[#002045] hover:bg-[#1a365d] text-white rounded-lg font-bold shadow-sm flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">save</span>
                    Simpan & Sambungkan Kredensial
                  </button>
                </div>
              </form>
            </div>

            {/* Cloud Sync Actions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-700">sync_alt</span>
                <h2 className="text-sm font-bold text-[#002045]">Sinkronisasi Data Cloud</h2>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-600">cloud_upload</span>
                      Unggah Data Lokal ke Supabase Cloud
                    </h4>
                    <p className="text-slate-500 mt-1 text-[11px]">
                      Kirim seluruh data anggota, simpanan, pinjaman, dan buku kas lokal yang ada saat ini ke database Supabase Cloud.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePushSupabase}
                    disabled={syncingCloud}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">upload</span>
                    {syncingCloud ? 'Sedang Sinkron...' : 'Unggah Data ke Supabase'}
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-blue-600">cloud_download</span>
                      Tarik Data dari Supabase Cloud
                    </h4>
                    <p className="text-slate-500 mt-1 text-[11px]">
                      Muat ulang seluruh data terbaru dari tabel Supabase ke dalam aplikasi koperasi.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePullSupabase}
                    disabled={syncingCloud}
                    className="w-full py-2 bg-[#002045] hover:bg-[#1a365d] text-white rounded-lg font-bold shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    {syncingCloud ? 'Sedang Memuat...' : 'Tarik Data dari Supabase'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KELOLA PENGGUNA ADMIN */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-[#002045]">Daftar Pengguna & Hak Akses Administrator</h3>
                <p className="text-xs text-slate-500 mt-0.5">Kelola akun staf, bendahara, kasir, dan hak akses sistem.</p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddUser}
                className="px-3.5 py-2 bg-[#002045] hover:bg-[#1a365d] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Tambah Pengguna Baru
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <th className="px-4 py-3">Pengguna</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role / Jabatan</th>
                    <th className="px-4 py-3">Login Terakhir</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => {
                    const isSelf = currentUser && currentUser.id === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                              {u.avatar || 'US'}
                            </div>
                            <div className="font-bold text-[#002045]">
                              {u.nama} {isSelf && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded ml-1 font-normal">(Anda)</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-700 whitespace-nowrap">
                          {u.username}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {u.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              u.role === 'Super Admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'Bendahara'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {u.lastLogin || '-'}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(u)}
                              title="Edit Pengguna"
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                title="Hapus Pengguna"
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PROFIL SAYA & PASSWORD */}
        {activeTab === 'profil_saya' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-700">badge</span>
              <div>
                <h3 className="text-sm font-bold text-[#002045]">Profil Akun Saya</h3>
                <p className="text-xs text-slate-500">Perbarui data profil pribadi dan kata sandi akun Anda.</p>
              </div>
            </div>

            <form onSubmit={handleSaveMyProfile} className="p-6 md:p-8 flex flex-col gap-6 text-xs">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
                  {currentUser.avatar || 'AD'}
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#002045]">{currentUser.nama}</h4>
                  <p className="text-xs text-slate-500 font-semibold">{currentUser.role} &bull; @{currentUser.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={myProfileForm.nama}
                    onChange={(e) => setMyProfileForm({ ...myProfileForm, nama: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alamat Email *</label>
                  <input
                    type="email"
                    required
                    value={myProfileForm.email}
                    onChange={(e) => setMyProfileForm({ ...myProfileForm, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    value={myProfileForm.username}
                    onChange={(e) => setMyProfileForm({ ...myProfileForm, username: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hak Akses / Role</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.role || 'Super Admin'}
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-semibold"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-700 block text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-amber-600">lock_reset</span>
                  Ganti Kata Sandi (Kosongkan jika tidak ingin mengubah sandi)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Kata Sandi Lama</label>
                    <input
                      type="password"
                      value={myProfileForm.oldPassword}
                      onChange={(e) => setMyProfileForm({ ...myProfileForm, oldPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Kata Sandi Baru</label>
                    <input
                      type="password"
                      value={myProfileForm.newPassword}
                      onChange={(e) => setMyProfileForm({ ...myProfileForm, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Ulangi Sandi Baru</label>
                    <input
                      type="password"
                      value={myProfileForm.confirmPassword}
                      onChange={(e) => setMyProfileForm({ ...myProfileForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#002045] hover:bg-[#1a365d] text-white rounded-lg font-bold shadow-sm"
                >
                  Simpan Perubahan Profil
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: DATABASE & PEMBERSIHAN DATA */}
        {activeTab === 'database' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-700">database</span>
              <h2 className="text-sm font-bold text-[#002045]">Manajemen Database & Pembersihan Data</h2>
            </div>

            <div className="p-6 flex flex-col gap-4 text-xs">
              <p className="text-slate-500">
                Unduh seluruh salinan data (Anggota, Simpanan, Pinjaman, Buku Kas) dalam format JSON untuk cadangan berkala, atau impor file backup untuk pemulihan, atau hapus seluruh data contoh / demo agar aplikasi siap dipakai dari nol.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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

                <div className="border border-rose-200 rounded-xl p-4 flex flex-col justify-between gap-3 bg-rose-50/30">
                  <div>
                    <h3 className="font-bold text-rose-800">Hapus Semua Data Demo</h3>
                    <p className="text-slate-500 text-[11px] mt-1">Kosongkan semua data anggota, simpanan, pinjaman & kas ke 0.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAllData}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base">delete_sweep</span>
                    Kosongkan Semua Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT PENGGUNA ADMIN */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-[#002045] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">person</span>
                <h3 className="text-base font-bold">{isEditingUser ? 'Edit Pengguna Admin' : 'Tambah Pengguna Admin Baru'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={userFormData.nama}
                  onChange={(e) => setUserFormData({ ...userFormData, nama: e.target.value })}
                  placeholder="Contoh: Siti Rahayu"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Email *</label>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="siti@koperasi-idaman.co.id"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    disabled={isEditingUser}
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    placeholder="kasir1"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none font-mono disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isEditingUser ? 'Kata Sandi Baru (Opsional)' : 'Kata Sandi *'}
                  </label>
                  <input
                    type="password"
                    required={!isEditingUser}
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role / Peran</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none bg-white font-medium"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Bendahara">Bendahara</option>
                    <option value="Kasir & Teller">Kasir & Teller</option>
                    <option value="Pengawas">Pengawas</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Akun</label>
                  <select
                    value={userFormData.status}
                    onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 outline-none bg-white font-medium"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002045] text-white rounded-lg font-bold hover:bg-[#1a365d] shadow-sm"
                >
                  {isEditingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
