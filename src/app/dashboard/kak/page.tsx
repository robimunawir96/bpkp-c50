'use client';

import React, { useMemo } from 'react';
import {
  KakItem,
  INITIAL_KAK,
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
  KakTable,
  KakFormModal,
  KakDetailModal
} from './components';

export type { KakItem };

export default function KakPage() {
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
    apiEndpoint: '/api/kak',
    getItemTitle: (item) => item.perihal || item.tujuan
  });

  // Filter pencarian
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return kakList.filter(
      (item) =>
        (item.tahun && item.tahun.toLowerCase().includes(q)) ||
        (item.tujuan && item.tujuan.toLowerCase().includes(q)) ||
        (item.perihal && item.perihal.toLowerCase().includes(q)) ||
        (item.diberikanOleh && item.diberikanOleh.toLowerCase().includes(q)) ||
        (item.status && item.status.toLowerCase().includes(q))
    );
  }, [kakList, searchQuery]);

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
        placeholder="Cari berdasarkan Tujuan, Perihal, Diberikan Oleh, Status, atau Tahun..."
      />

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
