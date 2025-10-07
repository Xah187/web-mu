'use client';

import { useState, useCallback } from 'react';
import { useAppSelector } from '@/store';
import axiosInstance from '@/lib/api/axios';
import { BranchData } from '@/hooks/useCompanyData';
import { Tostget } from '@/components/ui/Toast';

export interface BranchUpdateData {
  id: string;
  NameSub: string;
  BranchAddress: string;
  Email: string;
  PhoneNumber: string;
  Linkevaluation?: string;
}

export default function useBranchOperations() {
  const { user } = useAppSelector(state => state.user);
  const [loading, setLoading] = useState(false);

  /**
   * Update branch basic data
   * Replicates mobile app's UpdateBrinshCompany API
   */
  const updateBranchData = useCallback(async (branchData: BranchUpdateData): Promise<boolean> => {
    if (!user?.accessToken) {
      throw new Error('لا يوجد رمز مصادقة');
    }

    setLoading(true);
    
    try {
      const response = await axiosInstance.put(
        'company/brinsh/Update',
        branchData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      if (response.status === 200) {
        return true;
      }
      
      throw new Error(response.data?.message || 'فشل في تحديث بيانات الفرع');
    } catch (error: any) {
      console.error('Error updating branch data:', error);
      
      if (error.response?.status === 401) {
        throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
      } else if (error.response?.status === 403) {
        throw new Error('ليس لديك صلاحية لتعديل بيانات الفرع');
      } else if (error.response?.status === 404) {
        throw new Error('الفرع غير موجود');
      } else {
        throw new Error(error.response?.data?.message || 'فشل في تحديث بيانات الفرع');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  /**
   * Add evaluation link to branch
   * Replicates mobile app's InsertLinkevaluation API
   */
  const addEvaluationLink = useCallback(async (branchId: string, link: string): Promise<boolean> => {
    if (!user?.accessToken) {
      throw new Error('لا يوجد رمز مصادقة');
    }

    setLoading(true);
    
    try {
      const response = await axiosInstance.post(
        'company/brinsh/InsertLinkevaluation',
        {
          IDBranch: branchId,
          Linkevaluation: link
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      if (response.status === 200) {
        Tostget(response.data?.success || 'تم إضافة رابط التقييم بنجاح', 'success');
        return true;
      }
      
      throw new Error(response.data?.message || 'فشل في إضافة رابط التقييم');
    } catch (error: any) {
      console.error('Error adding evaluation link:', error);
      
      if (error.response?.status === 401) {
        throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
      } else if (error.response?.status === 403) {
        throw new Error('ليس لديك صلاحية لإضافة رابط التقييم');
      } else {
        throw new Error(error.response?.data?.message || 'فشل في إضافة رابط التقييم');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  /**
   * Request branch deletion with verification code
   * Replicates mobile app's Branchdeletionprocedures API
   */
  const requestBranchDeletion = useCallback(async (branchId: string): Promise<boolean> => {
    console.log('requestBranchDeletion called with branchId:', branchId);

    if (!user?.accessToken) {
      console.error('No access token available');
      throw new Error('لا يوجد رمز مصادقة');
    }

    setLoading(true);

    try {
      console.log('Making fetch request to /api/branches/delete-request');

      const response = await fetch('/api/branches/delete-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({ branchId })
      });

      console.log('Fetch response status:', response.status);
      const data = await response.json();
      console.log('Fetch response data:', data);

      if (response.ok) {
        console.log('Branch deletion request successful');
        Tostget(data?.success || 'تم إرسال رمز التحقق إلى هاتفك', 'success');
        return true;
      }

      throw new Error(data?.success || 'فشل في إرسال رمز التحقق');
    } catch (error: any) {
      console.error('Error requesting branch deletion:', error);

      if (error.message) {
        throw error;
      }

      throw new Error('فشل في إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  /**
   * Confirm branch deletion with verification code
   * Replicates mobile app's Implementedbyopreation API
   *
   * Uses Next.js API route as proxy to handle session properly
   */
  const confirmBranchDeletion = useCallback(async (verificationCode: string): Promise<boolean> => {
    if (!user?.accessToken) {
      throw new Error('لا يوجد رمز مصادقة');
    }

    setLoading(true);

    try {
      console.log('=== Confirming branch deletion ===');
      console.log('Verification code:', verificationCode);
      console.log('User token:', user.accessToken.substring(0, 20) + '...');

      // Call backend directly using axios instance (matching mobile app exactly)
      // This ensures Authorization header is sent properly and backend JWT middleware
      // can populate req.session.user
      console.log('Calling backend directly with axios DELETE request...');

      const response = await axiosInstance.delete(
        `company/brinsh/Implementedbyopreation?check=${verificationCode}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      console.log('✅ Backend response received');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.status === 200 && response.data?.success) {
        console.log('✅✅✅ Branch deletion confirmed successfully! ✅✅✅');
        console.log('Success message:', response.data.success);
        Tostget(response.data.success || 'تم حذف الفرع بنجاح', 'success');
        return true;
      }

      const errorMsg = response.data?.success || response.data?.message || 'فشل في حذف الفرع';
      console.log('❌ Backend returned error:', errorMsg);
      throw new Error(errorMsg);
    } catch (error: any) {
      console.error('❌ Error confirming branch deletion:', error);

      // Handle axios error
      if (error.response) {
        const errorMsg = error.response.data?.success || error.response.data?.message || 'فشل في حذف الفرع';
        throw new Error(`${errorMsg} (${error.response.status})`);
      }

      if (error.message) {
        throw error;
      }

      throw new Error('فشل في حذف الفرع');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  /**
   * Get branch users for management
   * This will be used for future implementation of member management
   */
  const getBranchUsers = useCallback(async (branchId: string) => {
    if (!user?.accessToken) {
      throw new Error('لا يوجد رمز مصادقة');
    }

    setLoading(true);
    
    try {
      const response = await axiosInstance.get(
        `user/BringUserCompanyBrinsh?IDCompany=${user?.data?.IDCompany}&idBrinsh=${branchId}&type=justuser`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      if (response.status === 200) {
        return response.data?.data || [];
      }
      
      throw new Error(response.data?.message || 'فشل في جلب بيانات المستخدمين');
    } catch (error: any) {
      console.error('Error fetching branch users:', error);
      
      if (error.response?.status === 401) {
        throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
      } else if (error.response?.status === 403) {
        throw new Error('ليس لديك صلاحية لعرض مستخدمي الفرع');
      } else if (error.response?.status === 404) {
        throw new Error('الفرع غير موجود');
      } else {
        throw new Error(error.response?.data?.message || 'فشل في جلب بيانات المستخدمين');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  /**
   * Update branch manager
   * This will be implemented later based on mobile app's logic
   */
  const updateBranchManager = useCallback(async (branchId: string, managerId: string): Promise<boolean> => {
    if (!user?.accessToken) {
      throw new Error('لا يوجد رمز مصادقة');
    }

    setLoading(true);
    
    try {
      // TODO: Implement based on mobile app's API
      // For now, return a placeholder
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Tostget('ميزة تغيير مدير الفرع ستكون متاحة قريباً');
      return false;
    } catch (error: any) {
      console.error('Error updating branch manager:', error);
      throw new Error('فشل في تحديث مدير الفرع');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  /**
   * Update branch finance permissions
   * This will be implemented later based on mobile app's logic
   */
  const updateFinancePermissions = useCallback(async (branchId: string, enabled: boolean): Promise<boolean> => {
    if (!user?.accessToken) {
      throw new Error('لا يوجد رمز مصادقة');
    }

    setLoading(true);
    
    try {
      // TODO: Implement based on mobile app's API
      // For now, return a placeholder
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Tostget('ميزة إدارة الصلاحيات المالية ستكون متاحة قريباً');
      return false;
    } catch (error: any) {
      console.error('Error updating finance permissions:', error);
      throw new Error('فشل في تحديث الصلاحيات المالية');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  return {
    loading,
    updateBranchData,
    addEvaluationLink,
    requestBranchDeletion,
    confirmBranchDeletion,
    getBranchUsers,
    updateBranchManager,
    updateFinancePermissions,
  };
}
