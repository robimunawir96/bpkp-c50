'use client';

import React from 'react';
import { EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ActionButtonsProps {
  onShow?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onShow,
  onEdit,
  onDelete,
  showTitle = 'Lihat Detail',
  editTitle = 'Edit Data',
  deleteTitle = 'Hapus Data'
}) => {
  return (
    <div className="flex items-center justify-end gap-1">
      {onShow && (
        <button
          type="button"
          onClick={onShow}
          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
          title={showTitle}
        >
          <EyeIcon className="w-4 h-4" />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
          title={editTitle}
        >
          <PencilSquareIcon className="w-4 h-4" />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          title={deleteTitle}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
