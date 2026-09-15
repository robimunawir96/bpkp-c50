'use client';

import React, { useState, useEffect } from 'react';
import {
  LinkIcon,
  DocumentTextIcon,
  ListBulletIcon,
  PencilSquareIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Modal } from '@/components/common';
import {
  SuratPengantarItem,
  LhpItem,
  formatTanggalLengkap,
  parseDateToInputFormat
} from '@/lib/suratData';

interface SuratPengantarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<SuratPengantarItem, 'id'>, editId?: string) => void;
  editItem?: SuratPengantarItem | null;
  lhpList: LhpItem[];
}

export const SuratPengantarFormModal: React.FC<SuratPengantarFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  lhpList
}) => {
  const [inputTahun, setInputTahun] = useState(new Date().getFullYear().toString());
  const [inputTanggalDibuat, setInputTanggalDibuat] = useState('');

  // Mode No LHP: 'select' (pilih dari LHP yang ada) atau 'custom' (tulis manual)
  const [noLHPInputMode, setNoLHPInputMode] = useState<'select' | 'custom'>('select');
  const [noLHPSearchQuery, setNoLHPSearchQuery] = useState('');
  const [isNoLHPDropdownOpen, setIsNoLHPDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    noLHP: '',
    noSP: '',
    tujuan: '',
    linkDrive: ''
  });

  // Opsi No LHP unik dari LHP
  const availableNoLHPOptions = Array.from(
    new Set(
      lhpList
        .map((lhp) => lhp.noLHP?.trim())
        .filter((noLHP): noLHP is string => Boolean(noLHP && noLHP !== ''))
    )
  ).map((noLHP) => {
    const matchedLHP = lhpList.find((lhp) => (lhp.noLHP?.trim() || '') === noLHP);
    return {
      noLHP,
      tujuan: matchedLHP?.tujuan || '',
      tahun: matchedLHP?.tahun || ''
    };
  });

  const filteredNoLHPOptions = availableNoLHPOptions.filter((item) =>
    item.noLHP.toLowerCase().includes(noLHPSearchQuery.toLowerCase())
  );

  useEffect(() => {
    if (editItem) {
      setInputTahun(editItem.tahun || new Date().getFullYear().toString());
      setInputTanggalDibuat(parseDateToInputFormat(editItem.tanggalDibuat || ''));
      setFormData({
        noLHP: editItem.noLHP || '',
        noSP: editItem.noSP || '',
        tujuan: editItem.tujuan || '',
        linkDrive: editItem.linkDrive || ''
      });
      setNoLHPSearchQuery(editItem.noLHP || '');

      const existsInLHP = availableNoLHPOptions.some((opt) => opt.noLHP === editItem.noLHP);
      if (editItem.noLHP && !existsInLHP) {
        setNoLHPInputMode('custom');
      } else {
        setNoLHPInputMode('select');
      }
    } else {
      setInputTahun(new Date().getFullYear().toString());
      setInputTanggalDibuat('');
      setFormData({
        noLHP: '',
        noSP: '',
        tujuan: '',
        linkDrive: ''
      });
      setNoLHPSearchQuery('');
      setNoLHPInputMode('select');
    }
  }, [editItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tujuan.trim()) return;

    const tanggalDibuatFormatted = inputTanggalDibuat ? formatTanggalLengkap(inputTanggalDibuat) : '-';

    const itemData: Omit<SuratPengantarItem, 'id'> = {
      tahun: inputTahun || new Date().getFullYear().toString(),
      tanggalDibuat: tanggalDibuatFormatted,
      noLHP: formData.noLHP.trim(),
      noSP: formData.noSP.trim(),
      tujuan: formData.tujuan.trim(),
      linkDrive: formData.linkDrive.trim()
    };

    onSave(itemData, editItem ? editItem.id : undefined);
    onClose();
  };

  const modalTitle = (
    <div className="flex items-center gap-2">
      <DocumentTextIcon className="w-5 h-5 text-amber-400" />
      <span>{editItem ? 'Edit Surat Pengantar' : 'Tambah Surat Pengantar Baru'}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tahun & Tanggal Dibuat */}
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
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              placeholder="Contoh: 2026"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tanggal Dibuat <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              required
              value={inputTanggalDibuat}
              onChange={(e) => setInputTanggalDibuat(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Grid Nomor LHP & Nomor SP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pemilihan / Input No LHP */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Nomor LHP <span className="text-slate-500 font-normal">(Opsional)</span>
              </label>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setNoLHPInputMode('select')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                    noLHPInputMode === 'select'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ListBulletIcon className="w-3 h-3" />
                  <span>Pilih</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNoLHPInputMode('custom')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                    noLHPInputMode === 'custom'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PencilSquareIcon className="w-3 h-3" />
                  <span>Manual</span>
                </button>
              </div>
            </div>

            {noLHPInputMode === 'select' ? (
              <div className="relative">
                <div
                  onClick={() => setIsNoLHPDropdownOpen(!isNoLHPDropdownOpen)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white cursor-pointer flex items-center justify-between hover:border-amber-400/60 transition-all font-mono"
                >
                  <span className={formData.noLHP ? 'text-amber-300 font-semibold truncate max-w-[170px]' : 'text-slate-500 font-sans'}>
                    {formData.noLHP ? formData.noLHP : '-- Pilih No LHP --'}
                  </span>
                  <ChevronDownIcon className="w-4 h-4 text-slate-400 shrink-0" />
                </div>

                {isNoLHPDropdownOpen && (
                  <div className="absolute z-30 mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                    <div className="p-2 border-b border-slate-800 bg-slate-950/80">
                      <div className="relative">
                        <MagnifyingGlassIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          placeholder="Cari No LHP..."
                          value={noLHPSearchQuery}
                          onChange={(e) => setNoLHPSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                      <div
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, noLHP: '' }));
                          setIsNoLHPDropdownOpen(false);
                        }}
                        className="px-3 py-2 hover:bg-slate-800 cursor-pointer text-slate-400 italic text-[11px]"
                      >
                        -- Kosongkan (Tanpa No LHP) --
                      </div>

                      {filteredNoLHPOptions.map((opt) => (
                        <div
                          key={opt.noLHP}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              noLHP: opt.noLHP,
                              tujuan: prev.tujuan || opt.tujuan
                            }));
                            setIsNoLHPDropdownOpen(false);
                          }}
                          className={`px-3 py-2.5 hover:bg-slate-800/90 cursor-pointer transition-colors ${
                            formData.noLHP === opt.noLHP ? 'bg-amber-400/10 text-amber-300' : 'text-slate-200'
                          }`}
                        >
                          <div className="font-mono font-bold text-amber-300 text-xs">{opt.noLHP}</div>
                          {opt.tujuan && (
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">{opt.tujuan}</div>
                          )}
                        </div>
                      ))}

                      {filteredNoLHPOptions.length === 0 && (
                        <div className="px-3 py-3 text-center text-xs text-slate-500">
                          Tidak ditemukan No LHP.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={formData.noLHP}
                  onChange={(e) => setFormData({ ...formData, noLHP: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  placeholder="Contoh: LHP-123/PW10/1/2026"
                />
              </div>
            )}
          </div>

          {/* Input No SP */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
            <label className="block text-xs font-semibold text-slate-300">
              Nomor SP (Surat Pengantar) <span className="text-slate-500 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              value={formData.noSP}
              onChange={(e) => setFormData({ ...formData, noSP: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 font-mono mt-1"
              placeholder="Contoh: SP-45/PW10/1/2026"
            />
            <p className="text-[11px] text-slate-400">
              Nomor berkas resmi Surat Pengantar (jika ada).
            </p>
          </div>
        </div>

        {/* Tujuan Penugasan */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Tujuan Penugasan <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.tujuan}
            onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            placeholder="Contoh: Inspektorat Daerah Provinsi Jawa Barat"
          />
        </div>

        {/* Link Dokumen Google Drive */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <LinkIcon className="w-4 h-4 text-blue-400" />
            <span>Link Dokumen Google Drive <span className="text-slate-500 font-normal">(Opsional)</span></span>
          </label>
          <input
            type="url"
            value={formData.linkDrive}
            onChange={(e) => setFormData({ ...formData, linkDrive: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            placeholder="https://drive.google.com/file/d/..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
          >
            {editItem ? 'Simpan Perubahan' : 'Simpan Surat Pengantar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
