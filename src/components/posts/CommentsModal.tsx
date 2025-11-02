'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppSelector } from '@/store';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';

interface Comment {
  CommentID: number;
  CommentText?: string;
  commentText?: string; // من API الخادم
  CommentDate?: string;
  Date?: string; // من API الخادم
  UserName?: string;
  userName?: string; // من API الخادم
  job?: string;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  postTitle?: string;
  currentCommentCount: number;
  onCommentAdded: () => void;
}

export default function CommentsModal({
  isOpen,
  onClose,
  postId,
  postTitle,
  currentCommentCount,
  onCommentAdded
}: CommentsModalProps) {
  const { t, isRTL } = useTranslation();
  const { user } = useAppSelector((state: any) => state.user);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // دالة لإنشاء لون فريد بناءً على اسم المستخدم
  const getAvatarColor = (name: string) => {
    const colors = [
      '#4F46E5', // بنفسجي
      '#059669', // أخضر
      '#DC2626', // أحمر
      '#7C3AED', // بنفسجي فاتح
      '#EA580C', // برتقالي
      '#0891B2', // أزرق فاتح
      '#BE185D', // وردي
      '#65A30D', // أخضر فاتح
    ];

    if (!name) return colors[0];

    // حساب hash بسيط من الاسم
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    }
  }, [isOpen, postId]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Fetch comments - مطابق لآلية التطبيق المحمول
  const fetchComments = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.get(
        `posts/BringCommentinsert?PostID=${postId}&count=0`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        }
      );

      if (response.status === 200 && response.data?.data) {
        setComments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      Tostget(t('publications.commentsModal.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  // Add comment - مطابق لآلية التطبيق المحمول
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Tostget(t('publications.commentsModal.pleaseWriteComment'));
      return;
    }

    try {
      setSubmitting(true);
      
      // إضافة التعليق محلياً أولاً (مطابق للتطبيق المحمول)
      const tempComment: Comment = {
        CommentID: 0, // معرف مؤقت
        CommentText: newComment.trim(),
        commentText: newComment.trim(),
        CommentDate: new Date().toUTCString(),
        Date: new Date().toUTCString(),
        UserName: user?.data?.userName || '',
        userName: user?.data?.userName || '',
        job: user?.data?.job || ''
      };
      
      setComments(prev => [...prev, tempComment]);
      setNewComment('');

      // إرسال التعليق للخادم
      const response = await axiosInstance.post(
        'posts/Commentinsert',
        {
          PostId: postId,
          commentText: newComment.trim(),
          userName: user?.data?.userName
        },
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        }
      );

      if (response.status === 200) {
        // تحديث التعليقات من الخادم
        await fetchComments();
        onCommentAdded(); // تحديث عدد التعليقات في المنشور
        Tostget(t('publications.commentsModal.commentAdded'));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Tostget(t('publications.commentsModal.commentError'));
      // إزالة التعليق المؤقت في حالة الخطأ
      setComments(prev => prev.filter(c => c.CommentID !== 0));
      setNewComment(newComment); // إعادة النص
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // Format date - بالميلادي بترتيب سنة-شهر-يوم
  const formatDate = (dateString: string) => {
    if (!dateString) return 'تاريخ غير محدد';

    try {
      const date = new Date(dateString);

      // تحقق من صحة التاريخ
      if (isNaN(date.getTime())) {
        return 'تاريخ غير صحيح';
      }

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffMinutes = Math.ceil(diffTime / (1000 * 60));
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // للتواريخ الحديثة، عرض الوقت النسبي
      if (diffMinutes < 1) return 'الآن';
      if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      if (diffDays === 1) return 'أمس';
      if (diffDays < 7) return `منذ ${diffDays} أيام`;

      // للتواريخ الأقدم، عرض التاريخ بالميلادي (سنة-شهر-يوم)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير صحيح';
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <h2 className="text-xl font-ibm-arabic-bold text-gray-900">{t('publications.commentsModal.title')}</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {comments.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-ibm-arabic-semibold text-gray-900 mb-2">{t('publications.commentsModal.noComments')}</h3>
              <p className="text-gray-600">{t('publications.commentsModal.noCommentsMessage')}</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.CommentID} 
                className={`flex space-x-3 rtl:space-x-reverse ${comment.CommentID === 0 ? 'opacity-50' : ''}`}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-ibm-arabic-bold flex-shrink-0"
                  style={{
                    backgroundColor: getAvatarColor((comment.UserName || comment.userName) || '')
                  }}
                >
                  {(comment.UserName || comment.userName)?.charAt(0) || 'م'}
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                      <h4 className="font-ibm-arabic-semibold text-gray-900 text-sm">
                        {comment.UserName || comment.userName || 'مستخدم'}
                      </h4>
                      {comment.job && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                          {comment.job}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800 font-ibm-arabic-regular text-sm leading-relaxed">
                      {comment.CommentText || comment.commentText}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 rtl:space-x-reverse mt-2 px-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.CommentDate || comment.Date || '')}
                    </span>
                    {comment.CommentID === 0 && (
                      <span className="text-xs text-blue-500">{t('publications.commentsModal.sending')}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-3 rtl:space-x-reverse">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-ibm-arabic-bold flex-shrink-0">
              {user?.data?.userName?.charAt(0) || 'م'}
            </div>
            
            {/* Input Area */}
            <div className="flex-1">
              <div className="flex space-x-2 rtl:space-x-reverse">
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('publications.commentsModal.writeComment')}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-ibm-arabic-regular"
                  rows={2}
                  disabled={submitting}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submitting}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-ibm-arabic-medium flex items-center space-x-2 rtl:space-x-reverse"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                      </svg>
                      <span>{t('publications.commentsModal.send')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Click to Close */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );

  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}
