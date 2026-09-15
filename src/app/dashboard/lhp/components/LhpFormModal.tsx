'use client';

import React, { useState, useEffect } from 'react';
import {
  LinkIcon,
  SparklesIcon,
  ListBulletIcon,
  PencilSquareIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import { Modal } from '@/components/common';
import {
  LhpItem,
  SuratTugasItem,
  formatTanggalLengkap,
  parseDateToInputFormat
} from '@/lib/suratData';
import { useUserBidang } from '@/lib/useUserBidang';

interface LhpFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<LhpItem, 'id'>, editId?: string) => void;
  editItem?: LhpItem | null;
  suratTugasList: SuratTugasItem[];
}

export const LhpFormModal: React.FC<LhpFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  suratTugasList
}) => {
  const userBidang = useUserBidang();
  const isAdmin = userBidang.userRole === 'ADMIN';
  const [bidangOptions, setBidangOptions] = useState<Array<{ id: string; nama: string; singkatan?: string | null }>>([]);

  const [inputTahun, setInputTahun] = useState(new Date().getFullYear().toString());
  const [inputTanggalLHP, setInputTanggalLHP] = useState('');
  const [inputTglDiterima, setInputTglDiterima] = useState('');

  // Mode No S: 'select' (pilih dari ST) atau 'custom' (tulis manual)
  const [noSInputMode, setNoSInputMode] = useState<'select' | 'custom'>('select');
  const [noSSearchQuery, setNoSSearchQuery] = useState('');
  const [isNoSDropdownOpen, setIsNoSDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    bidangId: '',
    noS: '',
    noLHP: '',
    tujuan: '',
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

  // Kumpulan opsi No S unik dari Surat Tugas
  const availableNoSOptions = Array.from(
    new Set(
      suratTugasList
        .map((st) => st.noS?.trim())
        .filter((noS): noS is string => Boolean(noS && noS !== ''))
    )
  ).map((noS) => {
    const matchedST = suratTugasList.find((st) => (st.noS?.trim() || '') === noS);
    return {
      noS,
      tujuan: matchedST?.tujuan || '',
      noST: matchedST?.noST || ''
    };
  });

  const filteredNoSOptions = availableNoSOptions.filter((item) =>
    item.noS.toLowerCase().includes(noSSearchQuery.toLowerCase())
  );

  useEffect(() => {
    if (editItem) {
      setInputTahun(editItem.tahun || new Date().getFullYear().toString());
      setInputTanggalLHP(parseDateToInputFormat(editItem.tanggalLHP || ''));
      setInputTglDiterima(parseDateToInputFormat(editItem.tanggalDiterimaSekretaris || ''));
      setFormData({
        bidangId: editItem.bidangId || (editItem.bidang?.id ?? (userBidang.bidangId || '')),
        noS: editItem.noS || '',
        noLHP: editItem.noLHP || '',
        tujuan: editItem.tujuan || '',
        perihal: editItem.perihal || '',
        linkDrive: editItem.linkDrive || ''
      });
      setNoSSearchQuery(editItem.noS || '');

      const existsInST = availableNoSOptions.some((opt) => opt.noS === editItem.noS);
      if (editItem.noS && !existsInST) {
        setNoSInputMode('custom');
      } else {
        setNoSInputMode('select');
      }
    } else {
      setInputTahun(new Date().getFullYear().toString());
      setInputTanggalLHP('');
      setInputTglDiterima('');
      setFormData({
        bidangId: userBidang.bidangId || '',
        noS: '',
        noLHP: '',
        tujuan: '',
        perihal: '',
        linkDrive: ''
      });
      setNoSSearchQuery('');
      setNoSInputMode('select');
    }
  }, [editItem, isOpen, userBidang.bidangId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tujuan.trim() || !formData.perihal.trim()) return;

    const tanggalLHPFormatted = formatTanggalLengkap(inputTanggalLHP);
    const tglDiterimaFormatted = inputTglDiterima ? formatTanggalLengkap(inputTglDiterima) : '-';

    const itemData: Omit<LhpItem, 'id'> = {
      tahun: inputTahun || new Date().getFullYear().toString(),
      bidangId: formData.bidangId || null,
      noS: formData.noS.trim(),
      noLHP: formData.noLHP.trim(),
      tanggalLHP: tanggalLHPFormatted,
      tujuan: formData.tujuan.trim(),
      perihal: formData.perihal.trim(),
      tanggalDiterimaSekretaris: tglDiterimaFormatted,
      linkDrive: formData.linkDrive.trim()
    };

    onSave(itemData, editItem ? editItem.id : undefined);
    onClose();
  };

  const modalTitle = (
    <div className="flex items-center gap-2">
      <SparklesIcon className="w-5 h-5 text-amber-400" />
      <span>{editItem ? 'Edit LHP' : 'Tambah LHP Baru'}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tahun & Tanggal LHP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tahun Pengawasan <span className="text-rose-400">*</span>
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
              Tanggal LHP <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              required
              value={inputTanggalLHP}
              onChange={(e) => {
                const val = e.target.value;
                setInputTanggalLHP(val);
                if (!editItem && val) {
                  const extractedYear = new Date(val).getFullYear();
                  if (!isNaN(extractedYear)) {
                    setInputTahun(extractedYear.toString());
                  }
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

        {/* Pemilihan / Input No S */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              Nomor S (Terhubung ke Surat Tugas) <span className="text-slate-500 font-normal">(Opsional)</span>
            </label>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setNoSInputMode('select')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                  noSInputMode === 'select'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListBulletIcon className="w-3 h-3" />
                <span>Pilih dari ST</span>
              </button>
              <button
                type="button"
                onClick={() => setNoSInputMode('custom')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                  noSInputMode === 'custom'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PencilSquareIcon className="w-3 h-3" />
                <span>Tulis Manual</span>
              </button>
            </div>
          </div>

          {noSInputMode === 'select' ? (
            <div className="relative">
              <div
                onClick={() => setIsNoSDropdownOpen(!isNoSDropdownOpen)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white cursor-pointer flex items-center justify-between hover:border-amber-400/60 transition-all font-mono"
              >
                <span className={formData.noS ? 'text-amber-300 font-semibold' : 'text-slate-500 font-sans'}>
                  {formData.noS ? formData.noS : '-- Cari & Pilih No S dari Surat Tugas --'}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-slate-400" />
              </div>

              {isNoSDropdownOpen && (
                <div className="absolute z-30 mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                  <div className="p-2 border-b border-slate-800 bg-slate-950/80">
                    <div className="relative">
                      <MagnifyingGlassIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Ketik untuk mencari No S..."
                        value={noSSearchQuery}
                        onChange={(e) => setNoSSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                    <div
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, noS: '' }));
                        setIsNoSDropdownOpen(false);
                      }}
                      className="px-3 py-2 hover:bg-slate-800 cursor-pointer text-slate-400 italic text-[11px]"
                    >
                      -- Kosongkan (Tanpa No S) --
                    </div>

                    {filteredNoSOptions.map((opt) => (
                      <div
                        key={opt.noS}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            noS: opt.noS,
                            tujuan: prev.tujuan || opt.tujuan
                          }));
                          setIsNoSDropdownOpen(false);
                        }}
                        className={`px-3 py-2.5 hover:bg-slate-800/90 cursor-pointer transition-colors ${
                          formData.noS === opt.noS ? 'bg-amber-400/10 text-amber-300' : 'text-slate-200'
                        }`}
                      >
                        <div className="font-mono font-bold text-amber-300 text-xs">{opt.noS}</div>
                        {opt.tujuan && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">{opt.tujuan}</div>
                        )}
                      </div>
                    ))}

                    {filteredNoSOptions.length === 0 && (
                      <div className="px-3 py-4 text-center text-xs text-slate-500">
                        Tidak ditemukan No S yang cocok.
                        <button
                          type="button"
                          onClick={() => {
                            setNoSInputMode('custom');
                            setIsNoSDropdownOpen(false);
                          }}
                          className="text-amber-400 hover:underline block mx-auto mt-1 font-sans"
                        >
                          + Tulis No S Baru Secara Manual
                        </button>
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
                value={formData.noS}
                onChange={(e) => setFormData({ ...formData, noS: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                placeholder="Contoh: S-140/PW10/1/2026"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Ketikkan No S secara manual jika belum terdaftar di Surat Tugas.
              </p>
            </div>
          )}
        </div>

        {/* Nomor LHP */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nomor LHP <span className="text-slate-500 font-normal">(Opsional)</span>
          </label>
          <input
            type="text"
            value={formData.noLHP}
            onChange={(e) => setFormData({ ...formData, noLHP: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
            placeholder="Contoh: LHP-89/PW10/1/2026"
          />
        </div>

        {/* Tujuan */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Tujuan Pengawasan <span className="text-rose-400">*</span>
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
            Perihal / Ringkasan Hasil Pengawasan <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={formData.perihal}
            onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 leading-relaxed"
            placeholder="Tuliskan uraian hasil pengawasan atau perihal LHP..."
          />
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
              <span>Link Dokumen LHP Google Drive <span className="text-slate-500 font-normal">(Opsional)</span></span>
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
            {editItem ? 'Simpan Perubahan' : 'Simpan LHP'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
