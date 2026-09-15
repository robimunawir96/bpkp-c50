'use client';

import React from 'react';
import {
  CalendarDaysIcon,
  CheckBadgeIcon,
  DocumentCheckIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { LhpItem } from '@/lib/suratData';
import { ActionButtons } from '@/components/common';

interface LhpTableProps {
  items: LhpItem[];
  onShow: (item: LhpItem) => void;
  onEdit: (item: LhpItem) => void;
  onDelete: (item: LhpItem) => void;
}

export const LhpTable: React.FC<LhpTableProps> = ({
  items,
  onShow,
  onEdit,
  onDelete
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
        <DocumentCheckIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Tidak ada data LHP yang cocok.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              <th className="px-4 py-3.5 w-16 text-center">Tahun</th>
              <th className="px-4 py-3.5 w-56">Nomor S & LHP</th>
              <th className="px-4 py-3.5 w-44">Tgl LHP</th>
              <th className="px-4 py-3.5">Tujuan & Ringkasan LHP</th>
              <th className="px-4 py-3.5 w-52">Diterima & Dokumen Drive</th>
              <th className="px-4 py-3.5 text-right w-28">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                {/* Tahun */}
                <td className="px-4 py-4 text-center">
                  <span className="font-bold text-amber-300 bg-amber-400/10 px-2 py-1 rounded text-xs border border-amber-400/20">
                    {item.tahun || '2026'}
                  </span>
                </td>

                {/* No S & No LHP */}
                <td className="px-4 py-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">No S:</span>
                      {item.noS ? (
                        <span className="font-mono text-[11px] font-semibold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60 inline-block truncate max-w-[150px]">
                          {item.noS}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px] italic font-mono">-</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">No LHP:</span>
                      {item.noLHP ? (
                        <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 inline-block truncate max-w-[150px]">
                          {item.noLHP}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px] italic font-mono">-</span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Tanggal LHP */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5 text-slate-200 text-xs font-semibold">
                    <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.tanggalLHP}</span>
                  </div>
                </td>

                {/* Tujuan & Perihal */}
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <div className="font-bold text-white text-xs sm:text-sm">
                      {item.tujuan}
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {item.perihal}
                    </p>
                  </div>
                </td>

                {/* Tanggal Diterima Sekretaris & Link Drive */}
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-200 text-xs font-medium">
                      <CheckBadgeIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-emerald-300">{item.tanggalDiterimaSekretaris || '-'}</span>
                    </div>

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
                      <span className="text-slate-500 text-[11px] italic pl-5 block">Tidak ada link drive</span>
                    )}
                  </div>
                </td>

                {/* Aksi */}
                <td className="px-4 py-4 text-right">
                  <ActionButtons
                    onShow={() => onShow(item)}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item)}
                    showTitle="Lihat Detail LHP"
                    editTitle="Edit LHP"
                    deleteTitle="Hapus LHP"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
