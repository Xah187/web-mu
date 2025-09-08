'use client';

import React, { useRef } from 'react';
import { fonts } from '@/constants/fonts';
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
    <div className="flex-shrink-0 bg-white border-t border-gray-200">
      {/* Reply Preview */}
      {replyToMessage && setReplyToMessage && (
        <div className="bg-blue-50 border-t border-blue-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-600 font-medium">
              رد على: {replyToMessage.sender || replyToMessage.Sender || replyToMessage.userName}
            </span>
            <button
              onClick={() => setReplyToMessage(null)}
              className="text-blue-400 hover:text-blue-600"
            >
              ✕
            </button>
          </div>
          <div className="text-sm text-gray-600 truncate">
            {replyToMessage.content || replyToMessage.message || replyToMessage.text}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        <div className="flex gap-2 items-end">
          {/* File Upload Button */}
          {showFileUpload && (
            <button
              onClick={handleFileClick}
              disabled={disabled}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="إرفاق ملف"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
          )}

          {/* Emoji Button */}
          {showEmoji && (
            <button
              onClick={handleEmojiClick}
              disabled={disabled}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
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
            className="flex-1 resize-none leading-6 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              fontFamily: fonts.IBMPlexSansArabicRegular, 
              maxHeight: 160,
              fontSize: scale(14 + size)
            }}
          />

          {/* Send Button */}
          <button
            onClick={onSend}
            disabled={!message.trim() || disabled}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="إرسال"
            title="إرسال"
            style={{ 
              fontFamily: fonts.IBMPlexSansArabicMedium, 
              fontSize: scale(14 + size) 
            }}
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
