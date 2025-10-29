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
  Stagestype_id?: number;
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

  const fetchStageTypes = useCallback(async () => {
    if (!user?.accessToken) return [] as any[];
    try {
      setLoading(true);
      const res = await axiosInstance.get('Templet/BringStagestype', {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });
      return (res.data?.data || []) as any[];
    } catch (e) {
      console.error('fetchStageTypes error:', e);
      return [] as any[];
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const fetchStageHomes = useCallback(async (Type: string, StageIDtemplet: number = 0, append: boolean = false) => {
    if (!user?.accessToken) return [] as StageHomeTemplet[];

    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get(
        `Templet/BringStageHomeTemplet?Type=${encodeURIComponent(Type)}&StageIDtemplet=${StageIDtemplet}`,
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

  const fetchStageSub = useCallback(async (StageID: number, Stagestype_id: number, StageSubID: number = 0) => {
    if (!user?.accessToken) return null as StageSubTemplet[] | null;

    // منع التحميل المتكرر
    if (loading) return null;

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 fetchStageSub called with:', { StageID, Stagestype_id, StageSubID });

      const res = await axiosInstance.get(
        `Templet/BringStageSubTemplet?StageID=${StageID}&Stagestype_id=${Stagestype_id}&StageSubID=${StageSubID}`,
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      const data = (res.data?.data || []) as StageSubTemplet[];

      console.log('📋 fetchStageSub response:', data);

      return data;
    } catch (e: any) {
      console.error('❌ fetchStageSub error:', e);
      setError('خطأ في جلب القوالب الفرعية');
      Tostget('خطأ في جلب القوالب الفرعية');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const loadMoreStageHomes = useCallback(async (Type: string) => {
    if (!hasMoreData || loading || stageHomes.length === 0) return;

    const lastItem = stageHomes[stageHomes.length - 1];
    if (lastItem?.StageIDtemplet) {
      await fetchStageHomes(Type, lastItem.StageIDtemplet, true);
    }
  }, [hasMoreData, loading, stageHomes, fetchStageHomes]);

  const createStageHome = useCallback(async (payload: { Type: string; StageName: string; Days: number; Ratio?: number; attached?: string; }) => {
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
      setError(e.response?.data?.error || 'خطأ في إنشاء القالب');
      Tostget(e.response?.data?.error || 'خطأ في إنشاء القالب');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const createStageSub = useCallback(async (payload: { StageID: number; StageSubName: string; Stagestype_id: number; file?: File | null; }) => {
    if (!user?.accessToken) return false;
    try {
      setLoading(true);
      setError(null);
      const form = new FormData();
      form.append('StageID', String(payload.StageID));
      form.append('StageSubName', payload.StageSubName);
      form.append('Stagestype_id', String(payload.Stagestype_id));
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

  const updateStageHome = useCallback(async (payload: { StageIDtemplet: number; Type: string; StageName: string; Days: number; Ratio?: number; attached?: string; }) => {
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
      setError(e.response?.data?.error || 'خطأ في تحديث القالب');
      Tostget(e.response?.data?.error || 'خطأ في تحديث القالب');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const updateStageSub = useCallback(async (payload: { StageSubID: number; StageSubName: string; Stagestype_id: number; file?: File | null; }) => {
    if (!user?.accessToken) return false;
    try {
      setLoading(true);
      setError(null);
      const form = new FormData();
      form.append('StageSubID', String(payload.StageSubID));
      form.append('StageSubName', payload.StageSubName);
      form.append('Stagestype_id', String(payload.Stagestype_id));
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

  const fetchExcelTemplate = useCallback(async () => {
    if (!user?.accessToken) return null;
    try {
      setLoading(true);
      const res = await axiosInstance.get('Templet/BringxlsxTemplet', {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });
      return res.data?.data || null;
    } catch (e: any) {
      console.error('fetchExcelTemplate error:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const uploadExcelTemplate = useCallback(async (file: File, projectId?: number) => {
    if (!user?.accessToken) return false;
    try {
      setLoading(true);
      setError(null);

      // Upload the Excel file (backend will insert data with Stagestype_id = null due to bug)
      const formData = new FormData();
      formData.append('file', file);
      if (projectId) {
        formData.append('ProjectID', String(projectId));
      }

      const res = await axiosInstance.post('Templet/insertTemplet', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.accessToken}`
        }
      });

      if (res.status === 200) {
        Tostget(res.data?.success || 'تم رفع الملف بنجاح');
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('uploadExcelTemplate error:', e);
      setError(e.response?.data?.success || e.response?.data?.error || 'خطأ في رفع الملف');
      Tostget(e.response?.data?.success || e.response?.data?.error || 'خطأ في رفع الملف');
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
    fetchStageTypes,
    fetchStageHomes,
    loadMoreStageHomes,
    fetchStageSub,
    createStageHome,
    createStageSub,
    updateStageHome,
    updateStageSub,
    deleteStageHome,
    deleteStageSub,
    fetchExcelTemplate,
    uploadExcelTemplate,
  };
}


