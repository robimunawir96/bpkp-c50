'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FolderIcon, DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import {
  PageHeader,
  SearchInput,
  AlertMessage,
  Modal,
  DeleteConfirmModal,
  ActionButtons,
  TableFilterBar
} from '@/components/common';
import { useDataManager } from '@/lib/useDataManager';

interface BidangItem {
  id: string;
  nama: string;
  singkatan?: string | null;
}

const defaultBidang: BidangItem[] = [];

export default function BidangPage() {
  // Auth & Role checking
  const [currentUser, setCurrentUser] = useState<{ role?: string; name?: string; email?: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bpkp_auth_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
      setIsCheckingAuth(false);
    }
  }, []);

  const {
    data: bidangList,
    searchQuery,
    setSearchQuery,
    isFormOpen,
    editingItem,
    deletingItem,
    notification,
    setNotification,
    openAdd,
    openEdit,
    openDelete,
    closeForm,
    closeDelete,
    saveItem,
    deleteItem
  } = useDataManager<BidangItem>({
    storageKey: 'bpkp_bidang_data',
    initialData: defaultBidang,
    apiEndpoint: '/api/bidang',
    getItemTitle: (item) => (item.singkatan ? `${item.nama} (${item.singkatan})` : item.nama)
  });

  const [namaBidang, setNamaBidang] = React.useState('');
  const [singkatanBidang, setSingkatanBidang] = React.useState('');

  React.useEffect(() => {
    if (editingItem) {
      setNamaBidang(editingItem.nama || '');
      setSingkatanBidang(editingItem.singkatan || '');
    } else {
      setNamaBidang('');
      setSingkatanBidang('');
    }
  }, [editingItem, isFormOpen]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBidang.trim()) return;
    saveItem(
      {
        nama: namaBidang.trim(),
        singkatan: singkatanBidang.trim() || undefined
      },
      editingItem ? editingItem.id : undefined
    );
    setNamaBidang('');
    setSingkatanBidang('');
  };

  const [selectedSort, setSelectedSort] = useState('nama_asc');

  const filteredList = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const result = bidangList.filter((b) =>
      (b.nama || '').toLowerCase().includes(query) ||
      (b.singkatan || '').toLowerCase().includes(query)
    );

    result.sort((a, b) => {
      if (selectedSort === 'nama_asc') {
        return (a.nama || '').localeCompare(b.nama || '');
      }
      if (selectedSort === 'nama_desc') {
        return (b.nama || '').localeCompare(a.nama || '');
      }
      if (selectedSort === 'singkatan') {
        return (a.singkatan || '').localeCompare(b.singkatan || '');
      }
      return 0;
    });

    return result;
  }, [bidangList, searchQuery, selectedSort]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Memeriksa hak akses administrator...</p>
        </div>
      </div>
    );
  }

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
            <ShieldCheckIcon className="w-9 h-9" />
          </div>
          <span className="px-3 py-1 bg-rose-950/60 border border-rose-800/80 text-rose-300 text-[11px] font-bold rounded-full mb-3 uppercase tracking-wider">
            Akses Terbatas
          </span>
          <h2 className="text-xl font-bold text-white mb-2">Hanya untuk Role Admin</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Halaman Manajemen Struktur Bidang memiliki hak akses khusus dan hanya dapat dikelola oleh akun dengan role <span className="font-semibold text-amber-400 font-mono">ADMIN</span>. Akun Anda saat ini tercatat sebagai <span className="font-semibold text-slate-200 font-mono">{currentUser?.role || 'PEGAWAI'}</span>.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-amber-400/10 w-full"
          >
            Kembali ke Beranda Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* 1. Header Standar */}
      <PageHeader
        badgeText="Manajemen Data"
        title="Bidang BPKP Jawa Barat"
        description="Kelola dan daftarkan unit bidang pengawasan BPKP Jawa Barat beserta singkatannya."
        addButtonLabel="+ Tambah Bidang"
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

      {/* 3. Search Bar & Filter Bar */}
      <div className="space-y-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari nama bidang atau singkatan (misal: IPP, APD)..."
        />

        <TableFilterBar
          sortOptions={[
            { value: 'nama_asc', label: 'Nama Bidang (A-Z)' },
            { value: 'nama_desc', label: 'Nama Bidang (Z-A)' },
            { value: 'singkatan', label: 'Singkatan / Kode' }
          ]}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          onResetFilters={() => setSearchQuery('')}
          hasActiveFilters={searchQuery !== ''}
          totalFilteredCount={filteredList.length}
          totalAllCount={bidangList.length}
        />
      </div>

      {/* 4. Tabel Data Bidang */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4">Nama Bidang</th>
                <th className="px-6 py-4 w-36">Singkatan</th>
                <th className="px-6 py-4 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredList.map((bidang, index) => (
                <tr key={bidang.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 text-center font-bold text-slate-400">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                        <FolderIcon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-white text-xs sm:text-sm">{bidang.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {bidang.singkatan ? (
                      <span className="px-2.5 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-300 font-bold rounded-lg text-[11px] tracking-wide">
                        {bidang.singkatan}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ActionButtons
                      onEdit={() => openEdit(bidang)}
                      onDelete={() => openDelete(bidang)}
                      editTitle="Edit Bidang"
                      deleteTitle="Hapus Bidang"
                    />
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Tidak ditemukan bidang dengan kata kunci &quot;{searchQuery}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal Add / Edit Bidang */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingItem ? 'Edit Bidang' : 'Tambah Bidang Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nama Bidang <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <DocumentTextIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={namaBidang}
                onChange={(e) => setNamaBidang(e.target.value)}
                placeholder="Contoh: Instansi Pemerintah Pusat"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Singkatan / Kode Bidang
            </label>
            <div className="relative">
              <FolderIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={singkatanBidang}
                onChange={(e) => setSingkatanBidang(e.target.value)}
                placeholder="Contoh: IPP, APD, AN, Investigasi"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 uppercase"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-md"
            >
              {editingItem ? 'Simpan Perubahan' : 'Tambah Bidang'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={closeDelete}
        onConfirm={deleteItem}
        title="Hapus Bidang"
        itemName={deletingItem?.nama}
        description="Apakah Anda yakin ingin menghapus bidang ini dari daftar pengawasan?"
      />
    </div>
  );
}
