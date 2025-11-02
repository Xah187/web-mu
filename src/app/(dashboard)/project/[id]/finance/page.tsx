'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import useFinance, { FinanceItem, Totaltofixt, truncateNumber, convertArabicToEnglish, formatDateEnglish } from '@/hooks/useFinance';
import useValidityUser from '@/hooks/useValidityUser';
import useProjectDetails from '@/hooks/useProjectDetails';
import { scale } from '@/utils/responsiveSize';
import { Tostget } from '@/components/ui/Toast';

import ResponsiveLayout, { PageHeader, ContentSection, Card } from '@/components/layout/ResponsiveLayout';
import CreateFinanceModal from '@/components/finance/CreateFinanceModal';
import ViewFinanceModal from '@/components/finance/ViewFinanceModal';
import { useTranslation } from '@/hooks/useTranslation';

// Finance Summary Card Component - Modern design
const FinanceSummaryCard = ({ totals, t, isRTL, dir }: { totals: any; t: any; isRTL: boolean; dir: string }) => {
  const [selectedTotal, setSelectedTotal] = useState({ number: 0, visible: false });

  return (
    <Card className="mb-6">
      <div className="relative" style={{ direction: dir as 'rtl' | 'ltr' }}>
        {/* Labels Row */}
        <div className="flex items-center justify-around px-4 py-2">
          <div className="flex-1 text-center">
            <p
              className="font-ibm-arabic-medium"
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                textAlign: 'center'
              }}
            >
              {t('finance.revenues')}
            </p>
          </div>
          <div className="flex-1 text-center">
            <p
              className="font-ibm-arabic-medium"
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                textAlign: 'center'
              }}
            >
              {t('finance.expenses')}
            </p>
          </div>
          <div className="flex-1 text-center">
            <p
              className="font-ibm-arabic-medium"
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                textAlign: 'center'
              }}
            >
              {t('finance.returns')}
            </p>
          </div>
        </div>

        {/* Values Row */}
        <div className="flex items-center justify-around px-4 py-2">
          {/* Revenues */}
          <div className="flex flex-col items-center justify-center flex-1">
            <button
              onClick={() => setSelectedTotal({ number: totals?.TotalRevenue || 0, visible: true })}
              className="font-ibm-arabic-semibold hover:text-blue-600 transition-colors text-center w-full"
              style={{
                fontSize: 'var(--font-size-xl)',
                fontFeatureSettings: '"tnum"',
                color: 'var(--color-text-primary)',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {Totaltofixt(totals?.TotalRevenue || 0)}
            </button>
          </div>

          {/* Separator */}
          <div
            className="w-px"
            style={{
              height: '40px',
              backgroundColor: 'var(--color-border)'
            }}
          ></div>

          {/* Expenses */}
          <div className="flex flex-col items-center justify-center flex-1">
            <button
              onClick={() => setSelectedTotal({ number: totals?.TotalExpense || 0, visible: true })}
              className="font-ibm-arabic-semibold hover:text-blue-600 transition-colors text-center w-full"
              style={{
                fontSize: 'var(--font-size-xl)',
                fontFeatureSettings: '"tnum"',
                color: 'var(--color-text-primary)',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {Totaltofixt(totals?.TotalExpense || 0)}
            </button>
          </div>

          {/* Separator */}
          <div
            className="w-px"
            style={{
              height: '40px',
              backgroundColor: 'var(--color-border)'
            }}
          ></div>

          {/* Returns */}
          <div className="flex flex-col items-center justify-center flex-1">
            <button
              onClick={() => setSelectedTotal({ number: totals?.TotalReturns || 0, visible: true })}
              className="font-ibm-arabic-semibold hover:text-blue-600 transition-colors text-center w-full"
              style={{
                fontSize: 'var(--font-size-xl)',
                fontFeatureSettings: '"tnum"',
                color: 'var(--color-text-primary)',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {Totaltofixt(totals?.TotalReturns || 0)}
            </button>
          </div>
        </div>

        {/* Separator Line */}
        <div
          className="w-full h-px mx-4"
          style={{
            backgroundColor: 'var(--color-border)',
            width: 'calc(100% - 32px)'
          }}
        ></div>

        {/* Bottom Label Row */}
        <div className="flex items-center justify-center py-2">
          <p
            className="font-ibm-arabic-medium text-center"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              textAlign: 'center'
            }}
          >
            {t('finance.remainingBalance')}
          </p>
        </div>

        {/* Bottom Value Row */}
        <div className="flex items-center justify-center py-2">
          <button
            onClick={() => setSelectedTotal({ number: totals?.RemainingBalance || 0, visible: true })}
            className="font-ibm-arabic-semibold hover:text-blue-600 transition-colors text-center"
            style={{
              fontSize: 'var(--font-size-xl)',
              fontFeatureSettings: '"tnum"',
              color: 'var(--color-text-primary)',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {Totaltofixt(totals?.RemainingBalance || 0)}
          </button>
        </div>

        {/* Full Number Display Overlay */}
        {selectedTotal.visible && (
          <div
            className="absolute inset-0 rounded-xl flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: 'var(--color-surface-secondary)' }}
            onClick={() => setSelectedTotal({ number: 0, visible: false })}
          >
            <p
              className="font-ibm-arabic-semibold"
              style={{
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text-primary)'
              }}
            >
              {Totaltofixt(selectedTotal.number)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};



// Modern Finance Section Component
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
  onFetchData,
  t,
  isRTL,
  dir
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
  t: any;
  isRTL: boolean;
  dir: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleHeaderClick = () => {
    if (items.length > 0) {
      setIsExpanded(!isExpanded);
    } else {
      onFetchData();
      setIsExpanded(true);
    }
  };

  // Auto-fetch data when component mounts
  useEffect(() => {
    if (items.length === 0) {
      onFetchData();
    }
  }, []);

  return (
    <Card className="mb-4">
      {/* Header - Always visible */}
      <button
        onClick={handleHeaderClick}
        className="flex items-center justify-between w-full p-0 mb-4"
      >
        <h3
          className="font-ibm-arabic-semibold"
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-primary)'
          }}
        >
          {title}
        </h3>
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Content - Only visible when expanded */}
      {isExpanded && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => onItemView(item)}
              className="w-full p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              style={{ backgroundColor: 'var(--color-surface-secondary)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Icon or Invoice Number */}
                  <div
                    className="w-12 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                  >
                    {type === 'مصروفات' ? (
                      <span
                        className="text-xs font-ibm-arabic-regular"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
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
                    <p
                      className="font-ibm-arabic-semibold text-sm truncate"
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {String(item.Data).slice(0, 17)}
                    </p>
                    <p
                      className="font-ibm-arabic-regular text-xs"
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-tertiary)'
                      }}
                    >
                      {formatDateEnglish(item.Date)}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-left">
                  <p
                    className="font-ibm-arabic-semibold"
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      fontFeatureSettings: '"tnum"',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {Totaltofixt(item.Amount)} {t('finance.sar')}
                  </p>
                </div>
              </div>
            </button>
          ))}

          {/* Load More Button */}
          {hasMore && items.length > 0 && (
            <div className="flex items-center justify-center pt-3">
              <button
                onClick={onLoadMore}
                disabled={loading}
                className="flex items-center text-blue-600 font-ibm-arabic-regular disabled:opacity-50 hover:underline"
                style={{ fontSize: 'var(--font-size-sm)', direction: dir as 'rtl' | 'ltr' }}
              >
                <span className={isRTL ? 'ml-2' : 'mr-2'}>{t('finance.loadMore')}</span>
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
    </Card>
  );
};

