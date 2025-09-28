'use client';

import React, { useEffect, useState } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@/components/icons/CloseIcon';
import { useAppSelector } from '@/store';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?: string;
  maxWidth?: string;
  className?: string;
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
}

export default function Modal({
  isVisible,
  onClose,
  children,
  title,
  width = '90%',
  maxWidth = '500px',
  className = '',
  closeOnOutsideClick = true,
  showCloseButton = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const { size } = useAppSelector(state => state.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOutsideClick ? onClose : undefined}
            className="fixed inset-0 z-50 backdrop-blur-sm"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 1050
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              shadow-xl overflow-hidden
              ${className}
            `}
            style={{
              width,
              maxWidth,
              backgroundColor: 'var(--theme-card-background)',
              border: '1px solid var(--theme-border)',
              borderRadius: `${scale(20)}px`,
              maxHeight: '95vh',
              zIndex: 1051,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div
                className="flex items-center justify-between"
                style={{
                  borderBottom: '1px solid var(--theme-border)',
                  background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
                  paddingLeft: scale(24),
                  paddingRight: scale(24),
                  paddingTop: scale(20),
                  paddingBottom: scale(20)
                }}
              >
                {title && (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="var(--theme-primary)" strokeWidth="2"/>
                        <circle cx="9" cy="9" r="2" stroke="var(--theme-primary)" strokeWidth="2"/>
                        <path d="M21 15L16 10L5 21" stroke="var(--theme-primary)" strokeWidth="2"/>
                      </svg>
                    </div>
                    <h2
                      className="font-bold"
                      style={{
                        fontSize: `${scale(18 + size)}px`,
                        lineHeight: 1.4,
                        fontFamily: fonts.IBMPlexSansArabicBold,
                        color: 'var(--theme-text-primary)'
                      }}
                    >
                      {title}
                    </h2>
                  </div>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
                    style={{
                      padding: `${scale(10)}px`,
                      backgroundColor: 'var(--theme-surface-secondary)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text-secondary)',
                      marginRight: title ? 'auto' : '0'
                    }}
                  >
                    <CloseIcon
                      size={scale(20)}
                      stroke="currentColor"
                    />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div
              className="overflow-auto"
              style={{
                paddingLeft: scale(24),
                paddingRight: scale(24),
                paddingTop: scale(16),
                paddingBottom: scale(16),
                maxHeight: title || showCloseButton ? 'calc(95vh - 120px)' : '95vh'
              }}
            >
              {children}
            </div>

            {/* Decorative bottom element */}
            <div className="flex justify-center" style={{ paddingBottom: scale(8) }}>
              <div
                className="w-12 h-1 rounded-full"
                style={{ backgroundColor: 'var(--theme-border)' }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
