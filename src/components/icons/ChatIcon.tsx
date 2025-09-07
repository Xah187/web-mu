import React from 'react';

interface ChatIconProps {
  size?: number;
  stroke?: string;
  dotColor?: string;
}

export default function ChatIcon({ size = 20, stroke = '#2117FB', dotColor = '#FF2805' }: ChatIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.3334 9.639C18.3334 14.0417 14.6019 17.6112 10.0001 17.6112C9.459 17.612 8.91941 17.5619 8.38791 17.4622C8.00536 17.3902 7.81406 17.3543 7.68052 17.3747C7.54697 17.3952 7.35773 17.4957 6.97924 17.6971C5.90853 18.2665 4.66004 18.4676 3.45934 18.2442C3.9157 17.6829 4.22737 17.0094 4.3649 16.2874C4.44823 15.8457 4.24175 15.4167 3.93249 15.1027C2.52786 13.6763 1.66675 11.7543 1.66675 9.639C1.66675 5.23639 5.39823 1.66675 10.0001 1.66675C14.6019 1.66675 18.3334 5.23639 18.3334 9.639Z" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9.99633 10H10.0038M13.3259 10H13.3334M6.66675 10H6.67422" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16.5" cy="15.5" r="3.5" fill={dotColor} />
    </svg>
  );
}
