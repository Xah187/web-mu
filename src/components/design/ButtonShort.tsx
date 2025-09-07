'use client';

import React from 'react';
import { colors } from '@/constants/colors';

interface ButtonShortProps {
  onpress: () => void;
  children: React.ReactNode;
  styleShort?: React.CSSProperties;
  className?: string;
  hitSlop?: number;
  disabled?: boolean;
}

export default function ButtonShort({
  onpress,
  children,
  styleShort,
  className = '',
  hitSlop = 15,
  disabled = false,
}: ButtonShortProps) {
  return (
    <button
      onClick={onpress}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        px-3 py-2 rounded-lg
        bg-lightmist hover:bg-blue hover:text-white
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        ...styleShort,
        padding: `${hitSlop}px`,
      }}
    >
      {children}
    </button>
  );
}
