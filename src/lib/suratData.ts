export interface BidangRef {
  id: string;
  nama: string;
  singkatan?: string | null;
}

export interface SuratTugasItem {
  id: string;
  tahun: string;
  noS?: string;
  noST?: string;
  bidangId?: string | null;
  bidang?: BidangRef | null;
  tujuan: string;
  perihal: string;
  tanggalSurat?: string;
  tglMulai?: string;
  tglSelesai?: string;
  suratDiterimaSekretaris?: string;
  linkDrive?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotaDinasItem {
  id: string;
  tahun: string;
  noND?: string;
  bidangId?: string | null;
  bidang?: BidangRef | null;
  yangMeminta: string;
  tanggalND?: string;
  perihal?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LhpItem {
  id: string;
  tahun: string;
  noS?: string;
  noLHP?: string;
  bidangId?: string | null;
  bidang?: BidangRef | null;
  tanggalLHP?: string;
  tujuan: string;
  perihal: string;
  tanggalDiterimaSekretaris?: string;
  linkDrive?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SuratPengantarItem {
  id: string;
  tahun: string;
  tanggalDibuat?: string;
  noLHP?: string;
  noSP?: string;
  bidangId?: string | null;
  bidang?: BidangRef | null;
  tujuan: string; // Tujuan Penugasan
  linkDrive?: string; // Link Dokumen Google Drive
  createdAt?: string;
  updatedAt?: string;
}

export type KakStatus = 'Diterima Sekbid' | 'Dikirim ke Sekper' | 'Diberikan ke Tim';

export interface KakStatusHistoryItem {
  id?: string;
  status: KakStatus | string;
  tanggal: string;
  keterangan?: string;
  diubahOleh?: string;
  createdAt?: string;
}

export interface KakItem {
  id: string;
  tahun: string;
  bidangId?: string | null;
  bidang?: BidangRef | null;
  tujuan: string;
  perihal: string;
  diberikanOleh?: string;
  status: KakStatus;
  statusHistory?: KakStatusHistoryItem[];
  linkDrive?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SuratMasukItem {
  id: string;
  tahun: string;
  noSuratMasuk: string;
  tanggalSuratMasuk?: string;
  instansiPengirim: string;
  perihal: string;
  tanggalDiterimaSekbid?: string;
  tanggalDikirimKeSekper?: string;
  linkDrive?: string;
  bidangId?: string | null;
  bidang?: BidangRef | null;
  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_SURAT_TUGAS: SuratTugasItem[] = [];
export const INITIAL_NOTA_DINAS: NotaDinasItem[] = [];
export const INITIAL_LHP: LhpItem[] = [];
export const INITIAL_SURAT_PENGANTAR: SuratPengantarItem[] = [];
export const INITIAL_KAK: KakItem[] = [];
export const INITIAL_SURAT_MASUK: SuratMasukItem[] = [];

export const STORAGE_KEYS = {
  SURAT_TUGAS: 'bpkp_surat_tugas_data',
  NOTA_DINAS: 'bpkp_nota_dinas_data',
  LHP: 'bpkp_lhp_data',
  SURAT_PENGANTAR: 'bpkp_surat_pengantar_data',
  KAK: 'bpkp_kak_data',
  SURAT_MASUK: 'bpkp_surat_masuk_data'
};

// Helper untuk format tanggal dari YYYY-MM-DD ke "DD Bulan YYYY"
export function formatTanggalLengkap(dateStr: string): string {
  if (!dateStr) return '-';
  if (/[a-zA-Z]/.test(dateStr)) return dateStr;

  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      const bulanIndo = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];

      if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day) && !isNaN(year)) {
        const formattedDay = day < 10 ? `0${day}` : `${day}`;
        return `${formattedDay} ${bulanIndo[monthIdx]} ${year}`;
      }
    }
  } catch {
    // fallback
  }

  return dateStr;
}

// Helper untuk konversi format "DD Bulan YYYY" kembali ke YYYY-MM-DD untuk input type="date"
export function parseDateToInputFormat(dateStr: string): string {
  if (!dateStr || dateStr === '-') return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  const bulanIndoMap: { [key: string]: string } = {
    januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
    juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12'
  };

  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = bulanIndoMap[parts[1].toLowerCase()];
    const year = parts[2];
    if (month && year && day) {
      return `${year}-${month}-${day}`;
    }
  }
  return '';
}

// Helper untuk konversi string tanggal (YYYY-MM-DD atau "DD Bulan YYYY") ke timestamp (ms) untuk sorting akurat
export function parseDateToTimestamp(dateStr?: string | null): number {
  if (!dateStr || dateStr === '-') return 0;
  const isoStr = parseDateToInputFormat(dateStr);
  if (isoStr) {
    const time = new Date(isoStr).getTime();
    if (!isNaN(time)) return time;
  }
  const directTime = new Date(dateStr).getTime();
  return isNaN(directTime) ? 0 : directTime;
}

