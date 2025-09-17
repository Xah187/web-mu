'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { verticalScale } from '@/utils/responsiveSize';
import ArrowIcon from '@/components/icons/ArrowIcon';
import ButtonLong from '@/components/design/ButtonLong';
import Input from '@/components/design/Input';
import { useCompanyData, type CompanyData } from '@/hooks/useCompanyData';
import { Tostget } from '@/components/ui/Toast';

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

// Helper function to convert Arabic numbers to English
const convertArabicToEnglish = (str: string): string => {
  const arabicNumerals = '٠١٢٣٤٥٦٧٨٩';
  const englishNumerals = '0123456789';

  return str.split('').map(char => {
    const index = arabicNumerals.indexOf(char);
    return index !== -1 ? englishNumerals[index] : char;
  }).join('');
};

export default function CompanyInfoPage() {
  const router = useRouter();
  const { user, size } = useAppSelector((state: any) => state.user);
  const { companyData, updateCompanyData, loading } = useCompanyData();

  const [formData, setFormData] = useState<Partial<CompanyData>>({
    NameCompany: '',
    BuildingNumber: '',
    StreetName: '',
    NeighborhoodName: '',
    PostalCode: '',
    City: '',
    Country: '',
    TaxNumber: '',
    Cost: '',
    CommercialRegistrationNumber: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (companyData) {
      setFormData({
        NameCompany: companyData.NameCompany || '',
        BuildingNumber: companyData.BuildingNumber || '',
        StreetName: companyData.StreetName || '',
        NeighborhoodName: companyData.NeighborhoodName || '',
        PostalCode: companyData.PostalCode || '',
        City: companyData.City || '',
        Country: companyData.Country || '',
        TaxNumber: companyData.TaxNumber || '',
        Cost: companyData.Cost || '',
        CommercialRegistrationNumber: companyData.CommercialRegistrationNumber || ''
      });
    } else if (user?.data) {
      // Fallback to user data if company data not available yet
      setFormData({
        NameCompany: user.data.CompanyName || '',
        BuildingNumber: '',
        StreetName: '',
        NeighborhoodName: '',
        PostalCode: '',
        City: '',
        Country: '',
        TaxNumber: '',
        Cost: '',
        CommercialRegistrationNumber: user.data.CommercialRegistrationNumber || ''
      });
    }
  }, [companyData, user?.data]);

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.NameCompany?.trim()) {
      newErrors.NameCompany = 'اسم الشركة مطلوب';
    }

    if (!formData.City?.trim()) {
      newErrors.City = 'المدينة مطلوبة';
    }

    if (!formData.Country?.trim()) {
      newErrors.Country = 'البلد مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Tostget('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await updateCompanyData({
        ...formData,
        id: companyData?.id
      });

      if (success) {
        // Navigate to home page with refresh parameter to update company info display
        router.push('/home?refresh=company');
      }
    } catch (error) {
      console.error('Error updating company:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertArabicToEnglish = (text: string): string => {
    return text.replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1584));
  };

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title="تعديل بيانات الشركة"
          backButton={
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="رجوع"
            >
              <ArrowIcon size={24} color={colors.BLACK} />
            </button>
          }
        />
      }
    >
      <ContentSection>

      {/* Form Content */}
      <div className="flex justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">

          {/* Loading indicator for company data */}
          {loading && !companyData && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue border-t-transparent rounded-full"></div>
              <span className="mr-3 text-gray-600">جاري تحميل بيانات الشركة...</span>
            </div>
          )}



          {/* Company Name - Full Width */}
          <div className="mb-6">
            <Input
              name="اسم الشركة"
              value={formData.NameCompany || ''}
              onChange={(value: string) => handleInputChange('NameCompany', value)}
              type="text"
            />
          </div>

          {/* Commercial Registration Number - Full Width */}
          <div className="mb-6">
            <Input
              name="رقم السجل التجاري"
              value={formData.CommercialRegistrationNumber || ''}
              onChange={(value: string) => handleInputChange('CommercialRegistrationNumber', convertArabicToEnglish(value))}
              type="tel"
            />
          </div>

          {/* Two Column Layout for Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">

            {/* Building Number */}
            <Input
              name="رقم المبنى"
              value={formData.BuildingNumber || ''}
              onChange={(value: string) => handleInputChange('BuildingNumber', convertArabicToEnglish(value))}

              type="tel"
            />

            {/* Street Name */}
            <Input
              name="اسم الشارع"
              value={formData.StreetName || ''}
              onChange={(value: string) => handleInputChange('StreetName', value)}
              type="text"
            />

            {/* Neighborhood Name */}
            <Input
              name="اسم الحي"
              value={formData.NeighborhoodName || ''}
              onChange={(value: string) => handleInputChange('NeighborhoodName', value)}
              type="text"
            />

            {/* Postal Code */}
            <Input
              name="الرمز البريدي"
              value={formData.PostalCode || ''}
              onChange={(value: string) => handleInputChange('PostalCode', convertArabicToEnglish(value))}
              type="tel"
            />

            {/* City */}
            <Input
              name="المدينة"
              value={formData.City || ''}
              onChange={(value: string) => handleInputChange('City', value)}
              type="text"
            />

            {/* Country */}
            <Input
              name="البلد"
              value={formData.Country || ''}
              onChange={(value: string) => handleInputChange('Country', value)}
              type="text"
            />

            {/* Tax Number */}
            <Input
              name="الرقم الضريبي"
              value={formData.TaxNumber || ''}
              onChange={(value: string) => handleInputChange('TaxNumber', convertArabicToEnglish(value))}
              type="tel"
            />

            {/* Daily Cost */}
            <Input
              name="التكلفة اليومية على الشركة"
              value={formData.Cost || ''}
              onChange={(value: string) => handleInputChange('Cost', convertArabicToEnglish(value))}
              type="tel"
            />
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <ButtonLong
              text={isSubmitting ? 'جاري الحفظ...' : 'تعديل'}
              onPress={handleSubmit}
              disabled={isSubmitting || loading}
            />
          </div>
        </div>
      </div>
      </ContentSection>
    </ResponsiveLayout>
  );
}
