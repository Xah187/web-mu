'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale } from '@/utils/responsiveSize';
import ButtonCreat from '@/components/design/ButtonCreat';
import { Tostget } from '@/components/ui/Toast';
import axiosInstance from '@/lib/api/axios';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t, isRTL, dir } = useTranslation();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [hrUsers, setHrUsers] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showEmployeesOnly, setShowEmployeesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProgress, setLoadingProgress] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        console.log('🚀 بدء تحميل البيانات...');
        console.log('👤 معلومات المستخدم:', {
          IDCompany: user?.data?.IDCompany,
          userName: user?.data?.userName,
          hasToken: !!user?.accessToken
        });

        await loadUsers(); // يتضمن الآن تحميل جميع المستخدمين مع معلومات الصلاحيات

        console.log('✅ تم الانتهاء من تحميل جميع البيانات');
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
          console.error('خطأ في تحميل البيانات:', error);
        }
      }
    };

    loadData();

    // تنظيف عند إلغاء المكون
    return () => {
      controller.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUsers = async () => {
    try {
      setLoading(true);
      setLoadingProgress(t('preparationPage.hrManagement.loadingUsers'));
      console.log('🔄 تحميل قائمة المستخدمين...');

      let allUsersData: any[] = [];
      let lastUserId = 0; // نفس آلية التطبيق المحمول
      let hasMoreData = true;
      const maxBatches = 20; // زيادة الحد الأقصى لضمان جلب جميع المستخدمين
      let currentBatch = 0;

      // Load users in batches exactly like mobile app using getUserPrepare API
      while (hasMoreData && currentBatch < maxBatches) {
        try {
          setLoadingProgress(t('preparationPage.hrManagement.loadingBatch', { batch: currentBatch + 1 }));
          console.log(`📡 جلب دفعة ${currentBatch + 1} - آخر ID: ${lastUserId}`);

          // استخدام نفس API التطبيق المحمول - getUserPrepare
          const response = await axiosInstance.get(
            `HR/BringUserprepare?count=${lastUserId}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user?.accessToken}`
              },
              timeout: 15000 // زيادة timeout
            }
          );

          console.log(`👥 استجابة الدفعة ${currentBatch + 1}:`, response.data);

          if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
            const newUsers = response.data.data;

            // إضافة المستخدمين الجدد - نفس آلية التطبيق المحمول
            if (currentBatch === 0) {
              allUsersData = newUsers;
            } else {
              // تجنب المستخدمين المكررين
              const filteredUsers = newUsers.filter((newUser: any) =>
                !allUsersData.some((existingUser: any) => existingUser.id === newUser.id)
              );
              allUsersData = [...allUsersData, ...filteredUsers];
            }

            console.log(`✅ تم تحميل ${newUsers.length} مستخدم في الدفعة ${currentBatch + 1}`);
            console.log(`📊 إجمالي المستخدمين حتى الآن: ${allUsersData.length}`);

            // عرض تفاصيل الصلاحيات للتشخيص
            const usersWithPermissions = newUsers.filter((u: any) => u.Prepare === 'true');
            const usersWithoutPermissions = newUsers.filter((u: any) => u.Prepare === 'false');
            console.log(`🔐 في هذه الدفعة - لديهم صلاحيات: ${usersWithPermissions.length}, بدون صلاحيات: ${usersWithoutPermissions.length}`);

            // تحديث آخر ID - نفس آلية التطبيق المحمول
            if (newUsers.length > 0) {
              lastUserId = newUsers[newUsers.length - 1].id;
              console.log(`🔄 آخر ID محدث: ${lastUserId}`);
            }

            // إذا كان عدد المستخدمين أقل من 20، فقد وصلنا للنهاية
            if (newUsers.length < 20) {
              hasMoreData = false;
              console.log('🏁 تم الوصول لنهاية البيانات - عدد أقل من 20');
            } else {
              currentBatch++;
            }
          } else {
            hasMoreData = false;
            console.log('🏁 لا توجد بيانات أكثر - استجابة فارغة');
          }
        } catch (batchError) {
          console.error(`❌ خطأ في الدفعة ${currentBatch + 1}:`, batchError);
          hasMoreData = false; // توقف عند أي خطأ
        }
      }

      if (currentBatch >= maxBatches) {
        console.log('⚠️ تم الوصول للحد الأقصى من الدفعات');
      }

      console.log(`🎉 تم تحميل جميع المستخدمين: ${allUsersData.length} مستخدم`);

      // استخراج المستخدمين الذين لديهم صلاحيات - نفس آلية التطبيق المحمول
      const usersWithHRPermissions = allUsersData.filter((u: any) => u.Prepare === 'true');
      const hrUserIds = usersWithHRPermissions.map((u: any) => u.id);

      console.log(`🔐 إجمالي المستخدمين الذين لديهم صلاحيات HR: ${usersWithHRPermissions.length}`);
      console.log(`📋 قائمة IDs للمستخدمين الذين لديهم صلاحيات:`, hrUserIds);

      setLoadingProgress(t('preparationPage.hrManagement.usersLoaded', { count: allUsersData.length }));
      setAllUsers(allUsersData);
      setHrUsers(hrUserIds);
      setSelectedUsers(hrUserIds);

    } catch (error) {
      console.error('❌ خطأ في تحميل المستخدمين:', error);
      Tostget(t('preparationPage.hrManagement.errors.loadingUsers'), 'error');
      setAllUsers([]);
      setHrUsers([]);
      setSelectedUsers([]);
    } finally {
      setLoading(false);
      setLoadingProgress('');
    }
  };

  // تم دمج loadHRUsers مع loadUsers لاستخدام نفس API

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
      console.log('💾 بدء حفظ صلاحيات HR...');

      // Determine which users to add and which to remove
      const usersToAdd = selectedUsers.filter(id => !hrUsers.includes(id));
      const usersToRemove = hrUsers.filter(id => !selectedUsers.includes(id));

      console.log('➕ مستخدمون للإضافة:', usersToAdd);
      console.log('➖ مستخدمون للإزالة:', usersToRemove);

      const operations = [
        ...usersToAdd.map(id => ({ id, action: 'add' })),
        ...usersToRemove.map(id => ({ id, action: 'cancel' }))
      ];

      console.log('🔄 العمليات المطلوبة:', operations);

      // Show confirmation like mobile app
      if (operations.length > 0) {
        const addedCount = usersToAdd.length;
        const removedCount = usersToRemove.length;

        let confirmMessage = 'هل تريد تأكيد التغييرات؟\n';
        if (addedCount > 0 && removedCount > 0) {
          confirmMessage += `سيتم إضافة ${addedCount} وإزالة ${removedCount} من صلاحيات التحضير`;
        } else if (addedCount > 0) {
          confirmMessage += `سيتم إضافة ${addedCount} مستخدم لصلاحيات التحضير`;
        } else if (removedCount > 0) {
          confirmMessage += `سيتم إزالة ${removedCount} مستخدم من صلاحيات التحضير`;
        }

        if (!window.confirm(confirmMessage)) {
          setSubmitting(false);
          return;
        }
      }

      if (operations.length === 0) {
        console.log('⚠️ لا توجد تغييرات للحفظ');
        Tostget(t('preparationPage.hrManagement.noChanges'));
        return;
      }

      // Send to backend API (same as mobile app addUserprepare)
      console.log('📤 إرسال البيانات للخادم...');
      const response = await axiosInstance.post('HR/addUserprepare', {
        idArray: operations
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      console.log('📡 استجابة الخادم:', response.data);

      if (response.data?.success) {
        console.log('✅ نجح الحفظ');
        Tostget(t('preparationPage.hrManagement.success.changesSaved'), 'success');
        setHrUsers(selectedUsers);
        onUserUpdate();
      } else {
        console.log('❌ فشل الحفظ:', response.data?.message);
        throw new Error(response.data?.message || t('preparationPage.hrManagement.errors.savingChanges'));
      }
    } catch (error: any) {
      console.error('Error updating HR users:', error);
      Tostget(error.response?.data?.message || t('preparationPage.hrManagement.errors.savingChanges'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const hasChanges = JSON.stringify(selectedUsers.sort()) !== JSON.stringify(hrUsers.sort());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--color-primary)' }}
        ></div>
        <span
          className={isRTL ? 'mr-3' : 'ml-3'}
          style={{ color: 'var(--color-text-secondary)', direction: dir as 'rtl' | 'ltr' }}
        >
          {t('preparationPage.hrManagement.loadingUsers')}
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8" style={{ direction: dir as 'rtl' | 'ltr' }}>
      <div className="mb-10">
        <p
          style={{
            fontSize: scale(14 + size),
            fontFamily: fonts.IBMPlexSansArabicMedium,
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            marginBottom: '24px',
            direction: dir as 'rtl' | 'ltr'
          }}
          className={isRTL ? 'text-right' : 'text-left'}
        >
          {t('preparationPage.hrManagement.title')}
        </p>

        {/* Statistics - same as mobile app with debugging info */}
        <div className="mt-4 grid grid-cols-3 gap-6">
          <div
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.3)'
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: '#2563eb' }}
            >
              {showEmployeesOnly ? allUsers.filter(u => u.job !== 'Admin' && u.jobdiscrption === 'موظف').length : allUsers.filter(u => u.job !== 'Admin').length}
            </p>
            <p
              className="text-sm"
              style={{ color: '#2563eb' }}
            >
              {showEmployeesOnly ? 'الموظفين' : 'إجمالي المستخدمين'}
            </p>

          </div>
          <div
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: '#16a34a' }}
            >
              {hrUsers.length}
            </p>
            <p
              className="text-sm"
              style={{ color: '#16a34a' }}
            >
              لديهم صلاحيات حالياً
            </p>
          </div>
          <div
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              border: '1px solid rgba(249, 115, 22, 0.3)'
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: '#ea580c' }}
            >
              {selectedUsers.length}
            </p>
            <p
              className="text-sm"
              style={{ color: '#ea580c' }}
            >
              مختارون للتحديث
            </p>
          </div>
        </div>

      </div>

      {/* Spacer */}
      <div style={{ height: '24px' }}></div>



      {/* Search Input */}
      <div className="mb-6">
        <input
          id="hr-user-search"
          name="hr-user-search"
          type="text"
          placeholder={t('preparationPage.hrManagement.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full p-4 rounded-lg focus:outline-none focus:ring-2 ${isRTL ? 'text-right' : 'text-left'}`}
          style={{
            fontSize: scale(14 + size),
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            direction: dir as 'rtl' | 'ltr'
          }}
        />
      </div>

      {/* Filter Toggle */}
      <div className={`mb-6 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <label className={`flex items-center cursor-pointer ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <input
            id="show-employees-only"
            name="show-employees-only"
            type="checkbox"
            checked={showEmployeesOnly}
            onChange={(e) => setShowEmployeesOnly(e.target.checked)}
            className={isRTL ? 'mr-2' : 'ml-2'}
          />
          <span style={{
            fontSize: scale(12 + size),
            color: 'var(--color-text-secondary)',
            direction: dir as 'rtl' | 'ltr'
          }}>
            {t('preparationPage.hrManagement.showEmployeesOnly')}
          </span>
        </label>
      </div>

      {/* Spacer between search/filter and table */}
      <div style={{ height: '16px' }}></div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2"
            style={{ borderColor: 'var(--color-primary)' }}
          ></div>
          <p
            style={{
              fontSize: scale(14 + size),
              color: 'var(--color-text-secondary)',
              direction: dir as 'rtl' | 'ltr'
            }}
          >
            {loadingProgress || t('preparationPage.hrManagement.loadingUsers')}
          </p>
        </div>
      )}

      {/* Users List */}
      {!loading && (
        <div
          className="space-y-2 mb-8 rounded-lg"
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)'
          }}
        >
        {allUsers
          .filter(user => user.job !== 'Admin') // نفس فلترة التطبيق المحمول
          .filter(user => !showEmployeesOnly || user.jobdiscrption === 'موظف')
          .filter(user =>
            searchQuery === '' ||
            user.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.FirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.LastName?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-2">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p style={{
                fontSize: scale(14 + size),
                color: 'var(--color-text-secondary)',
                direction: dir as 'rtl' | 'ltr'
              }}>
                {t('preparationPage.hrManagement.noUsers')}
              </p>
            </div>
          ) : (
            allUsers
              .filter(user => user.job !== 'Admin') // نفس فلترة التطبيق المحمول
              .filter(user => !showEmployeesOnly || user.jobdiscrption === 'موظف')
              .filter(user =>
                searchQuery === '' ||
                user.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.FirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.LastName?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((user) => {
                const isSelected = selectedUsers.includes(user.id);
                const isCurrentHR = hrUsers.includes(user.id);

                return (
                  <div
                    key={user.id}
                    className="p-4 cursor-pointer transition-colors"
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'transparent'
                    }}
                    onClick={() => handleUserToggle(user.id)}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {/* User Avatar - same as mobile app */}
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center ml-4"
                          style={{ backgroundColor: 'var(--color-surface-secondary)' }}
                        >
                          <span
                            className="font-semibold"
                            style={{
                              fontSize: scale(14 + size),
                              color: 'var(--color-text-secondary)'
                            }}
                          >
                            {user.FirstName?.charAt(0)}{user.LastName?.charAt(0)}
                          </span>
                        </div>

                        {/* User Info - same as mobile app */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className="font-semibold"
                              style={{
                                fontSize: scale(14 + size),
                                fontFamily: fonts.IBMPlexSansArabicSemiBold,
                                color: 'var(--color-text-primary)'
                              }}
                            >
                              {user.userName}
                            </p>
                            {isCurrentHR && (
                              <span
                                className="text-xs px-2 py-1 rounded whitespace-nowrap"
                                style={{
                                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                  color: '#166534'
                                }}
                              >
                                صلاحية حالية
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: scale(12 + size),
                              fontFamily: fonts.IBMPlexSansArabicRegular,
                              color: 'var(--color-text-secondary)'
                            }}
                          >
                            {user.job}
                          </p>
                        </div>
                      </div>

                      {/* Checkbox - moved to the right side */}
                      <div className="mr-4">
                        <div
                          className="w-5 h-5 border-2 rounded flex items-center justify-center"
                          style={{
                            backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                            borderColor: isSelected ? '#3b82f6' : 'var(--color-border)'
                          }}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* Spacer between list and action buttons */}
      <div style={{ height: '20px' }}></div>

      {/* Action Buttons */}
      <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <ButtonCreat
          text={submitting ? t('preparationPage.hrManagement.saving') : t('preparationPage.hrManagement.save')}
          onpress={handleSave}
          disabled={submitting || !hasChanges}
          styleButton={{
            backgroundColor: hasChanges ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            color: colors.WHITE,
            padding: `${scale(14)}px ${scale(28)}px`,
            direction: dir as 'rtl' | 'ltr',
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
            backgroundColor: 'var(--color-surface-secondary)',
            color: 'var(--color-text-primary)',
            padding: `${scale(12)}px ${scale(24)}px`,
            fontSize: scale(14 + size),
            fontFamily: fonts.IBMPlexSansArabicMedium,
            borderRadius: `${scale(8)}px`,
            opacity: hasChanges ? 1 : 0.6,
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            flex: 1,
            border: '1px solid var(--color-border)'
          }}
        />
      </div>
    </div>
  );
}
