'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ButtonLong from '@/components/design/ButtonLong';
import AuthGuard from '@/components/auth/AuthGuard';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import axiosInstance from '@/lib/api/axios';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/slices/userSlice';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { fetchUserPermissions } from '@/functions/permissions/fetchPermissions';
import ArrowIcon from '@/components/icons/ArrowIcon';
import Image from 'next/image';

// OTP Input Component
interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
}

function OTPInput({ value, onChange }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    <div className="flex gap-3 justify-center" dir="ltr">
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
            bg-white rounded-lg border-2 transition-all duration-200
            ${value[index] ? 'border-blue' : 'border-bordercolor'}
            focus:border-blue focus:outline-none
          `}
          style={{ direction: 'ltr' }}
        />
      ))}
    </div>
  );
}

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const phoneNumber = searchParams.get('number') || '';
  const countryCode = searchParams.get('code') || '+966';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerification = async () => {
    if (code.length !== 4) {
      setError('يرجى ادخال رمز التاكيد');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.get('/auth/v2/verification', {
        params: {
          output: code,
          PhoneNumber: phoneNumber
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dPdJ0ThcQ6ODl2_z5Nn2iO:APA91bE6yk0i_5M3YAmtAvBwEZIayJ4hOqFDMvQwQwhqTfn2bDwirSInge1kZGskTwvtzsEuZ6-FFU-06NVrAbTmB9UpQ63M9v5tgmKwj4_evGfJMz6PlIiWxOlvhHdnhR6fAbodYhRV'
        }
      });

      if (response.data.success) {
        // Save user data and token (including Validity like mobile app)
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data));

        // Update Redux state
        dispatch(setUser(response.data));

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
        setError(response.data.masseg || 'رمز التحقق غير صحيح');
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء التحقق');
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
        className="min-h-screen bg-home flex items-center justify-center"
        style={{
          padding: `${verticalScale(20)}px ${scale(20)}px`,
          minHeight: '100vh'
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
          className="mb-4 p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <ArrowIcon size={24} color={colors.BLACK} />
        </button>

        {/* Logo Section (match login screen exactly) */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6 gap-1">
            <Image
              src="/images/figma/Vector.png"
              width={160}
              height={32}
              alt="Moshrif Vector"
              className="h-8"
              style={{ width: "auto" }}
              priority
            />
            <span className="font-ibm-arabic-bold text-blue" style={{ 
              fontSize: `${verticalScale(32)}px`,
              color: colors.BLUE,
              fontFamily: fonts.IBMPlexSansArabicBold
            }}>
              مشرف
            </span>
          </div>

          <h2 className="text-xl font-cairo-bold text-black mb-2">
            ادخل الكود المرسل إلى رقمك
          </h2>
          <p className="text-lg font-cairo text-black">
            سيصلك رمز تحقق على هذا الرقم{' '}
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
            <div className="p-3 bg-mistyrose rounded-lg text-red text-sm font-cairo text-center">
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
              text="تأكيد"
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
    <Suspense fallback={<div className="min-h-screen bg-home" />}>
      <VerificationContent />
    </Suspense>
  );
}
