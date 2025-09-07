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
  TypeSub: string;
  numberBuilding: number;
  Referencenumber: number;
  Contractsigningdate: string;
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

    setLoading(true);
    setError(null);

    try {
      // تحضير البيانات مطابق للتطبيق المحمول
      const TypeOf = formData.TypeOFContract.includes('حر') 
        ? 'حر' 
        : `${formData.TypeOFContract} ${formData.TypeSub}`;

      const submitData = {
        ...formData,
        TypeOFContract: TypeOf,
        LocationProject: formData.LocationProject.startsWith('https')
          ? formData.LocationProject
          : null,
        Referencenumber: parseInt(String(formData.Referencenumber)) || 0,
        Contractsigningdate: new Date(formData.Contractsigningdate)
      };

      const response = await axiosInstance.post('/brinshCompany/v2/project', submitData, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (response.status === 200) {
        return true;
      }
      
      setError('فشل في إنشاء المشروع');
      return false;
    } catch (error: any) {
      console.error('خطأ في إنشاء المشروع:', error);
      setError(error.response?.data?.success || 'فشل في إنشاء المشروع');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProject,
    loading,
    error,
    clearError: () => setError(null)
  };
};
