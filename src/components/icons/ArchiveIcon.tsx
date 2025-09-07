import React from 'react';

interface ArchiveIconProps {
  size?: number;
  stroke?: string;
}

export default function ArchiveIcon({ size = 18, stroke = '#2117FB' }: ArchiveIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 12.5C1.5 10.7458 1.5 9.86878 1.90235 9.22843C2.11216 8.89453 2.3945 8.61215 2.72842 8.40237C3.36875 8 4.24583 8 6 8H12C13.7542 8 14.6312 8 15.2716 8.40237C15.6055 8.61215 15.8878 8.89453 16.0976 9.22843C16.5 9.86878 16.5 10.7458 16.5 12.5C16.5 14.2542 16.5 15.1312 16.0976 15.7716C15.8878 16.1055 15.6055 16.3878 15.2716 16.5976C14.6312 17 13.7542 17 12 17H6C4.24583 17 3.36875 17 2.72842 16.5976C2.3945 16.3878 2.11216 16.1055 1.90235 15.7716C1.5 15.1312 1.5 14.2542 1.5 12.5Z" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7.5C15 6.4499 15 5.92485 14.7956 5.52376C14.6159 5.17096 14.3291 4.88413 13.9763 4.70436C13.5752 4.5 13.0501 4.5 12 4.5H6C4.9499 4.5 4.42485 4.5 4.02376 4.70436C3.67096 4.88413 3.38413 5.17096 3.20436 5.52376C3 5.92485 3 6.4499 3 7.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 4C13.5 2.58579 13.5 1.87868 13.0606 1.43934C12.6213 1 11.9142 1 10.5 1H7.5C6.08579 1 5.37868 1 4.93934 1.43934C4.5 1.87868 4.5 2.58579 4.5 4" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.25 10.5C11.25 11.3284 10.5784 12 9.75 12H8.25C7.42157 12 6.75 11.3284 6.75 10.5" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
