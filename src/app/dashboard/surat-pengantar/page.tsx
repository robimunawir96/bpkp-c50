'use client';

import React, { useMemo } from 'react';
import {
  SuratPengantarItem,
  LhpItem,
  INITIAL_SURAT_PENGANTAR,
  INITIAL_LHP,
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
  SuratPengantarTable,
  SuratPengantarFormModal,
  SuratPengantarDetailModal
} from './components';

export type { SuratPengantarItem };

export default function SuratPengantarPage() {
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
    apiEndpoint: '/api/surat-pengantar',
    getItemTitle: (item) => item.noLHP ? `${item.noLHP} - ${item.tujuan}` : item.tujuan
  });

  // Ambil data LHP untuk pilihan relasi No LHP
  const { data: lhpList } = useDataManager<LhpItem>({
    storageKey: STORAGE_KEYS.LHP,
    initialData: INITIAL_LHP,
    apiEndpoint: '/api/lhp',
    getItemTitle: (item) => item.noLHP || item.tujuan
  });

  // Filter pencarian
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return spList.filter(
      (item) =>
        (item.tahun && item.tahun.toLowerCase().includes(q)) ||
        (item.tanggalDibuat && item.tanggalDibuat.toLowerCase().includes(q)) ||
        (item.noLHP && item.noLHP.toLowerCase().includes(q)) ||
        (item.noSP && item.noSP.toLowerCase().includes(q)) ||
        (item.tujuan && item.tujuan.toLowerCase().includes(q))
    );
  }, [spList, searchQuery]);

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
        placeholder="Cari berdasarkan Tahun, Tanggal Dibuat, No LHP, No SP, atau Tujuan Penugasan..."
      />

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
