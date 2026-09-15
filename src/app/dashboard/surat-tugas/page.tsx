'use client';

import React, { useMemo } from 'react';
import {
  SuratTugasItem,
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
  SuratTugasTable,
  SuratTugasFormModal,
  SuratTugasDetailModal
} from './components';

export type { SuratTugasItem };

export default function SuratTugasPage() {
  const {
    data: stList,
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
  } = useDataManager<SuratTugasItem>({
    storageKey: STORAGE_KEYS.SURAT_TUGAS,
    initialData: INITIAL_SURAT_TUGAS,
    apiEndpoint: '/api/surat-tugas',
    getItemTitle: (item) => item.noST || item.noS || item.tujuan
  });

  // Filter pencarian
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return stList.filter(
      (item) =>
        (item.tahun && item.tahun.toLowerCase().includes(q)) ||
        (item.noS && item.noS.toLowerCase().includes(q)) ||
        (item.noST && item.noST.toLowerCase().includes(q)) ||
        (item.tujuan && item.tujuan.toLowerCase().includes(q)) ||
        (item.perihal && item.perihal.toLowerCase().includes(q)) ||
        (item.tanggalSurat && item.tanggalSurat.toLowerCase().includes(q))
    );
  }, [stList, searchQuery]);

  return (
    <div className="space-y-6 w-full">
      {/* 1. Header Standar */}
      <PageHeader
        badgeText="Manajemen Surat"
        title="Surat Tugas (ST)"
        description="Kelola dan pantau seluruh Surat Tugas pengawasan BPKP Jawa Barat."
        addButtonLabel="+ Tambah Surat Tugas"
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
        placeholder="Cari berdasarkan No S, No ST, Tujuan, Perihal, atau Tahun..."
      />

      {/* 4. Table Komponen */}
      <SuratTugasTable
        items={filteredList}
        onShow={openDetail}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {/* 5. Modal Form Tambah / Edit */}
      <SuratTugasFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={saveItem}
        editItem={editingItem}
      />

      {/* 6. Modal Detail / Show */}
      <SuratTugasDetailModal
        item={detailItem}
        onClose={closeDetail}
      />

      {/* 7. Dialog Konfirmasi Hapus */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={closeDelete}
        onConfirm={deleteItem}
        title="Hapus Surat Tugas"
        itemName={deletingItem ? `${deletingItem.noST || deletingItem.noS || 'ST Tanpa Nomor'} - ${deletingItem.tujuan}` : ''}
        description="Apakah Anda yakin ingin menghapus data Surat Tugas ini? Tindakan ini akan menghapus data secara permanen."
      />
    </div>
  );
}