export default function FinancePage() {
  const params = useParams();
  const router = useRouter();

  const projectId = parseInt(params.id as string);
  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();
  const { project, loading: projectLoading, fetchProjectDetails } = useProjectDetails();
  const { t, isRTL, dir } = useTranslation();

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
    refresh,
    deleteFinanceItem
  } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FinanceItem | null>(null);
  const [editingItem, setEditingItem] = useState<FinanceItem | null>(null);

  // Load project details
  useEffect(() => {
    if (projectId && user?.accessToken) {
      fetchProjectDetails(projectId);
    }
  }, [projectId, user?.accessToken]);

  // Load initial data
  useEffect(() => {
    if (projectId && user?.accessToken) {
      console.log('Loading finance data for project:', projectId);
      refresh();
      fetchTotals(projectId);
      fetchRevenues(projectId);
      fetchExpenses(projectId);
      fetchReturns(projectId);
    }
  }, [projectId, user?.accessToken]);

  // Debug: Log data changes
  useEffect(() => {
    console.log('Finance data updated:', {
      revenues: revenues.length,
      expenses: expenses.length,
      returns: returns.length,
      totals,
      user: user?.data?.DisabledFinance,
      projectId
    });
  }, [revenues, expenses, returns, totals, user, projectId]);

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
    const chatParams = new URLSearchParams({
      ProjectID: projectId.toString(),
      typess: 'مالية',
      nameRoom: 'المالية',
      nameProject: totals?.Nameproject || t('finance.project')
    });
    router.push(`/chat?${chatParams.toString()}`);
  };

  const handleAddFinance = async () => {
    // Check if manual finance operations are enabled (matching mobile app logic)
    if (user?.data?.DisabledFinance === 'true') {
      // Check if user has permission to create finance operations
      if (await Uservalidation('انشاء عمليات مالية', projectId)) {
        setEditingItem(null);
        setShowAddModal(true);
      }
    } else {
      Tostget(t('finance.manualOperationsDisabled'));
    }
  };

  const handleFilter = () => {
    setShowFilterModal(true);
  };

  const handleItemEdit = async (item: FinanceItem) => {
    // Check if manual finance operations are enabled (matching mobile app logic)
    if (user?.data?.DisabledFinance === 'true') {
      // Check if user has permission to create finance operations (same as mobile app)
      if (await Uservalidation('انشاء عمليات مالية', projectId)) {
        setEditingItem(item);
        setShowAddModal(true);
      }
    } else {
      Tostget(t('finance.manualOperationsDisabled'));
    }
  };

  const handleItemDelete = async (item: FinanceItem) => {
    // Check if manual finance operations are enabled (matching mobile app logic)
    if (user?.data?.DisabledFinance === 'true') {
      // Check if user has permission to delete finance operations
      if (await Uservalidation('حذف عمليات مالية' as any, projectId)) {
        // Determine operation type based on item properties
        let operationType = '';
        if (item.Expenseid) operationType = t('finance.expenseType');
        else if (item.RevenueId) operationType = t('finance.revenueType');
        else if (item.ReturnsId) operationType = t('finance.returnType');

        const success = await deleteFinanceItem(item, operationType);
        if (success) {
          // Refresh data after successful deletion
          refresh();
          fetchTotals(projectId);
          fetchRevenues(projectId);
          fetchExpenses(projectId);
          fetchReturns(projectId);
        }
      }
    } else {
      Tostget(t('finance.manualOperationsDisabled'));
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
      <div className="min-h-screen bg-home flex items-center justify-center p-4" style={{ direction: dir as 'rtl' | 'ltr' }}>
        <div className="bg-white rounded-lg p-6 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-red-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">{t('finance.loadError')}</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
            style={{ direction: dir as 'rtl' | 'ltr' }}
          >
            {t('finance.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title={t('finance.title')}
          subtitle={totals?.Nameproject || t('finance.project')}
          backButton={
            <button onClick={handleBack} className="p-2 hover:bg-gray-50 rounded-lg transition-colors" aria-label={t('finance.back')} style={{ direction: dir as 'rtl' | 'ltr' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          }
          actions={
            <div className="flex items-center gap-2" style={{ direction: dir as 'rtl' | 'ltr' }}>
              <button onClick={handleChat} className="p-2 hover:bg-gray-100 rounded-lg" title={t('finance.chat')} aria-label={t('finance.chat')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.53 20.79 16.04 20.41 16.41C20.04 16.79 19.53 17 19 17H7L3 21V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button onClick={handleArchive} className="p-2 hover:bg-gray-100 rounded-lg" title={t('finance.archive')} aria-label={t('finance.archive')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 8V21H3V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 3H1V8H23V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-lg" title={t('finance.accountStatement')} aria-label={t('finance.accountStatement')}>
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
        {/* Finance Summary Card */}
        <FinanceSummaryCard totals={totals} t={t} isRTL={isRTL} dir={dir} />

        {/* Action Buttons Card */}
        <Card className="mb-6">
          <div className="flex items-center justify-between" style={{ direction: dir as 'rtl' | 'ltr' }}>
            <button
              onClick={handleAddFinance}
              className="inline-flex items-center gap-2 text-blue-600 hover:underline font-ibm-arabic-semibold bg-transparent p-0 transition-colors"
              style={{ fontSize: 'var(--font-size-base)', direction: dir as 'rtl' | 'ltr' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={isRTL ? 'ml-1' : 'mr-1'}>
                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('finance.createOperation')}
            </button>

            <div className="flex items-center gap-2">
              {searchResults.length > 0 && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 rounded-lg font-ibm-arabic-semibold transition-colors"
                  style={{
                    backgroundColor: 'var(--color-text-secondary)',
                    color: 'var(--color-surface)',
                    fontSize: 'var(--font-size-sm)',
                    direction: dir as 'rtl' | 'ltr'
                  }}
                >
                  {t('finance.clearFilter')}
                </button>
              )}

              <button
                onClick={handleFilter}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: 'var(--color-text-secondary)' }}
                title={t('finance.filter')}
                aria-label={t('finance.filter')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </Card>

        {/* Finance Sections */}
        <div className="space-y-0">
          {searchResults.length > 0 ? (
            <FinanceSection
              title={t('finance.searchResults')}
              items={searchResults}
              type="search"
              onLoadMore={() => {}}
              hasMore={false}
              loading={loading}
              onItemEdit={handleItemEdit}
              onItemDelete={handleItemDelete}
              onItemView={handleItemView}
              onFetchData={() => {}}
              t={t}
              isRTL={isRTL}
              dir={dir}
            />
          ) : (
            <>
              <FinanceSection
                title={t('finance.revenues')}
                items={revenues}
                type={t('finance.revenueType')}
                onLoadMore={handleLoadMoreRevenues}
                hasMore={revenues.length % 10 === 0 && revenues.length > 0}
                loading={loading}
                onItemEdit={handleItemEdit}
                onItemDelete={handleItemDelete}
                onItemView={handleItemView}
                onFetchData={() => fetchRevenues(projectId)}
                t={t}
                isRTL={isRTL}
                dir={dir}
              />

              <FinanceSection
                title={t('finance.expenses')}
                items={expenses}
                type={t('finance.expenseType')}
                onLoadMore={handleLoadMoreExpenses}
                hasMore={expenses.length % 10 === 0 && expenses.length > 0}
                loading={loading}
                onItemEdit={handleItemEdit}
                onItemDelete={handleItemDelete}
                onItemView={handleItemView}
                onFetchData={() => fetchExpenses(projectId)}
                t={t}
                isRTL={isRTL}
                dir={dir}
              />

              <FinanceSection
                title={t('finance.returns')}
                items={returns}
                type={t('finance.returnType')}
                onLoadMore={handleLoadMoreReturns}
                hasMore={returns.length % 10 === 0 && returns.length > 0}
                loading={loading}
                onItemEdit={handleItemEdit}
                onItemDelete={handleItemDelete}
                onItemView={handleItemView}
                onFetchData={() => fetchReturns(projectId)}
                t={t}
                isRTL={isRTL}
                dir={dir}
              />
            </>
          )}
        </div>

      {/* Create/Edit Finance Modal */}
      <CreateFinanceModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
        projectId={projectId}
        editingItem={editingItem}
        onSuccess={() => {
          // Refresh data after successful operation
          refresh();
          fetchTotals(projectId);
          fetchRevenues(projectId);
          fetchExpenses(projectId);
          fetchReturns(projectId);
        }}
      />

      {/* View Finance Modal */}
      <ViewFinanceModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onEdit={handleItemEdit}
        onDelete={handleItemDelete}
        loading={loading}
        projectData={{
          name: project?.Nameproject || totals?.Nameproject || 'اسم المشروع',
          branchName: (project as any)?.NameSub || (project as any)?.NameBranch || 'اسم الفرع',
          branchEmail: (project as any)?.Email || user?.data?.Email || '',
          branchPhone: (project as any)?.PhoneNumber || user?.data?.PhoneNumber || ''
        }}
      />

      {/* TODO: Add Filter and Share modals */}
      </ContentSection>
    </ResponsiveLayout>
  );
}