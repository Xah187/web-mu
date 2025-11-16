'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';

import { scale } from '@/utils/responsiveSize';
import { fonts } from '@/constants/fonts';
import { Tostget } from '@/components/ui/Toast';
import axiosInstance from '@/lib/api/axios';
import socketService from '@/lib/socket/socketService';

// Import updated components
import MessageBubble from '@/components/chat/MessageBubble';
import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';
import MessageContextMenu from '@/components/chat/MessageContextMenu';
import MessageInfoModal from '@/components/chat/MessageInfoModal';
import AttachmentDropdown from '@/components/chat/AttachmentDropdown';
import useWebAttachment from '@/hooks/useWebAttachment';

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
  chatID?: number;
  File?: any;
  Reply?: any;
  timeminet?: string;
  Sender?: string;
  StageID?: string;
  ProjectID?: number;
  kind?: string;
  arrived?: boolean;
  idSendr?: string;
}

export default function ApprovalsPage() {
  const router = useRouter();
  const { user, size } = useAppSelector(state => state.user);
  const { t } = useTranslation();

  // مطابق للتطبيق الأساسي: استخدام السجل التجاري كـ ProjectID لغرف خاصة (اعتمادات/قرارات/استشارات)
  const approvalsProjectId = parseInt((user as any)?.data?.CommercialRegistrationNumber as any) || 0;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{[key: number]: boolean}>({});
  const [newMessage, setNewMessage] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Context Menu functionality - قائمة الخيارات عند الضغط المطول
  const [contextMenu, setContextMenu] = useState<{ message: ChatMessage; x: number; y: number } | null>(null);
  const [showMessageInfo, setShowMessageInfo] = useState<ChatMessage | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

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

  // استخدام hook الإرفاق (مطابق للدردشة الرئيسية)
  const {
    capturePhoto,
    captureVideo,
    selectFile,
    selectVideo,
    shareLocation,
    videoLoading
  } = useWebAttachment();

  // وظائف القائمة السياقية (Context Menu)
  const handleContextMenu = (e: React.MouseEvent, message: ChatMessage) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      message,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleLongPress = (e: React.MouseEvent | React.TouchEvent, message: ChatMessage) => {
    const timer = setTimeout(() => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      let x = 0;
      let y = 0;

      if ('touches' in e) {
        x = e.touches[0]?.clientX || 0;
        y = e.touches[0]?.clientY || 0;
      } else {
        x = e.clientX;
        y = e.clientY;
      }

      setContextMenu({ message, x, y });
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleCopyMessage = (message: ChatMessage) => {
    const text = message.message || message.content || '';
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        console.log('تم نسخ الرسالة');
      });
    }
  };

  const handleDeleteMessage = async (message: ChatMessage) => {
    if (!message.chatID && !message.chatId) {
      setMessages(prev => prev.filter(m => m.idSendr !== message.idSendr));
      return;
    }

    try {
      const deletePayload = {
        ProjectID: approvalsProjectId,
        StageID: 'اعتمادات',
        message: message.message || '',
        Sender: message.Sender || message.userName || '',
        chatID: message.chatID || message.chatId,
        kind: 'delete'
      };

      setMessages(prev => prev.filter(m => (m.chatID || m.chatId) !== (message.chatID || message.chatId)));
      socketService.emit('send_message', deletePayload);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleResendMessage = async (message: ChatMessage) => {
    try {
      const resendPayload = {
        ...message,
        kind: 'new',
        StageID: 'اعتمادات',
        arrived: false
      };

      if (message.File && Object.keys(message.File).length > 0 && message.File.type !== 'location') {
        console.log('إعادة إرسال ملف - يحتاج إلى تنفيذ خاص');
      } else {
        socketService.emit('send_message', resendPayload);
      }
    } catch (error) {
      console.error('Error resending message:', error);
    }
  };

  // دوال معالجة الإرفاق للقائمة المنسدلة (مطابق للدردشة الرئيسية)
  const handleCameraCapture = async () => {
    const result = await capturePhoto();
    if (result) {
      await handleFileUpload(result);
    }
  };

  const handleVideoCapture = async () => {
    const result = await captureVideo();
    if (result) {
      await handleFileUpload(result);
    }
  };

  const handleFileSelect = async () => {
    const result = await selectFile();
    if (result) {
      await handleFileUpload(result);
    }
  };

  const handleVideoSelect = async () => {
    const result = await selectVideo();
    if (result) {
      await handleFileUpload(result);
    }
  };

  const handleLocationShare = async () => {
    const result = await shareLocation();
    if (result) {
      await handleFileUpload(result);
    }
  };

  // وظائف معالجة الـ textarea (مطابق للدردشة الرئيسية)
  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    const ua = navigator.userAgent.toLowerCase();
    const isMac = ua.includes('mac os');
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    if (e.key === 'Enter') {
      if (e.shiftKey) return;
      e.preventDefault();
      if (modifier) {
        sendMessage();
      } else {
        sendMessage();
      }
    }

    if (e.key === 'Escape' && replyToMessage) {
      e.preventDefault();
      setReplyToMessage(null);
    }
  };

  const onTextChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setNewMessage(e.target.value);
    e.currentTarget.style.height = 'auto';
    e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 160) + 'px';
  };

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
          // معالجة رسائل الحذف - مثل التطبيق المحمول
          if (msg.kind === 'delete') {
            setMessages(prev => prev.filter(m => m.chatID !== msg.chatID));
            return;
          }

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

  // Upload state
  const [uploading, setUploading] = useState<{ idSendr: string; progress: number; kind: 'image' | 'video' | 'file' } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Upload to Google Cloud Storage (مطابق للدردشة الرئيسية)
  const uploadToStorage = async (file: File) => {
    setErrorMsg(null);
    try {
      const init = await axiosInstance.get('/Chate/initializeUpload', { params: { fileName: file.name }});
      const { token, nameFile } = init.data || {};
      const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/demo_backendmoshrif_bucket-1/o?uploadType=media&name=${nameFile}`;

      setUploading({ idSendr: nameFile, progress: 0, kind: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file' });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl, true);
        xhr.responseType = 'json';
        const contentType = file.type || 'application/octet-stream';
        xhr.setRequestHeader('Content-Type', contentType);
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploading(prev => prev ? { ...prev, progress } : null);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(file);
      });

      const payload: any = {
        idSendr: buildIdSendr(),
        ProjectID: approvalsProjectId,
        StageID: 'اعتمادات',
        userName: user?.data?.userName || 'مستخدم',
        Sender: user?.data?.userName || 'مستخدم',
        message: '',
        timeminet: new Date().toISOString(),
        File: {
          name: nameFile,
          type: file.type || 'application/octet-stream',
          size: file.size,
          uri: `/web-upload/${nameFile}`
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

      const inserted = await axiosInstance.post('/Chate/insertdatafile', payload);
      const chatID = inserted.data?.chatID;
      setUploading(null);

      const normalizedMsg = normalizeMessage({ ...payload, chatID, Date: new Date().toISOString() });
      setMessages(prev => {
        const updated = [...prev, normalizedMsg];
        return dedupMessages(updated);
      });
      setReplyToMessage(null);

    } catch (error) {
      console.error('Upload error:', error);
      setUploading(null);
      setErrorMsg('تعذر رفع الملف. تحقق من الاتصال وحاول مرة أخرى.');
    }
  };

  // File upload handler - now accepts object from MessageInput (مطابق للدردشة الرئيسية)
  const handleFileUpload = async (input: any) => {
    try {
      // تطبيع الإدخال: حدث input أو كائن ملف
      let fileData: any = null;
      if (input && input.target && input.target.files) {
        const file = input.target.files?.[0];
        if (!file) return;
        // رفع الملف مباشرة إلى Google Cloud Storage
        await uploadToStorage(file);
        return;
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

      // معالجة الملفات (صور، فيديوهات، مستندات) من AttachmentDropdown
      // تحويل من blob URL إلى File object
      const response = await fetch(fileData.uri);
      const blob = await response.blob();
      const file = new File([blob], fileData.name, { type: fileData.type });

      await uploadToStorage(file);

    } catch (e) {
      console.error('handleFileUpload error:', e);
      setErrorMsg('تعذر إرسال المرفق');
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

      {/* Upload Progress Indicator - مؤشر الرفع */}
      {uploading && (
        <div
          className="flex items-center gap-3 p-4 rounded-lg shadow-sm"
          style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px',
            margin: `${scale(16)}px`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--color-primary)' + '30', borderTopColor: 'var(--color-primary)' }}></div>
            <div>
              <div className="text-sm font-ibm-arabic-semibold" style={{ color: 'var(--color-text-primary)' }}>جاري الرفع...</div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{uploading.progress.toFixed(0)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message - رسالة الخطأ */}
      {errorMsg && (
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: '#fee',
            color: '#c33',
            margin: `${scale(16)}px`,
          }}
        >
          {errorMsg}
        </div>
      )}

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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('chat.noMessages')}</h3>
            <p className="text-gray-600">{t('chat.startConversation')}</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.id || index}-${message.timeminet || message.timestamp || Date.now()}`}
              onContextMenu={(e) => handleContextMenu(e, message)}
              onMouseDown={(e) => handleLongPress(e, message)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onTouchStart={(e) => handleLongPress(e, message)}
              onTouchEnd={handleLongPressEnd}
            >
              <MessageBubble
                message={message}
                currentUserName={user?.data?.userName || ''}
                size={size || 0}
                onReply={handleReply}
                formatDate={formatDate}
                formatShortTime={formatShortTime}
                showActionButtons={message.type === 'request' && message.status === 'pending' && !message.isFromUser}
                onApprove={(messageId) => handleApproval(messageId, 'approve')}
                onReject={(messageId) => handleApproval(messageId, 'reject')}
                actionLoading={actionLoading}
              />
            </div>
          ))
        )}
        {/* مرجع للتمرير لآخر رسالة */}
        <div ref={messagesEndRef} style={{ height: `${scale(16)}px` }} />
      </div>

      </ContentSection>

      {/* Chat Input Bar - Fixed at Bottom (مطابق للدردشة الرئيسية) */}
      <div
        className="chat-input-bar border-t shadow-lg z-50"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderTopWidth: '1px'
        }}
      >
        {/* Reply Preview - داخل البار الثابت */}
        {replyToMessage && (
          <div
            className="border-b"
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
              <div
                className="font-medium"
                style={{
                  fontSize: `${scale(13 + (size || 0))}px`,
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  color: 'var(--color-primary)'
                }}
              >
                رد على: {replyToMessage.Sender || replyToMessage.sender || 'غير معروف'}
              </div>
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
                title="إلغاء الرد"
              >
                ✕
              </button>
            </div>
            <div
              className="truncate"
              style={{
                fontSize: `${scale(12 + (size || 0))}px`,
                fontFamily: fonts.IBMPlexSansArabicRegular,
                color: 'var(--color-text-secondary)'
              }}
            >
              {replyToMessage.message || replyToMessage.content || 'رسالة'}
            </div>
          </div>
        )}

        <div style={{ padding: `${scale(20)}px` }}>
          <div
            className="flex items-end"
            style={{ gap: `${scale(12)}px` }}
          >
            {/* قائمة الإرفاق المنسدلة */}
            <AttachmentDropdown
              onCameraCapture={handleCameraCapture}
              onVideoCapture={handleVideoCapture}
              onFileSelect={handleFileSelect}
              onVideoSelect={handleVideoSelect}
              onLocationShare={handleLocationShare}
              disabled={false}
              videoLoading={videoLoading}
            />

            {errorMsg && (
              <div className="absolute bottom-16 left-4 right-4 sm:static sm:bottom-auto sm:left-auto sm:right-auto sm:mt-2">
                <div className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-error)' + '20', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                  {errorMsg}
                </div>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={onTextChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="اكتب رسالة..."
              className="flex-1 resize-none leading-6 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
              style={{
                fontFamily: fonts.IBMPlexSansArabicRegular,
                maxHeight: `${scale(160)}px`,
                fontSize: `${scale(14 + (size || 0))}px`,
                padding: `${scale(12)}px ${scale(16)}px`,
                borderColor: 'var(--color-border)',
                borderRadius: `${scale(12)}px`,
                lineHeight: 1.5,
                backgroundColor: 'var(--color-input-background)',
                color: 'var(--color-input-text)',
              }}
            />

            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              style={{
                padding: `${scale(12)}px ${scale(20)}px`,
                backgroundColor: 'var(--color-primary)',
                borderRadius: `${scale(24)}px`,
                fontSize: `${scale(14 + (size || 0))}px`,
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
        </div>
      </div>

      {/* Context Menu - قائمة الخيارات */}
      {contextMenu && (
        <MessageContextMenu
          message={contextMenu.message}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onReply={() => {
            setReplyToMessage(contextMenu.message);
          }}
          onInfo={() => setShowMessageInfo(contextMenu.message)}
          onCopy={() => handleCopyMessage(contextMenu.message)}
          onDelete={() => handleDeleteMessage(contextMenu.message)}
          onResend={() => handleResendMessage(contextMenu.message)}
          currentUserName={user?.data?.userName || ''}
          userJob={(user?.data as any)?.job || ''}
        />
      )}

      {/* Message Info Modal - نافذة معلومات الرسالة */}
      {showMessageInfo && (
        <MessageInfoModal
          message={showMessageInfo}
          onClose={() => setShowMessageInfo(null)}
        />
      )}

    </ResponsiveLayout>
  );
}
