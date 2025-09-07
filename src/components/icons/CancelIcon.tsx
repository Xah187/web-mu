import React from 'react';

interface CancelIconProps {
  size?: number;
  fill?: string;
  onClick?: () => void;
}

export default function CancelIcon({ size = 16, fill = '#3B4EFC', onClick }: CancelIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ lineHeight: 0, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      aria-label="Cancel"
    >
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="8" fill={fill} />
        <path d="M10.0002 6L6.00373 9.99652" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.00366 6.00104L10.0002 9.99755" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </svg>
  );
}
