'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setLanguage } from '@/store/slices/userSlice';

interface LanguageProviderProps {
  children: React.ReactNode;
}

/**
 * Language Provider Component
 * Handles language direction (RTL/LTR) and applies it to the document
 */
export default function LanguageProvider({ children }: LanguageProviderProps) {
  const { language } = useAppSelector(state => state.user);

  useEffect(() => {
    // Update document direction and language
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      const isRTL = language === 'ar';

      // Update direction
      html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

      // Update language
      html.setAttribute('lang', language || 'ar');

      // Add/remove RTL class for additional styling if needed
      if (isRTL) {
        html.classList.add('rtl');
        html.classList.remove('ltr');
      } else {
        html.classList.add('ltr');
        html.classList.remove('rtl');
      }
    }
  }, [language]);

  return <>{children}</>;
}

