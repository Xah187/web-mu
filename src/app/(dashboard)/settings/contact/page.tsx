'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { Tostget } from '@/components/ui/Toast';

// This page represents the "تواصل معنا" section from mobile app
// It provides contact information and ways to reach support

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

export default function ContactPage() {
  const router = useRouter();
  const { size } = useAppSelector(state => state.user);
  
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  // Contact information matching mobile app
  const contactMethods = [
    {
      id: 'whatsapp',
      title: 'واتساب',
      description: 'تواصل معنا عبر الواتساب',
      value: '0571506060',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516" fill="#25D366"/>
        </svg>
      ),
      action: () => {
        window.open('https://wa.me/966571506060', '_blank');
        Tostget('سيتم فتح الواتساب');
      }
    },
    {
      id: 'phone',
      title: 'الهاتف',
      description: 'اتصل بنا مباشرة',
      value: '0571506060',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.BLUE} strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
      action: () => {
        window.open('tel:0571506060', '_self');
        Tostget('سيتم الاتصال');
      }
    },
    {
      id: 'email',
      title: 'البريد الإلكتروني',
      description: 'راسلنا عبر البريد الإلكتروني',
      value: 'info@mushrf.com',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.BLUE} strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      action: () => {
        window.open('mailto:info@mushrf.com', '_self');
        Tostget('سيتم فتح البريد الإلكتروني');
      }
    },
    {
      id: 'website',
      title: 'الموقع الإلكتروني',
      description: 'زيارة موقعنا الإلكتروني',
      value: 'mushrf.com',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.BLUE} strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
      action: () => {
        window.open('https://mushrf.com/', '_blank');
        Tostget('سيتم فتح الموقع الإلكتروني');
      }
    }
  ];



  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title="تواصل معنا"
          backButton={
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="رجوع">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
          }
        />
      }
    >
      <ContentSection className="p-4">

      {/* Content */}
      <div className="p-4">
        {/* Contact Methods */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 
            className="font-semibold text-gray-900 mb-4"
            style={{ 
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: scale(16 + size) 
            }}
          >
            طرق التواصل
          </h2>
          
          <div className="space-y-4">
            {contactMethods.map((method) => (
              <div 
                key={method.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedContact === method.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedContact(method.id);
                  method.action();
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <h3 
                      className="font-medium text-gray-900 mb-1"
                      style={{ 
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        fontSize: scale(14 + size) 
                      }}
                    >
                      {method.title}
                    </h3>
                    <p 
                      className="text-gray-600 text-sm mb-1"
                      style={{ 
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: scale(12 + size) 
                      }}
                    >
                      {method.description}
                    </p>
                    <p 
                      className="text-blue-600 text-sm font-medium"
                      style={{ 
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        fontSize: scale(12 + size) 
                      }}
                    >
                      {method.value}
                    </p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>





        {/* Info Section */}
        <div className="bg-blue-50 rounded-2xl p-4 mt-6">
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
                نحن هنا لمساعدتك
              </h4>
              <p 
                className="text-blue-800 text-sm leading-relaxed"
                style={{ 
                  fontFamily: fonts.IBMPlexSansArabicRegular,
                  fontSize: scale(12 + size) 
                }}
              >
                فريق الدعم الفني متاح لمساعدتك في أي استفسار أو مشكلة تواجهها. لا تتردد في التواصل معنا.
              </p>
            </div>
          </div>
        </div>
      </div>
      </ContentSection>
    </ResponsiveLayout>
  );
}
