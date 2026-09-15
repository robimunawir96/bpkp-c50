'use client';

import React, { useState, useEffect } from 'react';
import {
  LinkIcon,
  InboxArrowDownIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { Modal } from '@/components/common';
import { SuratMasukItem, formatTanggalLengkap, parseDateToInputFormat } from '@/lib/suratData';
import { useUserBidang } from '@/lib/useUserBidang';

interface SuratMasukFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<SuratMasukItem, 'id'>, editId?: string) => void;
  editItem?: SuratMasukItem | null;
}

export const SuratMasukFormModal: React.FC<SuratMasukFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem
}) => {
  const userBidang = useUserBidang();
  const isAdmin = userBidang.userRole === 'ADMIN';
  const [bidangOptions, setBidangOptions] = useState<Array<{ id: string; nama: string; singkatan?: string | null }>>([]);

  const [inputTahun, setInputTahun] = useState(new Date().getFullYear().toString());
  const [inputTanggalSuratMasuk, setInputTanggalSuratMasuk] = useState('');
  const [inputTanggalDiterimaSekbid, setInputTanggalDiterimaSekbid] = useState('');
  const [inputTanggalDikirimKeSekper, setInputTanggalDikirimKeSekper] = useState('');

  const [formData, setFormData] = useState({
    bidangId: '',
    noSuratMasuk: '',
    instansiPengirim: '',
    perihal: '',
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
      setInputTanggalSuratMasuk(parseDateToInputFormat(editItem.tanggalSuratMasuk || ''));
      setInputTanggalDiterimaSekbid(parseDateToInputFormat(editItem.tanggalDiterimaSekbid || ''));
      setInputTanggalDikirimKeSekper(parseDateToInputFormat(editItem.tanggalDikirimKeSekper || ''));
      setFormData({
        bidangId: editItem.bidangId || (editItem.bidang?.id ?? (userBidang.bidangId || '')),
        noSuratMasuk: editItem.noSuratMasuk || '',
        instansiPengirim: editItem.instansiPengirim || '',
        perihal: editItem.perihal || '',
        linkDrive: editItem.linkDrive || ''
      });
    } else {
      setInputTahun(new Date().getFullYear().toString());
      setInputTanggalSuratMasuk('');
      setInputTanggalDiterimaSekbid('');
      setInputTanggalDikirimKeSekper('');
      setFormData({
        bidangId: userBidang.bidangId || '',
        noSuratMasuk: '',
        instansiPengirim: '',
        perihal: '',
        linkDrive: ''
      });
    }
  }, [editItem, isOpen, userBidang.bidangId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.noSuratMasuk.trim() || !formData.instansiPengirim.trim() || !formData.perihal.trim()) return;

    const tglSuratMasukFormatted = inputTanggalSuratMasuk ? formatTanggalLengkap(inputTanggalSuratMasuk) : '-';
    const tglDiterimaSekbidFormatted = inputTanggalDiterimaSekbid ? formatTanggalLengkap(inputTanggalDiterimaSekbid) : '-';
    const tglDikirimKeSekperFormatted = inputTanggalDikirimKeSekper ? formatTanggalLengkap(inputTanggalDikirimKeSekper) : '-';

    const itemData: Omit<SuratMasukItem, 'id'> = {
      tahun: inputTahun || new Date().getFullYear().toString(),
      bidangId: formData.bidangId || null,
      noSuratMasuk: formData.noSuratMasuk.trim(),
      tanggalSuratMasuk: tglSuratMasukFormatted,
      instansiPengirim: formData.instansiPengirim.trim(),
      perihal: formData.perihal.trim(),
      tanggalDiterimaSekbid: tglDiterimaSekbidFormatted,
      tanggalDikirimKeSekper: tglDikirimKeSekperFormatted,
      linkDrive: formData.linkDrive.trim()
    };

    onSave(itemData, editItem ? editItem.id : undefined);
    onClose();
  };

  const modalTitle = (
    <div className="flex items-center gap-2">
      <InboxArrowDownIcon className="w-5 h-5 text-amber-400" />
      <span>{editItem ? 'Edit Surat Masuk' : 'Tambah Surat Masuk Baru'}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tahun & Tanggal Surat Masuk */}
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tanggal Surat Masuk <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              required
              value={inputTanggalSuratMasuk}
              onChange={(e) => {
                const val = e.target.value;
                setInputTanggalSuratMasuk(val);
                if (val && !editItem) {
                  const y = val.split('-')[0];
                  if (y && y.length === 4) setInputTahun(y);
                }
              }}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Bidang Kerja */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BuildingOffice2Icon className="w-3.5 h-3.5 text-amber-400" />
              <span>Bidang Kerja / Unit</span>
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

        {/* Nomor Surat Masuk */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nomor Surat Masuk <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.noSuratMasuk}
            onChange={(e) => setFormData({ ...formData, noSuratMasuk: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
            placeholder="Contoh: 005/1234/Disdik/2026"
          />
        </div>

        {/* Instansi yang Mengirim Surat */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <BuildingOfficeIcon className="w-4 h-4 text-amber-400" />
            <span>Instansi yang Mengirim Surat <span className="text-rose-400">*</span></span>
          </label>
          <input
            type="text"
            required
            value={formData.instansiPengirim}
            onChange={(e) => setFormData({ ...formData, instansiPengirim: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            placeholder="Contoh: Dinas Pendidikan Provinsi Jawa Barat / Inspektorat Daerah"
          />
        </div>

        {/* Perihal */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Perihal Surat Masuk <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={formData.perihal}
            onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 leading-relaxed"
            placeholder="Tuliskan uraian atau perihal surat masuk..."
          />
        </div>

        {/* Tanggal Diterima Sekbid & Tanggal Dikirim ke Sekper */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CalendarDaysIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Tanggal Diterima Sekbid <span className="text-slate-500 font-normal">(Opsional)</span></span>
            </label>
            <input
              type="date"
              value={inputTanggalDiterimaSekbid}
              onChange={(e) => setInputTanggalDiterimaSekbid(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CalendarDaysIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Tanggal Dikirim ke Sekper <span className="text-slate-500 font-normal">(Opsional)</span></span>
            </label>
            <input
              type="date"
              value={inputTanggalDikirimKeSekper}
              onChange={(e) => setInputTanggalDikirimKeSekper(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Link Google Drive */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <LinkIcon className="w-4 h-4 text-blue-400" />
            <span>Link Google Drive <span className="text-slate-500 font-normal">(Opsional)</span></span>
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
            {editItem ? 'Simpan Perubahan' : 'Simpan Surat Masuk'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
