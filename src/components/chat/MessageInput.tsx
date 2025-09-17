'use client';

import React, { useRef } from 'react';
import { fonts } from '@/constants/fonts';
import { colors } from '@/constants/colors';
import { scale } from '@/utils/responsiveSize';

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
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
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

  return (
    <div
      className="flex-shrink-0 bg-white border-t shadow-lg"
      style={{
        borderColor: colors.BORDERCOLOR,
        borderTopWidth: '1px'
      }}
    >
      {/* Reply Preview */}
      {replyToMessage && setReplyToMessage && (
        <div
          className="bg-blue-50 border-t border-blue-200"
          style={{
            padding: `${scale(16)}px`,
            borderColor: colors.BLUE + '30'
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: `${scale(8)}px` }}
          >
            <span
              className="text-blue-600 font-medium"
              style={{
                fontSize: `${scale(13 + size)}px`,
                fontFamily: fonts.IBMPlexSansArabicMedium
              }}
            >
              رد على: {replyToMessage.sender || replyToMessage.Sender || replyToMessage.userName}
            </span>
            <button
              onClick={() => setReplyToMessage(null)}
              className="text-blue-400 hover:text-blue-600 transition-colors"
              style={{
                padding: `${scale(4)}px`,
                borderRadius: `${scale(4)}px`,
                fontSize: `${scale(16)}px`
              }}
            >
              ✕
            </button>
          </div>
          <div
            className="text-gray-600 truncate"
            style={{
              fontSize: `${scale(12 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicRegular
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
          {/* File Upload Button */}
          {showFileUpload && (
            <button
              onClick={handleFileClick}
              disabled={disabled}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              style={{
                padding: `${scale(8)}px`,
                borderRadius: `${scale(20)}px`
              }}
              title="إرفاق ملف"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  width: `${scale(20)}px`,
                  height: `${scale(20)}px`
                }}
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
          )}

          {/* Emoji Button */}
          {showEmoji && (
            <button
              onClick={handleEmojiClick}
              disabled={disabled}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              style={{
                padding: `${scale(8)}px`,
                borderRadius: `${scale(20)}px`,
                fontSize: `${scale(16)}px`
              }}
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
            className="flex-1 resize-none leading-6 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{
              fontFamily: fonts.IBMPlexSansArabicRegular,
              maxHeight: `${scale(160)}px`,
              fontSize: `${scale(14 + size)}px`,
              padding: `${scale(12)}px ${scale(16)}px`,
              borderColor: colors.BORDERCOLOR,
              borderRadius: `${scale(12)}px`,
              lineHeight: 1.5
            }}
          />

          {/* Send Button */}
          <button
            onClick={onSend}
            disabled={!message.trim() || disabled}
            className="text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            style={{
              padding: `${scale(12)}px ${scale(20)}px`,
              backgroundColor: colors.BLUE,
              borderRadius: `${scale(24)}px`,
              fontSize: `${scale(14 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicMedium
            }}
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
            onChange={onFileUpload}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
}
