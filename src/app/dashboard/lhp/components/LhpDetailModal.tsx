'use client';

import React from 'react';
import {
  CalendarDaysIcon,
  CheckBadgeIcon,
  BuildingOffice2Icon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { Modal } from '@/components/common';
import { LhpItem } from '@/lib/suratData';

interface LhpDetailModalProps {
  item: LhpItem | null;
  onClose: () => void;
}

export const LhpDetailModal: React.FC<LhpDetailModalProps> = ({
  item,
  onClose
}) => {
  if (!item) return null;

  const modalTitle = (
    <div className="flex items-center gap-2">
      <span className="font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded text-xs">
        Tahun {item.tahun || '2026'}
      </span>
      <span>Detail Laporan Hasil Pengawasan (LHP)</span>
    </div>
  );

  return (
    <Modal isOpen={!!item} onClose={onClose} title={modalTitle} maxWidth="xl">
      <div className="space-y-4">
        {/* Nomor Identitas & Bidang */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Nomor S (Terkait):</span>
            {item.noS ? (
              <span className="font-mono font-semibold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60 inline-block truncate max-w-full">
                {item.noS}
              </span>
            ) : (
              <span className="text-slate-500 italic font-mono">-</span>
            )}
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Nomor LHP:</span>
            {item.noLHP ? (
              <span className="font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 inline-block truncate max-w-full">
                {item.noLHP}
              </span>
            ) : (
              <span className="text-slate-500 italic font-mono">-</span>
            )}
          </div>
          <div>
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

        {/* Tanggal & Diterima */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Tanggal LHP:</span>
            <div className="flex items-center gap-1.5 text-white font-medium">
              <CalendarDaysIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{item.tanggalLHP}</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Diterima Sekretaris:</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckBadgeIcon className="w-4 h-4 shrink-0" />
              <span>{item.tanggalDiterimaSekretaris || '-'}</span>
            </div>
          </div>
        </div>

        {/* Tujuan & Perihal */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <span className="block text-slate-400 mb-1">Tujuan:</span>
          <div className="font-bold text-white mb-2">{item.tujuan}</div>
          <span className="block text-slate-400 mb-1">Perihal / Ringkasan:</span>
          <p className="text-white text-xs leading-relaxed">{item.perihal}</p>
        </div>

        {/* Dokumen Google Drive */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <span className="block text-slate-400 mb-2">Dokumen Berkas LHP (Google Drive):</span>
          {item.linkDrive ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-700">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.71 3.5L1.15 15l3.43 6 6.55-11.5-3.42-6zm4.58 0l6.56 11.5h-13.1l6.54-11.5zm6.57 11.5l3.43-6-6.57-11.5-3.43 6 6.57 11.5zm-4.86 1.5h-9.71l3.43 6h9.71l-3.43-6z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-white truncate max-w-[280px]">{item.linkDrive}</div>
                  <div className="text-[11px] text-slate-400">Tersimpan di Google Drive</div>
                </div>
              </div>
              <a
                href={item.linkDrive}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all shrink-0"
              >
                <span>Buka Drive</span>
                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <span className="text-slate-500 italic">Tidak ada tautan Google Drive yang disematkan</span>
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
