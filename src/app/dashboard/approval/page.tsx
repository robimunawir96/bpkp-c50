'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheckIcon,
  UserPlusIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon,
  SparklesIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Modal, AlertMessage } from '@/components/common';

interface RegistrationItem {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  bidang?: string;
  bidangSingkatan?: string | null;
  bidangId?: string;
  role: 'ADMIN' | 'PEGAWAI';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface ResetPasswordItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userBidang?: string;
  userRole: 'ADMIN' | 'PEGAWAI';
  email: string;
  newPassword?: string | null;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string | null;
  createdAt: string;
}

export default function ApprovalDashboardPage() {
  const [activeTab, setActiveTab] = useState<'register' | 'reset-password'>('register');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'ALL' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Data states
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [resetRequests, setResetRequests] = useState<ResetPasswordItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Action Modals
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'approve-reg' | 'reject-reg' | 'approve-reset' | 'reject-reset';
    item: any;
    customPassword?: string;
    adminNotes?: string;
  }>({
    isOpen: false,
    type: 'approve-reg',
    item: null,
    customPassword: '',
    adminNotes: ''
  });

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch Registrations
  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/approval/registrations?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setRegistrations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  // Fetch Reset Requests
  const fetchResetRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/approval/reset-password?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setResetRequests(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching reset requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (activeTab === 'register') {
      fetchRegistrations();
    } else {
      fetchResetRequests();
    }
  }, [activeTab, fetchRegistrations, fetchResetRequests]);

  // Calculate pending counts
  const pendingRegCount = useMemo(() => {
    return registrations.filter((r) => r.status === 'PENDING').length;
  }, [registrations]);

  const pendingResetCount = useMemo(() => {
    return resetRequests.filter((r) => r.status === 'PENDING').length;
  }, [resetRequests]);

  // Handle Approve / Reject Registration
  const handleProcessRegistration = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/approval/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(
          status === 'APPROVED'
            ? 'Akun pendaftaran berhasil disetujui!'
            : 'Pendaftaran akun telah ditolak.'
        );
        fetchRegistrations();
      } else {
        showNotification(data.error || 'Gagal memproses persetujuan.', 'error');
      }
    } catch (err) {
      console.error('Error processing registration approval:', err);
      showNotification('Terjadi kesalahan koneksi server.', 'error');
    } finally {
      setConfirmModal({ isOpen: false, type: 'approve-reg', item: null });
    }
  };

  // Handle Approve / Reject Reset Password
  const handleProcessResetPassword = async (
    id: string,
    status: 'APPROVED' | 'REJECTED',
    generatedPassword?: string,
    adminNotes?: string
  ) => {
    try {
      const res = await fetch('/api/approval/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          generatedPassword: generatedPassword || undefined,
          adminNotes: adminNotes || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(
          status === 'APPROVED'
            ? 'Permohonan reset kata sandi disetujui dan kata sandi baru telah aktif.'
            : 'Permohonan reset kata sandi telah ditolak.'
        );
        fetchResetRequests();
      } else {
        showNotification(data.error || 'Gagal memproses reset kata sandi.', 'error');
      }
    } catch (err) {
      console.error('Error processing reset approval:', err);
      showNotification('Terjadi kesalahan koneksi server.', 'error');
    } finally {
      setConfirmModal({ isOpen: false, type: 'approve-reset', item: null });
    }
  };

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return registrations.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.bidang?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q)
    );
  }, [registrations, searchQuery]);

  // Filtered reset requests
  const filteredResetRequests = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return resetRequests.filter(
      (r) =>
        r.userName?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.userBidang?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q)
    );
  }, [resetRequests, searchQuery]);

  return (
    <div className="space-y-6 w-full">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/95 to-amber-950/20 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold tracking-wide mb-1.5">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Pusat Verifikasi & Keamanan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Persetujuan Akun & Reset Kata Sandi
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Kelola dan tinjau persetujuan pendaftaran akun pegawai baru serta permohonan pemulihan kata sandi portal BPKP Jabar.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'register') fetchRegistrations();
            else fetchResetRequests();
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all self-start sm:self-auto"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* 2. Notification */}
      {notification && (
        <AlertMessage
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* 3. Tab Navigation & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserPlusIcon className="w-4 h-4" />
            <span>Persetujuan Registrasi</span>
            {pendingRegCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                {pendingRegCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reset-password')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reset-password'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <KeyIcon className="w-4 h-4" />
            <span>Permohonan Reset Sandi</span>
            {pendingResetCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                {pendingResetCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter & Search */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="PENDING">Status: Menunggu Persetujuan (Pending)</option>
              <option value="APPROVED">Status: Disetujui (Approved)</option>
              <option value="REJECTED">Status: Ditolak (Rejected)</option>
              <option value="ALL">Semua Status</option>
            </select>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, bidang..."
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-44 sm:w-56"
          />
        </div>
      </div>

      {/* 4. Content Tab: Register Approvals */}
      {activeTab === 'register' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-14 text-center">No</th>
                  <th className="px-6 py-4">Nama Pegawai & Email</th>
                  <th className="px-6 py-4">Bidang Kerja</th>
                  <th className="px-6 py-4">Tgl Registrasi</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right w-44">Aksi Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRegistrations.map((user, idx) => {
                  const isPending = user.status === 'PENDING';
                  const isApproved = user.status === 'APPROVED';
                  const isRejected = user.status === 'REJECTED';

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-slate-400">{idx + 1}</td>

                      {/* Nama & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-xs sm:text-sm">{user.name}</p>
                            <p className="text-[11px] text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Bidang Kerja */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <BuildingOffice2Icon className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>
                            {user.bidang && user.bidang !== '-' ? (
                              user.bidangSingkatan ? (
                                `${user.bidang} (${user.bidangSingkatan})`
                              ) : (
                                user.bidang
                              )
                            ) : (
                              'Belum Ditentukan'
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Tgl Registrasi */}
                      <td className="px-6 py-4 text-slate-400 text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {isPending && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                            <ClockIcon className="w-4 h-4 shrink-0" />
                            <span>Menunggu Approval</span>
                          </div>
                        )}
                        {isApproved && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                            <CheckCircleIcon className="w-4 h-4 shrink-0" />
                            <span>Disetujui</span>
                          </div>
                        )}
                        {isRejected && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                            <XCircleIcon className="w-4 h-4 shrink-0" />
                            <span>Ditolak</span>
                          </div>
                        )}
                      </td>

                      {/* Tombol Aksi */}
                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  type: 'approve-reg',
                                  item: user
                                })
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center gap-1"
                              title="Setujui pendaftaran akun"
                            >
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  type: 'reject-reg',
                                  item: user
                                })
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 transition-colors flex items-center gap-1"
                              title="Tolak pendaftaran akun"
                            >
                              <XCircleIcon className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {isRejected && (
                              <button
                                onClick={() =>
                                  setConfirmModal({
                                    isOpen: true,
                                    type: 'approve-reg',
                                    item: user
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800 hover:bg-emerald-900/60 transition-colors"
                              >
                                Pulihkan & Setujui
                              </button>
                            )}
                            {isApproved && (
                              <span className="text-[11px] text-slate-500 italic">Sudah aktif</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredRegistrations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <ClockIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <span>
                        {statusFilter === 'PENDING'
                          ? 'Tidak ada antrean pendaftaran yang menunggu persetujuan.'
                          : 'Tidak ada data pendaftaran yang sesuai dengan filter.'}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Content Tab: Reset Password Requests */}
      {activeTab === 'reset-password' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-14 text-center">No</th>
                  <th className="px-6 py-4">Pegawai / Pemohon</th>
                  <th className="px-6 py-4">Alasan / Catatan</th>
                  <th className="px-6 py-4">Tgl Pengajuan</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right w-44">Aksi Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredResetRequests.map((req, idx) => {
                  const isPending = req.status === 'PENDING';
                  const isApproved = req.status === 'APPROVED';
                  const isRejected = req.status === 'REJECTED';

                  return (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-slate-400">{idx + 1}</td>

                      {/* Pemohon */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <KeyIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-white text-xs sm:text-sm">{req.userName}</p>
                            <p className="text-[11px] text-slate-400">{req.email}</p>
                            <p className="text-[10px] text-slate-500">{req.userBidang}</p>
                          </div>
                        </div>
                      </td>

                      {/* Alasan */}
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-300">{req.reason || 'Lupa kata sandi akun'}</p>
                        {req.newPassword && (
                          <p className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                            *Meminta sandi baru
                          </p>
                        )}
                        {req.adminNotes && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">
                            Catatan Admin: {req.adminNotes}
                          </p>
                        )}
                      </td>

                      {/* Tgl Pengajuan */}
                      <td className="px-6 py-4 text-slate-400 text-[11px]">
                        {new Date(req.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {isPending && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                            <ClockIcon className="w-4 h-4 shrink-0" />
                            <span>Menunggu Approval</span>
                          </div>
                        )}
                        {isApproved && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                            <CheckCircleIcon className="w-4 h-4 shrink-0" />
                            <span>Sandi Direset</span>
                          </div>
                        )}
                        {isRejected && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                            <XCircleIcon className="w-4 h-4 shrink-0" />
                            <span>Permohonan Ditolak</span>
                          </div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  type: 'approve-reset',
                                  item: req,
                                  customPassword: req.newPassword || '12345678'
                                })
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-1 shadow-sm"
                              title="Setujui reset kata sandi"
                            >
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  type: 'reject-reset',
                                  item: req,
                                  adminNotes: ''
                                })
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 transition-colors flex items-center gap-1"
                              title="Tolak permohonan reset"
                            >
                              <XCircleIcon className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Selesai diproses</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredResetRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <KeyIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <span>
                        {statusFilter === 'PENDING'
                          ? 'Tidak ada permohonan reset kata sandi yang pending.'
                          : 'Tidak ada data permohonan yang cocok dengan pencarian.'}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Modal Konfirmasi & Pemrosesan */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-amber-400" />
            <span>
              {confirmModal.type === 'approve-reg' && 'Konfirmasi Persetujuan Akun'}
              {confirmModal.type === 'reject-reg' && 'Konfirmasi Penolakan Akun'}
              {confirmModal.type === 'approve-reset' && 'Setujui Reset Kata Sandi'}
              {confirmModal.type === 'reject-reset' && 'Tolak Permohonan Reset Sandi'}
            </span>
          </div>
        }
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Detail Item Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Nama Pegawai:</span>
              <span className="text-xs font-bold text-white">
                {confirmModal.item?.name || confirmModal.item?.userName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Alamat Email:</span>
              <span className="text-xs font-mono text-amber-400">{confirmModal.item?.email}</span>
            </div>
            {confirmModal.item?.bidang && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Bidang Unit:</span>
                <span className="text-xs text-slate-300">{confirmModal.item?.bidang}</span>
              </div>
            )}
          </div>

          {/* Form khusus Approve Reset Password */}
          {confirmModal.type === 'approve-reset' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kata Sandi Baru yang Akan Diberikan:
                </label>
                <input
                  type="text"
                  value={confirmModal.customPassword}
                  onChange={(e) =>
                    setConfirmModal({ ...confirmModal, customPassword: e.target.value })
                  }
                  placeholder="Masukkan kata sandi baru"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Kata sandi akun pengguna ini akan segera diubah ke kata sandi di atas.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Admin (Opsional):
                </label>
                <input
                  type="text"
                  value={confirmModal.adminNotes}
                  onChange={(e) =>
                    setConfirmModal({ ...confirmModal, adminNotes: e.target.value })
                  }
                  placeholder="Disetujui oleh Admin Helpdesk"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Form khusus Reject Reset Password */}
          {confirmModal.type === 'reject-reset' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alasan Penolakan (Opsional):
              </label>
              <textarea
                rows={2}
                value={confirmModal.adminNotes}
                onChange={(e) =>
                  setConfirmModal({ ...confirmModal, adminNotes: e.target.value })
                }
                placeholder="Contoh: Identitas email tidak valid / konfirmasi langsung ke bidang TU"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {/* Prompt Message */}
          {confirmModal.type === 'approve-reg' && (
            <p className="text-xs text-slate-300 leading-relaxed">
              Setelah disetujui, pegawai ini akan memiliki hak akses penuh untuk masuk ke dalam portal
              BPKP Jawa Barat dengan akun dan perannya.
            </p>
          )}

          {confirmModal.type === 'reject-reg' && (
            <p className="text-xs text-rose-300 leading-relaxed">
              Apakah Anda yakin ingin menolak pendaftaran akun ini? Pengguna tidak akan dapat masuk ke sistem.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>

            {confirmModal.type === 'approve-reg' && (
              <button
                type="button"
                onClick={() => handleProcessRegistration(confirmModal.item.id, 'APPROVED')}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-md"
              >
                Ya, Setujui Akun
              </button>
            )}

            {confirmModal.type === 'reject-reg' && (
              <button
                type="button"
                onClick={() => handleProcessRegistration(confirmModal.item.id, 'REJECTED')}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md"
              >
                Tolak Pendaftaran
              </button>
            )}

            {confirmModal.type === 'approve-reset' && (
              <button
                type="button"
                onClick={() =>
                  handleProcessResetPassword(
                    confirmModal.item.id,
                    'APPROVED',
                    confirmModal.customPassword,
                    confirmModal.adminNotes
                  )
                }
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-md"
              >
                Setujui & Terapkan Sandi
              </button>
            )}

            {confirmModal.type === 'reject-reset' && (
              <button
                type="button"
                onClick={() =>
                  handleProcessResetPassword(
                    confirmModal.item.id,
                    'REJECTED',
                    undefined,
                    confirmModal.adminNotes
                  )
                }
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md"
              >
                Tolak Permohonan
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
