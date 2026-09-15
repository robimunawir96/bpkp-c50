import Link from 'next/link';
import {
  BuildingOfficeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function DashboardHome() {
  const quickBidang = [
    { nama: 'Bidang Instansi Pemerintah Pusat (IPP)' },
    { nama: 'Bidang Akuntabilitas Pemerintah Daerah (APD)' },
    { nama: 'Bidang Akuntan Negara (AN)' },
    { nama: 'Bidang Investigasi (INV)' },
    { nama: 'Bagian Tata Usaha (TU)' }
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Dashboard BPKP Jawa Barat
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Panel kendali data pengawasan, manajemen KAK, surat tugas penugasan auditor, dan struktur bidang.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/dashboard/approval"
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors"
          >
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Pusat Approval</span>
          </Link>
          <Link
            href="/dashboard/kak"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors"
          >
            <DocumentChartBarIcon className="w-4 h-4 text-amber-400" />
            <span>KAK</span>
          </Link>
          <Link
            href="/dashboard/surat-tugas"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors"
          >
            <ClipboardDocumentListIcon className="w-4 h-4 text-amber-400" />
            <span>Surat Tugas</span>
          </Link>
          <Link
            href="/dashboard/nota-dinas"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors"
          >
            <DocumentDuplicateIcon className="w-4 h-4 text-sky-400" />
            <span>Nota Dinas</span>
          </Link>
          <Link
            href="/dashboard/lhp"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors"
          >
            <DocumentCheckIcon className="w-4 h-4 text-emerald-400" />
            <span>LHP</span>
          </Link>
          <Link
            href="/dashboard/surat-pengantar"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors"
          >
            <DocumentTextIcon className="w-4 h-4 text-amber-400" />
            <span>Surat Pengantar</span>
          </Link>
          <Link
            href="/dashboard/bidang"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors"
          >
            <FolderIcon className="w-4 h-4 text-slate-300" />
            <span>Kelola Bidang</span>
          </Link>
        </div>
      </div>

      {/* Ringkasan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/surat-tugas"
          className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 hover:border-slate-700 transition-colors group"
        >
          <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
            <ClipboardDocumentListIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium group-hover:text-amber-400 transition-colors">Surat Tugas (ST)</p>
            <p className="text-xl font-bold text-white mt-0.5">Aktif Berjalan</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Monitoring penugasan tim</p>
          </div>
        </Link>

        <Link
          href="/dashboard/bidang"
          className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 hover:border-slate-700 transition-colors group"
        >
          <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 shrink-0">
            <BuildingOfficeIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium group-hover:text-sky-400 transition-colors">Total Bidang</p>
            <p className="text-xl font-bold text-white mt-0.5">{quickBidang.length} Bidang</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Unit kerja BPKP Jabar</p>
          </div>
        </Link>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Wilayah Kerja</p>
            <p className="text-xl font-bold text-white mt-0.5">27 Daerah</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Kabupaten & Kota se-Jabar</p>
          </div>
        </div>
      </div>

      {/* Preview Bidang */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-amber-400" />
              <span>Bidang BPKP Jabar</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar bidang aktif di lingkungan kantor perwakilan.
            </p>
          </div>
          <Link
            href="/dashboard/bidang"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Kelola Semua</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickBidang.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3 hover:border-slate-700 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-900/40 text-blue-400 flex items-center justify-center shrink-0 border border-blue-800/60">
                <FolderIcon className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-white">{item.nama}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
