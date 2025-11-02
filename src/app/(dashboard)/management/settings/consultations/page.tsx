'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useTranslation } from '@/hooks/useTranslation';


// This page represents the "استشارات" section from mobile app
// It's a separate chat interface for consultations at company level

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

export default function ConsultationsPage() {
  const router = useRouter();
  const { user, size } = useAppSelector(state => state.user);
  const { t, isRTL, dir } = useTranslation();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleNavigateToConsultationsChat = () => {
    // Navigate to chat interface for consultations
    // This matches the mobile app behavior exactly
    const chatParams = {
      ProjectID: user?.data?.CommercialRegistrationNumber,
      typess: 'استشارات',
      nameRoom: 'استشارات',
      nameProject: ''
    };

    // Navigate to actual chat page (matches mobile params)
    router.push(`/chat?ProjectID=${chatParams.ProjectID}&typess=${encodeURIComponent(chatParams.typess)}&nameRoom=${encodeURIComponent(chatParams.nameRoom)}&nameProject=${encodeURIComponent(chatParams.nameProject)}`);
  };



  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title={t('management.consultationsPage.title')}
          backButton={
            <button
              onClick={() => router.push('/management')}
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
              aria-label={isRTL ? 'رجوع' : 'Back'}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }}
              >
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
          }
        />
      }
    >
      <ContentSection className="p-4">

      {/* Content */}
      <div className="p-4" dir={dir}>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Consultations Chat Card */}
            <div
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={handleNavigateToConsultationsChat}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={colors.BLUE} strokeWidth="2" />
                      <path d="M8 10h8" stroke={colors.BLUE} strokeWidth="1.5" />
                      <path d="M8 14h6" stroke={colors.BLUE} strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div>
                    <h3
                      className="font-semibold text-gray-900 mb-1"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: scale(16 + size)
                      }}
                    >
                      {t('management.consultationsPage.title')}
                    </h3>
                    <p
                      className="text-gray-600 text-sm"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: scale(12 + size)
                      }}
                    >
                      {t('management.consultationsPage.description')}
                    </p>
                  </div>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-400"
                  style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }}
                >
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </div>
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2
                className="font-semibold text-gray-900 mb-4"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  fontSize: scale(16 + size)
                }}
              >
                {t('management.consultationsPage.featuresTitle')}
              </h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.BLUE} strokeWidth="2">
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <circle cx="12" cy="17" r="1" />
                    </svg>
                  </div>
                  <div>
                    <h4
                      className="font-medium text-gray-900 mb-1"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: scale(14 + size)
                      }}
                    >
                      {t('management.consultationsPage.feature1Title')}
                    </h4>
                    <p
                      className="text-gray-600 text-sm"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: scale(12 + size)
                      }}
                    >
                      {t('management.consultationsPage.feature1Description')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.BLUE} strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <h4
                      className="font-medium text-gray-900 mb-1"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: scale(14 + size)
                      }}
                    >
                      {t('management.consultationsPage.feature2Title')}
                    </h4>
                    <p
                      className="text-gray-600 text-sm"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: scale(12 + size)
                      }}
                    >
                      {t('management.consultationsPage.feature2Description')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.BLUE} strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <path d="M8 10h8" />
                      <path d="M8 14h6" />
                    </svg>
                  </div>
                  <div>
                    <h4
                      className="font-medium text-gray-900 mb-1"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: scale(14 + size)
                      }}
                    >
                      {t('management.consultationsPage.feature3Title')}
                    </h4>
                    <p
                      className="text-gray-600 text-sm"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: scale(12 + size)
                      }}
                    >
                      {t('management.consultationsPage.feature3Description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.BLUE} strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <div>
                  <h4
                    className="font-medium text-blue-900 mb-1"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicSemiBold,
                      fontSize: scale(14 + size)
                    }}
                  >
                    {t('management.consultationsPage.infoTitle')}
                  </h4>
                  <p
                    className="text-blue-800 text-sm leading-relaxed"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      fontSize: scale(12 + size)
                    }}
                  >
                    {t('management.consultationsPage.infoDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </ContentSection>

    </ResponsiveLayout>
  );
}
