'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: number;
  onSuccess: () => void;
}

interface CompanyMember {
  id: number;
  userName: string;
  PhoneNumber: string;
  Email: string;
  job: string;
  jobdiscrption: string;
  IDNumber?: string;
  image?: string;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  branchId,
  onSuccess
}: AddMemberModalProps) {
  const { user } = useSelector((state: any) => state.user || {});
  const [loading, setLoading] = useState(false);
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUserId, setLastUserId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentBranchMembers, setCurrentBranchMembers] = useState<{[key: number]: any}>({});

  // حفظ الأعضاء الأصليين عند فتح المودال - مطابق للتطبيق المحمول original_is_in
  const originalBranchMemberIdsRef = useRef<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentBranchMembers();
      fetchCompanyMembers(true);
    } else {
      // تنظيف الحالة عند إغلاق المودال
      setSearchTerm('');
      setLastUserId(null);
      setHasMore(true);
      setCompanyMembers([]);
    }
  }, [isOpen]);

  // جلب الأعضاء الحاليين في الفرع - مطابق للتطبيق المحمول
  const fetchCurrentBranchMembers = async () => {
    try {
      // مطابق للتطبيق المحمول: استخدام type=user و selectuser=bransh
      const response = await axiosInstance.get(
        `/user/BringUserCompanyinv2?IDCompany=${user?.data?.IDCompany}&idBrinsh=${branchId}&type=user&number=0&kind_request=all&selectuser=bransh`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      console.log('📊 الأعضاء الحاليين في الفرع:', response.data);

      if (response.data?.checkGloble) {
        setCurrentBranchMembers(response.data.checkGloble);
        console.log('✅ checkGloble:', response.data.checkGloble);

        // تحديد الأعضاء الموجودين مسبقاً وحفظهم في ref
        const existingMemberIds = Object.keys(response.data.checkGloble).map(id => parseInt(id));
        originalBranchMemberIdsRef.current = existingMemberIds;
        setSelectedMembers(existingMemberIds);
        console.log('🔄 الأعضاء المحددين مسبقاً:', existingMemberIds);
      } else {
        // لا يوجد أعضاء في الفرع
        originalBranchMemberIdsRef.current = [];
        setSelectedMembers([]);
      }
    } catch (error) {
      console.error('Error fetching current branch members:', error);
    }
  };

  if (!isOpen) return null;

  const fetchCompanyMembers = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setLastUserId(null);
        setHasMore(true);
        setCompanyMembers([]);
      } else {
        setLoadingMore(true);
      }

      // مطابق لصفحة الأعضاء تماماً - استخدام Pagination
      const number = reset ? 0 : (lastUserId || 0);
      console.log(`📡 جلب المستخدمين - number: ${number}, reset: ${reset}`);

      const response = await axiosInstance.get(
        `/user/BringUserCompany?IDCompany=${user?.data?.IDCompany}&number=${number}&kind_request=all`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      console.log('📊 API Response:', response.data);

      if (response.data && response.data.success) {
        const newMembers = response.data.data || [];

        console.log(`🏢 ${reset ? 'الدفعة الأولى' : 'دفعة جديدة'} من المستخدمين:`, newMembers.length);
        console.log('📊 إجمالي المستخدمين حتى الآن:', reset ? newMembers.length : companyMembers.length + newMembers.length);

        if (reset && newMembers.length > 0) {
          console.log('📋 عينة من البيانات:', newMembers.slice(0, 3).map((m: any) => ({
            id: m.id,
            userName: m.userName,
            job: m.job,
            jobdiscrption: m.jobdiscrption
          })));
        }

        // فلترة مطابقة للتطبيق المحمول: استبعاد Admin فقط
        const filteredMembers = newMembers.filter((member: CompanyMember) =>
          member.job !== 'Admin'
        );

        if (reset) {
          setCompanyMembers(filteredMembers);
        } else {
          // إضافة المستخدمين الجدد فقط (تجنب المكررات)
          setCompanyMembers(prev => {
            const existingIds = new Set(prev.map((m: any) => m.id));
            const uniqueNewMembers = filteredMembers.filter((m: any) => !existingIds.has(m.id));
            console.log('➕ إضافة مستخدمين جدد:', uniqueNewMembers.length);
            return [...prev, ...uniqueNewMembers];
          });
        }

        // تحديث معرف آخر مستخدم
        if (newMembers.length > 0) {
          setLastUserId(newMembers[newMembers.length - 1].id);
          console.log('🔄 آخر ID:', newMembers[newMembers.length - 1].id);
        }

        // التحقق من وجود المزيد من البيانات
        setHasMore(newMembers.length >= 20);
        console.log('🔍 هل يوجد المزيد؟', newMembers.length >= 20);

        if (reset) {
          console.log('✅ المستخدمين المتاحين للإضافة (الدفعة الأولى):', filteredMembers.length);
        }
      }
    } catch (error) {
      console.error('Error fetching company members:', error);
      Tostget('خطأ في جلب أعضاء الشركة');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMembers = async () => {
    if (!hasMore || loadingMore) return;
    console.log('🔄 تحميل المزيد من المستخدمين...');
    await fetchCompanyMembers(false);
  };

  const handleMemberToggle = (memberId: number) => {
    const isCurrentlySelected = selectedMembers.includes(memberId);

    console.log(`🔄 تبديل العضو ${memberId}:`, {
      isCurrentlySelected
    });

    if (isCurrentlySelected) {
      // إلغاء التحديد
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    } else {
      // تحديد العضو
      setSelectedMembers(prev => [...prev, memberId]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // تحضير البيانات مطابق للتطبيق المحمول PageUsers.tsx
      // استخدام ref للحصول على القيمة الأصلية المحفوظة عند فتح المودال
      const originalBranchMemberIds = originalBranchMemberIdsRef.current;
      const currentSelectedIds = selectedMembers;

      console.log('🔍 التحقق من التغييرات:', {
        original: originalBranchMemberIds,
        current: currentSelectedIds
      });

      // الأعضاء الجدد (موجودين في التحديد لكن غير موجودين أصلاً)
      const newMemberIds = currentSelectedIds.filter(id => !originalBranchMemberIds.includes(id));

      // الأعضاء المحذوفين (موجودين أصلاً لكن غير محددين الآن)
      const removedMemberIds = originalBranchMemberIds.filter(id => !currentSelectedIds.includes(id));

      console.log('📊 نتائج المقارنة:', {
        newMembers: newMemberIds,
        removedMembers: removedMemberIds
      });

      // التحقق من وجود تغييرات
      if (newMemberIds.length === 0 && removedMemberIds.length === 0) {
        Tostget('لم يتم إجراء أي تغييرات');
        setLoading(false);
        return;
      }

      // بناء checkGloblenew كـ object مطابق للتطبيق المحمول
      // في التطبيق المحمول: checkGloblenew[id] = { id, Validity: [] }
      const checkGloblenew: { [key: number]: any } = {};
      newMemberIds.forEach(id => {
        checkGloblenew[id] = { id, Validity: [] };
      });

      // بناء checkGlobleold كـ object مطابق للتطبيق المحمول
      // في التطبيق المحمول: checkGlobleold[id] = id
      const checkGlobleold: { [key: number]: number } = {};
      removedMemberIds.forEach(id => {
        checkGlobleold[id] = id;
      });

      console.log('📊 تحديث أعضاء الفرع:', {
        branchId,
        originalMembers: originalBranchMemberIds,
        currentSelected: currentSelectedIds,
        newMembers: newMemberIds,
        removedMembers: removedMemberIds,
        checkGloblenew,
        checkGlobleold
      });

      // إرسال التحديث - مطابق للتطبيق المحمول
      // في التطبيق المحمول: type='user', kind='user'
      const requestData = {
        idBrinsh: branchId,
        type: 'user',
        checkGloblenew: checkGloblenew,
        checkGlobleold: checkGlobleold,
        kind: 'user'
      };

      console.log('📤 إرسال الطلب:', requestData);

      const response = await axiosInstance.put('/user/updat/userBrinshv2', requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      console.log('📊 API Response:', {
        status: response.status,
        data: response.data
      });

      // الباك اند يرجع success: true أو message: "successfuly"
      if (response.data?.success === true || response.data?.message === 'successfuly' || response.status === 200) {
        const addedCount = newMemberIds.length;
        const removedCount = removedMemberIds.length;

        if (addedCount > 0 && removedCount > 0) {
          Tostget(`تم إضافة ${addedCount} وحذف ${removedCount} من أعضاء الفرع`);
        } else if (addedCount > 0) {
          Tostget(`تم إضافة ${addedCount} عضو للفرع`);
        } else if (removedCount > 0) {
          Tostget(`تم حذف ${removedCount} عضو من الفرع`);
        } else {
          Tostget('لم يتم إجراء أي تغييرات');
        }

        onSuccess();
        onClose();
        setSelectedMembers([]);
        setSearchTerm('');
        setCurrentBranchMembers({});
      } else {
        Tostget(response.data?.message || 'فشل في تحديث أعضاء الفرع');
      }
    } catch (error: any) {
      console.error('Error updating branch members:', error);
      const errorMessage = error.response?.data?.message || error.message || 'خطأ في تحديث أعضاء الفرع';
      Tostget(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = companyMembers.filter(member =>
    member.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.PhoneNumber.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-6 text-center">
          إضافة أعضاء للفرع
        </h3>

        {/* شريط البحث */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-medium text-right focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="البحث بالاسم أو رقم الهاتف..."
          />
        </div>

        {/* عداد الأعضاء المحددين */}
        <div className="mb-4 text-center">
          <span className="text-sm font-ibm-arabic-medium text-gray-600">
            تم اختيار {selectedMembers.length} عضو
          </span>
        </div>

        {/* قائمة الأعضاء مع Infinite Scroll */}
        <div
          className="space-y-3 max-h-96 overflow-y-auto"
          onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            // عندما يصل المستخدم لـ 100px من النهاية، يحمل المزيد
            if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore && !loadingMore) {
              console.log('🔄 وصل للنهاية - تحميل المزيد...');
              loadMoreMembers();
            }
          }}
        >
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className={`p-4 border rounded-xl cursor-pointer transition-colors ${
                  selectedMembers.includes(member.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleMemberToggle(member.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 justify-end">
                      <h5 className="font-ibm-arabic-semibold text-gray-900 text-right">
                        {member.userName}
                      </h5>
                      {currentBranchMembers[member.id] && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          عضو حالي
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 text-right mt-1">
                      {member.job} • {member.jobdiscrption} • {member.PhoneNumber}
                    </p>
                    {member.Email && (
                      <p className="text-xs text-gray-500 text-right">
                        {member.Email}
                      </p>
                    )}
                  </div>

                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedMembers.includes(member.id)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedMembers.includes(member.id) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 font-ibm-arabic-medium">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد أعضاء متاحة'}
              </p>
            </div>
          )}

          {/* Loading indicator for more data */}
          {loadingMore && (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">جاري تحميل المزيد...</p>
            </div>
          )}

          {/* End of list indicator */}
          {!hasMore && companyMembers.length > 0 && !loading && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">تم عرض جميع المستخدمين ({companyMembers.length})</p>
            </div>
          )}
        </div>

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
              selectedMembers.length > 0 ? `حفظ (${selectedMembers.length} محدد)` : 'حفظ التغييرات'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
