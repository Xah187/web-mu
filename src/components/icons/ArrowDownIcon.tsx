import React from 'react';

interface ArrowDownIconProps {
  width?: number;
  height?: number;
  stroke?: string;
  onClick?: () => void;
}

export default function ArrowDownIcon({ width = 10, height = 6, stroke = 'black', onClick }: ArrowDownIconProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 10 6" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ lineHeight: 0, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      aria-label="Arrow Down"
    >
      <path d="M9 1L5.70707 4.67459C5.51915 4.88302 5.26495 5 5 5C4.73505 5 4.48085 4.88302 4.29293 4.67459L1 1" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
