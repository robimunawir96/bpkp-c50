'use client';

import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Cari data...',
  className = 'max-w-md w-full'
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <MagnifyingGlassIcon className="w-4 h-4" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition-all shadow-inner"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
          title="Hapus pencarian"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
