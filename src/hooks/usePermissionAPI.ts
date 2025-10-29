'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setValidity, setBoss } from '@/store/slices/userSlice';
import axiosInstance from '@/lib/api/axios';
import { PermissionType, BossType } from '@/types/permissions';
import useFallbackPermissions from '@/hooks/useFallbackPermissions';

/**
 * Hook for fetching user permissions from API
 * Replicates the mobile app's permission fetching logic
 */
export default function usePermissionAPI() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.user);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 2;
  
  // Use fallback permissions when API fails
  useFallbackPermissions();

  /**
   * Fetch user permissions from API
   * Based on mobile app's ApisAllCompanybransh.tsx logic
   */
  const fetchUserPermissions = async (): Promise<void> => {
    if (!user?.accessToken || !user?.data?.IDCompany) {
      console.warn('Cannot fetch permissions: missing token or company ID');
      return;
    }

    // Check if we've exceeded retry limit
    if (retryCountRef.current >= MAX_RETRIES) {
      console.warn('Permission API retry limit exceeded, skipping call');
      return;
    }

    try {
      const apiUrl = `user/BringUserCompany?IDCompany=${user.data.IDCompany}&number=0&kind_request=all`;
      console.log('Fetching user permissions from:', apiUrl);
      
      // API call to get user permissions - matching the mobile app's GET method
      const response = await axiosInstance.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (response.status === 200 && response.data) {
        // Set validity permissions if available
        // الواجهة تعيد مصفوفة مستخدمين، نحتاج صلاحيات المستخدم الحالي فقط إن وُجدت
        const validityFromList = Array.isArray(response.data?.data)
          ? (response.data.data.find((u: any) => u?.PhoneNumber === user?.data?.PhoneNumber)?.Validity || [])
          : (response.data?.Validity || []);
        dispatch(setValidity(validityFromList as PermissionType[]));

        console.log('Permissions fetched successfully:', {
          validity: response.data.Validity,
          boss: response.data.boss
        });
      }
    } catch (error: any) {
      console.error('Error fetching user permissions:', error);
      
      // Handle specific error cases
      if (error.response?.status === 500) {
        console.error('Server error - API may be down or misconfigured');
        retryCountRef.current += 1;
        if (retryCountRef.current >= MAX_RETRIES) {
          console.error('Max retries reached, stopping permission API calls');
          return;
        }
      } else if (error.response?.status === 401) {
        console.warn('Unauthorized access - token may be expired');
      } else if (error.response?.status === 404) {
        console.warn('API endpoint not found - check API configuration');
      }
      
      // Don't clear permissions here - let fallback permissions handle it
      console.log('API permissions failed, fallback permissions will be used');
    }
  };

  /**
   * Fetch branch-specific permissions
   * Based on mobile app's branch permission logic
   */
  const fetchBranchPermissions = async (branchId: string): Promise<void> => {
    if (!user?.accessToken || !user?.data?.IDCompany) {
      console.warn('Cannot fetch branch permissions: missing token or company ID');
      return;
    }

    try {
      // API call to get branch-specific permissions
      // الباك اند الجديد يستخدم GET بدلاً من POST
      const response = await axiosInstance.get(
        `company/brinsh/bring?IDCompany=${user.data.IDCompany}&type=cache`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      if (response.status === 200 && response.data) {
        // Update boss status for this branch
        // Note: This should only affect context-specific permissions, 
        // not override the user's core job-based permissions
        if (response.data.boss) {
          dispatch(setBoss(response.data.boss as BossType));
        }

        console.log('Branch permissions fetched successfully:', {
          branchId,
          boss: response.data.boss,
          note: 'This does not override core job permissions'
        });
      }
    } catch (error) {
      console.error('Error fetching branch permissions:', error);
    }
  };

  /**
   * Initialize permissions on authentication
   */
  useEffect(() => {
    if (isAuthenticated && user?.accessToken) {
      // Reset retry count on new authentication
      retryCountRef.current = 0;
      
      // Add delay to prevent immediate API spam
      const timeoutId = setTimeout(() => {
        fetchUserPermissions();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Clear permissions when not authenticated
      dispatch(setValidity([]));
      dispatch(setBoss('' as BossType));
    }
  }, [isAuthenticated, user?.accessToken, dispatch]);

  /**
   * Manual refresh permissions
   */
  const refreshPermissions = async (): Promise<void> => {
    await fetchUserPermissions();
  };

  /**
   * Clear all permissions (for logout)
   */
  const clearPermissions = (): void => {
    dispatch(setValidity([]));
    dispatch(setBoss('' as BossType));
  };

  return {
    fetchUserPermissions,
    fetchBranchPermissions,
    refreshPermissions,
    clearPermissions
  };
}