'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = false,
  redirectTo 
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector(state => state.user);

  useEffect(() => {
    // If user is authenticated and trying to access auth pages, redirect to home
    if (isAuthenticated && !requireAuth) {
      router.replace(redirectTo || '/home');
      return;
    }

    // If user is not authenticated and trying to access protected pages, redirect to welcome
    if (!isAuthenticated && requireAuth) {
      router.replace('/');
      return;
    }
  }, [isAuthenticated, requireAuth, router, redirectTo]);

  // Don't render children if redirect is needed
  if (isAuthenticated && !requireAuth) {
    return null;
  }

  if (!isAuthenticated && requireAuth) {
    return null;
  }

  return <>{children}</>;
}
