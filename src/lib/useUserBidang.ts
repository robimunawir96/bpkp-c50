'use client';

import { useState, useEffect } from 'react';

export interface UserBidangInfo {
  bidangId: string | null;
  bidangNama: string | null;
  bidangSingkatan: string | null;
  userRole: string | null;
  userName: string | null;
  userEmail: string | null;
  isLoading: boolean;
}

export function useUserBidang(): UserBidangInfo {
  const [userBidang, setUserBidang] = useState<UserBidangInfo>({
    bidangId: null,
    bidangNama: null,
    bidangSingkatan: null,
    userRole: null,
    userName: null,
    userEmail: null,
    isLoading: true
  });

  useEffect(() => {
    let activeId = '';
    let activeEmail = '';

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bpkp_auth_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.id) activeId = parsed.id;
          if (parsed.email) activeEmail = parsed.email;

          // Set immediate local fallback
          setUserBidang((prev) => ({
            ...prev,
            bidangId: parsed.bidangId || null,
            bidangNama: parsed.bidang || null,
            bidangSingkatan: parsed.bidangSingkatan || null,
            userRole: parsed.role || null,
            userName: parsed.name || null,
            userEmail: parsed.email || null
          }));
        } catch (e) {
          console.error('Failed to parse bpkp_auth_user:', e);
        }
      }
    }

    if (!activeId && !activeEmail) {
      setUserBidang((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    // Fetch fresh profile from API to ensure bidirectional synchronization
    const fetchUrl = activeId
      ? `/api/auth/profile?id=${encodeURIComponent(activeId)}`
      : `/api/auth/profile?email=${encodeURIComponent(activeEmail)}`;

    fetch(fetchUrl)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUserBidang({
            bidangId: data.bidangId || null,
            bidangNama: data.bidang || null,
            bidangSingkatan: data.bidangSingkatan || null,
            userRole: data.role || null,
            userName: data.name || null,
            userEmail: data.email || null,
            isLoading: false
          });

          // Sync localStorage
          if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('bpkp_auth_user');
            const parsed = stored ? JSON.parse(stored) : {};
            localStorage.setItem(
              'bpkp_auth_user',
              JSON.stringify({
                ...parsed,
                bidangId: data.bidangId || null,
                bidang: data.bidang || null,
                bidangSingkatan: data.bidangSingkatan || null,
                role: data.role,
                name: data.name,
                email: data.email
              })
            );
          }
        } else {
          setUserBidang((prev) => ({ ...prev, isLoading: false }));
        }
      })
      .catch((err) => {
        console.error('Failed to fetch user bidang profile:', err);
        setUserBidang((prev) => ({ ...prev, isLoading: false }));
      });
  }, []);

  return userBidang;
}
