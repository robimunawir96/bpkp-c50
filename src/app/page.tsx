import Link from 'next/link';
import {
  ShieldCheckIcon,
  ArrowRightIcon,
  SparklesIcon,
  UserCircleIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const portalCards = [
    {
      title: 'Masuk ke Portal',
      desc: 'Akses akun Anda untuk masuk ke sistem layanan dan dashboard portal resmi BPKP Jawa Barat.',
      action: 'Masuk Akun',
      href: '/login',
      icon: ArrowRightOnRectangleIcon,
      color: 'from-blue-600 to-indigo-600',
      tag: 'Autentikasi'
    },
    {
      title: 'Daftar Akun Baru',
      desc: 'Belum memiliki akun? Daftarkan diri Anda dengan mudah menggunakan nama dan email aktif.',
      action: 'Daftar Sekarang',
      href: '/register',
      icon: UserCircleIcon,
      color: 'from-amber-500 to-orange-600',
      tag: 'Registrasi'
    },
    {
      title: 'Lupa Kata Sandi',
      desc: 'Lupa kata sandi akun Anda? Dapatkan tautan pemulihan langsung ke alamat email terdaftar.',
      action: 'Reset Sandi',
      href: '/forgot-password',
      icon: LockClosedIcon,
      color: 'from-purple-600 to-pink-600',
      tag: 'Bantuan'
    }
  ];

  return (
    <div className="min-h-[82vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full text-center">
        {/* Instansi Label */}
        <div className="inline-flex items-center gap-2 text-slate-400 text-xs font-medium tracking-wide uppercase mb-3">
          <ShieldCheckIcon className="w-4 h-4 text-amber-400" />
          <span>Badan Pengawasan Keuangan dan Pembangunan</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Portal Layanan Terpadu BPKP Jawa Barat
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Sistem administrasi persuratan, pengawasan akuntabilitas, dan manajemen penugasan Perwakilan BPKP Provinsi Jawa Barat.
        </p>

        {/* Portal Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          {portalCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={i}
                href={card.href}
                className="group p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60">
                      {card.tag}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-amber-400">
                  <span>{card.action}</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
