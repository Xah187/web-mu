'use client';

import React, { useEffect, useState } from 'react';
import { useSidebarState } from '@/components/layout/ResponsiveNavigation';

export default function SidebarToggle() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if desktop
      const checkDesktop = () => {
        setIsDesktop(window.innerWidth >= 1024);
      };

      checkDesktop();
      window.addEventListener('resize', checkDesktop);

      return () => window.removeEventListener('resize', checkDesktop);
    }
  }, []);

  useEffect(() => {
    // Update local state from global sidebar state periodically
    const interval = setInterval(() => {
      const sidebarState = useSidebarState();
      setIsCollapsed(sidebarState.isCollapsed);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    const sidebarState = useSidebarState();
    sidebarState.toggleSidebar();
    setIsCollapsed(!isCollapsed);
  };

  // Only show on desktop
  if (!isDesktop) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 focus-ring"
      style={{
        color: isCollapsed ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        backgroundColor: isCollapsed ? 'var(--color-secondary)' : 'transparent'
      }}
      aria-label={isCollapsed ? 'إظهار القائمة الجانبية' : 'إخفاء القائمة الجانبية'}
      title={isCollapsed ? 'إظهار القائمة الجانبية' : 'إخفاء القائمة الجانبية'}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="transition-all duration-300"
        style={{
          transform: isCollapsed ? 'rotate(0deg)' : 'rotate(0deg)'
        }}
      >
        {isCollapsed ? (
          // Menu icon when collapsed (sidebar hidden)
          <path
            d="M3 12h18M3 6h18M3 18h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          // Close/X icon when expanded (sidebar visible)
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}
