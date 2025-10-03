'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';

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
}

// قائمة الصلاحيات المتاحة - مطابق للتطبيق المحمول
const AVAILABLE_PERMISSIONS = [
  'اقفال المرحلة',
  'اضافة مرحلة فرعية',
  'إضافة مرحلة رئيسية',
  'تعديل مرحلة رئيسية',
  'تشييك الانجازات الفرعية',
  'إضافة تأخيرات',
  'انشاء مجلد او تعديله',
  'انشاء عمليات مالية',
  'ترتيب المراحل',
  'إنشاء طلبات',
  'تشييك الطلبات',
  'إشعارات المالية',
];

export default function PermissionsModal({
  isOpen,
  onClose,
  member,
  onSuccess
}: PermissionsModalProps) {
  const { user } = useSelector((state: any) => state.user || {});
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && member) {
      fetchUserPermissions();
    }
  }, [isOpen, member]);

  if (!isOpen || !member) return null;

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      // جلب صلاحيات المستخدم الحالية - مطابق للتطبيق المحمول
      const response = await axiosInstance.get(
        `/user/BringUserCompanyinv2?IDCompany=${user?.data?.IDCompany}&idBrinsh=0&type=justuser&number=0&kind_request=all`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.data?.data) {
        const userData = response.data.data.find((u: any) => u.id === member.id);
        if (userData && userData.Validity) {
          try {
            const validity = JSON.parse(userData.Validity);

            // Extract global permissions (idBrinsh === 0) - matching mobile app logic
            let userPermissions: string[] = [];
            if (Array.isArray(validity)) {
              const globalEntry = validity.find((v: any) => parseInt(v.idBrinsh) === 0);
              if (globalEntry?.Validity && Array.isArray(globalEntry.Validity)) {
                userPermissions = globalEntry.Validity;
              }
            }

            setSelectedPermissions(userPermissions);

            // تحديد الصلاحيات المتاحة (غير المحددة)
            const available = AVAILABLE_PERMISSIONS.filter(
              permission => !userPermissions.includes(permission)
            );
            setAvailablePermissions(available);
          } catch (error) {
            console.error('Error parsing validity:', error);
            setSelectedPermissions([]);
            setAvailablePermissions(AVAILABLE_PERMISSIONS);
          }
        } else {
          setSelectedPermissions([]);
          setAvailablePermissions(AVAILABLE_PERMISSIONS);
        }
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setSelectedPermissions([]);
      setAvailablePermissions(AVAILABLE_PERMISSIONS);
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
      // تحديث صلاحيات المستخدم - مطابق للتطبيق المحمول
      const updateData = {
        id: member.id,
        userName: member.userName,
        IDNumber: (member as any).IDNumber || '',
        PhoneNumber: member.PhoneNumber,
        Email: member.Email,
        job: member.job,
        jobdiscrption: member.jobdiscrption,
        Validity: JSON.stringify([{
          idBrinsh: 0, // Global permissions
          Validity: selectedPermissions,
          project: []
        }])
      };

      const response = await axiosInstance.put('/user/updat', updateData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      if (response.data?.success === 'تمت العملية بنجاح') {
        Tostget('تم تحديث الصلاحيات بنجاح');

        // If updating current user's permissions, refresh them in Redux
        if (member.PhoneNumber === user?.data?.PhoneNumber) {
          // Reload permissions for current user
          try {
            const { fetchUserPermissions } = await import('@/functions/permissions/fetchPermissions');
            await fetchUserPermissions(user.accessToken, user);
            console.log('✅ Current user permissions refreshed after update');
          } catch (error) {
            console.error('Failed to refresh current user permissions:', error);
          }
        }

        onSuccess();
        onClose();
      } else {
        Tostget(response.data?.success || 'فشل في تحديث الصلاحيات');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
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
