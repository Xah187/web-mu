'use client';

import React from 'react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ThemeToggle({ 
  className = '', 
  size = 'md',
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]} 
        rounded-lg transition-all duration-300 
        hover:bg-gray-100 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        flex items-center justify-center
        ${className}
      `}
      style={{
        backgroundColor: isDark ? 'var(--color-surface-secondary)' : 'transparent',
        color: 'var(--color-text-primary)'
      }}
      aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الليلي'}
      title={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الليلي'}
    >
      {isDark ? (
        // Sun Icon for Light Mode
        <svg 
          width={iconSizes[size]} 
          height={iconSizes[size]} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className="transition-transform duration-300 rotate-0"
        >
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ) : (
        // Moon Icon for Dark Mode
        <svg 
          width={iconSizes[size]} 
          height={iconSizes[size]} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className="transition-transform duration-300 rotate-0"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
      
      {showLabel && (
        <span className="mr-2 text-sm font-medium">
          {isDark ? 'فاتح' : 'ليلي'}
        </span>
      )}
    </button>
  );
}
