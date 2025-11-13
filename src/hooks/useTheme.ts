'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setTheme } from '@/store/slices/userSlice';
import { themes, type ThemeMode } from '@/constants/themes';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector(state => state.user);
  
  const currentTheme = themes[theme];

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;

    // Apply all theme colors as CSS variables
    Object.entries(currentTheme).forEach(([key, value]) => {
      const cssVarName = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });

    // Apply theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);

    // Store theme preference
    localStorage.setItem('theme', theme);
  }, [theme, currentTheme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  const setThemeMode = (newTheme: ThemeMode) => {
    dispatch(setTheme(newTheme));
  };

  return {
    theme,
    currentTheme,
    toggleTheme,
    setThemeMode,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};
