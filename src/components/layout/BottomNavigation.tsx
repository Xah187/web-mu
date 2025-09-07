'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { colors } from '@/constants/colors';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import SettingIcon from '@/components/icons/SettingIcon';

interface NavItem {
  name: string;
  label: string;
  icon: (focused: boolean) => React.ReactNode;
}

export default function BottomNavigation() {
  const pathname = usePathname();
  const { size } = useAppSelector(state => state.user);

  const navItems: NavItem[] = [
    {
      name: 'home',
      label: 'الرئيسية',
      icon: (focused: boolean) => (
        <svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24" fill="none">
          <g id="home-02">
            <path
              id="Vector"
              d="M12 18V15"
              stroke={focused ? colors.BLUE : colors.BORDER}
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <path
              id="Vector_2"
              d="M2.35139 13.2135C1.99837 10.9162 1.82186 9.76763 2.25617 8.74938C2.69047 7.73112 3.65403 7.03443 5.58114 5.64106L7.02099 4.6C9.41829 2.86667 10.617 2 12 2C13.3831 2 14.5817 2.86667 16.979 4.6L18.4189 5.64106C20.346 7.03443 21.3096 7.73112 21.7439 8.74938C22.1782 9.76763 22.0017 10.9162 21.6486 13.2135L21.3476 15.1724C20.8472 18.4289 20.5969 20.0572 19.429 21.0286C18.2611 22 16.5537 22 13.1388 22H10.8612C7.44634 22 5.73891 22 4.571 21.0286C3.40309 20.0572 3.15287 18.4289 2.65243 15.1724L2.35139 13.2135Z"
              stroke={focused ? colors.BLUE : colors.BORDER}
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      ),
    },
    {
      name: 'reports',
      label: 'التقارير',
      icon: (focused: boolean) => (
        <svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24" fill="none">
          <g id="analytics-01">
            <g id="Group 2110070291">
              <path
                id="Vector"
                d="M7 17V13"
                stroke={focused ? colors.BLUE : colors.BORDER}
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                id="Vector_2"
                d="M12 17V7"
                stroke={focused ? colors.BLUE : colors.BORDER}
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                id="Vector_3"
                d="M17 17V11"
                stroke={focused ? colors.BLUE : colors.BORDER}
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </g>
          </g>
        </svg>
      ),
    },
    {
      name: 'publications',
      label: 'اليوميات',
      icon: (focused: boolean) => (
        <svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24" fill="none">
          <g id="megaphone-01">
            <path
              id="Vector"
              d="M13.8181 4.68994L10.0802 7.05656C9.25187 7.65018 9.23691 7.66058 8.39636 7.66683L5.67759 7.68625C4.11919 7.69745 2.85323 8.97169 2.85323 10.5302V11.3216C2.85323 12.8867 4.12783 14.1616 5.69273 14.1616H8.41702C9.00055 14.1616 9.55987 14.3923 9.97525 14.8029L13.816 18.5897C14.3899 19.1573 15.2672 19.2723 15.9671 18.87C16.6715 18.4651 17.0711 17.6367 16.9244 16.7954L15.9607 11.1074"
              stroke={focused ? colors.BLUE : colors.BORDER}
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              id="Vector_2"
              d="M21.1468 10.8894C21.1468 13.0723 19.3837 14.8354 17.2008 14.8354C15.0179 14.8354 13.2549 13.0723 13.2549 10.8894C13.2549 8.70656 15.0179 6.94354 17.2008 6.94354C19.3837 6.94354 21.1468 8.70656 21.1468 10.8894Z"
              stroke={focused ? colors.BLUE : colors.BORDER}
              strokeWidth="1.7"
            />
            <path
              id="Vector_3"
              d="M6.57169 17.9595C6.37483 20.1651 7.65961 21.0903 9.52166 20.8138"
              stroke={focused ? colors.BLUE : colors.BORDER}
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      ),
    },
    {
      name: 'settings',
      label: 'الإعدادات',
      icon: (focused: boolean) => (
        <SettingIcon focused={focused} size={scale(24)} />
      ),
    },
  ];

  const isActive = (name: string) => {
    if (name === 'home' && pathname === '/home') return true;
    if (name === 'reports' && pathname === '/reports') return true;
    if (name === 'publications' && pathname === '/publications') return true;
    if (name === 'settings' && pathname === '/settings') return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 bottom-navigation-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const focused = isActive(item.name);
          return (
            <Link
              key={item.name}
              href={`/${item.name === 'home' ? 'home' : item.name}`}
              className={`
                flex flex-col items-center justify-center
                px-3 py-2 rounded-lg transition-all duration-200
                ${focused ? 'bg-lightmist' : 'hover:bg-gray-50'}
              `}
            >
              {item.icon(focused)}
              <span
                className={`
                  text-xs mt-1 font-ibm-arabic-semibold
                  ${focused ? 'text-blue' : 'text-border'}
                `}
                style={{ fontSize: `${10 + size}px` }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
