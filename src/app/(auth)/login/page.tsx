'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/design/Input';
import ButtonLong from '@/components/design/ButtonLong';
import Combobox from '@/components/design/Combobox';
import AuthGuard from '@/components/auth/AuthGuard';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import Image from 'next/image';
import axiosInstance from '@/lib/api/axios';
import { useAppSelector } from '@/store';
import { scale, verticalScale } from '@/utils/responsiveSize';
import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

// Country codes array
const countryCodes = [
  {name: 'السعودية', code: '+966'},
  {name: 'الكويت', code: '+965'},
  {name: 'البحرين', code: '+973'},
  {name: 'قطر', code: '+974'},
  {name: 'اليمن', code: '+967'},
  {name: 'أفغانستان', code: '+93'},
  {name: 'ألمانيا', code: '+355'},
  {name: 'الجزائر', code: '+213'},
  {name: 'أندورا', code: '+376'},
  {name: 'أنغولا', code: '+244'},
  {name: 'الأرجنتين', code: '+54'},
  {name: 'أرمينيا', code: '+374'},
  {name: 'أستراليا', code: '+61'},
  {name: 'النمسا', code: '+43'},
  {name: 'أذربيجان', code: '+994'},
  {name: 'الباهاماس', code: '+1-242'},
  {name: 'بنغلاديش', code: '+880'},
  {name: 'باربادوس', code: '+1-246'},
  {name: 'بيلاروس', code: '+375'},
  {name: 'بلجيكا', code: '+32'},
  {name: 'بليز', code: '+501'},
  {name: 'بنين', code: '+229'},
  {name: 'بوتان', code: '+975'},
  {name: 'بوليفيا', code: '+591'},
  {name: 'البوسنة والهرسك', code: '+387'},
  {name: 'بوتسوانا', code: '+267'},
  {name: 'البرازيل', code: '+55'},
  {name: 'بروناي', code: '+673'},
  {name: 'بلغاريا', code: '+359'},
  {name: 'بوركينا فاسو', code: '+226'},
  {name: 'بوروندي', code: '+257'},
  {name: 'كاب فيردي', code: '+238'},
  {name: 'كمبوديا', code: '+855'},
  {name: 'الكاميرون', code: '+237'},
  {name: 'كندا', code: '+1'},
  {name: 'جمهورية أفريقيا الوسطى', code: '+236'},
  {name: 'تشاد', code: '+235'},
  {name: 'شيلي', code: '+56'},
  {name: 'الصين', code: '+86'},
  {name: 'كولومبيا', code: '+57'},
  {name: 'جزر القمر', code: '+269'},
  {name: 'الكونغو', code: '+242'},
  {name: 'الكونغو (جمهورية الديمقراطية)', code: '+243'},
  {name: 'كوستاريكا', code: '+506'},
  {name: 'كرواتيا', code: '+385'},
  {name: 'كوبا', code: '+53'},
  {name: 'قبرص', code: '+357'},
  {name: 'جمهورية التشيك', code: '+420'},
  {name: 'الدنمارك', code: '+45'},
  {name: 'جيبوتي', code: '+253'},
  {name: 'دومينيكا', code: '+1-767'},
  {name: 'جمهورية الدومينيكان', code: '+1-809'},
  {name: 'الإكوادور', code: '+593'},
  {name: 'مصر', code: '+20'},
  {name: 'السلفادور', code: '+503'},
  {name: 'غينيا الاستوائية', code: '+240'},
  {name: 'إريتريا', code: '+291'},
  {name: 'إستونيا', code: '+372'},
  {name: 'إثيوبيا', code: '+251'},
  {name: 'فيجي', code: '+679'},
  {name: 'فنلندا', code: '+358'},
  {name: 'فرنسا', code: '+33'},
  {name: 'غابون', code: '+241'},
  {name: 'غامبيا', code: '+220'},
  {name: 'جورجيا', code: '+995'},
  {name: 'ألمانيا', code: '+49'},
  {name: 'غانا', code: '+233'},
  {name: 'اليونان', code: '+30'},
  {name: 'غرينادا', code: '+1-473'},
  {name: 'غواتيمالا', code: '+502'},
  {name: 'غينيا', code: '+224'},
  {name: 'غينيا بيساو', code: '+245'},
  {name: 'هندوراس', code: '+504'},
  {name: 'هنغاريا', code: '+36'},
  {name: 'أيسلندا', code: '+354'},
  {name: 'الهند', code: '+91'},
  {name: 'إندونيسيا', code: '+62'},
  {name: 'إيران', code: '+98'},
  {name: 'العراق', code: '+964'},
  {name: 'أيرلندا', code: '+353'},
  {name: 'إسرائيل', code: '+972'},
  {name: 'إيطاليا', code: '+39'},
  {name: 'جامايكا', code: '+1-876'},
  {name: 'اليابان', code: '+81'},
  {name: 'الأردن', code: '+962'},
  {name: 'كازاخستان', code: '+7'},
  {name: 'كينيا', code: '+254'},
  {name: 'كوسوفو', code: '+383'},
  {name: 'كوريا الجنوبية', code: '+82'},
  {name: 'كوريا الشمالية', code: '+850'},
  {name: 'قرغيزستان', code: '+996'},
  {name: 'لاوس', code: '+856'},
  {name: 'لاتفيا', code: '+371'},
  {name: 'لبنان', code: '+961'},
  {name: 'ليسوتو', code: '+266'},
  {name: 'ليبيريا', code: '+231'},
  {name: 'ليبيا', code: '+218'},
  {name: 'ليتوانيا', code: '+370'},
  {name: 'لوكسمبورغ', code: '+352'},
  {name: 'مدغشقر', code: '+261'},
  {name: 'مالاوي', code: '+265'},
  {name: 'ماليزيا', code: '+60'},
  {name: 'مالطا', code: '+356'},
  {name: 'المغرب', code: '+212'},
  {name: 'موزمبيق', code: '+258'},
  {name: 'ميانمار', code: '+95'},
  {name: 'ناميبيا', code: '+264'},
  {name: 'ناورو', code: '+674'},
  {name: 'نيبال', code: '+977'},
  {name: 'هولندا', code: '+31'},
  {name: 'نيوزيلندا', code: '+64'},
  {name: 'نيكاراغوا', code: '+505'},
  {name: 'النيجر', code: '+227'},
  {name: 'نيجيريا', code: '+234'},
  {name: 'النرويج', code: '+47'},
  {name: 'عمان', code: '+968'},
  {name: 'باكستان', code: '+92'},
  {name: 'بالاو', code: '+680'},
  {name: 'بنما', code: '+507'},
  {name: 'بابوا غينيا الجديدة', code: '+675'},
  {name: 'باراغواي', code: '+595'},
  {name: 'بيرو', code: '+51'},
  {name: 'الفلبين', code: '+63'},
  {name: 'بولندا', code: '+48'},
  {name: 'البرتغال', code: '+351'},
  {name: 'رومانيا', code: '+40'},
  {name: 'روسيا', code: '+7'},
  {name: 'رواندا', code: '+250'},
  {name: 'سانت كيتس ونيفيس', code: '+1-869'},
  {name: 'سانت لوسيا', code: '+1-758'},
  {name: 'سانت فنسنت والغرينادين', code: '+1-784'},
  {name: 'سنغافورة', code: '+65'},
  {name: 'سلوفاكيا', code: '+421'},
  {name: 'سلوفينيا', code: '+386'},
  {name: 'جزر سليمان', code: '+677'},
  {name: 'جنوب أفريقيا', code: '+27'},
  {name: 'جنوب السودان', code: '+211'},
  {name: 'إسبانيا', code: '+34'},
  {name: 'سريلانكا', code: '+94'},
  {name: 'السودان', code: '+249'},
  {name: 'سورينام', code: '+597'},
  {name: 'سوازيلاند', code: '+268'},
  {name: 'السويد', code: '+46'},
  {name: 'سويسرا', code: '+41'},
  {name: 'سوريا', code: '+963'},
  {name: 'طاجيكستان', code: '+992'},
  {name: 'تنزانيا', code: '+255'},
  {name: 'تايلاند', code: '+66'},
  {name: 'توجو', code: '+228'},
  {name: 'تونغا', code: '+676'},
  {name: 'ترينيداد وتوباغو', code: '+1-868'},
  {name: 'تونس', code: '+216'},
  {name: 'تركيا', code: '+90'},
  {name: 'تركمانستان', code: '+993'},
  {name: 'أوغندا', code: '+256'},
  {name: 'أوكرانيا', code: '+380'},
  {name: 'الإمارات', code: '+971'},
  {name: 'المملكة المتحدة', code: '+44'},
  {name: 'الولايات المتحدة', code: '+1'},
  {name: 'أوروغواي', code: '+598'},
  {name: 'أوزبكستان', code: '+998'},
  {name: 'فانواتو', code: '+678'},
  {name: 'فنزويلا', code: '+58'},
  {name: 'فيتنام', code: '+84'},
];

