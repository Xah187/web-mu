'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Tostget } from '@/components/ui/Toast';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { verticalScale, scale } from '@/utils/responsiveSize';
import Input from '@/components/design/Input';
import { useTranslation } from '@/hooks/useTranslation';

interface EvaluationLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: string) => Promise<void>;
  loading?: boolean;
  initialLink?: string;
}

function InputField({
  value,
  onChange,
  placeholder,
  onFocus
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onFocus?: () => void;
}) {
  const { size } = useAppSelector((state: any) => state.user);
  
  return (
    <div
      style={{
        width: '100%'
      }}
    >
      <Input
        name="رابط التقييم"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type="text"
        marginBottom={0}
      />
    </div>
  );
}

function ButtonLong({ onPress, children, disabled = false }: { onPress: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <div 
      style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center',
        margin: '15px 0'
      }}
    >
      <button
        onClick={onPress}
        disabled={disabled}
        style={{
          width: '85%',
          maxWidth: '400px',
          height: 50,
          backgroundColor: disabled ? colors.GREAY : colors.BLUE,
          borderRadius: 12,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseOver={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = '#1e0ff0';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseOut={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = colors.BLUE;
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {children}
      </button>
    </div>
  );
}

export default function EvaluationLinkModal({
  isOpen,
  onClose,
  onSave,
  loading = false,
  initialLink = ''
}: EvaluationLinkModalProps) {
  const { size, language } = useAppSelector((state: any) => state.user);
  const { t } = useTranslation();
  
  const [evaluationLink, setEvaluationLink] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Initialize link when modal opens
  useEffect(() => {
    if (isOpen) {
      setEvaluationLink(initialLink);
    }
  }, [isOpen, initialLink]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEvaluationLink('');
      setKeyboardVisible(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    try {
      if (!evaluationLink.trim()) {
        Tostget(t('branchSettings.pleaseEnterEvaluationLink'));
        return;
      }

      // Validate URL format
      try {
        new URL(evaluationLink);
      } catch {
        Tostget(t('branchSettings.pleaseEnterValidLink'));
        return;
      }

      await onSave(evaluationLink);
      Tostget(t('branchSettings.evaluationLinkSavedSuccess'), 'success');
      onClose();
    } catch (error: any) {
      console.error('Error saving evaluation link:', error);
      Tostget(error.message || t('branchSettings.evaluationLinkSavedError'), 'error');
    }
  };

  const handleFocus = () => {
    setKeyboardVisible(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="w-full overflow-hidden shadow-2xl"
        style={{
          backgroundColor: 'var(--theme-card-background)',
          border: '1px solid var(--theme-border)',
          borderRadius: `${scale(20)}px`,
          maxWidth: `${scale(480)}px`,
          minWidth: `${scale(400)}px`,
          fontFamily: fonts.IBMPlexSansArabicSemiBold,
          transform: keyboardVisible ? `translateY(${scale(-224)}px)` : 'translateY(0)',
          transition: 'transform 0.3s ease',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          direction: language === 'ar' ? 'rtl' : 'ltr'
        }}
      >
        {/* Header */}
        <div 
          className="border-b relative"
          style={{
            padding: `${verticalScale(16)}px ${verticalScale(20)}px`,
            borderBottomColor: '#e5e7eb',
            borderBottomWidth: 1,
            minHeight: verticalScale(60),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Close button in top-left corner */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              left: language === 'ar' ? verticalScale(16) : 'auto',
              right: language === 'en' ? verticalScale(16) : 'auto',
              top: verticalScale(16),
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              transition: 'color 0.2s ease',
              zIndex: 10
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#6b7280'}
            onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
            aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Centered title */}
          <h2
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: verticalScale(16 + size),
              color: colors.BORDER,
              fontWeight: '600',
              textAlign: 'center',
              margin: 0
            }}
          >
            {t('branchSettings.evaluationLink')}
          </h2>
        </div>

        {/* Content */}
        <div 
          style={{
            padding: `${verticalScale(20)}px ${verticalScale(20)}px`,
            paddingBottom: verticalScale(30)
          }}
        >
          {/* Input Field Container */}
          <div 
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 20,
              minHeight: 60
            }}
          >
            <InputField
              value={evaluationLink}
              onChange={setEvaluationLink}
              placeholder={t('branchSettings.enterEvaluationLink')}
              onFocus={handleFocus}
            />
          </div>

          {/* Preview Link */}
          {evaluationLink && (
            <div 
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 20
              }}
            >
              <div 
                style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: 8,
                  padding: 12,
                  width: '85%',
                  maxWidth: '400px'
                }}
              >
                <p style={{
                  fontSize: verticalScale(12 + size),
                  color: '#0369a1',
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  margin: 0,
                  textAlign: 'center'
                }}>
                  <strong>{t('branchSettings.linkPreview')}</strong>{' '}
                  <a 
                    href={evaluationLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      textDecoration: 'underline',
                      color: '#0369a1',
                      wordBreak: 'break-all'
                    }}
                  >
                    {evaluationLink}
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <ButtonLong
            onPress={handleSave}
            disabled={loading || !evaluationLink.trim()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading && (
                <div 
                  style={{
                    width: 15,
                    height: 15,
                    border: `2px solid ${colors.WHITE}`,
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                />
              )}
              <span
                style={{
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  color: colors.WHITE,
                  fontSize: 18,
                  fontWeight: '600'
                }}
              >
                {loading ? t('branchSettings.saving') : t('branchSettings.add')}
              </span>
            </div>
          </ButtonLong>

          {/* Info Text */}
          <div style={{ 
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginTop: 10
          }}>
            <div style={{ 
              width: '85%',
              maxWidth: '400px'
            }}>
              <p style={{
                fontSize: verticalScale(12 + size),
                color: colors.GREAY,
                fontFamily: fonts.IBMPlexSansArabicMedium,
                textAlign: 'center',
                margin: 0
              }}>
                يمكن للعملاء استخدام هذا الرابط لتقييم خدمات الفرع
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add keyframes for spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
