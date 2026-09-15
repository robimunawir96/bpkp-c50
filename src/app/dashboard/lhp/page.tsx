'use client';

import React, { useMemo } from 'react';
import {
  LhpItem,
  SuratTugasItem,
  INITIAL_LHP,
  INITIAL_SURAT_TUGAS,
  STORAGE_KEYS
} from '@/lib/suratData';
import { useDataManager } from '@/lib/useDataManager';
import {
  PageHeader,
  SearchInput,
  AlertMessage,
  DeleteConfirmModal
} from '@/components/common';
import {
  LhpTable,
  LhpFormModal,
  LhpDetailModal
} from './components';

export type { LhpItem };

export default function LhpPage() {
  const {
    data: lhpList,
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
  } = useDataManager<LhpItem>({
    storageKey: STORAGE_KEYS.LHP,
    initialData: INITIAL_LHP,
    apiEndpoint: '/api/lhp',
    getItemTitle: (item) => item.noLHP || item.tujuan
  });

  // Ambil data Surat Tugas untuk relasi No S
  const { data: suratTugasList } = useDataManager<SuratTugasItem>({
    storageKey: STORAGE_KEYS.SURAT_TUGAS,
    initialData: INITIAL_SURAT_TUGAS,
    apiEndpoint: '/api/surat-tugas',
    getItemTitle: (item) => item.noST || item.tujuan
  });

  // Filter pencarian
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return lhpList.filter(
      (item) =>
        (item.tahun && item.tahun.toLowerCase().includes(q)) ||
        (item.noS && item.noS.toLowerCase().includes(q)) ||
        (item.noLHP && item.noLHP.toLowerCase().includes(q)) ||
        (item.tujuan && item.tujuan.toLowerCase().includes(q)) ||
        (item.perihal && item.perihal.toLowerCase().includes(q)) ||
        (item.tanggalLHP && item.tanggalLHP.toLowerCase().includes(q))
    );
  }, [lhpList, searchQuery]);

  return (
    <div className="space-y-6 w-full">
      {/* 1. Header Standar */}
      <PageHeader
        badgeText="Manajemen Dokumen Pengawasan"
        title="Laporan Hasil Pengawasan (LHP)"
        description="Kelola dan pantau seluruh berkas Laporan Hasil Pengawasan (LHP) BPKP Jawa Barat."
        addButtonLabel="+ Tambah LHP"
        onAddClick={openAdd}
      />

      {/* 2. Alert Notification Standar */}
      {notification && (
        <AlertMessage
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* 3. Search Bar Standar */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Cari berdasarkan No S, No LHP, Tujuan, Perihal, atau Tahun..."
      />

      {/* 4. Table Komponen */}
      <LhpTable
        items={filteredList}
        onShow={openDetail}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {/* 5. Modal Form Tambah / Edit */}
      <LhpFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={saveItem}
        editItem={editingItem}
        suratTugasList={suratTugasList}
      />

      {/* 6. Modal Detail / Show */}
      <LhpDetailModal
        item={detailItem}
        onClose={closeDetail}
      />

      {/* 7. Dialog Konfirmasi Hapus */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={closeDelete}
        onConfirm={deleteItem}
        title="Hapus LHP"
        itemName={deletingItem ? `${deletingItem.noLHP || deletingItem.noS || 'LHP Tanpa Nomor'} - ${deletingItem.tujuan}` : ''}
        description="Apakah Anda yakin ingin menghapus data LHP ini? Tindakan ini akan menghapus data secara permanen."
      />
    </div>
  );
}
