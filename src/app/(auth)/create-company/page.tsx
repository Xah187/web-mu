'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/design/Input';
import ButtonLong from '@/components/design/ButtonLong';
import ArrowIcon from '@/components/icons/ArrowIcon';
import IconMoshrif from '@/components/icons/IconMoshrif';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';

interface CompanyFormData {
  CommercialRegistrationNumber: string;
  NameCompany: string;
  BuildingNumber: string;
  StreetName: string;
  NeighborhoodName: string;
  PostalCode: string;
  City: string;
  Country: string;
  TaxNumber: string;
  PhoneNumber: string;
  userName: string;
  Api: string;
}

// Exact array from mobile app
const inputFieldsArray = [
  { name: 'رقم السجل التجاري', type: 'CommercialRegistrationNumber', kind: 'number-pad' },
  { name: 'اسم الشركة', type: 'NameCompany', kind: 'default' },
  { name: 'رقم المبنى', type: 'BuildingNumber', kind: 'number-pad' },
  { name: 'اسم الشارع', type: 'StreetName', kind: 'default' },
  { name: 'اسم الحي', type: 'NeighborhoodName', kind: 'default' },
  { name: 'الرمز البريدي', type: 'PostalCode', kind: 'number-pad' },
  { name: 'المدينة', type: 'City', kind: 'default' },
  { name: 'الدولة', type: 'Country', kind: 'default' },
  { name: 'الرقم الضريبي', type: 'TaxNumber', kind: 'number-pad' },
  { name: 'اسم المستخدم', type: 'userName', kind: 'default' },
  { name: 'رقم الهاتف', type: 'PhoneNumber', kind: 'number-pad' },
];

