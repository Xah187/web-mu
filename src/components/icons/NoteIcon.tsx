import React from 'react';

interface NoteIconProps {
  size?: number;
  stroke?: string;
  onClick?: () => void;
}

export default function NoteIcon({ size = 20, stroke = '#2117FB', onClick }: NoteIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ lineHeight: 0, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      aria-label="Note"
    >
      <path d="M8.57425 18.3011H7.82584C5.11876 18.3011 3.76522 18.3011 2.92424 17.4469C2.08325 16.5925 2.08325 15.2176 2.08325 12.4678V8.3011C2.08325 5.55124 2.08325 4.17632 2.92424 3.32205C3.76522 2.46777 5.11876 2.46777 7.82584 2.46777H10.2869C12.994 2.46777 14.5755 2.51376 15.4166 3.36803C16.2576 4.2223 16.2499 5.55124 16.2499 8.3011V9.28977" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.2877 1.66675V3.33341M9.121 1.66675V3.33341M4.95435 1.66675V3.33341" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.83325 12.4999H9.16659M5.83325 8.33325H12.4999" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path opacity="0.93" d="M17.2999 12.3988C16.5454 11.5535 16.0927 11.6038 15.5897 11.7547C15.2376 11.8051 14.0304 13.2141 13.5274 13.6627C12.7016 14.4786 11.872 15.3186 11.8173 15.4282C11.6609 15.6824 11.5155 16.1327 11.4451 16.6359C11.3143 17.3907 11.1256 18.2405 11.3646 18.3133C11.6035 18.3861 12.2699 18.2462 13.0244 18.1355C13.5274 18.0449 13.8795 17.9442 14.131 17.7933C14.4831 17.582 15.137 16.8372 16.2637 15.7301C16.9704 14.9861 17.6519 14.4721 17.8532 13.9689C18.0544 13.2141 17.7526 12.8115 17.2999 12.3988Z" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}
