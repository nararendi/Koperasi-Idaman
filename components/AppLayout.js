'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '../lib/authService';
import AppLogo from './AppLogo';

export default function AppLayout({ children, title, subtitle, rightAction }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentUser, setCurrentUser] = useState({
    nama: 'Administrator',
    role: 'Super Admin',
    avatar: 'AD'
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    const handleAuthUpdate = () => {
      const u = authService.getCurrentUser();
      setCurrentUser(u);
    };

    window.addEventListener('koperasi_auth_updated', handleAuthUpdate);
    return () => window.removeEventListener('koperasi_auth_updated', handleAuthUpdate);
  }, []);

  const handleLogoutConfirm = () => {
    authService.logout();
    setLogoutModalOpen(false);
    router.push('/login');
  };

  const navigation = [
    { name: 'Home', label: 'Beranda', href: '/', icon: 'grid_view' },
    { name: 'Anggota', label: 'Anggota', href: '/anggota', icon: 'group' },
    { name: 'Simpanan', label: 'Simpanan', href: '/simpanan', icon: 'savings' },
    { name: 'Pinjaman', label: 'Pinjaman', href: '/pinjaman', icon: 'payments' },
    { name: 'Kas & Buku', label: 'Transaksi Kas', href: '/kas', icon: 'receipt_long' },
    { name: 'Laporan', label: 'Laporan', href: '/laporan', icon: 'bar_chart' },
    { name: 'Pengaturan', label: 'Pengaturan', href: '/pengaturan', icon: 'settings' }
  ];

  const isActive = (href) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#eaf2fc] p-2 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center font-sans antialiased text-[#0f172a]">
      {/* Outer App Shell Container */}
      <div className="w-full max-w-[1560px] bg-gradient-to-br from-[#1e40af] via-[#1d4ed8] to-[#2563eb] rounded-[28px] sm:rounded-[36px] p-2 sm:p-3 md:p-4 shadow-2xl flex flex-col md:flex-row relative min-h-[94vh] border-[3px] border-[#1d4ed8]">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex flex-col w-56 lg:w-60 shrink-0 text-white pt-4 pb-3 pr-0 pl-3 justify-between z-20">
          <div>
            {/* App Brand Logo */}
            <div className="px-3 mb-7 flex items-center gap-2.5">
              <AppLogo className="w-9 h-9" />
              <div className="flex flex-col">
                <h1 className="text-base font-extrabold tracking-tight text-white leading-tight">
                  Koperasi<span className="text-[#ffd159]">.id</span>
                </h1>
                <span className="text-[10px] text-blue-100/80 font-semibold tracking-wider uppercase">Sistem Terpadu</span>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="flex flex-col gap-1 pr-0">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                      active
                        ? 'bg-white text-[#2563eb] rounded-l-full -mr-[13px] md:-mr-[17px] pl-5 shadow-sm z-30 font-extrabold'
                        : 'text-white/85 hover:text-white hover:bg-white/10 rounded-2xl'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${active ? 'text-[#2563eb]' : 'text-white/80'}`}>
                      {item.icon}
                    </span>
                    <span className="tracking-wide">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar: Mascot / Promo Card & User Quick Action */}
          <div className="flex flex-col gap-3 pr-3 pt-4 mt-auto">
            {/* Modern Info Card */}
            <div className="bg-[#172554]/50 rounded-2xl p-3.5 relative overflow-hidden border border-white/15 shadow-inner backdrop-blur-sm">
              <div className="flex justify-between items-start mb-2 relative">
                <div className="w-10 h-10 rounded-full bg-blue-400/20 absolute top-0 right-0 blur-xs"></div>
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[#ffd159]">
                  <span className="material-symbols-outlined text-xl text-[#ffd159]">verified_user</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-[#ffd159] border-2 border-white/40"></div>
              </div>
              <h4 className="text-xs font-extrabold text-white">Koperasi Idaman</h4>
              <p className="text-[10px] text-blue-100/80 mt-0.5 leading-snug">Amanah, Transparan & Berkelanjutan</p>
              
              <Link
                href="/laporan"
                className="mt-2.5 inline-block w-full py-1.5 text-center bg-[#ffd159] hover:bg-[#f7be38] text-[#0f172a] rounded-xl font-extrabold text-[11px] shadow-sm transition-all cursor-pointer"
              >
                Lihat Rekap
              </Link>
            </div>

            {/* Logout Quick Trigger */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(true)}
                className="flex items-center gap-2 text-white/80 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors w-full font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                <span>LogOut</span>
              </button>
            </div>
          </div>
        </aside>

        {/* MOBILE HEADER BAR */}
        <div className="md:hidden flex items-center justify-between p-3 text-white">
          <div className="flex items-center gap-2">
            <AppLogo className="w-8 h-8" />
            <span className="font-extrabold text-base tracking-tight">Koperasi Idaman</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLogoutModalOpen(true)}
              className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20"
              title="Logout"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-white/20 text-white"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1e40af] rounded-2xl p-4 text-white mb-3 shadow-xl space-y-1">
            <div className="flex items-center gap-3 p-2 bg-white/10 rounded-xl mb-3">
              <div className="w-8 h-8 rounded-full bg-[#ffd159] text-[#0f172a] flex items-center justify-center font-bold text-xs">
                {currentUser.avatar || 'AD'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">{currentUser.nama}</span>
                <span className="text-[10px] text-blue-100">{currentUser.role}</span>
              </div>
            </div>

            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold ${
                    active ? 'bg-white text-[#2563eb]' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* MAIN CONTENT WHITE PANEL */}
        <main className="flex-1 bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 md:p-8 flex flex-col shadow-lg overflow-y-auto relative z-10 min-h-[82vh]">
          
          {/* Top Bar: Search + User Profile Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
            {/* Search Pill Input */}
            <div className="relative max-w-md w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-transparent rounded-full text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#2563eb] focus:bg-white transition-all shadow-inner"
              />
            </div>

            {/* Profile & Notification Header */}
            <div className="flex items-center justify-end gap-3 self-end sm:self-auto">
              <Link
                href="/pengaturan"
                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-[#f8fafc] transition-colors"
              >
                <span className="text-xs font-extrabold text-[#0f172a]">{currentUser.nama || 'Administrator'}</span>
                <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-[#eff6ff]">
                  {currentUser.avatar || 'AD'}
                </div>
              </Link>

              {/* Notification Bell with Badge */}
              <div className="relative">
                <button
                  type="button"
                  title="Notifikasi Sistem"
                  className="w-8 h-8 rounded-full bg-[#f8fafc] flex items-center justify-center text-slate-600 hover:text-[#2563eb] hover:bg-[#eff6ff] transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">notifications</span>
                </button>
                <span className="w-2 h-2 rounded-full bg-[#ef4444] absolute top-0.5 right-0.5 ring-2 ring-white"></span>
              </div>
            </div>
          </div>

          {/* Dynamic Page Header Title & CTA Button (if supplied) */}
          {(title || rightAction) && (
            <div className="py-4 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                {title && (
                  <h1 className="text-xl md:text-2xl font-extrabold text-[#0f172a] tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
                )}
              </div>

              {rightAction && (
                <div className="flex items-center gap-2 shrink-0">{rightAction}</div>
              )}
            </div>
          )}

          {/* Children Page Content */}
          <div className="flex-1 py-2">{children}</div>

          {/* Minimalist Sub-Footer */}
          <footer className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>&copy; {new Date().getFullYear()} <strong>Koperasi Idaman</strong> &bull; Sistem Terintegrasi</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[#2563eb] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-ping"></span>
                Online: {currentUser.role}
              </span>
            </div>
          </footer>
        </main>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col text-xs animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#ffd159]">logout</span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold">Konfirmasi Keluar</h3>
                <p className="text-[11px] text-white/80">Akhiri sesi pengguna aktif</p>
              </div>
            </div>

            <div className="p-6 text-slate-600 font-medium">
              Apakah Anda yakin ingin keluar dari sistem <strong>Koperasi Idaman</strong>? Anda perlu login kembali untuk mengakses data.
            </div>

            <div className="p-4 bg-[#f8fafc] border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-full font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="px-5 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-full font-bold shadow-sm transition-colors cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
