import React from 'react';

interface DelaysIconProps {
  size?: number;
}

export default function DelaysIcon({ size = 20 }: DelaysIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.8334 1.66675V4.16675C15.8334 7.38841 13.2217 10.0001 10.0001 10.0001M10.0001 10.0001C6.77842 10.0001 4.16675 7.38841 4.16675 4.16675V1.66675M10.0001 10.0001C13.2217 10.0001 15.8334 12.6117 15.8334 15.8334V18.3334M10.0001 10.0001C6.77842 10.0001 4.16675 12.6117 4.16675 15.8334V18.3334" stroke="#2117FB" strokeWidth="1.5" />
      <path d="M3.33325 1.66675H16.6666M16.6666 18.3334H3.33325" stroke="#2117FB" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="15.5" cy="16.5" r="3.5" fill="#FF2805" />
    </svg>
  );
}
