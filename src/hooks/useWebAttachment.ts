'use client';

import { useState, useCallback } from 'react';

interface FileData {
  uri: string;
  name: string;
  type: string;
  size: number;
  uriImage?: string; // للفيديوهات - صورة مصغرة
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export default function useWebAttachment() {
  const [videoLoading, setVideoLoading] = useState(false);

  // التقاط صورة من الكاميرا (مع تحسينات ودعم بديل للأجهزة غير المدعومة)
  const capturePhoto = useCallback(async (): Promise<FileData | null> => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        return await captureViaInput('image/*', 'environment');
      }
      const result = await showUnifiedCameraOverlay('photo', 'environment');
      if (!result) return null;
      const url = URL.createObjectURL(result.blob);
      return { uri: url, name: `photo_${Date.now()}.jpg`, type: 'image/jpeg', size: result.blob.size };
    } catch (error) {
      console.error('Error capturing photo:', error);
      return await captureViaInput('image/*', 'environment');
    }
  }, []);

  // تسجيل فيديو من الكاميرا (مع كشف نوع MIME ومسار احتياطي)
  const captureVideo = useCallback(async (): Promise<FileData | null> => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        return await captureViaInput('video/*', 'environment');
      }
      const result = await showUnifiedCameraOverlay('video', 'environment');
      if (!result) return null;
      const url = URL.createObjectURL(result.blob);
      const type = result.blob.type || 'video/webm';
      const ext = type.includes('mp4') ? 'mp4' : 'webm';
      return { uri: url, name: `video_${Date.now()}.${ext}`, type, size: result.blob.size, uriImage: result.thumbnail };
    } catch (error) {
      console.error('Error capturing video:', error);
      return await captureViaInput('video/*', 'environment');
    }
  }, []);

  // اختيار ملف من الجهاز
  const selectFile = useCallback(async (): Promise<FileData | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar';

      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          resolve({
            uri: url,
            name: file.name,
            type: file.type,
            size: file.size
          });
        } else {
          resolve(null);
        }
      };

      input.click();
    });
  }, []);

  // اختيار فيديو من الجهاز
  const selectVideo = useCallback(async (): Promise<FileData | null> => {
    setVideoLoading(true);

    try {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';

        input.onchange = async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file) {
            const url = URL.createObjectURL(file);

            // إنشاء صورة مصغرة للفيديو
            const thumbnail = await generateVideoThumbnail(url);

            resolve({
              uri: url,
              name: file.name,
              type: file.type,
              size: file.size,
              uriImage: thumbnail
            });
          } else {
            resolve(null);
          }
          setVideoLoading(false);
        };

        input.click();
      });
    } catch (error) {
      console.error('Error selecting video:', error);
      setVideoLoading(false);
      return null;
    }
  }, []);

  // مشاركة الموقع الحالي
  const shareLocation = useCallback(async (): Promise<{ type: 'location'; data: LocationData } | null> => {
    if (!navigator.geolocation) {
      alert('الموقع الجغرافي غير مدعوم في هذا المتصفح');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            type: 'location',
            data: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now()
            }
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('لا يمكن الحصول على الموقع. تأكد من السماح بالوصول للموقع.');
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  return {
    capturePhoto,
    captureVideo,
    selectFile,
    selectVideo,
    shareLocation,
    videoLoading
  };
}

// مسار بديل لفتح كاميرا/التقاط نظام التشغيل عبر <input capture>
async function captureViaInput(accept: string, capture?: 'environment' | 'user'): Promise<FileData | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    if (capture) (input as any).capture = capture; // مدعوم في متصفحات الجوال
    input.onchange = () => {
      const file = (input as HTMLInputElement).files?.[0];
      if (!file) { resolve(null); return; }
      const url = URL.createObjectURL(file);
      resolve({ uri: url, name: file.name, type: file.type || (accept.includes('image') ? 'image/jpeg' : 'video/mp4'), size: file.size });
    };
    input.click();
  });
}


