'use client';

import React from 'react';
import { CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AlertMessageProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose?: () => void;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
  message,
  type = 'success',
  onClose
}) => {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div
      className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-2.5 shadow-lg transition-all animate-fadeIn ${
        isSuccess
          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
          : isError
          ? 'bg-rose-950/60 border-rose-800 text-rose-300'
          : 'bg-blue-950/60 border-blue-800 text-blue-300'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {isSuccess ? (
          <CheckCircleIcon className="w-5 h-5 shrink-0 text-emerald-400" />
        ) : isError ? (
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0 text-rose-400" />
        ) : (
          <InformationCircleIcon className="w-5 h-5 shrink-0 text-blue-400" />
        )}
        <span className="font-medium">{message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
