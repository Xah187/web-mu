import React from 'react';

interface AttachedIconProps {
  size?: number;
  stroke?: string;
}

export default function AttachedIcon({ size = 20, stroke = '#2117FB' }: AttachedIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.85282 10L3.56602 8.71317C2.14466 7.29185 2.14466 4.98738 3.56602 3.56602C4.98738 2.14466 7.29185 2.14466 8.71317 3.56602L16.434 11.2868C17.8553 12.7082 17.8553 15.0127 16.434 16.434C15.0127 17.8553 12.7082 17.8553 11.2868 16.434L8.3915 13.5387C7.50316 12.6503 7.50316 11.2101 8.3915 10.3217C9.27984 9.43333 10.7202 9.43333 11.6085 10.3217L13.217 11.9302" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
