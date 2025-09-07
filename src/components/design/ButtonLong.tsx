'use client';

import React from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';

interface ButtonLongProps {
  text: string;
  Press?: () => void;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
  loading?: boolean;
  width?: string | number;
  height?: number;
  fontSize?: number;
  className?: string;
  styleButton?: React.CSSProperties;
  icon?: React.ReactNode;
}

export default function ButtonLong({
  text,
  Press,
  onPress,
  backgroundColor = colors.BLUE,
  textColor = colors.WHITE,
  disabled = false,
  loading = false,
  width = '100%',
  height = 55,
  fontSize,
  className = '',
  styleButton,
  icon,
}: ButtonLongProps) {
  const { size } = useAppSelector(state => state.user);
  const calculatedFontSize = fontSize || 16 + size;

  const handleClick = Press || onPress || (() => {});

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative flex items-center justify-center
        rounded-xl transition-all duration-200
        hover:scale-[0.98] active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        font-ibm-arabic-semibold
        ${className}
      `}
      style={{
        backgroundColor,
        width: typeof width === 'number' ? `${width}px` : width,
        height: `${verticalScale(height)}px`,
        ...styleButton,
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2 space-x-reverse">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span
            className="mr-2"
            style={{
              color: textColor,
              fontSize: `${calculatedFontSize}px`,
            }}
          >
            جاري التحميل...
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-2 space-x-reverse">
          {icon && <span className="ml-2">{icon}</span>}
          <span
            style={{
              color: textColor,
              fontSize: `${calculatedFontSize}px`,
            }}
          >
            {text}
          </span>
        </div>
      )}
    </button>
  );
}
