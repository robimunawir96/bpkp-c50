'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseDataManagerOptions<T extends { id: string }> {
  storageKey: string;
  initialData?: T[];
  apiEndpoint?: string;
  getItemTitle: (item: T) => string;
}

export function useDataManager<T extends { id: string }>({
  storageKey,
  initialData = [],
  apiEndpoint,
  getItemTitle
}: UseDataManagerOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [detailItem, setDetailItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  // Alert state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Keep initialData ref to prevent re-render loops
  const initialDataRef = useRef(initialData);
  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (apiEndpoint) {
      setIsLoading(true);
      try {
        const res = await fetch(apiEndpoint);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          return;
        }
      } catch (err) {
        console.warn(`API fetch failed for ${apiEndpoint}, falling back to local:`, err);
      } finally {
        setIsLoading(false);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          setData(JSON.parse(raw));
        } else {
          setData(initialDataRef.current);
        }
      } catch {
        setData(initialDataRef.current);
      }
    }
  }, [apiEndpoint, storageKey]);

  useEffect(() => {
    let isMounted = true;

    async function initLoad() {
      if (apiEndpoint) {
        setIsLoading(true);
        try {
          const res = await fetch(apiEndpoint);
          if (res.ok && isMounted) {
            const json = await res.json();
            setData(json);
            return;
          }
        } catch (err) {
          console.warn(`API fetch failed for ${apiEndpoint}:`, err);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }

      if (typeof window !== 'undefined' && isMounted) {
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            setData(JSON.parse(raw));
          } else {
            setData(initialDataRef.current);
          }
        } catch {
          setData(initialDataRef.current);
        }
      }
    }

    initLoad();

    return () => {
      isMounted = false;
    };
  }, [apiEndpoint, storageKey]);

  const openAdd = useCallback(() => {
    setEditingItem(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  const openDetail = useCallback((item: T) => {
    setDetailItem(item);
  }, []);

  const openDelete = useCallback((item: T) => {
    setDeletingItem(item);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingItem(null);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailItem(null);
  }, []);

  const closeDelete = useCallback(() => {
    setDeletingItem(null);
  }, []);

  const saveItem = useCallback(
    async (itemData: Omit<T, 'id'>, editId?: string) => {
      if (apiEndpoint) {
        try {
          if (editId) {
            const res = await fetch(apiEndpoint, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: editId, ...itemData })
            });
            if (res.ok) {
              const updated = await res.json();
              setData((prev) => prev.map((item) => (item.id === editId ? updated : item)));
              const title = getItemTitle(updated);
              showNotification(`Data "${title}" berhasil diperbarui!`);
              closeForm();
              return;
            }
          } else {
            const res = await fetch(apiEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(itemData)
            });
            if (res.ok) {
              const created = await res.json();
              setData((prev) => [created, ...prev]);
              const title = getItemTitle(created);
              showNotification(`Data "${title}" berhasil ditambahkan!`);
              closeForm();
              return;
            }
          }
        } catch (err) {
          console.error(`Error saving to ${apiEndpoint}:`, err);
          showNotification('Gagal menyimpan data ke database server.', 'error');
        }
      }

      // Local fallback
      if (editId) {
        setData((prev) => {
          const next = prev.map((item) => (item.id === editId ? ({ ...item, ...itemData } as T) : item));
          if (typeof window !== 'undefined') localStorage.setItem(storageKey, JSON.stringify(next));
          return next;
        });
        const title = getItemTitle({ id: editId, ...itemData } as T);
        showNotification(`Data "${title}" berhasil diperbarui!`);
      } else {
        const newItem = {
          id: Date.now().toString(),
          ...itemData
        } as T;
        setData((prev) => {
          const next = [newItem, ...prev];
          if (typeof window !== 'undefined') localStorage.setItem(storageKey, JSON.stringify(next));
          return next;
        });
        const title = getItemTitle(newItem);
        showNotification(`Data "${title}" berhasil ditambahkan!`);
      }
      closeForm();
    },
    [apiEndpoint, storageKey, getItemTitle, showNotification, closeForm]
  );

  const deleteItem = useCallback(async () => {
    if (!deletingItem) return;
    const title = getItemTitle(deletingItem);

    if (apiEndpoint) {
      try {
        const res = await fetch(`${apiEndpoint}?id=${deletingItem.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
          showNotification(`Data "${title}" berhasil dihapus.`);
          closeDelete();
          return;
        }
      } catch (err) {
        console.error(`Error deleting from ${apiEndpoint}:`, err);
        showNotification('Gagal menghapus data dari database server.', 'error');
      }
    }

    // Local fallback
    setData((prev) => {
      const next = prev.filter((item) => item.id !== deletingItem.id);
      if (typeof window !== 'undefined') localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
    showNotification(`Data "${title}" berhasil dihapus.`);
    closeDelete();
  }, [deletingItem, apiEndpoint, storageKey, getItemTitle, showNotification, closeDelete]);

  return {
    data,
    setData,
    isLoading,
    searchQuery,
    setSearchQuery,
    isFormOpen,
    editingItem,
    detailItem,
    deletingItem,
    notification,
    setNotification,
    showNotification,
    openAdd,
    openEdit,
    openDetail,
    openDelete,
    closeForm,
    closeDetail,
    closeDelete,
    saveItem,
    deleteItem,
    refreshData: fetchData
  };
}
