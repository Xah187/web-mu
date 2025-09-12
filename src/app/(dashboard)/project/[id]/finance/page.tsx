'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import useFinance, { FinanceItem, Totaltofixt, truncateNumber, convertArabicToEnglish, formatDateEnglish } from '@/hooks/useFinance';
import useValidityUser from '@/hooks/useValidityUser';
import { scale } from '@/utils/responsiveSize';

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

// Header Component - Exactly matching mobile app
const FinanceHeader = ({
  onBack,
  onArchive,
  onShare,
  onChat,
  projectName,
  totals
}: {
  onBack: () => void;
  onArchive: () => void;
  onShare: () => void;
  onChat: () => void;
  projectName: string;
  totals: any;
}) => {


  return (
    <div className="bg-white rounded-b-3xl" style={{ height: scale(280) }}>
      {/* Top Navigation */}
      <div className="flex items-center justify-between pt-4 px-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Title Section */}
      <div className="px-6 mt-3">
        <h1 className="font-ibm-arabic-semibold text-gray-900" style={{ fontSize: scale(17) }}>المالية</h1>
        <p className="font-ibm-arabic-semibold text-gray-900" style={{ fontSize: scale(12) }}>{projectName}</p>
      </div>

      {/* Finance Summary - Exactly like mobile app */}
      <div className="mx-4 mt-6 mb-4 border border-gray-200 rounded-2xl" style={{ height: scale(120) }}>
        {/* Top Row */}
        <div className="flex items-center justify-around h-16 px-4">
          {/* العهد */}
          <div className="flex flex-col items-center flex-1 px-3">
            <p className="font-ibm-arabic-medium text-gray-900 text-center" style={{ fontSize: scale(12) }}>العهد</p>
            <p className="font-ibm-arabic-semibold text-gray-900 mt-1"
               style={{ fontSize: scale(20), fontFeatureSettings: '"tnum"' }}>
              {Totaltofixt(totals?.TotalRevenue || 0)}
            </p>
          </div>

          {/* Separator */}
          <div className="w-px h-16 bg-gray-200"></div>

          {/* المصروفات */}
          <div className="flex flex-col items-center flex-1 px-3">
            <p className="font-ibm-arabic-medium text-gray-900 text-center" style={{ fontSize: scale(12) }}>المصروفات</p>
            <p className="font-ibm-arabic-semibold text-gray-900 mt-1"
               style={{ fontSize: scale(20), fontFeatureSettings: '"tnum"' }}>
              {Totaltofixt(totals?.TotalExpense || 0)}
            </p>
          </div>

          {/* Separator */}
          <div className="w-px h-16 bg-gray-200"></div>

          {/* المرتجعات */}
          <div className="flex flex-col items-center flex-1 px-3">
            <p className="font-ibm-arabic-medium text-gray-900 text-center" style={{ fontSize: scale(12) }}>المرتجعات</p>
            <p className="font-ibm-arabic-semibold text-gray-900 mt-1"
               style={{ fontSize: scale(20), fontFeatureSettings: '"tnum"' }}>
              {Totaltofixt(totals?.TotalReturns || 0)}
            </p>
          </div>
        </div>

        {/* Horizontal Separator */}
        <div className="w-full h-px bg-gray-200 mx-auto" style={{ width: '90%' }}></div>

        {/* Bottom Row - الرصيد المتبقي */}
        <div className="flex items-center justify-center h-12">
          <div className="flex flex-col items-center">
            <p className="font-ibm-arabic-medium text-gray-900 text-center" style={{ fontSize: scale(12) }}>الرصيد المتبقي</p>
            <p className="font-ibm-arabic-semibold text-gray-900"
               style={{ fontSize: scale(20), fontFeatureSettings: '"tnum"' }}>
              {Totaltofixt(totals?.RemainingBalance || 0)}
            </p>
          </div>
        </div>


      </div>

      {/* Action Buttons - Exactly like mobile app */}
      <div className="flex justify-around px-4 pb-4">
        <button
          onClick={onChat}
          className="flex items-center bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-ibm-arabic-semibold text-gray-900" style={{ fontSize: scale(12) }}>تواصل</span>
        </button>

        <button
          onClick={onArchive}
          className="flex items-center bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2">
            <path d="M21 8V21H3V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 3H1V8H23V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-ibm-arabic-semibold text-gray-900" style={{ fontSize: scale(12) }}>أرشيف</span>
        </button>

        <button
          onClick={onShare}
          className="flex items-center bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2">
            <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M8.59 13.51L15.42 17.49" stroke="currentColor" strokeWidth="2"/>
            <path d="M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="font-ibm-arabic-semibold text-gray-900" style={{ fontSize: scale(12) }}>كشف الحساب</span>
        </button>
      </div>
    </div>
  );
};



