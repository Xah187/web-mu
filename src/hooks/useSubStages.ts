'use client';

import { useCallback, useState } from 'react';
import { useAppSelector } from '@/store';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';

export interface SubStage {
  StageSubID: number;
  StageID?: number;
  StageSubName: string;
  attached?: string | null;
  Done: string;
  CloseDate?: string | null;
  closingoperations?: string | null;
  Note?: string | null;
  [key: string]: any;
}

export interface ClosingOperation {
  type: string;
  userName: string;
  PhoneNumber: string;
  Date: string;
  File?: string[];
}

export interface SubStageNote {
  id: number;
  Note: string;
  userName: string;
  PhoneNumber: string;
  Date: string;
  File?: string[] | null;
}

export default function useSubStages() {
  const { user } = useAppSelector((state: any) => state.user || {});
  const [subStages, setSubStages] = useState<SubStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLastId = useCallback(() => {
    if (subStages.length === 0) return 0;
    const last = subStages[subStages.length - 1];
    return last?.StageSubID || 0;
  }, [subStages]);

  const fetchInitial = useCallback(async (projectId: number, stageId: number | string) => {
    if (!user?.accessToken) return;
    try {
      setLoading(true);
      setError(null);

      // Load first batch only (like main stages)
      const url = `brinshCompany/BringStagesub?ProjectID=${projectId}&StageID=${stageId}&type=update&number=0`;
      const res = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      const data = res.data?.data || res.data?.result || [];
      setSubStages(Array.isArray(data) ? data : []);
      // Check if there are more items to load - backend returns 7 items per page
      setHasMore(Array.isArray(data) && data.length >= 7);

    } catch (e: any) {
      console.error('Error fetching sub-stages:', e);
      setError('خطأ في جلب المراحل الفرعية');
      Tostget('خطأ في جلب المراحل الفرعية');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const loadMore = useCallback(async (projectId: number, stageId: number | string) => {
    if (!user?.accessToken || loading || !hasMore) return;
    try {
      setLoading(true);
      setError(null);
      const lastId = getLastId();
      const url = `brinshCompany/BringStagesub?ProjectID=${projectId}&StageID=${stageId}&type=update&number=${lastId}`;
      const res = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      const data: SubStage[] = res.data?.data || [];
      setSubStages(prev => [...prev, ...data]);
      // Check if there are more items to load - backend returns 7 items per page
      setHasMore(Array.isArray(data) && data.length >= 7);
    } catch (e: any) {
      console.error('Error loading more sub-stages:', e);
      setError('خطأ في جلب المزيد من المراحل الفرعية');
      Tostget('خطأ في جلب المزيد من المراحل الفرعية');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken, getLastId, loading, hasMore]);

  const refresh = useCallback(async (projectId: number, stageId: number | string) => {
    setHasMore(true); // Reset pagination state
    await fetchInitial(projectId, stageId);
  }, [fetchInitial]);

  const uploadStageAchievement = useCallback(async (
    projectId: number,
    stageId: number | string,
    file: File
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ProjectID', String(projectId));
      formData.append('StageID', String(stageId));

      await axiosInstance.post('/brinshCompany/StageCustImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      Tostget('تم رفع إنجاز المرحلة بنجاح');
      return true;
    } catch (error) {
      console.error('Error uploading stage achievement:', error);
      Tostget('فشل في رفع إنجاز المرحلة');
      return false;
    }
  }, [user?.accessToken]);

  return {
    subStages,
    loading,
    hasMore,
    error,
    fetchInitial,
    loadMore,
    refresh,
    setSubStages,
    uploadStageAchievement,
  };
}


