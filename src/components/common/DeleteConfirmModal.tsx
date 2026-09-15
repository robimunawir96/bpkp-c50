'use client';

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Modal } from './Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  description?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Hapus Data',
  itemName,
  description
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2 text-rose-400">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
          <span>{title}</span>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          {description || 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.'}
        </p>

        {itemName && (
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs font-mono break-all">
            {itemName}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md transition-all"
          >
            Hapus Data
          </button>
        </div>
      </div>
    </Modal>
  );
};
