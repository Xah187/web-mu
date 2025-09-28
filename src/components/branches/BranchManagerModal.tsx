'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import ButtonLong from '@/components/design/ButtonLong';
import { Tostget } from '@/components/ui/Toast';
import axiosInstance from '@/lib/api/axios';

interface BranchManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  branchName: string;
  onSuccess?: () => void;
}

interface User {
  id: number;
  userName: string;
  FirstName: string;
  LastName: string;
  jobdiscrption: string;
  Email: string;
  PhoneNumber: string;
  job: string;
}

/**
 * Branch Manager Modal Component
 * Replicates mobile app's UserCompanyAdmin with AdminSub kind functionality
 * 
 * Features:
 * - Load all company users
 * - Select new branch manager
 * - Update branch manager via API
 * - Matches mobile app's UI and behavior
 */
export default function BranchManagerModal({
  isOpen,
  onClose,
  branchId,
  branchName,
  onSuccess
}: BranchManagerModalProps) {
  const { user, size } = useAppSelector(state => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // مطابق للتطبيق المحمول - جلب جميع مستخدمي الشركة
      const response = await axiosInstance.get(
        `/user/BringUserCompanyinv2?IDCompany=${user?.data?.IDCompany}&idBrinsh=${branchId}&type=justuser&number=0&kind_request=all`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.data?.data) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Tostget('فشل في تحميل قائمة المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUserId) {
      Tostget('يرجى اختيار مدير الفرع الجديد');
      return;
    }

    try {
      setSubmitting(true);
      
      // مطابق للتطبيق المحمول - تحديث مدير الفرع
      const updateData = {
        idBrinsh: parseInt(branchId),
        type: 'مدير الفرع',
        checkGloblenew: [selectedUserId],
        checkGlobleold: [],
        kind: 'boss'
      };

      const response = await axiosInstance.put('/user/UpdatUserNewUpdatviltay', updateData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      if (response.status === 200) {
        Tostget('تم تحديث مدير الفرع بنجاح', 'success');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating branch manager:', error);
      Tostget(error.response?.data?.message || 'فشل في تحديث مدير الفرع', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="max-w-md w-full mx-4 shadow-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--theme-card-background)',
          border: '1px solid var(--theme-border)',
          borderRadius: `${scale(20)}px`,
          padding: `${scale(24)}px`,
          maxHeight: '80vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h3 
            className="font-semibold text-gray-900 mb-2"
            style={{
              fontSize: `${verticalScale(18 + (size || 0))}px`,
              fontFamily: fonts.IBMPlexSansArabicSemiBold
            }}
          >
            تغيير مدير فرع
          </h3>
          
          <p 
            className="text-gray-600"
            style={{
              fontSize: `${verticalScale(14 + (size || 0))}px`,
              lineHeight: 1.5
            }}
          >
            اختر مدير جديد لفرع "{branchName}"
          </p>
        </div>

        {/* Content */}
        <div 
          className="overflow-y-auto mb-6"
          style={{ maxHeight: '50vh' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="mr-2 text-gray-600">جاري تحميل المستخدمين...</span>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedUserId === user.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p 
                        className="font-semibold text-gray-900"
                        style={{
                          fontSize: `${verticalScale(14 + (size || 0))}px`,
                          fontFamily: fonts.IBMPlexSansArabicSemiBold
                        }}
                      >
                        {user.FirstName} {user.LastName}
                      </p>
                      <p 
                        className="text-gray-600"
                        style={{
                          fontSize: `${verticalScale(12 + (size || 0))}px`
                        }}
                      >
                        {user.userName} • {user.jobdiscrption}
                      </p>
                    </div>
                    
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedUserId === user.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedUserId === user.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد مستخدمين متاحين</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <ButtonLong
            text={submitting ? 'جاري التحديث...' : 'تحديث مدير الفرع'}
            Press={handleSubmit}
            disabled={submitting || !selectedUserId}
            backgroundColor={colors.BLUE}
            width="100%"
          />
          
          <ButtonLong
            text="إلغاء"
            Press={onClose}
            disabled={submitting}
            backgroundColor={colors.HOME}
            textColor={colors.BLACK}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}
