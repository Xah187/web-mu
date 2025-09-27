'use client';

import React, { useRef, useState, useCallback } from 'react';
import { fonts } from '@/constants/fonts';
import { colors } from '@/constants/colors';
import { scale } from '@/utils/responsiveSize';
import AttachmentDropdown from './AttachmentDropdown';
import useWebAttachment from '@/hooks/useWebAttachment';

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSend: () => void;
  replyToMessage?: any;
  setReplyToMessage?: (message: any) => void;
  size: number;
  placeholder?: string;
  showFileUpload?: boolean;
  showEmoji?: boolean;
  onFileUpload?: (fileData: any) => void;
  onEmojiClick?: () => void;
  disabled?: boolean;
}

export default function MessageInput({
  message,
  setMessage,
  onSend,
  replyToMessage,
  setReplyToMessage,
  size,
  placeholder = "اكتب رسالة...",
  showFileUpload = true,
  showEmoji = true,
  onFileUpload,
  onEmojiClick,
  disabled = false
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // استخدام hook الإرفاق الجديد
  const {
    capturePhoto,
    captureVideo,
    selectFile,
    selectVideo,
    shareLocation,
    videoLoading
  } = useWebAttachment();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleEmojiClick = () => {
    if (onEmojiClick) {
      onEmojiClick();
    } else {
      // Default emoji behavior
      setMessage(message + '😊');
    }
  };

  // دوال معالجة الإرفاق الجديدة
  const handleCameraCapture = useCallback(async () => {
    const result = await capturePhoto();
    if (result && onFileUpload) {
      // تحويل البيانات لتتطابق مع التطبيق المحمول
      const fileData = {
        uri: result.uri,
        name: result.name,
        type: result.type,
        size: result.size,
        location: {}
      };
      onFileUpload(fileData);
    }
  }, [capturePhoto, onFileUpload]);

  const handleVideoCapture = useCallback(async () => {
    const result = await captureVideo();
    if (result && onFileUpload) {
      const fileData = {
        uri: result.uri,
        name: result.name,
        type: result.type,
        size: result.size,
        uriImage: result.uriImage,
        location: {}
      };
      onFileUpload(fileData);
    }
  }, [captureVideo, onFileUpload]);

  const handleFileSelect = useCallback(async () => {
    const result = await selectFile();
    if (result && onFileUpload) {
      const fileData = {
        uri: result.uri,
        name: result.name,
        type: result.type,
        size: result.size,
        location: {}
      };
      onFileUpload(fileData);
    }
  }, [selectFile, onFileUpload]);

  const handleVideoSelect = useCallback(async () => {
    const result = await selectVideo();
    if (result && onFileUpload) {
      const fileData = {
        uri: result.uri,
        name: result.name,
        type: result.type,
        size: result.size,
        uriImage: result.uriImage,
        location: {}
      };
      onFileUpload(fileData);
    }
  }, [selectVideo, onFileUpload]);

  const handleLocationShare = useCallback(async () => {
    const result = await shareLocation();
    if (result && onFileUpload) {
      const locationData = {
        type: 'location',
        ...result.data
      };
      onFileUpload(locationData);
    }
  }, [shareLocation, onFileUpload]);

  return (
    <div
      className="flex-shrink-0 border-t shadow-lg"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderTopWidth: '1px'
      }}
    >
      {/* Reply Preview */}
      {replyToMessage && setReplyToMessage && (
        <div
          className="border-t"
          style={{
            padding: `${scale(16)}px`,
            backgroundColor: 'var(--color-primary)' + '20',
            borderColor: 'var(--color-primary)' + '30'
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: `${scale(8)}px` }}
          >
            <span
              className="font-medium"
              style={{
                fontSize: `${scale(13 + size)}px`,
                fontFamily: fonts.IBMPlexSansArabicMedium,
                color: 'var(--color-primary)'
              }}
            >
              رد على: {replyToMessage.sender || replyToMessage.Sender || replyToMessage.userName}
            </span>
            <button
              onClick={() => setReplyToMessage(null)}
              className="transition-colors"
              style={{
                padding: `${scale(4)}px`,
                borderRadius: `${scale(4)}px`,
                fontSize: `${scale(16)}px`,
                color: 'var(--color-primary)'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary-dark)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
            >
              ✕
            </button>
          </div>
          <div
            className="truncate"
            style={{
              fontSize: `${scale(12 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicRegular,
              color: 'var(--color-text-secondary)'
            }}
          >
            {replyToMessage.content || replyToMessage.message || replyToMessage.text}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div
        style={{
          padding: `${scale(20)}px`
        }}
      >
        <div
          className="flex items-end"
          style={{
            gap: `${scale(12)}px`
          }}
        >
          {/* Attachment Dropdown - قائمة الإرفاق المنسدلة */}
          {showFileUpload && (
            <AttachmentDropdown
              onCameraCapture={handleCameraCapture}
              onVideoCapture={handleVideoCapture}
              onFileSelect={handleFileSelect}
              onVideoSelect={handleVideoSelect}
              onLocationShare={handleLocationShare}
              disabled={disabled}
              videoLoading={videoLoading}
            />
          )}

          {/* Emoji Button */}
          {showEmoji && (
            <button
              onClick={handleEmojiClick}
              disabled={disabled}
              className="rounded-full transition-colors disabled:opacity-50"
              style={{
                padding: `${scale(8)}px`,
                borderRadius: `${scale(20)}px`,
                fontSize: `${scale(16)}px`,
                color: 'var(--color-text-secondary)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="إضافة إيموجي"
            >
              😊
            </button>
          )}

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 resize-none leading-6 border rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{
              fontFamily: fonts.IBMPlexSansArabicRegular,
              maxHeight: `${scale(160)}px`,
              fontSize: `${scale(14 + size)}px`,
              padding: `${scale(12)}px ${scale(16)}px`,
              borderColor: 'var(--color-border)',
              borderRadius: `${scale(12)}px`,
              lineHeight: 1.5,
              backgroundColor: 'var(--color-input-background)',
              color: 'var(--color-input-text)'
            }}
          />

          {/* Send Button */}
          <button
            onClick={onSend}
            disabled={!message.trim() || disabled}
            className="text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            style={{
              padding: `${scale(12)}px ${scale(20)}px`,
              backgroundColor: 'var(--color-primary)',
              borderRadius: `${scale(24)}px`,
              fontSize: `${scale(14 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicMedium
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
            aria-label="إرسال"
            title="إرسال"
          >
            إرسال
          </button>
        </div>

        {/* Hidden File Input */}
        {showFileUpload && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={async (e) => {
              const file = e.currentTarget.files?.[0];
              if (!file || !onFileUpload) return;
              const uri = URL.createObjectURL(file);
              const fileData = { uri, name: file.name, type: file.type, size: file.size };
              onFileUpload(fileData);
              // clear for re-selecting same file
              e.currentTarget.value = '';
            }}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
}
