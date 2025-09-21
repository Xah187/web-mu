'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

export default function ResponsiveLayout({ 
  children, 
  header, 
  showBottomNav = true,
  className = '' 
}: ResponsiveLayoutProps) {
  const pathname = usePathname();
  
  // تحديد ما إذا كانت الصفحة تحتاج تخطيط خاص
  const isFullScreenPage = pathname?.includes('/publications') && pathname?.includes('/reels');
  
  if (isFullScreenPage) {
    return <>{children}</>;
  }

  return (
    <div className={`page-layout ${className}`}>
      {/* Header */}
      {header && (
        <header className="page-header safe-area-top">
          <div className="container flex items-center justify-between w-full">
            {header}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="page-content">
        <div className="container">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Spacer */}
      {showBottomNav && (
        <div className="safe-area-bottom" style={{ height: 'var(--bottom-nav-height)' }} />
      )}
    </div>
  );
}

// Header Component
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backButton?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  actions, 
  backButton,
  className = '' 
}: PageHeaderProps) {
  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      {/* Left Side - Back Button + Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {backButton}
        <div className="min-w-0 flex-1">
          <h1 
            className="text-lg font-semibold text-gray-900 truncate"
            style={{ 
              fontSize: 'var(--font-size-lg)',
              lineHeight: 'var(--line-height-tight)'
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p 
              className="text-sm text-gray-600 truncate mt-1"
              style={{ 
                fontSize: 'var(--font-size-sm)',
                lineHeight: 'var(--line-height-normal)'
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Side - Actions */}
      {actions && (
        <div className="flex items-center gap-2 ml-3">
          {actions}
        </div>
      )}
    </div>
  );
}

// Content Section Component
interface ContentSectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ContentSection({ 
  children, 
  className = '',
  spacing = 'lg'
}: ContentSectionProps) {
  const spacingClass = {
    sm: 'content-section-sm',
    md: 'content-section-md', 
    lg: 'content-section',
    xl: 'content-section-xl'
  }[spacing];

  return (
    <section className={`${spacingClass} ${className}`}>
      {children}
    </section>
  );
}

// Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'compact' | 'normal' | 'spacious';
  shadow?: boolean;
}

export function Card({ 
  children, 
  className = '',
  padding = 'normal',
  shadow = true
}: CardProps) {
  const paddingClass = {
    compact: 'card-compact',
    normal: 'card',
    spacious: 'card-spacious'
  }[padding];

  const shadowClass = shadow ? 'shadow-sm' : '';

  return (
    <div className={`${paddingClass} ${shadowClass} ${className}`}>
      {children}
    </div>
  );
}

// Button Group Component
interface ButtonGroupProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export function ButtonGroup({ 
  children, 
  direction = 'horizontal',
  className = '' 
}: ButtonGroupProps) {
  const directionClass = direction === 'vertical' ? 'button-group-vertical' : 'button-group';
  
  return (
    <div className={`${directionClass} ${className}`}>
      {children}
    </div>
  );
}

// Text Content Component
interface TextContentProps {
  children: React.ReactNode;
  className?: string;
}

export function TextContent({ children, className = '' }: TextContentProps) {
  return (
    <div className={`text-content ${className}`}>
      {children}
    </div>
  );
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = ''
}: ResponsiveGridProps) {
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }[gap];

  const gridClass = `grid ${gapClass} ${className}`;

  const style = {
    gridTemplateColumns: `repeat(${cols.mobile || 1}, minmax(0, 1fr))`,
    '--tablet-cols': cols.tablet || 2,
    '--desktop-cols': cols.desktop || 3
  } as React.CSSProperties;

  return (
    <div className={gridClass} style={style}>
      <style jsx>{`
        .grid {
          align-items: stretch;
          display: grid !important;
        }
        .grid > * {
          height: 100%;
          width: 100%;
        }
        /* Tablet: 768px+ = 2 columns */
        @media (min-width: 768px) {
          .grid {
            grid-template-columns: repeat(var(--tablet-cols), minmax(0, 1fr)) !important;
          }
        }
        /* Desktop: 1024px+ = 3 columns */
        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(var(--desktop-cols), minmax(0, 1fr)) !important;
          }
        }
      `}</style>
      {children}
    </div>
  );
}
