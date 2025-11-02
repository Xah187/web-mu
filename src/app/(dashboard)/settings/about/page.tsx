'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import ArrowIcon from '@/components/icons/ArrowIcon';
import Image from 'next/image';
import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';


export default function AboutPage() {
  const router = useRouter();
  const { size } = useAppSelector(state => state.user);
  const { t, isRTL, dir } = useTranslation();
  const [expandedFeature, setExpandedFeature] = useState(0);

  const features = [
    {
      id: 1,
      name: t('settings.about.feature1Name'),
      description: t('settings.about.feature1Desc')
    },
    {
      id: 2,
      name: t('settings.about.feature2Name'),
      description: t('settings.about.feature2Desc')
    },
    {
      id: 3,
      name: t('settings.about.feature3Name'),
      description: t('settings.about.feature3Desc')
    },
    {
      id: 4,
      name: t('settings.about.feature4Name'),
      description: t('settings.about.feature4Desc')
    },
    {
      id: 5,
      name: t('settings.about.feature5Name'),
      description: t('settings.about.feature5Desc')
    },
    {
      id: 6,
      name: t('settings.about.feature6Name'),
      description: t('settings.about.feature6Desc')
    },
    {
      id: 7,
      name: t('settings.about.feature7Name'),
      description: t('settings.about.feature7Desc')
    },
    {
      id: 8,
      name: t('settings.about.feature8Name'),
      description: t('settings.about.feature8Desc')
    },
    {
      id: 9,
      name: t('settings.about.feature9Name'),
      description: t('settings.about.feature9Desc')
    }
  ];

  const textStyle = {
    fontSize: verticalScale(14 + size),
    fontFamily: fonts.IBMPlexSansArabicSemiBold,
    color: 'var(--color-text-primary)',
  };

  const subHeaderStyle = {
    fontSize: verticalScale(17 + size),
    fontFamily: fonts.IBMPlexSansArabicSemiBold,
    color: 'var(--color-text-primary)',
    marginBottom: 8,
  };

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title={t('settings.about.title')}
          backButton={
            <button
              onClick={() => router.push('/home')}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-text-primary)',
                transform: isRTL ? 'none' : 'rotate(180deg)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-hover-background)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label={isRTL ? 'رجوع' : 'Back'}
            >
              <ArrowIcon size={24} color="var(--color-text-primary)" />
            </button>
          }
        />
      }
    >
      <ContentSection>

      {/* Content */}
      <div className="flex-1 p-5" dir={dir} style={{ backgroundColor: 'var(--color-background-primary)' }}>
        {/* Introduction Section */}
        <div className="p-5 rounded-3xl mb-5" style={{ backgroundColor: 'var(--color-card-background)' }}>
          <p style={textStyle}>
            {t('settings.about.introduction')}
          </p>
        </div>

        {/* Why Moshrif Section */}
        <p style={subHeaderStyle}>{t('settings.about.whyMoshrif')}</p>
        <div className="p-5 rounded-3xl mb-5" style={{ backgroundColor: 'var(--color-card-background)' }}>
          <p style={textStyle}>
            {t('settings.about.whyMoshrifDesc')}
          </p>
        </div>

        {/* Features Section */}
        <p style={subHeaderStyle}>{t('settings.about.features')}</p>
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setExpandedFeature(expandedFeature === feature.id ? 0 : feature.id)}
            className="w-full p-5 rounded-3xl mb-5 transition-colors"
            style={{
              backgroundColor: 'var(--color-card-background)',
              textAlign: isRTL ? 'right' : 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-hover-background)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-card-background)';
            }}
          >
            <p style={textStyle}>{feature.name}</p>
            {expandedFeature === feature.id && (
              <p style={textStyle} className="mt-2">
                {feature.description}
              </p>
            )}
          </button>
        ))}

        {/* How it Works Section */}
        <p style={subHeaderStyle}>{t('settings.about.howItWorks')}</p>
        <div className="p-5 rounded-3xl mb-5" style={{ backgroundColor: 'var(--color-card-background)' }}>
          <div className="space-y-3">
            <div>
              <p style={{ ...textStyle, color: 'var(--color-primary)' }}>{t('settings.about.step1Title')}</p>
              <p style={textStyle}>{t('settings.about.step1Desc')}</p>
            </div>

            <div>
              <p style={{ ...textStyle, color: 'var(--color-primary)' }}>{t('settings.about.step2Title')}</p>
              <p style={textStyle}>{t('settings.about.step2Desc')}</p>
            </div>

            <div>
              <p style={{ ...textStyle, color: 'var(--color-primary)' }}>{t('settings.about.step3Title')}</p>
              <p style={textStyle}>{t('settings.about.step3Desc')}</p>
            </div>

            <div>
              <p style={{ ...textStyle, color: 'var(--color-primary)' }}>{t('settings.about.step4Title')}</p>
              <p style={textStyle}>{t('settings.about.step4Desc')}</p>
            </div>

            <div>
              <p style={{ ...textStyle, color: 'var(--color-primary)' }}>{t('settings.about.step5Title')}</p>
              <p style={textStyle}>{t('settings.about.step5Desc')}</p>
            </div>
          </div>
        </div>

        {/* Footer with Logo and Version */}
        <div
          className="items-center justify-center mb-20"
          style={{
            alignItems: 'center',
            margin: verticalScale(10),
            marginBottom: verticalScale(100)
          }}
        >
          <div className="flex justify-center mb-4">
            <Image
              src="/images/figma/moshrif.png"
              alt="Moshrif Logo"
              width={70}
              height={70}
              className="object-contain"
            />
          </div>

          <p
            className="text-center"
            style={{
              color: 'var(--color-primary)',
              fontFamily: fonts.IBMPlexSansArabicRegular,
              fontSize: verticalScale(14 + size),
            }}
          >
            {t('settings.about.version')}
          </p>
        </div>
      </div>
      </ContentSection>

    </ResponsiveLayout>
  );
}
