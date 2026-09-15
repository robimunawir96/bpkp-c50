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
  ActionButtons,
  TableFilterBar
} from '@/components/common';
import { useDataManager } from '@/lib/useDataManager';

interface AccountItem {
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

interface BidangChangeItem {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  currentBidang: string;
  currentBidangSingkatan?: string | null;
  currentBidangId?: string | null;
  targetBidang: string;
  targetBidangSingkatan?: string | null;
  targetBidangId?: string | null;
  role: 'ADMIN' | 'PEGAWAI';
  updatedAt: string;
}

interface BidangOption {
  id: string;
  nama: string;
  singkatan?: string | null;
}

const defaultAccounts: AccountItem[] = [];

export default function ManajemenAkunPage() {
  // Auth & Role checking
  const [currentUser, setCurrentUser] = useState<{ role?: string; name?: string; email?: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bpkp_auth_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
      setIsCheckingAuth(false);
    }
  }, []);

  // Main Tab State: 'akun' | 'registrasi' | 'bidang' | 'reset-password'
  const [activeTab, setActiveTab] = useState<'akun' | 'registrasi' | 'bidang' | 'reset-password'>('akun');

  // --- TAB 1: DATA AKUN ---
  const {
    data: accountList,
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
    refreshData: refreshAccountList
  } = useDataManager<AccountItem>({
    storageKey: 'bpkp_pegawai_data',
    initialData: defaultAccounts,
    apiEndpoint: '/api/pegawai',
    getItemTitle: (item) => item.name || item.email
  });

  const [bidangOptions, setBidangOptions] = useState<BidangOption[]>([]);

  // Form State Akun
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    bidangId: '',
    bidang: '',
    role: 'PEGAWAI' as 'ADMIN' | 'PEGAWAI',
    password: ''
  });

  // --- TAB 2, 3 & 4: APPROVAL STATES ---
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [resetRequests, setResetRequests] = useState<ResetPasswordItem[]>([]);
  const [bidangChanges, setBidangChanges] = useState<BidangChangeItem[]>([]);
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<'PENDING' | 'ALL' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);

  // Approval Confirm Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'approve-reg' | 'reject-reg' | 'approve-reset' | 'reject-reset' | 'approve-bidang' | 'reject-bidang';
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

  // Sync Form Data when Editing Akun
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

  // Fetch Bidang Change Requests
  const fetchBidangChanges = useCallback(async () => {
    setIsApprovalLoading(true);
    try {
      const res = await fetch('/api/approval/bidang');
      if (res.ok) {
        const data = await res.json();
        setBidangChanges(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching bidang change requests:', err);
    } finally {
      setIsApprovalLoading(false);
    }
  }, []);

  // Load Approval data on tab or filter change
  useEffect(() => {
    if (activeTab === 'registrasi') {
      fetchRegistrations();
    } else if (activeTab === 'bidang') {
      fetchBidangChanges();
    } else if (activeTab === 'reset-password') {
      fetchResetRequests();
    }
  }, [activeTab, fetchRegistrations, fetchResetRequests, fetchBidangChanges]);

  // Pending counts
  const pendingRegCount = useMemo(() => {
    return registrations.filter((r) => r.status === 'PENDING').length;
  }, [registrations]);

  const pendingResetCount = useMemo(() => {
    return resetRequests.filter((r) => r.status === 'PENDING').length;
  }, [resetRequests]);

  const pendingBidangCount = useMemo(() => {
    return bidangChanges.length;
  }, [bidangChanges]);

  // Handle Form Submit (Add / Edit Akun)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    const selectedBidang = bidangOptions.find((b) => b.id === formData.bidangId);

    const payload: Omit<AccountItem, 'id'> & { password?: string; status?: string } = {
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
          message: status === 'APPROVED' ? 'Pendaftaran akun berhasil disetujui!' : 'Pendaftaran akun telah ditolak.',
          type: 'success'
        });
        fetchRegistrations();
        refreshAccountList();
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
              ? 'Permohonan reset kata sandi disetujui & kata sandi baru telah aktif.'
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

  // Handle Process Bidang Change
  const handleProcessBidangChange = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch('/api/approval/bidang', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action
        })
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          message: data.message || (action === 'APPROVE' ? 'Perubahan bidang berhasil disetujui!' : 'Permintaan perubahan bidang ditolak.'),
          type: 'success'
        });
        fetchBidangChanges();
        refreshAccountList();
      } else {
        setNotification({
          message: data.error || 'Gagal memproses perubahan bidang.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error processing bidang approval:', err);
      setNotification({ message: 'Terjadi kesalahan koneksi server.', type: 'error' });
    } finally {
      setConfirmModal({ isOpen: false, type: 'approve-bidang', item: null });
    }
  };

  // Filter States for Akun tab
  const [accountRoleFilter, setAccountRoleFilter] = useState('ALL');
  const [accountBidangFilter, setAccountBidangFilter] = useState('ALL');
  const [accountSort, setAccountSort] = useState('newest');

  // Filter lists
  const filteredAccounts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const result = accountList.filter((p) => {
      // Role Filter
      if (accountRoleFilter !== 'ALL' && p.role !== accountRoleFilter) {
        return false;
      }

      // Bidang Filter
      if (accountBidangFilter !== 'ALL') {
        const pBidangId = p.bidangId;
        if (pBidangId !== accountBidangFilter) return false;
      }

      // Search Query
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.phoneNumber && p.phoneNumber.toLowerCase().includes(q)) ||
        (p.bidang && p.bidang.toLowerCase().includes(q)) ||
        (p.bidangSingkatan && p.bidangSingkatan.toLowerCase().includes(q)) ||
        (p.role && p.role.toLowerCase().includes(q))
      );
    });

    // Sort: default 'newest' (terbaru paling atas)
    result.sort((a, b) => {
      if (accountSort === 'newest') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      if (accountSort === 'oldest') {
        return (a.createdAt || '').localeCompare(b.createdAt || '');
      }
      if (accountSort === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (accountSort === 'name_desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      if (accountSort === 'role') {
        return (a.role || '').localeCompare(b.role || '');
      }
      return 0;
    });

    return result;
  }, [accountList, searchQuery, accountRoleFilter, accountBidangFilter, accountSort]);

  const filteredRegistrations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const result = registrations.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.bidang?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q)
    );
    return result.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [registrations, searchQuery]);

  const filteredBidangChanges = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const result = bidangChanges.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.email?.toLowerCase().includes(q) ||
        b.currentBidang?.toLowerCase().includes(q) ||
        b.targetBidang?.toLowerCase().includes(q)
    );
    return result.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }, [bidangChanges, searchQuery]);

  const filteredResetRequests = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const result = resetRequests.filter(
      (r) =>
        r.userName?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.userBidang?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q)
    );
    return result.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [resetRequests, searchQuery]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Memeriksa hak akses administrator...</p>
        </div>
      </div>
    );
  }

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
            <ShieldCheckIcon className="w-9 h-9" />
          </div>
          <span className="px-3 py-1 bg-rose-950/60 border border-rose-800/80 text-rose-300 text-[11px] font-bold rounded-full mb-3 uppercase tracking-wider">
            Akses Terbatas
          </span>
          <h2 className="text-xl font-bold text-white mb-2">Hanya untuk Role Admin</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Halaman Manajemen Akun dan Persetujuan memiliki hak akses khusus dan hanya dapat dibuka oleh akun dengan role <span className="font-semibold text-amber-400 font-mono">ADMIN</span>. Akun Anda saat ini tercatat sebagai <span className="font-semibold text-slate-200 font-mono">{currentUser?.role || 'PEGAWAI'}</span>.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg shadow-amber-400/10 w-full"
          >
            Kembali ke Beranda Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* 1. Page Header */}
      <PageHeader
        badgeText="Manajemen Akun & Akses"
        title="Manajemen Akun & Persetujuan"
        description="Kelola data akun pengguna portal BPKP Jabar, validasi persetujuan registrasi akun pegawai baru, serta penanganan permohonan reset kata sandi."
        addButtonLabel={activeTab === 'akun' ? '+ Tambah Akun' : undefined}
        onAddClick={activeTab === 'akun' ? openAdd : undefined}
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
          {/* Tab 1: Akun */}
          <button
            onClick={() => {
              setActiveTab('akun');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'akun'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserGroupIcon className="w-4 h-4" />
            <span>Daftar Akun</span>
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'akun' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}>
              {accountList.length}
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

          {/* Tab 3: Perubahan Bidang */}
          <button
            onClick={() => {
              setActiveTab('bidang');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bidang'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BuildingOffice2Icon className="w-4 h-4" />
            <span>Persetujuan Bidang</span>
            {pendingBidangCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500 text-white animate-pulse">
                {pendingBidangCount}
              </span>
            )}
          </button>

          {/* Tab 4: Reset Password */}
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
        {activeTab !== 'akun' && (
          <div className="flex items-center gap-2">
            {activeTab !== 'bidang' && (
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
            )}
            <button
              onClick={() => {
                if (activeTab === 'registrasi') fetchRegistrations();
                else if (activeTab === 'bidang') fetchBidangChanges();
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

      {/* 4. Search Filter Input & Filter Bar */}
      <div className="space-y-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={
            activeTab === 'akun'
              ? 'Cari nama akun, email, no HP, bidang, atau role...'
              : activeTab === 'registrasi'
              ? 'Cari nama pendaftar, email, bidang kerja...'
              : activeTab === 'bidang'
              ? 'Cari nama pemohon perubahan bidang, email, atau bidang...'
              : 'Cari pemohon reset sandi, email, atau alasan...'
          }
        />

        {activeTab === 'akun' && (
          <TableFilterBar
            customFilters={[
              {
                key: 'role',
                label: 'Hak Akses / Role',
                value: accountRoleFilter,
                onChange: setAccountRoleFilter,
                icon: 'tag',
                options: [
                  { value: 'ALL', label: 'Semua Role' },
                  { value: 'ADMIN', label: 'ADMIN' },
                  { value: 'PEGAWAI', label: 'PEGAWAI' }
                ]
              },
              {
                key: 'bidang',
                label: 'Bidang Kerja',
                value: accountBidangFilter,
                onChange: setAccountBidangFilter,
                icon: 'building',
                options: [
                  { value: 'ALL', label: 'Semua Bidang' },
                  ...bidangOptions.map((b) => ({
                    value: b.id,
                    label: b.singkatan ? `${b.nama} (${b.singkatan})` : b.nama
                  }))
                ]
              }
            ]}
            sortOptions={[
              { value: 'newest', label: 'Waktu Dibuat Terbaru' },
              { value: 'oldest', label: 'Waktu Dibuat Terlama' },
              { value: 'name_asc', label: 'Nama (A-Z)' },
              { value: 'name_desc', label: 'Nama (Z-A)' },
              { value: 'role', label: 'Role / Hak Akses' }
            ]}
            selectedSort={accountSort}
            onSortChange={setAccountSort}
            onResetFilters={() => {
              setAccountRoleFilter('ALL');
              setAccountBidangFilter('ALL');
              setSearchQuery('');
            }}
            hasActiveFilters={accountRoleFilter !== 'ALL' || accountBidangFilter !== 'ALL' || searchQuery !== ''}
            totalFilteredCount={filteredAccounts.length}
            totalAllCount={accountList.length}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAFTAR AKUN */}
      {/* ========================================================================= */}
      {activeTab === 'akun' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">No</th>
                  <th className="px-6 py-4">Nama Akun & Email</th>
                  <th className="px-6 py-4">Kontak / No. HP</th>
                  <th className="px-6 py-4">Bidang Kerja</th>
                  <th className="px-6 py-4 text-center">Role</th>
                  <th className="px-6 py-4 text-right w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAccounts.map((user, index) => {
                  const isAdmin = user.role === 'ADMIN';

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
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
                            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-xs sm:text-sm truncate">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate font-mono">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* No HP */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                          <PhoneIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{user.phoneNumber || '-'}</span>
                        </div>
                      </td>

                      {/* Bidang Kerja */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <BuildingOffice2Icon className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[220px]">
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

                      {/* Role */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          {isAdmin ? (
                            <>
                              <ShieldCheckIcon className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="text-amber-300">{user.role}</span>
                            </>
                          ) : (
                            <>
                              <UserIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className="text-emerald-300">{user.role}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4 text-right">
                        <ActionButtons
                          onShow={() => openDetail(user)}
                          onEdit={() => openEdit(user)}
                          onDelete={() => openDelete(user)}
                          showTitle="Lihat Detail Akun"
                          editTitle="Edit Data Akun"
                          deleteTitle="Hapus Akun"
                        />
                      </td>
                    </tr>
                  );
                })}

                {filteredAccounts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      <UserGroupIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <span>Tidak ditemukan data akun yang cocok dengan pencarian &quot;{searchQuery}&quot;</span>
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
                  <th className="px-6 py-4">Nama Pendaftar & Email</th>
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
                            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
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
      {/* TAB 3: PERSETUJUAN PERUBAHAN BIDANG */}
      {/* ========================================================================= */}
      {activeTab === 'bidang' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-14 text-center">No</th>
                  <th className="px-6 py-4">Pegawai / Akun</th>
                  <th className="px-6 py-4">Bidang Saat Ini</th>
                  <th className="px-6 py-4">Permohonan Bidang Baru</th>
                  <th className="px-6 py-4">Tgl Pengajuan</th>
                  <th className="px-6 py-4 text-right w-44">Aksi Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredBidangChanges.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 text-center font-bold text-slate-400">{idx + 1}</td>

                    {/* Pegawai */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs sm:text-sm">{item.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{item.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Bidang Saat Ini */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <BuildingOffice2Icon className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>
                          {item.currentBidang ? (
                            item.currentBidangSingkatan ? (
                              `${item.currentBidang} (${item.currentBidangSingkatan})`
                            ) : (
                              item.currentBidang
                            )
                          ) : (
                            <span className="text-slate-500 italic">Belum Ditentukan</span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Permohonan Bidang Baru */}
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 font-semibold text-xs">
                        <BuildingOffice2Icon className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>
                          {item.targetBidangSingkatan
                            ? `${item.targetBidang} (${item.targetBidangSingkatan})`
                            : item.targetBidang}
                        </span>
                      </div>
                    </td>

                    {/* Tgl Pengajuan */}
                    <td className="px-6 py-4 text-slate-400 text-[11px]">
                      {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              type: 'approve-bidang',
                              item: item
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
                              type: 'reject-bidang',
                              item: item
                            })
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 transition-colors flex items-center gap-1"
                        >
                          <XCircleIcon className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredBidangChanges.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <BuildingOffice2Icon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <span>Tidak ada permohonan perubahan bidang yang menunggu persetujuan.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PERSETUJUAN RESET PASSWORD */}
      {/* ========================================================================= */}
      {activeTab === 'reset-password' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-14 text-center">No</th>
                  <th className="px-6 py-4">Pemohon / Akun</th>
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
      {/* MODAL 1: FORM TAMBAH / EDIT AKUN */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingItem ? 'Edit Data Akun' : 'Tambah Akun Baru'}
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Lengkap <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Ahmad Hidayat, S.E., M.Ak."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alamat Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@bpkp.go.id"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="081234567890"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Bidang Kerja
              </label>
              <select
                value={formData.bidangId}
                onChange={(e) => setFormData({ ...formData, bidangId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="">-- Pilih Bidang Kerja --</option>
                {bidangOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nama} {b.singkatan ? `(${b.singkatan})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Peran / Role Akun <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="PEGAWAI">PEGAWAI (Auditor / Staff)</option>
                <option value="ADMIN">ADMIN (Administrator)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Kata Sandi {editingItem ? '(Kosongkan jika tidak ingin mengubah)' : '<span className="text-rose-400">*</span>'}
            </label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingItem ? 'Biarkan kosong untuk mempertahankan sandi saat ini' : 'Minimal 6 karakter (default: 12345678)'}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
            />
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
              {editingItem ? 'Simpan Perubahan' : 'Tambah Akun'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: DETAIL AKUN */}
      {/* ========================================================================= */}
      {detailItem && (
        <Modal
          isOpen={true}
          onClose={closeDetail}
          title="Informasi Lengkap Akun"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center font-bold text-base">
                {detailItem.name ? detailItem.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{detailItem.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{detailItem.email}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  detailItem.role === 'ADMIN' ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'
                }`}>
                  {detailItem.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">No. Telepon / WA:</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{detailItem.phoneNumber || '-'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Bidang Kerja:</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  {detailItem.bidang && detailItem.bidang !== '-' ? detailItem.bidang : 'Belum Ditentukan'}
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
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION AKUN */}
      {/* ========================================================================= */}
      {deletingItem && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={closeDelete}
          onConfirm={deleteItem}
          title="Hapus Data Akun"
          itemName={deletingItem.name || deletingItem.email}
          description={`Apakah Anda yakin ingin menghapus akun "${deletingItem.name || deletingItem.email}"? Tindakan ini tidak dapat dibatalkan.`}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: KONFIRMASI PERSETUJUAN (REGISTRASI, BIDANG & RESET PASSWORD) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-amber-400" />
            <span>
              {confirmModal.type === 'approve-reg' && 'Konfirmasi Persetujuan Akun'}
              {confirmModal.type === 'reject-reg' && 'Konfirmasi Penolakan Akun'}
              {confirmModal.type === 'approve-bidang' && 'Konfirmasi Persetujuan Perubahan Bidang'}
              {confirmModal.type === 'reject-bidang' && 'Konfirmasi Penolakan Perubahan Bidang'}
              {confirmModal.type === 'approve-reset' && 'Setujui Reset Kata Sandi'}
              {confirmModal.type === 'reject-reset' && 'Tolak Permohonan Reset Sandi'}
            </span>
          </div>
        }
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Nama Akun:</span>
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
            {confirmModal.item?.currentBidang !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Bidang Saat Ini:</span>
                <span className="text-xs text-slate-300">
                  {confirmModal.item?.currentBidang || 'Belum Ditentukan'}
                </span>
              </div>
            )}
            {confirmModal.item?.targetBidang !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Permohonan Bidang Baru:</span>
                <span className="text-xs font-bold text-sky-400">
                  {confirmModal.item?.targetBidang}
                </span>
              </div>
            )}
          </div>

          {/* Form khusus Approve Reset Password */}
          {confirmModal.type === 'approve-reset' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kata Sandi Baru yang Diberikan:
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
                  placeholder="Disetujui oleh Administrator"
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
                placeholder="Contoh: Identitas pemohon tidak sesuai"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {/* Prompt Message */}
          {confirmModal.type === 'approve-reg' && (
            <p className="text-xs text-slate-300 leading-relaxed">
              Setelah disetujui, akun pegawai ini akan aktif dan dapat digunakan untuk masuk ke portal BPKP Jawa Barat.
            </p>
          )}

          {confirmModal.type === 'reject-reg' && (
            <p className="text-xs text-rose-300 leading-relaxed">
              Apakah Anda yakin ingin menolak pendaftaran akun ini? Pengguna tidak akan dapat mengakses sistem.
            </p>
          )}

          {confirmModal.type === 'approve-bidang' && (
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menyetujui perubahan bidang pegawai ini ke <strong className="text-sky-400 font-semibold">{confirmModal.item?.targetBidang}</strong>? Bidang aktif pegawai akan langsung diperbarui.
            </p>
          )}

          {confirmModal.type === 'reject-bidang' && (
            <p className="text-xs text-rose-300 leading-relaxed">
              Apakah Anda yakin ingin menolak permohonan perubahan bidang ini? Pegawai akan tetap berada di bidang saat ini.
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

            {confirmModal.type === 'approve-bidang' && (
              <button
                type="button"
                onClick={() => handleProcessBidangChange(confirmModal.item.id, 'APPROVE')}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-md"
              >
                Ya, Setujui Bidang
              </button>
            )}

            {confirmModal.type === 'reject-bidang' && (
              <button
                type="button"
                onClick={() => handleProcessBidangChange(confirmModal.item.id, 'REJECT')}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md"
              >
                Tolak Perubahan
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
