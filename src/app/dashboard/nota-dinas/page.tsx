'use client';

import React, { useMemo } from 'react';
import {
  NotaDinasItem,
  INITIAL_NOTA_DINAS,
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
  NotaDinasTable,
  NotaDinasFormModal,
  NotaDinasDetailModal
} from './components';

export type { NotaDinasItem };

export default function NotaDinasPage() {
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
    apiEndpoint: '/api/nota-dinas',
    getItemTitle: (item) => item.noND || item.yangMeminta
  });

  // Filter pencarian
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return ndList.filter(
      (item) =>
        (item.tahun && item.tahun.toLowerCase().includes(q)) ||
        (item.noND && item.noND.toLowerCase().includes(q)) ||
        (item.yangMeminta && item.yangMeminta.toLowerCase().includes(q)) ||
        (item.perihal && item.perihal.toLowerCase().includes(q)) ||
        (item.tanggalND && item.tanggalND.toLowerCase().includes(q))
    );
  }, [ndList, searchQuery]);

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
        placeholder="Cari berdasarkan No ND, Yang Meminta, Perihal, atau Tahun..."
      />

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
