'use client';

import React from 'react';
import { fonts } from '@/constants/fonts';
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
      className={`max-w-[80%] rounded-2xl p-3 shadow-sm border ${
        mine 
          ? 'ml-auto bg-blue-50 border-blue-100' 
          : 'mr-auto bg-white border-gray-100'
      } group relative cursor-pointer select-none`}
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
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 rounded-full p-1 z-10"
          title="رد على هذه الرسالة"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6M3 10l6-6"/>
          </svg>
        </button>
      )}

      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-700 font-ibm-arabic-semibold">{senderName || 'غير معروف'}</span>
        <span className="text-xs text-gray-400">{formatDate(messageTime)}</span>
      </div>

      {/* عرض الرسالة المرد عليها إن وجدت */}
      {message.Reply && Object.keys(message.Reply).length > 0 && (
        <div className="mb-2 p-2 bg-gray-100 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-gray-600">رد على: {message.Reply.Sender}</div>
            <div className="text-xs text-gray-500">
              {formatShortTime(message.Reply.Date)}
            </div>
          </div>
          <div className="text-sm text-gray-800 truncate">{message.Reply.Data}</div>
        </div>
      )}

      {/* Message Content */}
      <div className="mb-2">
        <p style={{ 
          fontFamily: fonts.IBMPlexSansArabicRegular,
          fontSize: scale(14 + size)
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
