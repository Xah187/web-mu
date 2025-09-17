'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import ButtonLong from '@/components/design/ButtonLong';
import { Tostget } from '@/components/ui/Toast';
import axiosInstance from '@/lib/api/axios';

interface BranchMembersModalProps {
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
 * Branch Members Modal Component
 * Replicates mobile app's UserCompanyAdmin with UserSub kind functionality
 * 
 * Features:
 * - Load all company users
 * - Select/deselect branch members
 * - Add/remove members from branch
 * - Matches mobile app's UI and behavior
 */
export default function BranchMembersModal({
  isOpen,
  onClose,
  branchId,
  branchName,
  onSuccess
}: BranchMembersModalProps) {
  const { user, size } = useAppSelector(state => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [currentMemberIds, setCurrentMemberIds] = useState<number[]>([]);
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
      
      // مطابق للتطبيق المحمول - جلب جميع مستخدمي الشركة مع معلومات الفرع
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
        
        // تحديد الأعضاء الحاليين في الفرع
        const checkGloble = response.data.checkGloble || {};
        const currentMembers = response.data.data
          .filter((user: User) => Object.keys(checkGloble).includes(String(user.id)))
          .map((user: User) => user.id);
        
        setCurrentMemberIds(currentMembers);
        setSelectedUserIds(currentMembers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Tostget('فشل في تحميل قائمة المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId: number) => {
    setSelectedUserIds(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // تحديد المستخدمين الجدد والمستخدمين المحذوفين
      const newMembers = selectedUserIds.filter(id => !currentMemberIds.includes(id));
      const removedMembers = currentMemberIds.filter(id => !selectedUserIds.includes(id));
      
      // مطابق للتطبيق المحمول - تحديث أعضاء الفرع
      const updateData = {
        idBrinsh: parseInt(branchId),
        type: 'عضو',
        checkGloblenew: newMembers,
        checkGlobleold: removedMembers,
        kind: 'user'
      };

      const response = await axiosInstance.put('/user/UpdatUserNewUpdatviltay', updateData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      if (response.status === 200) {
        const addedCount = newMembers.length;
        const removedCount = removedMembers.length;
        
        let message = 'تم تحديث أعضاء الفرع بنجاح';
        if (addedCount > 0 && removedCount > 0) {
          message = `تم إضافة ${addedCount} وإزالة ${removedCount} من أعضاء الفرع`;
        } else if (addedCount > 0) {
          message = `تم إضافة ${addedCount} عضو جديد للفرع`;
        } else if (removedCount > 0) {
          message = `تم إزالة ${removedCount} عضو من الفرع`;
        }
        
        Tostget(message, 'success');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating branch members:', error);
      Tostget(error.response?.data?.message || 'فشل في تحديث أعضاء الفرع', 'error');
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

  const hasChanges = JSON.stringify(selectedUserIds.sort()) !== JSON.stringify(currentMemberIds.sort());

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        style={{
          borderRadius: `${scale(20)}px`,
          padding: `${scale(24)}px`,
          maxHeight: '80vh',
          overflow: 'hidden'
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
            اضافة او ازالة عضوء
          </h3>
          
          <p 
            className="text-gray-600"
            style={{
              fontSize: `${verticalScale(14 + (size || 0))}px`,
              lineHeight: 1.5
            }}
          >
            إدارة أعضاء فرع "{branchName}"
          </p>
          
          <div className="mt-2 text-sm text-gray-500">
            تم اختيار {selectedUserIds.length} من {users.length} مستخدم
          </div>
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
              {users.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                const isCurrentMember = currentMemberIds.includes(user.id);
                
                return (
                  <div
                    key={user.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleUserToggle(user.id)}
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
                          {isCurrentMember && (
                            <span className="mr-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              عضو حالي
                            </span>
                          )}
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
                      
                      <div className={`w-5 h-5 border-2 rounded ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      } flex items-center justify-center`}>
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20,6 9,17 4,12"></polyline>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
            text={submitting ? 'جاري التحديث...' : 'حفظ التغييرات'}
            Press={handleSubmit}
            disabled={submitting || !hasChanges}
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
