'use client';

import { useState } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import ButtonLong from '@/components/design/ButtonLong';

interface FilterModalProps {
  currentFilter: string;
  onApply: (filter: string) => void;
  onClose: () => void;
}

const filterOptions = [
  { id: 'all', name: 'الكل' },
  { id: 'Admin', name: 'مدير' },
  { id: 'مالية', name: 'مالية' },
  { id: 'مدير عام', name: 'مدير عام' },
  { id: 'موظف', name: 'موظف' },
  { id: 'مهندس موقع', name: 'مهندس موقع' },
  { id: 'مستشار جودة', name: 'مستشار جودة' },
  { id: 'مدير عقود', name: 'مدير عقود' },
  { id: 'مقاول', name: 'مقاول' },
  { id: 'مراقب جودة', name: 'مراقب جودة' },
  { id: 'مدخل بيانات', name: 'مدخل بيانات' },
];

export default function FilterModal({ currentFilter, onApply, onClose }: FilterModalProps) {
  const { size } = useAppSelector((state: any) => state.user);
  const [selectedFilter, setSelectedFilter] = useState(currentFilter);

  const handleApply = () => {
    onApply(selectedFilter);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="w-full max-w-lg max-h-[95vh] overflow-hidden shadow-2xl"
        style={{
          backgroundColor: 'var(--theme-card-background)',
          border: '1px solid var(--theme-border)',
          borderRadius: `${scale(20)}px`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            borderBottom: '1px solid var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
            paddingLeft: scale(24),
            paddingRight: scale(24),
            paddingTop: scale(20),
            paddingBottom: scale(20)
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 6H21L19 4H5L3 6Z" stroke="var(--theme-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 10V16" stroke="var(--theme-primary)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 10V16" stroke="var(--theme-primary)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 10V16" stroke="var(--theme-primary)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2
              className="font-bold"
              style={{
                fontFamily: fonts.IBMPlexSansArabicBold,
                fontSize: verticalScale(18 + size),
                color: 'var(--theme-text-primary)',
                lineHeight: 1.4
              }}
            >
              فلترة الأعضاء
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
            style={{
              padding: `${scale(10)}px`,
              backgroundColor: 'var(--theme-surface-secondary)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text-secondary)'
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Filter Options */}
        <div
          className="overflow-y-auto max-h-[calc(95vh-200px)]"
          style={{
            paddingLeft: scale(24),
            paddingRight: scale(24),
            paddingTop: scale(16),
            paddingBottom: scale(16)
          }}
        >
          <div className="space-y-5">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedFilter(option.id)}
                className="w-full rounded-2xl text-right transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                style={{
                  fontSize: verticalScale(14),
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  backgroundColor: selectedFilter === option.id
                    ? 'var(--theme-primary)'
                    : 'var(--theme-surface-secondary)',
                  color: selectedFilter === option.id
                    ? '#ffffff'
                    : 'var(--theme-text-primary)',
                  border: selectedFilter === option.id
                    ? '2px solid var(--theme-primary)'
                    : '1px solid var(--theme-border)',
                  padding: `${verticalScale(18)}px ${scale(24)}px`,
                  boxShadow: selectedFilter === option.id
                    ? '0 4px 12px rgba(99, 102, 241, 0.3)'
                    : '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center justify-between" style={{ minHeight: scale(24) }}>
                  <span
                    className="flex-1"
                    style={{
                      paddingRight: scale(8),
                      fontWeight: selectedFilter === option.id ? '600' : '500'
                    }}
                  >
                    {option.name}
                  </span>

                  <div className="flex items-center" style={{ paddingLeft: scale(8) }}>
                    {selectedFilter === option.id && (
                      <div
                        className="rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          width: scale(24),
                          height: scale(24)
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-4 justify-center items-center"
          style={{
            borderTop: '1px solid var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
            paddingLeft: scale(24),
            paddingRight: scale(24),
            paddingTop: scale(16),
            paddingBottom: scale(16),
            margin: `${scale(8)}px 0`
          }}
        >
          <button
            onClick={handleApply}
            className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
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
            تطبيق الفلتر
          </button>

          <button
            onClick={onClose}
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
            ❌ إلغاء
          </button>
        </div>

        {/* Decorative bottom element */}
        <div className="flex justify-center" style={{ paddingBottom: scale(8) }}>
          <div
            className="w-12 h-1 rounded-full"
            style={{ backgroundColor: 'var(--theme-border)' }}
          />
        </div>
      </div>
    </div>
  );
}
