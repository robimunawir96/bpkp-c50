'use client';

import React from 'react';
import {
  ClockIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { KakItem, KakStatus } from '@/lib/suratData';
import { ActionButtons } from '@/components/common';

interface KakTableProps {
  items: KakItem[];
  onShow: (item: KakItem) => void;
  onEdit: (item: KakItem) => void;
  onDelete: (item: KakItem) => void;
}

export const KAK_STATUS_CONFIG: Record<
  KakStatus,
  { label: string; text: string; dot: string; icon: React.ComponentType<{ className?: string }> }
> = {
  'Diterima Sekbid': {
    label: 'Diterima Sekbid',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    icon: ClockIcon
  },
  'Dikirim ke Sekper': {
    label: 'Dikirim ke Sekper',
    text: 'text-sky-300',
    dot: 'bg-sky-400',
    icon: PaperAirplaneIcon
  },
  'Diberikan ke Tim': {
    label: 'Diberikan ke Tim',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
    icon: UserGroupIcon
  }
};

export const KakTable: React.FC<KakTableProps> = ({
  items,
  onShow,
  onEdit,
  onDelete
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
        <ClockIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Tidak ada data Kerangka Acuan Kerja (KAK) yang cocok.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              <th className="px-5 py-3.5 w-16 text-center">No</th>
              <th className="px-5 py-3.5 w-24 text-center">Tahun</th>
              <th className="px-5 py-3.5">Tujuan & Perihal</th>
              <th className="px-5 py-3.5 w-48">Bidang Kerja</th>
              <th className="px-5 py-3.5 w-48">Diberikan Oleh ke Sekbid</th>
              <th className="px-5 py-3.5 w-40">Status</th>
              <th className="px-5 py-3.5 w-44">Dokumen KAK</th>
              <th className="px-5 py-3.5 text-right w-28">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {items.map((item, index) => {
              const statusConfig = KAK_STATUS_CONFIG[item.status || 'Diterima Sekbid'];
              const StatusIcon = statusConfig?.icon || ClockIcon;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* No Urut */}
                  <td className="px-5 py-4 text-center font-bold text-slate-400">
                    {index + 1}
                  </td>

                  {/* Tahun */}
                  <td className="px-5 py-4 text-center">
                    <span className="font-bold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded text-xs border border-amber-400/20">
                      {item.tahun || '2026'}
                    </span>
                  </td>

                  {/* Tujuan & Perihal */}
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="font-bold text-white text-xs sm:text-sm">
                        {item.tujuan}
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {item.perihal}
                      </p>
                    </div>
                  </td>

                  {/* Bidang Kerja */}
                  <td className="px-5 py-4">
                    {item.bidang ? (
                      <div>
                        <div className="font-medium text-slate-200 text-xs truncate max-w-[160px]" title={item.bidang.nama}>
                          {item.bidang.nama}
                        </div>
                        {item.bidang.singkatan && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                            {item.bidang.singkatan}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px] italic">Belum Ditentukan</span>
                    )}
                  </td>

                  {/* Diberikan Oleh ke Sekbid */}
                  <td className="px-5 py-4">
                    {item.diberikanOleh ? (
                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200">
                        <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                          <UserIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium text-xs truncate max-w-[170px]" title={item.diberikanOleh}>
                          {item.diberikanOleh}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs italic">-</span>
                    )}
                  </td>

                  {/* Status KAK */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          statusConfig?.dot || 'bg-slate-500'
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold ${
                          statusConfig?.text || 'text-slate-300'
                        }`}
                      >
                        {item.status || 'Diterima Sekbid'}
                      </span>
                    </div>
                  </td>

                  {/* Dokumen KAK Google Drive */}
                  <td className="px-5 py-4">
                    {item.linkDrive ? (
                      <a
                        href={item.linkDrive}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-medium transition-all group/link"
                      >
                        <svg className="w-3.5 h-3.5 shrink-0 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.71 3.5L1.15 15l3.43 6 6.55-11.5-3.42-6zm4.58 0l6.56 11.5h-13.1l6.54-11.5zm6.57 11.5l3.43-6-6.57-11.5-3.43 6 6.57 11.5zm-4.86 1.5h-9.71l3.43 6h9.71l-3.43-6z" />
                        </svg>
                        <span className="truncate max-w-[110px]">Buka G-Drive</span>
                        <ArrowTopRightOnSquareIcon className="w-3 h-3 shrink-0 group-hover/link:translate-x-0.5 transition-transform" />
                      </a>
                    ) : (
                      <span className="text-slate-500 text-[11px] italic block">Tidak ada link drive</span>
                    )}
                  </td>

                  {/* Aksi */}
                  <td className="px-5 py-4 text-right">
                    <ActionButtons
                      onShow={() => onShow(item)}
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item)}
                      showTitle="Lihat Detail KAK"
                      editTitle="Edit KAK"
                      deleteTitle="Hapus KAK"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
