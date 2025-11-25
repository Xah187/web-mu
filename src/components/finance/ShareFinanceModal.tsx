'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector } from '@/store';

// Add spinner animation styles
const spinnerStyle = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

interface ShareFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (type: 'all' | 'party', action: 'view' | 'share') => void;
  loading?: boolean;
}

const ShareFinanceModal: React.FC<ShareFinanceModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  loading = false
}) => {
  const { t, isRTL, dir } = useTranslation();
  const { size } = useAppSelector(state => state.user);
  const [selectedType, setSelectedType] = useState<'all' | 'party'>('all');

  const handleGenerate = () => {
    onGenerate(selectedType, 'view');
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{spinnerStyle}</style>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-lg overflow-hidden shadow-2xl"
            style={{
              backgroundColor: 'var(--color-card-background)',
              borderRadius: scale(20),
              border: '2px solid var(--color-border)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
            }}
            dir={dir}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between"
              style={{
                borderBottom: '1px solid var(--color-border)',
                background: 'linear-gradient(135deg, var(--color-card-background) 0%, var(--color-surface-secondary) 100%)',
                padding: scale(20),
                borderTopLeftRadius: scale(20),
                borderTopRightRadius: scale(20)
              }}
            >
              <div className="flex items-center" style={{ gap: scale(12) }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: scale(40),
                    height: scale(40),
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-surface-secondary)',
                    border: `2px solid var(--color-border)`
                  }}
                >
                  <svg width={scale(20)} height={scale(20)} fill="var(--color-primary)" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: scale(18 + size),
                      color: 'var(--color-text-primary)',
                      fontFamily: fonts.IBMPlexSansArabicBold,
                      margin: 0
                    }}
                  >
                    {t('finance.selectStatementType')}
                  </h2>
                  <p
                    style={{
                      fontSize: scale(12 + size),
                      color: 'var(--color-text-secondary)',
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      margin: 0,
                      marginTop: scale(4)
                    }}
                  >
                    {t('finance.statementTypeLabel')}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="transition-all duration-200 hover:scale-110"
                style={{
                  padding: scale(8),
                  borderRadius: scale(8),
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <svg width={scale(20)} height={scale(20)} fill="none" stroke="var(--color-text-secondary)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

          {/* Content */}
          <div
            style={{
              padding: scale(20),
              backgroundColor: 'var(--color-card-background)'
            }}
          >
            {/* Statement Type Selection */}
            <div
              style={{
                display: 'flex',
                gap: scale(12),
                marginBottom: scale(24)
              }}
            >
              <button
                onClick={() => setSelectedType('all')}
                className="flex-1 transition-all duration-200"
                style={{
                  padding: `${scale(16)}px ${scale(20)}px`,
                  borderRadius: scale(12),
                  border: `2px solid ${selectedType === 'all' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: 'var(--color-card-background)',
                  cursor: 'pointer',
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  fontSize: scale(14 + size),
                  color: selectedType === 'all' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  boxShadow: 'none'
                }}
              >
                <div className="text-center">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: scale(8) }}>
                    <svg width={scale(18)} height={scale(18)} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{t('finance.fullStatement')}</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedType('party')}
                className="flex-1 transition-all duration-200"
                style={{
                  padding: `${scale(16)}px ${scale(20)}px`,
                  borderRadius: scale(12),
                  border: `2px solid ${selectedType === 'party' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: 'var(--color-card-background)',
                  cursor: 'pointer',
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  fontSize: scale(14 + size),
                  color: selectedType === 'party' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  boxShadow: 'none'
                }}
              >
                <div className="text-center">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: scale(8) }}>
                    <svg width={scale(18)} height={scale(18)} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{t('finance.expensesStatement')}</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100"
              style={{
                padding: `${scale(14)}px ${scale(20)}px`,
                borderRadius: scale(12),
                backgroundColor: loading ? 'var(--color-primary-dark)' : 'var(--color-primary)',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: fonts.IBMPlexSansArabicSemiBold,
                fontSize: scale(14 + size),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: scale(8),
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
              }}
            >
              {loading ? (
                <div
                  style={{
                    width: scale(18),
                    height: scale(18),
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                />
              ) : (
                <svg width={scale(18)} height={scale(18)} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
              <span>{t('finance.view')}</span>
            </button>
          </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShareFinanceModal;

