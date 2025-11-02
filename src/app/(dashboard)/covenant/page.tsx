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
import { PermissionBasedVisibility } from '@/components/auth/PermissionGuard';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';

import ResponsiveLayout, { PageHeader, ContentSection, ResponsiveGrid, Card } from '@/components/layout/ResponsiveLayout';

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
  const { user, size, language } = useAppSelector((state: any) => state.user);
  const { canManageCovenant } = usePermissionCheck();
  const { Uservalidation } = useValidityUser();
  const { t } = useTranslation();

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
  const [exportingPDF, setExportingPDF] = useState(false);

  // Get branch ID from URL params
  const IDCompanyBransh = searchParams.get('branchId');
  const typePage = searchParams.get('type') || 'FinancialCustodyall';

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
      // Add type parameter to API call - matching mobile app
      // Mobile app: BringDataFinancialCustody(IDCompanyBransh, kindRequest, IDfinlty, typePage)
      const response = await axiosInstance.get(
        `company/brinsh/BringDataFinancialCustody?IDCompanySub=${IDCompanyBransh}&kindRequest=${requestType}&LastID=${IDfinlty}&type=${typePage}`,
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

      Tostget(t('covenantPage.requestCreatedSuccess'));
      resetCreateRequest();
      await fetchCovenantData();
    } catch (error) {
      console.error('Error creating request:', error);
      Tostget(t('covenantPage.errorCreatingRequest'));
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

      Tostget(t('covenantPage.requestUpdatedSuccess'));
      resetCreateRequest();
      await fetchCovenantData();
    } catch (error) {
      console.error('Error updating request:', error);
      Tostget(t('covenantPage.errorUpdatingRequest'));
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

      Tostget(t('covenantPage.requestAcceptedSuccess'));
      await fetchCovenantData();
    } catch (error) {
      console.error('Error accepting request:', error);
      Tostget(t('covenantPage.errorAcceptingRequest'));
    } finally {
      setLoading(prev => ({ ...prev, [`accept_${id}`]: false }));
    }
  };

  // Export Covenant Report as PDF - Matching mobile app
  const exportCovenantPDF = async () => {
    if (!IDCompanyBransh) {
      Tostget('الرجاء اختيار فرع أولاً');
      return;
    }

    setExportingPDF(true);
    try {
      const response = await axiosInstance.get(
        `company/BringreportFinancialCustody?IDCompanySub=${IDCompanyBransh}&type=${typePage}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.status === 200 && response.data?.namefile) {
        const baseUrl = process.env.NEXT_PUBLIC_FILE_URL || 'https://mushrf.net';
        window.open(`${baseUrl}/${response.data.namefile}`, '_blank');
        Tostget('تم إنشاء التقرير بنجاح');
      } else {
        Tostget('فشل في إنشاء التقرير');
      }
    } catch (error: any) {
      console.error('Error exporting covenant PDF:', error);
      Tostget(error.response?.data?.success || 'خطأ في تصدير التقرير');
    } finally {
      setExportingPDF(false);
    }
  };

  const rejectRequest = async () => {
    if (!createRequest.title.trim()) {
      Tostget(t('covenantPage.enterRejectionReason'));
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

      Tostget(t('covenantPage.requestRejectedSuccess'));
      resetCreateRequest();
      await fetchCovenantData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      Tostget(t('covenantPage.errorRejectingRequest'));
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

      Tostget(t('covenantPage.requestDeletedSuccess'));
      await fetchCovenantData();
    } catch (error) {
      console.error('Error deleting request:', error);
      Tostget(t('covenantPage.errorDeletingRequest'));
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
    { id: 1, name: t('covenantPage.openRequests'), array: 'arrayOpen' },
    { id: 2, name: t('covenantPage.closedRequests'), array: 'arrayClosed' },
    { id: 3, name: t('covenantPage.rejectedRequests'), array: 'arrayReject' }
  ];

  const currentData = covenantData[getArrayKey(activeTab)];

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title={t('covenantPage.covenantRequests')}
          backButton={
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-text-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-hover-background)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label={language === 'ar' ? 'رجوع' : 'Back'}
            >
              <ArrowIcon size={24} color="var(--color-text-primary)" />
            </button>
          }
        />
      }
    >
      <ContentSection>
        {/* Spacer */}
        <div style={{ height: '32px' }}></div>

        {/* Action Buttons - Matching mobile app */}
        {IDCompanyBransh && (
          <div className="px-6 mb-8">
            <div className="flex flex-row gap-4 justify-center items-center">
              <ButtonCreat
                text={t('covenantPage.createNewRequest')}
                onpress={() => setShowCreateModal(true)}
              />
              <ButtonCreat
                text={exportingPDF ? t('covenantPage.exporting') : t('covenantPage.exportPDF')}
                onpress={exportCovenantPDF}
                disabled={exportingPDF}
                styleButton={{
                  backgroundColor: exportingPDF ? 'var(--color-surface-secondary)' : 'var(--color-primary)',
                  opacity: exportingPDF ? 0.6 : 1
                }}
              >
                {exportingPDF && (
                  <div className={language === 'ar' ? 'mr-2' : 'ml-2'}>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                )}
              </ButtonCreat>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="px-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tabs.map((tab) => {
              const currentData = covenantData[getArrayKey(tab.id as 1 | 2 | 3)];
              const isLoading = loading[getRequestType(tab.array)];

              return (
                  <div
                    key={tab.id}
                    className="shadow-2xl transition-all duration-300 hover:shadow-xl h-full"
                    style={{
                      backgroundColor: 'var(--color-card-background)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '20px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      margin: '12px',
                      minHeight: '400px'
                    }}
                  >
                    {/* Tab Header */}
                    <div
                      className="text-center relative cursor-pointer transition-colors hover:bg-opacity-50"
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        background: 'linear-gradient(135deg, var(--color-card-background) 0%, var(--color-surface-secondary) 100%)',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        paddingTop: '20px',
                        paddingBottom: '20px',
                        marginBottom: '16px',
                        borderTopLeftRadius: '20px',
                        borderTopRightRadius: '20px'
                      }}
                      onClick={() => {
                        if (currentData.length === 0) {
                          fetchCovenantData(tab.array);
                        }
                        setActiveTab(activeTab === tab.id ? 0 as any : tab.id as 1 | 2 | 3);
                      }}
                    >
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: tab.id === 1 ? 'rgba(59, 130, 246, 0.1)' :
                                           tab.id === 2 ? 'rgba(16, 185, 129, 0.1)' :
                                           'rgba(239, 68, 68, 0.1)'
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            {tab.id === 1 ? (
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                    stroke='#3b82f6'
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            ) : tab.id === 2 ? (
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3"
                                    stroke='#10b981'
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            ) : (
                              <path d="M18 6L6 18M6 6l12 12"
                                    stroke='#ef4444'
                                    strokeWidth="2" strokeLinecap="round"/>
                            )}
                          </svg>
                        </div>
                        <h3
                          className="font-bold"
                          style={{
                            fontSize: '18px',
                            fontFamily: fonts.IBMPlexSansArabicSemiBold,
                            color: 'var(--color-text-primary)',
                            lineHeight: 1.4
                          }}
                        >
                          {tab.name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span
                          style={{
                            fontSize: '14px',
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            color: 'var(--color-text-secondary)',
                            marginBottom: '8px'
                          }}
                        >
                          {language === 'ar' ? 'عدد الطلبات:' : 'Requests Count:'}
                        </span>
                        <div
                          className="px-3 py-1 rounded-full text-sm font-bold min-w-[2rem] text-center"
                          style={{
                            backgroundColor: tab.id === 1 ? '#3b82f6' : tab.id === 2 ? '#10b981' : '#ef4444',
                            color: 'white'
                          }}
                        >
                          {currentData.length}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} />
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchCovenantData(tab.array);
                            }}
                            className="p-1.5 rounded-full transition-all duration-200 hover:scale-105"
                            style={{
                              color: 'var(--color-text-secondary)',
                              backgroundColor: 'var(--color-surface)',
                              border: '1px solid var(--color-border)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-hover-background)';
                              e.currentTarget.style.color = 'var(--color-primary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                              e.currentTarget.style.color = 'var(--color-text-secondary)';
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-hidden" style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '16px' }}>
                    {currentData.length > 0 ? (
                      <div
                        className="max-h-96 overflow-auto rounded-xl space-y-4"
                        style={{
                          backgroundColor: 'var(--color-surface-secondary)',
                          border: '1px solid var(--color-border)',
                          padding: '16px',
                          marginBottom: '24px'
                        }}
                      >
                        {currentData.map((item) => (
                          <div
                            key={item.id}
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                            className="transition-all duration-200 hover:shadow-md mb-6"
                            style={{
                              backgroundColor: 'var(--color-card-background)',
                              border: '1px solid var(--color-border)',
                              borderRadius: '12px',
                              padding: '16px 20px',
                              marginBottom: '16px'
                            }}
                          >
                            {/* Branch Header */}
                            <div className="flex items-center justify-between w-full mb-3">
                              <div className="flex items-center gap-2">
                                <span
                                  style={{
                                    fontSize: '14px',
                                    fontFamily: fonts.IBMPlexSansArabicSemiBold,
                                    color: 'var(--color-text-primary)'
                                  }}
                                >
                                  {item.NameSub}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  style={{
                                    fontSize: '12px',
                                    fontFamily: fonts.IBMPlexSansArabicRegular,
                                    color: item.RejectionStatus === 'true' ? '#ef4444' :
                                           item.OrderStatus === 'true' ? '#10b981' : '#3b82f6',
                                    backgroundColor: item.RejectionStatus === 'true' ? 'rgba(239, 68, 68, 0.1)' :
                                                   item.OrderStatus === 'true' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: `1px solid ${item.RejectionStatus === 'true' ? '#ef4444' :
                                                        item.OrderStatus === 'true' ? '#10b981' : '#3b82f6'}`
                                  }}
                                >
                                  {item.RejectionStatus === 'true' ? (language === 'ar' ? 'مرفوض' : 'Rejected') :
                                   item.OrderStatus === 'true' ? (language === 'ar' ? 'مقبول' : 'Accepted') : (language === 'ar' ? 'معلق' : 'Pending')}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {/* Date and User Info Row */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                  </svg>
                                  <span style={{
                                    fontSize: '12px',
                                    fontFamily: fonts.IBMPlexSansArabicRegular,
                                    color: 'var(--color-text-secondary)'
                                  }}>
                                    {item.Date}
                                  </span>
                                </div>
                                <span style={{
                                  fontSize: '12px',
                                  fontFamily: fonts.IBMPlexSansArabicMedium,
                                  color: 'var(--color-text-primary)'
                                }}>
                                  {item.userName}
                                </span>
                              </div>

                              {/* Amount and Statement Row */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span style={{
                                    fontSize: '12px',
                                    fontFamily: fonts.IBMPlexSansArabicRegular,
                                    color: 'var(--color-text-secondary)'
                                  }}>
                                    {t('covenantPage.amount')}:
                                  </span>
                                  <span style={{
                                    fontSize: '14px',
                                    fontFamily: fonts.IBMPlexSansArabicSemiBold,
                                    color: 'var(--color-primary)'
                                  }}>
                                    {item.Amount.toLocaleString()} {language === 'ar' ? 'ريال' : 'SAR'}
                                  </span>
                                </div>
                              </div>

                              {/* Statement */}
                              <div>
                                <span style={{
                                  fontSize: '12px',
                                  fontFamily: fonts.IBMPlexSansArabicRegular,
                                  color: 'var(--color-text-secondary)'
                                }}>
                                  {t('covenantPage.statement')}:
                                </span>
                                <span style={{
                                  fontSize: '13px',
                                  fontFamily: fonts.IBMPlexSansArabicMedium,
                                  color: 'var(--color-text-primary)'
                                }}>
                                  {item.Statement}
                                </span>
                              </div>

                              {/* Rejection Details */}
                              {item.RejectionStatus === 'true' && (
                                <div
                                  className="p-3 rounded-lg border"
                                  style={{
                                    backgroundColor: 'var(--color-surface-secondary)',
                                    borderColor: 'var(--color-border)',
                                    border: '1px solid #ef4444'
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }}>
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="15" y1="9" x2="9" y2="15"/>
                                        <line x1="9" y1="9" x2="15" y2="15"/>
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4
                                        className="font-bold mb-3 text-sm"
                                        style={{
                                          color: '#ef4444',
                                          fontFamily: fonts.IBMPlexSansArabicSemiBold
                                        }}
                                      >
                                        {language === 'ar' ? 'تفاصيل الرفض' : 'Rejection Details'}
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <div
                                          className="p-2 rounded"
                                          style={{
                                            backgroundColor: 'var(--color-surface)',
                                            border: '1px solid var(--color-border)'
                                          }}
                                        >
                                          <span
                                            className="font-bold"
                                            style={{
                                              color: 'var(--color-text-secondary)',
                                              fontFamily: fonts.IBMPlexSansArabicMedium
                                            }}
                                          >
                                            {t('covenantPage.rejectionReason')}:
                                          </span>
                                          <span
                                            className="mr-2 break-words"
                                            style={{
                                              color: 'var(--color-text-primary)',
                                              fontFamily: fonts.IBMPlexSansArabicRegular
                                            }}
                                          >
                                            {item.Reasonforrejection}
                                          </span>
                                        </div>
                                        <div
                                          className="p-2 rounded"
                                          style={{
                                            backgroundColor: 'var(--color-surface)',
                                            border: '1px solid var(--color-border)'
                                          }}
                                        >
                                          <span
                                            className="font-bold"
                                            style={{
                                              color: 'var(--color-text-secondary)',
                                              fontFamily: fonts.IBMPlexSansArabicMedium
                                            }}
                                          >
                                            {t('covenantPage.approver')}:
                                          </span>
                                          <span
                                            className={language === 'ar' ? 'mr-2' : 'ml-2'}
                                            style={{
                                              color: 'var(--color-text-primary)',
                                              fontFamily: fonts.IBMPlexSansArabicRegular
                                            }}
                                          >
                                            {item.Approvingperson}
                                          </span>
                                        </div>
                                        <div
                                          className="p-2 rounded"
                                          style={{
                                            backgroundColor: 'var(--color-surface)',
                                            border: '1px solid var(--color-border)'
                                          }}
                                        >
                                          <span
                                            className="font-bold"
                                            style={{
                                              color: 'var(--color-text-secondary)',
                                              fontFamily: fonts.IBMPlexSansArabicMedium
                                            }}
                                          >
                                            {t('covenantPage.rejectionDate')}:
                                          </span>
                                          <span
                                            className={language === 'ar' ? 'mr-2' : 'ml-2'}
                                            style={{
                                              color: 'var(--color-text-primary)',
                                              fontFamily: fonts.IBMPlexSansArabicRegular
                                            }}
                                          >
                                            {item.Dateofrejection}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              {tab.array === 'arrayOpen' && (
                                <div className="flex gap-3 pt-4">
                                  {item.userName !== user?.data?.userName ? (
                                    // Admin/Manager actions
                                    <>
                                      <button
                                        onClick={() => {
                                          setSelectedItem(item);
                                          setShowConfirmModal(true);
                                        }}
                                        disabled={loading[`accept_${item.id}`]}
                                        className="rounded transition-all duration-200 hover:scale-110"
                                        style={{
                                          padding: '6px 12px',
                                          fontSize: '12px',
                                          backgroundColor: '#10b981',
                                          border: '1px solid #059669',
                                          color: 'white',
                                          fontFamily: fonts.IBMPlexSansArabicSemiBold
                                        }}
                                      >
                                        {loading[`accept_${item.id}`] ? (
                                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          t('covenantPage.acceptRequest')
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
                                        className="rounded transition-all duration-200 hover:scale-110"
                                        style={{
                                          padding: '6px 12px',
                                          fontSize: '12px',
                                          backgroundColor: '#ef4444',
                                          border: '1px solid #dc2626',
                                          color: 'white',
                                          fontFamily: fonts.IBMPlexSansArabicSemiBold
                                        }}
                                      >
                                        {t('covenantPage.rejectRequest')}
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
                                        className="flex-1 py-1.5 px-2 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-1 text-xs"
                                        style={{
                                          backgroundColor: '#3b82f6',
                                          color: 'white'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = '#2563eb';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = '#3b82f6';
                                        }}
                                      >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                          <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                        {t('covenantPage.editRequest')}
                                      </button>

                                      <button
                                        onClick={() => deleteRequest(item.id)}
                                        disabled={loading[`delete_${item.id}`]}
                                        className="flex-1 py-1.5 px-2 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-1 text-xs"
                                        style={{
                                          backgroundColor: '#ef4444',
                                          color: 'white'
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!loading[`delete_${item.id}`]) {
                                            e.currentTarget.style.backgroundColor = '#dc2626';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!loading[`delete_${item.id}`]) {
                                            e.currentTarget.style.backgroundColor = '#ef4444';
                                          }
                                        }}
                                      >
                                        {loading[`delete_${item.id}`] ? (
                                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <polyline points="3,6 5,6 21,6"/>
                                              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                                            </svg>
                                            {t('covenantPage.deleteRequest')}
                                          </>
                                        )}
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}

                              {/* Edit Rejection Reason (for rejected requests by current user) */}
                              {tab.array === 'arrayReject' && item.Approvingperson === user?.data?.userName && (
                                <div className="pt-1">
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
                                    className="w-full py-1.5 px-2 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-1 text-xs"
                                    style={{
                                      backgroundColor: 'var(--color-text-secondary)',
                                      color: 'white'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'var(--color-text-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'var(--color-text-secondary)';
                                    }}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                      <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    تعديل سبب الرفض
                                  </button>
                                </div>
                                )}
                            </div>
                          </div>
                        ))}

                        {/* Load More Button */}
                        {currentData.length > 0 && (
                          <div className="pt-2 text-center border-t" style={{ borderColor: 'var(--color-border)' }}>
                            <button
                              onClick={() => {
                                const lastItem = currentData[currentData.length - 1];
                                fetchCovenantData(tab.array, lastItem.id);
                              }}
                              disabled={isLoading}
                              className="py-1.5 px-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-1 mx-auto text-xs"
                              style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'white'
                              }}
                              onMouseEnter={(e) => {
                                if (!isLoading) {
                                  e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isLoading) {
                                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                                }
                              }}
                            >
                              {isLoading ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                                </>
                              ) : (
                                <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M7 13l3 3 7-7"/>
                                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.22.45 4.56 1.23"/>
                                  </svg>
                                  {t('common.loadMore')}
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Empty State */
                      <div className="p-6 text-center">
                        <div className="max-w-xs mx-auto">
                          <div
                            className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: 'var(--color-surface-secondary)',
                              border: '1px solid var(--color-border)'
                            }}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.5">
                              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                          </div>
                          <h3
                            className="text-sm font-bold mb-2"
                            style={{
                              color: 'var(--color-text-primary)',
                              fontFamily: fonts.IBMPlexSansArabicSemiBold
                            }}
                          >
                            {language === 'ar' ? 'لا توجد طلبات' : 'No Requests'}
                          </h3>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {tab.array === 'arrayOpen'
                              ? t('covenantPage.noOpenRequests')
                              : tab.array === 'arrayClose'
                              ? t('covenantPage.noClosedRequests')
                              : t('covenantPage.noRejectedRequests')
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ContentSection>

      {/* Create/Edit Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            className="w-full max-w-md shadow-2xl"
            style={{
              backgroundColor: 'var(--color-card-background)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Header */}
            <div
              style={{
                borderBottom: '1px solid var(--color-border)',
                background: 'linear-gradient(135deg, var(--color-card-background) 0%, var(--color-surface-secondary) 100%)',
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '20px',
                paddingBottom: '20px',
                marginBottom: '16px',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px'
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    {createRequest.Edit ? (
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    ) : (
                      <path d="M12 5v14m-7-7h14"/>
                    )}
                  </svg>
                </div>
                <h2
                  className="font-bold"
                  style={{
                    fontSize: '18px',
                    fontFamily: fonts.IBMPlexSansArabicSemiBold,
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.4
                  }}
                >
                  {createRequest.Edit ? t('covenantPage.editRequest') : t('covenantPage.createNewRequest')}
                </h2>
              </div>
            </div>

            {/* Content */}
            <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '16px' }}>
              <div className="space-y-4">
                {!createRequest.Edit && (
                  <div>
                    <label
                      className="block mb-2"
                      style={{
                        fontSize: '14px',
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      {t('covenantPage.amount')}
                    </label>
                    <input
                      type="number"
                      value={createRequest.Amount || ''}
                      onChange={(e) => setCreateRequest(prev => ({
                        ...prev,
                        Amount: Number(e.target.value)
                      }))}
                      className="w-full transition-all duration-200 focus:scale-[1.02]"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        color: 'var(--color-text-primary)'
                      }}
                      placeholder={t('covenantPage.enterAmount')}
                    />
                  </div>
                )}

                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontSize: '14px',
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    {t('covenantPage.statement')}
                  </label>
                  <textarea
                    value={createRequest.title}
                    onChange={(e) => setCreateRequest(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    className="w-full transition-all duration-200 focus:scale-[1.02] resize-none"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      color: 'var(--color-text-primary)',
                      minHeight: '100px'
                    }}
                    rows={4}
                    placeholder={t('covenantPage.enterStatement')}
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div
              className="flex gap-3"
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '16px',
                paddingBottom: '24px'
              }}
            >
              <button
                onClick={resetCreateRequest}
                className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--color-surface-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '16px',
                  fontFamily: fonts.IBMPlexSansArabicMedium
                }}
              >
                {t('covenantPage.cancel')}
              </button>
              <button
                onClick={createRequest.Edit ? updateRequest : createNewRequest}
                disabled={loading.create || loading.update}
                className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  border: 'none'
                }}
              >
                {loading.create || loading.update ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  createRequest.Edit ? (language === 'ar' ? 'تحديث' : 'Update') : t('covenantPage.send')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Request Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            className="w-full max-w-md shadow-2xl"
            style={{
              backgroundColor: 'var(--color-card-background)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Header */}
            <div
              style={{
                borderBottom: '1px solid var(--color-border)',
                background: 'linear-gradient(135deg, var(--color-card-background) 0%, var(--color-surface-secondary) 100%)',
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '20px',
                paddingBottom: '20px',
                marginBottom: '16px',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px'
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <h2
                  className="font-bold"
                  style={{
                    fontSize: '18px',
                    fontFamily: fonts.IBMPlexSansArabicSemiBold,
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.4
                  }}
                >
                  {createRequest.Edit ? (language === 'ar' ? 'تعديل سبب الرفض' : 'Edit Rejection Reason') : t('covenantPage.rejectionReason')}
                </h2>
              </div>
            </div>

            {/* Content */}
            <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '16px' }}>
              <div>
                <label
                  className="block mb-2"
                  style={{
                    fontSize: '14px',
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  {language === 'ar' ? 'اذكر السبب' : 'Mention the Reason'}
                </label>
                <textarea
                  value={createRequest.title}
                  onChange={(e) => setCreateRequest(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  className="w-full transition-all duration-200 focus:scale-[1.02] resize-none"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontFamily: fonts.IBMPlexSansArabicRegular,
                    color: 'var(--color-text-primary)',
                    minHeight: '100px'
                  }}
                  rows={4}
                  placeholder={language === 'ar' ? 'اكتب سبب رفض الطلب' : 'Write the reason for rejection'}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div
              className="flex gap-3"
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '16px',
                paddingBottom: '24px'
              }}
            >
              <button
                onClick={resetCreateRequest}
                className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--color-surface-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '16px',
                  fontFamily: fonts.IBMPlexSansArabicMedium
                }}
              >
                {t('covenantPage.cancel')}
              </button>
              <button
                onClick={createRequest.Edit ? updateRequest : rejectRequest}
                disabled={loading.reject || loading.update}
                className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  border: 'none'
                }}
              >
                {loading.reject || loading.update ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  createRequest.Edit ? (language === 'ar' ? 'تحديث' : 'Update') : (language === 'ar' ? 'رفض' : 'Reject')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Accept Modal */}
      {showConfirmModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4 text-center">{t('covenantPage.confirmAccept')}</h2>

            <p className="text-center text-gray-600 mb-6">
              {t('covenantPage.acceptRequestConfirmMessage')}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedItem(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                {language === 'ar' ? 'لا' : 'No'}
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
                  language === 'ar' ? 'نعم' : 'Yes'
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

// Wrap the component with permission check to match mobile app behavior
function CovenantPageWrapper() {
  const { language } = useAppSelector((state: any) => state.user);
  const { t } = useTranslation();

  return (
    <PermissionBasedVisibility
      permission="covenant"
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-ibm-arabic-bold text-gray-900 mb-2">
              {language === 'ar' ? 'غير مصرح لك بالوصول' : 'Access Denied'}
            </h2>
            <p className="text-gray-600 font-ibm-arabic-regular">
              {language === 'ar' ? 'تحتاج صلاحية العهد للوصول لهذه الصفحة' : 'You need covenant permission to access this page'}
            </p>
          </div>
        </div>
      }
    >
      <CovenantPage />
    </PermissionBasedVisibility>
  );
}

export default CovenantPageWrapper;
