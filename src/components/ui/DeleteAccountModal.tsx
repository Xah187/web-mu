'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  const { size } = useAppSelector(state => state.user);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0"
            style={{
              background: `
                radial-gradient(circle at center, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.8) 100%),
                linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)
              `,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              zIndex: 9999
            }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{
              type: "spring",
              duration: 0.4,
              bounce: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '2px solid var(--color-text-primary)',
              borderRadius: `${scale(20)}px`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              zIndex: 10000,
              backdropFilter: 'blur(20px)',
              background: `
                var(--color-surface),
                radial-gradient(circle at 20% 20%, rgba(239, 68, 68, 0.02) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.02) 0%, transparent 50%)
              `
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="text-center"
              style={{
                padding: `${scale(32)}px ${scale(28)}px ${scale(24)}px`,
                borderBottom: '1px solid var(--color-text-primary)'
              }}
            >
              {/* Icon */}
              <div
                className="mx-auto mb-6 rounded-full flex items-center justify-center relative"
                style={{
                  width: `${scale(80)}px`,
                  height: `${scale(80)}px`,
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  border: '3px solid rgba(220, 38, 38, 0.2)',
                  boxShadow: '0 8px 32px rgba(220, 38, 38, 0.15)'
                }}
              >
                {/* Background glow effect */}
                <div
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, transparent 70%)',
                    animation: 'pulse 2s infinite'
                  }}
                />
                <svg
                  width={scale(32)}
                  height={scale(32)}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="relative z-10"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>

              {/* Title */}
              <h3
                className="font-bold mb-4"
                style={{
                  fontSize: `${scale(24 + size)}px`,
                  fontFamily: fonts.IBMPlexSansArabicBold,
                  lineHeight: 1.3,
                  color: 'var(--color-text-primary)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  marginBottom: `${scale(16)}px`
                }}
              >
                حذف الحساب
              </h3>

              {/* Message */}
              <p
                style={{
                  fontSize: `${scale(16 + size)}px`,
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  lineHeight: 1.6,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  opacity: 0.85,
                  maxWidth: '280px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}
              >
                هل أنت متأكد من رغبتك في حذف حسابك؟
              </p>
            </div>

            {/* Content */}
            <div
              style={{
                padding: `${scale(28)}px ${scale(28)}px ${scale(32)}px`
              }}
            >
              {/* Warning Box */}
              <div
                className="relative rounded-xl overflow-hidden"
                style={{
                  padding: `${scale(20)}px`,
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1.5px solid rgba(245, 158, 11, 0.3)',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                  marginBottom: `${scale(32)}px`
                }}
              >
                {/* Background pattern */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(245, 158, 11, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.3) 0%, transparent 50%)',
                  }}
                />
                <div className="flex items-start gap-5 relative z-10">
                  <div
                    className="rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      width: `${scale(28)}px`,
                      height: `${scale(28)}px`,
                      backgroundColor: 'rgba(245, 158, 11, 0.25)',
                      marginTop: `${scale(2)}px`,
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)'
                    }}
                  >
                    <svg
                      width={scale(16)}
                      height={scale(16)}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <div>
                    <p
                      className="font-medium"
                      style={{
                        fontSize: `${scale(14 + size)}px`,
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        lineHeight: 1.4,
                        color: 'var(--color-text-primary)',
                        margin: 0,
                        marginBottom: `${scale(6)}px`
                      }}
                    >
                      تنبيه مهم
                    </p>
                    <p
                      style={{
                        fontSize: `${scale(13 + size)}px`,
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        lineHeight: 1.6,
                        color: 'var(--color-text-primary)',
                        margin: 0,
                        opacity: 1
                      }}
                    >
                      هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: `${scale(12)}px`,
                  alignItems: 'center'
                }}
              >
                {/* Cancel Button */}
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 text-center rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-[0.98] relative overflow-hidden"
                  style={{
                    fontSize: `${scale(16 + size)}px`,
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-surface-secondary)',
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    border: '1.5px solid var(--color-border)',
                    padding: `${scale(18)}px ${scale(28)}px`,
                    minHeight: `${scale(56)}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  إلغاء
                </button>

                {/* Delete Button */}
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 text-center rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-[0.98] relative overflow-hidden"
                  style={{
                    fontSize: `${scale(16 + size)}px`,
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'rgba(220, 38, 38, 0.10)',
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    border: '1.5px solid rgba(220, 38, 38, 0.35)',
                    padding: `${scale(18)}px ${scale(28)}px`,
                    minHeight: `${scale(56)}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  {isLoading ? 'جاري الحذف...' : 'حذف الحساب'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeleteAccountModal;
