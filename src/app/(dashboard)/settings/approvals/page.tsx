'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';

import { scale } from '@/utils/responsiveSize';
import { Tostget } from '@/components/ui/Toast';
import axiosInstance from '@/lib/api/axios';
import socketService from '@/lib/socket/socketService';

// Import updated components
import MessageBubble from '@/components/chat/MessageBubble';
import MessageInput from '@/components/chat/MessageInput';
import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

// This page represents the "اعتمادات" section from mobile app
// In mobile app: navigation.navigate('Chate', { ProjectID: CommercialRegistrationNumber, typess: 'اعتمادات', nameRoom: 'اعتمادات' })
// This web implementation replicates the exact same functionality

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
  timeminet?: string;
  Sender?: string;
  StageID?: string;
  ProjectID?: number;
}

export default function ApprovalsPage() {
  const router = useRouter();
  const { user, size } = useAppSelector(state => state.user);

  // مطابق للتطبيق الأساسي: استخدام السجل التجاري كـ ProjectID لغرف خاصة (اعتمادات/قرارات/استشارات)
  const approvalsProjectId = parseInt((user as any)?.data?.CommercialRegistrationNumber as any) || 0;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{[key: number]: boolean}>({});
  const [newMessage, setNewMessage] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Normalize messages from API/socket and deduplicate (like main chat)
  const normalizeMessage = useCallback((raw: any): ChatMessage => {
    if (!raw || typeof raw !== 'object') return raw;
    let File = raw.File;
    let Reply = raw.Reply;
    try { if (typeof File === 'string') File = JSON.parse(File); } catch {}
    try { if (typeof Reply === 'string') Reply = JSON.parse(Reply); } catch {}
    const timeminet = raw.timeminet || raw.Date || new Date().toISOString();
    return { ...raw, File, Reply, timeminet };
  }, []);

  const dedupMessages = useCallback((list: ChatMessage[]) => {
    const seen = new Set<string>();
    const result: ChatMessage[] = [];
    for (const m of list) {
      const key = `${m?.chatId ?? ''}|${(m as any)?.idSendr ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(m);
    }
    return result;
  }, []);

  const initializeSocket = useCallback(async () => {
    try {
      // تهيئة Socket مثل التطبيق المحمول
      await socketService.initializeSocket();

      // الانضمام لغرفة الاعتمادات مثل التطبيق المحمول
      const room = `${approvalsProjectId}:اعتمادات`;
      socketService.emit('newRome', room);

      // استقبال الرسائل الجديدة مثل التطبيق المحمول (مع التطبيع)
      socketService.on('received_message', (msg: any) => {
        try {
          // التحقق من أن الرسالة خاصة بالاعتمادات
          if (msg.StageID === 'اعتمادات' || msg.message?.includes('طلب') || msg.message?.includes('اعتماد')) {
            const normalizedMessage = normalizeMessage(msg);

            // إضافة الرسالة للقائمة إذا لم تكن من المستخدم الحالي
            const currentUserName = user?.data?.userName || '';
            const senderName = normalizedMessage.Sender || normalizedMessage.sender || '';
            const isFromCurrentUser = senderName.toLowerCase() === currentUserName.toLowerCase();

            if (!isFromCurrentUser) {
              setMessages(prev => {
                const updated = [...prev, normalizedMessage];
                return dedupMessages(updated);
              });
            }
          }
        } catch (error) {
          console.error('Error processing received message:', error);
        }
      });

    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }, [approvalsProjectId, user?.data?.userName, normalizeMessage, dedupMessages]);

  const fetchMessages = useCallback(async () => {
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

        // تحويل البيانات إلى تنسيق ChatMessage مع التطبيع الجديد
        const normalizedMessages: ChatMessage[] = Array.isArray(data) ?
          data.map((msg: any) => normalizeMessage(msg)) : [];

        // إزالة الرسائل المكررة
        const uniqueMessages = dedupMessages(normalizedMessages);

        // إضافة رسالة ترحيب إذا لم توجد رسائل
        if (uniqueMessages.length === 0) {
          uniqueMessages.unshift({
            id: 1,
            type: 'system',
            content: 'مرحباً بك في قسم الاعتمادات. لا توجد طلبات معلقة حالياً.',
            sender: 'النظام',
            timestamp: new Date().toISOString(),
            isFromUser: false,
            message: 'مرحباً بك في قسم الاعتمادات. لا توجد طلبات معلقة حالياً.',
            timeminet: new Date().toISOString(),
            Sender: 'النظام'
          });
        } else {
          // إضافة رسالة ترحيب في البداية
          uniqueMessages.unshift({
            id: 0,
            type: 'system',
            content: 'مرحباً بك في قسم الاعتمادات. يمكنك هنا مراجعة الطلبات والموافقة عليها أو رفضها.',
            sender: 'النظام',
            timestamp: new Date().toISOString(),
            isFromUser: false,
            message: 'مرحباً بك في قسم الاعتمادات. يمكنك هنا مراجعة الطلبات والموافقة عليها أو رفضها.',
            timeminet: new Date().toISOString(),
            Sender: 'النظام'
          });
        }

        setMessages(uniqueMessages);

      } catch (error) {
        console.error('Error fetching approval messages:', error);

        // في حالة فشل جميع الطرق، استخدام بيانات افتراضية
        const fallbackMessages: ChatMessage[] = [
          {
            id: 1,
            type: 'system',
            content: 'مرحباً بك في قسم الاعتمادات. لا توجد طلبات معلقة حالياً.',
            sender: 'النظام',
            timestamp: new Date().toISOString(),
            isFromUser: false,
            message: 'مرحباً بك في قسم الاعتمادات. لا توجد طلبات معلقة حالياً.',
            timeminet: new Date().toISOString(),
            Sender: 'النظام'
          }
        ];

        setMessages(fallbackMessages);
        Tostget('تعذر تحميل البيانات، يتم عرض البيانات المحلية');
      }

    } finally {
      setLoading(false);
    }
  }, [approvalsProjectId, normalizeMessage, dedupMessages]);

  useEffect(() => {
    fetchMessages();
    initializeSocket();

    // Cleanup عند إلغاء تحميل المكون
    return () => {
      socketService.removeListener('received_message');
    };
  }, [fetchMessages, initializeSocket]);

  // التمرير التلقائي لآخر رسالة (مثل الدردشة الرئيسية)
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [messages]);

  // Build unique sender ID like main chat
  const buildIdSendr = () => {
    const phoneNumber = user?.data?.PhoneNumber || 'web';
    const randomId = Math.random().toString(36).substring(2, 10);
    return `${phoneNumber}${randomId}`;
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const senderName = user?.data?.userName || 'مستخدم';

    // إعداد Reply object إذا كان هناك رد على رسالة (مثل الدردشة الرئيسية)
    const replyObject = replyToMessage ? {
      Data: replyToMessage.message || replyToMessage.content || '',
      Date: replyToMessage.timeminet || replyToMessage.timestamp || '',
      type: 'اعتمادات',
      Sender: replyToMessage.Sender || replyToMessage.sender || '',
    } : {};

    const messagePayload: any = {
      idSendr: buildIdSendr(),
      ProjectID: approvalsProjectId,
      StageID: 'اعتمادات',
      Sender: senderName,
      userName: senderName,
      message: newMessage.trim(),
      timeminet: new Date().toISOString(),
      File: {},
      Reply: replyObject,
      arrived: false,
      kind: 'new',
    };

    // Optimistic UI - إضافة الرسالة فوراً
    setMessages((prev) => [...prev, messagePayload]);
    setNewMessage('');
    setReplyToMessage(null);

    // إرسال عبر Socket
    socketService.emit('send_message', messagePayload);
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

      // إرسال رد الاعتماد عبر Socket مثل الدردشة الرئيسية
      const senderName = user?.data?.userName || 'مستخدم';
      const approvalMessage: any = {
        idSendr: buildIdSendr(),
        ProjectID: approvalsProjectId,
        StageID: 'اعتمادات',
        Sender: senderName,
        userName: senderName,
        message: action === 'approve' ? 'تم الموافقة على الطلب ✅' : 'تم رفض الطلب ❌',
        timeminet: new Date().toISOString(),
        File: {},
        Reply: {
          Data: targetMessage.message || targetMessage.content || '',
          Date: targetMessage.timeminet || targetMessage.timestamp || '',
          type: 'approval',
          Sender: targetMessage.Sender || targetMessage.sender || ''
        },
        arrived: false,
        kind: 'new'
      };

      // إرسال عبر Socket
      socketService.emit('send_message', approvalMessage);

      // إضافة رسالة رد للواجهة (Optimistic UI)
      setMessages(prev => [...prev, approvalMessage]);

      Tostget(action === 'approve' ? 'تم الموافقة بنجاح' : 'تم الرفض بنجاح');
    } catch (error) {
      console.error('Error processing approval:', error);
      Tostget('خطأ في معالجة الطلب');
    } finally {
      setActionLoading(prev => ({ ...prev, [messageId]: false }));
    }
  };

  // Formatting helpers with AM/PM format (matching main chat)
  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const formatDate = (d?: string) => {
    if (!d) return '';
    try {
      const date = new Date(d);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

      // Format date - بالميلادي بترتيب سنة-شهر-يوم
      if (isToday) {
        return formatTime(date);
      } else if (isYesterday) {
        return `أمس ${formatTime(date)}`;
      } else {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${formatTime(date)}`;
      }
    } catch {
      return '';
    }
  };

  // دالة مساعدة لعرض الوقت المختصر في الرد
  const formatShortTime = (d?: string) => {
    if (!d) return '';
    try {
      const date = new Date(d);
      return formatTime(date);
    } catch {
      return '';
    }
  };

  // Reply handling functions (like main chat)
  const handleReply = (message: ChatMessage) => {
    setReplyToMessage(message);
  };

  const handleLongPress = (message: ChatMessage) => {
    const timer = setTimeout(() => {
      setReplyToMessage(message);
      // إضافة اهتزاز خفيف إذا كان متاحاً
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms للضغط الطويل
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // File upload handler - now accepts object from MessageInput
  const handleFileUpload = async (input: any) => {
    try {
      // تطبيع الإدخال: حدث input أو كائن ملف
      let fileData: any = null;
      if (input && input.target && input.target.files) {
        const file = input.target.files?.[0];
        if (!file) return;
        const uri = URL.createObjectURL(file);
        fileData = { uri, name: file.name, type: file.type, size: file.size };
      } else {
        fileData = input;
      }

      // مشاركة الموقع
      if (fileData?.type === 'location') {
        const senderName = user?.data?.userName || 'مستخدم';
        const locationMessage: any = {
          idSendr: buildIdSendr(),
          ProjectID: approvalsProjectId,
          StageID: 'اعتمادات',
          Sender: senderName,
          userName: senderName,
          message: '',
          timeminet: new Date().toISOString(),
          File: {
            type: 'location',
            latitude: fileData.latitude,
            longitude: fileData.longitude,
            accuracy: fileData.accuracy,
            timestamp: fileData.timestamp
          },
          Reply: replyToMessage ? {
            Data: replyToMessage.message || replyToMessage.content || '',
            Date: replyToMessage.timeminet || replyToMessage.timestamp || '',
            type: 'اعتمادات',
            Sender: replyToMessage.Sender || replyToMessage.sender || '',
          } : {},
          arrived: false,
          kind: 'new',
        };

        setMessages(prev => [...prev, locationMessage]);
        setReplyToMessage(null);
        socketService.emit('send_message', locationMessage);
        return;
      }

      // تحديد النوع: صورة / فيديو / ملف
      const isImage = String(fileData?.type || '').startsWith('image/');
      const isVideo = String(fileData?.type || '').startsWith('video/');

      const senderName = user?.data?.userName || 'مستخدم';
      const messagePayload: any = {
        idSendr: buildIdSendr(),
        ProjectID: approvalsProjectId,
        StageID: 'اعتمادات',
        Sender: senderName,
        userName: senderName,
        message: '',
        timeminet: new Date().toISOString(),
        File: {
          uri: fileData?.uri,
          name: fileData?.name,
          type: isImage ? fileData.type : isVideo ? fileData.type : (fileData?.type || 'application/octet-stream'),
          size: fileData?.size,
          uriImage: fileData?.uriImage || undefined,
        },
        Reply: replyToMessage ? {
          Data: replyToMessage.message || replyToMessage.content || '',
          Date: replyToMessage.timeminet || replyToMessage.timestamp || '',
          type: 'اعتمادات',
          Sender: replyToMessage.Sender || replyToMessage.sender || '',
        } : {},
        arrived: false,
        kind: 'new',
      };

      // Optimistic UI ثم إرسال عبر السوكيت
      setMessages(prev => [...prev, messagePayload]);
      setReplyToMessage(null);
      socketService.emit('send_message', messagePayload);

    } catch (e) {
      console.error('handleFileUpload error:', e);
      Tostget('تعذر إرسال المرفق');
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
      <div
        className="space-y-4"
        style={{
          padding: `${scale(16)}px`,
          paddingBottom: `${scale(180)}px`
        }}
      >
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
          messages.map((message, index) => (
            <MessageBubble
              key={`${message.id || index}-${message.timeminet || message.timestamp || Date.now()}`}
              message={message}
              currentUserName={user?.data?.userName || ''}
              size={size || 0}
              onReply={handleReply}
              onLongPress={handleLongPress}
              onLongPressEnd={handleLongPressEnd}
              formatDate={formatDate}
              formatShortTime={formatShortTime}
              showActionButtons={message.type === 'request' && message.status === 'pending' && !message.isFromUser}
              onApprove={(messageId) => handleApproval(messageId, 'approve')}
              onReject={(messageId) => handleApproval(messageId, 'reject')}
              actionLoading={actionLoading}
            />
          ))
        )}
        {/* مرجع للتمرير لآخر رسالة */}
        <div ref={messagesEndRef} style={{ height: `${scale(16)}px` }} />
      </div>

      </ContentSection>

      {/* Chat Input using MessageInput component - Fixed at bottom */}
      <div className="chat-input-bar z-50">
        <MessageInput
          message={newMessage}
          setMessage={setNewMessage}
          onSend={sendMessage}
          replyToMessage={replyToMessage}
          setReplyToMessage={setReplyToMessage}
          size={size || 0}
          placeholder="اكتب رسالة..."
          showFileUpload={true}
          showEmoji={false}
          onFileUpload={handleFileUpload}
          disabled={loading}
        />
      </div>

    </ResponsiveLayout>
  );
}
