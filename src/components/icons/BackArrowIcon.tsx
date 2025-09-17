'use client';

interface BackArrowIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function BackArrowIcon({ 
  size = 24, 
  color = '#2117fb', 
  className = '' 
}: BackArrowIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M19 12H5M12 19L5 12L12 5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
