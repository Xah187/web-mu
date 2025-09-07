'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/store';
import axiosInstance from '@/lib/api/axios';
import socketService from '@/lib/socket/socketService';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';



interface ChatMessage {
  chatID?: number;
  idSendr?: string;
  ProjectID?: number;
  StageID?: string;
  Sender?: string;
  userName?: string;
  text?: string;
  message?: string;
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

  const ProjectID = search.get('ProjectID') || '';
  const typess = search.get('typess') || '';
  const nameRoom = search.get('nameRoom') || typess || 'الدردشة';
  const nameProject = search.get('nameProject') || '';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  // Reply functionality - مثل الواتساب
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

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
      const key = `${m?.chatID ?? ''}|${(m as any)?.idSendr ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(m);
    }
    return result;
  };



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

    // Helpers: normalize server messages (File may arrive as JSON string)
    const guessKind = (name?: string, type?: string) => {
      const ext = (name || '').split('.').pop()?.toLowerCase();
      if ((type || '').startsWith('image/') || ['jpg','jpeg','png','gif','webp','bmp','svg','heic'].includes(ext||'')) return 'image';
      if ((type || '').startsWith('video/') || ['mp4','mov','m4v','webm','avi','mkv'].includes(ext||'')) return 'video';
      return 'file';
    };
    const normalizeMessage = (m: any) => {
      let File = m?.File;
      if (typeof File === 'string') {
        try { File = JSON.parse(File); } catch {}
      }
      let Reply = m?.Reply;
      if (typeof Reply === 'string') {
        try { Reply = JSON.parse(Reply); } catch {}
      }
      if (File && typeof File === 'object') {
        if (!File.type && File.name) {
          const kind = guessKind(File.name, undefined);
          File.type = kind === 'image' ? 'image/*' : kind === 'video' ? 'video/*' : 'application/octet-stream';
        }
      }
      return { ...m, File, Reply } as any;
    };
    const gcsUrl = (name: string) => `https://storage.googleapis.com/demo_backendmoshrif_bucket-1/${encodeURIComponent(name)}`;

