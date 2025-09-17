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
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
              bg-white shadow-xl overflow-hidden
              ${className}
            `}
            style={{
              width,
              maxWidth,
              borderRadius: `${scale(16)}px`,
              maxHeight: '90vh',
              zIndex: 1051,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div
                className="flex items-center justify-between border-b"
                style={{
                  padding: `${scale(20)}px ${scale(24)}px`,
                  borderBottomColor: colors.BORDERCOLOR,
                  borderBottomWidth: '1px'
                }}
              >
                {title && (
                  <h2
                    className="text-black font-ibm-arabic-bold"
                    style={{
                      fontSize: `${scale(18 + size)}px`,
                      lineHeight: 1.4,
                      fontFamily: fonts.IBMPlexSansArabicBold
                    }}
                  >
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    style={{
                      padding: `${scale(8)}px`,
                      marginRight: title ? 'auto' : '0',
                      borderRadius: `${scale(8)}px`
                    }}
                  >
                    <CloseIcon
                      size={scale(20)}
                      stroke={colors.DARK}
                    />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div
              className="overflow-auto"
              style={{
                padding: `${scale(24)}px`,
                maxHeight: title || showCloseButton ? 'calc(90vh - 80px)' : '90vh'
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
