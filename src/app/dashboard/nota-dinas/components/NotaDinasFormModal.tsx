'use client';

import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/common';
import { NotaDinasItem, formatTanggalLengkap, parseDateToInputFormat } from '@/lib/suratData';

interface NotaDinasFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<NotaDinasItem, 'id'>, editId?: string) => void;
  editItem?: NotaDinasItem | null;
}

export const NotaDinasFormModal: React.FC<NotaDinasFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem
}) => {
  const [inputTahun, setInputTahun] = useState(new Date().getFullYear().toString());
  const [inputTanggalND, setInputTanggalND] = useState('');
  const [formData, setFormData] = useState({
    noND: '',
    yangMeminta: '',
    perihal: ''
  });

  useEffect(() => {
    if (editItem) {
      setInputTahun(editItem.tahun || new Date().getFullYear().toString());
      setInputTanggalND(parseDateToInputFormat(editItem.tanggalND || ''));
      setFormData({
        noND: editItem.noND || '',
        yangMeminta: editItem.yangMeminta || '',
        perihal: editItem.perihal || ''
      });
    } else {
      setInputTahun(new Date().getFullYear().toString());
      setInputTanggalND('');
      setFormData({
        noND: '',
        yangMeminta: '',
        perihal: ''
      });
    }
  }, [editItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.yangMeminta.trim()) return;

    const tanggalNDFormatted = formatTanggalLengkap(inputTanggalND);

    const itemData: Omit<NotaDinasItem, 'id'> = {
      tahun: inputTahun || new Date().getFullYear().toString(),
      noND: formData.noND.trim(),
      tanggalND: tanggalNDFormatted,
      yangMeminta: formData.yangMeminta.trim(),
      perihal: formData.perihal.trim()
    };

    onSave(itemData, editItem ? editItem.id : undefined);
    onClose();
  };

  const modalTitle = (
    <div className="flex items-center gap-2">
      <SparklesIcon className="w-5 h-5 text-amber-400" />
      <span>{editItem ? 'Edit Nota Dinas' : 'Tambah Nota Dinas Baru'}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tahun & Tanggal ND */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tahun <span className="text-rose-400">*</span>
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
              Tanggal Nota Dinas <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              required
              value={inputTanggalND}
              onChange={(e) => setInputTanggalND(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Nomor ND */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nomor Nota Dinas (ND) <span className="text-slate-500 font-normal">(Opsional)</span>
          </label>
          <input
            type="text"
            value={formData.noND}
            onChange={(e) => setFormData({ ...formData, noND: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
            placeholder="Contoh: ND-01/PW10/1/2026"
          />
        </div>

        {/* Yang Meminta */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Yang Meminta <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.yangMeminta}
            onChange={(e) => setFormData({ ...formData, yangMeminta: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            placeholder="Contoh: Korwas Bidang IPP / Bagian Tata Usaha"
          />
        </div>

        {/* Perihal */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Perihal / Uraian Nota Dinas <span className="text-slate-500 font-normal">(Opsional)</span>
          </label>
          <textarea
            rows={3}
            value={formData.perihal}
            onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 leading-relaxed"
            placeholder="Tuliskan perihal atau ringkasan nota dinas jika ada..."
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
            {editItem ? 'Simpan Perubahan' : 'Simpan Nota Dinas'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
