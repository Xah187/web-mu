'use client';

import { useState, useCallback } from 'react';
import { useAppSelector } from '@/store';
import axiosInstance from '@/lib/api/axios';
import { toast } from '@/lib/toast';
import { SubStageNote } from './useSubStages';

export default function useSubStageNotes() {
  const { user } = useAppSelector((state: any) => state.user || {});
  const [loading, setLoading] = useState(false);

  // Parse notes from SubStage.Note JSON string
  const parseNotes = useCallback((notesJson: string | null): SubStageNote[] => {
    if (!notesJson) return [];
    try {
      const parsed = JSON.parse(notesJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing notes:', error);
      return [];
    }
  }, []);

  // Add new note to substage
  const addNote = useCallback(async (
    stageSubId: number,
    note: string,
    files?: File[]
  ): Promise<boolean> => {
    if (!user?.accessToken) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('StageSubID', String(stageSubId));
      formData.append('Note', note);
      formData.append('type', 'AddNote');

      // Add files if provided
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('image', file);
        });
      }

      const response = await axiosInstance.post('/brinshCompany/NotesStageSub', formData, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        toast.success('تم إضافة الملاحظة بنجاح');
        return true;
      } else {
        toast.error(response.data?.message || 'فشل في إضافة الملاحظة');
        return false;
      }
    } catch (error: any) {
      console.error('Error adding note:', error);
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء إضافة الملاحظة';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  // Edit existing note
  const editNote = useCallback(async (
    stageSubId: number,
    noteId: number,
    note: string,
    files?: File[],
    imagesToDelete?: string[]
  ): Promise<boolean> => {
    if (!user?.accessToken) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('StageSubID', String(stageSubId));
      formData.append('Note', note);
      formData.append('type', 'EditNote');
      formData.append('idNote', String(noteId));

      // Add images to delete
      if (imagesToDelete && imagesToDelete.length > 0) {
        formData.append('Imageolddelete', JSON.stringify(imagesToDelete));
      }

      // Add new files if provided
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('image', file);
        });
      }

      const response = await axiosInstance.post('/brinshCompany/NotesStageSub', formData, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        toast.success('تم تعديل الملاحظة بنجاح');
        return true;
      } else {
        toast.error(response.data?.message || 'فشل في تعديل الملاحظة');
        return false;
      }
    } catch (error: any) {
      console.error('Error editing note:', error);
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء تعديل الملاحظة';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  // Delete note
  const deleteNote = useCallback(async (
    stageSubId: number,
    noteId: number
  ): Promise<boolean> => {
    if (!user?.accessToken) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('StageSubID', String(stageSubId));
      formData.append('type', 'DeletNote');
      formData.append('idNote', String(noteId));

      const response = await axiosInstance.post('/brinshCompany/NotesStageSub', formData, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        toast.success('تم حذف الملاحظة بنجاح');
        return true;
      } else {
        toast.error(response.data?.message || 'فشل في حذف الملاحظة');
        return false;
      }
    } catch (error: any) {
      console.error('Error deleting note:', error);
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حذف الملاحظة';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  return {
    loading,
    parseNotes,
    addNote,
    editNote,
    deleteNote,
  };
}
