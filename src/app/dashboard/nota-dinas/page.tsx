'use client';

import React, { useState, useMemo } from 'react';
import {
  NotaDinasItem,
  INITIAL_NOTA_DINAS,
  STORAGE_KEYS,
  parseDateToTimestamp
} from '@/lib/suratData';
import { useDataManager } from '@/lib/useDataManager';
import { useUserBidang } from '@/lib/useUserBidang';
import {
  PageHeader,
  SearchInput,
  AlertMessage,
  DeleteConfirmModal,
  BidangFilterBanner,
  TableFilterBar
} from '@/components/common';
import {
  NotaDinasTable,
  NotaDinasFormModal,
  NotaDinasDetailModal
} from './components';

export type { NotaDinasItem };

export default function NotaDinasPage() {
  const userBidang = useUserBidang();
  const [adminBidangFilter, setAdminBidangFilter] = useState('ALL');

  const apiEndpoint = userBidang.isLoading
    ? undefined
    : userBidang.userRole === 'ADMIN'
    ? '/api/nota-dinas'
    : `/api/nota-dinas?bidangId=${encodeURIComponent(userBidang.bidangId || 'none')}&role=${encodeURIComponent(userBidang.userRole || 'PEGAWAI')}`;

  const {
    data: ndList,
    searchQuery,
    setSearchQuery,
    isFormOpen,
    editingItem,
    detailItem,
    deletingItem,
    notification,
    setNotification,
    openAdd,
    openEdit,
    openDetail,
    openDelete,
    closeForm,
    closeDetail,
    closeDelete,
    saveItem,
    deleteItem
  } = useDataManager<NotaDinasItem>({
    storageKey: STORAGE_KEYS.NOTA_DINAS,
    initialData: INITIAL_NOTA_DINAS,
    apiEndpoint,
    getItemTitle: (item) => item.noND || item.yangMeminta
  });

  // Filter States
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Extract unique years
  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        ndList
          .map((item) => item.tahun?.trim())
          .filter((y): y is string => Boolean(y && y !== ''))
      )
    ).sort((a, b) => b.localeCompare(a));
    return years;
  }, [ndList]);

  // Filter pencarian & hak akses bidang
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const result = ndList.filter((item) => {
      // 1. Filter hak akses Bidang
      if (userBidang.userRole !== 'ADMIN') {
        if (!userBidang.bidangId) return false;
        const itemBidangId = item.bidangId || item.bidang?.id;
        const itemBidangNama = item.bidang?.nama;
        const matches = itemBidangId === userBidang.bidangId || (itemBidangNama && itemBidangNama === userBidang.bidangNama);
        if (!matches) return false;
      } else if (adminBidangFilter !== 'ALL') {
        const itemBidangId = item.bidangId || item.bidang?.id;
        if (itemBidangId !== adminBidangFilter) return false;
      }

      // 2. Filter Tahun
      if (selectedYear !== 'ALL' && item.tahun !== selectedYear) {
        return false;
      }

      // 3. Filter Search Query
      return (
        (item.tahun && item.tahun.toLowerCase().includes(q)) ||
        (item.noND && item.noND.toLowerCase().includes(q)) ||
        (item.yangMeminta && item.yangMeminta.toLowerCase().includes(q)) ||
        (item.perihal && item.perihal.toLowerCase().includes(q)) ||
        (item.tanggalND && item.tanggalND.toLowerCase().includes(q)) ||
        (item.bidang?.nama && item.bidang.nama.toLowerCase().includes(q)) ||
        (item.bidang?.singkatan && item.bidang.singkatan.toLowerCase().includes(q))
      );
    });

    // Sorting: default 'newest' (terbaru paling atas)
    result.sort((a, b) => {
      if (selectedSort === 'newest') {
        const yearDiff = (parseInt(b.tahun || '0', 10) || 0) - (parseInt(a.tahun || '0', 10) || 0);
        if (yearDiff !== 0) return yearDiff;
        const dateDiff = parseDateToTimestamp(b.tanggalND) - parseDateToTimestamp(a.tanggalND);
        if (dateDiff !== 0) return dateDiff;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      if (selectedSort === 'oldest') {
        const yearDiff = (parseInt(a.tahun || '0', 10) || 0) - (parseInt(b.tahun || '0', 10) || 0);
        if (yearDiff !== 0) return yearDiff;
        const dateDiff = parseDateToTimestamp(a.tanggalND) - parseDateToTimestamp(b.tanggalND);
        if (dateDiff !== 0) return dateDiff;
        return (a.createdAt || '').localeCompare(b.createdAt || '');
      }
      if (selectedSort === 'peminta_asc') {
        return (a.yangMeminta || '').localeCompare(b.yangMeminta || '');
      }
      if (selectedSort === 'no_nd') {
        return (a.noND || '').localeCompare(b.noND || '');
      }
      return 0;
    });

    return result;
  }, [ndList, searchQuery, userBidang, adminBidangFilter, selectedYear, selectedSort]);

  const hasActiveFilters = selectedYear !== 'ALL' || searchQuery !== '';

  const handleResetFilters = () => {
    setSelectedYear('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. Header Standar */}
      <PageHeader
        badgeText="Manajemen Surat"
        title="Nota Dinas (ND)"
        description="Kelola dan pantau seluruh permohonan Nota Dinas di lingkungan BPKP Jawa Barat."
        addButtonLabel="+ Tambah Nota Dinas"
        onAddClick={openAdd}
      />

      {/* Bidang Filter & Scope Banner */}
      <BidangFilterBanner
        userBidang={userBidang}
        selectedBidangFilter={adminBidangFilter}
        onBidangFilterChange={setAdminBidangFilter}
        totalItemsCount={filteredList.length}
      />

      {/* 2. Alert Notification Standar */}
      {notification && (
        <AlertMessage
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* 3. Search Bar & Filter Bar Standar */}
      <div className="space-y-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari berdasarkan No ND, Yang Meminta, Perihal, atau Tahun..."
        />

        <TableFilterBar
          yearOptions={yearOptions}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          sortOptions={[
            { value: 'newest', label: 'Tahun / Tanggal Terbaru' },
            { value: 'oldest', label: 'Tahun / Tanggal Terlama' },
            { value: 'peminta_asc', label: 'Nama Peminta (A-Z)' },
            { value: 'no_nd', label: 'Nomor ND' }
          ]}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          totalFilteredCount={filteredList.length}
          totalAllCount={ndList.length}
        />
      </div>

      {/* 4. Table Komponen */}
      <NotaDinasTable
        items={filteredList}
        onShow={openDetail}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {/* 5. Modal Form Tambah / Edit */}
      <NotaDinasFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={saveItem}
        editItem={editingItem}
      />

      {/* 6. Modal Detail / Show */}
      <NotaDinasDetailModal
        item={detailItem}
        onClose={closeDetail}
      />

      {/* 7. Dialog Konfirmasi Hapus */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={closeDelete}
        onConfirm={deleteItem}
        title="Hapus Nota Dinas"
        itemName={deletingItem ? `${deletingItem.noND || 'ND Tanpa Nomor'} - ${deletingItem.yangMeminta}` : ''}
        description="Apakah Anda yakin ingin menghapus data Nota Dinas ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
