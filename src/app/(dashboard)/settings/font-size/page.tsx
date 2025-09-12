'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { setFontSize } from '@/store/slices/userSlice';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { Tostget } from '@/components/ui/Toast';

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';



export default function FontSizePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { size } = useAppSelector(state => state.user);

  const [selectedSize, setSelectedSize] = useState(size);

  const fontSizeOptions = [
    { value: -2, label: 'صغير جداً', description: 'للنصوص الصغيرة' },
    { value: -1, label: 'صغير', description: 'أصغر من المعتاد' },
    { value: 0, label: 'عادي', description: 'الحجم الافتراضي' },
    { value: 1, label: 'كبير', description: 'أكبر من المعتاد' },
    { value: 2, label: 'كبير جداً', description: 'للنصوص الكبيرة' },
    { value: 3, label: 'ضخم', description: 'الحد الأقصى' }
  ];

  const handleSizeChange = (newSize: number) => {
    setSelectedSize(newSize);
  };

  const handleSave = () => {
    dispatch(setFontSize(selectedSize));
    Tostget('تم حفظ حجم الخط بنجاح');
    localStorage.setItem('fontSizePreference', selectedSize.toString());
  };

  const handleReset = () => {
    setSelectedSize(0);
    dispatch(setFontSize(0));
    localStorage.removeItem('fontSizePreference');
    Tostget('تم إعادة تعيين حجم الخط إلى الافتراضي');
  };

  const getSampleText = (sizeValue: number) => {
    return {
      fontSize: scale(16 + sizeValue),
      fontFamily: fonts.IBMPlexSansArabicRegular
    };
  };

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title="حجم الخط"
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
      <div className="p-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2
            className="font-semibold text-gray-900 mb-4"
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: scale(16 + size)
            }}
          >
            معاينة النص الحالي
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p
              className="text-gray-800 leading-relaxed"
              style={getSampleText(selectedSize)}
            >
              هذا نص تجريبي لمعاينة حجم الخط المختار. يمكنك رؤية كيف سيظهر النص في التطبيق بالحجم الجديد.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2
            className="font-semibold text-gray-900 mb-4"
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: scale(16 + size)
            }}
          >
            اختر حجم الخط
          </h2>

          <div className="space-y-3">
            {fontSizeOptions.map((option) => (
              <div
                key={option.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedSize === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => handleSizeChange(option.value)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedSize === option.value
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedSize === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <h3
                        className="font-medium text-gray-900"
                        style={{
                          fontFamily: fonts.IBMPlexSansArabicSemiBold,
                          fontSize: scale(14 + size)
                        }}
                      >
                        {option.label}
                      </h3>
                    </div>
                    <p
                      className="text-gray-600 text-sm mb-2"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: scale(12 + size)
                      }}
                    >
                      {option.description}
                    </p>
                    <p
                      className="text-gray-800"
                      style={getSampleText(option.value)}
                    >
                      نص تجريبي بهذا الحجم
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            style={{
              fontFamily: fonts.IBMPlexSansArabicMedium,
              fontSize: scale(14 + size)
            }}
          >
            إعادة تعيين
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            style={{
              fontFamily: fonts.IBMPlexSansArabicMedium,
              fontSize: scale(14 + size)
            }}
          >
            حفظ التغييرات
          </button>
        </div>

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
                ملاحظة مهمة
              </h4>
              <p
                className="text-blue-800 text-sm leading-relaxed"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicRegular,
                  fontSize: scale(12 + size)
                }}
              >
                سيتم تطبيق حجم الخط المختار على جميع النصوص في التطبيق. يمكنك تغيير الحجم في أي وقت من هذه الصفحة.
              </p>
            </div>
            </div>
          </div>

        </div>

      </ContentSection>
    </ResponsiveLayout>
  );
}
