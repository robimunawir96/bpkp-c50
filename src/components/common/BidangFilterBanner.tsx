'use client';

import React, { useEffect, useState } from 'react';
import {
  BuildingOffice2Icon,
  ShieldCheckIcon,
  FunnelIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { UserBidangInfo } from '@/lib/useUserBidang';

export interface BidangOption {
  id: string;
  nama: string;
  singkatan?: string | null;
}

interface BidangFilterBannerProps {
  userBidang: UserBidangInfo;
  selectedBidangFilter?: string;
  onBidangFilterChange?: (bidangId: string) => void;
  totalItemsCount?: number;
}

export const BidangFilterBanner: React.FC<BidangFilterBannerProps> = ({
  userBidang,
  selectedBidangFilter = 'ALL',
  onBidangFilterChange,
  totalItemsCount
}) => {
  const [bidangList, setBidangList] = useState<BidangOption[]>([]);
  const isAdmin = userBidang.userRole === 'ADMIN';

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/bidang')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setBidangList(data);
        })
        .catch((err) => console.error('Error fetching bidang list in banner:', err));
    }
  }, [isAdmin]);

  if (userBidang.isLoading) {
    return null;
  }

  // Non-Admin (PEGAWAI)
  if (!isAdmin) {
    if (!userBidang.bidangId && !userBidang.bidangNama) {
      return (
        <div className="flex items-center gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="font-semibold text-amber-200">Akun Belum Ditetapkan ke Bidang Kerja</p>
            <p className="text-[11px] text-amber-300/80 mt-0.5">
              Akun Anda belum memiliki penempatan bidang kerja. Silakan hubungi Administrator untuk menetapkan bidang kerja akun Anda.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
            <BuildingOffice2Icon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Akses Data Terisolasi:</span>
            <span className="font-bold text-white text-xs">
              {userBidang.bidangNama}
              {userBidang.bidangSingkatan && ` (${userBidang.bidangSingkatan})`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
            {typeof totalItemsCount === 'number' ? `${totalItemsCount} Dokumen` : 'Bidang Akun'}
          </span>
        </div>
      </div>
    );
  }

  // Role: ADMIN
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
          <ShieldCheckIcon className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
            <span>Hak Akses Administrator</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400/10 border border-amber-400/20 text-amber-300 font-mono">
              SEMUA DATA
            </span>
          </span>
          <span className="text-slate-400 text-[11px] block mt-0.5">
            Anda dapat melihat dan menyaring dokumen dari semua bidang pengawasan.
          </span>
        </div>
      </div>

      {onBidangFilterChange && (
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedBidangFilter}
            onChange={(e) => onBidangFilterChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">Semua Bidang ({typeof totalItemsCount === 'number' ? totalItemsCount : 'Semua'})</option>
            {bidangList.map((b) => (
              <option key={b.id} value={b.id}>
                {b.singkatan ? `${b.nama} (${b.singkatan})` : b.nama}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
