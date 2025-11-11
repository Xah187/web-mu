'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import PermissionList from '@/components/Permissions/PermissionList';
import { PermissionType } from '@/types/permissions';

interface ProjectPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: number;
    userName: string;
    PhoneNumber: string;
    ValidityProject?: string[];
  };
  projectId: number;
  branchId?: number; // إضافة branchId - مطابق للتطبيق المحمول
  onSuccess: () => void;
}

// مطابق للتطبيق المحمول AddValidity.tsx مع type=1 (project permissions)
export default function ProjectPermissionsModal({
  isOpen,
  onClose,
  member,
  projectId,
  branchId,
  onSuccess
}: ProjectPermissionsModalProps) {
  const { user } = useSelector((state: any) => state.user || {});
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && member.ValidityProject) {
      // تحميل الصلاحيات الحالية
      setSelectedPermissions(member.ValidityProject as PermissionType[]);
    }
  }, [isOpen, member]);

  const handleSave = async () => {
    try {
      if (selectedPermissions.length === 0) {
        Tostget('يرجى اختيار صلاحية واحدة على الأقل');
        return;
      }

      setLoading(true);

      // مطابق للتطبيق المحمول PageUsers.tsx السطر 180-204
      // بناء checkGloblenew مطابق للتطبيق المحمول
      const checkGloblenew = {
        [member.id]: {
          id: member.id,
          Validity: selectedPermissions
        }
      };

      // ✅ استخدام branchId إذا كان متوفراً وصالحاً، وإلا استخدام IDCompanyBransh - مطابق للتطبيق المحمول
      // التأكد من أن branchId رقم صحيح وليس string فارغ
      const finalBranchId = (branchId && !isNaN(Number(branchId)))
        ? parseInt(branchId.toString())
        : user?.data?.IDCompanyBransh;

      console.log('🔍 Debug branchId:', {
        branchId,
        'typeof branchId': typeof branchId,
        'user?.data?.IDCompanyBransh': user?.data?.IDCompanyBransh,
        finalBranchId,
        'typeof finalBranchId': typeof finalBranchId,
        projectId,
        'typeof projectId': typeof projectId
      });

      console.log('📊 تحديث صلاحيات المشروع:', {
        idBrinsh: finalBranchId,
        type: projectId, // ✅ رقم وليس string - مطابق للتطبيق المحمول
        checkGloblenew,
        checkGlobleold: {},
        kind: 'user'
      });

      // مطابق للتطبيق المحمول - استخدام نفس البارامترات
      const response = await axiosInstance.put(
        '/user/updat/userBrinshv2',
        {
          idBrinsh: finalBranchId,
          type: projectId, // ✅ رقم وليس string - مطابق للتطبيق المحمول
          checkGloblenew: checkGloblenew,
          checkGlobleold: {},
          kind: 'user'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      console.log('📊 API Response:', response.data);

      // Check for different success response formats from backend
      const isSuccess = response.data?.success === true ||
                       response.data?.success === 'successfuly' ||
                       response.data?.success === 'تمت العملية بنجاح';

      if (isSuccess) {
        Tostget('تم تحديث الصلاحيات بنجاح');

        // If updating current user's permissions, refresh them in Redux
        // مطابق للتطبيق المحمول - إعادة جلب الصلاحيات بعد التحديث
        console.log('🔍 Checking if current user:', {
          'member.PhoneNumber': member.PhoneNumber,
          'user?.data?.PhoneNumber': user?.data?.PhoneNumber,
          'member.userName': member.userName,
          'user?.data?.userName': user?.data?.userName,
          isCurrentUser: member.PhoneNumber === user?.data?.PhoneNumber
        });

        if (member.PhoneNumber === user?.data?.PhoneNumber) {
          console.log('✅ المستخدم الحالي - سيتم تحديث الصلاحيات في Redux');
          try {
            const { fetchUserPermissions } = await import('@/functions/permissions/fetchPermissions');
            await fetchUserPermissions(user.accessToken, user);
            console.log('✅ تم تحديث صلاحيات المستخدم الحالي في Redux');
          } catch (error) {
            console.error('فشل في تحديث صلاحيات المستخدم الحالي:', error);
          }
        } else {
          console.log('ℹ️ ليس المستخدم الحالي - لن يتم تحديث Redux');
        }

        onSuccess();
        onClose();
      } else {
        console.error('❌ فشل التحديث:', response.data);

        // Show detailed error message if available
        if (response.data?.errors) {
          console.error('❌ تفاصيل الأخطاء:', response.data.errors);
          const errorMessages = Object.values(response.data.errors).flat().join(', ');
          Tostget(`فشل في تحديث الصلاحيات: ${errorMessages}`);
        } else if (response.data?.message) {
          Tostget(`فشل في تحديث الصلاحيات: ${response.data.message}`);
        } else {
          Tostget('فشل في تحديث الصلاحيات');
        }
      }
    } catch (error) {
      console.error('❌ Error updating permissions:', error);
      Tostget('خطأ في تحديث الصلاحيات');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-ibm-arabic-bold text-gray-900">
              تعديل صلاحيات {member.userName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6 text-center">
            اختر الصلاحيات التي تريد منحها للمستخدم في هذا المشروع
          </p>

          {/* Permission List - مطابق للتطبيق المحمول AddValidity.tsx */}
          <PermissionList
            selectedPermissions={selectedPermissions}
            onPermissionChange={(perms) => setSelectedPermissions(perms as PermissionType[])}
            type="project"
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-ibm-arabic-semibold"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={loading || selectedPermissions.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-ibm-arabic-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

