'use client';

import { useState, useCallback } from 'react';
import { useAppSelector } from '@/store';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';

export interface NotificationItem {
  id?: number;
  Title?: string;
  title?: string;
  Message?: string;
  message?: string;
  CreatedAt?: string;
  createdAt?: string;
  type?: string;
}

export interface UseNotificationsReturn {
  notifications: NotificationItem[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  fetchInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  filterByDate: (from: string, to: string) => Promise<void>;
}

export default function useNotifications(): UseNotificationsReturn {
  const { user } = useAppSelector((state: any) => state.user || {});
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLastId = useCallback((): number => {
    if (notifications.length === 0) return 0;
    const last = notifications[notifications.length - 1];
    return (last?.id as number) || 0;
  }, [notifications]);

  const fetch = useCallback(async (reset: boolean = false): Promise<void> => {
    if (!user?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const lastId = reset ? 0 : getLastId();
      const url = `user/BringDataNotifcationv2?LastID=${lastId}`;
      const response = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      if (response.status === 200) {
        const data: NotificationItem[] = response.data?.data || [];
        if (reset) {
          setNotifications(data);
        } else {
          setNotifications(prev => [...prev, ...data]);
        }
        setHasMore(Array.isArray(data) && data.length > 0);
      }
    } catch (e: any) {
      console.error('Error fetching notifications:', e);
      setError('خطأ في جلب الإشعارات');
      Tostget('خطأ في جلب الإشعارات');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken, getLastId]);

  const fetchInitial = useCallback(async (): Promise<void> => {
    await fetch(true);
  }, [fetch]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (loading || !hasMore) return;
    await fetch(false);
  }, [fetch, loading, hasMore]);

  const filterByDate = useCallback(async (from: string, to: string): Promise<void> => {
    if (!user?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const url = `user/FilterNotifcationv2?LastID=0&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
      const response = await axiosInstance.get(url, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      });
      if (response.status === 200) {
        const data: NotificationItem[] = response.data?.data || [];
        setNotifications(data);
        setHasMore(false);
      }
    } catch (e: any) {
      console.error('Error filtering notifications:', e);
      setError('خطأ في البحث ضمن الإشعارات');
      Tostget('خطأ في البحث ضمن الإشعارات');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  return { notifications, loading, hasMore, error, fetchInitial, loadMore, filterByDate };
}


