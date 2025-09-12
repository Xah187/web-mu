'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';

export default function useNavigationHistory() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector(state => state.user);

  useEffect(() => {
    // Clear authentication history when user logs in successfully
    if (isAuthenticated) {
      // Replace the entire history stack to prevent going back to auth pages
      if (typeof window !== 'undefined') {
        // Keep the current path instead of forcing /home
        const currentPath = window.location.pathname;
        const isDashboardPath = currentPath.startsWith('/home') ||
                               currentPath.startsWith('/reports') ||
                               currentPath.startsWith('/publications') ||
                               currentPath.startsWith('/members') ||
                               currentPath.startsWith('/settings');

        // Only replace with /home if we're not already on a dashboard page
        if (!isDashboardPath) {
          window.history.replaceState(null, '', '/home');
        } else {
          // Just replace the current state to clear auth history
          window.history.replaceState(null, '', currentPath);
        }

        // Prevent back navigation to auth pages
        const handlePopState = (event: PopStateEvent) => {
          const currentPath = window.location.pathname;

          // If user tries to go back from dashboard pages, prevent it
          if (currentPath.startsWith('/home') ||
              currentPath.startsWith('/reports') ||
              currentPath.startsWith('/publications') ||
              currentPath.startsWith('/members') ||
              currentPath.startsWith('/settings')) {

            // Push the current state back to prevent navigation
            window.history.pushState(null, '', currentPath);
          }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
          window.removeEventListener('popstate', handlePopState);
        };
      }
    }
  }, [isAuthenticated]);

  const navigateWithReplace = (path: string) => {
    router.replace(path);
  };

  const navigateWithPush = (path: string) => {
    router.push(path);
  };

  return {
    navigateWithReplace,
    navigateWithPush
  };
}
