'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/authService';
import AppLogo from '../../components/AppLogo';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sinkronkan daftar pengguna dari Supabase Cloud begitu halaman login dimuat
  useEffect(() => {
    authService.fetchUsersFromSupabase().catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const user = await authService.login(username, password);
      setSuccessMessage(`Selamat datang kembali, ${user?.nama || 'Pengguna'}!`);
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'Login gagal. Periksa kembali username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (uname, pwd) => {
    setUsername(uname);
    setPassword(pwd);
  };

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-[#eaf2fc] flex items-center justify-center p-3 sm:p-4 font-sans text-[#0f172a] relative select-none">
      {/* Decorative ambient background shapes */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#2563eb]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#3b82f6]/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Login Card - Compact & Fitted without overflow */}
      <div className="max-w-[410px] w-full bg-white rounded-[28px] shadow-2xl overflow-hidden border-[3px] border-[#2563eb] relative z-10 flex flex-col my-auto">
        {/* Header with Antigravity Blue Gradient */}
        <div className="bg-gradient-to-br from-[#1e40af] via-[#1d4ed8] to-[#2563eb] px-6 py-5 text-white text-center relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-8 -mt-8 blur-lg pointer-events-none"></div>
          
          <div className="mb-2">
            <AppLogo size="large" />
          </div>

          <h1 className="text-lg font-black tracking-tight text-white">
            Koperasi<span className="text-[#ffd159]">.id</span>
          </h1>
          <p className="text-[11px] text-blue-100 font-medium mt-0.5">Portal Akses Masuk Pengurus & Administrator</p>
        </div>

        {/* Form Container */}
        <div className="p-5 sm:p-6 flex flex-col gap-3.5">
          {errorMessage && (
            <div className="bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] px-3.5 py-2 rounded-2xl text-[11px] flex items-center gap-1.5 font-bold animate-in fade-in">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] px-3.5 py-2 rounded-2xl text-[11px] flex items-center gap-1.5 font-bold animate-in fade-in">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1 ml-1 text-[11px]">Username atau Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-2xl focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20 outline-none font-semibold text-slate-800 text-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 ml-1 text-[11px]">Kata Sandi (Password)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                  lock
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-2xl focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/20 outline-none font-semibold text-slate-800 text-xs transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1.5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] text-white rounded-full font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">
              Pilihan Cepat Akun Demo:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'password123')}
                className="py-1.5 px-2 rounded-xl bg-[#eff6ff] hover:bg-[#dbeafe] text-[#2563eb] font-bold text-center transition-all border border-[#2563eb]/20 text-[11px] cursor-pointer"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('bendahara', 'password123')}
                className="py-1.5 px-2 rounded-xl bg-[#fef8e7] hover:bg-[#fdeec4] text-[#b88000] font-bold text-center transition-all border border-[#ffd159]/40 text-[11px] cursor-pointer"
              >
                Bendahara
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('kasir', 'password123')}
                className="py-1.5 px-2 rounded-xl bg-[#f8fafc] hover:bg-slate-200 text-slate-700 font-bold text-center transition-all border border-slate-200 text-[11px] cursor-pointer"
              >
                Kasir
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f8fafc] px-4 py-2.5 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium shrink-0">
          &copy; {new Date().getFullYear()} Koperasi Idaman &bull; Sistem Terpadu
        </div>
      </div>
    </div>
  );
}
