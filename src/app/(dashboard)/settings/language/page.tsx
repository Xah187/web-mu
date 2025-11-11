'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { setLanguage } from '@/store/slices/userSlice';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useTranslation } from '@/hooks/useTranslation';

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

export default function LanguageSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { size, language } = useAppSelector(state => state.user);
  const { t } = useTranslation();

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
    <ResponsiveLayout
      header={
        <PageHeader
          title={t('settings.language')}
          backButton={
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label={t('common.back')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
          }
        />
      }
    >
      <ContentSection>
      {/* Content */}
      <div style={{ padding: '24px 20px' }}>
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
          style={{
            padding: '28px 24px',
            marginBottom: '24px'
          }}
        >
          <h2
            className="font-semibold text-gray-900"
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: scale(17 + size),
              marginBottom: '20px'
            }}
          >
            {t('settings.selectLanguage')}
          </h2>

          <div>
            {languages.map((lang, index) => (
              <div
                key={lang.value}
                className={`rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedLanguage === lang.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                style={{
                  padding: '16px 20px',
                  marginBottom: index < languages.length - 1 ? '14px' : '0'
                }}
                onClick={() => setSelectedLanguage(lang.value as 'ar' | 'en')}
              >
                <div
                  className="flex items-center"
                  style={{ gap: '14px' }}
                >
                  <div
                    className={`rounded-full border-2 flex items-center justify-center ${
                      selectedLanguage === lang.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                    style={{
                      width: '22px',
                      height: '22px',
                      flexShrink: 0
                    }}
                  >
                    {selectedLanguage === lang.value && (
                      <div
                        className="bg-white rounded-full"
                        style={{
                          width: '10px',
                          height: '10px'
                        }}
                      />
                    )}
                  </div>
                  <span
                    className="text-gray-900"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      fontSize: scale(15 + size)
                    }}
                  >
                    {lang.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex"
          style={{ gap: '14px' }}
        >
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl font-cairo font-medium transition-colors"
            style={{
              padding: '14px 20px',
              fontSize: scale(15 + size),
              backgroundColor: colors.BLUE,
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e40af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.BLUE;
            }}
          >
            {t('common.save')}
          </button>
          <button
            onClick={() => router.back()}
            className="flex-1 bg-gray-100 text-gray-700 rounded-xl font-cairo font-medium hover:bg-gray-200 transition-colors"
            style={{
              padding: '14px 20px',
              fontSize: scale(15 + size)
            }}
          >
            {t('common.cancel')}
          </button>
        </div>
        </div>

      </ContentSection>
    </ResponsiveLayout>
  );
}
