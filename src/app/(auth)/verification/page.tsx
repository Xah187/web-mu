'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ButtonLong from '@/components/design/ButtonLong';
import AuthGuard from '@/components/auth/AuthGuard';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import axiosInstance from '@/lib/api/axios';
import { useAppDispatch } from '@/store';
import { setUser, setFontSize } from '@/store/slices/userSlice';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { fetchUserPermissions } from '@/functions/permissions/fetchPermissions';
import ArrowIcon from '@/components/icons/ArrowIcon';
import Image from 'next/image';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

// OTP Input Component
interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
}

function OTPInput({ value, onChange }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { currentTheme, isDark } = useTheme();

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

    const newValue = value.split('');
    newValue[index] = digit;
    const joined = newValue.join('');

    onChange(joined);

    // Auto focus next input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      onChange(pastedData);
      inputRefs.current[pastedData.length - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center" dir="rtl">
      {[0, 1, 2, 3].map((index) => (
        <input
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`
            w-12 h-12 text-center text-lg font-cairo-medium
            rounded-lg border-2 transition-all duration-200
            focus:outline-none
          `}
          style={{
            direction: 'ltr',
            backgroundColor: currentTheme.inputBackground,
            color: currentTheme.inputText,
            borderColor: value[index] ? colors.BLUE : currentTheme.inputBorder
          }}
        />
      ))}
    </div>
  );
}

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { currentTheme, isDark } = useTheme();
  const { t } = useTranslation();

  const phoneNumber = searchParams.get('number') || '';
  const countryCode = searchParams.get('code') || '+966';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerification = async () => {
    if (code.length !== 4) {
      setError(t('auth.verificationCode'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // SECURITY FIX: Removed hardcoded token - verification endpoint doesn't require authorization
      const response = await axiosInstance.get('/auth/v2/verification', {
        params: {
          output: code,
          PhoneNumber: phoneNumber
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Save user data and token (same structure as mobile app)
        // Mobile app stores: { accessToken, data, Validity, DisabledFinance }
        // Note: size is handled separately like mobile app (stored in 'settinguser')
        const userData = {
          accessToken: response.data.accessToken,
          data: response.data.data,
          Validity: response.data.Validity,
          DisabledFinance: response.data.DisabledFinance,
          size: 0 // Default value like mobile app
        };

        localStorage.setItem('token', response.data.accessToken); // Keep for backward compatibility
        localStorage.setItem('user', JSON.stringify(userData)); // Same structure as mobile app

        // Update Redux state
        dispatch(setUser(userData));

        // Load font size preference (like mobile app getSettinguser function)
        const savedFontSize = localStorage.getItem('fontSizePreference');
        if (savedFontSize && !isNaN(parseInt(savedFontSize))) {
          dispatch(setFontSize(parseInt(savedFontSize)));
        } else {
          dispatch(setFontSize(0)); // Default like mobile app
        }

        // Load permissions from login response (like mobile app)
        try {
          await fetchUserPermissions(response.data.accessToken, response.data);
          console.log('User permissions loaded from login response');
        } catch (error) {
          console.error('Failed to load user permissions:', error);
          // Continue with login even if permissions fail
        }

        // Replace current history entry instead of pushing new one
        // This prevents going back to verification page
        router.replace('/home');
      } else {
        setError(response.data.masseg || t('auth.invalidVerificationCode'));
      }
    } catch (err: any) {
      setError(t('auth.verificationError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code.length === 4) {
      handleVerification();
    }
  }, [code]);

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
        {/* Back Arrow */}
        <button
          onClick={() => router.back()}
          className="mb-4 p-2 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)';
          }}
        >
          <ArrowIcon size={24} color={currentTheme.textPrimary} />
        </button>

        {/* Logo Section (match login screen exactly) */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6 gap-1">
            <Image
              src="/images/logo-new.png"
              width={160}
              height={32}
              alt={t('reports.moshrifLogo')}
              className="h-8"
              style={{
                width: "auto",
                filter: isDark ? 'brightness(0) invert(1)' : 'none'
              }}
              priority
            />
            <span
              className="font-ibm-arabic-bold transition-colors duration-300"
              style={{
                fontSize: `${verticalScale(32)}px`,
                color: isDark ? colors.WHITE : colors.BLUE,
                fontFamily: fonts.IBMPlexSansArabicBold
              }}
            >
              {t('app.name')}
            </span>
          </div>

          <h2
            className="text-xl font-cairo-bold mb-2 transition-colors duration-300"
            style={{ color: currentTheme.textPrimary }}
          >
            {t('auth.enterCodeSentToNumber')}
          </h2>
          <p
            className="text-lg font-cairo transition-colors duration-300"
            style={{ color: currentTheme.textSecondary }}
          >
            {t('auth.verificationCodeWillBeSent')}{' '}
            <span style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
              {countryCode}{phoneNumber}
            </span>
          </p>
        </div>

        {/* OTP Form */}
        <div
          className="space-y-6"
          style={{
            padding: `0 ${scale(16)}px`,
            marginBottom: `${verticalScale(20)}px`
          }}
        >
          {error && (
            <div
              className="p-3 rounded-lg text-sm font-cairo text-center transition-colors duration-300"
              style={{
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : colors.MISTYROSE,
                color: isDark ? '#fca5a5' : colors.RED,
                border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : 'none'
              }}
            >
              {error}
            </div>
          )}

          <OTPInput value={code} onChange={setCode} />

          <div
            style={{
              padding: `0 ${scale(20)}px`,
              marginTop: `${verticalScale(20)}px`
            }}
          >
            <ButtonLong
              text={t('auth.confirm')}
              onPress={handleVerification}
              loading={loading}
              disabled={loading || code.length !== 4}
            />
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={
      <div
        className="min-h-screen transition-colors duration-300"
        style={{ backgroundColor: 'var(--theme-home, #f6f8fe)' }}
      />
    }>
      <VerificationContent />
    </Suspense>
  );
}
