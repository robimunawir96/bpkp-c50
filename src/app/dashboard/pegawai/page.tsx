'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserGroupIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  UserPlusIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  PageHeader,
  SearchInput,
  AlertMessage,
  Modal,
  DeleteConfirmModal,
  ActionButtons
} from '@/components/common';
import { useDataManager } from '@/lib/useDataManager';

interface PegawaiItem {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  bidang?: string;
  bidangSingkatan?: string | null;
  bidangId?: string;
  role: 'ADMIN' | 'PEGAWAI';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
}

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

interface BidangOption {
  id: string;
  nama: string;
  singkatan?: string | null;
}

const defaultPegawai: PegawaiItem[] = [];

export default function PegawaiPage() {
  // Main Tab State
  const [activeTab, setActiveTab] = useState<'pegawai' | 'registrasi' | 'reset-password'>('pegawai');

  // --- TAB 1: PEGAWAI DATA ---
  const {
    data: pegawaiList,
    searchQuery,
    setSearchQuery,
    isFormOpen,
    editingItem,
    detailItem,
    deletingItem,
    notification,
    setNotification,
    openAdd,
    openEdit,
    openDetail,
    openDelete,
    closeForm,
    closeDetail,
    closeDelete,
    saveItem,
    deleteItem,
    refreshData: refreshPegawai
  } = useDataManager<PegawaiItem>({
    storageKey: 'bpkp_pegawai_data',
    initialData: defaultPegawai,
    apiEndpoint: '/api/pegawai',
    getItemTitle: (item) => item.name || item.email
  });

  const [bidangOptions, setBidangOptions] = useState<BidangOption[]>([]);

  // Form State Pegawai
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    bidangId: '',
    bidang: '',
    role: 'PEGAWAI' as 'ADMIN' | 'PEGAWAI',
    password: ''
  });

  // --- TAB 2 & 3: APPROVAL STATES ---
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [resetRequests, setResetRequests] = useState<ResetPasswordItem[]>([]);
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<'PENDING' | 'ALL' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);

  // Approval Confirm Modal
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

  // Fetch Bidang Options
  useEffect(() => {
    fetch('/api/bidang')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setBidangOptions(data);
      })
      .catch((err) => console.error('Error fetching bidang:', err));
  }, []);

  // Sync Form Data when Editing Pegawai
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        email: editingItem.email || '',
        phoneNumber: editingItem.phoneNumber !== '-' ? editingItem.phoneNumber || '' : '',
        bidangId: editingItem.bidangId || '',
        bidang: editingItem.bidang !== '-' ? editingItem.bidang || '' : '',
        role: editingItem.role || 'PEGAWAI',
        password: ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        bidangId: '',
        bidang: '',
        role: 'PEGAWAI',
        password: ''
      });
    }
  }, [editingItem, isFormOpen]);

  // Fetch Registrations
  const fetchRegistrations = useCallback(async () => {
    setIsApprovalLoading(true);
    try {
      const res = await fetch(`/api/approval/registrations?status=${approvalStatusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setRegistrations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setIsApprovalLoading(false);
    }
  }, [approvalStatusFilter]);

  // Fetch Reset Requests
  const fetchResetRequests = useCallback(async () => {
    setIsApprovalLoading(true);
    try {
      const res = await fetch(`/api/approval/reset-password?status=${approvalStatusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setResetRequests(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching reset requests:', err);
    } finally {
      setIsApprovalLoading(false);
    }
  }, [approvalStatusFilter]);

  // Load Approval data on tab or filter change
  useEffect(() => {
    if (activeTab === 'registrasi') {
      fetchRegistrations();
    } else if (activeTab === 'reset-password') {
      fetchResetRequests();
    }
  }, [activeTab, fetchRegistrations, fetchResetRequests]);

  // Pending counts
  const pendingRegCount = useMemo(() => {
    return registrations.filter((r) => r.status === 'PENDING').length;
  }, [registrations]);

  const pendingResetCount = useMemo(() => {
    return resetRequests.filter((r) => r.status === 'PENDING').length;
  }, [resetRequests]);

  // Handle Pegawai Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    const selectedBidang = bidangOptions.find((b) => b.id === formData.bidangId);

    const payload: Omit<PegawaiItem, 'id'> & { password?: string; status?: string } = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim() || '-',
      bidangId: formData.bidangId,
      bidang: selectedBidang ? selectedBidang.nama : formData.bidang,
      role: formData.role,
      status: 'APPROVED'
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    saveItem(payload as any, editingItem ? editingItem.id : undefined);
  };

  // Handle Process Registration Approval
  const handleProcessRegistration = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/approval/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          message: status === 'APPROVED' ? 'Pendaftaran pegawai berhasil disetujui!' : 'Pendaftaran pegawai telah ditolak.',
          type: 'success'
        });
        fetchRegistrations();
        refreshPegawai();
      } else {
        setNotification({
          message: data.error || 'Gagal memproses persetujuan.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error processing registration approval:', err);
      setNotification({ message: 'Terjadi kesalahan koneksi server.', type: 'error' });
    } finally {
      setConfirmModal({ isOpen: false, type: 'approve-reg', item: null });
    }
  };

  // Handle Process Reset Password
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
        setNotification({
          message:
            status === 'APPROVED'
              ? 'Permohonan reset kata sandi disetujui & kata sandi baru aktif.'
              : 'Permohonan reset kata sandi ditolak.',
          type: 'success'
        });
        fetchResetRequests();
      } else {
        setNotification({ message: data.error || 'Gagal memproses reset kata sandi.', type: 'error' });
      }
    } catch (err) {
      console.error('Error processing reset approval:', err);
      setNotification({ message: 'Terjadi kesalahan koneksi server.', type: 'error' });
    } finally {
      setConfirmModal({ isOpen: false, type: 'approve-reset', item: null });
    }
  };

  // Filter lists
  const filteredPegawai = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return pegawaiList.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.phoneNumber && p.phoneNumber.toLowerCase().includes(q)) ||
        (p.bidang && p.bidang.toLowerCase().includes(q)) ||
        (p.bidangSingkatan && p.bidangSingkatan.toLowerCase().includes(q)) ||
        (p.role && p.role.toLowerCase().includes(q))
    );
  }, [pegawaiList, searchQuery]);

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
      {/* 1. Page Header */}
      <PageHeader
        badgeText="Manajemen Kepegawaian & Akses"
        title="Daftar Pegawai & Persetujuan"
        description="Kelola direktori data pegawai BPKP Jabar, validasi persetujuan pendaftaran akun baru, serta penanganan permohonan reset kata sandi."
        addButtonLabel={activeTab === 'pegawai' ? '+ Tambah Pegawai' : undefined}
        onAddClick={activeTab === 'pegawai' ? openAdd : undefined}
      />

      {/* 2. Alert Notification */}
      {notification && (
        <AlertMessage
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab 1: Pegawai */}
          <button
            onClick={() => {
              setActiveTab('pegawai');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pegawai'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserGroupIcon className="w-4 h-4" />
            <span>Daftar Pegawai</span>
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'pegawai' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}>
              {pegawaiList.length}
            </span>
          </button>

          {/* Tab 2: Registrasi */}
          <button
            onClick={() => {
              setActiveTab('registrasi');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'registrasi'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserPlusIcon className="w-4 h-4" />
            <span>Persetujuan Registrasi</span>
            {pendingRegCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                {pendingRegCount}
              </span>
            )}
          </button>

          {/* Tab 3: Reset Password */}
          <button
            onClick={() => {
              setActiveTab('reset-password');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reset-password'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <KeyIcon className="w-4 h-4" />
            <span>Persetujuan Reset Sandi</span>
            {pendingResetCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                {pendingResetCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab-specific Controls (Filter & Refresh) */}
        {activeTab !== 'pegawai' && (
          <div className="flex items-center gap-2">
            <select
              value={approvalStatusFilter}
              onChange={(e) => setApprovalStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="PENDING">Status: Menunggu Persetujuan</option>
              <option value="APPROVED">Status: Disetujui</option>
              <option value="REJECTED">Status: Ditolak</option>
              <option value="ALL">Semua Status</option>
            </select>
            <button
              onClick={() => {
                if (activeTab === 'registrasi') fetchRegistrations();
                else fetchResetRequests();
              }}
              disabled={isApprovalLoading}
              title="Segarkan Data"
              className="p-2 bg-slate-950 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isApprovalLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* 4. Search Filter Input */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={
          activeTab === 'pegawai'
            ? 'Cari nama pegawai, email, no HP, bidang, atau role...'
            : activeTab === 'registrasi'
            ? 'Cari nama pendaftar, email, bidang kerja...'
            : 'Cari pemohon reset sandi, email, atau alasan...'
        }
      />

      {/* ========================================================================= */}
      {/* TAB 1: DAFTAR PEGAWAI */}
      {/* ========================================================================= */}
      {activeTab === 'pegawai' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">No</th>
                  <th className="px-6 py-4">Nama Pegawai & Email</th>
                  <th className="px-6 py-4">Kontak / No. HP</th>
                  <th className="px-6 py-4">Bidang Kerja</th>
                  <th className="px-6 py-4 text-center">Role</th>
                  <th className="px-6 py-4 text-right w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredPegawai.map((pegawai, index) => {
                  const isAdmin = pegawai.role === 'ADMIN';

                  return (
                    <tr key={pegawai.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-slate-400">{index + 1}</td>

                      {/* Nama & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                              isAdmin
                                ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            }`}
                          >
                            {pegawai.name ? pegawai.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-xs sm:text-sm truncate">
                              {pegawai.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate font-mono">{pegawai.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* No HP */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                          <PhoneIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{pegawai.phoneNumber || '-'}</span>
                        </div>
                      </td>

                      {/* Bidang Kerja */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <BuildingOffice2Icon className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[220px]">
                            {pegawai.bidang && pegawai.bidang !== '-' ? (
                              pegawai.bidangSingkatan ? (
                                `${pegawai.bidang} (${pegawai.bidangSingkatan})`
                              ) : (
                                pegawai.bidang
                              )
                            ) : (
                              'Belum Ditentukan'
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          {isAdmin ? (
                            <>
                              <ShieldCheckIcon className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="text-amber-300">{pegawai.role}</span>
                            </>
                          ) : (
                            <>
                              <UserIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className="text-emerald-300">{pegawai.role}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4 text-right">
                        <ActionButtons
                          onShow={() => openDetail(pegawai)}
                          onEdit={() => openEdit(pegawai)}
                          onDelete={() => openDelete(pegawai)}
                          showTitle="Lihat Detail Pegawai"
                          editTitle="Edit Data Pegawai"
                          deleteTitle="Hapus Pegawai"
                        />
                      </td>
                    </tr>
                  );
                })}

                {filteredPegawai.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      <UserGroupIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <span>Tidak ditemukan data pegawai yang cocok dengan pencarian &quot;{searchQuery}&quot;</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PERSETUJUAN REGISTRASI */}
      {/* ========================================================================= */}
      {activeTab === 'registrasi' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
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
                            <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Bidang */}
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

                      {/* Aksi */}
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
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center gap-1 shadow-sm"
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
                        {approvalStatusFilter === 'PENDING'
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

      {/* ========================================================================= */}
      {/* TAB 3: PERSETUJUAN RESET PASSWORD */}
      {/* ========================================================================= */}
      {activeTab === 'reset-password' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-14 text-center">No</th>
                  <th className="px-6 py-4">Pegawai / Pemohon</th>
                  <th className="px-6 py-4">Alasan / Permohonan</th>
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
                            <p className="text-[11px] text-slate-400 font-mono">{req.email}</p>
                            <p className="text-[10px] text-slate-500">{req.userBidang}</p>
                          </div>
                        </div>
                      </td>

                      {/* Alasan */}
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-300">{req.reason || 'Lupa kata sandi akun'}</p>
                        {req.newPassword && (
                          <p className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                            *Meminta perubahan sandi
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
                        {approvalStatusFilter === 'PENDING'
                          ? 'Tidak ada permohonan reset kata sandi yang pending.'
                          : 'Tidak ada data permohonan yang sesuai filter.'}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL TAMBAH / EDIT PEGAWAI */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-amber-400" />
            <span>{editingItem ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}</span>
          </div>
        }
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nama Lengkap <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Robi Munawir, S.Ak."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Alamat Email <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <EnvelopeIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="pegawai@bpkp.go.id"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {editingItem ? 'Kata Sandi Baru (Opsional)' : 'Kata Sandi Akun'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingItem ? 'Kosongkan jika tidak diubah' : 'Min. 8 karakter'}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nomor Telepon / HP <span className="text-slate-500 font-normal">(Opsional)</span>
            </label>
            <div className="relative">
              <PhoneIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="08123456789"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bidang Kerja
              </label>
              <select
                value={formData.bidangId}
                onChange={(e) => setFormData({ ...formData, bidangId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-400">
                  -- Pilih Unit Bidang --
                </option>
                {bidangOptions.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                    {b.singkatan ? `${b.nama} (${b.singkatan})` : b.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hak Akses (Role) <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'PEGAWAI' })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-semibold cursor-pointer"
              >
                <option value="PEGAWAI" className="bg-slate-900 text-emerald-400">
                  PEGAWAI (Default)
                </option>
                <option value="ADMIN" className="bg-slate-900 text-amber-400">
                  ADMIN (Administrator Sistem)
                </option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-md"
            >
              {editingItem ? 'Simpan Perubahan' : 'Tambah Pegawai'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL DETAIL PEGAWAI */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!detailItem}
        onClose={closeDetail}
        title={
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-amber-400" />
            <span>Profil Lengkap Pegawai</span>
          </div>
        }
        maxWidth="md"
      >
        {detailItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl border ${
                  detailItem.role === 'ADMIN'
                    ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                }`}
              >
                {detailItem.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{detailItem.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{detailItem.email}</p>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      detailItem.role === 'ADMIN'
                        ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {detailItem.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="block text-slate-500 text-[11px] mb-0.5">No. Telepon / WhatsApp</span>
                <span className="font-mono text-slate-200">{detailItem.phoneNumber || '-'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="block text-slate-500 text-[11px] mb-0.5">Bidang Kerja</span>
                <span className="text-slate-200">
                  {detailItem.bidang && detailItem.bidang !== '-' ? (
                    detailItem.bidangSingkatan ? (
                      `${detailItem.bidang} (${detailItem.bidangSingkatan})`
                    ) : (
                      detailItem.bidang
                    )
                  ) : (
                    '-'
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={closeDetail}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI APPROVAL / REJECT */}
      {/* ========================================================================= */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-amber-400" />
            <span>
              {confirmModal.type === 'approve-reg' && 'Konfirmasi Persetujuan Akun Pegawai'}
              {confirmModal.type === 'reject-reg' && 'Konfirmasi Penolakan Pendaftaran'}
              {confirmModal.type === 'approve-reset' && 'Setujui Reset Kata Sandi'}
              {confirmModal.type === 'reject-reset' && 'Tolak Permohonan Reset Kata Sandi'}
            </span>
          </div>
        }
        maxWidth="md"
      >
        <div className="space-y-4">
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

          {confirmModal.type === 'approve-reset' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kata Sandi Baru yang Akan Diterapkan:
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
                  placeholder="Disetujui oleh Admin"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

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
                placeholder="Contoh: Identitas email tidak valid"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {confirmModal.type === 'approve-reg' && (
            <p className="text-xs text-slate-300 leading-relaxed">
              Setelah disetujui, pegawai ini akan dapat langsung masuk (login) ke dalam sistem portal
              BPKP Jawa Barat.
            </p>
          )}

          {confirmModal.type === 'reject-reg' && (
            <p className="text-xs text-rose-300 leading-relaxed">
              Apakah Anda yakin ingin menolak pendaftaran akun ini? Pengguna tidak akan dapat masuk ke sistem.
            </p>
          )}

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

      {/* ========================================================================= */}
      {/* DIALOG KONFIRMASI HAPUS PEGAWAI */}
      {/* ========================================================================= */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={closeDelete}
        onConfirm={deleteItem}
        title="Hapus Pegawai"
        itemName={deletingItem?.name}
        description="Apakah Anda yakin ingin menghapus akun pegawai ini dari sistem? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
