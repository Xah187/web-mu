'use client';

import React, { useState, useRef, useEffect } from 'react';
import { scale } from '@/utils/responsiveSize';
import { useTranslation } from '@/hooks/useTranslation';

interface AttachmentOption {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
  loading?: boolean;
}

interface AttachmentDropdownProps {
  onCameraCapture: () => void;
  onVideoCapture: () => void;
  onFileSelect: () => void;
  onVideoSelect: () => void;
  onLocationShare: () => void;
  disabled?: boolean;
  videoLoading?: boolean;
}

export default function AttachmentDropdown({
  onCameraCapture,
  onVideoCapture,
  onFileSelect,
  onVideoSelect,
  onLocationShare,
  disabled = false,
  videoLoading = false
}: AttachmentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, isRTL } = useTranslation();

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  // أيقونة الكاميرا
  const CameraIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );

  // أيقونة الفيديو
  const VideoIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
      <polygon points="23,7 16,12 23,17"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  );

  // أيقونة الملف
  const FileIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
    </svg>
  );

  // أيقونة الموقع
  const LocationIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );

  // أيقونة التحميل
  const LoadingIcon = () => (
    <div className="animate-spin" style={{ width: '16px', height: '16px' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
    </div>
  );

  // خيارات الإرفاق (مطابقة للتطبيق المحمول)
  const attachmentOptions: AttachmentOption[] = [
    {
      id: 'camera',
      title: t('chat.attachments.camera.title'),
      subtitle: t('chat.attachments.camera.subtitle'),
      icon: <CameraIcon />,
      action: onCameraCapture
    },
    {
      id: 'video-capture',
      title: t('chat.attachments.videoCapture.title'),
      subtitle: t('chat.attachments.videoCapture.subtitle'),
      icon: <VideoIcon />,
      action: onVideoCapture
    },
    {
      id: 'file',
      title: t('chat.attachments.file.title'),
      subtitle: t('chat.attachments.file.subtitle'),
      icon: <FileIcon />,
      action: onFileSelect
    },
    {
      id: 'video-select',
      title: t('chat.attachments.videoSelect.title'),
      subtitle: t('chat.attachments.videoSelect.subtitle'),
      icon: videoLoading ? <LoadingIcon /> : <VideoIcon />,
      action: onVideoSelect,
      loading: videoLoading
    },
    {
      id: 'location',
      title: t('chat.attachments.location.title'),
      subtitle: t('chat.attachments.location.subtitle'),
      icon: <LocationIcon />,
      action: onLocationShare
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* زر الإرفاق مع سهم */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-1 rounded-full transition-all duration-200 disabled:opacity-50 hover:bg-gray-100"
        style={{
          padding: `${scale(8)}px`,
          borderRadius: `${scale(20)}px`,
          color: 'var(--color-text-secondary)'
        }}
        title={t('chat.attachments.buttonTitle')}
      >
        {/* أيقونة الإرفاق */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            width: `${scale(18)}px`,
            height: `${scale(18)}px`
          }}
        >
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
        
        {/* سهم يتغير الاتجاه */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{
            width: `${scale(14)}px`,
            height: `${scale(14)}px`
          }}
        >
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div
          className="absolute bottom-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
          style={{
            [isRTL ? 'right' : 'left']: '0',
            minWidth: `${scale(200)}px`,
            maxWidth: `${scale(280)}px`,
            animation: 'slideUp 0.2s ease-out',
            marginBottom: `${scale(8)}px`,
            direction: isRTL ? 'rtl' : 'ltr'
          }}
        >
          {attachmentOptions.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.action)}
              disabled={option.loading}
              className="w-full flex items-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderBottom: index < attachmentOptions.length - 1 ? '1px solid #f3f4f6' : 'none',
                textAlign: isRTL ? 'right' : 'left',
                padding: `${scale(12)}px`,
                gap: `${scale(12)}px`
              }}
            >
              {/* الأيقونة */}
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full"
                style={{
                  width: `${scale(36)}px`,
                  height: `${scale(36)}px`,
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              >
                {option.icon}
              </div>

              {/* النص */}
              <div
                className="flex-1"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
              >
                <div
                  className="font-semibold text-gray-900"
                  style={{
                    fontSize: `${scale(14)}px`,
                    fontFamily: 'var(--font-ibm-arabic-semibold)'
                  }}
                >
                  {option.title}
                </div>
                {option.subtitle && (
                  <div
                    className="text-gray-500 text-sm"
                    style={{
                      fontSize: `${scale(12)}px`,
                      fontFamily: 'var(--font-ibm-arabic-regular)'
                    }}
                  >
                    {option.subtitle}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* CSS للأنيميشن */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
