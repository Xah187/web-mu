'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { size } = useAppSelector(state => state.user);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#10b981',
          color: 'white',
          borderColor: '#059669'
        };
      case 'error':
        return {
          backgroundColor: '#ef4444',
          color: 'white',
          borderColor: '#dc2626'
        };
      case 'warning':
        return {
          backgroundColor: '#f59e0b',
          color: 'white',
          borderColor: '#d97706'
        };
      default:
        return {
          backgroundColor: colors.BLUE,
          color: 'white',
          borderColor: '#1d4ed8'
        };
    }
  };

  const getIcon = () => {
    const iconSize = scale(18);

    switch (type) {
      case 'success':
        return (
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div
      className="fixed z-50"
      style={{
        top: `${scale(16)}px`,
        right: `${scale(16)}px`,
        zIndex: 1080
      }}
    >
      <div
        className="flex items-center shadow-lg"
        style={{
          ...typeStyles,
          padding: `${scale(12)}px ${scale(16)}px`,
          borderRadius: `${scale(12)}px`,
          maxWidth: `${scale(320)}px`,
          gap: `${scale(12)}px`,
          border: `1px solid ${typeStyles.borderColor}`,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {getIcon()}
        <span
          className="font-medium flex-1"
          style={{
            fontSize: `${scale(13 + size)}px`,
            fontFamily: fonts.IBMPlexSansArabicMedium,
            lineHeight: 1.4
          }}
        >
          {message}
        </span>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="hover:opacity-75 transition-opacity duration-200"
          style={{
            padding: `${scale(4)}px`,
            borderRadius: `${scale(4)}px`
          }}
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              width: `${scale(14)}px`,
              height: `${scale(14)}px`
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Global toast state
let globalToasts: Array<{ id: number; message: string; type: ToastProps['type'] }> = [];
let globalSetToasts: React.Dispatch<React.SetStateAction<Array<{ id: number; message: string; type: ToastProps['type'] }>>> | null = null;

// Toast Container Component
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastProps['type'] }>>([]);

  React.useEffect(() => {
    globalSetToasts = setToasts;
    return () => {
      globalSetToasts = null;
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div
      className="fixed z-50"
      style={{
        top: `${scale(16)}px`,
        right: `${scale(16)}px`,
        zIndex: 1080,
        display: 'flex',
        flexDirection: 'column',
        gap: `${scale(8)}px`
      }}
    >
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Global counter for unique IDs
let toastIdCounter = 0;

// Hook for using toast
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastProps['type'] }>>([]);

  const showToast = (message: string, type: ToastProps['type'] = 'info') => {
    const id = Date.now() + (++toastIdCounter); // Ensure uniqueness
    const newToast = { id, message, type };
    
    // Update global toasts if available
    if (globalSetToasts) {
      globalSetToasts(prev => [...prev, newToast]);
    } else {
      // Fallback to local state
      setToasts(prev => [...prev, newToast]);
    }
  };

  const removeToast = (id: number) => {
    if (globalSetToasts) {
      globalSetToasts(prev => prev.filter(toast => toast.id !== id));
    } else {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }
  };

  const LocalToastContainer = () => (
    <div
      className="fixed z-50"
      style={{
        top: `${scale(16)}px`,
        right: `${scale(16)}px`,
        zIndex: 1080,
        display: 'flex',
        flexDirection: 'column',
        gap: `${scale(8)}px`
      }}
    >
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return { showToast, ToastContainer: LocalToastContainer };
};

// Tostget function to match the original app
export const Tostget = (message: string, type: ToastProps['type'] = 'info') => {
  const id = Date.now() + (++toastIdCounter); // Ensure uniqueness
  const newToast = { id, message, type };
  
  // Update global toasts if available
  if (globalSetToasts) {
    globalSetToasts(prev => [...prev, newToast]);
  } else {
    // Fallback to browser alert if no global toast container
    alert(message);
  }
};

export default Toast;