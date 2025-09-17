'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  setTitle: (title: string) => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  title,
  setTitle
}: FilterModalProps) {
  const [searchTerm, setSearchTerm] = useState(title);
  const { size } = useAppSelector(state => state.user);

  useEffect(() => {
    setSearchTerm(title);
  }, [title]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTitle(searchTerm);
    onClose();
  };

  const handleClear = () => {
    setSearchTerm('');
    setTitle('');
    onClose();
  };

  const handleClose = () => {
    setSearchTerm(title); // Reset to original value
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1050,
        padding: `${scale(16)}px`
      }}
    >
      <div
        className="bg-white w-full shadow-2xl"
        style={{
          borderRadius: `${scale(16)}px`,
          padding: `${scale(24)}px`,
          maxWidth: `${scale(400)}px`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div
          className="text-center"
          style={{ marginBottom: `${scale(24)}px` }}
        >
          {/* أيقونة الفلترة */}
          <div
            className="mx-auto flex items-center justify-center rounded-full bg-purple-100"
            style={{
              width: `${scale(48)}px`,
              height: `${scale(48)}px`,
              marginBottom: `${scale(16)}px`
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-purple-600"
              style={{
                width: `${scale(24)}px`,
                height: `${scale(24)}px`
              }}
            >
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
            </svg>
          </div>

          <h3
            className="text-gray-900 font-ibm-arabic-bold"
            style={{
              fontSize: `${scale(18 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicBold,
              marginBottom: `${scale(8)}px`,
              lineHeight: 1.4
            }}
          >
            فلترة المجلدات
          </h3>

          <p
            className="text-gray-600 font-ibm-arabic-medium"
            style={{
              fontSize: `${scale(14 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicMedium,
              lineHeight: 1.5
            }}
          >
            ابحث عن مجلد معين في الأرشيف
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: `${scale(16)}px` }}
        >
          <div>
            <label
              htmlFor="searchTerm"
              className="block text-gray-700 font-ibm-arabic-semibold"
              style={{
                fontSize: `${scale(14 + size)}px`,
                fontFamily: fonts.IBMPlexSansArabicSemiBold,
                marginBottom: `${scale(8)}px`
              }}
            >
              اسم المجلد
            </label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن مجلد..."
              className="w-full border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-ibm-arabic-medium transition-all duration-200"
              style={{
                padding: `${scale(12)}px ${scale(16)}px`,
                borderColor: colors.BORDERCOLOR,
                borderRadius: `${scale(8)}px`,
                fontSize: `${scale(14 + size)}px`,
                fontFamily: fonts.IBMPlexSansArabicMedium
              }}
              autoFocus
            />
          </div>

          <div
            className="flex"
            style={{
              gap: `${scale(12)}px`,
              paddingTop: `${scale(16)}px`
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 text-gray-800 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              style={{
                padding: `${scale(12)}px ${scale(16)}px`,
                borderRadius: `${scale(8)}px`,
                fontSize: `${scale(14 + size)}px`,
                fontFamily: fonts.IBMPlexSansArabicSemiBold
              }}
            >
              إلغاء
            </button>

            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 bg-red-600 text-white rounded-lg font-ibm-arabic-semibold hover:bg-red-700 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                style={{
                  padding: `${scale(12)}px ${scale(16)}px`,
                  borderRadius: `${scale(8)}px`,
                  fontSize: `${scale(14 + size)}px`,
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  gap: `${scale(8)}px`
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    width: `${scale(16)}px`,
                    height: `${scale(16)}px`
                  }}
                >
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                مسح
              </button>
            )}

            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white rounded-lg font-ibm-arabic-semibold hover:bg-purple-700 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
              style={{
                padding: `${scale(12)}px ${scale(16)}px`,
                borderRadius: `${scale(8)}px`,
                fontSize: `${scale(14 + size)}px`,
                fontFamily: fonts.IBMPlexSansArabicSemiBold,
                gap: `${scale(8)}px`
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  width: `${scale(16)}px`,
                  height: `${scale(16)}px`
                }}
              >
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              بحث
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
