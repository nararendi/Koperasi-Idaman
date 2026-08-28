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
      }, 900);
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
    <div className="min-h-screen bg-[#dff0ed] flex items-center justify-center p-4 font-sans text-[#14293d] relative overflow-hidden">
      {/* Decorative ambient background shapes */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#139a8c]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#ffd159]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl overflow-hidden border-[3px] border-[#139a8c] relative z-10">
        {/* Header with Teal Background */}
        <div className="bg-[#139a8c] p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          
          <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-3 shadow-inner backdrop-blur-md">
            <span className="material-symbols-outlined text-3xl text-[#ffd159]">savings</span>
          </div>

          <h1 className="text-xl font-extrabold tracking-tight">
            Koperasi<span className="text-[#ffd159]">.id</span>
          </h1>
          <p className="text-xs text-white/80 mt-1 font-semibold">Portal Akses Masuk Pengurus & Administrator</p>
        </div>

        {/* Form Container */}
        <div className="p-6 md:p-8 flex flex-col gap-5">
          {errorMessage && (
            <div className="bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] p-3.5 rounded-2xl text-xs flex items-center gap-2 font-bold animate-in fade-in">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-[#e0f7f4] border border-[#a7f3d0] text-[#0f766e] p-3.5 rounded-2xl text-xs flex items-center gap-2 font-bold animate-in fade-in">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5 ml-1">Username atau Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-3 bg-[#f4faf8] border border-slate-200/80 rounded-2xl focus:border-[#139a8c] focus:bg-white focus:ring-2 focus:ring-[#139a8c]/20 outline-none font-semibold text-slate-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5 ml-1">Kata Sandi (Password)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  lock
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#f4faf8] border border-slate-200/80 rounded-2xl focus:border-[#139a8c] focus:bg-white focus:ring-2 focus:ring-[#139a8c]/20 outline-none font-semibold text-slate-800 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-[#139a8c] hover:bg-[#0e8074] text-white rounded-full font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider text-center">
              Pilihan Cepat Akun Demo:
            </span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'password123')}
                className="py-2 px-2 rounded-xl bg-[#e0f7f4] hover:bg-[#c9f1eb] text-[#139a8c] font-bold text-center transition-all border border-[#139a8c]/20"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('bendahara', 'password123')}
                className="py-2 px-2 rounded-xl bg-[#fef8e7] hover:bg-[#fdeec4] text-[#b88000] font-bold text-center transition-all border border-[#ffd159]/40"
              >
                Bendahara
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('kasir', 'password123')}
                className="py-2 px-2 rounded-xl bg-[#f0f4f8] hover:bg-[#e2e8f0] text-slate-700 font-bold text-center transition-all border border-slate-200"
              >
                Kasir
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f4faf8] px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} Koperasi Idaman &bull; Sistem Terpadu
        </div>
      </div>
    </div>
  );
}
