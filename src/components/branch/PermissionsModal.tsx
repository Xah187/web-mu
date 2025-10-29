'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import { BRANCH_PERMISSIONS, PROJECT_PERMISSIONS, PermissionType } from '@/types/permissions';

interface BranchMember {
  id: number;
  userName: string;
  PhoneNumber: string;
  Email: string;
  job: string;
  jobdiscrption: string;
  jobHOM?: string;
  image?: string;
  Date: string;
}

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: BranchMember | null;
  onSuccess: () => void;
  branchId?: number; // Branch ID for API call - matching mobile app
  type?: string | number; // Type for API call - matching mobile app (0 for branch, number for project)
}

export default function PermissionsModal({
  isOpen,
  onClose,
  member,
  onSuccess,
  branchId,
  type = 0 // Default to 0 for branch permissions (matching mobile app)
}: PermissionsModalProps) {
  const { user } = useSelector((state: any) => state.user || {});
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]); // Track original permissions for comparison

  useEffect(() => {
    if (isOpen && member) {
      fetchUserPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, member]);

  if (!isOpen || !member) return null;

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);

      // مطابق للتطبيق المحمول PageUsers.tsx السطر 284
      // استخدام البيانات الموجودة في member prop بدلاً من جلبها من API
      let userPermissions: string[] = [];

      // تحديد الصلاحيات حسب النوع (فرع أو مشروع)
      const validityData = type === 0 || !Number(type)
        ? (member as any).ValidityBransh
        : (member as any).ValidityProject;

      console.log('📊 جلب صلاحيات المستخدم:', {
        memberId: member.id,
        memberName: member.userName,
        type: type,
        validityData: validityData
      });

      if (validityData) {
        try {
          // Handle both string and array formats
          let validity = validityData;

          // If it's a string, parse it
          if (typeof validity === 'string') {
            validity = JSON.parse(validity);
          }

          // ValidityBransh/ValidityProject is an array of permissions
          if (Array.isArray(validity)) {
            userPermissions = validity;
          }
        } catch (error) {
          console.error('❌ خطأ في تحليل الصلاحيات:', error);
        }
      }

      console.log('✅ الصلاحيات الحالية:', userPermissions);

      setSelectedPermissions(userPermissions);
      setOriginalPermissions(userPermissions); // Store original for comparison

      // تحديد الصلاحيات المتاحة (غير المحددة)
      const permissionsList = type === 0 || !Number(type)
        ? BRANCH_PERMISSIONS
        : PROJECT_PERMISSIONS;

      const available = permissionsList.filter(
        (permission: PermissionType) => !userPermissions.includes(permission)
      );
      setAvailablePermissions(available);

      console.log('📋 الصلاحيات المتاحة:', available);
    } catch (error) {
      console.error('❌ خطأ في جلب الصلاحيات:', error);
      setSelectedPermissions([]);
      setOriginalPermissions([]);
      setAvailablePermissions(type === 0 || !Number(type) ? BRANCH_PERMISSIONS : PROJECT_PERMISSIONS);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permission: string) => {
    const isSelected = selectedPermissions.includes(permission);
    
    if (isSelected) {
      // إزالة الصلاحية
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
      setAvailablePermissions(prev => [...prev, permission]);
    } else {
      // إضافة الصلاحية
      setSelectedPermissions(prev => [...prev, permission]);
      setAvailablePermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // مطابق للتطبيق المحمول PageUsers.tsx السطر 180-204
      // بناء checkGloblenew مطابق للتطبيق المحمول
      const checkGloblenew: any = {};
      const checkGlobleold: any = {};

      // Compare current permissions with original
      const addedPermissions = selectedPermissions.filter(p => !originalPermissions.includes(p));
      const removedPermissions = originalPermissions.filter(p => !selectedPermissions.includes(p));

      console.log('📊 تحليل التغييرات:', {
        original: originalPermissions,
        current: selectedPermissions,
        added: addedPermissions,
        removed: removedPermissions
      });

      // If there are changes, prepare the data
      if (addedPermissions.length > 0 || removedPermissions.length > 0) {
        // Add user to checkGloblenew with updated permissions
        checkGloblenew[member.id] = {
          id: member.id,
          Validity: selectedPermissions
        };
      } else {
        Tostget('لم يتم إجراء أي تغييرات');
        setLoading(false);
        return;
      }

      // مطابق للتطبيق المحمول - استخدام نفس البارامترات
      // PageUsers.tsx السطر 67: let kind = Number(type) ? 'user' : type;
      // للفرع: type='user', kind='user'
      const updateData = {
        idBrinsh: branchId || user?.data?.IDCompanyBransh || 0,
        type: 'user', // ✅ للفرع 'user' مطابق للتطبيق المحمول
        checkGloblenew: checkGloblenew,
        checkGlobleold: checkGlobleold,
        kind: 'user' // ✅ مطابق للتطبيق المحمول
      };

      console.log('📤 إرسال تحديث الصلاحيات:', updateData);

      const response = await axiosInstance.put('/user/updat/userBrinshv2', updateData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      console.log('📥 استجابة API:', response.data);

      if (response.data?.success === 'successfuly' || response.data?.success === 'تمت العملية بنجاح') {
        Tostget('تم تحديث الصلاحيات بنجاح');

        // If updating current user's permissions, refresh them in Redux
        if (member.PhoneNumber === user?.data?.PhoneNumber) {
          // Reload permissions for current user
          try {
            const { fetchUserPermissions } = await import('@/functions/permissions/fetchPermissions');
            await fetchUserPermissions(user.accessToken, user);
            console.log('✅ تم تحديث صلاحيات المستخدم الحالي');
          } catch (error) {
            console.error('فشل في تحديث صلاحيات المستخدم الحالي:', error);
          }
        }

        onSuccess();
        onClose();
      } else {
        console.error('❌ فشل التحديث:', response.data);
        Tostget(response.data?.success || 'فشل في تحديث الصلاحيات');
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث الصلاحيات:', error);
      Tostget('خطأ في تحديث الصلاحيات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-6 text-center">
          تعديل صلاحيات المستخدم
        </h3>
        
        <div className="mb-6 text-center">
          <p className="text-sm font-ibm-arabic-medium text-gray-600">
            المستخدم: <span className="font-ibm-arabic-bold text-blue-600">{member.userName}</span>
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* الصلاحيات المحددة */}
            <div>
              <h4 className="text-md font-ibm-arabic-bold text-green-700 mb-4">
                الصلاحيات المحددة ({selectedPermissions.length})
              </h4>
              
              {selectedPermissions.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {selectedPermissions.map((permission) => (
                    <button
                      key={permission}
                      onClick={() => handlePermissionToggle(permission)}
                      className="p-3 text-sm font-ibm-arabic-medium rounded-lg border border-green-500 bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-right flex items-center justify-between"
                    >
                      <span>{permission}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد صلاحيات محددة</p>
              )}
            </div>

            {/* الصلاحيات المتاحة */}
            <div>
              <h4 className="text-md font-ibm-arabic-bold text-gray-700 mb-4">
                الصلاحيات المتاحة ({availablePermissions.length})
              </h4>
              
              {availablePermissions.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {availablePermissions.map((permission) => (
                    <button
                      key={permission}
                      onClick={() => handlePermissionToggle(permission)}
                      className="p-3 text-sm font-ibm-arabic-medium rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-right flex items-center justify-between"
                    >
                      <span>{permission}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">جميع الصلاحيات محددة</p>
              )}
            </div>
          </div>
        )}
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
          >
            إلغاء
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الحفظ...
              </>
            ) : (
              'حفظ التغييرات'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
