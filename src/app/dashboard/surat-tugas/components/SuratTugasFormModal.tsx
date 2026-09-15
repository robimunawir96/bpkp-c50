import React, { useState, useEffect } from 'react';
import {
  LinkIcon,
  SparklesIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import { Modal } from '@/components/common';
import { SuratTugasItem, formatTanggalLengkap, parseDateToInputFormat } from '@/lib/suratData';
import { useUserBidang } from '@/lib/useUserBidang';

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
  const userBidang = useUserBidang();
  const isAdmin = userBidang.userRole === 'ADMIN';
  const [bidangOptions, setBidangOptions] = useState<Array<{ id: string; nama: string; singkatan?: string | null }>>([]);

  const [inputTahun, setInputTahun] = useState(new Date().getFullYear().toString());
  const [inputTanggalSurat, setInputTanggalSurat] = useState('');
  const [tglMulaiPelaksanaan, setTglMulaiPelaksanaan] = useState('');
  const [tglSelesaiPelaksanaan, setTglSelesaiPelaksanaan] = useState('');
  const [inputTglDiterima, setInputTglDiterima] = useState('');

  const [formData, setFormData] = useState({
    bidangId: '',
    noS: '',
    noST: '',
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

  useEffect(() => {
    if (editItem) {
      setInputTahun(editItem.tahun || new Date().getFullYear().toString());
      setInputTanggalSurat(parseDateToInputFormat(editItem.tanggalSurat || ''));
      setTglMulaiPelaksanaan(parseDateToInputFormat(editItem.tglMulai || ''));
      setTglSelesaiPelaksanaan(parseDateToInputFormat(editItem.tglSelesai || ''));
      setInputTglDiterima(parseDateToInputFormat(editItem.suratDiterimaSekretaris || ''));
      setFormData({
        bidangId: editItem.bidangId || (editItem.bidang?.id ?? (userBidang.bidangId || '')),
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
        bidangId: userBidang.bidangId || '',
        noS: '',
        noST: '',
        tujuan: '',
        perihal: '',
        linkDrive: ''
      });
    }
  }, [editItem, isOpen, userBidang.bidangId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tujuan.trim() || !formData.perihal.trim()) return;

    const tanggalSuratFormatted = formatTanggalLengkap(inputTanggalSurat);
    const tglMulaiFormatted = formatTanggalLengkap(tglMulaiPelaksanaan);
    const tglSelesaiFormatted = formatTanggalLengkap(tglSelesaiPelaksanaan);
    const tglDiterimaFormatted = inputTglDiterima ? formatTanggalLengkap(inputTglDiterima) : '-';

    const itemData: Omit<SuratTugasItem, 'id'> = {
      tahun: inputTahun || new Date().getFullYear().toString(),
      bidangId: formData.bidangId || null,
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
              Tanggal Surat Tugas <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              required
              value={inputTanggalSurat}
              onChange={(e) => {
                const val = e.target.value;
                setInputTanggalSurat(val);
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
              <BuildingOffice2Icon className="w-4 h-4 text-amber-400" />
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
