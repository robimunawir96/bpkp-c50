'use client';

import React from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  PaperAirplaneIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { Modal } from '@/components/common';
import { SuratMasukItem } from '@/lib/suratData';

interface SuratMasukDetailModalProps {
  item: SuratMasukItem | null;
  onClose: () => void;
}

export const SuratMasukDetailModal: React.FC<SuratMasukDetailModalProps> = ({
  item,
  onClose
}) => {
  if (!item) return null;

  const modalTitle = (
    <div className="flex items-center gap-2">
      <span className="font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded text-xs">
        Tahun {item.tahun || '2026'}
      </span>
      <span>Detail Surat Masuk</span>
    </div>
  );

  return (
    <Modal isOpen={!!item} onClose={onClose} title={modalTitle} maxWidth="xl">
      <div className="space-y-4">
        {/* Nomor Surat Masuk & Tanggal Surat Masuk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Nomor Surat Masuk:</span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded border border-emerald-400/20 inline-block">
              {item.noSuratMasuk}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Tanggal Surat Masuk:</span>
            <div className="flex items-center gap-1.5 text-white font-medium">
              <CalendarDaysIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{item.tanggalSuratMasuk || '-'}</span>
            </div>
          </div>
        </div>

        {/* Bidang Kerja & Instansi Pengirim */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="block text-slate-400 mb-1 flex items-center gap-1.5">
              <BuildingOffice2Icon className="w-3.5 h-3.5 text-amber-400" />
              <span>Bidang Kerja / Unit:</span>
            </span>
            <div className="text-white font-semibold text-sm">
              {item.bidang ? (
                <div className="flex items-center gap-2">
                  <span>{item.bidang.nama}</span>
                  {item.bidang.singkatan && (
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                      {item.bidang.singkatan}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-slate-500 italic text-xs font-normal">Belum Ditentukan</span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="block text-slate-400 mb-1 flex items-center gap-1.5">
              <BuildingOfficeIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Instansi Pengirim:</span>
            </span>
            <div className="font-bold text-white text-sm">
              {item.instansiPengirim}
            </div>
          </div>
        </div>

        {/* Perihal */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <span className="block text-slate-400 mb-1">Perihal / Uraian:</span>
          <p className="text-white text-xs leading-relaxed">{item.perihal}</p>
        </div>

        {/* Disposisi Tanggal Diterima Sekbid & Dikirim ke Sekper */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Tanggal Diterima Sekbid:</span>
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <ClockIcon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{item.tanggalDiterimaSekbid || '-'}</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Tanggal Dikirim ke Sekper:</span>
            <div className="flex items-center gap-1.5 text-sky-300 font-medium">
              <PaperAirplaneIcon className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{item.tanggalDikirimKeSekper || '-'}</span>
            </div>
          </div>
        </div>

        {/* Dokumen Google Drive */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <span className="block text-slate-400 mb-2">Dokumen Berkas Google Drive:</span>
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
