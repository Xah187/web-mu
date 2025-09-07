import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';

export interface Delay {
  StageNoteID: number;
  ProjectID: number;
  StagHOMID: number;
  Type: string;
  Note: string;
  DateNote: string;
  RecordedBy: string;
  UpdatedDate?: string;
  countdayDelay?: number;
  ImageAttachment?: string | null;
}

interface UseDelaysReturn {
  delays: Delay[];
  loading: boolean;
  error: string | null;
  fetchDelays: (projectId: number, stageId: number) => Promise<void>;
  addDelay: (projectId: number, stageId: number, type: string, note: string, countdayDelay?: number, file?: File | null) => Promise<void>;
  updateDelay: (stageNoteId: number, type: string, note: string, countdayDelay?: number, file?: File | null, existingImage?: string | null) => Promise<void>;
}

export const useDelays = (): UseDelaysReturn => {
  const [delays, setDelays] = useState<Delay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useSelector((state: any) => state.user || {});

  const fetchDelays = useCallback(async (projectId: number, stageId: number) => {
    if (!user?.accessToken) {
      setError('لا يوجد رمز وصول صالح');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        `/brinshCompany/BringStageNotes?ProjectID=${projectId}&StageID=${stageId}`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      const delaysData = response.data?.data || response.data;
      
      if (delaysData && Array.isArray(delaysData)) {
        setDelays(delaysData);
      } else {
        setDelays([]);
      }
    } catch (error: any) {
      console.error('خطأ في جلب التأخيرات:', error);
      setError(error.response?.data?.message || 'فشل في جلب التأخيرات');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const addDelay = useCallback(async (
    projectId: number, 
    stageId: number, 
    type: string, 
    note: string, 
    countdayDelay: number = 0,
    file: File | null = null,
  ) => {
    if (!user?.accessToken) {
      setError('لا يوجد رمز وصول صالح');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const form = new FormData();
      form.append('ProjectID', String(projectId));
      form.append('StagHOMID', String(stageId));
      form.append('Type', type);
      form.append('Note', note);
      form.append('RecordedBy', user?.data?.userName || '');
      form.append('countdayDelay', String(countdayDelay || 0));
      if (file) form.append('image', file as any);

      const response = await axiosInstance.post(
        '/brinshCompany/NotesStage',
        form,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        // Refresh delays after adding
        await fetchDelays(projectId, stageId);
      }
    } catch (error: any) {
      console.error('خطأ في إضافة التأخير:', error);
      setError(error.response?.data?.message || 'فشل في إضافة التأخير');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken, fetchDelays]);

  const updateDelay = useCallback(async (
    stageNoteId: number, 
    type: string, 
    note: string, 
    countdayDelay: number = 0,
    file: File | null = null,
    existingImage: string | null = null,
  ) => {
    if (!user?.accessToken) {
      setError('لا يوجد رمز وصول صالح');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const form = new FormData();
      form.append('StageNoteID', String(stageNoteId));
      form.append('Type', type);
      form.append('Note', note);
      form.append('RecordedBy', user?.data?.userName || '');
      form.append('countdayDelay', String(countdayDelay || 0));
      if (file) {
        form.append('image', file as any);
      } else if (existingImage) {
        form.append('ImageAttachment', existingImage);
      }

      const response = await axiosInstance.put(
        '/brinshCompany/UpdateNotesStage',
        form,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        // Refresh current list by fetching again
        const current = delays[0];
        const projectId = current?.ProjectID;
        const stageId = current?.StagHOMID;
        if (projectId && stageId) {
          await fetchDelays(projectId, stageId);
        }
      }
    } catch (error: any) {
      console.error('خطأ في تحديث التأخير:', error);
      setError(error.response?.data?.message || 'فشل في تحديث التأخير');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken, delays, fetchDelays]);

  return {
    delays,
    loading,
    error,
    fetchDelays,
    addDelay,
    updateDelay,
  };
};

export default useDelays;