export default function LoginPage() {
  const router = useRouter();
  const { size } = useAppSelector(state => state.user);
  const { currentTheme, isDark } = useTheme();
  const { t } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle phone number input with validation
  const handlePhoneNumberChange = (value: string) => {
    // Only allow digits
    const cleanValue = value.replace(/[^\d]/g, '');
    setPhoneNumber(cleanValue);

    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  // Handle country code change with validation
  const handleCountryCodeChange = (code: string) => {
    setCountryCode(code);

    // Clear error when user changes country code
    if (error) {
      setError('');
    }

    // Validate current phone number with new country code
    if (phoneNumber && !validatePhoneNumber(phoneNumber, code)) {
      setError(t('auth.invalidPhoneNumber'));
    }
  };

  // Get FCM token (for web we'll use a placeholder)
  const getFCMToken = async () => {
    // In a real implementation, you would get the FCM token here
    return 'web-token-placeholder';
  };

  // Phone number validation function
  const validatePhoneNumber = (phone: string, code: string) => {
    // Remove leading zero if exists
    let cleanNumber = phone;
    if (cleanNumber.startsWith('0')) {
      cleanNumber = cleanNumber.slice(1);
    }

    // Basic validation for different country codes
    const validationRules: { [key: string]: { minLength: number; maxLength: number; pattern?: RegExp } } = {
      '+966': { minLength: 9, maxLength: 9, pattern: /^5[0-9]{8}$/ }, // Saudi Arabia
      '+965': { minLength: 8, maxLength: 8 }, // Kuwait
      '+973': { minLength: 8, maxLength: 8 }, // Bahrain
      '+974': { minLength: 8, maxLength: 8 }, // Qatar
      '+971': { minLength: 9, maxLength: 9 }, // UAE
      '+968': { minLength: 8, maxLength: 8 }, // Oman
      '+967': { minLength: 9, maxLength: 9 }, // Yemen
    };

    const rule = validationRules[code];
    if (rule) {
      if (cleanNumber.length < rule.minLength || cleanNumber.length > rule.maxLength) {
        return false;
      }
      if (rule.pattern && !rule.pattern.test(cleanNumber)) {
        return false;
      }
    }

    return true;
  };

  const handleLogin = async () => {
    if (!phoneNumber) {
      setError(t('auth.phoneNumberRequired'));
      return;
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber, countryCode)) {
      const countryName = countryCodes.find(c => c.code === countryCode)?.name || t('auth.selectCountry');
      setError(`${t('auth.invalidPhoneNumber')} ${countryName}. ${t('auth.pleaseLogin')}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Remove leading zero if exists
      let number = phoneNumber;
      if (number.startsWith('0')) {
        number = number.slice(1);
      }

      const token = await getFCMToken();

      // SECURITY FIX: Removed hardcoded token - auth endpoint doesn't require authorization
      const response = await axiosInstance.get('/auth', {
        params: {
          PhoneNumber: number,
          token: token,
          code: countryCode
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Navigate to verification page with country code
        router.push(`/verification?number=${number}&code=${encodeURIComponent(countryCode)}`);
      } else {
        setError(response.data.masseg || t('auth.accountNotFound'));
      }
    } catch (err: any) {
      setError(t('auth.loginError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{
          padding: `${verticalScale(20)}px ${scale(20)}px`,
          minHeight: '100vh',
          backgroundColor: currentTheme.home
        }}
      >
      <div
        className="w-full mx-auto"
        style={{
          maxWidth: `${scale(350)}px`,
          padding: `0 ${scale(16)}px`
        }}
      >
        {/* Logo Section - مع مسافة كبيرة */}
        <div className="text-center" style={{ marginBottom: '60px' }}>
          <div className="flex items-center justify-center gap-1" style={{ marginBottom: '60px' }}>
            <Image
              src="/images/logo-new.png"
              width={120}
              height={24}
              alt={t('reports.moshrifLogo')}
              className="w-auto"
              priority
              style={{
                height: '32px',
                filter: isDark ? 'brightness(0) invert(1)' : 'none'
              }}
            />
            <span
              className="transition-colors duration-300"
              style={{
                color: isDark ? colors.WHITE : colors.BLUE,
                fontFamily: fonts.IBMPlexSansArabicBold,
                fontSize: '32px',
                lineHeight: '1.2'
              }}
            >
              {t('app.name')}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1 mb-1 px-2">
            <span
              className="transition-colors duration-300"
              style={{
                color: currentTheme.textPrimary,
                fontFamily: fonts.CAIROBOLD,
                fontSize: '20px',
                lineHeight: '1.4'
              }}
            >
              {t('auth.welcomeTo')}
            </span>
            <span
              className="transition-colors duration-300"
              style={{
                color: isDark ? colors.WHITE : colors.BLUE,
                fontFamily: fonts.IBMPlexSansArabicBold,
                fontSize: '20px',
                lineHeight: '1.4'
              }}
            >
              {t('app.name')}
            </span>
            <span
              className="transition-colors duration-300"
              style={{
                color: currentTheme.textPrimary,
                fontFamily: fonts.CAIROBOLD,
                fontSize: '20px',
                lineHeight: '1.4'
              }}
            >
              {t('auth.enterYourData')}
            </span>
          </div>

          <p
            className="transition-colors duration-300"
            style={{
              color: currentTheme.textSecondary,
              fontFamily: fonts.CAIROREGULARK,
              fontSize: '18px',
              lineHeight: '1.5'
            }}
          >
            {t('auth.pleaseLogin')}
          </p>
        </div>

        {/* Login Form */}
        <div
          className="space-y-4"
          style={{
            padding: `0 ${scale(16)}px`,
            marginBottom: `${verticalScale(20)}px`
          }}
        >
          {/* Input container - مع مسافة موحدة */}
          <div
            className="flex items-stretch"
            style={{
              height: `${scale(55)}px`,
              marginBottom: `${scale(20)}px`,
              gap: `${scale(12)}px`,
              direction: 'rtl'
            }}
          >
            {/* Phone Number Input - في اليمين */}
            <div className="flex-1 min-w-0" style={{ height: `${scale(55)}px` }}>
              <Input
                name=""
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                type="tel"
                placeholder={t('auth.enterPhoneNumber')}
                onPressEnter={handleLogin}
                height={`${scale(55)}px`}
                marginBottom={0}
              />
            </div>

            {/* Country Code Selector - في اليسار */}
            <div
              className="w-1/4 min-w-[80px] max-w-[120px]"
              style={{ height: `${scale(55)}px` }}
            >
              <Combobox
                value={countryCode}
                onChange={handleCountryCodeChange}
                items={countryCodes}
                height={`${scale(55)}px`}
                backgroundColor={colors.WHITE}
              />
            </div>
          </div>

          {/* Error message - positioned right after inputs */}
          {error && (
            <div
              className="rounded-lg text-sm font-cairo text-center transition-colors duration-300"
              style={{
                padding: `${scale(12)}px`,
                marginTop: `${scale(8)}px`,
                marginBottom: `${scale(16)}px`,
                borderRadius: `${scale(8)}px`,
                fontSize: `${scale(13 + size)}px`,
                fontFamily: fonts.IBMPlexSansArabicMedium,
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : colors.MISTYROSE,
                color: isDark ? '#fca5a5' : colors.RED,
                border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : 'none'
              }}
            >
              {error}
            </div>
          )}

          {/* زر تسجيل الدخول - مع مسافة للشاشات الصغيرة */}
          <div
            className="w-full"
            style={{
              padding: `0 ${scale(20)}px`,
              marginTop: `${verticalScale(20)}px`
            }}
          >
            <ButtonLong
              text={t('auth.login')}
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
            />
          </div>

          {/* رابط إنشاء حساب - محسن للجوال */}
          <div
            className="text-center"
            style={{
              marginTop: `${verticalScale(16)}px`,
              padding: `0 ${scale(20)}px`
            }}
          >
            <Link
              href="/create-company"
              className="font-cairo inline-block transition-all duration-200 hover:underline"
              style={{
                fontSize: `${verticalScale(14)}px`,
                padding: `${verticalScale(8)}px ${scale(16)}px`,
                color: isDark ? '#818cf8' : '#2563EB'
              }}
            >
              {t('auth.createNewCompanyAccount')}
            </Link>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
