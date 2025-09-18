'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale } from '@/utils/responsiveSize';
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
      setLoadingProgress('تحميل قائمة المستخدمين...');
      console.log('🔄 تحميل قائمة المستخدمين...');

      let allUsersData: any[] = [];
      let lastUserId = 0; // نفس آلية التطبيق المحمول
      let hasMoreData = true;
      const maxBatches = 20; // زيادة الحد الأقصى لضمان جلب جميع المستخدمين
      let currentBatch = 0;

      // Load users in batches exactly like mobile app using getUserPrepare API
      while (hasMoreData && currentBatch < maxBatches) {
        try {
          setLoadingProgress(`جلب دفعة ${currentBatch + 1} من المستخدمين...`);
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

      setLoadingProgress(`تم تحميل ${allUsersData.length} مستخدم بنجاح`);
      setAllUsers(allUsersData);
      setHrUsers(hrUserIds);
      setSelectedUsers(hrUserIds);

    } catch (error) {
      console.error('❌ خطأ في تحميل المستخدمين:', error);
      Tostget('فشل في تحميل قائمة المستخدمين', 'error');
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
        Tostget('لا توجد تغييرات للحفظ');
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

        console.log('✅ نجح الحفظ:', message);
        Tostget(message, 'success');
        setHrUsers(selectedUsers);
        onUserUpdate();
      } else {
        console.log('❌ فشل الحفظ:', response.data?.message);
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
    <div className="p-6 space-y-8">
      <div className="mb-10">
        <p
          style={{
            fontSize: scale(14 + size),
            fontFamily: fonts.IBMPlexSansArabicMedium,
            color: colors.GREAY,
            lineHeight: 1.5,
            marginBottom: '24px'
          }}
        >
          اختر المستخدمين الذين يمكنهم الوصول لميزات التحضير
        </p>

        {/* Statistics - same as mobile app with debugging info */}
        <div className="mt-4 grid grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">
              {showEmployeesOnly ? allUsers.filter(u => u.job !== 'Admin' && u.jobdiscrption === 'موظف').length : allUsers.filter(u => u.job !== 'Admin').length}
            </p>
            <p className="text-sm text-blue-600">
              {showEmployeesOnly ? 'الموظفين' : 'إجمالي المستخدمين'}
            </p>

          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">{hrUsers.length}</p>
            <p className="text-sm text-green-600">لديهم صلاحيات حالياً</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-orange-600">{selectedUsers.length}</p>
            <p className="text-sm text-orange-600">مختارون للتحديث</p>
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
          placeholder="البحث عن مستخدم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ fontSize: scale(14 + size) }}
        />
      </div>

      {/* Filter Toggle */}
      <div className="mb-6 flex items-center gap-4">
        <label className="flex items-center cursor-pointer">
          <input
            id="show-employees-only"
            name="show-employees-only"
            type="checkbox"
            checked={showEmployeesOnly}
            onChange={(e) => setShowEmployeesOnly(e.target.checked)}
            className="ml-2"
          />
          <span style={{ fontSize: scale(12 + size), color: colors.GREAY }}>
            عرض الموظفين فقط
          </span>
        </label>
      </div>

      {/* Spacer between search/filter and table */}
      <div style={{ height: '16px' }}></div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600" style={{ fontSize: scale(14 + size) }}>
            {loadingProgress || 'جاري تحميل المستخدمين...'}
          </p>
        </div>
      )}

      {/* Users List */}
      {!loading && (
        <div className="space-y-2 mb-8 border border-gray-200 rounded-lg" style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500" style={{ fontSize: scale(14 + size) }}>
                {searchQuery ? 'لا توجد نتائج للبحث' : showEmployeesOnly ? 'لا يوجد موظفين' : 'لا يوجد مستخدمين'}
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
                    className={`p-4 border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleUserToggle(user.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {/* User Avatar - same as mobile app */}
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center ml-4">
                          <span
                            className="text-gray-600 font-semibold"
                            style={{ fontSize: scale(14 + size) }}
                          >
                            {user.FirstName?.charAt(0)}{user.LastName?.charAt(0)}
                          </span>
                        </div>

                        {/* User Info - same as mobile app */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className="font-semibold text-gray-900"
                              style={{
                                fontSize: scale(14 + size),
                                fontFamily: fonts.IBMPlexSansArabicSemiBold
                              }}
                            >
                              {user.userName}
                            </p>
                            {isCurrentHR && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">
                                صلاحية حالية
                              </span>
                            )}
                          </div>
                          <p
                            className="text-gray-600"
                            style={{
                              fontSize: scale(12 + size),
                              fontFamily: fonts.IBMPlexSansArabicRegular
                            }}
                          >
                            {user.job}
                          </p>
                        </div>
                      </div>

                      {/* Checkbox - moved to the right side */}
                      <div className="mr-4">
                        <div
                          className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300'
                          }`}
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
      <div className="flex gap-4">
        <ButtonCreat
          text={submitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          onpress={handleSave}
          disabled={submitting || !hasChanges}
          styleButton={{
            backgroundColor: hasChanges ? colors.BLUE : colors.GREAY,
            color: colors.WHITE,
            padding: `${scale(14)}px ${scale(28)}px`,
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
