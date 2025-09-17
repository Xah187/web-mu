'use client';

import React, { useEffect, useRef, useState } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  onPressEnter?: () => void;
  height?: string;
  multiline?: boolean;
  minHeight?: number;
  width?: string | null;
  marginBottom?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

// Helper function to convert Arabic numbers to English
const convertArabicToEnglish = (str: string): string => {
  const arabicNumerals = '٠١٢٣٤٥٦٧٨٩';
  const englishNumerals = '0123456789';

  return str.split('').map(char => {
    const index = arabicNumerals.indexOf(char);
    return index !== -1 ? englishNumerals[index] : char;
  }).join('');
};

export default function Input({
  value,
  onChange,
  name,
  placeholder,
  type = 'text',
  onPressEnter = () => {},
  height = '100%',
  multiline = false,
  minHeight = 55,
  width = null,
  marginBottom = 15,
  disabled = false,
  className = '',
  label,
  error,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { size } = useAppSelector(state => state.user);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (type === 'number' || type === 'tel') {
      // Allow only numbers (including Arabic numerals)
      const numbersOnly = newValue.replace(/[^\d٠-٩]/g, '');
      onChange(convertArabicToEnglish(numbersOnly));
    } else {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      onPressEnter();
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    if (text) {
      if (type === 'number' || type === 'tel') {
        // Allow only numbers (including Arabic numerals) when pasting
        const numbersOnly = text.replace(/[^\d٠-٩]/g, '');
        onChange(convertArabicToEnglish(numbersOnly));
      } else {
        onChange(text);
      }
    }
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div
      className={`relative transition-all duration-200 ${className}`}
      style={{
        marginBottom: `${scale(marginBottom)}px`,
        width: width || '100%',
      }}
    >
      {/* External Label */}
      {(label || name) && !placeholder && (
        <label
          className="block text-gray-700 text-right"
          style={{
            fontSize: `${scale(14 + size)}px`,
            fontFamily: fonts.IBMPlexSansArabicMedium,
            marginBottom: `${scale(8)}px`,
            fontWeight: 500,
            color: error ? '#ef4444' : '#374151'
          }}
        >
          {label || name}
        </label>
      )}

      <div
        className={`
          relative rounded-xl border transition-all duration-200
          ${isFocused ? 'border-blue shadow-sm' : error ? 'border-red-500' : 'border-bordercolor'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
        `}
        style={{
          borderRadius: `${scale(12)}px`,
          borderColor: isFocused ? colors.BLUE : error ? '#ef4444' : colors.BORDERCOLOR
        }}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        <InputComponent
          ref={inputRef as any}
          type={multiline ? undefined : type}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder || (label || name ? undefined : `أدخل ${name}`)}
          className={`
            w-full bg-transparent outline-none text-black text-right
            ${multiline ? 'resize-none' : ''}
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          style={{
            minHeight: multiline ? `${scale(minHeight)}px` : 'auto',
            height: multiline ? height : (height !== '100%' ? height : `${scale(55)}px`),
            fontSize: type === 'tel' ? `${scale(18 + size)}px` : `${scale(14 + size)}px`,
            fontFamily: fonts.IBMPlexSansArabicMedium,
            padding: `${scale(16)}px ${scale(16)}px`,
            paddingTop: (value && value.length > 0) || placeholder ? `${scale(20)}px` : `${scale(16)}px`,
            paddingBottom: (value && value.length > 0) || placeholder ? `${scale(8)}px` : `${scale(16)}px`,
          }}
        />

        {/* Floating Label - only when no external label and no placeholder */}
        {!label && !placeholder && (
          <label
            className={`
              absolute right-4 bg-white px-2 pointer-events-none
              transition-all duration-200 z-10
              ${(value && String(value).trim().length > 0) || isFocused
                ? '-top-2 text-xs font-medium'
                : 'top-1/2 -translate-y-1/2 text-sm text-gray-500'
              }
            `}
            style={{
              fontSize: (value && String(value).trim().length > 0) || isFocused ? `${scale(11 + size)}px` : `${scale(14 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicMedium,
              lineHeight: '1.2',
              color: (value && String(value).trim().length > 0) || isFocused ? colors.BLUE : '#6b7280'
            }}
          >
            {name}
          </label>
        )}

        {/* Paste Button */}
        {isFocused && !value && (
          <button
            type="button"
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                if (text) {
                  if (type === 'number' || type === 'tel') {
                    // Allow only numbers (including Arabic numerals) when pasting from clipboard
                    const numbersOnly = text.replace(/[^\d٠-٩]/g, '');
                    onChange(convertArabicToEnglish(numbersOnly));
                  } else {
                    onChange(text);
                  }
                }
              } catch (err) {
                console.error('Failed to read clipboard');
              }
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-xs rounded-md hover:bg-bluedark transition-colors duration-200"
            style={{
              fontSize: `${scale(11 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicMedium,
              padding: `${scale(4)}px ${scale(8)}px`,
              borderRadius: `${scale(4)}px`,
              backgroundColor: colors.BLUE
            }}
          >
            لصق
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p
          className="text-red-500 text-right"
          style={{
            fontSize: `${scale(12 + size)}px`,
            fontFamily: fonts.IBMPlexSansArabicMedium,
            marginTop: `${scale(4)}px`,
            lineHeight: 1.4
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// Export the convertArabicToEnglish function for use in other components
export { convertArabicToEnglish };
