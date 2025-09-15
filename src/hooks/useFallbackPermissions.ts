import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setValidity, setBoss } from '@/store/slices/userSlice';
import { PermissionType, BossType } from '@/types/permissions';

/**
 * Fallback permissions hook for when API is not available
 * Provides basic permissions based on user job description
 */
export const useFallbackPermissions = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.user);

  useEffect(() => {
    if (isAuthenticated && user?.data) {
      // Set fallback permissions based on user job
      const jobDescription = user.data.jobdiscrption || user.data.job || '';
      
      let permissions: PermissionType[] = [];
      let bossType: BossType = '';

      // Basic permission assignment based on job description
      if (jobDescription === 'موظف') {
        // أقل صلاحيات افتراضية
        permissions = [];
        bossType = '';
      } else if (jobDescription === 'مدير الفرع') {
        // مدير الفرع: معظم الصلاحيات باستثناء Admin-only
        permissions = [
          'اضافة مرحلة فرعية',
          'إضافة مرحلة رئيسية',
          'تعديل مرحلة رئيسية',
          'تشييك الانجازات الفرعية',
          'إضافة تأخيرات',
          'انشاء مجلد او تعديله',
          'ترتيب المراحل',
          'إنشاء طلبات',
          'تشييك الطلبات',
          'covenant'
        ];
        bossType = 'مدير الفرع';
      } else if (jobDescription === 'مالية') {
        // المالية
        permissions = [
          'انشاء عمليات مالية',
          'إشعارات المالية',
          'covenant'
        ];
        bossType = '';
      } else if (jobDescription === 'Admin' || jobDescription === 'مدير عام' || jobDescription === 'مدير تنفيذي') {
        // Admin: جميع الصلاحيات
        permissions = [
          'Admin',
          'اقفال المرحلة',
          'اضافة مرحلة فرعية',
          'إضافة مرحلة رئيسية',
          'تعديل مرحلة رئيسية',
          'تشييك الانجازات الفرعية',
          'إضافة تأخيرات',
          'انشاء مجلد او تعديله',
          'انشاء عمليات مالية',
          'ترتيب المراحل',
          'إنشاء طلبات',
          'تشييك الطلبات',
          'إشعارات المالية',
          'تعديل صلاحيات',
          'covenant'
        ];
        bossType = '';
      } else if (jobDescription === 'مسئول طلبيات' || jobDescription.includes('طلبيات')) {
        // مسئول الطلبيات - يمكنه تشييك الطلبيات
        permissions = [
          'تشييك الطلبات',
          'إنشاء طلبات'
        ];
        bossType = '';
      } else {
        // افتراضي
        permissions = [];
        bossType = '';
      }

      console.log('Setting fallback permissions for:', jobDescription, permissions);
      
      dispatch(setValidity(permissions));
      dispatch(setBoss(bossType));
    }
  }, [isAuthenticated, user?.data, dispatch]);

  return {
    setFallbackPermissions: (permissions: PermissionType[], boss: BossType) => {
      dispatch(setValidity(permissions));
      dispatch(setBoss(boss));
    }
  };
};

export default useFallbackPermissions;
