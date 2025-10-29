import { useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';

interface ProjectFormData {
  IDcompanySub: number;
  Nameproject: string;
  Note: string;
  LocationProject: string;
  GuardNumber: string;
  TypeOFContract: string;
  numberBuilding: number;
  Referencenumber: number;
  Cost_per_Square_Meter: number;
  Project_Space: number;
}

export const useCreateProject = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useSelector((state: any) => state.user || {});

  const createProject = async (formData: ProjectFormData): Promise<boolean> => {
    if (!user?.accessToken) {
      setError('لا يوجد رمز وصول صالح');
      return false;
    }

    if (!formData.Nameproject.trim()) {
      setError('يجب إدخال اسم المشروع');
      return false;
    }

    if (!formData.TypeOFContract) {
      setError('يجب اختيار نوع العقد');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // مطابق للتطبيق المحمول - إرسال البيانات مباشرة
      const submitData = {
        IDcompanySub: formData.IDcompanySub,
        Nameproject: formData.Nameproject,
        Note: formData.Note,
        LocationProject: formData.LocationProject.startsWith('https')
          ? formData.LocationProject
          : null,
        GuardNumber: formData.GuardNumber,
        TypeOFContract: formData.TypeOFContract,
        numberBuilding: formData.numberBuilding,
        Referencenumber: parseInt(String(formData.Referencenumber)) || 0,
        Cost_per_Square_Meter: parseFloat(String(formData.Cost_per_Square_Meter)) || 0,
        Project_Space: parseFloat(String(formData.Project_Space)) || 0
      };

      const response = await axiosInstance.post('/brinshCompany/v2/project', submitData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (response.status === 200) {
        return true;
      }

      setError('فشل في إنشاء المشروع');
      return false;
    } catch (error: any) {
      setError(error.response?.data?.success || 'فشل في إنشاء المشروع');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get contract types from backend
   * Replicates mobile app's BringTypeOFContract API
   */
  const getContractTypes = async (): Promise<Array<{id: number, Type: string}>> => {
    if (!user?.accessToken) {
      return [];
    }

    try {
      const response = await axiosInstance.get('/Templet/BringTypeOFContract', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (response.status === 200 && response.data?.data) {
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      return [];
    }
  };

  return {
    createProject,
    getContractTypes,
    loading,
    error,
    clearError: () => setError(null)
  };
};
