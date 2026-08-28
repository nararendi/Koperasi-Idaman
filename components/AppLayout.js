'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children, title, subtitle, rightAction }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Beranda', href: '/', icon: 'dashboard' },
    { name: 'Anggota', href: '/anggota', icon: 'group' },
    { name: 'Simpanan', href: '/simpanan', icon: 'account_balance_wallet' },
    { name: 'Pinjaman', href: '/pinjaman', icon: 'payments' },
    { name: 'Transaksi Kas', href: '/kas', icon: 'receipt_long' },
    { name: 'Laporan', href: '/laporan', icon: 'assessment' },
    { name: 'Pengaturan', href: '/pengaturan', icon: 'settings' }
  ];

  const isActive = (href) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="bg-[#f8fafc] text-[#0f172a] min-h-screen flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-full w-64 fixed left-0 top-0 bg-[#002045] text-white flex-col py-6 shadow-md z-50">
        <div className="px-5 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
            <span className="material-symbols-outlined text-2xl text-[#adc7f7]">account_balance</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">Koperasi Idaman</h1>
            <p className="text-xs text-blue-200/70 font-medium">Sistem Manajemen Terpadu</p>
          </div>
        </div>

        <div className="px-3 mb-3">
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-200/60">
            Menu Utama
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5 px-3">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-white/15 text-white shadow-sm border-l-4 border-[#adc7f7] font-bold'
                    : 'text-blue-100/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${active ? 'text-[#adc7f7]' : 'text-blue-200/60'}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile info & logout */}
        <div className="mt-auto px-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs border-2 border-white/20">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Administrator</span>
              <span className="text-[11px] text-blue-200/60">Super Admin</span>
            </div>
          </div>
          <Link
            href="/pengaturan"
            title="Pengaturan"
            className="p-1.5 rounded-lg text-blue-200/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="md:hidden bg-[#002045] text-white border-b border-white/10 flex justify-between items-center px-4 h-16 z-50 fixed top-0 left-0 w-full shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-2xl text-[#adc7f7]">account_balance</span>
          <span className="text-sm font-bold text-white tracking-wide">Koperasi Idaman</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-2xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </header>

      {/* Mobile Navigation Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm pt-16" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-[#002045] text-white p-4 shadow-xl border-b border-white/10 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold ${
                    active ? 'bg-white/15 text-white font-bold border-l-4 border-[#adc7f7]' : 'text-blue-100/70 hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-64 mt-16 md:mt-0 max-w-[1400px] w-full min-h-screen pb-12">
        {/* Content Header if provided */}
        {(title || rightAction) && (
          <div className="bg-white border-b border-[#e2e8f0] px-4 md:px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
            <div>
              {title && <h1 className="text-xl md:text-2xl font-bold text-[#002045] tracking-tight">{title}</h1>}
              {subtitle && <p className="text-xs md:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {rightAction && <div className="flex items-center gap-2">{rightAction}</div>}
          </div>
        )}

        <div className="p-4 md:p-8 flex-1">{children}</div>

        {/* Global Footer */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white px-4 md:px-8 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} <strong>Koperasi Idaman</strong>. Seluruh Hak Cipta Dilindungi.</span>
          <div className="flex items-center gap-4 font-medium text-slate-600">
            <span>Sistem Operasional v2.2.0</span>
            <span>&bull;</span>
            <span className="text-green-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Sistem Aktif & Terhubung
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
