'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  FolderIcon,
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  InboxArrowDownIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useUserBidang } from '@/lib/useUserBidang';

interface BidangItem {
  id: string;
  nama: string;
  singkatan?: string | null;
}

export default function DashboardHome() {
  const userBidang = useUserBidang();
  const isAdmin = userBidang.userRole === 'ADMIN';
  const [bidangList, setBidangList] = useState<BidangItem[]>([]);

  useEffect(() => {
    fetch('/api/bidang')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setBidangList(data);
      })
      .catch((err) => console.error('Error fetching bidang in dashboard:', err));
  }, []);

  return (
    <div className="space-y-6 w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Dashboard BPKP Jawa Barat
            </h1>
            {userBidang.userRole && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold font-mono tracking-wider ${
                  isAdmin
                    ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                }`}
              >
                {isAdmin ? 'ADMINISTRATOR' : 'PEGAWAI'}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            {isAdmin ? (
              <span>Panel kendali pengawasan BPKP Jabar dengan akses penuh ke seluruh bidang kerja.</span>
            ) : userBidang.bidangNama ? (
              <span>
                Selamat bekerja di unit <strong className="text-amber-400">{userBidang.bidangNama} {userBidang.bidangSingkatan ? `(${userBidang.bidangSingkatan})` : ''}</strong>. Data pengawasan disaring khusus untuk bidang Anda.
              </span>
            ) : (
              <span>Panel kendali data pengawasan, manajemen KAK, surat masuk, dan penugasan auditor.</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <Link
              href="/dashboard/manajemen-akun"
              className="flex items-center gap-2 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Manajemen Akun</span>
            </Link>
          )}
          <Link
            href="/dashboard/surat-tugas"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors"
          >
            <ClipboardDocumentListIcon className="w-4 h-4 text-amber-400" />
            <span>Surat Tugas</span>
          </Link>
          <Link
            href="/dashboard/lhp"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors"
          >
            <DocumentCheckIcon className="w-4 h-4 text-emerald-400" />
            <span>LHP</span>
          </Link>
          <Link
            href="/dashboard/surat-pengantar"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors"
          >
            <DocumentTextIcon className="w-4 h-4 text-amber-400" />
            <span>Surat Pengantar</span>
          </Link>
          <Link
            href="/dashboard/surat-masuk"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors"
          >
            <InboxArrowDownIcon className="w-4 h-4 text-emerald-400" />
            <span>Surat Masuk</span>
          </Link>
          <Link
            href="/dashboard/kak"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors"
          >
            <DocumentChartBarIcon className="w-4 h-4 text-amber-400" />
            <span>KAK</span>
          </Link>
          <Link
            href="/dashboard/nota-dinas"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors"
          >
            <DocumentDuplicateIcon className="w-4 h-4 text-sky-400" />
            <span>Nota Dinas</span>
          </Link>
          {isAdmin && (
            <Link
              href="/dashboard/bidang"
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors"
            >
              <FolderIcon className="w-4 h-4 text-slate-300" />
              <span>Kelola Bidang</span>
            </Link>
          )}
        </div>
      </div>

      {/* Ringkasan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/surat-tugas"
          className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 hover:border-slate-700 transition-colors group shadow-md"
        >
          <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
            <ClipboardDocumentListIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium group-hover:text-amber-400 transition-colors">Surat Tugas (ST)</p>
            <p className="text-xl font-bold text-white mt-0.5">Pengawasan Aktif</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Monitoring penugasan tim auditor</p>
          </div>
        </Link>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 shadow-md">
          <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 shrink-0">
            <BuildingOffice2Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {isAdmin ? 'Total Bidang Terdaftar' : 'Bidang Akun Login'}
            </p>
            <p className="text-xl font-bold text-white mt-0.5 truncate max-w-[180px]">
              {isAdmin
                ? `${bidangList.length || 5} Bidang`
                : userBidang.bidangSingkatan || userBidang.bidangNama || 'Belum Diatur'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isAdmin ? 'Unit kerja perwakilan Jabar' : userBidang.bidangNama || 'Unit Kerja'}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 shadow-md">
          <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Wilayah Kerja</p>
            <p className="text-xl font-bold text-white mt-0.5">27 Daerah</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Kabupaten & Kota se-Jabar</p>
          </div>
        </div>
      </div>

      {/* Preview Bidang */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5 text-amber-400" />
              <span>Struktur Bidang BPKP Jabar</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar unit bidang pengawasan aktif di kantor perwakilan BPKP Jawa Barat.
            </p>
          </div>
          {isAdmin && (
            <Link
              href="/dashboard/bidang"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Kelola Bidang</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(bidangList.length > 0
            ? bidangList
            : [
                { id: '1', nama: 'Bidang Instansi Pemerintah Pusat (IPP)', singkatan: 'IPP' },
                { id: '2', nama: 'Bidang Akuntabilitas Pemerintah Daerah (APD)', singkatan: 'APD' },
                { id: '3', nama: 'Bidang Akuntan Negara (AN)', singkatan: 'AN' },
                { id: '4', nama: 'Bidang Investigasi (INV)', singkatan: 'INV' },
                { id: '5', nama: 'Bagian Tata Usaha (TU)', singkatan: 'TU' }
              ]
          ).map((item) => {
            const isUserOwnBidang = !isAdmin && (item.id === userBidang.bidangId || item.nama === userBidang.bidangNama);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl flex items-center justify-between gap-3 transition-all ${
                  isUserOwnBidang
                    ? 'bg-amber-400/10 border border-amber-400/40 shadow-sm'
                    : 'bg-slate-950/80 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isUserOwnBidang
                        ? 'bg-amber-400/20 text-amber-400 border-amber-400/30'
                        : 'bg-blue-900/40 text-blue-400 border-blue-800/60'
                    }`}
                  >
                    <FolderIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-xs sm:text-sm text-white truncate block">
                      {item.nama}
                    </span>
                    {isUserOwnBidang && (
                      <span className="text-[10px] text-amber-300 font-semibold">
                        Unit Kerja Akun Anda
                      </span>
                    )}
                  </div>
                </div>
                {item.singkatan && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-slate-300 border border-slate-700 font-mono shrink-0">
                    {item.singkatan}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
