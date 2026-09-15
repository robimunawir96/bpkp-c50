'use client';

import React, { useState, useMemo } from 'react';
import {
  KakItem,
  INITIAL_KAK,
  STORAGE_KEYS
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
  KakTable,
  KakFormModal,
  KakDetailModal
} from './components';

export type { KakItem };

export default function KakPage() {
  const userBidang = useUserBidang();
  const [adminBidangFilter, setAdminBidangFilter] = useState('ALL');

  const apiEndpoint = userBidang.isLoading
    ? undefined
    : userBidang.userRole === 'ADMIN'
    ? '/api/kak'
    : `/api/kak?bidangId=${encodeURIComponent(userBidang.bidangId || 'none')}&role=${encodeURIComponent(userBidang.userRole || 'PEGAWAI')}`;

  const {
    data: kakList,
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
  } = useDataManager<KakItem>({
    storageKey: STORAGE_KEYS.KAK,
    initialData: INITIAL_KAK,
    apiEndpoint,
    getItemTitle: (item) => item.perihal || item.tujuan
  });

  // Filter States
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedDriveFilter, setSelectedDriveFilter] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Extract unique years
  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        kakList
          .map((item) => item.tahun?.trim())
          .filter((y): y is string => Boolean(y && y !== ''))
      )
    ).sort((a, b) => b.localeCompare(a));
    return years;
  }, [kakList]);

  // Filter pencarian & hak akses bidang
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const result = kakList.filter((item) => {
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

      // 3. Filter Status KAK
      if (selectedStatusFilter !== 'ALL' && item.status !== selectedStatusFilter) {
        return false;
      }

      // 4. Filter Link Dokumen G-Drive
      if (selectedDriveFilter === 'WITH_DRIVE' && !item.linkDrive?.trim()) {
        return false;
      }
      if (selectedDriveFilter === 'NO_DRIVE' && item.linkDrive?.trim()) {
        return false;
      }

      // 5. Filter Search Query
      return (
        (item.tahun && item.tahun.toLowerCase().includes(q)) ||
        (item.tujuan && item.tujuan.toLowerCase().includes(q)) ||
        (item.perihal && item.perihal.toLowerCase().includes(q)) ||
        (item.diberikanOleh && item.diberikanOleh.toLowerCase().includes(q)) ||
        (item.status && item.status.toLowerCase().includes(q)) ||
        (item.bidang?.nama && item.bidang.nama.toLowerCase().includes(q)) ||
        (item.bidang?.singkatan && item.bidang.singkatan.toLowerCase().includes(q))
      );
    });

    // Sorting: default 'newest' (terbaru paling atas)
    result.sort((a, b) => {
      if (selectedSort === 'newest') {
        const yearDiff = (parseInt(b.tahun || '0', 10) || 0) - (parseInt(a.tahun || '0', 10) || 0);
        if (yearDiff !== 0) return yearDiff;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      if (selectedSort === 'oldest') {
        const yearDiff = (parseInt(a.tahun || '0', 10) || 0) - (parseInt(b.tahun || '0', 10) || 0);
        if (yearDiff !== 0) return yearDiff;
        return (a.createdAt || '').localeCompare(b.createdAt || '');
      }
      if (selectedSort === 'tujuan_asc') {
        return (a.tujuan || '').localeCompare(b.tujuan || '');
      }
      if (selectedSort === 'status') {
        return (a.status || '').localeCompare(b.status || '');
      }
      return 0;
    });

    return result;
  }, [kakList, searchQuery, userBidang, adminBidangFilter, selectedYear, selectedStatusFilter, selectedDriveFilter, selectedSort]);

  const hasActiveFilters = selectedYear !== 'ALL' || selectedStatusFilter !== 'ALL' || selectedDriveFilter !== 'ALL' || searchQuery !== '';

  const handleResetFilters = () => {
    setSelectedYear('ALL');
    setSelectedStatusFilter('ALL');
    setSelectedDriveFilter('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. Header Standar */}
      <PageHeader
        badgeText="Manajemen Perencanaan Pengawasan"
        title="Kerangka Acuan Kerja (KAK)"
        description="Kelola dan pantau seluruh dokumen Kerangka Acuan Kerja (KAK) kegiatan pengawasan BPKP Jawa Barat."
        addButtonLabel="+ Tambah KAK"
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
          placeholder="Cari berdasarkan Tujuan, Perihal, Diberikan Oleh, Status, atau Tahun..."
        />

        <TableFilterBar
          yearOptions={yearOptions}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          customFilters={[
            {
              key: 'status',
              label: 'Status KAK',
              value: selectedStatusFilter,
              onChange: setSelectedStatusFilter,
              icon: 'tag',
              options: [
                { value: 'ALL', label: 'Semua Status KAK' },
                { value: 'Diterima Sekbid', label: 'Diterima Sekbid' },
                { value: 'Dikirim ke Sekper', label: 'Dikirim ke Sekper' },
                { value: 'Diberikan ke Tim', label: 'Diberikan ke Tim' }
              ]
            },
            {
              key: 'drive',
              label: 'Link Dokumen',
              value: selectedDriveFilter,
              onChange: setSelectedDriveFilter,
              options: [
                { value: 'ALL', label: 'Semua Status Drive' },
                { value: 'WITH_DRIVE', label: 'Ada Link Drive' },
                { value: 'NO_DRIVE', label: 'Tanpa Link Drive' }
              ]
            }
          ]}
          sortOptions={[
            { value: 'newest', label: 'Tahun / Urutan Terbaru' },
            { value: 'oldest', label: 'Tahun / Urutan Terlama' },
            { value: 'tujuan_asc', label: 'Nama Tujuan (A-Z)' },
            { value: 'status', label: 'Status Dokumen' }
          ]}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          totalFilteredCount={filteredList.length}
          totalAllCount={kakList.length}
        />
      </div>

      {/* 4. Table Komponen */}
      <KakTable
        items={filteredList}
        onShow={openDetail}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {/* 5. Modal Form Tambah / Edit */}
      <KakFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={saveItem}
        editItem={editingItem}
      />

      {/* 6. Modal Detail / Show */}
      <KakDetailModal
        item={detailItem}
        onClose={closeDetail}
      />

      {/* 7. Dialog Konfirmasi Hapus */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={closeDelete}
        onConfirm={deleteItem}
        title="Hapus KAK"
        itemName={deletingItem ? `${deletingItem.tujuan} - ${deletingItem.perihal}` : ''}
        description="Apakah Anda yakin ingin menghapus data KAK ini? Tindakan ini akan menghapus data secara permanen."
      />
    </div>
  );
}
