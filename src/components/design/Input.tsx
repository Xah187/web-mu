'use client';

import React, { useEffect, useRef, useState } from 'react';
import { colors } from '@/constants/colors';
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
        marginBottom: `${marginBottom}px`,
        width: width || '100%',
      }}
    >
      <div
        className={`
          relative rounded-xl border transition-all duration-200
          ${isFocused ? 'border-blue shadow-sm' : 'border-bordercolor'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
        `}
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
          placeholder={placeholder}
          className={`
            w-full bg-transparent outline-none px-4 text-black text-right
            ${multiline ? 'resize-none py-3' : 'py-4'}
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          style={{
            minHeight: multiline ? `${verticalScale(minHeight)}px` : 'auto',
            height: multiline ? height : (height !== '100%' ? height : `${verticalScale(55)}px`),
            fontSize: type === 'tel' ? `${18 + size}px` : `${14 + size}px`,
            paddingTop: value && value.length > 0 ? '20px' : '16px',
            paddingBottom: value && value.length > 0 ? '8px' : '16px',
          }}
        />
        
        {/* Label - floating label behavior */}
        <label
          className={`
            absolute right-4 bg-white px-2 pointer-events-none
            transition-all duration-200 font-cairo z-10
            ${(value && String(value).trim().length > 0) || isFocused
              ? '-top-2 text-xs text-blue font-medium'
              : 'top-1/2 -translate-y-1/2 text-sm text-greay'
            }
          `}
          style={{
            fontSize: (value && String(value).trim().length > 0) || isFocused ? `${11 + size}px` : `${14 + size}px`,
            lineHeight: '1.2',
          }}
        >
          {name}
        </label>

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
            className="
              absolute left-2 top-1/2 -translate-y-1/2
              px-3 py-1 bg-blue text-white text-xs rounded-md
              hover:bg-bluedark transition-colors duration-200
              font-cairo-medium
            "
          >
            لصق
          </button>
        )}
      </div>
    </div>
  );
}
