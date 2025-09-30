'use client';

import React from 'react';
import { scale } from '@/utils/responsiveSize';

interface MessageContextMenuProps {
  message: any;
  position: { x: number; y: number };
  onClose: () => void;
  onReply: () => void;
  onInfo: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onResend: () => void;
  currentUserName: string;
  userJob?: string;
}

export default function MessageContextMenu({
  message,
  position,
  onClose,
  onReply,
  onInfo,
  onCopy,
  onDelete,
  onResend,
  currentUserName,
  userJob = ''
}: MessageContextMenuProps) {
  const senderName = message.userName ?? message.Sender ?? message.sender ?? '';
  const mine = (senderName?.toLowerCase?.() || '') === (currentUserName?.toLowerCase?.() || '');
  const messageText = message.message || message.text || message.content || '';
  const messageDate = new Date(message.timeminet || message.Date || new Date());
  const today = new Date();
  const isSameDay = messageDate.getDate() === today.getDate() && 
                    messageDate.getMonth() === today.getMonth() && 
                    messageDate.getFullYear() === today.getFullYear();
  
  // يمكن حذف الرسالة إذا:
  // 1. المستخدم هو المرسل ونفس اليوم
  // 2. أو الرسالة لم تصل بعد
  // 3. أو المستخدم Admin
  const canDelete = (mine && isSameDay) || !message.arrived || !message.chatID || userJob === 'Admin';

  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      />
      
      {/* Context Menu */}
      <div
        className="fixed z-50 rounded-lg shadow-lg"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          backgroundColor: 'var(--color-card-background)',
          border: '1px solid var(--color-card-border)',
          minWidth: `${scale(200)}px`,
          maxWidth: `${scale(250)}px`
        }}
      >
        {/* Menu Items */}
        <div className="py-2">
          {/* رد */}
          <button
            onClick={(e) => handleClick(e, onReply)}
            className="w-full text-right px-4 py-2 transition-colors"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: `${scale(14)}px`
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            رد
          </button>

          {/* معلومات */}
          <button
            onClick={(e) => handleClick(e, onInfo)}
            className="w-full text-right px-4 py-2 transition-colors"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: `${scale(14)}px`
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            معلومات
          </button>

          {/* نسخ الرسالة - فقط إذا كان هناك نص */}
          {messageText && (
            <button
              onClick={(e) => handleClick(e, onCopy)}
              className="w-full text-right px-4 py-2 transition-colors"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: `${scale(14)}px`
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              نسخ الرسالة
            </button>
          )}

          {/* حذف الرسالة - فقط إذا كان مسموح */}
          {canDelete && (
            <button
              onClick={(e) => handleClick(e, onDelete)}
              className="w-full text-right px-4 py-2 transition-colors"
              style={{
                color: 'var(--color-error)',
                fontSize: `${scale(14)}px`
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              حذف الرسالة
            </button>
          )}

          {/* إعادة إرسال - دائماً متاح */}
          <button
            onClick={(e) => handleClick(e, onResend)}
            className="w-full text-right px-4 py-2 transition-colors"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: `${scale(14)}px`
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            إعادة إرسال
          </button>
        </div>
      </div>
    </>
  );
}

