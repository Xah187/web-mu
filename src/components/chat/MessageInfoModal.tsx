'use client';

import React from 'react';
import { scale } from '@/utils/responsiveSize';
import { fonts } from '@/constants/fonts';

interface MessageInfoModalProps {
  message: any;
  onClose: () => void;
}

export default function MessageInfoModal({ message, onClose }: MessageInfoModalProps) {
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  const getFileSize = (bytes: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        {/* Modal */}
        <div
          className="rounded-lg shadow-xl max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'var(--color-card-background)',
            border: '1px solid var(--color-card-border)',
            padding: `${scale(24)}px`
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-ibm-arabic-semibold"
              style={{
                fontSize: `${scale(18)}px`,
                color: 'var(--color-text-primary)'
              }}
            >
              معلومات الرسالة
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors"
              style={{
                color: 'var(--color-text-secondary)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-3">
            {/* المرسل */}
            <div>
              <div
                className="font-ibm-arabic-semibold mb-1"
                style={{
                  fontSize: `${scale(13)}px`,
                  color: 'var(--color-text-secondary)'
                }}
              >
                المرسل
              </div>
              <div
                style={{
                  fontSize: `${scale(14)}px`,
                  color: 'var(--color-text-primary)',
                  fontFamily: fonts.IBMPlexSansArabicRegular
                }}
              >
                {message.userName || message.Sender || message.sender || 'غير معروف'}
              </div>
            </div>

            {/* التاريخ والوقت */}
            <div>
              <div
                className="font-ibm-arabic-semibold mb-1"
                style={{
                  fontSize: `${scale(13)}px`,
                  color: 'var(--color-text-secondary)'
                }}
              >
                التاريخ والوقت
              </div>
              <div
                style={{
                  fontSize: `${scale(14)}px`,
                  color: 'var(--color-text-primary)',
                  fontFamily: fonts.IBMPlexSansArabicRegular
                }}
              >
                {formatDateTime(message.timeminet || message.Date || message.timestamp || '')}
              </div>
            </div>

            {/* الرسالة */}
            {(message.message || message.text || message.content) && (
              <div>
                <div
                  className="font-ibm-arabic-semibold mb-1"
                  style={{
                    fontSize: `${scale(13)}px`,
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  الرسالة
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    fontSize: `${scale(14)}px`,
                    color: 'var(--color-text-primary)',
                    fontFamily: fonts.IBMPlexSansArabicRegular,
                    backgroundColor: 'var(--color-surface-secondary)',
                    wordWrap: 'break-word'
                  }}
                >
                  {message.message || message.text || message.content}
                </div>
              </div>
            )}

            {/* معلومات الملف */}
            {message.File && Object.keys(message.File).length > 0 && (
              <div>
                <div
                  className="font-ibm-arabic-semibold mb-1"
                  style={{
                    fontSize: `${scale(13)}px`,
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  الملف المرفق
                </div>
                <div
                  className="p-3 rounded-lg space-y-2"
                  style={{
                    fontSize: `${scale(13)}px`,
                    color: 'var(--color-text-primary)',
                    fontFamily: fonts.IBMPlexSansArabicRegular,
                    backgroundColor: 'var(--color-surface-secondary)'
                  }}
                >
                  {message.File.name && (
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>الاسم: </span>
                      {message.File.name}
                    </div>
                  )}
                  {message.File.type && (
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>النوع: </span>
                      {message.File.type}
                    </div>
                  )}
                  {message.File.size && (
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>الحجم: </span>
                      {getFileSize(message.File.size)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* حالة الرسالة */}
            <div>
              <div
                className="font-ibm-arabic-semibold mb-1"
                style={{
                  fontSize: `${scale(13)}px`,
                  color: 'var(--color-text-secondary)'
                }}
              >
                الحالة
              </div>
              <div
                className="inline-block px-3 py-1 rounded-full"
                style={{
                  fontSize: `${scale(12)}px`,
                  fontFamily: fonts.IBMPlexSansArabicRegular,
                  backgroundColor: message.arrived ? 'var(--color-success)' + '20' : 'var(--color-warning)' + '20',
                  color: message.arrived ? 'var(--color-success)' : 'var(--color-warning)'
                }}
              >
                {message.arrived ? 'تم الإرسال' : 'قيد الإرسال'}
              </div>
            </div>

            {/* معرف الرسالة */}
            {message.chatID && (
              <div>
                <div
                  className="font-ibm-arabic-semibold mb-1"
                  style={{
                    fontSize: `${scale(13)}px`,
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  معرف الرسالة
                </div>
                <div
                  style={{
                    fontSize: `${scale(12)}px`,
                    color: 'var(--color-text-tertiary)',
                    fontFamily: 'monospace'
                  }}
                >
                  {message.chatID}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                fontSize: `${scale(14)}px`,
                fontFamily: fonts.IBMPlexSansArabicSemiBold
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

