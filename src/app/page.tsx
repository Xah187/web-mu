'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/slices/userSlice';

export default function WelcomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize app and redirect
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if user is already logged in
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        try {
          const userData = JSON.parse(storedUser);
          // Validate that user data has required fields
          if (userData.accessToken && userData.data?.userName) {
            dispatch(setUser(userData));
            router.replace('/home');
            return;
          } else {
            // Invalid user data, clear it
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } catch (parseError) {
          // Corrupted data, clear it
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }

      // Redirect directly to login page
      router.replace('/login');
    } catch (error) {
      console.error('Initialization error:', error);
      router.replace('/login');
    }
  };

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-2xl font-ibm-arabic-bold text-blue-600">
          جاري التحميل...
        </div>
        <div className="flex justify-center space-x-1 space-x-reverse">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}