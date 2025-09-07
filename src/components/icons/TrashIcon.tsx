import React from 'react';

interface TrashIconProps {
  size?: number;
  color?: string;
  onClick?: () => void;
}

export default function TrashIcon({ size = 24, color = '#FF0F0F', onClick }: TrashIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ lineHeight: 0, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      aria-label="Trash"
    >
      <path d="M19 6L18.4216 15.1137C18.2738 17.4422 18.1999 18.6065 17.6007 19.4435C17.3044 19.8574 16.9231 20.2066 16.4807 20.4691C15.586 21 14.3884 21 11.9932 21C9.59491 21 8.39575 21 7.50045 20.4681C7.05781 20.2052 6.67627 19.8553 6.3801 19.4407C5.78109 18.6024 5.70882 17.4365 5.5643 15.1047L5 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 6H20M15.6051 6L14.9983 4.79291C14.5952 3.99108 14.3936 3.59016 14.046 3.34012C13.9689 3.28466 13.8872 3.23532 13.8018 3.1926C13.4168 3 12.9548 3 12.0307 3C11.0834 3 10.6098 3 10.2184 3.20067C10.1316 3.24515 10.0489 3.29649 9.97092 3.35415C9.61924 3.61431 9.42278 4.0299 9.02988 4.86108L8.49148 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 16V11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 16V11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
