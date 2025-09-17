'use client';

import React, { useState, useRef, useEffect } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import ButtonLong from '@/components/design/ButtonLong';
import { Tostget } from '@/components/ui/Toast';

interface BranchDeleteVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (code: string) => Promise<void>;
  loading: boolean;
  branchName: string;
}

/**
 * Branch deletion verification modal component
 * Replicates mobile app's OpreationDelete component functionality
 * 
 * Features:
 * - 4-digit OTP input (like mobile app)
 * - Auto-focus and navigation between inputs
 * - Confirmation button with loading state
 * - Matches mobile app's UI design
 */
export default function BranchDeleteVerificationModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  branchName
}: BranchDeleteVerificationModalProps) {
  const { size } = useAppSelector(state => state.user);
  const [code, setCode] = useState(['', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset code when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode(['', '', '', '']);
      // Focus first input after a short delay
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take only the last character
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newCode = ['', '', '', ''];
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 3);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleConfirm = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 4) {
      Tostget('يرجى إدخال رمز التحقق كاملاً');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(verificationCode);
      onClose();
    } catch (error: any) {
      console.error('Error confirming deletion:', error);
      Tostget(error.message || 'فشل في تأكيد الحذف');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        style={{
          borderRadius: `${scale(20)}px`,
          padding: `${scale(24)}px`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div 
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              width: `${scale(64)}px`,
              height: `${scale(64)}px`,
              borderRadius: `${scale(32)}px`
            }}
          >
            <svg 
              width={scale(32)} 
              height={scale(32)} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              className="text-red-500"
              strokeWidth="2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
          
          <h3 
            className="font-semibold text-gray-900 mb-2"
            style={{
              fontSize: `${verticalScale(18 + (size || 0))}px`,
              fontFamily: fonts.IBMPlexSansArabicSemiBold
            }}
          >
            تأكيد حذف الفرع
          </h3>
          
          <p
            className="text-gray-600 mb-4"
            style={{
              fontSize: `${verticalScale(14 + (size || 0))}px`,
              lineHeight: 1.5
            }}
          >
            سيتم حذف فرع "{branchName}" وجميع المشاريع والبيانات المرتبطة به.
            <br />
            <span className="text-red-600 font-semibold">هذا الإجراء لا يمكن التراجع عنه.</span>
            <br />
            <br />
            تم إرسال رمز التحقق إلى هاتفك
            <br />
            يرجى إدخال الرمز لتأكيد الحذف
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <p 
            className="text-center text-gray-700 mb-4"
            style={{
              fontSize: `${verticalScale(14 + (size || 0))}px`,
              color: colors.BLACK
            }}
          >
            ادخل رمز التأكيد
          </p>
          
          <div className="flex justify-center space-x-3 rtl:space-x-reverse">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                style={{
                  width: `${scale(48)}px`,
                  height: `${scale(48)}px`,
                  fontSize: `${verticalScale(20 + (size || 0))}px`,
                  borderColor: digit ? colors.BLUE : colors.BORDERCOLOR,
                  borderRadius: `${scale(8)}px`
                }}
                disabled={isSubmitting || loading}
              />
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <div style={{ marginTop: `${verticalScale(20)}px` }}>
          <ButtonLong
            text={isSubmitting || loading ? 'جاري التحقق...' : 'تأكيد الحذف'}
            Press={handleConfirm}
            disabled={isSubmitting || loading || code.join('').length !== 4}
            backgroundColor={colors.RED}
            width="100%"
          />
        </div>

        {/* Cancel Button */}
        <div style={{ marginTop: `${scale(12)}px` }}>
          <ButtonLong
            text="إلغاء"
            Press={onClose}
            disabled={isSubmitting || loading}
            backgroundColor={colors.HOME}
            textColor={colors.BLACK}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}
