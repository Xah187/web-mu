'use client';

import React from 'react';
import { fonts } from '@/constants/fonts';
import { scale } from '@/utils/responsiveSize';
import { URLFIL } from '@/lib/api/axios';
import { useTranslation } from '@/hooks/useTranslation';

interface MessageBubbleProps {
  message: any;
  currentUserName: string;
  size: number;
  onReply?: (message: any) => void;
  onLongPress?: (message: any) => void;
  onLongPressEnd?: () => void;
  formatDate: (date: string) => string;
  formatShortTime: (date: string) => string;
  showActionButtons?: boolean;
  onApprove?: (messageId: number) => void;
  onReject?: (messageId: number) => void;
  actionLoading?: { [key: number]: boolean };
}

export default function MessageBubble({
  message,
  currentUserName,
  size,
  onReply,
  onLongPress,
  onLongPressEnd,
  formatDate,
  formatShortTime,
  showActionButtons = false,
  onApprove,
  onReject,
  actionLoading = {}
}: MessageBubbleProps) {
  const { t } = useTranslation();
  const senderName = message.userName ?? message.Sender ?? message.sender ?? '';
  const mine = (senderName?.toLowerCase?.() || '') === (currentUserName?.toLowerCase?.() || '');
  const messageContent = message.message || message.text || message.content || '';
  const messageTime = message.timeminet || message.Date || message.timestamp || '';

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReply?.(message);
  };

  const handleLongPressStart = () => {
    onLongPress?.(message);
  };

  const handleLongPressEnd = () => {
    onLongPressEnd?.();
  };

  return (
    <div
      className={`max-w-[80%] group relative cursor-pointer select-none transition-all duration-200 hover:shadow-md ${
        mine
          ? 'ml-auto'
          : 'mr-auto'
      }`}
      style={{
        padding: `${scale(16)}px`,
        borderRadius: `${scale(16)}px`,
        marginBottom: `${scale(12)}px`,
        backgroundColor: 'var(--color-card-background)',
        border: `1px solid var(--color-card-border)`,
        boxShadow: 'var(--shadow-sm)',
        color: 'var(--color-text-primary)'
      }}
      onDoubleClick={() => onReply?.(message)}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
    >
      {/* Reply Button - يظهر عند hover */}
      {onReply && (
        <button
          onClick={handleReply}
          className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full z-10 shadow-sm"
          style={{
            top: `${scale(8)}px`,
            left: `${scale(8)}px`,
            padding: `${scale(6)}px`,
            borderRadius: `${scale(20)}px`,
            backgroundColor: 'var(--color-surface-secondary)',
            color: 'var(--color-text-secondary)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
          title={t('chat.bubble.replyTooltip')}
        >
          <svg width={scale(16)} height={scale(16)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6M3 10l6-6"/>
          </svg>
        </button>
      )}

      <div
        className="flex items-center justify-between"
        style={{ marginBottom: `${scale(12)}px` }}
      >
        <span
          className="font-ibm-arabic-semibold"
          style={{
            fontSize: `${scale(13 + size)}px`,
            color: 'var(--color-text-primary)'
          }}
        >
          {senderName || t('chat.bubble.unknownSender') }
        </span>
        <span
          style={{
            fontSize: `${scale(11 + size)}px`,
            color: 'var(--color-text-tertiary)'
          }}
        >
          {formatDate(messageTime)}
        </span>
      </div>

      {/* عرض الرسالة المرد عليها إن وجدت */}
      {message.Reply && Object.keys(message.Reply).length > 0 && (
        <div
          className="rounded-lg border-l-4"
          style={{
            marginBottom: `${scale(16)}px`,
            padding: `${scale(12)}px`,
            borderRadius: `${scale(8)}px`,
            backgroundColor: 'var(--color-surface-secondary)',
            borderLeftColor: 'var(--color-primary)'
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: `${scale(6)}px` }}
          >
            <div
              style={{
                fontSize: `${scale(11 + size)}px`,
                color: 'var(--color-text-secondary)'
              }}
            >
              {t('chat.bubble.replyToPrefix')}: {message.Reply.Sender}
            </div>
            <div
              style={{
                fontSize: `${scale(10 + size)}px`,
                color: 'var(--color-text-tertiary)'
              }}
            >
              {formatShortTime(message.Reply.Date)}
            </div>
          </div>
          <div
            className="truncate"
            style={{
              fontSize: `${scale(12 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicRegular,
              color: 'var(--color-text-primary)'
            }}
          >
            {message.Reply.Data}
          </div>
        </div>
      )}

      {/* Message Content */}
      <div style={{ marginBottom: `${scale(16)}px` }}>
        <p style={{
          fontFamily: fonts.IBMPlexSansArabicRegular,
          fontSize: `${scale(14 + size)}px`,
          lineHeight: 1.6,
          color: 'var(--color-text-primary)',
          margin: 0,
          wordWrap: 'break-word'
        }}>
          {messageContent}
        </p>
      </div>

      {/* File Display */}
      {message.File && Object.keys(message.File).length > 0 && (() => {
        // Helper function to get the correct file URL (matching mobile app logic)
        const getFileUrl = () => {
          const uri = message.File.uri || message.File.url;
          const name = message.File.name;
          const arrived = message.arrived;

          // If message hasn't arrived yet (still uploading), use local URI if it's a valid blob/data/http URL
          if (!arrived && uri && (uri.startsWith('blob:') || uri.startsWith('data:') || uri.startsWith('http'))) {
            return uri;
          }

          // If message has arrived (uploaded to server), use URLFIL with filename
          if (arrived && name) {
            return `${URLFIL}/${name}`;
          }

          // If uri is a valid blob/data/http URL, use it directly
          if (uri && (uri.startsWith('blob:') || uri.startsWith('data:') || uri.startsWith('http'))) {
            return uri;
          }

          // Final fallback: use URLFIL with name if available
          if (name) {
            return `${URLFIL}/${name}`;
          }

          return uri || '';
        };

        const fileUrl = getFileUrl();

        return (
          <div className="mb-2">
            {String(message.File?.type || '').startsWith('image/') && fileUrl ? (
              <img
                src={fileUrl}
                alt={message.File?.name || 'image'}
                className="rounded-lg max-w-full max-h-64 cursor-zoom-in"
                onClick={() => {
                  if (fileUrl) window.open(fileUrl, '_blank');
                }}
              />
            ) : String(message.File?.type || '').startsWith('video/') && fileUrl ? (
              <video
                src={fileUrl}
                controls
                className="rounded-lg max-w-full max-h-64"
              />
            ) : message.File?.type === 'location' && message.File?.latitude && message.File?.longitude ? (
              <a
                href={`https://www.google.com/maps?q=${message.File.latitude},${message.File.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-sm"
                style={{ color: 'var(--color-primary)' }}
              >
                {t('chat.bubble.viewLocation')}
              </a>
            ) : (
              <a
                href={`${URLFIL}/${message.File?.name}`}
                target="_blank"
                rel="noreferrer"
                download={message.File?.name}
                className="text-xs flex items-center gap-2 hover:underline cursor-pointer p-2 rounded-lg transition-colors"
                style={{
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-surface-secondary)'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
              >
                <span>📎</span>
                <span>{message.File?.name || t('chat.bubble.attachedFile')}</span>
                <span style={{ color: 'var(--color-text-tertiary)' }}>{message.File?.type ? `(${message.File.type})` : ''}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
              </a>
            )}
          </div>
        );
      })()}

      {/* Action Buttons for Approval Messages */}
      {showActionButtons && message.type === 'request' && message.status === 'pending' && !mine && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onReject?.(message.id)}
            disabled={actionLoading[message.id]}
            className="flex-1 py-1 px-3 text-xs rounded-lg transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-error)' + '20',
              color: 'var(--color-error)',
              border: '1px solid var(--color-error)'
            }}
          >
            {actionLoading[message.id] ? t('chat.bubble.loading') : t('chat.bubble.reject')}
          </button>
          <button
            onClick={() => onApprove?.(message.id)}
            disabled={actionLoading[message.id]}
            className="flex-1 py-1 px-3 text-xs rounded-lg transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-success)' + '20',
              color: 'var(--color-success)',
              border: '1px solid var(--color-success)'
            }}
          >
            {actionLoading[message.id] ? t('chat.bubble.loading') : t('chat.bubble.approve')}
          </button>
        </div>
      )}

      {/* Status Badge */}
      {message.status && message.status !== 'pending' && (
        <div className="mt-2">
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: message.status === 'approved'
                ? 'var(--color-success)' + '20'
                : 'var(--color-error)' + '20',
              color: message.status === 'approved'
                ? 'var(--color-success)'
                : 'var(--color-error)'
            }}
          >
            {message.status === 'approved' ? t('chat.bubble.statusApproved') : t('chat.bubble.statusRejected')}
          </span>
        </div>
      )}

      {/* Message Status Indicator for sent messages */}
      {mine && (
        <div className="flex justify-end mt-1">
          <span className="text-xs theme-text-tertiary" style={{ color: 'var(--color-text-tertiary)' }}>
            {message.arrived ? '✓✓' : '✓'}
          </span>
        </div>
      )}
    </div>
  );
}
