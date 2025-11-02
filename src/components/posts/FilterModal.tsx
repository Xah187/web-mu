'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { FilterData } from '@/hooks/usePosts';
import Input from '@/components/design/Input';
import ButtonLong from '@/components/design/ButtonLong';
import Combobox from '@/components/design/Combobox';
import { useTranslation } from '@/hooks/useTranslation';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filterData: Partial<FilterData>) => void;
  onClear: () => void;
  branches: any[];
  currentFilter: FilterData;
  loading?: boolean;
  onFetchBranches: () => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  onClear,
  branches,
  currentFilter,
  loading = false,
  onFetchBranches
}: FilterModalProps) {
  const { t, isRTL } = useTranslation();
  const [filterData, setFilterData] = useState<Partial<FilterData>>({});
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Filter types exactly like mobile app
  const filterTypes = [
    { id: '4', name: t('publications.filterModal.byDate') },
    { id: '1', name: t('publications.filterModal.byProjectAndDate') },
    { id: '2', name: t('publications.filterModal.byUserAndDate') },
    { id: '3', name: t('publications.filterModal.byProjectUserDate') },
    { id: '5', name: t('publications.filterModal.byBranch') }
  ];

  // Branch options
  const branchOptions = branches.filter(branch => branch && branch.NameSub).map(branch => ({
    id: branch.id.toString(),
    name: branch.NameSub
  }));



  useEffect(() => {
    if (isOpen) {
      // Initialize with current filter or default
      const currentType = currentFilter.type || t('publications.filterModal.byDate');
      setFilterData({
        type: currentType,
        nameProject: currentFilter.nameProject || '',
        userName: currentFilter.userName || '',
        branch: currentFilter.branch || ''
      });
      
      // Format dates with defaults
      const formatDate = (date: Date | string | undefined, defaultDate?: Date) => {
        if (!date && defaultDate) {
          return defaultDate.toISOString().split('T')[0];
        }
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      // Use wide date range to capture existing data (since posts might be from past dates)
      const today = new Date();
      const startDate = new Date('2024-01-01'); // Wide range to capture all existing posts

      setDateStart(formatDate(currentFilter.DateStart, startDate));
      setDateEnd(formatDate(currentFilter.DateEnd, today));
    }
  }, [isOpen, currentFilter]);

  const handleTypeChange = (typeName: string) => {
    setFilterData(prev => ({ ...prev, type: typeName }));

    // If "بحسب الفرع" is selected, fetch branches
    if (typeName === t('publications.filterModal.byBranch')) {
      onFetchBranches();
    }
  };

  const handleApply = () => {
    const finalFilter: Partial<FilterData> = {
      ...filterData,
      DateStart: dateStart ? new Date(dateStart) : new Date(),
      DateEnd: dateEnd ? new Date(dateEnd) : new Date()
    };

    onApply(finalFilter);
    onClose();
  };

  const handleClear = () => {
    setFilterData({ type: t('publications.filterModal.byDate') });
    setDateStart('');
    setDateEnd('');
    onClear();
  };

  if (!isOpen) return null;

  const selectedType = filterData.type || t('publications.filterModal.byDate');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="rounded-3xl w-full max-w-md max-h-[95vh] overflow-hidden shadow-2xl transform transition-all duration-300 ease-out"
        style={{
          backgroundColor: 'var(--theme-card-background)',
          border: '1px solid var(--theme-border)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between py-6"
          style={{
            borderBottom: '1px solid var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
            paddingLeft: scale(24),
            paddingRight: scale(24)
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--theme-primary-alpha)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 7H21M6 12H18M9 17H15"
                  stroke="var(--theme-primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2
              className="font-bold"
              style={{
                fontSize: verticalScale(20),
                color: 'var(--theme-text-primary)',
                fontFamily: fonts.IBMPlexSansArabicBold
              }}
            >
              {t('publications.filterModal.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'var(--theme-surface-secondary)',
              color: 'var(--theme-text-secondary)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-8 overflow-y-auto max-h-[calc(95vh-200px)]" style={{ paddingLeft: scale(24), paddingRight: scale(24) }}>
          {/* Filter Type Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-primary-alpha)' }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                />
              </div>
              <label
                className="font-semibold"
                style={{
                  fontSize: verticalScale(16),
                  color: 'var(--theme-text-primary)',
                  fontFamily: fonts.IBMPlexSansArabicSemiBold
                }}
              >
                {t('publications.filterModal.filterType')}
              </label>
            </div>
            <div className="space-y-5">
              {filterTypes.map((type, index) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.name)}
                  className={`
                    w-full rounded-2xl text-right transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg
                    ${selectedType === type.name
                      ? 'shadow-lg ring-2'
                      : 'hover:shadow-md'
                    }
                  `}
                  style={{
                    fontSize: verticalScale(14),
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    backgroundColor: selectedType === type.name
                      ? 'var(--theme-primary-alpha)'
                      : 'var(--theme-surface-secondary)',
                    color: selectedType === type.name
                      ? 'var(--theme-primary)'
                      : 'var(--theme-text-primary)',
                    border: selectedType === type.name
                      ? '2px solid var(--theme-primary)'
                      : '1px solid var(--theme-border)',
                    padding: `${verticalScale(18)}px ${scale(24)}px`,
                    marginBottom: scale(6)
                  }}
                >
                  <div
                    className="flex items-center justify-between"
                    style={{
                      minHeight: verticalScale(28),
                      gap: scale(16)
                    }}
                  >
                    <span
                      className="flex-1"
                      style={{
                        paddingRight: scale(4),
                        lineHeight: 1.4
                      }}
                    >
                      {type.name}
                    </span>
                    <div
                      className="flex items-center justify-center"
                      style={{
                        paddingLeft: scale(4),
                        minWidth: scale(32)
                      }}
                    >
                      {selectedType === type.name && (
                        <div
                          className="rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: 'var(--theme-primary)',
                            width: scale(24),
                            height: scale(24)
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                      {loading && type.name === t('publications.filterModal.byBranch') && selectedType === type.name && (
                        <div
                          className="border-2 border-current border-t-transparent rounded-full animate-spin opacity-70"
                          style={{
                            width: scale(24),
                            height: scale(24)
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Project Name Input */}
          {selectedType.includes(t('publications.filterModal.project')) && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--theme-success-alpha, rgba(16, 185, 129, 0.1))' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7Z" stroke="var(--theme-success, #10b981)" strokeWidth="2"/>
                    <path d="M8 12L11 15L16 9" stroke="var(--theme-success, #10b981)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <label
                  className="font-semibold"
                  style={{
                    fontSize: verticalScale(15),
                    color: 'var(--theme-text-primary)',
                    fontFamily: fonts.IBMPlexSansArabicSemiBold
                  }}
                >
                  {t('publications.filterModal.projectName')}
                </label>
              </div>
              <div style={{ paddingRight: scale(36), paddingTop: scale(8) }}>
                <Input
                  name="nameProject"
                  placeholder={t('publications.filterModal.enterProjectName')}
                  value={filterData.nameProject || ''}
                  onChange={(text) => setFilterData(prev => ({ ...prev, nameProject: text }))}
                />
              </div>
            </div>
          )}

          {/* User Name Input */}
          {selectedType.includes(t('publications.filterModal.user')) && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--theme-info-alpha, rgba(59, 130, 246, 0.1))' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="var(--theme-info, #3b82f6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="var(--theme-info, #3b82f6)" strokeWidth="2"/>
                  </svg>
                </div>
                <label
                  className="font-semibold"
                  style={{
                    fontSize: verticalScale(15),
                    color: 'var(--theme-text-primary)',
                    fontFamily: fonts.IBMPlexSansArabicSemiBold
                  }}
                >
                  {t('publications.filterModal.userName')}
                </label>
              </div>
              <div style={{ paddingRight: scale(36), paddingTop: scale(8) }}>
                <Input
                  name="userName"
                  placeholder={t('publications.filterModal.enterUserName')}
                  value={filterData.userName || ''}
                  onChange={(text) => setFilterData(prev => ({ ...prev, userName: text }))}
                />
              </div>
            </div>
          )}

          {/* Branch Selection */}
          {selectedType === t('publications.filterModal.byBranch') && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--theme-warning-alpha, rgba(245, 158, 11, 0.1))' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2"/>
                    <circle cx="12" cy="10" r="3" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2"/>
                  </svg>
                </div>
                <label
                  className="font-semibold"
                  style={{
                    fontSize: verticalScale(15),
                    color: 'var(--theme-text-primary)',
                    fontFamily: fonts.IBMPlexSansArabicSemiBold
                  }}
                >
                  {t('publications.filterModal.branch')}
                </label>
              </div>
              <div style={{ paddingRight: scale(36), paddingTop: scale(8) }}>
                {loading && branchOptions.length === 0 ? (
                  <div
                    className="flex items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: 'var(--theme-surface-secondary)',
                      padding: `${verticalScale(24)}px ${scale(16)}px`
                    }}
                  >
                    <div
                      className="border-2 border-t-transparent rounded-full animate-spin"
                      style={{
                        borderColor: 'var(--theme-primary)',
                        width: scale(24),
                        height: scale(24)
                      }}
                    ></div>
                    <span
                      style={{
                        color: 'var(--theme-text-secondary)',
                        fontSize: verticalScale(13),
                        marginRight: scale(12)
                      }}
                    >
                      {t('publications.filterModal.loadingBranches')}
                    </span>
                  </div>
                ) : branchOptions.length > 0 ? (
                  <Combobox
                    options={branchOptions}
                    value={filterData.branch || ''}
                    onChange={(value) => setFilterData(prev => ({ ...prev, branch: value }))}
                    placeholder={t('publications.filterModal.selectBranch')}
                  />
                ) : (
                  <div
                    className="text-center rounded-2xl"
                    style={{
                      backgroundColor: 'var(--theme-surface-secondary)',
                      color: 'var(--theme-text-secondary)',
                      fontSize: verticalScale(13),
                      padding: `${verticalScale(20)}px ${scale(16)}px`
                    }}
                  >
                    لا توجد فروع متاحة
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Date Range - Always visible */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-error-alpha, rgba(239, 68, 68, 0.1))' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="var(--theme-error, #ef4444)" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="var(--theme-error, #ef4444)" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="var(--theme-error, #ef4444)" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="var(--theme-error, #ef4444)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <label
                className="font-semibold"
                style={{
                  fontSize: verticalScale(15),
                  color: 'var(--theme-text-primary)',
                  fontFamily: fonts.IBMPlexSansArabicSemiBold
                }}
              >
                {t('publications.filterModal.dateRange')}
              </label>
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              style={{
                paddingRight: scale(36),
                paddingTop: scale(8),
                paddingBottom: scale(12),
                margin: `0 ${scale(8)}px`
              }}
            >
              <div className="space-y-2">
                <label
                  className="block font-medium"
                  style={{
                    fontSize: verticalScale(12),
                    color: 'var(--theme-text-secondary)',
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    paddingRight: scale(4)
                  }}
                >
                  {t('publications.filterModal.startDate')}
                </label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full rounded-xl border-2 transition-all duration-200 focus:scale-[1.02] focus:shadow-lg"
                  style={{
                    backgroundColor: 'var(--theme-input-background)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                    fontSize: verticalScale(13),
                    fontFamily: fonts.IBMPlexSansArabicRegular,
                    padding: `${verticalScale(10)}px ${scale(12)}px`,
                    maxWidth: '90%'
                  }}
                />
              </div>
              <div className="space-y-2">
                <label
                  className="block font-medium"
                  style={{
                    fontSize: verticalScale(12),
                    color: 'var(--theme-text-secondary)',
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    paddingRight: scale(4)
                  }}
                >
                  {t('publications.filterModal.endDate')}
                </label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="w-full rounded-xl border-2 transition-all duration-200 focus:scale-[1.02] focus:shadow-lg"
                  style={{
                    backgroundColor: 'var(--theme-input-background)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                    fontSize: verticalScale(13),
                    fontFamily: fonts.IBMPlexSansArabicRegular,
                    padding: `${verticalScale(10)}px ${scale(12)}px`,
                    maxWidth: '90%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="py-6"
          style={{
            borderTop: '1px solid var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
            paddingLeft: scale(24),
            paddingRight: scale(24)
          }}
        >
          <div
            className="flex gap-4 justify-center items-center"
            style={{
              padding: `${scale(12)}px ${scale(16)}px`,
              margin: `${scale(8)}px 0`
            }}
          >
            <button
              onClick={handleApply}
              disabled={loading}
              className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
              style={{
                fontSize: verticalScale(14),
                color: '#ffffff',
                backgroundColor: 'var(--theme-primary)',
                fontFamily: fonts.IBMPlexSansArabicBold,
                border: '2px solid var(--theme-primary)',
                padding: `${verticalScale(12)}px ${scale(16)}px`,
                maxWidth: '45%',
                minHeight: verticalScale(48),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              {loading ? (
                <div
                  className="border-2 border-white border-t-transparent rounded-full animate-spin"
                  style={{ width: scale(16), height: scale(16) }}
                />
              ) : (
                `🔍 ${t('publications.filterModal.apply')}`
              )}
            </button>

            <button
              onClick={handleClear}
              className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
              style={{
                fontSize: verticalScale(14),
                color: 'var(--theme-text-primary)',
                backgroundColor: 'var(--theme-surface-secondary)',
                fontFamily: fonts.IBMPlexSansArabicBold,
                border: '2px solid var(--theme-border)',
                padding: `${verticalScale(12)}px ${scale(16)}px`,
                maxWidth: '45%',
                minHeight: verticalScale(48),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              🗑️ {t('publications.filterModal.clear')}
            </button>
          </div>

          {/* Decorative bottom element */}
          <div className="flex justify-center pt-2">
            <div
              className="w-12 h-1 rounded-full"
              style={{ backgroundColor: 'var(--theme-border)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}