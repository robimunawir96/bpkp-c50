'use client';

import React from 'react';
import {
  CalendarDaysIcon,
  UserCircleIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import { Modal } from '@/components/common';
import { NotaDinasItem } from '@/lib/suratData';

interface NotaDinasDetailModalProps {
  item: NotaDinasItem | null;
  onClose: () => void;
}

export const NotaDinasDetailModal: React.FC<NotaDinasDetailModalProps> = ({
  item,
  onClose
}) => {
  if (!item) return null;

  const modalTitle = (
    <div className="flex items-center gap-2">
      <span className="font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded text-xs">
        Tahun {item.tahun || '2026'}
      </span>
      <span>Detail Nota Dinas</span>
    </div>
  );

  return (
    <Modal isOpen={!!item} onClose={onClose} title={modalTitle} maxWidth="lg">
      <div className="space-y-4">
        {/* Nomor ND & Bidang */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Nomor Nota Dinas:</span>
            {item.noND ? (
              <span className="font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded border border-emerald-400/20 inline-block">
                {item.noND}
              </span>
            ) : (
              <span className="text-slate-500 italic font-mono">-</span>
            )}
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Bidang Kerja:</span>
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <BuildingOffice2Icon className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">
                {item.bidang?.nama
                  ? item.bidang.singkatan
                    ? `${item.bidang.nama} (${item.bidang.singkatan})`
                    : item.bidang.nama
                  : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Tanggal & Pemohon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Tanggal Nota Dinas:</span>
            <div className="flex items-center gap-1.5 text-white font-medium">
              <CalendarDaysIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{item.tanggalND}</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Yang Meminta:</span>
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <UserCircleIcon className="w-4 h-4 shrink-0" />
              <span>{item.yangMeminta}</span>
            </div>
          </div>
        </div>

        {/* Perihal */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <span className="block text-slate-400 mb-1">Perihal:</span>
          {item.perihal ? (
            <p className="text-white text-xs leading-relaxed">{item.perihal}</p>
          ) : (
            <span className="text-slate-500 italic">Tidak ada perihal</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
