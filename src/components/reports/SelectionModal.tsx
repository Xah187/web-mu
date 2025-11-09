'use client';

import React, { useRef } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { verticalScale } from '@/utils/responsiveSize';
import { Branch, Project } from '@/hooks/useReports';
import { useTranslation } from '@/hooks/useTranslation';

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: (Branch | Project)[];
  onSelect: (item: any) => void;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function SelectionModal({
  isOpen,
  onClose,
  title,
  items,
  onSelect,
  loading = false,
  onLoadMore,
  hasMore = false
}: SelectionModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t, isRTL } = useTranslation();

  if (!isOpen) return null;

  // Handle scroll for infinite loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasMore || loading || !onLoadMore) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const threshold = 100; // Load more when 100px from bottom

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      onLoadMore();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleItemSelect = (item: any) => {
    onSelect(item);
    onClose();
  };

  const getItemName = (item: Branch | Project) => {
    if ('NameSub' in item) {
      return (item as Branch).NameSub || '';
    }
    if ('Nameproject' in item) {
      return (item as Project).Nameproject || '';
    }
    return '';
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
        style={{
          backgroundColor: colors.HOME
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 
            className="text-xl font-semibold text-center flex-1"
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: verticalScale(18),
              color: colors.BLACK
            }}
            dir="rtl"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span
                className="mr-3 text-gray-600"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicRegular,
                  fontSize: verticalScale(14)
                }}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {t('reports.loading')}
              </span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <p
                className="text-gray-500 text-center"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicRegular,
                  fontSize: verticalScale(14)
                }}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {t('reports.noItemsAvailable')}
              </p>
            </div>
          ) : (
            <div className="py-2 px-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className="w-full text-right px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                    style={{
                      borderColor: colors.BORDER
                    }}
                  >
                    <span
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        fontSize: verticalScale(16),
                        color: colors.BLACK
                      }}
                      dir="rtl"
                    >
                      {getItemName(item)}
                    </span>
                  </button>
                ))}
              </div>

              {/* Loading indicator at bottom */}
              {loading && items.length > 0 && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span
                    className="mr-3 text-gray-600"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      fontSize: verticalScale(14)
                    }}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {t('reports.loadingMore')}
                  </span>
                </div>
              )}

              {/* End of list indicator */}
              {!hasMore && items.length > 0 && (
                <div className="flex items-center justify-center py-4">
                  <span
                    className="text-gray-500"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      fontSize: verticalScale(12)
                    }}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {t('reports.allItemsLoaded')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
