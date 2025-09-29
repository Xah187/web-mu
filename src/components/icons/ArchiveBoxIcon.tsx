import React from 'react';

interface ArchiveBoxIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function ArchiveBoxIcon({ 
  size = 24, 
  color = 'currentColor',
  className = ''
}: ArchiveBoxIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Archive Box Base */}
      <rect 
        x="3" 
        y="8" 
        width="18" 
        height="12" 
        rx="2" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Archive Box Lid */}
      <rect 
        x="2" 
        y="4" 
        width="20" 
        height="4" 
        rx="1" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Handle/Tab */}
      <rect 
        x="9" 
        y="12" 
        width="6" 
        height="2" 
        rx="1" 
        fill={color}
      />
      
      {/* Archive Lines/Documents */}
      <line 
        x1="7" 
        y1="16" 
        x2="17" 
        y2="16" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      
      <line 
        x1="7" 
        y1="18" 
        x2="14" 
        y2="18" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
    </svg>
  );
}
