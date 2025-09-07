'use client';

import { PermissionType, DEFAULT_ROLE_PERMISSIONS } from '@/types/permissions';

/**
 * Hook for automatically assigning permissions based on job and job description
 * Replicates mobile app's automatic permission assignment logic
 */
export default function useAutoPermissions() {
  
  /**
   * Get default permissions based on job and jobdiscrption
   * @param job - User's job title
   * @param jobdiscrption - User's job description/role
   */
  const getDefaultPermissions = (job: string, jobdiscrption: string): PermissionType[] => {
    // Normalize job titles
    const normalizedJob = job?.trim() || '';
    const normalizedJobDesc = jobdiscrption?.trim() || '';

    // Admin has all permissions
    if (normalizedJob === 'Admin' || normalizedJobDesc === 'Admin') {
      return [...DEFAULT_ROLE_PERMISSIONS['Admin']];
    }

    // مدير عام - General Manager
    if (normalizedJob === 'مدير عام' || normalizedJobDesc === 'مدير عام') {
      return [...DEFAULT_ROLE_PERMISSIONS['مدير عام']];
    }

    // مدير الفرع - Branch Manager
    if (normalizedJob === 'مدير الفرع' || normalizedJobDesc === 'مدير الفرع') {
      return [...DEFAULT_ROLE_PERMISSIONS['مدير الفرع']];
    }

    // مالية - Finance
    if (normalizedJob === 'مالية' || normalizedJobDesc === 'مالية') {
      return [...DEFAULT_ROLE_PERMISSIONS['مالية']];
    }

    // موظف - Employee (default)
    if (normalizedJob === 'موظف' || normalizedJobDesc === 'موظف') {
      return [...DEFAULT_ROLE_PERMISSIONS['موظف']];
    }

    // Additional job-specific permissions based on mobile app patterns
    const jobSpecificPermissions: Record<string, PermissionType[]> = {
      // Technical roles
      'مهندس الموقع': [
        'تشييك الانجازات الفرعية',
        'إضافة تأخيرات',
        'انشاء مجلد او تعديله'
      ],
      'مهندس مشروع': [
        'إضافة مرحلة رئيسية',
        'تعديل مرحلة رئيسية',
        'ترتيب المراحل',
        'تشييك الانجازات الفرعية'
      ],
      'مشرف الموقع': [
        'اضافة مرحلة فرعية',
        'تشييك الانجازات الفرعية',
        'إضافة تأخيرات'
      ],
      
      // Management roles
      'مدير تنفيذي': [
        'إضافة مرحلة رئيسية',
        'تعديل مرحلة رئيسية',
        'اقفال المرحلة',
        'ترتيب المراحل',
        'إنشاء طلبات',
        'تشييك الطلبات'
      ],
      'مدير المشروع': [
        'إضافة مرحلة رئيسية',
        'تعديل مرحلة رئيسية',
        'ترتيب المراحل',
        'إنشاء طلبات',
        'تشييك الطلبات'
      ],
      
      // Financial roles
      'محاسب': [
        'انشاء عمليات مالية',
        'إشعارات المالية'
      ],
      'مدير مالي': [
        'انشاء عمليات مالية',
        'إشعارات المالية',
        'تشييك الطلبات'
      ],
      
      // HR roles
      'موارد بشرية': [
        'إنشاء طلبات',
        'تشييك الطلبات'
      ],
      
      // Quality roles
      'مستشار جودة': [
        'تشييك الانجازات الفرعية',
        'اقفال المرحلة',
        'تشييك الطلبات'
      ]
    };

    // Check for job-specific permissions
    if (jobSpecificPermissions[normalizedJob]) {
      return [...jobSpecificPermissions[normalizedJob]];
    }

    if (jobSpecificPermissions[normalizedJobDesc]) {
      return [...jobSpecificPermissions[normalizedJobDesc]];
    }

    // Default to employee permissions if no specific match
    return [...DEFAULT_ROLE_PERMISSIONS['موظف']];
  };

  /**
   * Get boss status based on job and jobdiscrption
   * @param job - User's job title
   * @param jobdiscrption - User's job description/role
   */
  const getBossStatus = (job: string, jobdiscrption: string): string => {
    const normalizedJob = job?.trim() || '';
    const normalizedJobDesc = jobdiscrption?.trim() || '';

    // Check if user is a branch manager
    if (normalizedJob === 'مدير الفرع' || normalizedJobDesc === 'مدير الفرع') {
      return 'مدير الفرع';
    }

    return '';
  };

  /**
   * Get user role display name
   * @param job - User's job title
   * @param jobdiscrption - User's job description/role
   */
  const getUserRoleDisplay = (job: string, jobdiscrption: string): string => {
    const normalizedJob = job?.trim() || '';
    const normalizedJobDesc = jobdiscrption?.trim() || '';

    if (normalizedJob === 'Admin' || normalizedJobDesc === 'Admin') {
      return 'مدير النظام';
    }

    if (normalizedJob === 'مدير عام' || normalizedJobDesc === 'مدير عام') {
      return 'مدير عام';
    }

    if (normalizedJob === 'مدير الفرع' || normalizedJobDesc === 'مدير الفرع') {
      return 'مدير الفرع';
    }

    if (normalizedJob === 'مالية' || normalizedJobDesc === 'مالية') {
      return 'مالية';
    }

    // Return the most specific job title
    return normalizedJobDesc || normalizedJob || 'موظف';
  };

  /**
   * Check if a job role has administrative privileges
   * @param job - User's job title
   * @param jobdiscrption - User's job description/role
   */
  const hasAdminPrivileges = (job: string, jobdiscrption: string): boolean => {
    const normalizedJob = job?.trim() || '';
    const normalizedJobDesc = jobdiscrption?.trim() || '';

    const adminRoles = ['Admin', 'مدير عام', 'مدير تنفيذي'];
    
    return adminRoles.includes(normalizedJob) || adminRoles.includes(normalizedJobDesc);
  };

  /**
   * Check if a job role has branch management privileges
   * @param job - User's job title
   * @param jobdiscrption - User's job description/role
   */
  const hasBranchManagementPrivileges = (job: string, jobdiscrption: string): boolean => {
    const normalizedJob = job?.trim() || '';
    const normalizedJobDesc = jobdiscrption?.trim() || '';

    const branchManagerRoles = ['مدير الفرع', 'مدير المشروع', 'مدير تنفيذي'];
    
    return branchManagerRoles.includes(normalizedJob) || branchManagerRoles.includes(normalizedJobDesc);
  };

  /**
   * Check if a job role has financial privileges
   * @param job - User's job title
   * @param jobdiscrption - User's job description/role
   */
  const hasFinancialPrivileges = (job: string, jobdiscrption: string): boolean => {
    const normalizedJob = job?.trim() || '';
    const normalizedJobDesc = jobdiscrption?.trim() || '';

    const financialRoles = ['مالية', 'محاسب', 'مدير مالي'];
    
    return financialRoles.includes(normalizedJob) || financialRoles.includes(normalizedJobDesc);
  };

  return {
    getDefaultPermissions,
    getBossStatus,
    getUserRoleDisplay,
    hasAdminPrivileges,
    hasBranchManagementPrivileges,
    hasFinancialPrivileges
  };
}
