'use client';

import React, { useState, useEffect } from 'react';
import {
  LinkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Modal } from '@/components/common';
import { SuratTugasItem, formatTanggalLengkap, parseDateToInputFormat } from '@/lib/suratData';

interface SuratTugasFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<SuratTugasItem, 'id'>, editId?: string) => void;
  editItem?: SuratTugasItem | null;
}

export const SuratTugasFormModal: React.FC<SuratTugasFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem
}) => {
  const [inputTahun, setInputTahun] = useState(new Date().getFullYear().toString());
  const [inputTanggalSurat, setInputTanggalSurat] = useState('');
  const [tglMulaiPelaksanaan, setTglMulaiPelaksanaan] = useState('');
  const [tglSelesaiPelaksanaan, setTglSelesaiPelaksanaan] = useState('');
  const [inputTglDiterima, setInputTglDiterima] = useState('');

  const [formData, setFormData] = useState({
    noS: '',
    noST: '',
    tujuan: '',
    perihal: '',
    linkDrive: ''
  });

  useEffect(() => {
    if (editItem) {
      setInputTahun(editItem.tahun || new Date().getFullYear().toString());
      setInputTanggalSurat(parseDateToInputFormat(editItem.tanggalSurat || ''));
      setTglMulaiPelaksanaan(parseDateToInputFormat(editItem.tglMulai || ''));
      setTglSelesaiPelaksanaan(parseDateToInputFormat(editItem.tglSelesai || ''));
      setInputTglDiterima(parseDateToInputFormat(editItem.suratDiterimaSekretaris || ''));
      setFormData({
        noS: editItem.noS || '',
        noST: editItem.noST || '',
        tujuan: editItem.tujuan || '',
        perihal: editItem.perihal || '',
        linkDrive: editItem.linkDrive || ''
      });
    } else {
      setInputTahun(new Date().getFullYear().toString());
      setInputTanggalSurat('');
      setTglMulaiPelaksanaan('');
      setTglSelesaiPelaksanaan('');
      setInputTglDiterima('');
      setFormData({
        noS: '',
        noST: '',
        tujuan: '',
        perihal: '',
        linkDrive: ''
      });
    }
  }, [editItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tujuan.trim() || !formData.perihal.trim()) return;

    const tanggalSuratFormatted = formatTanggalLengkap(inputTanggalSurat);
    const tglMulaiFormatted = formatTanggalLengkap(tglMulaiPelaksanaan);
    const tglSelesaiFormatted = formatTanggalLengkap(tglSelesaiPelaksanaan);
    const tglDiterimaFormatted = inputTglDiterima ? formatTanggalLengkap(inputTglDiterima) : '-';

    const itemData: Omit<SuratTugasItem, 'id'> = {
      tahun: inputTahun || new Date().getFullYear().toString(),
      noS: formData.noS.trim(),
      noST: formData.noST.trim(),
      tanggalSurat: tanggalSuratFormatted,
      tujuan: formData.tujuan.trim(),
      perihal: formData.perihal.trim(),
      tglMulai: tglMulaiFormatted,
      tglSelesai: tglSelesaiFormatted,
      suratDiterimaSekretaris: tglDiterimaFormatted,
      linkDrive: formData.linkDrive.trim()
    };

    onSave(itemData, editItem ? editItem.id : undefined);
    onClose();
  };

  const modalTitle = (
    <div className="flex items-center gap-2">
      <SparklesIcon className="w-5 h-5 text-amber-400" />
      <span>{editItem ? 'Edit Surat Tugas' : 'Tambah Surat Tugas Baru'}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tahun & Tanggal Surat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tahun Pengawasan <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="2000"
              max="2099"
              required
              value={inputTahun}
              onChange={(e) => setInputTahun(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              placeholder="Contoh: 2026"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tanggal Surat Tugas <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              required
              value={inputTanggalSurat}
              onChange={(e) => setInputTanggalSurat(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* No S & No ST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              No S <span className="text-slate-500 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              value={formData.noS}
              onChange={(e) => setFormData({ ...formData, noS: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
              placeholder="Contoh: S-140/PW10/1/2026"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              No ST <span className="text-slate-500 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              value={formData.noST}
              onChange={(e) => setFormData({ ...formData, noST: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
              placeholder="Contoh: ST-140/PW10/1/2026"
            />
          </div>
        </div>

        {/* Tujuan */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Tujuan Penugasan <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.tujuan}
            onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            placeholder="Contoh: Pemerintah Provinsi Jawa Barat"
          />
        </div>

        {/* Perihal */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Perihal / Uraian Tugas <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={formData.perihal}
            onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 leading-relaxed"
            placeholder="Tuliskan uraian atau perihal surat tugas..."
          />
        </div>

        {/* Waktu Pelaksanaan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tgl Mulai Pelaksanaan <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              required
              value={tglMulaiPelaksanaan}
              onChange={(e) => setTglMulaiPelaksanaan(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tgl Selesai Pelaksanaan <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              required
              value={tglSelesaiPelaksanaan}
              onChange={(e) => setTglSelesaiPelaksanaan(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Tanggal Diterima Sekretaris & Link Google Drive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tanggal Diterima Sekretaris <span className="text-slate-500 font-normal">(Opsional)</span>
            </label>
            <input
              type="date"
              value={inputTglDiterima}
              onChange={(e) => setInputTglDiterima(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-blue-400" />
              <span>Link Dokumen Google Drive <span className="text-slate-500 font-normal">(Opsional)</span></span>
            </label>
            <input
              type="url"
              value={formData.linkDrive}
              onChange={(e) => setFormData({ ...formData, linkDrive: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              placeholder="https://drive.google.com/file/d/..."
            />
          </div>
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
            {editItem ? 'Simpan Perubahan' : 'Simpan Surat Tugas'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
