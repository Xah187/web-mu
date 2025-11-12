'use client';

import { useAppSelector } from '@/store';
import { PermissionType, PermissionCheckResult, SPECIALIZED_JOB_PERMISSIONS } from '@/types/permissions';
import { Tostget } from '@/components/ui/Toast';

/**
 * Get specialized job permissions based on job description
 */
const getSpecializedJobPermissions = (jobDescription: string): PermissionType[] | null => {
  return SPECIALIZED_JOB_PERMISSIONS[jobDescription] || null;
};

/**
 * Custom hook for user permission validation
 * Replicates the exact logic from the mobile app's ValidityUser.tsx
 */
export default function useValidityUser() {
  const { user, boss, Validity: rawValidity } = useAppSelector(state => state.user);

  // ✅ التأكد من أن Validity هو array وليس string - مطابق للتطبيق المحمول
  let Validity: PermissionType[] = [];

  if (typeof rawValidity === 'string') {
    try {
      Validity = JSON.parse(rawValidity);
      console.log('✅ [useValidityUser] تم تحويل Validity من string إلى array');
    } catch (e) {
      console.error('❌ [useValidityUser] فشل تحويل Validity من string:', e);
      Validity = [];
    }
  } else if (Array.isArray(rawValidity)) {
    Validity = rawValidity;
  }

  // Debug: Log Validity changes
  console.log('🔍 [useValidityUser] Current Validity:', {
    'rawValidity type': typeof rawValidity,
    'Validity type': typeof Validity,
    'isArray': Array.isArray(Validity),
    'Validity.length': Validity?.length,
    'Validity sample': Validity?.slice(0, 3),
    'user.data.job': user?.data?.job,
    boss
  });

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
        // Apply mobile app logic: مالية is treated as Admin (HomeAdmin.tsx line 119)
        const effectiveJob = users?.data?.job === 'مالية' ? 'Admin' : users?.data?.job;

        // Admin (including مالية) has all permissions
        if (effectiveJob === 'Admin') {
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

        // Special logic for covenant permission - matching mobile app ValidityUser.tsx
        // In mobile app, covenant is checked ONLY through Validity.includes('اضافة عهد')
        // NO special logic for requests managers or Acceptingcovenant
        // The covenant permission is granted through:
        // 1. Admin (always has access)
        // 2. Branch Manager (boss === 'مدير الفرع')
        // 3. Users with 'اضافة عهد' in their Validity array
        if (kind === 'covenant' || kind === 'اضافة عهد') {
          // Mobile app ValidityUser.tsx line 27-40:
          // Just checks Validity.includes(kind)
          // No special logic for requests managers
          // Covenant access is controlled by the 'اضافة عهد' permission only
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
      // Apply mobile app logic: مالية is treated as Admin (HomeAdmin.tsx line 119)
      const effectiveJob = user?.data?.job === 'مالية' ? 'Admin' : user?.data?.job;

      // Admin (including مالية) has all permissions
      if (effectiveJob === 'Admin') {
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

      // Special logic for requests permissions - matching mobile app RequestsFunction.tsx line 246
      // Checks both job and jobdiscrption for requests-related roles
      if (kind === 'تشييك الطلبات' || kind === 'إنشاء طلبات') {
        const jobDescription = user?.data?.jobdiscrption || '';
        const job = user?.data?.job || '';

        // Check if user is requests manager (like mobile app logic)
        // Pattern: "مسئول طلبيات ثقيلة", "مسئول طلبيات خفيفة", "مسئول طلبيات"
        if (jobDescription === 'مسئول طلبيات' ||
            jobDescription.includes('طلبيات') ||
            job === 'مسئول طلبيات' ||
            job.includes('طلبيات')) {
          return true;
        }
      }

      // Special logic for covenant permission - matching mobile app ValidityUser.tsx
      // In mobile app, covenant is checked ONLY through Validity.includes('اضافة عهد')
      // NO special logic for requests managers or Acceptingcovenant
      // The covenant permission is granted through:
      // 1. Admin (always has access)
      // 2. Branch Manager (boss === 'مدير الفرع')
      // 3. Users with 'اضافة عهد' in their Validity array
      if (kind === 'covenant' || kind === 'اضافة عهد') {
        // Mobile app ValidityUser.tsx line 27-40:
        // Just checks Validity.includes(kind)
        // No special logic for requests managers
        // Covenant access is controlled by the 'اضافة عهد' permission only
      }

      // Special logic for specialized jobs - matching mobile app
      const jobDescription = user?.data?.jobdiscrption || '';
      const job = user?.data?.job || '';

      // Check specialized job permissions
      const specializedPermissions = getSpecializedJobPermissions(jobDescription) ||
                                   getSpecializedJobPermissions(job);

      if (specializedPermissions && specializedPermissions.includes(kind)) {
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

  /**
   * Check if user can access requests (either create or check)
   * Matches mobile app logic where both permissions allow access to requests
   */
  const canAccessRequests = async (projectId: number = 0): Promise<boolean> => {
    const canCreate = await Uservalidation('إنشاء طلبات', projectId);
    const canCheck = await Uservalidation('تشييك الطلبات', projectId);
    return canCreate || canCheck;
  };

  /**
   * Check if user has requests permission (sync version)
   * Matching mobile app RequestsFunction.tsx line 246 and line 258
   */
  const hasRequestsPermission = (): boolean => {
    const jobDescription = user?.data?.jobdiscrption || '';
    const job = user?.data?.job || '';

    // Check if user is requests manager (like mobile app logic)
    // Pattern: "مسئول طلبيات ثقيلة", "مسئول طلبيات خفيفة", "مسئول طلبيات"
    const isRequestsManager =
      jobDescription === 'مسئول طلبيات' ||
      jobDescription.includes('طلبيات') ||
      job === 'مسئول طلبيات' ||
      job.includes('طلبيات');

    return isRequestsManager || hasPermission('إنشاء طلبات') || hasPermission('تشييك الطلبات');
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
    canAccessRequests,
    hasRequestsPermission,
    
    // Raw state
    user,
    boss,
    Validity,
  };
}
