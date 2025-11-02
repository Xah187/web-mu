'use client';

import { useAppSelector } from '@/store';
import arTranslations from '@/locales/ar.json';
import enTranslations from '@/locales/en.json';

type TranslationKey = string;
type Translations = typeof arTranslations;

/**
 * Custom hook for translations
 * Supports nested keys with dot notation (e.g., 'nav.home', 'settings.language')
 */
export function useTranslation() {
  const { language } = useAppSelector(state => state.user);
  
  const translations: Translations = language === 'en' ? enTranslations : arTranslations;
  
  /**
   * Get translation by key
   * @param key - Translation key (supports dot notation for nested keys)
   * @param params - Optional parameters for interpolation (e.g., { days: 5 })
   * @returns Translated text
   */
  const t = (key: TranslationKey, params?: Record<string, any> | string): string => {
    // Handle backward compatibility: if params is a string, treat it as fallback
    const fallback = typeof params === 'string' ? params : undefined;
    const interpolationParams = typeof params === 'object' ? params : undefined;

    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }

    let result = typeof value === 'string' ? value : fallback || key;

    // Handle interpolation
    if (interpolationParams && typeof result === 'string') {
      Object.keys(interpolationParams).forEach(paramKey => {
        result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(interpolationParams[paramKey]));
      });
    }

    return result;
  };
  
  /**
   * Get current language
   */
  const currentLanguage = language || 'ar';
  
  /**
   * Check if current language is RTL
   */
  const isRTL = currentLanguage === 'ar';
  
  /**
   * Get text direction
   */
  const dir = isRTL ? 'rtl' : 'ltr';
  
  return {
    t,
    language: currentLanguage,
    isRTL,
    dir,
    translations
  };
}

export default useTranslation;

