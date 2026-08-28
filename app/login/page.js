'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/authService';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const user = authService.login(username, password);
      setSuccessMessage(`Selamat datang kembali, ${user.nama}!`);
      setTimeout(() => {
        router.push('/');
      }, 1000);
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
    <div className="min-h-screen bg-gradient-to-br from-[#00142b] via-[#002045] to-[#0a356c] flex items-center justify-center p-4 font-sans text-[#0f172a]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20">
        {/* Header */}
        <div className="bg-[#002045] p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <span className="material-symbols-outlined text-3xl text-[#adc7f7]">account_balance</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-wide">KOPERASI IDAMAN</h1>
          <p className="text-xs text-blue-200/80 mt-1 font-medium">Portal Akses Masuk Pengurus & Administrator</p>
        </div>

        {/* Form Container */}
        <div className="p-6 md:p-8 flex flex-col gap-5">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-center gap-2 font-semibold">
              <span className="material-symbols-outlined text-lg text-rose-600">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center gap-2 font-semibold">
              <span className="material-symbols-outlined text-lg text-emerald-600">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Username atau Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username/email"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Kata Sandi (Password)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  lock
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#002045] hover:bg-[#1a365d] text-white rounded-lg font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">login</span>
              {loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Pilihan Akun Cepat Demo:
            </span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'password123')}
                className="py-1.5 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 text-center transition-colors"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('bendahara', 'password123')}
                className="py-1.5 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 text-center transition-colors"
              >
                Bendahara
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('kasir', 'password123')}
                className="py-1.5 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 text-center transition-colors"
              >
                Kasir
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} Koperasi Idaman &bull; v2.2.0-stable
        </div>
      </div>
    </div>
  );
}
