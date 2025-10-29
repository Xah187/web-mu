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

// مطابق للتطبيق المحمول - البحث بالاسم فقط
export default function FilterModal({ currentFilter, onApply, onClose }: FilterModalProps) {
  const { size } = useAppSelector((state: any) => state.user);
  const [searchText, setSearchText] = useState(currentFilter === 'all' ? '' : currentFilter);

  const handleApply = () => {
    onApply(searchText.trim() || 'all');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl"
        style={{
          padding: `${scale(24)}px`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-bold text-gray-900"
            style={{
              fontFamily: fonts.IBMPlexSansArabicBold,
              fontSize: verticalScale(18 + size)
            }}
          >
            البحث
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search Input - مطابق للتطبيق المحمول */}
        <div className="mb-6">
          <div
            className="relative bg-gray-50 rounded-xl"
            style={{
              borderRadius: `${scale(12)}px`,
              border: `1px solid ${colors.HOME}`
            }}
          >
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="ادخل الاسم هنا"
              className="w-full bg-transparent outline-none text-right"
              style={{
                fontFamily: fonts.IBMPlexSansArabicMedium,
                fontSize: verticalScale(13 + size),
                color: colors.BLACK,
                padding: `${scale(15)}px`,
                borderRadius: `${scale(12)}px`,
                border: 'none'
              }}
            />
            <label
              className="absolute top-0 right-0 text-xs"
              style={{
                fontFamily: fonts.IBMPlexSansArabicMedium,
                fontSize: verticalScale(10 + size),
                color: colors.BORDER,
                padding: `${scale(3)}px ${scale(14)}px`,
                transform: 'translateY(-50%)',
                backgroundColor: 'white',
                borderRadius: `${scale(5)}px`
              }}
            >
              البحث
            </label>
          </div>
        </div>

        {/* Button - مطابق للتطبيق المحمول */}
        <div style={{ marginTop: `${scale(40)}px` }}>
          <ButtonLong text="تـم" Press={handleApply} />
        </div>
      </div>
    </div>
  );
}
