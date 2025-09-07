'use client';

import { useAppSelector } from '@/store';
import { PermissionType, PermissionCheckResult } from '@/types/permissions';
import { Tostget } from '@/components/ui/Toast';

/**
 * Custom hook for user permission validation
 * Replicates the exact logic from the mobile app's ValidityUser.tsx
 */
export default function useValidityUser() {
  const { user, boss, Validity } = useAppSelector(state => state.user);

  /**
   * Main validation function
   * @param kind - Permission type to check
   * @param id - User ID (optional, defaults to 0)
   * @param users - User object (optional, defaults to current user)
   * @param idBransh - Branch ID (optional, defaults to 0)
   */
  const Uservalidation = async (
    kind: PermissionType, 
    id: number | string = 0, 
    users = user, 
    idBransh: number = 0
  ): Promise<boolean> => {
    const result = await KnowValidity(kind, users);
    
    if (result) {
      return true;
    } else {
      // Only show error if it's not the current user and not a covenant operation
      if (id !== user?.data?.PhoneNumber && kind !== 'covenant' as any) {
        Tostget('ليس في نطاق صلاحياتك');
        
        // TODO: Add notification handling similar to mobile app
        // handleNotificationAll(
        //   'ليس في نطاق صلاحياتك',
        //   'عزيزي المستخدم العملية الذي تحاول القيام بها ليست في نطاق صلاحياتك',
        // );
      }
      return false;
    }
  };

  /**
   * Core permission checking logic
   * Replicates the exact logic from mobile app
   * @param kind - Permission type to check
   * @param users - User object (optional, defaults to current user)
   */
  const KnowValidity = (kind: PermissionType, users = user): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Apply mobile app logic exactly: only job === 'Admin' is admin
        if (users?.data?.job === 'Admin') {
          return resolve(true);
        }
        
        // If user's JOB (not boss status) is branch manager and permission is not 'Admin', allow access
        // This ensures permissions are based on actual job role, not branch-specific status
        if (users?.data?.job === 'مدير الفرع' && kind !== 'Admin') {
          return resolve(true);
        }
        
        // If the boss status (from API) indicates branch manager and permission is not 'Admin'
        // But this should only be a secondary check, not primary
        if (boss === 'مدير الفرع' && kind !== 'Admin') {
          return resolve(true);
        }
        
        // Check if permission exists in Validity array
        return Array.isArray(Validity) 
          ? resolve(Validity.includes(kind)) 
          : resolve(false);
      } catch (error) {
        console.error('Permission validation error:', error);
        reject(error);
      }
    });
  };

  /**
   * Synchronous permission check (for UI rendering)
   * @param kind - Permission type to check
   */
  const hasPermission = (kind: PermissionType): boolean => {
    try {
      // Apply mobile app logic exactly: only job === 'Admin' is admin
      if (user?.data?.job === 'Admin') {
        return true;
      }
      
      // If user's JOB (not boss status) is branch manager and permission is not 'Admin', return true
      // This ensures permissions are based on actual job role
      if (user?.data?.job === 'مدير الفرع' && kind !== 'Admin') {
        return true;
      }
      
      // If the boss status indicates branch manager and permission is not 'Admin'
      // But this should only be a secondary check
      if (boss === 'مدير الفرع' && kind !== 'Admin') {
        return true;
      }
      
      // Check if permission exists in Validity array
      return Array.isArray(Validity) && Validity.includes(kind);
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  };

  /**
   * Check if user is Admin (exactly like mobile app)
   */
  const isAdmin = (): boolean => {
    return user?.data?.job === 'Admin';
  };

  /**
   * Check if user is Branch Manager
   * Priority: actual job role first, then boss status
   */
  const isBranchManager = (): boolean => {
    // Primary check: actual job role
    if (user?.data?.job === 'مدير الفرع') {
      return true;
    }
    
    // Secondary check: boss status from API
    return boss === 'مدير الفرع';
  };

  /**
   * Check if user is Finance role
   */
  const isFinance = (): boolean => {
    return user?.data?.jobdiscrption === 'مالية' || user?.data?.job === 'مالية';
  };

  /**
   * Check if user is Employee
   */
  const isEmployee = (): boolean => {
    return user?.data?.jobdiscrption === 'موظف';
  };

  /**
   * Get user role for display purposes (exactly like mobile app ChackMangment)
   */
  const getUserRole = (): string => {
    const job = user?.data?.job || '';
    const jobHOM = user?.data?.jobdiscrption || '';

    // If user is branch manager, show job
    if (job === 'مدير الفرع') {
      return job;
    }

    // Otherwise prefer jobHOM (jobdiscrption) over job (like mobile app)
    return jobHOM || job || 'غير محدد';
  };

  /**
   * Get all available permissions for current user
   */
  const getUserPermissions = (): PermissionType[] => {
    if (isAdmin()) {
      // Admin has all permissions
      return [...Validity, 'Admin'] as PermissionType[];
    }
    
    if (isBranchManager()) {
      // Branch manager has all permissions except Admin
      return Validity.filter(p => p !== 'Admin');
    }
    
    return Validity;
  };

  return {
    // Main validation function (async)
    Uservalidation,
    
    // Quick permission checks (sync)
    hasPermission,
    isAdmin,
    isBranchManager,
    isFinance,
    isEmployee,
    
    // User info
    getUserRole,
    getUserPermissions,
    
    // Raw state
    user,
    boss,
    Validity,
  };
}
