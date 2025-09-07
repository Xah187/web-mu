'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/store';
import { PermissionType } from '@/types/permissions';

/**
 * Job-based permissions hook
 * This hook provides permissions based ONLY on the user's job role
 * and does not change based on branch context
 * 
 * This replicates the mobile app's main page permission logic
 * where permissions are determined by job role only
 */
export default function useJobBasedPermissions() {
  const { user, Validity } = useAppSelector(state => state.user);

  /**
   * Check if user is Admin based on job only (exactly like mobile app)
   * In mobile app: user.data.job === 'Admin'
   * مالية is NOT treated as Admin in mobile app logic
   */
  const isAdmin = useMemo(() => {
    return user?.data?.job === 'Admin';
  }, [user?.data?.job]);

  /**
   * Check if user is Branch Manager based on job only
   * This does NOT consider branch-specific boss status
   */
  const isBranchManager = useMemo(() => {
    return user?.data?.job === 'مدير الفرع';
  }, [user?.data?.job]);

  /**
   * Check if user is Finance based on job only
   */
  const isFinance = useMemo(() => {
    return user?.data?.job === 'مالية' ||
           user?.data?.jobdiscrption === 'مالية';
  }, [user?.data?.job, user?.data?.jobdiscrption]);

  /**
   * Check if user is Employee based on jobdiscrption (exactly like mobile app)
   * Mobile app uses: user.data.jobdiscrption === 'موظف'
   */
  const isEmployee = useMemo(() => {
    return user?.data?.jobdiscrption === 'موظف';
  }, [user?.data?.jobdiscrption]);

  /**
   * Get display role exactly like mobile app ChackMangment function
   * Mobile app logic: prefer jobHOM over job in some cases
   */
  const getDisplayRole = useMemo(() => {
    const job = user?.data?.job || '';
    const jobHOM = user?.data?.jobdiscrption || '';

    // If user is branch manager, show job
    if (job === 'مدير الفرع') {
      return job;
    }

    // Otherwise prefer jobHOM (jobdiscrption) over job (like mobile app)
    return jobHOM || job || 'غير محدد';
  }, [user?.data?.job, user?.data?.jobdiscrption]);

  /**
   * Job-based permission check
   * This function checks permissions based ONLY on:
   * 1. User's job role (Admin, مدير الفرع, مالية, etc.)
   * 2. User's validity array for specific permissions
   * 
   * It does NOT consider branch-specific boss status
   */
  const hasJobPermission = useMemo(() => {
    return (permission: PermissionType): boolean => {
      try {
        // Apply mobile app logic exactly: only job === 'Admin' is admin
        if (user?.data?.job === 'Admin') {
          return true;
        }

        // Branch manager has access to most operations (except Admin-only)
        if (user?.data?.job === 'مدير الفرع' && permission !== 'Admin') {
          return true;
        }
        
        // Check validity array for specific permissions
        if (Array.isArray(Validity)) {
          return Validity.includes(permission);
        }
        
        return false;
      } catch (error) {
        console.error('Job-based permission check error:', error);
        return false;
      }
    };
  }, [user?.data?.job, Validity]);

  /**
   * Get user's display role (uses getDisplayRole like mobile app)
   */
  const getUserRole = useMemo(() => getDisplayRole, [getDisplayRole]);

  /**
   * Get all available permissions based on job
   */
  const getJobPermissions = useMemo(() => {
    if (isAdmin) {
      // Admin has all permissions including Admin-only ones
      const allPermissions: PermissionType[] = [
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
      return allPermissions;
    }
    
    if (isBranchManager) {
      // Branch manager has all permissions except Admin
      return (Validity || []).filter(p => p !== 'Admin');
    }
    
    return Validity || [];
  }, [isAdmin, isBranchManager, Validity]);

  /**
   * Common permission helper functions based on job only
   */
  const permissionHelpers = useMemo(() => ({
    // Administrative permissions
    canCreateBranch: () => hasJobPermission('Admin'),
    canEditPermissions: () => hasJobPermission('تعديل صلاحيات'),
    canDeleteUser: (userJob?: string) => (isAdmin || isBranchManager) && userJob !== 'Admin',
    
    // Project management permissions
    canCreateProject: () => isAdmin || isBranchManager || hasJobPermission('إنشاء طلبات'),
    canManageStage: () => hasJobPermission('إضافة مرحلة رئيسية') || hasJobPermission('تعديل مرحلة رئيسية'),
    canLockStage: () => hasJobPermission('اقفال المرحلة'),
    canAddSubStage: () => hasJobPermission('اضافة مرحلة فرعية'),
    canArrangeStages: () => hasJobPermission('ترتيب المراحل'),
    
    // Financial permissions
    canManageFinance: () => hasJobPermission('انشاء عمليات مالية') || isFinance,
    canViewFinanceNotifications: () => hasJobPermission('إشعارات المالية'),
    canManageCovenant: () => hasJobPermission('covenant') || isAdmin || isFinance,
    
    // Request management
    canCreateRequests: () => hasJobPermission('إنشاء طلبات'),
    canCheckRequests: () => hasJobPermission('تشييك الطلبات'),
    
    // Document management
    canCreateFolder: () => hasJobPermission('انشاء مجلد او تعديله'),
    
    // Delay management
    canAddDelays: () => hasJobPermission('إضافة تأخيرات'),
    
    // Achievement checking
    canCheckAchievements: () => hasJobPermission('تشييك الانجازات الفرعية'),
    
    // General access levels
    canViewReports: () => isAdmin || isBranchManager || isFinance,
    canViewSettings: () => !isEmployee,
    canViewAllBranches: () => isAdmin,
  }), [hasJobPermission, isAdmin, isBranchManager, isFinance, isEmployee]);

  return {
    // Permission checks
    hasJobPermission,
    
    // Role checks
    isAdmin,
    isBranchManager,
    isFinance,
    isEmployee,
    
    // User info
    getUserRole,
    getJobPermissions,
    
    // Helper functions
    ...permissionHelpers,
    
    // Raw data
    user,
    Validity,
  };
}
