'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';

import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { Tostget } from '@/components/ui/Toast';
import axiosInstance from '@/lib/api/axios';
import socketService from '@/lib/socket/socketService';

// This page represents the "اعتمادات" section from mobile app
// It's designed as a chat interface like in the mobile app

interface ChatMessage {
  id: number;
  type: 'request' | 'response' | 'system';
  content?: string;
  message?: string;
  requestType?: 'expense' | 'leave' | 'overtime' | 'purchase' | 'project_change';
  amount?: number;
  sender?: string;
  userName?: string;
  timestamp?: string;
  Date?: string;
  status?: 'pending' | 'approved' | 'rejected';
  priority?: 'low' | 'medium' | 'high';
  isFromUser?: boolean;
  projectId?: number;
  stageId?: number | string;
  chatId?: number;
  File?: any;
  Reply?: any;
}

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

export default function ApprovalsPage() {
  const router = useRouter();
  const { user, size } = useAppSelector(state => state.user);

  // مطابق للتطبيق الأساسي: استخدام السجل التجاري كـ ProjectID لغرف خاصة (اعتمادات/قرارات/استشارات)
  const approvalsProjectId = parseInt((user as any)?.data?.CommercialRegistrationNumber as any) || 0;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{[key: number]: boolean}>({});
  const [newMessage, setNewMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [uploading, setUploading] = useState<{ idSendr: string; progress: number; kind: 'image' | 'video' | 'file' | 'text'; } | null>(null);
  const [preview, setPreview] = useState<{ type: 'image' | 'video'; url: string } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    initializeSocket();

    // Cleanup عند إلغاء تحميل المكون
    return () => {
      socketService.removeListener('received_message');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeSocket = async () => {
    try {
      // تهيئة Socket مثل التطبيق المحمول
      await socketService.initializeSocket();

      // الانضمام لغرفة الاعتمادات مثل التطبيق المحمول
      // استخدام نفس تنسيق الغرف المستخدم في التطبيق
      const room = `${approvalsProjectId}:اعتمادات`; // مطابق للتطبيق: الانضمام لغرفة السجل التجاري:اعتمادات
      socketService.emit('newRome', room);

      // استقبال الرسائل الجديدة مثل التطبيق المحمول
      socketService.on('received_message', (msg: any) => {
        try {
          // التحقق من أن الرسالة خاصة بالاعتمادات
          if (msg.StageID === 'اعتمادات' || msg.message?.includes('طلب') || msg.message?.includes('اعتماد')) {
            // تحويل الرسالة المستقبلة إلى تنسيق ChatMessage
            const newMessage: ChatMessage = {
              id: Date.now(), // استخدام timestamp كـ ID مؤقت
              type: msg.message?.includes('طلب') || msg.message?.includes('اعتماد') ? 'request' : 'response',
              content: msg.message || 'رسالة فارغة',
              sender: msg.Sender || 'مستخدم',
              timestamp: msg.timeminet || new Date().toISOString(),
              status: 'pending',
              isFromUser: msg.Sender === user?.data?.userName,
              chatId: msg.chatID,
              projectId: msg.ProjectID,
              stageId: msg.StageID
            };

            // إضافة الرسالة للقائمة إذا لم تكن من المستخدم الحالي
            if (!newMessage.isFromUser) {
              setMessages(prev => [...prev, newMessage]);
            }
          }
        } catch (error) {
          console.error('Error processing received message:', error);
        }
      });

    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);

      // جلب رسائل الاعتمادات مثل صفحة الشات العادية
      try {
        console.log('Fetching approval messages...');
        const res = await axiosInstance.get('/Chate', {
          params: {
            ProjectID: approvalsProjectId, // مطابق للتطبيق: السجل التجاري
            StageID: 'اعتمادات',
            lengthChat: 0,
          },
        });

        console.log('API Response:', res);
        const data = res.data?.data || res.data || [];
        console.log('Approval messages data:', data); // للتحقق من البيانات

        // تحويل البيانات إلى تنسيق ChatMessage
        const normalizedMessages: ChatMessage[] = Array.isArray(data) ? data.map((msg: any) => {
          // تطبيع البيانات مثل صفحة الشات
          let File = msg.File;
          let Reply = msg.Reply;
          try { if (typeof File === 'string') File = JSON.parse(File); } catch {}
          try { if (typeof Reply === 'string') Reply = JSON.parse(Reply); } catch {}

          return {
            id: msg.chatID || Date.now() + Math.random(),
            type: (msg.message?.includes('طلب') || msg.message?.includes('اعتماد') ? 'request' : 'response') as 'request' | 'response' | 'system',
            content: msg.message || 'رسالة فارغة',
            requestType: 'project_change' as 'expense' | 'leave' | 'overtime' | 'purchase' | 'project_change',
            sender: msg.Sender || 'مستخدم',
            timestamp: msg.timeminet || new Date().toISOString(),
            status: 'pending' as 'pending' | 'approved' | 'rejected',
            priority: 'medium' as 'low' | 'medium' | 'high',
            isFromUser: msg.Sender === user?.data?.userName,
            projectId: msg.ProjectID,
            stageId: msg.StageID,
            chatId: msg.chatID
          };
        }) : [];

        // إضافة رسالة ترحيب إذا لم توجد رسائل
        if (normalizedMessages.length === 0) {
          normalizedMessages.unshift({
            id: 1,
            type: 'system',
            content: 'مرحباً بك في قسم الاعتمادات. لا توجد طلبات معلقة حالياً.',
            sender: 'النظام',
            timestamp: new Date().toISOString(),
            isFromUser: false
          });
        } else {
          // إضافة رسالة ترحيب في البداية
          normalizedMessages.unshift({
            id: 0,
            type: 'system',
            content: 'مرحباً بك في قسم الاعتمادات. يمكنك هنا مراجعة الطلبات والموافقة عليها أو رفضها.',
            sender: 'النظام',
            timestamp: new Date().toISOString(),
            isFromUser: false
          });
        }

        setMessages(normalizedMessages);

      } catch (error) {
        console.error('Error fetching approval messages:', error);

        // محاولة جلب البيانات من مصادر أخرى
        try {
          console.log('Trying alternative methods...');

          // محاولة 1: استخدام filterTableChat
          const filterRes = await axiosInstance.get('/chate/filterTableChat', {
            params: {
              userName: '',
              count: 0,
              ProjectID: 0,
              Type: 'اعتمادات'
            }
          });

          const filterData = filterRes.data?.data || [];
          console.log('Filter data:', filterData);

          if (filterData.length > 0) {
            const filterMessages: ChatMessage[] = filterData.map((msg: any) => ({
              id: msg.chatID || Date.now() + Math.random(),
              type: (msg.message?.includes('طلب') || msg.message?.includes('اعتماد') ? 'request' : 'response') as 'request' | 'response' | 'system',
              content: msg.message || 'رسالة فارغة',
              requestType: 'project_change' as 'expense' | 'leave' | 'overtime' | 'purchase' | 'project_change',
              sender: msg.Sender || 'مستخدم',
              timestamp: msg.timeminet || new Date().toISOString(),
              status: 'pending' as 'pending' | 'approved' | 'rejected',
              priority: 'medium' as 'low' | 'medium' | 'high',
              isFromUser: msg.Sender === user?.data?.userName,
              projectId: msg.ProjectID,
              stageId: msg.StageID,
              chatId: msg.chatID
            }));

            setMessages(filterMessages);
            return;
          }

        } catch (filterError) {
          console.error('Filter method also failed:', filterError);
        }

        // في حالة فشل جميع الطرق، استخدام بيانات افتراضية
        const fallbackMessages: ChatMessage[] = [
          {
            id: 1,
            type: 'system',
            content: 'مرحباً بك في قسم الاعتمادات. لا توجد طلبات معلقة حالياً.',
            sender: 'النظام',
            timestamp: new Date().toISOString(),
            isFromUser: false
          }
        ];

        setMessages(fallbackMessages);
        Tostget('تعذر تحميل البيانات، يتم عرض البيانات المحلية');
      }

    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    // إنشاء ID فريد للرسالة مثل التطبيق المحمول
    const generateID = () => Math.random().toString(36).substring(2, 10);
    const idSender = `${user?.data?.PhoneNumber || 'web'}${generateID()}`;

    // إعداد Reply object إذا كان هناك رد على رسالة
    const replyObject = replyToMessage ? {
      Data: replyToMessage.content || replyToMessage.message || '',
      Date: replyToMessage.timestamp || '',
      type: 'اعتمادات',
      Sender: replyToMessage.sender || '',
    } : {};

    const messageToSend: ChatMessage = {
      id: messages.length + 1,
      type: 'response',
      content: newMessage,
      sender: user?.data?.userName || 'أنت',
      timestamp: new Date().toISOString(),
      isFromUser: true,
      Reply: Object.keys(replyObject).length > 0 ? replyObject : undefined
    };

    // إضافة الرسالة للواجهة فوراً (Optimistic UI)
    setMessages(prev => [...prev, messageToSend]);
    setNewMessage('');
    setReplyToMessage(null);

    // إرسال الرسالة عبر Socket.IO مثل التطبيق المحمول
    try {
      // تهيئة Socket إذا لم يكن مهيأ
      await socketService.initializeSocket();

      // الانضمام لغرفة الاعتمادات مثل التطبيق المحمول
      const room = `${approvalsProjectId}:اعتمادات`;
      socketService.emit('newRome', room);

      // إنشاء كائن الرسالة مثل التطبيق المحمول
      const socketMessage = {
        idSendr: idSender,
        ProjectID: approvalsProjectId,
        StageID: 'اعتمادات',
        Sender: user?.data?.userName || 'مستخدم',
        message: newMessage,
        timeminet: new Date().toISOString(),
        File: {},
        Reply: {},
        arrived: false,
        kind: 'new'
      };

      // إرسال الرسالة عبر Socket
      socketService.emit('send_message', socketMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      Tostget('فشل في إرسال الرسالة');
    }
  };

  const handleApproval = async (messageId: number, action: 'approve' | 'reject') => {
    setActionLoading(prev => ({ ...prev, [messageId]: true }));

    try {
      // العثور على الرسالة المحددة
      const targetMessage = messages.find(msg => msg.id === messageId);
      if (!targetMessage) {
        throw new Error('Message not found');
      }

      // تحديث حالة الرسالة
      setMessages(prev => prev.map(message =>
        message.id === messageId
          ? { ...message, status: action === 'approve' ? 'approved' : 'rejected' }
          : message
      ));

      // إرسال رد الاعتماد عبر Socket مثل التطبيق المحمول
      const generateID = () => Math.random().toString(36).substring(2, 10);
      const idSender = `${user?.data?.PhoneNumber || 'web'}${generateID()}`;

      const approvalMessage = {
        idSendr: idSender,
        ProjectID: targetMessage.projectId || 0,
        StageID: targetMessage.stageId || 'اعتمادات',
        Sender: user?.data?.userName || 'مستخدم',
        message: action === 'approve' ? 'تم الموافقة على الطلب ✅' : 'تم رفض الطلب ❌',
        timeminet: new Date().toISOString(),
        File: {},
        Reply: {
          Data: targetMessage.content,
          Date: targetMessage.timestamp,
          type: 'approval',
          Sender: targetMessage.sender
        },
        arrived: false,
        kind: 'new'
      };

      // إرسال عبر Socket
      socketService.emit('send_message', approvalMessage);

      // إضافة رسالة رد للواجهة
      const responseMessage: ChatMessage = {
        id: messages.length + 1,
        type: 'response',
        content: action === 'approve' ? 'تم الموافقة على الطلب ✅' : 'تم رفض الطلب ❌',
        sender: user?.data?.userName || 'أنت',
        timestamp: new Date().toISOString(),
        isFromUser: true
      };

      setMessages(prev => [...prev, responseMessage]);

      Tostget(action === 'approve' ? 'تم الموافقة بنجاح' : 'تم الرفض بنجاح');
    } catch (error) {
      console.error('Error processing approval:', error);
      Tostget('خطأ في معالجة الطلب');
    } finally {
      setActionLoading(prev => ({ ...prev, [messageId]: false }));
    }
  };



  const formatDate = (d?: string) => {
    if (!d) return '';
    try {
      const date = new Date(d);
      return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatShortTime = (d?: string) => {
    if (!d) return '';
    try {
      const date = new Date(d);
      return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Handle reply to message
  const handleQuickReply = (message: ChatMessage) => {
    setReplyToMessage(message);
    textareaRef.current?.focus();
  };

  // Handle long press for reply
  const handleMouseDown = (message: ChatMessage) => {
    const timer = setTimeout(() => {
      setReplyToMessage(message);
      textareaRef.current?.focus();
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, just show a message that file upload is not implemented
    Tostget('إرسال الملفات سيتم تطويره قريباً');

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle location sharing
  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationMessage = `📍 الموقع: https://maps.google.com/?q=${latitude},${longitude}`;
          setNewMessage(prev => prev + locationMessage);
          Tostget('تم إضافة الموقع');
        },
        (error) => {
          console.error('Error getting location:', error);
          Tostget('تعذر الحصول على الموقع');
        }
      );
    } else {
      Tostget('المتصفح لا يدعم خدمة الموقع');
    }
  };

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title="اعتمادات"
          backButton={
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="رجوع">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
          }
        />
      }
    >
      <ContentSection>

      {/* Chat Messages */}
      <div className="p-4 space-y-4" style={{ paddingBottom: '180px' }}>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.22.45 4.56 1.23"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد رسائل</h3>
            <p className="text-gray-600">ابدأ محادثة جديدة</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[80%] rounded-2xl p-3 shadow-sm border ${
                message.isFromUser
                  ? 'ml-auto bg-blue-50 border-blue-100'
                  : 'mr-auto bg-white border-gray-100'
              } group relative cursor-pointer select-none`}
              onDoubleClick={() => handleQuickReply(message)}
              onMouseDown={() => handleMouseDown(message)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={() => handleMouseDown(message)}
              onTouchEnd={handleMouseUp}
            >
              {/* Reply Button - يظهر عند hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickReply(message);
                }}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 rounded-full p-1 z-10"
                title="رد على هذه الرسالة"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6M3 10l6-6"/>
                </svg>
              </button>

              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700 font-ibm-arabic-semibold">{message.sender || 'غير معروف'}</span>
                <span className="text-xs text-gray-400">{formatDate(message.timestamp)}</span>
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
              <p className="mb-2">{message.content || message.message}</p>

              {/* Action Buttons for Requests */}
              {message.type === 'request' && message.status === 'pending' && !message.isFromUser && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleApproval(message.id, 'reject')}
                    disabled={actionLoading[message.id]}
                    className="flex-1 py-1 px-3 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    {actionLoading[message.id] ? 'جاري...' : 'رفض'}
                  </button>
                  <button
                    onClick={() => handleApproval(message.id, 'approve')}
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
            </div>
          ))
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      </ContentSection>

      {/* Chat Input Bar - Fixed at Bottom */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-300 shadow-lg z-50">
        {/* Reply Preview - داخل البار الثابت */}
        {replyToMessage && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-600 font-medium">رد على: {replyToMessage.sender}</span>
              <button
                onClick={() => setReplyToMessage(null)}
                className="text-blue-400 hover:text-blue-600"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-600 truncate">{replyToMessage.content || replyToMessage.message}</div>
          </div>
        )}

        <div className="p-4">
        <div className="flex items-end gap-2">
          {/* File Upload Button - مطابق للمحادثة العادية */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="إرفاق ملف"
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15V8a5 5 0 0 0-10 0v9a3 3 0 0 0 6 0V9"/>
            </svg>
          </button>

          {/* Location Button - مطابق للمحادثة العادية */}
          <button
            onClick={handleShareLocation}
            title="مشاركة الموقع"
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.36 6.36-1.41-1.41M6.05 6.05 4.64 4.64M17.36 6.64l-1.41 1.41M6.64 17.36l-1.41-1.41"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
            placeholder="اكتب رسالة..."
            className="flex-1 resize-none leading-6 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              fontFamily: fonts.IBMPlexSansArabicRegular,
              maxHeight: 160,
              fontSize: scale(14 + size)
            }}
          />

          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
        </div>
      </div>

    </ResponsiveLayout>
  );
}
