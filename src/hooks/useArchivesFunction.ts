'use client';

import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import useValidityUser from '@/hooks/useValidityUser';

interface ArchiveFolder {
  ArchivesID: number;
  FolderName: string;
  ActivationHome: string;
  Activationchildren: string;
  children: string | null;
  ProjectID: number;
}

interface ArchiveFile {
  id: number;
  name: string;
  type: string;
  size: number;
  Date?: string;
  namefile?: string;
  Data?: any;
  kindPage?: string;
}

interface ModuleState {
  name?: string;
  verify?: boolean;
  id?: number;
  type?: string;
  nameOlde?: string;
}

export default function useArchivesFunction(idProject: number) {
  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();

  // States مطابقة للتطبيق المحمول
  const [arrafolder, setArrafolder] = useState<ArchiveFolder[]>([]);
  const [moudleBollen, setModulsBOOLEN] = useState<ModuleState>({});
  const [Input, setInput] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tilte, setTitle] = useState('');
  const [Id, setId] = useState<number>(0);
  const [Iddownload, setIddownload] = useState<number>(0);
  const [ViewDelays, setViewDelays] = useState(false);
  const [children, setChildren] = useState<ArchiveFile[]>([]);
  const [viewImage, setViewImage] = useState({ view: false, uri: '' });
  const [viewVedio, setViewVedio] = useState({ view: false, uri: '' });
  const [loading, setLoading] = useState(false);

  // جلب بيانات الأرشيف الرئيسية - مطابق للتطبيق المحمول
  const BringArchivesHome = useCallback(async (projectId: number): Promise<ArchiveFolder[]> => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/brinshCompany/BringArchives?idproject=${projectId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.status === 200) {
        const data = response.data?.data || [];
        console.log('📊 BringArchivesHome response:', data);

        // إزالة التكرارات المحتملة بناءً على ArchivesID
        const uniqueData = data.filter((item: any, index: number, self: any[]) =>
          index === self.findIndex((t: any) => t.ArchivesID === item.ArchivesID)
        );

        if (uniqueData.length !== data.length) {
          console.warn('⚠️ Removed duplicate folders:', data.length - uniqueData.length);
        }

        return uniqueData;
      }
      return [];
    } catch (error) {
      console.error('Error fetching archives:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  // جلب بيانات الأرشيف الرئيسية وتحديث الحالة
  const BringDataHom = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await BringArchivesHome(idProject);
      setArrafolder(result);
    } catch (error) {
      console.error('Error in BringDataHom:', error);
    } finally {
      setRefreshing(false);
    }
  }, [idProject, BringArchivesHome]);

  // إضافة مجلد جديد - مطابق للتطبيق المحمول
  const AddFolderArchivesnew = useCallback(async (data: { ProjectID: number; FolderName: string }) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        '/brinshCompany/AddFolderArchivesnew',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.status === 200) {
        Tostget(response.data?.success || 'تمت العملية بنجاح');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding folder:', error);
      Tostget('فشل في إنشاء المجلد');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  // إنشاء مجلد جديد - مطابق للتطبيق المحمول
  const CreatFoldernew = useCallback(async () => {
    try {
      if (Input !== null && Input.trim()) {
        const success = await AddFolderArchivesnew({ ProjectID: idProject, FolderName: Input });
        if (success) {
          setInput(null);
          setModulsBOOLEN({});
          await BringDataHom();
        }
      } else {
        Tostget('يجب إضافة اسم للمجلد');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  }, [Input, idProject, AddFolderArchivesnew, BringDataHom]);

  // تحديث الأرشيف - مطابق للتطبيق المحمول
  const UpdateArchives = useCallback(async (data: {
    ArchivesID: number;
    id: number;
    type: string;
    name: string;
    nameOld: string;
    kidopreation: string;
  }) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        '/brinshCompany/UpdateNameFolderOrfileinArchive',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.status === 200) {
        Tostget('تمت العملية بنجاح');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating archive:', error);
      Tostget('خطأ في تنفيذ العملية');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  // حذف مجلد أو ملف - مطابق للتطبيق المحمول
  const deleteOnpress = useCallback(async () => {
    try {
      if (!moudleBollen?.id) return;

      const success = await UpdateArchives({
        ArchivesID: moudleBollen.id,
        id: moudleBollen.id,
        type: moudleBollen.type || 'folder',
        name: Input || '',
        nameOld: moudleBollen.nameOlde || '',
        kidopreation: 'delete',
      });

      if (success) {
        setModulsBOOLEN({});
        await BringDataHom();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }, [moudleBollen, Input, UpdateArchives, BringDataHom]);

  // تحديث اسم مجلد أو ملف - مطابق للتطبيق المحمول
  const updateOnpress = useCallback(async () => {
    try {
      if (!moudleBollen?.id || !Input) return;

      const success = await UpdateArchives({
        ArchivesID: moudleBollen.id,
        id: moudleBollen.id,
        type: moudleBollen.type || 'folder',
        name: Input,
        nameOld: moudleBollen.nameOlde || '',
        kidopreation: 'update',
      });

      if (success) {
        setModulsBOOLEN({});
        setInput(null);
        await BringDataHom();
      }
    } catch (error) {
      console.error('Error updating:', error);
    }
  }, [moudleBollen, Input, UpdateArchives, BringDataHom]);

  // جلب محتويات المجلد الفرعي - مطابق للتطبيق المحمول
  const BringArchivesSubFolderdata = useCallback(async (
    ArchivesID: number,
    idSub: number,
    type: string,
    idproject: number
  ): Promise<ArchiveFile[]> => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/brinshCompany/BringArchivesFolderdata?ArchivesID=${ArchivesID}&idSub=${idSub}&type=${type}&idproject=${idproject}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.status === 200) {
        const data = response.data?.data || [];
        console.log('📊 BringArchivesSubFolderdata response:', data);

        // إزالة التكرارات المحتملة بناءً على id و name
        const uniqueData = data.filter((item: any, index: number, self: any[]) =>
          index === self.findIndex((t: any) => t.id === item.id && t.name === item.name)
        );

        if (uniqueData.length !== data.length) {
          console.warn('⚠️ Removed duplicate items:', data.length - uniqueData.length);
        }

        return uniqueData;
      }
      return [];
    } catch (error) {
      console.error('Error fetching folder data:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  // جلب بيانات المجلد - مطابق للتطبيق المحمول
  const BringData = useCallback(async (idHome: number, Id: number, type = 'Home') => {
    try {
      const result = await BringArchivesSubFolderdata(idHome, Id, type, idProject);
      setChildren(result);
    } catch (error) {
      console.error('Error in BringData:', error);
    }
  }, [idProject, BringArchivesSubFolderdata]);

  // إضافة ملف أو مجلد فرعي - مطابق للتطبيق المحمول
  const AddfileinFolderinArchivesnew = useCallback(async (data: {
    ArchivesID: number;
    id: number;
    type: string;
    name?: string;
    file?: File;
  }) => {
    try {
      setLoading(true);
      const formData = new FormData();

      if (data.type !== 'folder' && data.file) {
        formData.append('file', data.file);
      } else if (data.name) {
        formData.append('name', data.name);
      }

      formData.append('ArchivesID', data.ArchivesID.toString());
      formData.append('id', data.id.toString());
      formData.append('type', data.type);

      const response = await axiosInstance.post(
        '/brinshCompany/AddfileinFolderinArchivesnew',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.status === 200) {
        Tostget(response.data?.success || 'تمت العملية بنجاح');
        return response.status;
      }
      return 0;
    } catch (error) {
      console.error('Error adding file/folder:', error);
      Tostget('فشل في رفع الملف');
      return 0;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  // معالج العمليات - مطابق للتطبيق المحمول
  const handlerOpreation = useCallback(async (idHome: number, kind = 'folder', data: string | File | null = Input) => {
    if (data !== null) {
      const value: any = {
        ArchivesID: idHome,
        id: Id,
        type: kind,
      };

      if (kind === 'folder') {
        value.name = data as string;
      } else {
        value.file = data as File;
      }

      if (typeof data === 'object') {
        setViewDelays(true);
      }

      setModulsBOOLEN({});
      const result = await AddfileinFolderinArchivesnew(value);

      if (result === 0) {
        Tostget('فشل في رفع الملف');
      }

      setViewDelays(false);
      await BringData(idHome, Id);
      setInput(null);
    } else {
      Tostget(kind === 'folder' ? 'يجب اضافة اسم للملف' : 'يجب اختيار ملف لاضافته');
    }
  }, [Input, Id, AddfileinFolderinArchivesnew, BringData]);

  // حذف في الصفحة الفرعية - مطابق للتطبيق المحمول
  const deleteOnpressSub = useCallback(async (idHome: number) => {
    try {
      if (!moudleBollen?.id) return;

      const success = await UpdateArchives({
        ArchivesID: idHome,
        id: moudleBollen.id,
        type: moudleBollen.type || 'folder',
        name: Input || '',
        nameOld: moudleBollen.nameOlde || '',
        kidopreation: 'delete',
      });

      if (success) {
        setModulsBOOLEN({});
        await BringData(idHome, Id);
      }
    } catch (error) {
      console.error('Error deleting sub:', error);
    }
  }, [moudleBollen, Input, UpdateArchives, BringData, Id]);

  // تحديث في الصفحة الفرعية - مطابق للتطبيق المحمول
  const updateOnpressSub = useCallback(async (idHome: number) => {
    try {
      if (!moudleBollen?.id || !Input) return;

      const success = await UpdateArchives({
        ArchivesID: idHome,
        id: moudleBollen.id,
        type: moudleBollen.type || 'folder',
        name: Input,
        nameOld: moudleBollen.nameOlde || '',
        kidopreation: 'update',
      });

      if (success) {
        setModulsBOOLEN({});
        await BringData(idHome, Id);
      }
    } catch (error) {
      console.error('Error updating sub:', error);
    }
  }, [moudleBollen, Input, UpdateArchives, BringData, Id]);

  return {
    // States
    arrafolder,
    moudleBollen,
    Input,
    refreshing,
    tilte,
    Id,
    Iddownload,
    ViewDelays,
    children,
    viewImage,
    viewVedio,
    loading,

    // Setters
    setModulsBOOLEN,
    setInput,
    setRefreshing,
    setTitle,
    setId,
    setIddownload,
    setViewDelays,
    setChildren,
    setViewImage,
    setViewVedio,

    // Functions
    BringArchivesHome,
    BringDataHom,
    AddFolderArchivesnew,
    CreatFoldernew,
    UpdateArchives,
    deleteOnpress,
    updateOnpress,
    BringArchivesSubFolderdata,
    BringData,
    AddfileinFolderinArchivesnew,
    handlerOpreation,
    deleteOnpressSub,
    updateOnpressSub,
    Uservalidation,
  };
}
