'use client';

import React from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { Modal } from '@/components/common';
import { KakItem } from '@/lib/suratData';
import { KAK_STATUS_CONFIG } from './KakTable';

interface KakDetailModalProps {
  item: KakItem | null;
  onClose: () => void;
}

export const KakDetailModal: React.FC<KakDetailModalProps> = ({
  item,
  onClose
}) => {
  if (!item) return null;

  const statusConfig = KAK_STATUS_CONFIG[item.status || 'Diterima Sekbid'];
  const StatusIcon = statusConfig?.icon || ClockIcon;

  const modalTitle = (
    <div className="flex items-center gap-2">
      <span className="font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded text-xs">
        Tahun {item.tahun || '2026'}
      </span>
      <span>Detail & Histori Kerangka Acuan Kerja (KAK)</span>
    </div>
  );

  const history = item.statusHistory && item.statusHistory.length > 0
    ? item.statusHistory
    : [
        {
          status: item.status || 'Diterima Sekbid',
          tanggal: `${item.tahun || '2026'}`,
          keterangan: item.diberikanOleh ? `Dokumen KAK diserahkan oleh ${item.diberikanOleh}.` : 'Dokumen KAK terdaftar di sistem.',
          diubahOleh: item.diberikanOleh || 'Administrator'
        }
      ];

  return (
    <Modal isOpen={!!item} onClose={onClose} title={modalTitle} maxWidth="xl">
      <div className="space-y-4">
        {/* Status Badge & Diberikan Oleh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 font-medium block mb-1">Diberikan Oleh ke Sekbid:</span>
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <UserIcon className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{item.diberikanOleh || '-'}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-medium block mb-1">Status KAK Terkini:</span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  statusConfig?.dot || 'bg-slate-500'
                }`}
              />
              <span
                className={`text-xs font-bold ${
                  statusConfig?.text || 'text-slate-300'
                }`}
              >
                {item.status || 'Diterima Sekbid'}
              </span>
            </div>
          </div>
        </div>

        {/* Tujuan & Perihal */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
          <div>
            <span className="block text-slate-400 mb-1">Tujuan:</span>
            <div className="font-bold text-white text-sm leading-snug">{item.tujuan}</div>
          </div>
          <div className="pt-2 border-t border-slate-800/80">
            <span className="block text-slate-400 mb-1">Perihal / Uraian KAK:</span>
            <p className="text-white text-xs leading-relaxed">{item.perihal}</p>
          </div>
        </div>

        {/* Timeline Histori Status KAK */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-slate-800">
            <ClockIcon className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white uppercase text-[11px] tracking-wider">
              Histori Perubahan Status ({history.length})
            </span>
          </div>

          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {history.map((hist, idx) => {
              const cfg = (hist.status && (KAK_STATUS_CONFIG as Record<string, any>)[hist.status]) || {
                bg: 'bg-slate-800',
                text: 'text-slate-300',
                border: 'border-slate-700',
                icon: ClockIcon
              };
              const HistIcon = cfg.icon;
              const isLatest = idx === history.length - 1;

              return (
                <div key={idx} className="relative group">
                  {/* Timeline bullet */}
                  <div
                    className={`absolute -left-[29px] top-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                      isLatest
                        ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-md shadow-amber-400/30 ring-4 ring-amber-400/10'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <CheckCircleIcon className="w-3 h-3" />
                  </div>

                  {/* Konten histori item */}
                  <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 space-y-1.5 shadow-sm hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        <HistIcon className="w-3 h-3 shrink-0" />
                        <span>{hist.status}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <ClockIcon className="w-3 h-3 text-slate-500" />
                        {hist.tanggal}
                      </span>
                    </div>

                    {hist.keterangan && (
                      <p className="text-slate-300 text-xs leading-relaxed pl-0.5">
                        {hist.keterangan}
                      </p>
                    )}

                    {hist.diubahOleh && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <UserIcon className="w-3 h-3 text-slate-400" />
                        <span>Oleh: <span className="text-slate-300 font-medium">{hist.diubahOleh}</span></span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dokumen Google Drive */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <span className="block text-slate-400 mb-2">Dokumen Berkas KAK (Google Drive):</span>
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
