'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { scale } from '@/utils/responsiveSize';
import { fonts } from '@/constants/fonts';
import { useTranslation } from '@/hooks/useTranslation';

interface StageOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onGeneratePDF: () => void;
  onDelete: () => void;
  loading?: boolean;
  loadingPDF?: boolean;
  stage: {
    StageID: number;
    ProjectID: number;
    StageName: string;
  };
}

const StageOptionsModal: React.FC<StageOptionsModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onGeneratePDF,
  onDelete,
  loading = false,
  loadingPDF = false,
  stage
}) => {
  const { t, isRTL, dir } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
            onClick={(e) => e.stopPropagation()}
            style={{ direction: dir as 'rtl' | 'ltr' }}
          >
            <div
              className="rounded-3xl shadow-2xl overflow-hidden"
              style={{
                backgroundColor: 'var(--color-card-background)',
                border: '1px solid var(--color-card-border)'
              }}
            >
              {/* Header */}
              <div
                className="text-center border-b"
                style={{
                  padding: scale(20),
                  borderColor: 'var(--color-card-border)'
                }}
              >
                <h3
                  className="font-ibm-arabic-bold"
                  style={{
                    fontSize: scale(16),
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {t('stageOptions.settings')}
                </h3>
              </div>

              {/* Options */}
              <div style={{ padding: scale(20) }}>
                {/* PDF Report Option */}
                <button
                  onClick={onGeneratePDF}
                  disabled={loadingPDF}
                  className="w-full flex items-center gap-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    padding: scale(16),
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #EF4444',
                    marginBottom: scale(12)
                  }}
                >
                  {loadingPDF ? (
                    <div className="w-6 h-6 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                    </div>
                  ) : (
                    <svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 17H15M9 13H15M9 9H10M13 3H8.2C7.0799 3 6.51984 3 6.09202 3.21799C5.71569 3.40973 5.40973 3.71569 5.21799 4.09202C5 4.51984 5 5.0799 5 6.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.0799 21 8.2 21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 18.9201 19 17.8V9M13 3L19 9M13 3V7.4C13 7.96005 13 8.24008 13.109 8.45399C13.2049 8.64215 13.3578 8.79513 13.546 8.89101C13.7599 9 14.0399 9 14.6 9H19"
                        stroke="#EF4444"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <span
                    className="flex-1 text-center font-ibm-arabic-semibold"
                    style={{
                      fontSize: scale(14),
                      color: '#EF4444'
                    }}
                  >
                    {t('stageOptions.pdfReport')}
                  </span>
                </button>

                {/* Edit Option */}
                <button
                  onClick={onEdit}
                  className="w-full flex items-center gap-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  style={{
                    padding: scale(16),
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid #3B82F6',
                    marginBottom: scale(12)
                  }}
                >
                  <svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24" fill="none">
                    <path
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    className="flex-1 text-center font-ibm-arabic-semibold"
                    style={{
                      fontSize: scale(14),
                      color: '#3B82F6'
                    }}
                  >
                    {t('stageOptions.editStageData')}
                  </span>
                </button>

                {/* Delete Option */}
                <button
                  onClick={onDelete}
                  disabled={loading}
                  className="w-full flex items-center gap-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    padding: scale(16),
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #EF4444'
                  }}
                >
                  {loading ? (
                    <div className="w-6 h-6 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                    </div>
                  ) : (
                    <svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
                        stroke="#EF4444"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <span
                    className="flex-1 text-center font-ibm-arabic-semibold"
                    style={{
                      fontSize: scale(14),
                      color: '#EF4444'
                    }}
                  >
                    {t('stageOptions.deleteMainStage')}
                  </span>
                </button>
              </div>

              {/* Cancel Button */}
              <div
                className="border-t"
                style={{
                  padding: scale(20),
                  borderColor: 'var(--color-card-border)'
                }}
              >
                <button
                  onClick={onClose}
                  className="w-full rounded-2xl transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    padding: scale(14),
                    backgroundColor: 'var(--color-card-border)',
                    fontFamily: fonts.IBMPlexSansArabicSemiBold,
                    fontSize: scale(14),
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StageOptionsModal;

