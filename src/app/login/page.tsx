'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        setMessage({
          type: 'error',
          text: data.error || 'Login gagal. Periksa kembali email dan kata sandi Anda.'
        });
        return;
      }

      // Save logged-in user in localStorage
      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem('bpkp_auth_user', JSON.stringify(data.user));
      }

      setIsLoading(false);
      setMessage({
        type: 'success',
        text: `Login berhasil! Selamat datang, ${data.user.name}. Mengalihkan...`
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      setMessage({
        type: 'error',
        text: 'Terjadi kesalahan saat menghubungkan ke server.'
      });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-xl">
        {/* Header Title */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center mb-3 text-amber-400">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Masuk ke Akun Anda
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            Masukkan email dan kata sandi untuk mengakses portal BPKP Jawa Barat.
          </p>
        </div>

        {/* Alert Message */}
        {message && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
              message.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/50 border-rose-800 text-rose-300'
            }`}
          >
            <CheckCircleIcon className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Form Login */}
        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Alamat Email
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
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LockClosedIcon className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-400">
                Ingat saya
              </label>
            </div>
            <span className="text-[11px] text-slate-500">Koneksi Aman SSL</span>
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
                <span>Masuk</span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register footer link */}
        <div className="text-center pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Belum memiliki akun?{' '}
            <Link
              href="/register"
              className="font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
