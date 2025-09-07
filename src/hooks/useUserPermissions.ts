'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppSelector } from '@/store';
import { Tostget } from '@/components/ui/Toast';

// Define all permission types from the mobile app
export type PermissionType = 
  | 'Admin'
  | 'اقفال المرحلة'
  | 'اضافة مرحلة فرعية'
  | 'إضافة مرحلة رئيسية'
  | 'تعديل مرحلة رئيسية'
  | 'تشييك الانجازات الفرعية'
  | 'إضافة تأخيرات'
  | 'انشاء مجلد او تعديله'
  | 'انشاء عمليات مالية'
  | 'ترتيب المراحل'
  | 'إنشاء طلبات'
  | 'تشييك الطلبات'
  | 'إشعارات المالية'
  | 'تعديل صلاحيات'
  | 'covenant';

// Define job roles from the mobile app
export type JobRole = 
  | 'Admin'
  | 'مالية'
  | 'مدير الفرع'
  | 'مدير عام'
  | 'مدير تنفيذي'
  | 'موارد بشرية'
  | 'مستشار جودة'
  | 'موظف';

export interface UserPermissions {
  job: JobRole;
  boss: string;
  validity: PermissionType[];
  phoneNumber: string;
}

export interface UseUserPermissionsReturn {
  checkPermission: (permission: PermissionType, targetUserId?: string) => Promise<boolean>;
  hasPermission: (permission: PermissionType) => boolean;
  isAdmin: boolean;
  isBranchManager: boolean;
  isFinance: boolean;
  userPermissions: UserPermissions | null;
  showPermissionError: (permission: PermissionType) => void;
}

export default function useUserPermissions(): UseUserPermissionsReturn {
  const { user, Validity, boss } = useAppSelector(state => state.user);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);

  // Initialize user permissions
  useEffect(() => {
    if (user?.data) {
      setUserPermissions({
        job: user.data.job as JobRole,
        boss: boss || '',
        validity: Array.isArray(Validity) ? Validity as PermissionType[] : [],
        phoneNumber: user.data.PhoneNumber || ''
      });
    }
  }, [user, Validity, boss]);

  // Check if user is Admin (مالية is treated as Admin in mobile app)
  const isAdmin = useMemo(() => {
    return user?.data?.job === 'Admin' || user?.data?.job === 'مالية';
  }, [user?.data?.job]);

  // Check if user is Branch Manager
  const isBranchManager = useMemo(() => {
    // Primary check: actual job role
    if (user?.data?.job === 'مدير الفرع') {
      return true;
    }
    
    // Secondary check: boss status from API
    return boss === 'مدير الفرع';
  }, [boss, user?.data?.job]);

  // Check if user is Finance
  const isFinance = useMemo(() => {
    return user?.data?.job === 'مالية' || user?.data?.job === 'Admin';
  }, [user?.data?.job]);

  // Core permission validation function - matches mobile app logic exactly
  const validatePermission = useCallback((permission: PermissionType, userData = user): boolean => {
    try {
      // In mobile app: let job = users?.data?.job === 'مالية' ? 'Admin' : users?.data?.job;
      // So مالية is treated as Admin
      const effectiveJob = userData?.data?.job === 'مالية' ? 'Admin' : userData?.data?.job;
      
      // Admin (including مالية) always has access
      if (effectiveJob === 'Admin') {
        return true;
      }

      // Primary check: user's actual job role as branch manager
      if (userData?.data?.job === 'مدير الفرع' && permission !== 'Admin') {
        return true;
      }

      // Secondary check: boss status from API (but actual job role takes priority)
      if (boss === 'مدير الفرع' && permission !== 'Admin') {
        return true;
      }

      // Check validity array for specific permissions
      if (Array.isArray(Validity)) {
        return (Validity as PermissionType[]).includes(permission);
      }

      return false;
    } catch (error) {
      console.error('Permission validation error:', error);
      return false;
    }
  }, [user, boss, Validity]);

  // Synchronous permission check
  const hasPermission = useCallback((permission: PermissionType): boolean => {
    return validatePermission(permission);
  }, [validatePermission]);

  // Asynchronous permission check with error handling
  const checkPermission = useCallback(async (
    permission: PermissionType, 
    targetUserId?: string
  ): Promise<boolean> => {
    try {
      const hasAccess = validatePermission(permission);
      
      if (!hasAccess) {
        // Special case for covenant - don't show error for own phone number
        if (permission === 'covenant' && targetUserId === user?.data?.PhoneNumber) {
          return false;
        }

        // Show error message for unauthorized access
        if (targetUserId !== user?.data?.PhoneNumber) {
          showPermissionError(permission);
        }
        
        return false;
      }

      return true;
    } catch (error) {
      console.error('Permission check error:', error);
      showPermissionError(permission);
      return false;
    }
  }, [validatePermission, user?.data?.PhoneNumber]);

  // Show permission error message
  const showPermissionError = useCallback((permission: PermissionType) => {
    const errorMessage = 'ليس في نطاق صلاحياتك';
    Tostget(errorMessage);
    
    // TODO: Add notification handling like mobile app
    // handleNotificationAll(
    //   'ليس في نطاق صلاحياتك',
    //   'عزيزي المستخدم العملية الذي تحاول القيام بها ليست في نطاق صلاحياتك',
    // );
  }, []);

  return {
    checkPermission,
    hasPermission,
    isAdmin,
    isBranchManager,
    isFinance,
    userPermissions,
    showPermissionError
  };
}

// Helper hook for specific permission checks
export function usePermissionCheck() {
  const { checkPermission, hasPermission, isAdmin, isBranchManager, isFinance } = useUserPermissions();

  return {
    // Common permission checks
    canCreateBranch: () => hasPermission('Admin'),
    canManageCovenant: () => isAdmin || isFinance,
    canEditUser: () => isAdmin || isBranchManager,
    canDeleteUser: (userJob: JobRole) => (isAdmin || isBranchManager) && userJob !== 'Admin',
    canManageProject: () => isAdmin || isBranchManager || hasPermission('إنشاء طلبات'),
    canManageStage: () => hasPermission('إضافة مرحلة رئيسية') || hasPermission('تعديل مرحلة رئيسية'),
    canManageFinance: () => hasPermission('انشاء عمليات مالية') || isFinance,
    canViewReports: () => isAdmin || isBranchManager || isFinance,
    
    // Async permission checks
    checkCreateBranch: () => checkPermission('Admin'),
    checkManageCovenant: () => checkPermission('covenant'),
    checkEditPermissions: () => checkPermission('تعديل صلاحيات'),
    checkManageStage: (stageType: 'main' | 'sub' = 'main') => 
      checkPermission(stageType === 'main' ? 'إضافة مرحلة رئيسية' : 'اضافة مرحلة فرعية'),
    
    // Role checks
    isAdmin,
    isBranchManager,
    isFinance
  };
}
