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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
      style={{
        zIndex: 1050
      }}
    >
      <div
        className="w-full shadow-2xl relative"
        style={{
          backgroundColor: 'var(--theme-card-background)',
          border: '1px solid var(--theme-border)',
          borderRadius: `${scale(20)}px`,
          maxWidth: `${scale(400)}px`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div
          className="text-center"
          style={{
            borderBottom: '1px solid var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
            paddingLeft: scale(24),
            paddingRight: scale(24),
            paddingTop: scale(20),
            paddingBottom: scale(20),
            marginBottom: scale(16),
            borderTopLeftRadius: `${scale(20)}px`,
            borderTopRightRadius: `${scale(20)}px`
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--theme-warning-alpha, rgba(245, 158, 11, 0.1))' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 9V13" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 17H12.01" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="10" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2"/>
              </svg>
            </div>
            <h3
              className="font-bold"
              style={{
                fontSize: `${scale(18 + size)}px`,
                fontFamily: fonts.IBMPlexSansArabicBold,
                lineHeight: 1.4,
                color: 'var(--theme-text-primary)'
              }}
            >
              {title}
            </h3>
          </div>
        </div>

        {/* Message */}
        <div style={{ paddingLeft: scale(24), paddingRight: scale(24), paddingBottom: scale(16) }}>
          <p
            className="text-center"
            style={{
              fontSize: `${scale(14 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicMedium,
              lineHeight: 1.5,
              color: 'var(--theme-text-secondary)',
              marginBottom: scale(20)
            }}
          >
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div
          className="flex gap-4 justify-center items-center"
          style={{
            borderTop: '1px solid var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
            paddingLeft: scale(24),
            paddingRight: scale(24),
            paddingTop: scale(16),
            paddingBottom: scale(16),
            margin: `${scale(8)}px 0`,
            borderBottomLeftRadius: `${scale(20)}px`,
            borderBottomRightRadius: `${scale(20)}px`
          }}
        >
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
            style={{
              fontSize: verticalScale(14),
              color: '#ffffff',
              backgroundColor: 'var(--theme-primary)',
              fontFamily: fonts.IBMPlexSansArabicBold,
              border: '2px solid var(--theme-primary)',
              padding: `${verticalScale(12)}px ${scale(16)}px`,
              maxWidth: '45%',
              minHeight: verticalScale(48),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            {isLoading ? (
              <div
                className="border-2 border-white border-t-transparent rounded-full animate-spin"
                style={{ width: scale(16), height: scale(16), marginLeft: scale(8) }}
              />
            ) : (
              confirmText
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
            style={{
              fontSize: verticalScale(14),
              color: 'var(--theme-text-primary)',
              backgroundColor: 'var(--theme-surface-secondary)',
              fontFamily: fonts.IBMPlexSansArabicBold,
              border: '2px solid var(--theme-border)',
              padding: `${verticalScale(12)}px ${scale(16)}px`,
              maxWidth: '45%',
              minHeight: verticalScale(48),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            {cancelText}
          </button>

          {/* Decorative bottom element */}
          <div
            className="flex justify-center"
            style={{
              position: 'absolute',
              bottom: scale(8),
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%'
            }}
          >
            <div
              className="w-12 h-1 rounded-full"
              style={{ backgroundColor: 'var(--theme-border)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
