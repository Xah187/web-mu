'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import ButtonCreat from '@/components/design/ButtonCreat';
import { Tostget } from '@/components/ui/Toast';
import axiosInstance from '@/lib/api/axios';

interface User {
  id: number;
  userName: string;
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  job: string;
  jobdiscrption: string;
  Email: string;
}

interface HRUsersManagementProps {
  user: any;
  size: number;
  onUserUpdate: () => void;
}

/**
 * HR Users Management Component
 * Allows managers to add/remove users from UserPrepare table
 * This controls who can access preparation features
 */
export default function HRUsersManagement({ user, size, onUserUpdate }: HRUsersManagementProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [hrUsers, setHrUsers] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
    loadHRUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Load all company users
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
        setAllUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Tostget('فشل في تحميل قائمة المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadHRUsers = async () => {
    try {
      // Load users who have HR preparation access
      const response = await axiosInstance.get('/api/hr/users-prepare', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      if (response.data?.success && response.data?.data) {
        const hrUserIds = response.data.data.map((u: any) => u.idUser);
        setHrUsers(hrUserIds);
        setSelectedUsers(hrUserIds);
      }
    } catch (error) {
      console.error('Error loading HR users:', error);
    }
  };

  const handleUserToggle = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      
      // Determine which users to add and which to remove
      const usersToAdd = selectedUsers.filter(id => !hrUsers.includes(id));
      const usersToRemove = hrUsers.filter(id => !selectedUsers.includes(id));
      
      const operations = [
        ...usersToAdd.map(id => ({ id, action: 'add' })),
        ...usersToRemove.map(id => ({ id, action: 'cancel' }))
      ];

      if (operations.length === 0) {
        Tostget('لا توجد تغييرات للحفظ');
        return;
      }

      // Send to backend API (same as mobile app)
      const response = await axiosInstance.post('/api/hr/manage-users-prepare', {
        idArray: operations
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      if (response.data?.success) {
        const addedCount = usersToAdd.length;
        const removedCount = usersToRemove.length;
        
        let message = 'تم تحديث صلاحيات التحضير بنجاح';
        if (addedCount > 0 && removedCount > 0) {
          message = `تم إضافة ${addedCount} وإزالة ${removedCount} من صلاحيات التحضير`;
        } else if (addedCount > 0) {
          message = `تم إضافة ${addedCount} مستخدم لصلاحيات التحضير`;
        } else if (removedCount > 0) {
          message = `تم إزالة ${removedCount} مستخدم من صلاحيات التحضير`;
        }
        
        Tostget(message, 'success');
        setHrUsers(selectedUsers);
        onUserUpdate();
      } else {
        throw new Error(response.data?.message || 'فشل في التحديث');
      }
    } catch (error: any) {
      console.error('Error updating HR users:', error);
      Tostget(error.response?.data?.message || 'فشل في تحديث صلاحيات التحضير', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const hasChanges = JSON.stringify(selectedUsers.sort()) !== JSON.stringify(hrUsers.sort());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="mr-3 text-gray-600">جاري تحميل المستخدمين...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p
          style={{
            fontSize: scale(14 + size),
            fontFamily: fonts.IBMPlexSansArabicMedium,
            color: colors.GREAY,
            lineHeight: 1.5
          }}
        >
          اختر المستخدمين الذين يمكنهم الوصول لميزات التحضير (تحضير الدخول والانصراف)
        </p>
        
        <div className="mt-2 text-sm" style={{ color: colors.BLUE }}>
          تم اختيار {selectedUsers.length} من {allUsers.length} مستخدم
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3 mb-6" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {allUsers.map((user) => {
          const isSelected = selectedUsers.includes(user.id);
          const isCurrentHR = hrUsers.includes(user.id);
          
          return (
            <div
              key={user.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
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
                      fontSize: scale(14 + size),
                      fontFamily: fonts.IBMPlexSansArabicSemiBold
                    }}
                  >
                    {user.FirstName} {user.LastName}
                    {isCurrentHR && (
                      <span className="mr-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        صلاحية حالية
                      </span>
                    )}
                  </p>
                  <p 
                    className="text-gray-600"
                    style={{
                      fontSize: scale(12 + size)
                    }}
                  >
                    {user.userName} • {user.jobdiscrption} • {user.PhoneNumber}
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

      {/* Action Buttons */}
      <div className="flex gap-3">
        <ButtonCreat
          text={submitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          onpress={handleSave}
          disabled={submitting || !hasChanges}
          styleButton={{
            backgroundColor: hasChanges ? colors.BLUE : colors.GREAY,
            color: colors.WHITE,
            padding: `${scale(12)}px ${scale(24)}px`,
            fontSize: scale(14 + size),
            fontFamily: fonts.IBMPlexSansArabicSemiBold,
            borderRadius: `${scale(8)}px`,
            opacity: hasChanges ? 1 : 0.6,
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            flex: 1
          }}
        />
        
        <ButtonCreat
          text="إعادة تعيين"
          onpress={() => setSelectedUsers([...hrUsers])}
          disabled={submitting || !hasChanges}
          styleButton={{
            backgroundColor: colors.HOME,
            color: colors.BLACK,
            padding: `${scale(12)}px ${scale(24)}px`,
            fontSize: scale(14 + size),
            fontFamily: fonts.IBMPlexSansArabicMedium,
            borderRadius: `${scale(8)}px`,
            opacity: hasChanges ? 1 : 0.6,
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            flex: 1
          }}
        />
      </div>
    </div>
  );
}