// دالة مساعدة لإنشاء صورة مصغرة للفيديو
async function generateVideoThumbnail(videoUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';

    video.onloadeddata = () => {


      video.currentTime = 1; // الثانية الأولى
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const thumbnailUrl = URL.createObjectURL(blob);
          resolve(thumbnailUrl);
        } else {
          resolve('');
        }
      }, 'image/jpeg', 0.7);
    };

    video.onerror = () => {
      resolve('');
    };
  });
}

// دالة مساعدة لإظهار واجهة تسجيل الفيديو
function showVideoRecordingInterface(mediaRecorder: MediaRecorder, stream: MediaStream) {
  // إنشاء واجهة بسيطة للتحكم في التسجيل
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    color: white;
    font-family: Arial, sans-serif;
  `;

  const video = document.createElement('video');
  video.srcObject = stream;
  video.autoplay = true;
  video.muted = true;
  (video as any).playsInline = true;
  video.style.cssText = `
    max-width: 80%;
    max-height: 60%;
    border-radius: 10px;
  `;

  const controls = document.createElement('div');
  controls.style.cssText = `
    margin-top: 20px;
    display: flex;

    gap: 20px;
  `;

  overlay.appendChild(video);
  overlay.appendChild(controls);
  document.body.appendChild(overlay);
}

// واجهة موحّدة للكاميرا (مع قلب الكاميرا والصور/الفيديو + إيقاف مؤقت)
async function showUnifiedCameraOverlay(initialMode: 'photo' | 'video', initialFacing: 'environment' | 'user') {
  return new Promise<{ blob: Blob; thumbnail?: string }>((resolve) => {
    let currentFacing: 'environment' | 'user' = initialFacing;
    let currentMode: 'photo' | 'video' = initialMode;
    let stream: MediaStream | null = null;
    let mediaRecorder: MediaRecorder | null = null;
    let chunks: BlobPart[] = [];

    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;`;

    const topBar = document.createElement('div');
    topBar.style.cssText = `position:absolute;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:center;`;

    const modeToggle = document.createElement('button');
    modeToggle.textContent = currentMode === 'photo' ? 'وضع: صورة' : 'وضع: فيديو';
    modeToggle.style.cssText = `padding:8px 12px;background:#1f2937;border:none;border-radius:8px;color:#fff;cursor:pointer;`;

    const flipBtn = document.createElement('button');
    flipBtn.textContent = 'تبديل الكاميرا';
    flipBtn.style.cssText = `padding:8px 12px;background:#111827;border:none;border-radius:8px;color:#fff;cursor:pointer;`;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'إغلاق';
    closeBtn.style.cssText = `padding:8px 12px;background:#dc3545;border:none;border-radius:8px;color:#fff;cursor:pointer;`;

    topBar.appendChild(modeToggle);
    topBar.appendChild(flipBtn);
    topBar.appendChild(closeBtn);

    const video = document.createElement('video');
    video.autoplay = true; video.muted = true; (video as any).playsInline = true;
    video.style.cssText = `max-width:90vw;max-height:70vh;border-radius:10px;`;

    const bottomBar = document.createElement('div');
    bottomBar.style.cssText = `margin-top:16px;display:flex;gap:12px;`;

    const captureBtn = document.createElement('button');
    captureBtn.textContent = currentMode === 'photo' ? 'التقاط' : 'بدء التسجيل';
    captureBtn.style.cssText = `padding:12px 20px;background:#10b981;border:none;border-radius:999px;color:#fff;font-size:16px;cursor:pointer;`;

    const pauseBtn = document.createElement('button');
    pauseBtn.textContent = 'إيقاف مؤقت';
    pauseBtn.style.cssText = `padding:10px 16px;background:#6b7280;border:none;border-radius:8px;color:#fff;cursor:pointer;display:none;`;

    const stopBtn = document.createElement('button');
    stopBtn.textContent = 'إيقاف';
    stopBtn.style.cssText = `padding:10px 16px;background:#ef4444;border:none;border-radius:8px;color:#fff;cursor:pointer;display:none;`;

    bottomBar.appendChild(captureBtn);
    bottomBar.appendChild(pauseBtn);
    bottomBar.appendChild(stopBtn);

    overlay.appendChild(topBar);
    overlay.appendChild(video);
    overlay.appendChild(bottomBar);
    document.body.appendChild(overlay);

    const cleanup = () => {
      try { if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop(); } catch {}
      try { stream?.getTracks().forEach(t => t.stop()); } catch {}
      try { overlay.remove(); } catch {}
    };

    async function startStream() {
      try {
        if (stream) stream.getTracks().forEach(t => t.stop());
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: currentFacing }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: currentMode === 'video'
        });
        video.srcObject = stream;
      } catch (e) {
        // Fallback: input capture
        cleanup();
        resolve(null as any);
      }
    }

    function pickMime(): string {
      const c = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
      for (const t of c) { if ((window as any).MediaRecorder?.isTypeSupported?.(t)) return t; }
      return '';
    }

    modeToggle.onclick = () => {
      currentMode = currentMode === 'photo' ? 'video' : 'photo';
      modeToggle.textContent = currentMode === 'photo' ? 'وضع: صورة' : 'وضع: فيديو';
      captureBtn.textContent = currentMode === 'photo' ? 'التقاط' : 'بدء التسجيل';
      // إعادة فتح الصوت فقط عند الفيديو
      startStream();
    };

    flipBtn.onclick = () => {
      // لا نسمح بالتبديل أثناء التسجيل لتجنب مشاكل التدفق
      if (mediaRecorder && (mediaRecorder as any).state !== 'inactive') {
        return;
      }
      currentFacing = currentFacing === 'environment' ? 'user' : 'environment';
      startStream();
    };

    closeBtn.onclick = () => { cleanup(); resolve(null as any); };

    captureBtn.onclick = async () => {
      if (currentMode === 'photo') {
        const w = video.videoWidth, h = video.videoHeight;
        const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d'); ctx?.drawImage(video, 0, 0, w, h);
        canvas.toBlob((blob) => { if (blob) { cleanup(); resolve({ blob }); } }, 'image/jpeg', 0.9);
      } else {
        // start recording
        try {
          const mime = pickMime();
          chunks = [];
          mediaRecorder = mime ? new MediaRecorder(stream as MediaStream, { mimeType: mime }) : new MediaRecorder(stream as MediaStream);
          mediaRecorder.ondataavailable = (e) => { if (e.data?.size > 0) chunks.push(e.data); };
          mediaRecorder.onstop = async () => {
            const type = (chunks[0] as any)?.type || 'video/webm';
            const blob = new Blob(chunks, { type });
            const url = URL.createObjectURL(blob);
            const thumbnail = await generateVideoThumbnail(url);
            // إعادة تمكين الأزرار
            flipBtn.removeAttribute('disabled');
            flipBtn.style.opacity = '1';
            flipBtn.style.pointerEvents = 'auto';
            modeToggle.removeAttribute('disabled');
            modeToggle.style.opacity = '1';
            modeToggle.style.pointerEvents = 'auto';
            cleanup();
            resolve({ blob, thumbnail });
          };
          mediaRecorder.start();
          captureBtn.style.display = 'none';
          stopBtn.style.display = 'inline-block';
          // تعطيل التبديل بين الكاميرا/الوضع أثناء التسجيل
          flipBtn.setAttribute('disabled', 'true');
          flipBtn.style.opacity = '0.6';
          flipBtn.style.pointerEvents = 'none';
          modeToggle.setAttribute('disabled', 'true');
          modeToggle.style.opacity = '0.6';
          modeToggle.style.pointerEvents = 'none';
          // عرض زر الإيقاف المؤقت فقط إذا مدعوم
          if (typeof mediaRecorder.pause === 'function' && typeof mediaRecorder.resume === 'function') {
            pauseBtn.style.display = 'inline-block';
          }
        } catch (e) {
          cleanup(); resolve(null as any);
        }
      }
    };

    pauseBtn.onclick = () => {
      if (!mediaRecorder) return;
      if ((mediaRecorder as any).state === 'recording') { mediaRecorder.pause(); pauseBtn.textContent = 'استئناف'; }
      else if ((mediaRecorder as any).state === 'paused') { mediaRecorder.resume(); pauseBtn.textContent = 'إيقاف مؤقت'; }
    };

    stopBtn.onclick = () => { try { mediaRecorder?.stop(); } catch {} };

    // ابدأ البث
    startStream();
  });
}
