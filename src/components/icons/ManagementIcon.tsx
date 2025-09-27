import React from 'react';

interface ManagementIconProps {
  focused?: boolean;
  size?: number;
}

// Briefcase icon to represent Management
export default function ManagementIcon({ focused = false, size = 24 }: ManagementIconProps) {
  const stroke = focused ? 'var(--color-primary)' : 'var(--color-text-secondary)';
  const strokeWidth = 1.7;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Handle */}
      <path d="M9 7V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Briefcase body */}
      <rect x="3" y="7" width="18" height="12" rx="2" stroke={stroke} strokeWidth={strokeWidth} />
      {/* Divider line */}
      <path d="M3 12h18" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Latches */}
      <path d="M10 12v2m4-2v2" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

