'use client';

import React from 'react';
import {
  CalendarDaysIcon,
  UserCircleIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { NotaDinasItem } from '@/lib/suratData';
import { ActionButtons } from '@/components/common';

interface NotaDinasTableProps {
  items: NotaDinasItem[];
  onShow: (item: NotaDinasItem) => void;
  onEdit: (item: NotaDinasItem) => void;
  onDelete: (item: NotaDinasItem) => void;
}

export const NotaDinasTable: React.FC<NotaDinasTableProps> = ({
  items,
  onShow,
  onEdit,
  onDelete
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
        <DocumentDuplicateIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Tidak ada data Nota Dinas yang cocok.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              <th className="px-4 py-3.5 w-16 text-center">Tahun</th>
              <th className="px-4 py-3.5 w-52">Nomor ND</th>
              <th className="px-4 py-3.5 w-44">Tgl ND</th>
              <th className="px-4 py-3.5 w-60">Yang Meminta</th>
              <th className="px-4 py-3.5">Perihal</th>
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

                {/* No ND */}
                <td className="px-4 py-4">
                  {item.noND ? (
                    <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 inline-block truncate max-w-[170px]">
                      {item.noND}
                    </span>
                  ) : (
                    <span className="text-slate-600 text-[11px] italic font-mono">-</span>
                  )}
                </td>

                {/* Tanggal ND */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5 text-slate-200 text-xs font-semibold">
                    <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.tanggalND}</span>
                  </div>
                </td>

                {/* Yang Meminta */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 text-white font-medium text-xs sm:text-sm">
                    <UserCircleIcon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{item.yangMeminta}</span>
                  </div>
                </td>

                {/* Perihal */}
                <td className="px-4 py-4">
                  {item.perihal ? (
                    <p className="text-slate-300 text-xs leading-relaxed max-w-md">
                      {item.perihal}
                    </p>
                  ) : (
                    <span className="text-slate-600 text-xs italic">-</span>
                  )}
                </td>

                {/* Aksi */}
                <td className="px-4 py-4 text-right">
                  <ActionButtons
                    onShow={() => onShow(item)}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item)}
                    showTitle="Lihat Detail Nota Dinas"
                    editTitle="Edit Nota Dinas"
                    deleteTitle="Hapus Nota Dinas"
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
