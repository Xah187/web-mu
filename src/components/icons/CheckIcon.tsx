import React from 'react';

interface CheckIconProps {
  size?: number;
  color?: string;
}

export default function CheckIcon({ size = 34, color = '#000' }: CheckIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 12.5L10.5 15L16 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
