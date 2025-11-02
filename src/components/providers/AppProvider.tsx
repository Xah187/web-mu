'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import socketService from '@/lib/socket/socketService';
import { ToastContainer } from '@/components/ui/Toast';
import LanguageProvider from './LanguageProvider';

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  useEffect(() => {
    // Initialize socket connection
    socketService.initializeSocket();

    return () => {
      // Cleanup socket connection
      socketService.closeSocketConnection();
    };
  }, []);

  return (
    <Provider store={store}>
      <LanguageProvider>
        {children}
        <ToastContainer />
      </LanguageProvider>
    </Provider>
  );
}
