import React from 'react';

interface RefreshIconProps {
  size?: number;
  fill?: string;
  onClick?: () => void;
}

export default function RefreshIcon({ size = 20, fill = '#000', onClick }: RefreshIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      xmlns="http://www.w3.org/2000/svg"
      style={{ lineHeight: 0, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      aria-label="Refresh"
    >
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M12 4V1L8 5l4 4V7c3.87 0 7 3.13 7 7s-3.13 7-7 7-7-3.13-7-7h-2c0 5 4 9 9 9s9-4 9-9-4-9-9-9z" fill={fill}/>
    </svg>
  );
}
