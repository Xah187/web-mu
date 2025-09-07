import React from 'react';

interface CommentIconProps {
  size?: number;
  stroke?: string;
  onClick?: () => void;
}

export default function CommentIcon({ size = 20, stroke = '#141B34', onClick }: CommentIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ lineHeight: 0, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      aria-label="Comment"
    >
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.66675 11.2499H13.3334M6.66675 7.08325H10.0001" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.08242 15.8333C3.999 15.7267 3.18737 15.4013 2.64306 14.8569C1.66675 13.8807 1.66675 12.3093 1.66675 9.16659V8.74992C1.66675 5.60722 1.66675 4.03588 2.64306 3.05956C3.61937 2.08325 5.19071 2.08325 8.33341 2.08325H11.6667C14.8094 2.08325 16.3808 2.08325 17.3571 3.05956C18.3334 4.03588 18.3334 5.60722 18.3334 8.74992V9.16659C18.3334 12.3093 18.3334 13.8807 17.3571 14.8569C16.3808 15.8333 14.8094 15.8333 11.6667 15.8333C11.1997 15.8437 10.8277 15.8792 10.4622 15.9624C9.46358 16.1923 8.53883 16.7033 7.62497 17.149C6.32282 17.7839 5.67175 18.1014 5.26316 17.8042C4.48149 17.222 5.24553 15.4182 5.41675 14.5833" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </svg>
  );
}
