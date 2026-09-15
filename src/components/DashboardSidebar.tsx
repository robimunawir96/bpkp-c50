'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserCircleIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bpkp_auth_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const navigation = [
    {
      name: 'Beranda',
      href: '/dashboard',
      icon: HomeIcon,
      exact: true
    },
    {
      name: 'Profil Saya',
      href: '/dashboard/profile',
      icon: UserCircleIcon,
      exact: false
    },
    {
      name: 'Pegawai',
      href: '/dashboard/pegawai',
      icon: UserGroupIcon,
      exact: false
    },
    {
      name: 'KAK',
      href: '/dashboard/kak',
      icon: DocumentChartBarIcon,
      exact: false
    },
    {
      name: 'Surat Tugas',
      href: '/dashboard/surat-tugas',
      icon: ClipboardDocumentListIcon,
      exact: false
    },
    {
      name: 'Nota Dinas',
      href: '/dashboard/nota-dinas',
      icon: DocumentDuplicateIcon,
      exact: false
    },
    {
      name: 'LHP',
      href: '/dashboard/lhp',
      icon: DocumentCheckIcon,
      exact: false
    },
    {
      name: 'Surat Pengantar',
      href: '/dashboard/surat-pengantar',
      icon: DocumentTextIcon,
      exact: false
    },
    {
      name: 'Bidang',
      href: '/dashboard/bidang',
      icon: FolderIcon,
      exact: false
    }
  ];

  return (
    <>
      {/* Mobile Topbar with Hamburger */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-tight">BPKP JABAR</span>
            <span className="block text-[10px] text-slate-400">Dashboard Panel</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header Sidebar Desktop */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">BPKP JABAR</h2>
                <p className="text-[10px] text-slate-400">Portal Pengawasan</p>
              </div>
            </div>
            {/* Close button on mobile */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigasi Utama */}
          <div className="p-3">
            <p className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Menu Navigasi
            </p>
            <nav className="space-y-1 mt-1 text-sm font-medium">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
          <Link
            href="/dashboard/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-slate-800/60 transition-colors group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 group-hover:border-amber-400/50 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'AD'}
            </div>
            <div className="text-xs truncate min-w-0">
              <p className="font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                {currentUser?.name || 'Administrator'}
              </p>
              <p className="text-slate-400 text-[11px] truncate">
                {currentUser?.email || 'admin.jabar@bpkp.go.id'}
              </p>
            </div>
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-medium text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 rounded-xl transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span>Keluar / Logout</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