// Collapsible Finance Section - Exactly matching mobile app
const FinanceSection = ({
  title,
  items,
  type,
  onLoadMore,
  hasMore,
  loading,
  onItemEdit,
  onItemDelete,
  onItemView,
  onFetchData
}: {
  title: string;
  items: FinanceItem[];
  type: string;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  onItemEdit: (item: FinanceItem) => void;
  onItemDelete: (item: FinanceItem) => void;
  onItemView: (item: FinanceItem) => void;
  onFetchData: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);



  const handleHeaderClick = () => {
    if (items.length > 0) {
      setIsExpanded(!isExpanded);
    } else {
      onFetchData();
      setIsExpanded(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl mx-4 mb-4 py-3" style={{ width: '90%', alignSelf: 'center' }}>
      {/* Header - Always visible */}
      <button
        onClick={handleHeaderClick}
        className="flex items-center justify-between w-full px-4 py-2"
      >
        <h3 className="font-ibm-arabic-semibold text-gray-900" style={{ fontSize: scale(15) }}>
          {title}
        </h3>
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          >
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Content - Only visible when expanded */}
      {isExpanded && (
        <div className="overflow-hidden">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => onItemView(item)}
              className="w-full p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  {/* Icon or Invoice Number */}
                  <div className="w-12 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    {type === 'مصروفات' ? (
                      <span className="text-xs font-ibm-arabic-regular text-gray-600">
                        {item.InvoiceNo}
                      </span>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 text-right">
                    <p className="font-ibm-arabic-semibold text-gray-900 text-sm truncate" style={{ fontSize: scale(13) }}>
                      {String(item.Data).slice(0, 17)}
                    </p>
                    <p className="font-ibm-arabic-regular text-gray-500 text-xs" style={{ fontSize: scale(10) }}>
                      {formatDateEnglish(item.Date)}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-left">
                  <p className="font-ibm-arabic-semibold text-gray-900" style={{ fontSize: scale(13), fontFeatureSettings: '"tnum"' }}>
                    {Totaltofixt(item.Amount)} ر.س
                  </p>
                </div>
              </div>
            </button>
          ))}

          {/* Load More Button */}
          {hasMore && items.length > 0 && (
            <div className="flex items-center justify-center py-3">
              <button
                onClick={onLoadMore}
                disabled={loading}
                className="flex items-center text-blue-600 font-ibm-arabic-regular disabled:opacity-50"
                style={{ fontSize: scale(13) }}
              >
                <span className="ml-2">تحميل المزيد</span>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function FinancePage() {
  const params = useParams();
  const router = useRouter();

  const projectId = parseInt(params.id as string);
  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();

  const {
    expenses,
    revenues,
    returns,
    totals,
    searchResults,
    loading,
    loadingTotals,
    error,
    fetchExpenses,
    fetchRevenues,
    fetchReturns,
    fetchTotals,
    searchFinance,
    clearSearch,
    refresh
  } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FinanceItem | null>(null);
  const [editingItem, setEditingItem] = useState<FinanceItem | null>(null);

  // Load initial data
  useEffect(() => {
    if (projectId && user?.accessToken) {
      refresh();
      fetchTotals(projectId);
      fetchRevenues(projectId);
      fetchExpenses(projectId);
      fetchReturns(projectId);
    }
  }, [projectId, user?.accessToken]);

  const handleBack = () => {
    router.back();
  };

  const handleArchive = () => {
    router.push(`/project/${projectId}/archives`);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleChat = () => {
    // مطابق للتطبيق: navigation.navigate('Chate', { typess: 'مالية', ProjectID: idProject, nameRoom: 'المالية' })
    const chatParams = new URLSearchParams({
      ProjectID: projectId.toString(),
      typess: 'مالية',
      nameRoom: 'المالية',
      nameProject: totals?.Nameproject || 'المشروع'
    });
    router.push(`/chat?${chatParams.toString()}`);
  };

  const handleAddFinance = async () => {
    // Check if user can create finance items (similar to mobile app logic)
    if (user?.data?.jobdiscrption === 'موظف' || user?.data?.job === 'Admin') {
      setEditingItem(null);
      setShowAddModal(true);
    } else {
      alert('ليس في نطاق صلاحياتك');
    }
  };

  const handleFilter = () => {
    setShowFilterModal(true);
  };

  const handleItemEdit = async (item: FinanceItem) => {
    // Check if user can edit finance items (similar to mobile app logic)
    if (user?.data?.jobdiscrption === 'موظف' || user?.data?.job === 'Admin') {
      setEditingItem(item);
      setShowAddModal(true);
    } else {
      alert('ليس في نطاق صلاحياتك');
    }
  };

  const handleItemDelete = async (item: FinanceItem) => {
    // Check if user can delete finance items (similar to mobile app logic)
    if (user?.data?.jobdiscrption === 'موظف' || user?.data?.job === 'Admin') {
      // Show confirmation dialog
      if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
        // Delete logic here
      }
    } else {
      alert('ليس في نطاق صلاحياتك');
    }
  };

  const handleItemView = (item: FinanceItem) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  // Load more handlers - matching mobile app logic exactly
  const handleLoadMoreRevenues = () => {
    if (revenues.length === 0) return;
    const lastItem = revenues[revenues.length - 1];
    const lastID = lastItem.RevenueId || 0;
    fetchRevenues(projectId, lastID);
  };

  const handleLoadMoreExpenses = () => {
    if (expenses.length === 0) return;
    const lastItem = expenses[expenses.length - 1];
    const lastID = lastItem.InvoiceNo || lastItem.Expenseid || 0;
    fetchExpenses(projectId, lastID);
  };

  const handleLoadMoreReturns = () => {
    if (returns.length === 0) return;
    const lastItem = returns[returns.length - 1];
    const lastID = lastItem.ReturnsId || 0;
    fetchReturns(projectId, lastID);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-home flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-red-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title="المالية"
          subtitle={totals?.Nameproject || 'المشروع'}
          backButton={
            <button onClick={handleBack} className="p-2 hover:bg-gray-50 rounded-lg transition-colors" aria-label="رجوع">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          }
          actions={
            <div className="flex items-center gap-2">
              <button onClick={handleChat} className="p-2 hover:bg-gray-100 rounded-lg" title="تواصل" aria-label="تواصل">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.53 20.79 16.04 20.41 16.41C20.04 16.79 19.53 17 19 17H7L3 21V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button onClick={handleArchive} className="p-2 hover:bg-gray-100 rounded-lg" title="أرشيف" aria-label="أرشيف">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 8V21H3V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 3H1V8H23V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-lg" title="كشف الحساب" aria-label="كشف الحساب">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8.59 13.51L15.42 17.49" stroke="currentColor" strokeWidth="2"/>
                  <path d="M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          }
        />
      }
    >
      <ContentSection>
      {/* Action Buttons */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={handleAddFinance}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="ml-2">
            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          إنشاء عملية
        </button>

        {searchResults.length > 0 && (
          <button
            onClick={clearSearch}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-gray-700 transition-colors"
          >
            إلغاء فلتر
          </button>
        )}

        <button
          onClick={handleFilter}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-20" style={{ height: 'calc(100vh - 350px)' }}>
        {searchResults.length > 0 ? (
          <FinanceSection
            title={`نتائج البحث`}
            items={searchResults}
            type="search"
            onLoadMore={() => {}}
            hasMore={false}
            loading={loading}
            onItemEdit={handleItemEdit}
            onItemDelete={handleItemDelete}
            onItemView={handleItemView}
            onFetchData={() => {}}
          />
        ) : (
          <>
                          <FinanceSection
                title="عهد"
                items={revenues}
                type="عهد"
                onLoadMore={handleLoadMoreRevenues}
                hasMore={revenues.length % 10 === 0 && revenues.length > 0}
                loading={loading}
                onItemEdit={handleItemEdit}
                onItemDelete={handleItemDelete}
                onItemView={handleItemView}
                onFetchData={() => fetchRevenues(projectId)}
              />

              <FinanceSection
                title="مصروفات"
                items={expenses}
                type="مصروفات"
                onLoadMore={handleLoadMoreExpenses}
                hasMore={expenses.length % 10 === 0 && expenses.length > 0}
                loading={loading}
                onItemEdit={handleItemEdit}
                onItemDelete={handleItemDelete}
                onItemView={handleItemView}
                onFetchData={() => fetchExpenses(projectId)}
              />

              <FinanceSection
                title="إعادة مرتجع"
                items={returns}
                type="إعادة مرتجع"
                onLoadMore={handleLoadMoreReturns}
                hasMore={returns.length % 10 === 0 && returns.length > 0}
                loading={loading}
                onItemEdit={handleItemEdit}
                onItemDelete={handleItemDelete}
                onItemView={handleItemView}
                onFetchData={() => fetchReturns(projectId)}
              />
          </>
        )}
      </div>

      {/* Modals would go here */}
      {/* TODO: Add Add/Edit, Filter, Share, and View modals */}
      </ContentSection>
    </ResponsiveLayout>
  );
}