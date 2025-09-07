import React from 'react';

interface ImageIconProps {
  size?: number;
  stroke?: string;
}

export default function ImageIcon({ size = 24, stroke = '#141B34' }: ImageIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12C3 7.75736 3 5.63604 4.31802 4.31802C5.63604 3 7.75736 3 12 3C16.2426 3 18.364 3 19.6819 4.31802C21 5.63604 21 7.75736 21 12C21 16.2426 21 18.364 19.6819 19.6819C18.364 21 16.2426 21 12 21C7.75736 21 5.63604 21 4.31802 19.6819C3 18.364 3 16.2426 3 12Z" stroke={stroke} strokeWidth="1.5" />
      <path d="M3 13.1355C3.71425 13.0455 4.43635 13.0012 5.15967 13.0027C8.2196 12.9467 11.2046 13.773 13.582 15.3342C15.7869 16.7822 17.3362 18.7749 18 21" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M15 9H15.009" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
