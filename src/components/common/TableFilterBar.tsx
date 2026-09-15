'use client';

import React from 'react';
import {
  FunnelIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
  TagIcon,
  XMarkIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  icon?: 'calendar' | 'building' | 'tag' | 'general';
}

interface TableFilterBarProps {
  // Tahun Filter
  yearOptions?: string[];
  selectedYear?: string;
  onYearChange?: (year: string) => void;

  // Custom Filters (e.g., Status for KAK, Role for Accounts, etc.)
  customFilters?: Array<{
    key: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (val: string) => void;
    icon?: 'tag' | 'building' | 'general';
  }>;

  // Sorting
  sortOptions?: Array<{ value: string; label: string }>;
  selectedSort?: string;
  onSortChange?: (sortKey: string) => void;

  // Reset all filters
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;

  // Counter
  totalFilteredCount?: number;
  totalAllCount?: number;
}

export const TableFilterBar: React.FC<TableFilterBarProps> = ({
  yearOptions = [],
  selectedYear = 'ALL',
  onYearChange,
  customFilters = [],
  sortOptions = [],
  selectedSort,
  onSortChange,
  onResetFilters,
  hasActiveFilters = false,
  totalFilteredCount,
  totalAllCount
}) => {
  const hasYearFilter = Boolean(onYearChange && yearOptions.length > 0);
  const hasCustomFilters = customFilters.length > 0;
  const hasSort = Boolean(onSortChange && sortOptions.length > 0);

  if (!hasYearFilter && !hasCustomFilters && !hasSort) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-sm text-xs">
      {/* Left section: Filter controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider pr-1">
          <FunnelIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>Filter:</span>
        </div>

        {/* 1. Filter Tahun (jika ada) */}
        {hasYearFilter && (
          <div className="relative">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors">
              <CalendarDaysIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={selectedYear}
                onChange={(e) => onYearChange?.(e.target.value)}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-2"
              >
                <option value="ALL" className="bg-slate-900 text-white">Semua Tahun</option>
                {yearOptions.map((yr) => (
                  <option key={yr} value={yr} className="bg-slate-900 text-white">
                    Tahun {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 2. Custom Filters (Status, Role, dsb.) */}
        {customFilters.map((flt) => {
          const IconComponent =
            flt.icon === 'building'
              ? BuildingOffice2Icon
              : flt.icon === 'tag'
              ? TagIcon
              : FunnelIcon;

          return (
            <div key={flt.key} className="relative">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors">
                <IconComponent className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-[11px] text-slate-400 font-normal">{flt.label}:</span>
                <select
                  value={flt.value}
                  onChange={(e) => flt.onChange(e.target.value)}
                  className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-2"
                >
                  {flt.options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}

        {/* 3. Reset Button */}
        {hasActiveFilters && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
            title="Reset semua filter ke default"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      {/* Right section: Sort & Counter */}
      <div className="flex flex-wrap items-center gap-2.5 ml-auto">
        {/* Sort selector */}
        {hasSort && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors">
            <ArrowsUpDownIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-normal">Urutkan:</span>
            <select
              value={selectedSort}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-1"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value} className="bg-slate-900 text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Counter Badge */}
        {typeof totalFilteredCount === 'number' && (
          <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono">
            Menampilkan <span className="font-bold text-amber-400">{totalFilteredCount}</span>
            {typeof totalAllCount === 'number' && totalAllCount !== totalFilteredCount ? (
              <span> dari {totalAllCount}</span>
            ) : null}{' '}
            data
          </div>
        )}
      </div>
    </div>
  );
};
