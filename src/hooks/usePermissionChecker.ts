'use client';

import { useAppSelector } from '@/store';
import { PermissionType } from '@/types/permissions';

/**
 * Hook for checking permissions exactly like mobile app
 * Replicates the ValidityUser.tsx logic from mobile app
 */
export default function usePermissionChecker() {
  const { user, validity, boss } = useAppSelector((state: any) => state.user || {});

  /**
   * Check if user has a specific permission
   * Replicates KnowValidity function from mobile app
   */
  const checkPermission = (permission: PermissionType): boolean => {
    try {
      // If user is Admin, allow everything
      if (user?.data?.job === 'Admin') {
        return true;
      }

      // If user is branch manager and permission is not 'Admin', allow
      if (boss === 'مدير الفرع' && permission !== 'Admin') {
        return true;
      }

      // Check if permission exists in validity array
      return Array.isArray(validity) ? validity.includes(permission) : false;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  };

  /**
   * Check if user is employee (موظف)
   * Matches mobile app logic exactly
   */
  const isEmployee = (): boolean => {
    return user?.data?.jobdiscrption === 'موظف';
  };

  /**
   * Check if user is Admin
   */
  const isAdmin = (): boolean => {
    return user?.data?.job === 'Admin';
  };

  /**
   * Check if user is branch manager
   */
  const isBranchManager = (): boolean => {
    return boss === 'مدير الفرع';
  };

  /**
   * Check if user is finance (مالية)
   */
  const isFinance = (): boolean => {
    return user?.data?.jobdiscrption === 'مالية';
  };

  /**
   * Get user role
   */
  const getUserRole = (): string => {
    return user?.data?.jobdiscrption || user?.data?.job || 'غير محدد';
  };

  /**
   * Get all user permissions
   */
  const getUserPermissions = (): PermissionType[] => {
    return Array.isArray(validity) ? validity : [];
  };

  /**
   * Check multiple permissions (OR logic)
   */
  const hasAnyPermission = (permissions: PermissionType[]): boolean => {
    return permissions.some(permission => checkPermission(permission));
  };

  /**
   * Check multiple permissions (AND logic)
   */
  const hasAllPermissions = (permissions: PermissionType[]): boolean => {
    return permissions.every(permission => checkPermission(permission));
  };

  /**
   * Permission checks for common actions (matching mobile app patterns)
   */
  const canCreateProject = (): boolean => {
    return checkPermission('إنشاء المشروع');
  };

  const canDeleteProject = (): boolean => {
    return checkPermission('حذف المشروع');
  };

  const canCloseProject = (): boolean => {
    return checkPermission('اغلاق المشروع');
  };

  const canCreateStage = (): boolean => {
    return checkPermission('إضافة مرحلة رئيسية');
  };

  const canDeleteStage = (): boolean => {
    return checkPermission('حذف مرحلة رئيسية');
  };

  const canEditStage = (): boolean => {
    return checkPermission('تعديل مرحلة رئيسية');
  };

  const canCreateSubStage = (): boolean => {
    return checkPermission('اضافة مرحلة فرعية');
  };

  const canEditSubStage = (): boolean => {
    return checkPermission('تعديل مرحلة فرعية');
  };

  const canDeleteSubStage = (): boolean => {
    return checkPermission('حذف مرحلة فرعية');
  };

  const canManageFiles = (): boolean => {
    return checkPermission('انشاء مجلد او تعديله');
  };

  const canCreateRequests = (): boolean => {
    return checkPermission('إنشاء طلبات');
  };

  const canCheckRequests = (): boolean => {
    return checkPermission('تشييك الطلبات');
  };

  const canManageFinance = (): boolean => {
    return checkPermission('انشاء عمليات مالية');
  };

  const canEditPermissions = (): boolean => {
    return checkPermission('تعديل صلاحيات');
  };

  const canArrangeStages = (): boolean => {
    return checkPermission('ترتيب المراحل');
  };

  const canLockStage = (): boolean => {
    return checkPermission('اقفال المرحلة');
  };

  const canCheckSubStageAchievements = (): boolean => {
    return checkPermission('تشييك الانجازات الفرعية');
  };

  const canAddDelays = (): boolean => {
    return checkPermission('إضافة تأخيرات');
  };

  const canAccessCovenant = (): boolean => {
    return checkPermission('covenant');
  };

  const canViewFinanceNotifications = (): boolean => {
    return checkPermission('إشعارات المالية');
  };

  return {
    // Core permission checking
    checkPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // User role checks
    isEmployee,
    isAdmin,
    isBranchManager,
    isFinance,
    getUserRole,
    getUserPermissions,
    
    // Specific permission checks
    canCreateProject,
    canDeleteProject,
    canCloseProject,
    canCreateStage,
    canDeleteStage,
    canEditStage,
    canCreateSubStage,
    canEditSubStage,
    canDeleteSubStage,
    canManageFiles,
    canCreateRequests,
    canCheckRequests,
    canManageFinance,
    canEditPermissions,
    canArrangeStages,
    canLockStage,
    canCheckSubStageAchievements,
    canAddDelays,
    canAccessCovenant,
    canViewFinanceNotifications
  };
}
