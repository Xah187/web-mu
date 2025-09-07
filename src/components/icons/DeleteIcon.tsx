import React from 'react';

interface DeleteIconProps {
  size?: number | string;
  color?: string;
  onClick?: () => void;
}

export default function DeleteIcon({ size = 40, color = '#FF0F0F', onClick }: DeleteIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ lineHeight: 0, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      aria-label="Delete"
    >
      <path d="M32.5 9.16675L31.4672 25.8752C31.2032 30.1441 31.0713 32.2786 30.0013 33.8132C29.4722 34.5719 28.7912 35.2122 28.0012 35.6934C26.4035 36.6667 24.265 36.6667 19.9878 36.6667C15.7052 36.6667 13.5638 36.6667 11.9651 35.6916C11.1747 35.2096 10.4933 34.5681 9.96447 33.8081C8.8948 32.2711 8.76575 30.1336 8.50768 25.8587L7.5 9.16675" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M5 9.16659H35M26.7595 9.16659L25.6218 6.81947C24.866 5.26035 24.488 4.48079 23.8362 3.9946C23.6917 3.88675 23.5385 3.79082 23.3783 3.70775C22.6565 3.33325 21.7902 3.33325 20.0575 3.33325C18.2813 3.33325 17.3933 3.33325 16.6595 3.72345C16.4968 3.80994 16.3416 3.90975 16.1955 4.02187C15.5361 4.52775 15.1677 5.33584 14.431 6.95202L13.4215 9.16659" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M15.8334 27.5V17.5" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M24.1666 27.5V17.5" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
