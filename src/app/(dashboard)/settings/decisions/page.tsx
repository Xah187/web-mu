'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { Tostget } from '@/components/ui/Toast';

// This page represents the "قرارات" section from mobile app
// It's a separate chat interface for decisions at company level

export default function DecisionsPage() {
  const router = useRouter();
  const { user, size } = useAppSelector(state => state.user);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleNavigateToDecisionsChat = () => {
    // Navigate to chat interface for decisions
    // This matches the mobile app behavior exactly
    const chatParams = {
      ProjectID: user?.data?.CommercialRegistrationNumber,
      typess: 'قرارات',
      nameRoom: 'قرارات',
      nameProject: ''
    };
    
    // Navigate to actual chat page (matches mobile params)
    router.push(`/chat?ProjectID=${chatParams.ProjectID}&typess=${encodeURIComponent(chatParams.typess)}&nameRoom=${encodeURIComponent(chatParams.nameRoom)}&nameProject=${encodeURIComponent(chatParams.nameProject)}`);
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
            قرارات
          </h1>
          
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Decisions Chat Card */}
            <div 
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={handleNavigateToDecisionsChat}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-4" stroke="#8B5CF6" strokeWidth="2" />
                      <polyline points="9,11 12,14 15,11" stroke="#8B5CF6" strokeWidth="2" />
                      <line x1="12" y1="2" x2="12" y2="14" stroke="#8B5CF6" strokeWidth="2" />
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
                      دردشة القرارات
                    </h3>
                    <p 
                      className="text-gray-600 text-sm"
                      style={{ 
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: scale(12 + size) 
                      }}
                    >
                      دردشة القرارات على مستوى الشركة
                    </p>
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
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
                مميزات دردشة القرارات
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12" />
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
                      اتخاذ القرارات الجماعية
                    </h4>
                    <p 
                      className="text-gray-600 text-sm"
                      style={{ 
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: scale(12 + size) 
                      }}
                    >
                      مناقشة واتخاذ القرارات المهمة مع فريق العمل
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
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
                      مشاركة جميع أعضاء الشركة
                    </h4>
                    <p 
                      className="text-gray-600 text-sm"
                      style={{ 
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: scale(12 + size) 
                      }}
                    >
                      جميع موظفي الشركة يمكنهم المشاركة في النقاش
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10,9 9,9 8,9" />
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
                      توثيق القرارات
                    </h4>
                    <p 
                      className="text-gray-600 text-sm"
                      style={{ 
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: scale(12 + size) 
                      }}
                    >
                      حفظ وتوثيق جميع القرارات المتخذة للرجوع إليها لاحقاً
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-purple-50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <div>
                  <h4 
                    className="font-medium text-purple-900 mb-1"
                    style={{ 
                      fontFamily: fonts.IBMPlexSansArabicSemiBold,
                      fontSize: scale(14 + size) 
                    }}
                  >
                    دردشة القرارات
                  </h4>
                  <p 
                    className="text-purple-800 text-sm leading-relaxed"
                    style={{ 
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      fontSize: scale(12 + size) 
                    }}
                  >
                    هذا القسم مخصص لمناقشة واتخاذ القرارات المهمة على مستوى الشركة. يمكن لجميع الموظفين المشاركة في النقاش وإبداء آرائهم.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
