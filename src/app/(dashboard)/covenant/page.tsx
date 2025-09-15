'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import ArrowIcon from '@/components/icons/ArrowIcon';
import ButtonCreat from '@/components/design/ButtonCreat';
import { Tostget } from '@/components/ui/Toast';
import { usePermissionCheck } from '@/hooks/useUserPermissions';
import axiosInstance from '@/lib/api/axios';
import UserProfileModal from '@/components/user/UserProfileModal';
import useValidityUser from '@/hooks/useValidityUser';
import { EmployeeOnly } from '@/components/auth/PermissionGuard';
import Image from 'next/image';

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

// Types
interface CovenantRequest {
  id: number;
  NameSub: string;
  userName: string;
  Amount: number;
  Statement: string;
  Date: string;
  OrderStatus: string;
  RejectionStatus: string;
  Reasonforrejection?: string;
  Approvingperson?: string;
  Dateofrejection?: string;
}

interface CovenantData {
  arrayOpen: CovenantRequest[];
  arrayClosed: CovenantRequest[];
  arrayReject: CovenantRequest[];
}

function CovenantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, size } = useAppSelector((state: any) => state.user);
  const { canManageCovenant } = usePermissionCheck();
  const { Uservalidation } = useValidityUser();

  const [covenantData, setCovenantData] = useState<CovenantData>({
    arrayOpen: [],
    arrayClosed: [],
    arrayReject: []
  });
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [createRequest, setCreateRequest] = useState({
    title: '',
    Amount: 0,
    id: 0,
    Edit: false,
    typedata: ''
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CovenantRequest | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Get branch ID from URL params
  const IDCompanyBransh = searchParams.get('branchId');

  useEffect(() => {
    if (IDCompanyBransh) {
      fetchCovenantData();
    }
  }, [IDCompanyBransh]);

  const fetchCovenantData = async (kindarray: string = 'arrayOpen', IDfinlty: number = 0) => {
    if (!IDCompanyBransh) return;

    const requestType = getRequestType(kindarray);
    setLoading(prev => ({ ...prev, [requestType]: true }));

    try {
      const response = await axiosInstance.get(
        `company/brinsh/BringDataFinancialCustody?IDCompanySub=${IDCompanyBransh}&kindRequest=${requestType}&LastID=${IDfinlty}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        if (IDfinlty === 0) {
          // Initial load
          setCovenantData(prev => ({
            ...prev,
            [kindarray]: response.data.data
          }));
        } else {
          // Load more
          setCovenantData(prev => ({
            ...prev,
            [kindarray]: [...prev[kindarray as keyof CovenantData], ...response.data.data]
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching covenant data:', error);
      Tostget('خطأ في جلب بيانات العهد');
    } finally {
      setLoading(prev => ({ ...prev, [requestType]: false }));
    }
  };

  const createNewRequest = async () => {
    if (!createRequest.title.trim() || createRequest.Amount <= 0) {
      Tostget('يرجى ملء جميع الحقول');
      return;
    }

    // Check permission - matching mobile app exactly
    const hasPermission = await Uservalidation('covenant', 0);
    if (!hasPermission) {
      return;
    }

    setLoading(prev => ({ ...prev, create: true }));
    try {
      await axiosInstance.post(
        'company/brinsh/insertRequestFinancialCustody',
        {
          IDCompanySub: IDCompanyBransh,
          Amount: createRequest.Amount,
          Statement: createRequest.title
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.accessToken}`
          }
        }
      );

      Tostget('تم إنشاء الطلب بنجاح');
      resetCreateRequest();
      await fetchCovenantData();
    } catch (error) {
      console.error('Error creating request:', error);
      Tostget('خطأ في إنشاء الطلب');
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  const updateRequest = async () => {
    // Check permission before updating - matching mobile app
    const hasPermission = await Uservalidation('covenant', 0);
    if (!hasPermission) {
      return;
    }

    setLoading(prev => ({ ...prev, update: true }));
    try {
      await axiosInstance.put(
        'company/brinsh/Updatecovenantrequests',
        createRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.accessToken}`
          }
        }
      );

      Tostget('تم تحديث الطلب بنجاح');
      resetCreateRequest();
      await fetchCovenantData();
    } catch (error) {
      console.error('Error updating request:', error);
      Tostget('خطأ في تحديث الطلب');
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  const acceptRequest = async (id: number) => {
    // Check permission before accepting - matching mobile app
    const hasPermission = await Uservalidation('covenant', 0);
    if (!hasPermission) {
      return;
    }

    setLoading(prev => ({ ...prev, [`accept_${id}`]: true }));
    try {
      await axiosInstance.put(
        'company/brinsh/Acceptandrejectrequests',
        {
          id: id,
          kindORreason: 'قبول'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.accessToken}`
          }
        }
      );

      Tostget('تم قبول الطلب بنجاح');
      await fetchCovenantData();
    } catch (error) {
      console.error('Error accepting request:', error);
      Tostget('خطأ في قبول الطلب');
    } finally {
      setLoading(prev => ({ ...prev, [`accept_${id}`]: false }));
    }
  };

  const rejectRequest = async () => {
    if (!createRequest.title.trim()) {
      Tostget('يرجى إدخال سبب الرفض');
      return;
    }

    // Check permission before rejecting - matching mobile app
    const hasPermission = await Uservalidation('covenant', 0);
    if (!hasPermission) {
      return;
    }

    setLoading(prev => ({ ...prev, reject: true }));
    try {
      await axiosInstance.put(
        'company/brinsh/Acceptandrejectrequests',
        {
          id: createRequest.id,
          kindORreason: createRequest.title
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.accessToken}`
          }
        }
      );

      Tostget('تم رفض الطلب');
      resetCreateRequest();
      await fetchCovenantData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      Tostget('خطأ في رفض الطلب');
    } finally {
      setLoading(prev => ({ ...prev, reject: false }));
    }
  };

  const deleteRequest = async (id: number) => {
    // Check permission before deleting - matching mobile app
    const hasPermission = await Uservalidation('covenant', 0);
    if (!hasPermission) {
      return;
    }

    setLoading(prev => ({ ...prev, [`delete_${id}`]: true }));
    try {
      await axiosInstance.get(`company/brinsh/Deletecovenantrequests?id=${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken}`
        }
      });

      Tostget('تم حذف الطلب بنجاح');
      await fetchCovenantData();
    } catch (error) {
      console.error('Error deleting request:', error);
      Tostget('خطأ في حذف الطلب');
    } finally {
      setLoading(prev => ({ ...prev, [`delete_${id}`]: false }));
    }
  };

  const getRequestType = (kindarray: string | number): string => {
    if (kindarray === 'arrayOpen' || kindarray === 1) return 'معلقة';
    if (kindarray === 'arrayClosed' || kindarray === 2) return 'مغلقة';
    return 'مرفوضة';
  };

  const getArrayKey = (tabId: number): keyof CovenantData => {
    if (tabId === 1) return 'arrayOpen';
    if (tabId === 2) return 'arrayClosed';
    return 'arrayReject';
  };

  const resetCreateRequest = () => {
    setCreateRequest({
      title: '',
      Amount: 0,
      id: 0,
      Edit: false,
      typedata: ''
    });
    setShowCreateModal(false);
    setShowRejectModal(false);
  };

  const tabs = [
    { id: 1, name: 'الطلبات المفتوحة', array: 'arrayOpen' },
    { id: 2, name: 'الطلبات المغلقة', array: 'arrayClosed' },
    { id: 3, name: 'الطلبات المرفوضة', array: 'arrayReject' }
  ];

  const currentData = covenantData[getArrayKey(activeTab)];

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title="طلبات العهد"
          backButton={
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="رجوع"
            >
              <ArrowIcon size={24} color={colors.BLACK} />
            </button>
          }
        />
      }
    >
      <ContentSection>

      {/* Create Request Button */}
      {IDCompanyBransh && (
        <div className="px-4 py-2 sm:px-6 lg:px-8">
          <ButtonCreat
            text="اضافة طلب"
            onpress={() => setShowCreateModal(true)}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-6">
        {tabs.map((tab) => (
          <div key={tab.id} className="mb-6 bg-white rounded-2xl overflow-hidden">
            {/* Tab Header */}
            <div className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <button
                onClick={() => {
                  if (covenantData[tab.array as keyof CovenantData].length === 0) {
                    fetchCovenantData(tab.array);
                  }
                  setActiveTab(activeTab === tab.id ? 0 as any : tab.id as 1 | 2 | 3);
                }}
                className="flex-1 text-right"
              >
                <span
                  className="text-base sm:text-lg font-semibold"
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicSemiBold,
                    color: colors.BLACK
                  }}
                >
                  {tab.name}
                </span>
              </button>

              {loading[getRequestType(tab.array)] ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchCovenantData(tab.array);
                  }}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>

            {/* Tab Content */}
            {activeTab === tab.id && currentData.length > 0 && (
              <div className="border-t border-gray-100">
                {currentData.map((item) => (
                  <div key={item.id} className="p-4 border-b border-gray-50 last:border-b-0">
                    {/* Request Card */}
                    <div className="bg-gray-50 rounded-xl overflow-hidden">
                      {/* Branch Header */}
                      <div
                        className="p-3 text-center text-white font-semibold"
                        style={{
                          backgroundColor: item.RejectionStatus === 'true'
                            ? colors.RED
                            : item.OrderStatus === 'true'
                              ? colors.SOFTMINTGREEN
                              : colors.BLUE,
                          fontFamily: fonts.IBMPlexSansArabicSemiBold
                        }}
                      >
                        {item.NameSub}
                      </div>

                      <div className="p-4">
                        {/* Date */}
                        <p className="text-center text-gray-600 text-sm mb-4">
                          {item.Date}
                        </p>

                        {/* Request Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-gray-600 text-sm">مقدم الطلب</p>
                            <p className="font-semibold">{item.userName}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600 text-sm">المبلغ</p>
                            <p className="font-semibold">{item.Amount}</p>
                          </div>
                        </div>

                        {/* Statement */}
                        <div className="mb-4">
                          <p className="text-gray-600 text-sm">البيان:</p>
                          <p className="font-medium">{item.Statement}</p>
                        </div>

                        {/* Rejection Details */}
                        {item.RejectionStatus === 'true' && (
                          <div className="bg-red-50 p-3 rounded-lg mb-4">
                            <p className="text-sm"><strong>سبب الرفض:</strong> {item.Reasonforrejection}</p>
                            <p className="text-sm"><strong>القائم بالرفض:</strong> {item.Approvingperson}</p>
                            <p className="text-sm"><strong>تاريخ الرفض:</strong> {item.Dateofrejection}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {tab.array === 'arrayOpen' && (
                          <div className="flex gap-2 justify-center">
                            {item.userName !== user?.data?.userName ? (
                              // Admin/Manager actions
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setShowConfirmModal(true);
                                  }}
                                  disabled={loading[`accept_${item.id}`]}
                                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                >
                                  {loading[`accept_${item.id}`] ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                  ) : (
                                    'قبول'
                                  )}
                                </button>

                                <button
                                  onClick={() => {
                                    setCreateRequest({
                                      title: '',
                                      Amount: 0,
                                      id: item.id,
                                      Edit: false,
                                      typedata: ''
                                    });
                                    setShowRejectModal(true);
                                  }}
                                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  رفض
                                </button>
                              </>
                            ) : (
                              // User's own request actions
                              <>
                                <button
                                  onClick={() => {
                                    setCreateRequest({
                                      title: item.Statement,
                                      Amount: item.Amount,
                                      id: item.id,
                                      Edit: true,
                                      typedata: 'معلقة'
                                    });
                                    setShowCreateModal(true);
                                  }}
                                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                  تعديل
                                </button>

                                <button
                                  onClick={() => deleteRequest(item.id)}
                                  disabled={loading[`delete_${item.id}`]}
                                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                  {loading[`delete_${item.id}`] ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                  ) : (
                                    'حذف'
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        )}

                        {/* Edit Rejection Reason (for rejected requests by current user) */}
                        {tab.array === 'arrayReject' && item.Approvingperson === user?.data?.userName && (
                          <button
                            onClick={() => {
                              setCreateRequest({
                                title: item.Reasonforrejection || '',
                                Amount: 0,
                                id: item.id,
                                Edit: true,
                                typedata: 'مرفوضة'
                              });
                              setShowRejectModal(true);
                            }}
                            className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            تعديل سبب الرفض
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load More Button */}
                {currentData.length > 0 && (
                  <div className="p-4 text-center">
                    <button
                      onClick={() => {
                        const lastItem = currentData[currentData.length - 1];
                        fetchCovenantData(tab.array, lastItem.id);
                      }}
                      disabled={loading[getRequestType(tab.array)]}
                      className="text-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                    >
                      {loading[getRequestType(tab.array)] ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          جاري التحميل...
                        </div>
                      ) : (
                        'تحميل المزيد'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      </ContentSection>

      {/* Create/Edit Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4 text-center">
              {createRequest.Edit ? 'تعديل الطلب' : 'إنشاء طلب جديد'}
            </h2>

            <div className="space-y-4">
              {!createRequest.Edit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المبلغ
                  </label>
                  <input
                    type="number"
                    value={createRequest.Amount || ''}
                    onChange={(e) => setCreateRequest(prev => ({
                      ...prev,
                      Amount: Number(e.target.value)
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل المبلغ"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البيان
                </label>
                <textarea
                  value={createRequest.title}
                  onChange={(e) => setCreateRequest(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="اكتب تفاصيل الطلب"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetCreateRequest}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={createRequest.Edit ? updateRequest : createNewRequest}
                disabled={loading.create || loading.update}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading.create || loading.update ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'إرسال'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Request Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4 text-center">
              {createRequest.Edit ? 'تعديل سبب الرفض' : 'سبب الرفض'}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اذكر السبب
              </label>
              <textarea
                value={createRequest.title}
                onChange={(e) => setCreateRequest(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
                placeholder="اكتب سبب رفض الطلب"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetCreateRequest}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={createRequest.Edit ? updateRequest : rejectRequest}
                disabled={loading.reject || loading.update}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading.reject || loading.update ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'إرسال'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Accept Modal */}
      {showConfirmModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4 text-center">تأكيد القبول</h2>

            <p className="text-center text-gray-600 mb-6">
              هل ترغب بالفعل بقبول الطلب؟
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedItem(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                لا
              </button>
              <button
                onClick={() => {
                  if (selectedItem) {
                    acceptRequest(selectedItem.id);
                  }
                  setShowConfirmModal(false);
                  setSelectedItem(null);
                }}
                disabled={selectedItem && loading[`accept_${selectedItem.id}`]}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {selectedItem && loading[`accept_${selectedItem.id}`] ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'نعم'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
    </ResponsiveLayout>
  );
}

// Wrap the component with EmployeeOnly to match mobile app behavior
function CovenantPageWrapper() {
  return (
    <EmployeeOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-ibm-arabic-bold text-gray-900 mb-2">
              غير مصرح لك بالوصول
            </h2>
            <p className="text-gray-600 font-ibm-arabic-regular">
              هذه الصفحة مخصصة للموظفين فقط
            </p>
          </div>
        </div>
      }
    >
      <CovenantPage />
    </EmployeeOnly>
  );
}

export default CovenantPageWrapper;
