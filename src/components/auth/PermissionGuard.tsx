'use client';

import React from 'react';
import useValidityUser from '@/hooks/useValidityUser';
import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';
import { PermissionType } from '@/types/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: PermissionType;
  permissions?: PermissionType[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission
  fallback?: React.ReactNode;
  showError?: boolean;
  onPermissionDenied?: () => void;
}

/**
 * Permission Guard Component
 * Shows/hides content based on user permissions
 * Replicates mobile app's permission checking logic
 */
export default function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  showError = false,
  onPermissionDenied
}: PermissionGuardProps) {
  const { hasPermission } = useValidityUser();

  // Build permissions array
  const permissionsToCheck: PermissionType[] = [];
  if (permission) permissionsToCheck.push(permission);
  if (permissions.length > 0) permissionsToCheck.push(...permissions);

  // If no permissions specified, show content
  if (permissionsToCheck.length === 0) {
    return <>{children}</>;
  }

  // Check permissions
  let hasAccess = false;
  
  if (requireAll) {
    // User must have ALL permissions
    hasAccess = permissionsToCheck.every(perm => hasPermission(perm));
  } else {
    // User needs ANY permission
    hasAccess = permissionsToCheck.some(perm => hasPermission(perm));
  }

  // Handle permission denied
  if (!hasAccess) {
    if (onPermissionDenied) {
      onPermissionDenied();
    }
    
    if (showError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-600 font-cairo">
            ليس في نطاق صلاحياتك
          </p>
          <p className="text-red-500 text-sm font-cairo mt-1">
            عذراً، لا تملك الصلاحية للوصول إلى هذا المحتوى
          </p>
        </div>
      );
    }
    
    return <>{fallback}</>;
  }

  // User has permission, show content
  return <>{children}</>;
}

// Specialized permission guards for common use cases

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showError?: boolean;
}

export function AdminGuard({ children, fallback, showError }: AdminGuardProps) {
  return (
    <PermissionGuard
      permission="Admin"
      fallback={fallback}
      showError={showError}
    >
      {children}
    </PermissionGuard>
  );
}

interface BranchManagerGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showError?: boolean;
}

export function BranchManagerGuard({ children, fallback, showError }: BranchManagerGuardProps) {
  const { isBranchManager } = useValidityUser();
  
  if (!isBranchManager()) {
    if (showError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-600 font-cairo">
            مخصص لمدير الفرع فقط
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface FinanceGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showError?: boolean;
}

export function FinanceGuard({ children, fallback, showError }: FinanceGuardProps) {
  const { isFinance, canManageFinance, isAdmin } = useJobBasedPermissions();
  
  // Allow access for admins, finance users, or users with finance management permission
  const hasAccess = isAdmin || isFinance || canManageFinance();
  
  if (!hasAccess) {
    if (showError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-600 font-cairo">
            مخصص للمالية فقط
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface EmployeeRestrictedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showError?: boolean;
}

export function EmployeeRestricted({ children, fallback, showError }: EmployeeRestrictedProps) {
  const { isEmployee } = useValidityUser();

  // Show content only if user is NOT an employee
  if (isEmployee()) {
    if (showError) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-600 font-cairo">
            غير متاح للموظفين
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// New components that replicate mobile app's hiding behavior

interface JobBasedVisibilityProps {
  children: React.ReactNode;
  showForEmployee?: boolean; // Show only for employees (like mobile app)
  hideForEmployee?: boolean; // Hide for employees (like mobile app)
  showForJobRole?: 'موظف' | 'مدير الفرع' | 'مالية' | 'Admin';
  hideForJobRole?: 'موظف' | 'مدير الفرع' | 'مالية' | 'Admin';
  fallback?: React.ReactNode;
}

/**
 * Job-based visibility component that replicates mobile app's display logic
 * Uses the same pattern as mobile app: display: 'none' vs 'flex'
 */
export function JobBasedVisibility({
  children,
  showForEmployee = false,
  hideForEmployee = false,
  showForJobRole,
  hideForJobRole,
  fallback = null
}: JobBasedVisibilityProps) {
  const { isEmployee } = useJobBasedPermissions();
  const { user } = useJobBasedPermissions();

  const userJobRole = user?.data?.jobdiscrption || user?.data?.job;

  // Check if should show for employee only (like mobile app pattern)
  if (showForEmployee && !isEmployee) {
    return <>{fallback}</>;
  }

  // Check if should hide for employee (like mobile app pattern)
  if (hideForEmployee && isEmployee) {
    return <>{fallback}</>;
  }

  // Check specific job role to show
  if (showForJobRole && userJobRole !== showForJobRole) {
    return <>{fallback}</>;
  }

  // Check specific job role to hide
  if (hideForJobRole && userJobRole === hideForJobRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Employee-only component (replicates mobile app's employee-only sections)
 * Matches pattern: display: user?.data?.jobdiscrption === 'موظف' ? 'flex' : 'none'
 */
export function EmployeeOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <JobBasedVisibility showForEmployee={true} fallback={fallback}>
      {children}
    </JobBasedVisibility>
  );
}

/**
 * Non-employee component (replicates mobile app's non-employee sections)
 * Matches pattern: display: user?.data?.jobdiscrption !== 'موظف' ? 'flex' : 'none'
 */
export function NonEmployeeOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <JobBasedVisibility hideForEmployee={true} fallback={fallback}>
      {children}
    </JobBasedVisibility>
  );
}

/**
 * Permission-based visibility with complete hiding (like mobile app)
 * When user doesn't have permission, the component is completely hidden (not just disabled)
 */
interface PermissionBasedVisibilityProps {
  children: React.ReactNode;
  permission?: PermissionType;
  permissions?: PermissionType[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function PermissionBasedVisibility({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null
}: PermissionBasedVisibilityProps) {
  const { hasPermission } = useValidityUser();

  // Build permissions array
  const permissionsToCheck: PermissionType[] = [];
  if (permission) permissionsToCheck.push(permission);
  if (permissions.length > 0) permissionsToCheck.push(...permissions);

  // If no permissions specified, show content
  if (permissionsToCheck.length === 0) {
    return <>{children}</>;
  }

  // Check permissions
  let hasAccess = false;

  if (requireAll) {
    // User must have ALL permissions
    hasAccess = permissionsToCheck.every(perm => hasPermission(perm));
  } else {
    // User needs ANY permission
    hasAccess = permissionsToCheck.some(perm => hasPermission(perm));
  }

  // If no access, completely hide (like mobile app)
  if (!hasAccess) {
    return <>{fallback}</>;
  }

  // User has permission, show content
  return <>{children}</>;
}

/**
 * Owner Guard Component
 * Shows content only for users with job "مالك"
 * Note: In mobile app, "مالك" is treated as regular employee with no special privileges
 * They follow the same filtering rules as other employees
 */
interface OwnerGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showError?: boolean;
}

export function OwnerGuard({ children, fallback = null, showError = false }: OwnerGuardProps) {
  const { user } = useJobBasedPermissions();

  // Check if user's job is "مالك"
  const isOwner = user?.data?.job === 'مالك';

  if (!isOwner) {
    if (showError) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-600 font-cairo">
            هذا المحتوى للمالك فقط
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Non-Owner Guard Component
 * Shows content for all users except "مالك"
 */
export function NonOwnerGuard({ children, fallback = null, showError = false }: OwnerGuardProps) {
  const { user } = useJobBasedPermissions();

  // Check if user's job is NOT "مالك"
  const isOwner = user?.data?.job === 'مالك';

  if (isOwner) {
    if (showError) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-600 font-cairo">
            هذا المحتوى غير متاح للمالك
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
