'use client';

import React from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';

interface ButtonCreatProps {
  text: string;
  onpress: () => void;
  number?: number;
  children?: React.ReactNode;
  disabled?: boolean;
  styleButton?: React.CSSProperties;
  className?: string;
}

export default function ButtonCreat({
  text,
  onpress,
  number = 0,
  children,
  disabled = false,
  styleButton,
  className = '',
}: ButtonCreatProps) {
  const { size } = useAppSelector(state => state.user);
  const showPlusIcon = text !== '$' && text !== 'إلغــاء';

  return (
    <button
      disabled={disabled}
      onClick={onpress}
      className={`
        flex items-center justify-center
        px-4 py-2 rounded-lg
        bg-lightmist text-blue
        hover:bg-blue hover:text-white
        transition-all duration-200
        font-ibm-arabic-medium
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={styleButton}
    >
      {showPlusIcon && (
        <svg
          width="15"
          height="16"
          viewBox="0 0 15 16"
          fill="none"
          className="ml-2"
        >
          <path
            d="M7.5 3V13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.5 8H12.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      
      <span
        className={text === 'إلغــاء' ? 'text-black' : ''}
        style={{
          fontSize: `${verticalScale(text === '$' ? 22 + size : 15 + size)}px`,
        }}
      >
        {text}
      </span>
      
      {number > 0 && (
        <div className="relative mr-2">
          <div className="absolute -top-2 -right-2 bg-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {number}
          </div>
        </div>
      )}
      
      {children}
    </button>
  );
}
