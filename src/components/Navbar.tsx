'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sembunyikan Navbar portal publik jika sedang berada di dalam /dashboard
  if (pathname && pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top Banner Pemerintah / Instansi */}
      <div className="bg-slate-950 text-slate-400 text-xs py-1.5 px-4 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-medium text-slate-300">
              Portal Resmi Perwakilan BPKP Provinsi Jawa Barat
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px]">
            <span>📞 (022) 7203323</span>
            <span>✉️ jabar@bpkp.go.id</span>
            <span className="text-amber-400/90 font-medium">Jl. Cikutra No. 204, Bandung</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">
                BPKP JABAR
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              Perwakilan Provinsi Jawa Barat
            </span>
          </div>
        </Link>

        {/* Action Buttons (Login, Register & Forgot Password) */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/forgot-password"
            className="text-xs text-slate-400 hover:text-white px-3 py-2 transition-colors font-medium"
          >
            Lupa Sandi?
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 text-slate-400" />
            <span>Masuk</span>
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            <UserCircleIcon className="w-4 h-4" />
            <span>Daftar</span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="sm:hidden flex items-center gap-2">
          <Link
            href="/login"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 border border-slate-700 rounded-lg"
          >
            Masuk
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            aria-label="Buka menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-5 space-y-2.5">
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span>Masuk (Login)</span>
          </Link>
          <Link
            href="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg"
          >
            <UserCircleIcon className="w-4 h-4" />
            <span>Daftar Akun Baru</span>
          </Link>
          <Link
            href="/forgot-password"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center py-2 text-xs font-medium text-slate-400 hover:text-amber-300"
          >
            Lupa Kata Sandi?
          </Link>
        </div>
      )}
    </header>
  );
}
