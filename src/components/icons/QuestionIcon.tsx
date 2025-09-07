import React from 'react';

interface QuestionIconProps {
  size?: number;
  stroke?: string;
  fill?: string;
}

export default function QuestionIcon({ size = 24, stroke = '#080808', fill = '#F2F6FF' }: QuestionIconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={stroke} strokeWidth="1" fill={fill} />
      <text x="12" y="16" fontFamily="Arial, sans-serif" fontSize="14" textAnchor="middle" fill={stroke}>i</text>
    </svg>
  );
}