    if (!navigator?.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const senderName = user?.data?.userName || user?.userName || 'User';
      const payload: any = { ProjectID: parseInt(ProjectID), StageID: typess, userName: senderName, Sender: senderName, message: url, File: {}, Reply: {}, Date: new Date().toISOString() };
      setMessages((p) => [...p, payload]);
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
        setMessages(normalized as ChatMessage[]);
      } catch (e) {
        // ignore for now
      } finally {
        setLoading(false);
      }
    };

    load();

    // Listen for incoming messages
    const handleReceived = (msg: ChatMessage) => {
      const n = normalizeMessage(msg);
      setMessages((prev) => [...prev, n]);
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
      } catch (e) {
        // ignore
      }
    };
    markViewed();

    return () => {
      socketService.off('received_message', handleReceived);
    };
  }, [ProjectID, typess]);

  // Upload state (placeholder UI)
  const [uploading, setUploading] = useState<Uploading | null>(null);

  // Image/Video preview modal
  const [preview, setPreview] = useState<{ type: 'image' | 'video'; url: string } | null>(null);

  // File input ref
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);



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

      // Insert chat record referencing File.name
      const payload: any = {
        idSendr: buildIdSendr(),
        ProjectID: parseInt(ProjectID),
        StageID: typess,
        userName: user?.data?.userName || user?.userName || 'مستخدم',
        Sender: user?.data?.userName || user?.userName || 'مستخدم',
        message: '',
        timeminet: new Date().toISOString(),
        File: { name: nameFile, type: file.type || 'application/octet-stream' },
        Reply: {},
        arrived: false,
        kind: 'new',
      };
      const inserted = await axiosInstance.post('/Chate/insertdatafile', payload);
      const chatID = inserted.data?.chatID;
      setUploading(null);

      // عرض الرسالة فورياً
      setMessages((prev) => [...prev, { ...payload, chatID, Date: new Date().toISOString() }]);
      // السيرفر سيبث received_message الذي يحمل نفس البيانات النهائية

    } catch (e: any) {
      setUploading(null);
      setErrorMsg('تعذر رفع الملف. تحقق من الاتصال وحاول مرة أخرى.');
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

    // Optimistic UI
    setMessages((prev) => [...prev, messagePayload]);
    setText('');
    setReplyToMessage(null); // إلغاء الرد بعد الإرسال

    // Emit to socket - backend will persist and broadcast
    socketService.emit('send_message', messagePayload);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0"
        style={{ borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}
      >
        <div className="flex items-center justify-between p-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>
          <div className="text-center">
            <h1
              className="text-lg font-bold text-gray-900"
              style={{ fontFamily: fonts.IBMPlexSansArabicBold, fontSize: verticalScale(18 + (size||0)) }}
            >
              {nameRoom}
            </h1>
            {nameProject ? (
              <p className="text-sm text-gray-600" style={{ fontFamily: fonts.IBMPlexSansArabicRegular }}>
                {nameProject}
              </p>
            ) : null}

          </div>
          <div className="w-10"></div>
        </div>
      </div>
      {uploading && (
        <div className="fixed bottom-20 right-4 bg-white shadow-lg border border-gray-200 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue animate-spin"></div>
            <div>
              <div className="text-sm font-ibm-arabic-semibold text-gray-800">جاري الرفع...</div>
              <div className="text-xs text-gray-600">{uploading.progress.toFixed(0)}%</div>
            </div>
          </div>
        </div>
      )}


      {/* Messages */}
      <div className="p-4 space-y-3" style={{ paddingBottom: '180px' }}>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
      {uploading && (
        <div className="fixed bottom-20 right-4 bg-white shadow-lg border border-gray-200 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue animate-spin"></div>
            <div>
              <div className="text-sm font-ibm-arabic-semibold text-gray-800">جاري الرفع...</div>
              <div className="text-xs text-gray-600">{uploading.progress.toFixed(0)}%</div>
            </div>
          </div>
        </div>
      )}

            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد رسائل بعد</h3>
            <p className="text-gray-600">ابدأ المحادثة الآن</p>
          </div>
        ) : (
          (messages || []).filter(Boolean).map((m, idx) => {
            const mObj = (m as any) || {};
            const senderName = (mObj.userName ?? mObj.Sender ?? '') as string;
            const currentUserName = ((user?.data?.userName as string) || (user as any)?.userName || '') as string;
            const mine = (senderName?.toLowerCase?.() || '') === (currentUserName?.toLowerCase?.() || '');
            const fileName = (m as any).File?.name as string | undefined;
            const fileType = (m as any).File?.type as string | undefined;
            const isImage = fileType?.startsWith('image/');
            const isVideo = fileType?.startsWith('video/');
            return (
              <div
                key={idx}
                className={`max-w-[80%] rounded-2xl p-3 shadow-sm border ${mine ? 'ml-auto bg-blue-50 border-blue-100' : 'mr-auto bg-white border-gray-100'} group relative cursor-pointer select-none`}
                onDoubleClick={() => setReplyToMessage(m)} // Double click للرد
                onMouseDown={() => handleMouseDown(m)} // Mousedown للضغط الطويل
                onMouseUp={handleMouseUp} // Mouseup لإلغاء الضغط الطويل
                onMouseLeave={handleMouseUp} // إلغاء عند مغادرة المنطقة
                onTouchStart={() => handleMouseDown(m)} // Touch للهواتف
                onTouchEnd={handleMouseUp} // Touch end للهواتف
              >
                {/* Reply Button - يظهر عند hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // منع تفعيل الضغط الطويل
                    handleQuickReply(m);
                  }}
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 rounded-full p-1 z-10"
                  title="رد على هذه الرسالة"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6M3 10l6-6"/>
                  </svg>
                </button>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 font-ibm-arabic-semibold">{senderName || 'غير معروف'}</span>
                  <span className="text-xs text-gray-400">{formatDate(((m as any).timeminet || (m as any).Date) as string)}</span>
                </div>

                {/* عرض الرسالة المرد عليها إن وجدت */}
                {(m as any).Reply && Object.keys((m as any).Reply).length > 0 && (
                  <div className="mb-2 p-2 bg-gray-100 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-gray-600">رد على: {(m as any).Reply.Sender}</div>
                      <div className="text-xs text-gray-500">
                        {formatShortTime((m as any).Reply.Date)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-800 truncate">{(m as any).Reply.Data}</div>
                  </div>
                )}
                            {((m as any).message || m.text) && (
                  <p className="text-gray-900" style={{ fontFamily: fonts.IBMPlexSansArabicRegular, fontSize: scale(14 + (size||0)) }}>
                    {(m as any).message || m.text}
                  </p>
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
                      <a href={`https://storage.googleapis.com/demo_backendmoshrif_bucket-1/${fileName}`} target="_blank" className="text-blue underline" rel="noreferrer">تحميل الملف</a>
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

      {/* Chat Input Bar - Fixed at Bottom */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-300 shadow-lg z-50">
        {/* Reply Preview - داخل البار الثابت */}
        {replyToMessage && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-blue-600 font-medium">
                رد على: {(replyToMessage as any).Sender || (replyToMessage as any).userName || 'غير معروف'}
              </div>
              <button
                onClick={() => setReplyToMessage(null)}
                className="text-blue-400 hover:text-blue-600"
                title="إلغاء الرد"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-600 truncate">
              {(replyToMessage as any).message || (replyToMessage as any).text || 'رسالة'}
            </div>
          </div>
        )}

        <div className="p-4">
        <div className="flex items-end gap-2">
          <button onClick={() => fileInputRef.current?.click()} title="Attach file" className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15V8a5 5 0 0 0-10 0v9a3 3 0 0 0 6 0V9"/></svg>
          </button>
          {errorMsg && (
            <div className="absolute bottom-16 left-4 right-4 sm:static sm:bottom-auto sm:left-auto sm:right-auto sm:mt-2">
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm">
                {errorMsg}
              </div>
            </div>
          )}

          <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />

          <button onClick={handleShareMyLocation} title="مشاركة الموقع" className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.36 6.36-1.41-1.41M6.05 6.05 4.64 4.64M17.36 6.64l-1.41 1.41M6.64 17.36l-1.41-1.41"/><circle cx="12" cy="12" r="3"/></svg>
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={onTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="اكتب رسالة..."
            className="flex-1 resize-none leading-6 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontFamily: fonts.IBMPlexSansArabicRegular, maxHeight: 160 }}
          />

          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="إرسال"
            title="إرسال"
            style={{ fontFamily: fonts.IBMPlexSansArabicMedium, fontSize: scale(14 + (size || 0)) }}
          >
            إرسال
          </button>
        </div>
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setPreview(null)}>
          <div className="max-w-4xl max-h-[85vh] p-2" onClick={(e) => e.stopPropagation()}>
            {preview.type === 'image' ? (
              <img src={preview.url} className="max-h-[80vh] max-w-full rounded-xl" />
            ) : (
              <video src={preview.url} controls autoPlay className="max-h-[80vh] max-w-full rounded-xl" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

