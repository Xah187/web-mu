import React from 'react';

interface CreateBranchIconProps {
  size?: number;
  stroke?: string;
}

export default function CreateBranchIcon({ size = 24, stroke = '#141B34' }: CreateBranchIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2H6C3.518 2 3 2.518 3 5V22H15V5C15 2.518 14.482 2 12 2Z" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M18 8H15V22H21V11C21 8.518 20.482 8 18 8Z" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 6H10M8 9H10M8 12H10" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 22V18C11.5 17.0572 11.5 16.5858 11.2071 16.2929C10.9142 16 10.4428 16 9.5 16H8.5C7.55719 16 7.08579 16 6.79289 16.2929C6.5 16.5858 6.5 17.0572 6.5 18V22" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