export default function CreateRegistrationCompany() {
  const router = useRouter();
  const { size } = useAppSelector(state => state.user);
  
  // Initial form data - exact match to mobile
  const initialTitle: CompanyFormData = {
    CommercialRegistrationNumber: '',
    NameCompany: '',
    BuildingNumber: '',
    StreetName: '',
    NeighborhoodName: '',
    PostalCode: '',
    City: '',
    Country: '',
    TaxNumber: '',
    PhoneNumber: '',
    userName: '',
    Api: 'true',
  };

  const [title, setTitle] = useState<CompanyFormData>(initialTitle);
  const [startReject, setStartReject] = useState(false);
  const [loading, setLoading] = useState(false);

  const sizeText = { fontSize: 18 }; // Fixed size to prevent hydration mismatch

  const insertInput = (field: keyof CompanyFormData, text: string) => {
    setTitle({ ...title, [field]: text });
  };

  const emptyInput = () => {
    setTitle(initialTitle);
    setStartReject(false);
  };

  const validateForm = () => {
    // Check all required fields exactly like mobile
    for (const item of inputFieldsArray) {
      if (!title[item.type as keyof CompanyFormData]) {
        Tostget('يجب اكمال البيانات');
        setStartReject(true);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // API call exactly like mobile app
      const result = await axiosInstance.post('/company', JSON.stringify(title), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dPdJ0ThcQ6ODl2_z5Nn2iO:APA91bE6yk0i_5M3YAmtAvBwEZIayJ4hOqFDMvQwQwhqTfn2bDwirSInge1kZGskTwvtzsEuZ6-FFU-06NVrAbTmB9UpQ63M9v5tgmKwj4_evGfJMz6PlIiWxOlvhHdnhR6fAbodYhRV'
        }
      });

      if (result.status === 200) {
        Tostget(result.data.success);
        
        // Check for welcome message like mobile app
        if (String(result.data.success).includes('نرحب')) {
          emptyInput();
          setTimeout(() => router.push('/login'), 2000);
        }
      }
    } catch (error: any) {
      console.error('Create company error:', error);
      Tostget('حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-home flex flex-col create-company-page">
      {/* Header Section - 30% height, blue background, logo at top */}
      <div 
        className="relative flex flex-col items-center justify-start"
        style={{
          backgroundColor: colors.BLUE,
          height: '20%',
          minHeight: '200px',
          paddingTop: '35px'
        }}
      >
        {/* Back Arrow - positioned exactly like mobile */}
        <button
          onClick={() => router.back()}
          className="absolute hover:bg-white/20 rounded-lg transition-colors"
          style={{
            alignSelf: 'flex-start',
            paddingLeft: 20,
            paddingRight: 20,
            top: 30,
            left: 20
          }}
        >
          <ArrowIcon size={24} color="#E5E7EB" />
        </button>

        {/* Logo at the top - larger size */}
        <div 
          className="flex flex-col items-center mt-8"
          style={{
            width: '100%',
            alignItems: 'center'
          }}
        >
          <IconMoshrif size={120} />
          <h1 
            className="font-ibm-arabic-semibold text-gray-200 mt-4"
            style={{
              fontSize: verticalScale(18 + size),
              color: '#E5E7EB',
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              paddingLeft: scale(10),
              paddingRight: scale(10),
              textAlign: 'center'
            }}
          >
            منصة مشرف
          </h1>
        </div>
      </div>

      {/* Body Section - White background with rounded top corners */}
      <div 
        className="flex-1 bg-white overflow-y-auto"
                  style={{
            borderTopLeftRadius: '19px',
            borderTopRightRadius: '19px',
            padding: 15,
            paddingBottom: 200
          }}
      >
        {/* Content Container - centered like mobile */}
        <div className="content-container">
          
          {/* Title Section - exactly like mobile */}
          <div 
            className="text-center"
            style={{ 
              marginTop: 10, 
              marginBottom: 10 
            }}
          >
            <h2 
              className="font-ibm-arabic-semibold text-black mb-2"
              style={{
                ...sizeText,
                color: colors.BLACK,
                fontFamily: fonts.IBMPlexSansArabicSemiBold,
                paddingLeft: 20,
                paddingRight: 20,
                textAlign: 'center'
              }}
            >
              انشاء حساب جديد
            </h2>
            <p 
              className="text-greay"
              style={{
                fontSize: 16,
                color: colors.GREAY,
                fontFamily: fonts.IBMPlexSansArabicSemiBold,
                paddingLeft: 20,
                paddingRight: 20,
                textAlign: 'center'
              }}
            >
              سجل بيانات شركتك من اجل انشاء حساب
            </p>
          </div>

          {/* Form Fields - responsive grid layout */}
          <div className="w-full max-w-md md:max-w-4xl mx-auto">
            <div className="space-y-4 md:space-y-6">
              {/* Row 1: رقم السجل التجاري + اسم الشركة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Input
                  name="رقم السجل التجاري"
                  value={title.CommercialRegistrationNumber}
                  onChange={(value) => insertInput('CommercialRegistrationNumber', value)}
                  type="tel"
                  height="50px"
                  marginBottom={17}
                />
                <Input
                  name="اسم الشركة"
                  value={title.NameCompany}
                  onChange={(value) => insertInput('NameCompany', value)}
                  type="text"
                  height="50px"
                  marginBottom={17}
                />
              </div>

              {/* Row 2: رقم المبنى + اسم الشارع */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Input
                  name="رقم المبنى"
                  value={title.BuildingNumber}
                  onChange={(value) => insertInput('BuildingNumber', value)}
                  type="tel"
                  height="50px"
                  marginBottom={17}
                />
                <Input
                  name="اسم الشارع"
                  value={title.StreetName}
                  onChange={(value) => insertInput('StreetName', value)}
                  type="text"
                  height="50px"
                  marginBottom={17}
                />
              </div>

              {/* Row 3: اسم الحي + الرمز البريدي */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Input
                  name="اسم الحي"
                  value={title.NeighborhoodName}
                  onChange={(value) => insertInput('NeighborhoodName', value)}
                  type="text"
                  height="50px"
                  marginBottom={17}
                />
                <Input
                  name="الرمز البريدي"
                  value={title.PostalCode}
                  onChange={(value) => insertInput('PostalCode', value)}
                  type="tel"
                  height="50px"
                  marginBottom={17}
                />
              </div>

              {/* Row 4: المدينة + الدولة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Input
                  name="المدينة"
                  value={title.City}
                  onChange={(value) => insertInput('City', value)}
                  type="text"
                  height="50px"
                  marginBottom={17}
                />
                <Input
                  name="الدولة"
                  value={title.Country}
                  onChange={(value) => insertInput('Country', value)}
                  type="text"
                  height="50px"
                  marginBottom={17}
                />
              </div>

              {/* Row 5: الرقم الضريبي + اسم المستخدم */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Input
                  name="الرقم الضريبي"
                  value={title.TaxNumber}
                  onChange={(value) => insertInput('TaxNumber', value)}
                  type="tel"
                  height="50px"
                  marginBottom={17}
                />
                <Input
                  name="اسم المستخدم"
                  value={title.userName}
                  onChange={(value) => insertInput('userName', value)}
                  type="text"
                  height="50px"
                  marginBottom={17}
                />
              </div>

              {/* Row 6: رقم الهاتف - spans two columns on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="md:col-span-2">
                  <Input
                    name="رقم الهاتف"
                    value={title.PhoneNumber}
                    onChange={(value) => insertInput('PhoneNumber', value)}
                    type="tel"
                    height="50px"
                    marginBottom={17}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* API Agreement Section - centered layout */}
          <div className="w-full max-w-md md:max-w-2xl mx-auto mt-6 mb-6">
            <div className="text-center mb-4">
              <h3 
                className="font-ibm-arabic-semibold text-black"
                style={{
                  ...sizeText,
                  color: colors.BLACK,
                  fontFamily: fonts.IBMPlexSansArabicSemiBold
                }}
              >
                الربط المالي عبر «Apis»:
              </h3>
            </div>
            
            <div className="flex items-center justify-center gap-8">
                {/* Yes Option */}
                <button
                  onClick={() => setTitle({ ...title, Api: 'true' })}
                  className="api-button hover:bg-blue/5 p-2 rounded-lg transition-colors"
                >
                  <span 
                    className="font-ibm-arabic-semibold text-black"
                    style={{
                      ...sizeText,
                      fontFamily: fonts.IBMPlexSansArabicSemiBold,
                      paddingLeft: scale(10),
                      paddingRight: scale(10)
                    }}
                  >
                    نعم
                  </span>
                  <div 
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      title.Api === 'true' 
                        ? 'border-gray-600 bg-gray-600' 
                        : 'border-bordercolor bg-white'
                    }`}
                  >
                    {title.Api === 'true' && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                </button>

                {/* No Option */}
                <button
                  onClick={() => setTitle({ ...title, Api: 'false' })}
                  className="api-button hover:bg-blue/5 p-2 rounded-lg transition-colors"
                >
                  <span 
                    className="font-ibm-arabic-semibold text-black"
                    style={{
                      ...sizeText,
                      fontFamily: fonts.IBMPlexSansArabicSemiBold,
                      paddingLeft: scale(10),
                      paddingRight: scale(10)
                    }}
                  >
                    لا
                  </span>
                  <div 
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      title.Api === 'false' 
                        ? 'border-gray-600 bg-gray-600' 
                        : 'border-bordercolor bg-white'
                    }`}
                  >
                    {title.Api === 'false' && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                </button>
            </div>
          </div>

          {/* Submit Button - exactly like mobile */}
          <div 
            className="submit-button mt-4"
                          style={{ 
                marginTop: 10, 
                marginBottom: 80 
              }}
          >
            <ButtonLong
              text="حفظ"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}