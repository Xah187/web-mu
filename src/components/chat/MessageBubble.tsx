'use client';

import React from 'react';
import { fonts } from '@/constants/fonts';
import { colors } from '@/constants/colors';
import { scale } from '@/utils/responsiveSize';

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
          ? 'ml-auto bg-blue-50 border-blue-100'
          : 'mr-auto bg-white border-gray-100'
      }`}
      style={{
        padding: `${scale(16)}px`,
        borderRadius: `${scale(16)}px`,
        marginBottom: `${scale(12)}px`,
        border: `1px solid ${mine ? colors.BLUE + '20' : colors.BORDERCOLOR}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
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
          className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gray-100 hover:bg-gray-200 rounded-full z-10 shadow-sm"
          style={{
            top: `${scale(8)}px`,
            left: `${scale(8)}px`,
            padding: `${scale(6)}px`,
            borderRadius: `${scale(20)}px`
          }}
          title="رد على هذه الرسالة"
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
          className="font-ibm-arabic-semibold text-gray-700"
          style={{ fontSize: `${scale(13 + size)}px` }}
        >
          {senderName || 'غير معروف'}
        </span>
        <span
          className="text-gray-400"
          style={{ fontSize: `${scale(11 + size)}px` }}
        >
          {formatDate(messageTime)}
        </span>
      </div>

      {/* عرض الرسالة المرد عليها إن وجدت */}
      {message.Reply && Object.keys(message.Reply).length > 0 && (
        <div
          className="bg-gray-50 rounded-lg border-l-4 border-blue-500"
          style={{
            marginBottom: `${scale(16)}px`,
            padding: `${scale(12)}px`,
            borderRadius: `${scale(8)}px`
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: `${scale(6)}px` }}
          >
            <div
              className="text-gray-600"
              style={{ fontSize: `${scale(11 + size)}px` }}
            >
              رد على: {message.Reply.Sender}
            </div>
            <div
              className="text-gray-500"
              style={{ fontSize: `${scale(10 + size)}px` }}
            >
              {formatShortTime(message.Reply.Date)}
            </div>
          </div>
          <div
            className="text-gray-800 truncate"
            style={{
              fontSize: `${scale(12 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicRegular
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
          color: colors.BLACK,
          margin: 0,
          wordWrap: 'break-word'
        }}>
          {messageContent}
        </p>
      </div>

      {/* File Display */}
      {message.File && Object.keys(message.File).length > 0 && (
        <div className="mb-2">
          {/* File display logic can be added here */}
          <div className="text-xs text-gray-500">📎 ملف مرفق</div>
        </div>
      )}

      {/* Action Buttons for Approval Messages */}
      {showActionButtons && message.type === 'request' && message.status === 'pending' && !mine && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onReject?.(message.id)}
            disabled={actionLoading[message.id]}
            className="flex-1 py-1 px-3 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            {actionLoading[message.id] ? 'جاري...' : 'رفض'}
          </button>
          <button
            onClick={() => onApprove?.(message.id)}
            disabled={actionLoading[message.id]}
            className="flex-1 py-1 px-3 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            {actionLoading[message.id] ? 'جاري...' : 'موافقة'}
          </button>
        </div>
      )}

      {/* Status Badge */}
      {message.status && message.status !== 'pending' && (
        <div className="mt-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              message.status === 'approved'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message.status === 'approved' ? 'تم الموافقة' : 'تم الرفض'}
          </span>
        </div>
      )}

      {/* Message Status Indicator for sent messages */}
      {mine && (
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-400">
            {message.arrived ? '✓✓' : '✓'}
          </span>
        </div>
      )}
    </div>
  );
}
