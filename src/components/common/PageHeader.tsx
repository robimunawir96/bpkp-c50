'use client';

import React from 'react';
import { PlusCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface PageHeaderProps {
  badgeText?: string;
  title: string;
  description: string;
  addButtonLabel?: string;
  onAddClick?: () => void;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badgeText = 'Manajemen Data',
  title,
  description,
  addButtonLabel,
  onAddClick,
  children
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {title}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
        {children}
        {addButtonLabel && onAddClick && (
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors"
          >
            <PlusCircleIcon className="w-4 h-4" />
            <span>{addButtonLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
