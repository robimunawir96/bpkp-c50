'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  KeyIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword && newPassword.length < 8) {
      setErrorMsg('Kata sandi baru minimal harus 8 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          newPassword: newPassword || undefined,
          reason: reason.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal mengajukan reset kata sandi.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSent(true);
    } catch (err) {
      console.error('Password reset request error:', err);
      setErrorMsg('Terjadi kesalahan koneksi server.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-xl">
        {/* Header Title */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center mb-3 text-amber-400">
            <KeyIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Pemulihan Kata Sandi
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            Ajukan permohonan reset kata sandi akun portal BPKP Jawa Barat untuk ditinjau oleh Administrator.
          </p>
        </div>

        {isSent ? (
          <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-amber-300">Permohonan Terkirim</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Permohonan reset kata sandi untuk email <span className="font-semibold text-white">{email}</span> telah masuk ke sistem dan sedang menunggu persetujuan (approval) Administrator.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 text-left">
              Setelah disetujui oleh Admin, kata sandi baru Anda akan langsung aktif dan dapat digunakan untuk masuk.
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Kembali ke Halaman Masuk</span>
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="p-3 rounded-lg text-xs bg-rose-950/60 border border-rose-800 text-rose-300">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Alamat Email Terdaftar <span className="text-rose-400">*</span>
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <EnvelopeIcon className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@bpkp.go.id / opd@jabarprov.go.id"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kata Sandi Baru yang Diinginkan <span className="text-slate-500 font-normal">(Opsional)</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 karakter (jika ingin request sandi)"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Alasan / Keterangan <span className="text-slate-500 font-normal">(Opsional)</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Lupa password akun pegawai bidang IPP"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
              />
            </div>

            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 flex items-start gap-2.5 text-xs text-blue-300">
              <InformationCircleIcon className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Permohonan ini akan diverifikasi oleh Administrator sistem sebelum akses akun dipulihkan.
              </p>
            </div>

            <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors disabled:opacity-50"
          >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ajukan Reset Kata Sandi</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-4 border-t border-slate-800 flex justify-center items-center gap-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
