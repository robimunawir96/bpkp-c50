'use client';

import React, { useState, useMemo } from 'react';
import {
  SuratMasukItem,
  INITIAL_SURAT_MASUK,
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
  SuratMasukTable,
  SuratMasukFormModal,
  SuratMasukDetailModal
} from './components';

export type { SuratMasukItem };

export default function SuratMasukPage() {
  const userBidang = useUserBidang();
  const [adminBidangFilter, setAdminBidangFilter] = useState('ALL');

  const apiEndpoint = userBidang.isLoading
    ? undefined
    : userBidang.userRole === 'ADMIN'
    ? '/api/surat-masuk'
    : `/api/surat-masuk?bidangId=${encodeURIComponent(userBidang.bidangId || 'none')}&role=${encodeURIComponent(userBidang.userRole || 'PEGAWAI')}`;

  const {
    data: smList,
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
  } = useDataManager<SuratMasukItem>({
    storageKey: STORAGE_KEYS.SURAT_MASUK,
    initialData: INITIAL_SURAT_MASUK,
    apiEndpoint,
    getItemTitle: (item) => `${item.noSuratMasuk} - ${item.instansiPengirim}`
  });

  // Filter States
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedDriveFilter, setSelectedDriveFilter] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Extract unique years
  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        smList
          .map((item) => item.tahun?.trim())
          .filter((y): y is string => Boolean(y && y !== ''))
      )
    ).sort((a, b) => b.localeCompare(a));
    return years;
  }, [smList]);

  // Filter pencarian & hak akses bidang
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const result = smList.filter((item) => {
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

      // 3. Filter Link Dokumen G-Drive
      if (selectedDriveFilter === 'WITH_DRIVE' && !item.linkDrive?.trim()) {
        return false;
      }
      if (selectedDriveFilter === 'NO_DRIVE' && item.linkDrive?.trim()) {
        return false;
      }

      // 4. Filter Search Query
      return (
        (item.tahun && item.tahun.toLowerCase().includes(q)) ||
        (item.noSuratMasuk && item.noSuratMasuk.toLowerCase().includes(q)) ||
        (item.instansiPengirim && item.instansiPengirim.toLowerCase().includes(q)) ||
        (item.perihal && item.perihal.toLowerCase().includes(q)) ||
        (item.tanggalSuratMasuk && item.tanggalSuratMasuk.toLowerCase().includes(q)) ||
        (item.tanggalDiterimaSekbid && item.tanggalDiterimaSekbid.toLowerCase().includes(q)) ||
        (item.tanggalDikirimKeSekper && item.tanggalDikirimKeSekper.toLowerCase().includes(q)) ||
        (item.bidang?.nama && item.bidang.nama.toLowerCase().includes(q)) ||
        (item.bidang?.singkatan && item.bidang.singkatan.toLowerCase().includes(q))
      );
    });

    // Sorting: default 'newest' (terbaru paling atas)
    result.sort((a, b) => {
      if (selectedSort === 'newest') {
        const yearDiff = (parseInt(b.tahun || '0', 10) || 0) - (parseInt(a.tahun || '0', 10) || 0);
        if (yearDiff !== 0) return yearDiff;
        const dateDiff = parseDateToTimestamp(b.tanggalSuratMasuk) - parseDateToTimestamp(a.tanggalSuratMasuk);
        if (dateDiff !== 0) return dateDiff;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      if (selectedSort === 'oldest') {
        const yearDiff = (parseInt(a.tahun || '0', 10) || 0) - (parseInt(b.tahun || '0', 10) || 0);
        if (yearDiff !== 0) return yearDiff;
        const dateDiff = parseDateToTimestamp(a.tanggalSuratMasuk) - parseDateToTimestamp(b.tanggalSuratMasuk);
        if (dateDiff !== 0) return dateDiff;
        return (a.createdAt || '').localeCompare(b.createdAt || '');
      }
      if (selectedSort === 'instansi_asc') {
        return (a.instansiPengirim || '').localeCompare(b.instansiPengirim || '');
      }
      if (selectedSort === 'no_surat') {
        return (a.noSuratMasuk || '').localeCompare(b.noSuratMasuk || '');
      }
      return 0;
    });

    return result;
  }, [smList, searchQuery, userBidang, adminBidangFilter, selectedYear, selectedDriveFilter, selectedSort]);

  const hasActiveFilters = selectedYear !== 'ALL' || selectedDriveFilter !== 'ALL' || searchQuery !== '';

  const handleResetFilters = () => {
    setSelectedYear('ALL');
    setSelectedDriveFilter('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. Header Standar */}
      <PageHeader
        badgeText="Manajemen Persuratan"
        title="Surat Masuk"
        description="Kelola dan pantau seluruh Surat Masuk dari instansi luar beserta disposisi ke Sekbid dan Sekper."
        addButtonLabel="+ Tambah Surat Masuk"
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
          placeholder="Cari berdasarkan No Surat Masuk, Instansi Pengirim, Perihal, Bidang, atau Tahun..."
        />

        <TableFilterBar
          yearOptions={yearOptions}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          customFilters={[
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
            { value: 'newest', label: 'Tahun / Tanggal Terbaru' },
            { value: 'oldest', label: 'Tahun / Tanggal Terlama' },
            { value: 'instansi_asc', label: 'Nama Instansi (A-Z)' },
            { value: 'no_surat', label: 'Nomor Surat Masuk' }
          ]}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          totalFilteredCount={filteredList.length}
          totalAllCount={smList.length}
        />
      </div>

      {/* 4. Table Komponen */}
      <SuratMasukTable
        items={filteredList}
        onShow={openDetail}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {/* 5. Modal Form Tambah / Edit */}
      <SuratMasukFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={saveItem}
        editItem={editingItem}
      />

      {/* 6. Modal Detail / Show */}
      <SuratMasukDetailModal
        item={detailItem}
        onClose={closeDetail}
      />

      {/* 7. Dialog Konfirmasi Hapus */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={closeDelete}
        onConfirm={deleteItem}
        title="Hapus Surat Masuk"
        itemName={deletingItem ? `${deletingItem.noSuratMasuk} - ${deletingItem.instansiPengirim}` : ''}
        description="Apakah Anda yakin ingin menghapus data Surat Masuk ini? Tindakan ini akan menghapus data secara permanen."
      />
    </div>
  );
}
