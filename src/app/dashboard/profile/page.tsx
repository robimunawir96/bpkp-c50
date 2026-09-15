'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  KeyIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { AlertMessage } from '@/components/common';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  bidang?: string;
  bidangSingkatan?: string | null;
  bidangId?: string;
  role: 'ADMIN' | 'PEGAWAI';
  avatarUrl?: string;
  createdAt?: string;
}

interface BidangOption {
  id: string;
  nama: string;
  singkatan?: string | null;
}

export default function ProfilePage() {
  // Tab State: 'info' (Data Diri & Akun) | 'password' (Ganti Kata Sandi)
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bidangOptions, setBidangOptions] = useState<BidangOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form Tab 1: Info Profile
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bidangId, setBidangId] = useState('');

  // Form Tab 2: Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // Load user session & fetch full profile
  useEffect(() => {
    let activeEmail = 'admin.jabar@bpkp.go.id';
    let activeId = '';

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bpkp_auth_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.email) activeEmail = parsed.email;
          if (parsed.id) activeId = parsed.id;
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Fetch Bidang Options
    fetch('/api/bidang')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setBidangOptions(data);
      })
      .catch((err) => console.error('Failed to load bidang:', err));

    // Fetch Profile
    const fetchUrl = activeId
      ? `/api/auth/profile?id=${activeId}`
      : `/api/auth/profile?email=${encodeURIComponent(activeEmail)}`;

    fetch(fetchUrl)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('User profile not found');
      })
      .then((data) => {
        setProfile(data);
        setName(data.name || '');
        setEmail(data.email || '');
        setPhoneNumber(data.phoneNumber || '');
        setBidangId(data.bidangId || '');
      })
      .catch(() => {
        // Fallback default admin profile
        const fallback: UserProfile = {
          id: 'admin-fallback',
          name: 'Administrator',
          email: activeEmail,
          phoneNumber: '081234567890',
          bidang: 'Bagian Tata Usaha',
          role: 'ADMIN'
        };
        setProfile(fallback);
        setName(fallback.name);
        setEmail(fallback.email);
        setPhoneNumber(fallback.phoneNumber || '');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Handle Update Data Profil (Tab 1)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNotification({ message: 'Nama lengkap tidak boleh kosong.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile?.id,
          email: email.trim(),
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
          bidangId: bidangId || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setNotification({
          message: data.error || 'Gagal menyimpan data profil.',
          type: 'error'
        });
        setIsSaving(false);
        return;
      }

      setProfile(data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bpkp_auth_user', JSON.stringify(data.user));
      }

      setNotification({
        message: 'Informasi profil pegawai berhasil diperbarui!',
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
      setNotification({
        message: 'Terjadi kesalahan koneksi server.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Update Kata Sandi (Tab 2)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!oldPassword) {
      setNotification({ message: 'Kata sandi saat ini wajib diisi.', type: 'error' });
      return;
    }

    if (!newPassword) {
      setNotification({ message: 'Kata sandi baru tidak boleh kosong.', type: 'error' });
      return;
    }

    if (newPassword.length < 8) {
      setNotification({
        message: 'Kata sandi baru minimal harus 8 karakter.',
        type: 'error'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotification({
        message: 'Konfirmasi kata sandi baru tidak cocok.',
        type: 'error'
      });
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile?.id,
          email: profile?.email || email.trim(),
          oldPassword,
          newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setNotification({
          message: data.error || 'Gagal mengubah kata sandi.',
          type: 'error'
        });
        setIsSaving(false);
        return;
      }

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setNotification({
        message: 'Kata sandi akun Anda berhasil diperbarui dengan aman!',
        type: 'success'
      });
    } catch (err) {
      console.error('Change password failed:', err);
      setNotification({
        message: 'Terjadi kesalahan koneksi server.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-slate-400 text-xs">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Memuat data profil pengguna...</span>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === 'ADMIN';

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* 1. Header Banner Profil */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/95 to-amber-950/20 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <div
                className={`w-16 sm:w-20 h-16 sm:h-20 rounded-2xl flex items-center justify-center font-extrabold text-2xl sm:text-3xl border shadow-xl ${
                  isAdmin
                    ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                }`}
              >
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 p-1 bg-slate-950 rounded-full">
                <span className="block w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{name}</h1>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
                  <ShieldCheckIcon className={`w-4 h-4 shrink-0 ${isAdmin ? 'text-amber-400' : 'text-blue-400'}`} />
                  <span className={isAdmin ? 'text-amber-300' : 'text-blue-300'}>{profile?.role}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">{email}</p>
              <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-1.5">
                <BuildingOffice2Icon className="w-4 h-4 text-slate-400" />
                <span>
                  {profile?.bidang
                    ? profile.bidangSingkatan
                      ? `${profile.bidang} (${profile.bidangSingkatan})`
                      : profile.bidang
                    : 'Perwakilan BPKP Provinsi Jawa Barat'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Notification */}
      {notification && (
        <AlertMessage
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* 3. Tab Bar Navigasi (Data Profil vs Ganti Kata Sandi) */}
      <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-2 rounded-2xl">
        <button
          onClick={() => {
            setActiveTab('info');
            setNotification(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'info'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserCircleIcon className="w-4 h-4" />
          <span>Informasi Profil</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('password');
            setNotification(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'password'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <KeyIcon className="w-4 h-4" />
          <span>Ganti Kata Sandi</span>
        </button>
      </div>

      {/* 4. TAB 1: FORM EDIT INFORMASI PROFIL */}
      {activeTab === 'info' && (
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur-md space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <UserCircleIcon className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Edit Data Pegawai</h2>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Lengkap & Gelar <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <UserCircleIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Robi Munawir, S.Ak."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Email & Nomor Telepon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alamat Email (Identitas Login)
                </label>
                <div className="relative">
                  <EnvelopeIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 cursor-not-allowed font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  *Alamat email terdaftar dan terikat pada akun
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nomor Kontak / WhatsApp
                </label>
                <div className="relative">
                  <PhoneIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="08123456789"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Unit Bidang Kerja */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bidang Kerja / Unit Pengawasan
              </label>
              <div className="relative">
                <BuildingOffice2Icon className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={bidangId}
                  onChange={(e) => setBidangId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    -- Pilih Unit Bidang Kerja --
                  </option>
                  {bidangOptions.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                      {b.singkatan ? `${b.nama} (${b.singkatan})` : b.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg hover:shadow-amber-400/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    <span>Simpan Perubahan Profil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 5. TAB 2: FORM GANTI KATA SANDI */}
      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur-md space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <KeyIcon className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Ubah Kata Sandi Akun</h2>
            </div>

            {/* Akun Aktif */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Akun Pengguna:</span>
              <span className="font-mono font-semibold text-amber-400">{email}</span>
            </div>

            {/* Password Lama */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kata Sandi Saat Ini <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <LockClosedIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama Anda"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Password Baru */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kata Sandi Baru <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <LockClosedIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Konfirmasi Password Baru */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Konfirmasi Kata Sandi Baru <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <LockClosedIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
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

            {/* Tips Keamanan */}
            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 flex items-start gap-2.5 text-xs text-blue-300">
              <InformationCircleIcon className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk membuat kata sandi yang aman.
              </p>
            </div>

            {/* Action Save Button Password */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg hover:shadow-amber-400/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Simpan Kata Sandi Baru</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
