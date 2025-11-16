'use client';

import React from 'react';
import { scale } from '@/utils/responsiveSize';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t, isRTL } = useTranslation();
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

  // حساب الموضع لتجنب الخروج من الشاشة
  const menuWidth = scale(250);
  const menuHeight = scale(240); // تقدير تقريبي لارتفاع القائمة

  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - menuWidth - 10),
    y: Math.min(position.y, window.innerHeight - menuHeight - 10)
  };

  // التأكد من عدم الخروج من الحافة اليسرى أو العلوية
  adjustedPosition.x = Math.max(10, adjustedPosition.x);
  adjustedPosition.y = Math.max(10, adjustedPosition.y);

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
          top: `${adjustedPosition.y}px`,
          left: `${adjustedPosition.x}px`,
          backgroundColor: 'var(--color-card-background)',
          border: '1px solid var(--color-card-border)',
          minWidth: `${scale(200)}px`,
          maxWidth: `${scale(250)}px`,
          padding: `${scale(8)}px 0`,
          direction: isRTL ? 'rtl' : 'ltr'
        }}
      >
        {/* Menu Items */}
        <div>
          {/* رد */}
          <button
            onClick={(e) => handleClick(e, onReply)}
            className="w-full transition-colors"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: `${scale(14)}px`,
              padding: `${scale(12)}px ${scale(16)}px`,
              textAlign: isRTL ? 'right' : 'left'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {t('chat.contextMenu.reply')}
          </button>

          {/* معلومات */}
          <button
            onClick={(e) => handleClick(e, onInfo)}
            className="w-full transition-colors"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: `${scale(14)}px`,
              padding: `${scale(12)}px ${scale(16)}px`,
              textAlign: isRTL ? 'right' : 'left'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {t('chat.contextMenu.info')}
          </button>

          {/* نسخ الرسالة - فقط إذا كان هناك نص */}
          {messageText && (
            <button
              onClick={(e) => handleClick(e, onCopy)}
              className="w-full transition-colors"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: `${scale(14)}px`,
                padding: `${scale(12)}px ${scale(16)}px`,
                textAlign: isRTL ? 'right' : 'left'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {t('chat.contextMenu.copy')}
            </button>
          )}

          {/* حذف الرسالة - فقط إذا كان مسموح */}
          {canDelete && (
            <button
              onClick={(e) => handleClick(e, onDelete)}
              className="w-full transition-colors"
              style={{
                color: 'var(--color-error)',
                fontSize: `${scale(14)}px`,
                padding: `${scale(12)}px ${scale(16)}px`,
                textAlign: isRTL ? 'right' : 'left'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {t('chat.contextMenu.delete')}
            </button>
          )}

          {/* إعادة إرسال - دائماً متاح */}
          <button
            onClick={(e) => handleClick(e, onResend)}
            className="w-full transition-colors"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: `${scale(14)}px`,
              padding: `${scale(12)}px ${scale(16)}px`,
              textAlign: isRTL ? 'right' : 'left'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {t('chat.contextMenu.resend')}
          </button>
        </div>
      </div>
    </>
  );
}

