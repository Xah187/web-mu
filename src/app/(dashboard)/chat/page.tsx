'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/store';
import axiosInstance from '@/lib/api/axios';
import socketService from '@/lib/socket/socketService';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale } from '@/utils/responsiveSize';
import { useTranslation } from '@/hooks/useTranslation';

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';
import AttachmentDropdown from '@/components/chat/AttachmentDropdown';
import useWebAttachment from '@/hooks/useWebAttachment';
import MessageContextMenu from '@/components/chat/MessageContextMenu';
import MessageInfoModal from '@/components/chat/MessageInfoModal';



interface ChatMessage {
  chatID?: number;
  idSendr?: string;
  ProjectID?: number;
  StageID?: string;
  Sender?: string;
  userName?: string;
  text?: string;
  message?: string;
  content?: string;
  timeminet?: string;
  File?: any;
  Reply?: any;
  Date?: string;
  arrived?: boolean;
  kind?: string;
}

type Uploading = {
  idSendr: string;
  progress: number;
  kind: 'image' | 'video' | 'file' | 'text';
};

export default function ChatPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { user, size } = useAppSelector((state: any) => state.user || {});
  const { t, isRTL, dir } = useTranslation();

  const ProjectID = search.get('ProjectID') || '';
  const typess = search.get('typess') || '';
  const nameRoomParam = search.get('nameRoom') || '';
  const nameProject = search.get('nameProject') || '';

  // Normalize known chat types so the header title can be translated regardless of query text
  const normalizeType = (s: string): 'decisions' | 'consultations' | 'approvals' | 'project' | undefined => {
    const v = (s || '').toLowerCase();
    if (!v) return undefined;
    if (v.includes('قرار')) return 'decisions';
    if (v.includes('استشا') || v.includes('consult')) return 'consultations';
    if (v.includes('اعتما') || v.includes('approval')) return 'approvals';
    if (v === 'project' || v.includes('project')) return 'project';
    return undefined;
  };

  const normalizedType = normalizeType(typess) || normalizeType(nameRoomParam);

  // Compute a translated header title
  const headerTitle = (() => {
    switch (normalizedType) {
      case 'decisions':
        return t('management.decisionsPage.title');
      case 'consultations':
        return t('management.consultationsPage.title');
      case 'approvals':
        return t('management.approvals');
      case 'project':
        return nameRoomParam || t('chat.defaultRoomName');
      default:
        // Fallback to provided room name, then type, else default
        return nameRoomParam || typess || t('chat.defaultRoomName');
    }
  })();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  // Reply functionality - مثل الواتساب
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Context Menu functionality - قائمة الخيارات عند الضغط المطول
  const [contextMenu, setContextMenu] = useState<{ message: ChatMessage; x: number; y: number } | null>(null);
  const [showMessageInfo, setShowMessageInfo] = useState<ChatMessage | null>(null);

  // وظائف الضغط الطويل للرد
  const handleMouseDown = (message: ChatMessage) => {
    const timer = setTimeout(() => {
      setReplyToMessage(message);
      // إضافة اهتزاز خفيف إذا كان متاحاً
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      // التركيز على منطقة الكتابة
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }, 500); // 500ms للضغط الطويل
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // وظيفة مساعدة للرد السريع
  const handleQuickReply = (message: ChatMessage) => {
    setReplyToMessage(message);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

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

  const handleCopyMessage = (message: ChatMessage) => {
    const text = message.message || message.text || message.content || '';
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        // يمكن إضافة toast notification هنا
        console.log('تم نسخ الرسالة');
      });
    }
  };

  const handleDeleteMessage = async (message: ChatMessage) => {
    if (!message.chatID) {
      // حذف محلي فقط
      setMessages(prev => prev.filter(m => m.idSendr !== message.idSendr));
      return;
    }

    try {
      const deletePayload = {
        ProjectID: parseInt(ProjectID),
        StageID: typess,
        message: message.message || '',
        Sender: message.Sender || message.userName || '',
        chatID: message.chatID,
        kind: 'delete'
      };

      // حذف محلياً أولاً
      setMessages(prev => prev.filter(m => m.chatID !== message.chatID));

      // إرسال طلب الحذف للسيرفر
      socketService.emit('send_message', deletePayload);
    } catch (error) {
      console.error('Error deleting message:', error);
      setErrorMsg(t('chat.errors.deleteFailed'));
    }
  };

  const handleResendMessage = async (message: ChatMessage) => {
    try {
      const resendPayload = {
        ...message,
        kind: 'new',
        StageID: message.StageID || typess,
        arrived: false
      };

      // إذا كان هناك ملف، نحتاج إلى إعادة رفعه
      if (message.File && Object.keys(message.File).length > 0 && message.File.type !== 'location') {
        // للملفات، نحتاج إلى منطق خاص لإعادة الرفع
        console.log('إعادة إرسال ملف - يحتاج إلى تنفيذ خاص');
        setErrorMsg(t('chat.errors.resendFilesUnsupported'));
      } else {
        // للرسائل النصية والمواقع
        socketService.emit('send_message', resendPayload);
      }
    } catch (error) {
      console.error('Error resending message:', error);
      setErrorMsg(t('chat.errors.resendFailed'));
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    const ua = navigator.userAgent.toLowerCase();
    const isMac = ua.includes('mac os');
    const modifier = isMac ? e.metaKey : e.ctrlKey; // Cmd+Enter (Mac) / Ctrl+Enter (Win)

    if (e.key === 'Enter') {
      if (e.shiftKey) return; // allow newline with Shift+Enter
      e.preventDefault();
      if (modifier) {
        // Ctrl/Cmd+Enter explicit send
        handleSend();
      } else {
        // Single Enter also sends (mobile/desktop)
        handleSend();
      }
    }

    // إلغاء الرد بالضغط على Escape
    if (e.key === 'Escape' && replyToMessage) {
      e.preventDefault();
      setReplyToMessage(null);
    }
  };

  const onTextChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setText(e.target.value);
    // auto-grow up to ~8 lines
    e.currentTarget.style.height = 'auto';
    e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 160) + 'px';
  };

  // التمرير التلقائي لآخر رسالة
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

  // Normalize messages from API/socket and deduplicate
  const normalizeMessage = (raw: any): any => {
    if (!raw || typeof raw !== 'object') return raw;
    let File = raw.File;
    let Reply = raw.Reply;
    try { if (typeof File === 'string') File = JSON.parse(File); } catch {}
    try { if (typeof Reply === 'string') Reply = JSON.parse(Reply); } catch {}
    const timeminet = raw.timeminet || raw.Date || new Date().toISOString();
    return { ...raw, File, Reply, timeminet };
  };

  const dedupMessages = (list: any[]) => {
    const seen = new Set<string>();
    const result: any[] = [];
    for (const m of list) {
      const key = `${m?.chatID ?? ''}|${(m as any)?.idSendr ?? ''}|${(m as any)?.message ?? ''}|${(m as any)?.timeminet ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(m);
    }
    return result;
  };

  // Helper function to add message with deduplication
  const addMessageSafely = React.useCallback((newMessage: any) => {
    setMessages((prev) => {
      const updated = [...prev, newMessage];
      return dedupMessages(updated);
    });
  }, []);



  // ID helpers to align with mobile app
  const generateID = () => Math.random().toString(36).substring(2, 10);
  const buildIdSendr = () => {
    const phone = (user as any)?.data?.PhoneNumber || (user as any)?.PhoneNumber || '';
    return `${phone}${generateID()}`;
  };

  // Formatting helpers with AM/PM format
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


  // Location: using only geolocation quick share for now



  const handleShareMyLocation = () => {


    if (!navigator?.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const senderName = user?.data?.userName || user?.userName || 'User';
      const payload: any = { ProjectID: parseInt(ProjectID), StageID: typess, userName: senderName, Sender: senderName, message: url, File: {}, Reply: {}, Date: new Date().toISOString() };
      addMessageSafely(payload);
      socketService.emit('send_message', payload);
    }, () => alert('Unable to get location'));
  };




  // Initialize socket and join room
  useEffect(() => {
    if (!ProjectID || !typess) return;

    const initializeAndJoin = async () => {
      // Initialize socket first (like mobile app)
      await socketService.initializeSocket();

      // Join room like mobile: `${ProjectID}:${typess}`
      const room = `${parseInt(ProjectID)}:${typess}`;
      socketService.emit('newRome', room);
    };

    initializeAndJoin();

    // Load initial messages
    const load = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/Chate', {
          params: {
            ProjectID: parseInt(ProjectID),
            StageID: typess,
            lengthChat: 0,
          },
        });
        const data = res.data?.data || res.data || [];
        const normalized: any[] = Array.isArray(data) ? (data as any[]).map(normalizeMessage) : [];
        const deduped = dedupMessages(normalized);
        setMessages(deduped as ChatMessage[]);
      } catch {
        // ignore for now
      } finally {
        setLoading(false);
      }
    };

    load();

    // Listen for incoming messages
    const handleReceived = (msg: ChatMessage) => {
      const currentUserName = ((user?.data?.userName as string) || (user as any)?.userName || '') as string;
      const senderName = (msg.userName ?? msg.Sender ?? '') as string;

      // معالجة رسائل الحذف - مثل التطبيق المحمول
      if (msg.kind === 'delete') {
        // حذف الرسالة من القائمة بناءً على chatID
        setMessages(prev => prev.filter(m => m.chatID !== msg.chatID));
        return;
      }

      // معالجة الرسائل الجديدة
      // Only add message if it's from another user (not from current user)
      // This prevents duplicate messages when current user sends a message
      if (msg.kind === 'new' && senderName?.toLowerCase?.() !== currentUserName?.toLowerCase?.()) {
        const n = normalizeMessage(msg);
        addMessageSafely(n);
      }
    };
    socketService.on('received_message', handleReceived);

    // Mark viewed like mobile app
    const markViewed = async () => {
      try {
        await axiosInstance.post('/Chate/Viewed', {
          userName: user?.data?.userName || user?.userName || 'مستخدم',
          ProjectID: parseInt(ProjectID),
          type: typess,
        });
      } catch {
        // ignore
      }
    };
    markViewed();

    return () => {
      socketService.off('received_message', handleReceived);
    };
  }, [ProjectID, typess, addMessageSafely, user]);

  // Upload state (placeholder UI)
  const [uploading, setUploading] = useState<Uploading | null>(null);

  // Image/Video preview modal
  const [preview, setPreview] = useState<{ type: 'image' | 'video'; url: string } | null>(null);

  // File input ref
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // استخدام hook الإرفاق الجديد
  const {
    capturePhoto,
    captureVideo,
    selectFile,
    selectVideo,
    shareLocation,
    videoLoading
  } = useWebAttachment();



  const uploadToStorage = async (file: File) => { setErrorMsg(null);
    // Fetch resumable URL and token from backend (if needed)
    try {
      const init = await axiosInstance.get('/Chate/initializeUpload', { params: { fileName: file.name }});
      const { token, nameFile } = init.data || {};
      const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/demo_backendmoshrif_bucket-1/o?uploadType=media&name=${nameFile}`;

      setUploading({ idSendr: nameFile, progress: 0, kind: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file' });

      // Perform upload with progress (XMLHttpRequest to track progress)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl, true);
        xhr.responseType = 'json';
        const contentType = file.type || 'application/octet-stream';
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const percent = (evt.loaded / evt.total) * 100;
            setUploading((prev) => prev ? { ...prev, progress: percent } : prev);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(file);
      });

      // Insert chat record referencing File.name (matching mobile app structure)
      // نضيف uri بمسار وهمي لأن الملف تم رفعه مباشرة للسيرفر
      // التطبيق المحمول سيتحقق من File.uri، ولن يجده، ثم سيحمل الملف من URLFIL/${name}
      const payload: any = {
        idSendr: buildIdSendr(),
        ProjectID: parseInt(ProjectID),
        StageID: typess,
        userName: user?.data?.userName || user?.userName || 'مستخدم',
        Sender: user?.data?.userName || user?.userName || 'مستخدم',
        message: '',
        timeminet: new Date().toISOString(),
        File: {
          name: nameFile,
          type: file.type || 'application/octet-stream',
          size: file.size,
          uri: `/web-upload/${nameFile}` // مسار وهمي - التطبيق المحمول سيحمل الملف من السيرفر
        },
        Reply: {},
        arrived: false,
        kind: 'new',
      };
      const inserted = await axiosInstance.post('/Chate/insertdatafile', payload);
      const chatID = inserted.data?.chatID;
      setUploading(null);

      // عرض الرسالة فورياً
      addMessageSafely({ ...payload, chatID, Date: new Date().toISOString() });
      // السيرفر سيبث received_message الذي يحمل نفس البيانات النهائية

    } catch {
      setUploading(null);
      setErrorMsg(t('chat.errors.uploadFailed'));
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const inputEl = e.currentTarget as HTMLInputElement;
    const file = inputEl.files?.[0];
    if (!file) return;
    // Clear immediately to avoid synthetic event pooling issues and allow re-selecting same file
    inputEl.value = '';
    await uploadToStorage(file);
  };

  // دالة معالجة الإرفاق الجديدة (مطابقة للتطبيق المحمول)
  const handleFileUpload = async (fileData: any) => {
    try {
      if (fileData.type === 'location') {
        // معالجة الموقع
        const locationMessage = {
          idSendr: buildIdSendr(),
          ProjectID: parseInt(ProjectID),
          StageID: typess,
          Sender: user?.data?.userName || (t('chat.bubble.unknownSender') as string),
          message: '',
          timeminet: new Date().toISOString(),
          File: {
            type: 'location',
            latitude: fileData.latitude,
            longitude: fileData.longitude,
            accuracy: fileData.accuracy,
            timestamp: fileData.timestamp
          },
          Reply: replyToMessage || {},
          arrived: false,
          kind: 'new'
        };

        // إضافة الرسالة محلياً
        addMessageSafely(locationMessage);
        setReplyToMessage(null);

        // إرسال عبر Socket
        socketService.emit('send_message', locationMessage);
      } else {
        // معالجة الملفات (صور، فيديوهات، مستندات)
        // تحويل من blob URL إلى File object
        const response = await fetch(fileData.uri);
        const blob = await response.blob();
        const file = new File([blob], fileData.name, { type: fileData.type });

        await uploadToStorage(file);
      }
    } catch (error) {
      console.error('Error handling file upload:', error);
      setErrorMsg(t('chat.errors.processFileError'));
    }
  };

  // دوال معالجة الإرفاق للقائمة المنسدلة
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

  const handleSend = async () => {
    if (!text.trim()) return;

    const senderName = user?.data?.userName || user?.userName || 'مستخدم';

    // إعداد Reply object إذا كان هناك رد على رسالة
    const replyObject = replyToMessage ? {
      Data: replyToMessage.message || replyToMessage.text || '',
      Date: replyToMessage.timeminet || replyToMessage.Date || '',
      type: replyToMessage.StageID || typess,
      Sender: replyToMessage.Sender || replyToMessage.userName || '',
    } : {};

    const messagePayload: any = {
      idSendr: buildIdSendr(),
      ProjectID: parseInt(ProjectID),
      StageID: typess, // same key used on backend to route room
      Sender: senderName,
      userName: senderName,
      message: text.trim(),
      timeminet: new Date().toISOString(),
      File: {},
      Reply: replyObject,
      arrived: false,
      kind: 'new',
    };

    // Optimistic UI - add message immediately for better UX
    addMessageSafely(messagePayload);
    setText('');
    setReplyToMessage(null); // إلغاء الرد بعد الإرسال

    // Emit to socket - backend will persist and broadcast
    socketService.emit('send_message', messagePayload);
  };

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title={headerTitle}
          subtitle={nameProject || undefined}
          backButton={
            <button onClick={() => router.back()} className="p-2 rounded-lg transition-colors"
                    style={{
                      color: 'var(--color-text-secondary)',
                      transform: isRTL ? 'none' : 'rotate(180deg)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    aria-label={isRTL ? 'رجوع' : 'Back'}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
          }
        />
      }
    >
      <ContentSection className="p-0">
      {uploading && (
        <div className="fixed bottom-20 shadow-lg rounded-xl p-3 theme-card" style={{ backgroundColor: 'var(--color-card-background)', borderColor: 'var(--color-border)', [isRTL ? 'right' : 'left']: '1rem' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--color-primary)' + '30', borderTopColor: 'var(--color-primary)' }}></div>
            <div>
              <div className="text-sm font-ibm-arabic-semibold" style={{ color: 'var(--color-text-primary)' }}>{t('common.uploading')}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{uploading.progress.toFixed(0)}%</div>
            </div>
          </div>
        </div>
      )}


      {/* Messages */}
      <div
        className="overflow-y-auto"
        dir={dir}
        style={{
          padding: `${scale(20)}px`,
          paddingBottom: `${scale(200)}px`,
          gap: `${scale(16)}px`,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: 'var(--color-text-tertiary)' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>

            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{t('chat.noMessages')}</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>{t('chat.startConversation')}</p>
          </div>
        ) : (
          (messages || []).filter(Boolean).map((m, idx) => {
            const mObj = (m as any) || {};
            const senderName = (mObj.userName ?? mObj.Sender ?? '') as string;
            const currentUserName = ((user?.data?.userName as string) || (user as any)?.userName || '') as string;
            const mine = (senderName?.toLowerCase?.() || '') === (currentUserName?.toLowerCase?.() || '');
            const fileName = (m as any).File?.name as string | undefined;
            const fileType = (m as any).File?.type as string | undefined;
            const inferFromName = (name?: string): string | undefined => {
              if (!name) return undefined;
              const ext = name.split('.').pop()?.toLowerCase();
              if (!ext) return undefined;
              if (['jpg','jpeg','png','gif','webp','bmp'].includes(ext)) return 'image/' + (ext === 'jpg' ? 'jpeg' : ext);
              if (['mp4','mov','webm','m4v','mkv','avi'].includes(ext)) return 'video/' + (ext === 'mov' ? 'quicktime' : ext);
              return undefined;
            };
            const effectiveType = fileType || inferFromName(fileName);
            const isImage = !!effectiveType && effectiveType.startsWith('image/');
            const isVideo = !!effectiveType && effectiveType.startsWith('video/');
            return (
              <div
                key={idx}
                className={`max-w-[80%] group relative cursor-pointer select-none transition-all duration-200 hover:shadow-md`}
                style={{
                  padding: `${scale(16)}px`,
                  borderRadius: `${scale(16)}px`,
                  marginBottom: `${scale(16)}px`,
                  backgroundColor: 'var(--color-card-background)',
                  border: `1px solid var(--color-border)`,
                  boxShadow: 'var(--shadow-sm)',
                  color: 'var(--color-text-primary)',
                  [isRTL ? 'marginLeft' : 'marginRight']: mine ? 'auto' : '0',
                  [isRTL ? 'marginRight' : 'marginLeft']: mine ? '0' : 'auto',
                  direction: isRTL ? 'rtl' : 'ltr'
                }}
                onDoubleClick={() => setReplyToMessage(m)} // Double click للرد
                onMouseDown={() => handleMouseDown(m)} // Mousedown للضغط الطويل
                onMouseUp={handleMouseUp} // Mouseup لإلغاء الضغط الطويل
                onMouseLeave={handleMouseUp} // إلغاء عند مغادرة المنطقة
                onTouchStart={() => handleMouseDown(m)} // Touch للهواتف
                onTouchEnd={handleMouseUp} // Touch end للهواتف
                onContextMenu={(e) => handleContextMenu(e, m)} // Right click للقائمة السياقية
              >
                {/* Reply Button - يظهر عند hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // منع تفعيل الضغط الطويل
                    handleQuickReply(m);
                  }}
                  className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full z-10 shadow-sm"
                  style={{
                    top: `${scale(8)}px`,
                    [isRTL ? 'left' : 'right']: `${scale(8)}px`,
                    padding: `${scale(6)}px`,
                    borderRadius: `${scale(20)}px`,
                    backgroundColor: 'var(--color-surface-secondary)',
                    color: 'var(--color-text-secondary)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)'}
                  title={t('chat.bubble.replyTooltip')}
                >
                  <svg width={scale(16)} height={scale(16)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6M3 10l6-6"/>
                  </svg>
                </button>

                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: `${scale(12)}px` }}
                >
                  <span
                    className="font-ibm-arabic-semibold"
                    style={{
                      fontSize: `${scale(13 + (size || 0))}px`,
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {senderName || t('chat.bubble.unknownSender')}
                  </span>
                  <span
                    style={{
                      fontSize: `${scale(11 + (size || 0))}px`,
                      color: 'var(--color-text-tertiary)'
                    }}
                  >
                    {formatDate(((m as any).timeminet || (m as any).Date) as string)}
                  </span>
                </div>

                {/* عرض الرسالة المرد عليها إن وجدت */}
                {(m as any).Reply && Object.keys((m as any).Reply).length > 0 && (
                  <div
                    className="bg-gray-50 rounded-lg"
                    style={{
                      marginBottom: `${scale(16)}px`,
                      padding: `${scale(12)}px`,
                      borderRadius: `${scale(8)}px`,
                      [isRTL ? 'borderRight' : 'borderLeft']: '4px solid var(--color-primary)',
                      backgroundColor: 'var(--color-surface-secondary)'
                    }}
                  >
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: `${scale(6)}px` }}
                    >
                      <div
                        className="text-gray-600"
                        style={{ fontSize: `${scale(11 + (size || 0))}px` }}
                      >
                        {t('chat.bubble.replyToPrefix')}: {(m as any).Reply.Sender}
                      </div>
                      <div
                        className="text-gray-500"
                        style={{ fontSize: `${scale(10 + (size || 0))}px` }}
                      >
                        {formatShortTime((m as any).Reply.Date)}
                      </div>
                    </div>
                    <div
                      className="text-gray-800 truncate"
                      style={{
                        fontSize: `${scale(12 + (size || 0))}px`,
                        fontFamily: fonts.IBMPlexSansArabicRegular
                      }}
                    >
                      {(m as any).Reply.Data}
                    </div>
                  </div>
                )}
                {((m as any).message || m.text) && (
                  <div style={{ marginBottom: `${scale(16)}px` }}>
                    <p
                      className="text-gray-900"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicRegular,
                        fontSize: `${scale(14 + (size || 0))}px`,
                        lineHeight: 1.6,
                        color: colors.BLACK,
                        margin: 0,
                        wordWrap: 'break-word'
                      }}
                    >
                      {(m as any).message || m.text}
                    </p>
                  </div>
                )}
                {fileName && (
                  <div className="mt-2">
                    {isImage ? (
                      <img
                        onClick={() => setPreview({ type: 'image', url: `https://storage.googleapis.com/demo_backendmoshrif_bucket-1/${fileName}` })}
                        src={`https://storage.googleapis.com/demo_backendmoshrif_bucket-1/${fileName}`}
                        alt={fileName}
                        className="max-h-64 rounded-lg cursor-zoom-in"
                      />
                    ) : isVideo ? (
                      <video
                        onClick={() => setPreview({ type: 'video', url: `https://storage.googleapis.com/demo_backendmoshrif_bucket-1/${fileName}` })}
                        src={`https://storage.googleapis.com/demo_backendmoshrif_bucket-1/${fileName}`}
                        controls
                        className="max-h-64 rounded-lg"
                      />
                    ) : (
                      <a href={`https://storage.googleapis.com/demo_backendmoshrif_bucket-1/${fileName}`} target="_blank" className="text-blue underline" rel="noreferrer">{t('chat.bubble.downloadFile')}</a>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        {/* مرجع للتمرير لآخر رسالة */}
        <div ref={messagesEndRef} className="h-4" />
      </div>
      </ContentSection>


      {/* Chat Input Bar - Fixed at Bottom */}
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
              borderColor: 'var(--color-primary)' + '30',
              direction: isRTL ? 'rtl' : 'ltr'
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
                {t('chat.replyingTo')}: {(replyToMessage as any).Sender || (replyToMessage as any).userName || t('common.unknown')}
              </div>
              <button
                onClick={() => setReplyToMessage(null)}
                className="transition-colors"
                style={{
                  padding: `${scale(8)}px`,
                  borderRadius: `${scale(4)}px`,
                  fontSize: `${scale(16)}px`,
                  color: 'var(--color-primary)'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary-dark)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                title={t('chat.cancelReply')}
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
              {(replyToMessage as any).message || (replyToMessage as any).text || t('chat.message')}
            </div>
          </div>
        )}

        <div style={{ padding: `${scale(20)}px` }}>
        <div
          className="flex items-end"
          style={{ gap: `${scale(12)}px` }}
        >
          {/* قائمة الإرفاق المنسدلة الجديدة */}
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

          <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />

          <textarea
            ref={textareaRef}
            value={text}
            onChange={onTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={t('chat.typeMessage')}
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
              direction: dir as 'ltr' | 'rtl',
              textAlign: isRTL ? 'right' : 'left'
            }}
          />

          <button
            onClick={handleSend}
            disabled={!text.trim()}
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
            aria-label={t('chat.send')}
            title={t('chat.send')}
          >
            {t('chat.send')}
          </button>
        </div>
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setPreview(null)}>
          <div className="max-w-4xl max-h-[85vh] p-2" onClick={(e) => e.stopPropagation()}>
            {preview.type === 'image' ? (
              <img src={preview.url} alt={t('chat.imagePreview')} className="max-h-[80vh] max-w-full rounded-xl" />
            ) : (
              <video src={preview.url} controls autoPlay className="max-h-[80vh] max-w-full rounded-xl" />
            )}
          </div>
        </div>
      )}

      {/* Context Menu - قائمة الخيارات */}
      {contextMenu && (
        <MessageContextMenu
          message={contextMenu.message}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onReply={() => {
            setReplyToMessage(contextMenu.message);
            setTimeout(() => textareaRef.current?.focus(), 100);
          }}
          onInfo={() => setShowMessageInfo(contextMenu.message)}
          onCopy={() => handleCopyMessage(contextMenu.message)}
          onDelete={() => handleDeleteMessage(contextMenu.message)}
          onResend={() => handleResendMessage(contextMenu.message)}
          currentUserName={((user?.data?.userName as string) || (user as any)?.userName || '') as string}
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