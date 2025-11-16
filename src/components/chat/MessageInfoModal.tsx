'use client';

import React from 'react';
import { scale } from '@/utils/responsiveSize';
import { fonts } from '@/constants/fonts';
import { useTranslation } from '@/hooks/useTranslation';

interface MessageInfoModalProps {
  message: any;
  onClose: () => void;
}

export default function MessageInfoModal({ message, onClose }: MessageInfoModalProps) {
  const { t, isRTL } = useTranslation();

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
            padding: `${scale(24)}px`,
            direction: isRTL ? 'rtl' : 'ltr'
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: `${scale(16)}px` }}
          >
            <h2
              className="font-ibm-arabic-semibold"
              style={{
                fontSize: `${scale(18)}px`,
                color: 'var(--color-text-primary)'
              }}
            >
              {t('chat.infoModal.title')}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full transition-colors"
              style={{
                color: 'var(--color-text-secondary)',
                padding: `${scale(8)}px`
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${scale(16)}px` }}>
            {/* المرسل */}
            <div>
              <div
                className="font-ibm-arabic-semibold"
                style={{
                  fontSize: `${scale(13)}px`,
                  color: 'var(--color-text-secondary)',
                  marginBottom: `${scale(8)}px`
                }}
              >
                {t('chat.infoModal.sender')}
              </div>
              <div
                style={{
                  fontSize: `${scale(14)}px`,
                  color: 'var(--color-text-primary)',
                  fontFamily: fonts.IBMPlexSansArabicRegular
                }}
              >
                {message.userName || message.Sender || message.sender || t('chat.bubble.unknownSender')}
              </div>
            </div>

            {/* التاريخ والوقت */}
            <div>
              <div
                className="font-ibm-arabic-semibold"
                style={{
                  fontSize: `${scale(13)}px`,
                  color: 'var(--color-text-secondary)',
                  marginBottom: `${scale(8)}px`
                }}
              >
                {t('chat.infoModal.dateTime')}
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
                  className="font-ibm-arabic-semibold"
                  style={{
                    fontSize: `${scale(13)}px`,
                    color: 'var(--color-text-secondary)',
                    marginBottom: `${scale(8)}px`
                  }}
                >
                  {t('chat.infoModal.message')}
                </div>
                <div
                  className="rounded-lg"
                  style={{
                    fontSize: `${scale(14)}px`,
                    color: 'var(--color-text-primary)',
                    fontFamily: fonts.IBMPlexSansArabicRegular,
                    backgroundColor: 'var(--color-surface-secondary)',
                    wordWrap: 'break-word',
                    padding: `${scale(12)}px`,
                    borderRadius: `${scale(8)}px`
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
                  className="font-ibm-arabic-semibold"
                  style={{
                    fontSize: `${scale(13)}px`,
                    color: 'var(--color-text-secondary)',
                    marginBottom: `${scale(8)}px`
                  }}
                >
                  {t('chat.infoModal.attachment')}
                </div>
                <div
                  className="rounded-lg"
                  style={{
                    fontSize: `${scale(13)}px`,
                    color: 'var(--color-text-primary)',
                    fontFamily: fonts.IBMPlexSansArabicRegular,
                    backgroundColor: 'var(--color-surface-secondary)',
                    padding: `${scale(12)}px`,
                    borderRadius: `${scale(8)}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${scale(8)}px`
                  }}
                >
                  {message.File.name && (
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{t('chat.infoModal.fileName')}: </span>
                      {message.File.name}
                    </div>
                  )}
                  {message.File.type && (
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{t('chat.infoModal.fileType')}: </span>
                      {message.File.type}
                    </div>
                  )}
                  {message.File.size && (
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{t('chat.infoModal.fileSize')}: </span>
                      {getFileSize(message.File.size)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* حالة الرسالة */}
            <div>
              <div
                className="font-ibm-arabic-semibold"
                style={{
                  fontSize: `${scale(13)}px`,
                  color: 'var(--color-text-secondary)',
                  marginBottom: `${scale(8)}px`
                }}
              >
                {t('chat.infoModal.status')}
              </div>
              <div
                className="inline-block rounded-full"
                style={{
                  fontSize: `${scale(12)}px`,
                  fontFamily: fonts.IBMPlexSansArabicRegular,
                  backgroundColor: message.arrived ? 'var(--color-success)' + '20' : 'var(--color-warning)' + '20',
                  color: message.arrived ? 'var(--color-success)' : 'var(--color-warning)',
                  padding: `${scale(6)}px ${scale(12)}px`,
                  borderRadius: `${scale(16)}px`
                }}
              >
                {message.arrived ? t('chat.infoModal.statusSent') : t('chat.infoModal.statusPending')}
              </div>
            </div>

            {/* معرف الرسالة */}
            {message.chatID && (
              <div>
                <div
                  className="font-ibm-arabic-semibold"
                  style={{
                    fontSize: `${scale(13)}px`,
                    color: 'var(--color-text-secondary)',
                    marginBottom: `${scale(8)}px`
                  }}
                >
                  {t('chat.infoModal.messageId')}
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
          <div
            className="flex justify-end"
            style={{ marginTop: `${scale(24)}px` }}
          >
            <button
              onClick={onClose}
              className="rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                fontSize: `${scale(14)}px`,
                fontFamily: fonts.IBMPlexSansArabicSemiBold,
                padding: `${scale(10)}px ${scale(24)}px`,
                borderRadius: `${scale(8)}px`
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              {t('chat.infoModal.close')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

