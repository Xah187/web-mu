'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { setLanguage } from '@/store/slices/userSlice';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';

export default function LanguageSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { size, language } = useAppSelector(state => state.user);

  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>((language as 'ar' | 'en') || 'ar');

  useEffect(() => {
    setSelectedLanguage(language || 'ar');
  }, [language]);

  const languages = [
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'English' },
  ];

  const handleSave = () => {
    dispatch(setLanguage(selectedLanguage as 'ar' | 'en'));
    localStorage.setItem('appLanguage', selectedLanguage);
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="bg-white shadow-sm border-b border-gray-200"
        style={{
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
        }}
      >
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>
          
          <h1 
            className="text-lg font-bold text-gray-900"
            style={{ 
              fontFamily: fonts.IBMPlexSansArabicBold,
              fontSize: verticalScale(18 + size)
            }}
          >
            اللغة
          </h1>
          
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 
            className="font-semibold text-gray-900 mb-4"
            style={{ 
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: scale(16 + size) 
            }}
          >
            اختر اللغة
          </h2>

          <div className="space-y-3">
            {languages.map((lang) => (
              <div 
                key={lang.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedLanguage === lang.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setSelectedLanguage(lang.value as 'ar' | 'en')}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedLanguage === lang.value 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedLanguage === lang.value && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span 
                    className="text-gray-900"
                    style={{ 
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      fontSize: scale(14 + size) 
                    }}
                  >
                    {lang.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-blue text-white rounded-lg font-cairo font-medium hover:bg-blue-600 transition-colors"
          >
            حفظ
          </button>
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-cairo font-medium hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
