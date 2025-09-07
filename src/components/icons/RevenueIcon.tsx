import React from 'react';

interface RevenueIconProps {
  size?: number;
  stroke?: string;
}

export default function RevenueIcon({ size = 20, stroke = '#2117FB' }: RevenueIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.1242 10.0001C12.1242 11.1507 11.1914 12.0834 10.0408 12.0834C8.89024 12.0834 7.95752 11.1507 7.95752 10.0001C7.95752 8.8495 8.89024 7.91675 10.0408 7.91675C11.1914 7.91675 12.1242 8.8495 12.1242 10.0001Z" stroke={stroke} strokeWidth="1.5" />
      <path d="M1.66675 9.99992C1.66675 7.05202 1.66675 5.57806 2.54408 4.594C2.68441 4.43661 2.83906 4.29104 3.0063 4.15898C4.05186 3.33325 5.61793 3.33325 8.75008 3.33325H11.2501C14.3822 3.33325 15.9483 3.33325 16.9938 4.15898C17.1611 4.29104 17.3157 4.43661 17.4561 4.594C18.3334 5.57806 18.3334 7.05202 18.3334 9.99992C18.3334 12.9478 18.3334 14.4218 17.4561 15.4058C17.3157 15.5633 17.1611 15.7088 16.9938 15.8408C15.9483 16.6666 14.3822 16.6666 11.2501 16.6666H8.75008C5.61793 16.6666 4.05186 16.6666 3.0063 15.8408C2.83906 15.7088 2.68441 15.5633 2.54408 15.4058C1.66675 14.4218 1.66675 12.9478 1.66675 9.99992Z" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.4247 10H15.4172" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.58341 10H4.57593" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
