'use client';

import React, { useState, useEffect } from 'react';
import {
  LinkIcon,
  SparklesIcon,
  TagIcon,
  UserIcon,
  BuildingOffice2Icon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { Modal } from '@/components/common';
import { KakItem, KakStatus, KakStatusHistoryItem, formatTanggalLengkap } from '@/lib/suratData';
import { useUserBidang } from '@/lib/useUserBidang';

interface KakFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<KakItem, 'id'>, editId?: string) => void;
  editItem?: KakItem | null;
}

export const KAK_STATUS_OPTIONS: KakStatus[] = [
  'Diterima Sekbid',
  'Dikirim ke Sekper',
  'Diberikan ke Tim'
];

function getFormattedNow(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  const dateStr = `${year}-${month}-${day}`;
  const tglIndo = formatTanggalLengkap(dateStr);
  return `${tglIndo}, ${hours}:${minutes}`;
}

export const KakFormModal: React.FC<KakFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem
}) => {
  const userBidang = useUserBidang();
  const isAdmin = userBidang.userRole === 'ADMIN';
  const [bidangOptions, setBidangOptions] = useState<Array<{ id: string; nama: string; singkatan?: string | null }>>([]);

  const [inputTahun, setInputTahun] = useState(new Date().getFullYear().toString());
  const [statusCatatan, setStatusCatatan] = useState('');
  const [formData, setFormData] = useState<{
    bidangId: string;
    tujuan: string;
    perihal: string;
    diberikanOleh: string;
    status: KakStatus;
    linkDrive: string;
  }>({
    bidangId: '',
    tujuan: '',
    perihal: '',
    diberikanOleh: '',
    status: 'Diterima Sekbid',
    linkDrive: ''
  });

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/bidang')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setBidangOptions(data);
        })
        .catch((err) => console.error('Error fetching bidang options:', err));
    }
  }, [isAdmin]);

  useEffect(() => {
    if (editItem) {
      setInputTahun(editItem.tahun || new Date().getFullYear().toString());
      setStatusCatatan('');
      setFormData({
        bidangId: editItem.bidangId || (editItem.bidang?.id ?? (userBidang.bidangId || '')),
        tujuan: editItem.tujuan || '',
        perihal: editItem.perihal || '',
        diberikanOleh: editItem.diberikanOleh || '',
        status: editItem.status || 'Diterima Sekbid',
        linkDrive: editItem.linkDrive || ''
      });
    } else {
      setInputTahun(new Date().getFullYear().toString());
      setStatusCatatan('');
      setFormData({
        bidangId: userBidang.bidangId || '',
        tujuan: '',
        perihal: '',
        diberikanOleh: '',
        status: 'Diterima Sekbid',
        linkDrive: ''
      });
    }
  }, [editItem, isOpen, userBidang.bidangId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tujuan.trim() || !formData.perihal.trim()) return;

    const timestampNow = getFormattedNow();
    let updatedHistory: KakStatusHistoryItem[] = editItem?.statusHistory ? [...editItem.statusHistory] : [];

    if (editItem) {
      const isStatusChanged = editItem.status !== formData.status;
      if (isStatusChanged || statusCatatan.trim()) {
        updatedHistory.push({
          status: formData.status,
          tanggal: timestampNow,
          keterangan: statusCatatan.trim() || (isStatusChanged ? `Status diperbarui menjadi "${formData.status}"` : 'Pembaruan data KAK'),
          diubahOleh: formData.diberikanOleh.trim() || 'Administrator'
        });
      }
    } else {
      const infoPemberi = formData.diberikanOleh.trim() ? ` diserahkan oleh ${formData.diberikanOleh.trim()}` : '';
      updatedHistory.push({
        status: formData.status,
        tanggal: timestampNow,
        keterangan: statusCatatan.trim() || `Dokumen KAK baru${infoPemberi} dan diterima oleh Sekbid.`,
        diubahOleh: formData.diberikanOleh.trim() || 'Administrator'
      });
    }

    const itemData: Omit<KakItem, 'id'> = {
      tahun: inputTahun || new Date().getFullYear().toString(),
      bidangId: formData.bidangId || null,
      tujuan: formData.tujuan.trim(),
      perihal: formData.perihal.trim(),
      diberikanOleh: formData.diberikanOleh.trim(),
      status: formData.status,
      statusHistory: updatedHistory,
      linkDrive: formData.linkDrive.trim()
    };

    onSave(itemData, editItem ? editItem.id : undefined);
    onClose();
  };

  const modalTitle = (
    <div className="flex items-center gap-2">
      <SparklesIcon className="w-5 h-5 text-amber-400" />
      <span>{editItem ? 'Edit Kerangka Acuan Kerja (KAK)' : 'Tambah KAK Baru'}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tahun & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tahun <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="1900"
              max="2099"
              required
              value={inputTahun}
              onChange={(e) => setInputTahun(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              placeholder={`Contoh: ${new Date().getFullYear()}`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Status KAK <span className="text-rose-400">*</span></span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as KakStatus })}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
            >
              {KAK_STATUS_OPTIONS.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-white">
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bidang Kerja */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BuildingOffice2Icon className="w-3.5 h-3.5 text-amber-400" />
              <span>Bidang Kerja</span>
            </span>
            <span className="text-[10px] text-amber-400/90 font-mono bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
              {isAdmin ? 'Pilihan Administrator' : 'Otomatis sesuai akun'}
            </span>
          </label>
          {isAdmin ? (
            <select
              value={formData.bidangId}
              onChange={(e) => setFormData({ ...formData, bidangId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="">-- Pilih Bidang Kerja --</option>
              {bidangOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.singkatan ? `${b.nama} (${b.singkatan})` : b.nama}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300 flex items-center justify-between cursor-not-allowed select-none">
              <span className="font-medium text-white">
                {editItem?.bidang?.nama || userBidang.bidangNama || (userBidang.isLoading ? 'Memuat bidang...' : 'Belum Ditentukan')}
              </span>
              {(editItem?.bidang?.singkatan || userBidang.bidangSingkatan) && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  {editItem?.bidang?.singkatan || userBidang.bidangSingkatan}
                </span>
              )}
            </div>
          )}
          <input type="hidden" name="bidangId" value={formData.bidangId} />
        </div>

        {/* Diberikan Oleh ke Sekbid */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <UserIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Diberikan Oleh ke Sekbid <span className="text-slate-500 font-normal">(Nama / Jabatan / Tim)</span></span>
          </label>
          <input
            type="text"
            value={formData.diberikanOleh}
            onChange={(e) => setFormData({ ...formData, diberikanOleh: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            placeholder="Contoh: Pengendali Teknis (Dalnis) / Ketua Tim Pengawasan"
          />
        </div>

        {/* Tujuan */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Tujuan <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.tujuan}
            onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            placeholder="Contoh: Pemerintah Daerah Kabupaten Bandung Barat"
          />
        </div>

        {/* Perihal */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Perihal / Uraian KAK <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={formData.perihal}
            onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 leading-relaxed"
            placeholder="Tuliskan perihal atau ringkasan kerangka acuan kerja..."
          />
        </div>

        {/* Catatan / Keterangan Perubahan Status (Opsional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Catatan Histori Status <span className="text-slate-500 font-normal">(Opsional)</span></span>
          </label>
          <input
            type="text"
            value={statusCatatan}
            onChange={(e) => setStatusCatatan(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            placeholder="Contoh: Berkas telah diserahkan dan diterima oleh Sekbid..."
          />
        </div>

        {/* Link Dokumen Google Drive */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <LinkIcon className="w-4 h-4 text-blue-400" />
            <span>Link Dokumen KAK Google Drive <span className="text-slate-500 font-normal">(Opsional)</span></span>
          </label>
          <input
            type="url"
            value={formData.linkDrive}
            onChange={(e) => setFormData({ ...formData, linkDrive: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            placeholder="https://drive.google.com/file/d/..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md transition-all"
          >
            {editItem ? 'Simpan Perubahan' : 'Simpan KAK'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
