'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { setUser } from '@/store/slices/userSlice';
import useNavigationHistory from '@/hooks/useNavigationHistory';
import ResponsiveNavigation from '@/components/layout/ResponsiveNavigation';
import ThemeProvider from '@/components/providers/ThemeProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.user);
  const [isChecking, setIsChecking] = useState(true);
  
  // Use navigation history hook to prevent going back to auth pages
  useNavigationHistory();

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.accessToken && userData.data?.userName) {
            if (!isAuthenticated) {
              dispatch(setUser(userData));
            }
            setIsChecking(false);
            return;
          }
        } catch (error) {
          // Corrupted data
        }
      }

      // No valid authentication, redirect to welcome page
      router.replace('/');
      setIsChecking(false);
    };

    checkAuth();
  }, [dispatch, isAuthenticated, router]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-home flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-black font-cairo-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen dashboard-layout" style={{ backgroundColor: 'var(--color-background)' }}>
        {/* Responsive Navigation */}
        <ResponsiveNavigation />

        {/* Main Content with responsive spacing */}
        <main
          className="min-h-screen responsive-content"
          style={{
            paddingBottom: 'var(--content-padding-bottom)',
            paddingTop: 'var(--safe-area-top)'
          }}
        >
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
