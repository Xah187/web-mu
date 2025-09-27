'use client';

import { useState, useCallback } from 'react';
import { useAppSelector } from '@/store';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';

export interface StageHomeTemplet {
  StageID?: number;
  StageIDtemplet?: number;
  Type?: string;
  StageName?: string;
  Days?: number;
  [key: string]: any;
}

export interface StageSubTemplet {
  StageSubID?: number;
  StageID?: number;
  StageSubName?: string;
  attached?: string | null;
  [key: string]: any;
}

export default function useTemplet() {
  const { user } = useAppSelector((state: any) => state.user || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stageHomes, setStageHomes] = useState<StageHomeTemplet[]>([]);
  const [hasMoreData, setHasMoreData] = useState(true);

  const fetchStageHomes = useCallback(async (StageIDtemplet: number = 0, append: boolean = false) => {
    if (!user?.accessToken) return [] as StageHomeTemplet[];

    // منع التحميل المتكرر
    if (loading) return [];

    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get(
        `Templet/BringStageHomeTemplet?StageIDtemplet=${StageIDtemplet}`,
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      const data: StageHomeTemplet[] = res.data?.data || [];

      // تحديث حالة وجود المزيد من البيانات
      setHasMoreData(data.length >= 10); // إذا كان العدد أقل من 10، فلا يوجد المزيد

      if (append && StageIDtemplet > 0) {
        // إضافة البيانات الجديدة للقائمة الموجودة
        setStageHomes(prev => {
          // تجنب التكرار
          const existingIds = new Set(prev.map(item => item.StageIDtemplet));
          const newItems = data.filter(item => !existingIds.has(item.StageIDtemplet));
          return [...prev, ...newItems];
        });
      } else {
        // استبدال القائمة بالكامل
        setStageHomes(data);
      }

      return data;
    } catch (e: any) {
      console.error('fetchStageHomes error:', e);
      setError('خطأ في جلب قوالب المراحل');
      Tostget('خطأ في جلب قوالب المراحل');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const fetchStageSub = useCallback(async (StageID: number, StageSubID: number = 0, append: boolean = false) => {
    if (!user?.accessToken) return null as StageSubTemplet[] | null;

    // منع التحميل المتكرر
    if (loading) return null;

    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get(
        `Templet/BringStageSubTemplet?StageID=${StageID}&StageSubID=${StageSubID}`,
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      const data = (res.data?.data || []) as StageSubTemplet[];

      return data;
    } catch (e: any) {
      console.error('fetchStageSub error:', e);
      setError('خطأ في جلب القوالب الفرعية');
      Tostget('خطأ في جلب القوالب الفرعية');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const loadMoreStageHomes = useCallback(async () => {
    if (!hasMoreData || loading || stageHomes.length === 0) return;

    const lastItem = stageHomes[stageHomes.length - 1];
    if (lastItem?.StageIDtemplet) {
      await fetchStageHomes(lastItem.StageIDtemplet, true);
    }
  }, [hasMoreData, loading, stageHomes, fetchStageHomes]);

  const createStageHome = useCallback(async (payload: { Type: string; StageName: string; Days: number; }) => {
    if (!user?.accessToken) return false;
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.post('Templet/insertStageHome', payload, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` }
      });
      if (res.status === 200) {
        Tostget(res.data?.success || 'تم إنشاء القالب');
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('createStageHome error:', e);
      setError('خطأ في إنشاء القالب');
      Tostget('خطأ في إنشاء القالب');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const createStageSub = useCallback(async (payload: { StageID: number; StageSubName: string; file?: File | null; }) => {
    if (!user?.accessToken) return false;
    try {
      setLoading(true);
      setError(null);
      const form = new FormData();
      form.append('StageID', String(payload.StageID));
      form.append('StageSubName', payload.StageSubName);
      if (payload.file) form.append('file', payload.file);
      const res = await axiosInstance.post('Templet/insertStageSub', form, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.accessToken}` }
      });
      if (res.status === 200) {
        Tostget(res.data?.success || 'تم إنشاء القالب الفرعي');
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('createStageSub error:', e);
      setError('خطأ في إنشاء القالب الفرعي');
      Tostget('خطأ في إنشاء القالب الفرعي');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const updateStageHome = useCallback(async (payload: { StageID: number; Type: string; StageName: string; Days: number; }) => {
    if (!user?.accessToken) return false;
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.put('Templet/UpdateStageHome', payload, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` }
      });
      if (res.status === 200) {
        Tostget(res.data?.success || 'تم التحديث');
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('updateStageHome error:', e);
      setError('خطأ في تحديث القالب');
      Tostget('خطأ في تحديث القالب');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const updateStageSub = useCallback(async (payload: { StageSubID: number; StageSubName: string; file?: File | null; }) => {
    if (!user?.accessToken) return false;
    try {
      setLoading(true);
      setError(null);
      const form = new FormData();
      form.append('StageSubID', String(payload.StageSubID));
      form.append('StageSubName', payload.StageSubName);
      if (payload.file) form.append('file', payload.file);
      const res = await axiosInstance.put('Templet/UpdateStageSub', form, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.accessToken}` }
      });
      if (res.status === 200) {
        Tostget(res.data?.success || 'تم التحديث');
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('updateStageSub error:', e);
      setError('خطأ في تحديث القالب الفرعي');
      Tostget('خطأ في تحديث القالب الفرعي');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const deleteStageHome = useCallback(async (StageID: number) => {
    if (!user?.accessToken) return false;
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.delete(`Templet/DeletStageHome?StageID=${StageID}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });
      if (res.status === 200) {
        Tostget(res.data?.success || 'تم حذف القالب');
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('deleteStageHome error:', e);
      setError('خطأ في حذف القالب');
      Tostget('خطأ في حذف القالب');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const deleteStageSub = useCallback(async (StageSubID: number) => {
    if (!user?.accessToken) return false;
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.delete(`Templet/DeletStageSub?StageSubID=${StageSubID}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });
      if (res.status === 200) {
        Tostget(res.data?.success || 'تم حذف القالب الفرعي');
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('deleteStageSub error:', e);
      setError('خطأ في حذف القالب الفرعي');
      Tostget('خطأ في حذف القالب الفرعي');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  return {
    loading,
    error,
    stageHomes,
    hasMoreData,
    fetchStageHomes,
    loadMoreStageHomes,
    fetchStageSub,
    createStageHome,
    createStageSub,
    updateStageHome,
    updateStageSub,
    deleteStageHome,
    deleteStageSub,
  };
}


