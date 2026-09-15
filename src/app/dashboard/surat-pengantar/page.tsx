'use client';

import React, { useState, useMemo } from 'react';
import {
  SuratPengantarItem,
  LhpItem,
  INITIAL_SURAT_PENGANTAR,
  INITIAL_LHP,
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
  SuratPengantarTable,
  SuratPengantarFormModal,
  SuratPengantarDetailModal
} from './components';

export type { SuratPengantarItem };

export default function SuratPengantarPage() {
  const userBidang = useUserBidang();
  const [adminBidangFilter, setAdminBidangFilter] = useState('ALL');

  const spApiEndpoint = userBidang.isLoading
    ? undefined
    : userBidang.userRole === 'ADMIN'
    ? '/api/surat-pengantar'
    : `/api/surat-pengantar?bidangId=${encodeURIComponent(userBidang.bidangId || 'none')}&role=${encodeURIComponent(userBidang.userRole || 'PEGAWAI')}`;

  const lhpApiEndpoint = userBidang.isLoading
    ? undefined
    : userBidang.userRole === 'ADMIN'
    ? '/api/lhp'
    : `/api/lhp?bidangId=${encodeURIComponent(userBidang.bidangId || 'none')}&role=${encodeURIComponent(userBidang.userRole || 'PEGAWAI')}`;

  const {
    data: spList,
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
  } = useDataManager<SuratPengantarItem>({
    storageKey: STORAGE_KEYS.SURAT_PENGANTAR,
    initialData: INITIAL_SURAT_PENGANTAR,
    apiEndpoint: spApiEndpoint,
    getItemTitle: (item) => item.noLHP ? `${item.noLHP} - ${item.tujuan}` : item.tujuan
  });

  // Filter States
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedDriveFilter, setSelectedDriveFilter] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('newest');

  // Extract unique years
  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        spList
          .map((item) => item.tahun?.trim())
          .filter((y): y is string => Boolean(y && y !== ''))
      )
    ).sort((a, b) => b.localeCompare(a));
    return years;
  }, [spList]);

  // Ambil data LHP untuk pilihan relasi No LHP (terfilter bidang)
  const { data: rawLhpList } = useDataManager<LhpItem>({
    storageKey: STORAGE_KEYS.LHP,
    initialData: INITIAL_LHP,
    apiEndpoint: lhpApiEndpoint,
    getItemTitle: (item) => item.noLHP || item.tujuan
  });

  // Filter LHP untuk dropdown relasi modal
  const lhpList = useMemo(() => {
    if (userBidang.userRole !== 'ADMIN') {
      if (!userBidang.bidangId) return [];
      return rawLhpList.filter(
        (lhp) => (lhp.bidangId || lhp.bidang?.id) === userBidang.bidangId || lhp.bidang?.nama === userBidang.bidangNama
      );
    }
    return rawLhpList;
  }, [rawLhpList, userBidang]);

  // Filter pencarian & hak akses bidang
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const result = spList.filter((item) => {
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
        (item.tanggalDibuat && item.tanggalDibuat.toLowerCase().includes(q)) ||
        (item.noLHP && item.noLHP.toLowerCase().includes(q)) ||
        (item.noSP && item.noSP.toLowerCase().includes(q)) ||
        (item.tujuan && item.tujuan.toLowerCase().includes(q)) ||
        (item.bidang?.nama && item.bidang.nama.toLowerCase().includes(q)) ||
        (item.bidang?.singkatan && item.bidang.singkatan.toLowerCase().includes(q))
      );
    });

    // Sorting: default 'newest' (terbaru paling atas)
    result.sort((a, b) => {
      if (selectedSort === 'newest') {
        const yearDiff = (parseInt(b.tahun || '0', 10) || 0) - (parseInt(a.tahun || '0', 10) || 0);
        if (yearDiff !== 0) return yearDiff;
        const dateDiff = parseDateToTimestamp(b.tanggalDibuat) - parseDateToTimestamp(a.tanggalDibuat);
        if (dateDiff !== 0) return dateDiff;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      if (selectedSort === 'oldest') {
        const yearDiff = (parseInt(a.tahun || '0', 10) || 0) - (parseInt(b.tahun || '0', 10) || 0);
        if (yearDiff !== 0) return yearDiff;
        const dateDiff = parseDateToTimestamp(a.tanggalDibuat) - parseDateToTimestamp(b.tanggalDibuat);
        if (dateDiff !== 0) return dateDiff;
        return (a.createdAt || '').localeCompare(b.createdAt || '');
      }
      if (selectedSort === 'tujuan_asc') {
        return (a.tujuan || '').localeCompare(b.tujuan || '');
      }
      if (selectedSort === 'no_sp') {
        return (a.noSP || '').localeCompare(b.noSP || '');
      }
      return 0;
    });

    return result;
  }, [spList, searchQuery, userBidang, adminBidangFilter, selectedYear, selectedDriveFilter, selectedSort]);

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
        badgeText="Manajemen Surat"
        title="Surat Pengantar"
        description="Kelola dan pantau berkas Surat Pengantar hasil pengawasan perwakilan BPKP Jawa Barat."
        addButtonLabel="+ Tambah Surat Pengantar"
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
          placeholder="Cari berdasarkan Tahun, Tanggal Dibuat, No LHP, No SP, atau Tujuan Penugasan..."
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
            { value: 'tujuan_asc', label: 'Nama Tujuan (A-Z)' },
            { value: 'no_sp', label: 'Nomor SP' }
          ]}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          totalFilteredCount={filteredList.length}
          totalAllCount={spList.length}
        />
      </div>

      {/* 4. Table Komponen */}
      <SuratPengantarTable
        items={filteredList}
        onShow={openDetail}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {/* 5. Modal Form Tambah / Edit */}
      <SuratPengantarFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={saveItem}
        editItem={editingItem}
        lhpList={lhpList}
      />

      {/* 6. Modal Detail / Show */}
      <SuratPengantarDetailModal
        item={detailItem}
        onClose={closeDetail}
      />

      {/* 7. Dialog Konfirmasi Hapus */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={closeDelete}
        onConfirm={deleteItem}
        title="Hapus Surat Pengantar"
        itemName={deletingItem ? `${deletingItem.noLHP || 'Surat Pengantar'} - ${deletingItem.tujuan}` : ''}
        description="Apakah Anda yakin ingin menghapus data Surat Pengantar ini? Tindakan ini akan menghapus data secara permanen."
      />
    </div>
  );
}
