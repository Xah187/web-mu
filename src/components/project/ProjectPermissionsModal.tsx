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
  onSuccess: () => void;
}

// مطابق للتطبيق المحمول AddValidity.tsx مع type=1 (project permissions)
export default function ProjectPermissionsModal({
  isOpen,
  onClose,
  member,
  projectId,
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

      console.log('📊 تحديث صلاحيات المشروع:', {
        idBrinsh: user?.data?.IDCompanyBransh,
        type: projectId.toString(),
        checkGloblenew,
        checkGlobleold: {},
        kind: 'user'
      });

      // مطابق للتطبيق المحمول - استخدام نفس البارامترات
      const response = await axiosInstance.put(
        '/user/updat/userBrinshv2',
        {
          idBrinsh: user?.data?.IDCompanyBransh,
          type: projectId.toString(),
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

      if (response.data?.success) {
        Tostget('تم تحديث الصلاحيات بنجاح');
        onSuccess();
        onClose();
      } else {
        console.error('❌ فشل التحديث:', response.data);
        Tostget('فشل في تحديث الصلاحيات');
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

