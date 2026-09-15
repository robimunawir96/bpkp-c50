'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  EnvelopeIcon,
  UserIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  BuildingOffice2Icon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    bidangId: '',
    bidang: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [bidangOptions, setBidangOptions] = useState<Array<{ id: string; nama: string; singkatan?: string | null }>>([]);
  const [isLoadingBidang, setIsLoadingBidang] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch daftar bidang langsung dari database
  React.useEffect(() => {
    fetch('/api/bidang')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setBidangOptions(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load bidang from database:', err);
      })
      .finally(() => {
        setIsLoadingBidang(false);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg('Kata sandi minimal harus 8 karakter.');
      return;
    }

    setIsLoading(true);

    const selectedBidang = bidangOptions.find((b) => b.id === formData.bidangId);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          bidangId: formData.bidangId || undefined,
          bidang: selectedBidang ? selectedBidang.nama : formData.bidang,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Pendaftaran gagal. Silakan coba lagi.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSuccess(true);
    } catch (err) {
      console.error('Registration network error:', err);
      setErrorMsg('Terjadi kesalahan jaringan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center mb-3 text-amber-400">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Daftar Akun Baru
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 max-w-sm mx-auto">
            Buat akun untuk mengakses layanan portal resmi BPKP Jawa Barat.
          </p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-amber-300">Pendaftaran Berhasil Diajukan</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Akun Anda atas nama <strong>{formData.fullName}</strong> ({formData.email}) untuk bidang{' '}
              <strong className="text-amber-400">
                {bidangOptions.find((b) => b.id === formData.bidangId)?.nama || formData.bidang || 'BPKP'}
              </strong>{' '}
              telah berhasil terdaftar dalam sistem.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 text-left space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Menunggu Persetujuan (Pending Approval)</span>
              </div>
              <p className="text-slate-400">
                Untuk alasan keamanan, akun baru Anda akan ditinjau dan disetujui terlebih dahulu oleh Administrator BPKP Jawa Barat sebelum dapat digunakan untuk masuk (login).
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
              >
                <span>Halaman Masuk</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleRegister}>
            {errorMsg && (
              <div className="p-3 rounded-lg text-xs bg-rose-950/60 border border-rose-800 text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nama Lengkap Anda"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Bidang */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Bidang / Unit Kerja <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <BuildingOffice2Icon className="w-4 h-4" />
                </div>
                <select
                  required
                  name="bidangId"
                  value={formData.bidangId}
                  onChange={handleChange}
                  disabled={isLoadingBidang}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-500">
                    {isLoadingBidang ? 'Memuat daftar bidang...' : '-- Pilih Bidang / Unit Kerja --'}
                  </option>
                  {bidangOptions.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                      {b.singkatan ? `${b.nama} (${b.singkatan})` : b.nama}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <EnvelopeIcon className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <LockClosedIcon className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 karakter"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <LockClosedIcon className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi kata sandi"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                required
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="h-4 w-4 mt-0.5 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="agreeTerms" className="ml-2 block text-xs text-slate-400 leading-tight">
                Saya menyetujui syarat dan ketentuan penggunaan portal BPKP Jawa Barat.
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Daftar Akun</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Login footer link */}
        <div className="text-center pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Sudah memiliki akun?{' '}
            <Link
              href="/login"
              className="font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2"
            >
              Masuk Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
