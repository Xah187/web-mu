import React from 'react';

interface ArrowIconProps {
  size?: number;
  color?: string;
  onClick?: () => void;
}

export default function ArrowIcon({ size = 18, color = '#080808', onClick }: ArrowIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 18 18" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ lineHeight: 0, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      aria-label="Back"
    >
      <path d="M6.6825 14.94L11.5725 10.05C12.15 9.4725 12.15 8.5275 11.5725 7.95L6.6825 3.06" stroke={color} strokeWidth="2.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
