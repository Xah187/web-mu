'use client';

import React from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'نعم',
  cancelText = 'لا',
  isLoading = false
}) => {
  const { size } = useAppSelector(state => state.user);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1050,
        padding: `${scale(16)}px`
      }}
    >
      <div
        className="theme-card w-full shadow-2xl"
        style={{
          borderRadius: `${scale(16)}px`,
          padding: `${scale(24)}px`,
          maxWidth: `${scale(400)}px`,
          backgroundColor: 'var(--color-card-background)',
          border: '1px solid var(--color-card-border)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div
          className="text-center"
          style={{ marginBottom: `${scale(24)}px` }}
        >
          <h3
            className="theme-text-primary font-ibm-arabic-bold"
            style={{
              fontSize: `${scale(18 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicBold,
              marginBottom: `${scale(8)}px`,
              lineHeight: 1.4,
              color: 'var(--color-text-primary)'
            }}
          >
            {title}
          </h3>
          <p
            className="theme-text-secondary font-ibm-arabic-medium"
            style={{
              fontSize: `${scale(14 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicMedium,
              lineHeight: 1.5,
              color: 'var(--color-text-secondary)'
            }}
          >
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div
          className="flex justify-center"
          style={{ gap: `${scale(12)}px` }}
        >
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 text-white rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md"
            style={{
              backgroundColor: 'var(--color-primary)',
              padding: `${scale(12)}px ${scale(16)}px`,
              borderRadius: `${scale(8)}px`,
              fontSize: `${scale(14 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              gap: `${scale(8)}px`
            }}
          >
            {isLoading && (
              <div
                className="animate-spin rounded-full border-b-2 border-white"
                style={{
                  width: `${scale(16)}px`,
                  height: `${scale(16)}px`
                }}
              ></div>
            )}
            {confirmText}
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-gray-800 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
            style={{
              padding: `${scale(12)}px ${scale(16)}px`,
              borderRadius: `${scale(8)}px`,
              fontSize: `${scale(14 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicSemiBold
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
