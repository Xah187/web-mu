'use client';

import React, { useRef, useEffect, useState } from 'react';

interface Post {
  PostID: number;
  postBy: string;
  Data: string; // Changed from text to Data to match usePosts
  url?: string; // Made optional to match usePosts
  Likes: number; // Changed from Like to Likes to match usePosts
  Comment: number;
  timeminet: string;
  Nameproject?: string;
  StageName?: string;
  isLiked?: boolean;
}

interface ReelItemProps {
  post: Post;
  isActive: boolean;
  onLike: () => void;
  onComment: () => void;
  onCommentPress: () => void;
  onShare: () => void;
  onSave: () => void;
  onExit: () => void;
}

export default function ReelItem({
  post,
  isActive,
  onLike,
  onComment,
  onCommentPress,
  onShare,
  onSave,
  onExit
}: ReelItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // تشغيل الصوت تلقائياً
  const [showControls, setShowControls] = useState(false);

  // بناء URL الفيديو
  const STORAGE_URL = 'https://storage.googleapis.com/demo_backendmoshrif_bucket-1';
  const videoUrl = post.url
    ? (post.url.startsWith('http') ? post.url : `${STORAGE_URL}/${post.url}`)
    : '';

  // تشغيل/إيقاف الفيديو مع صوت تلقائي (مطابق للتيك توك)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoAction = async () => {
      if (isActive) {
        try {
          // إعادة تعيين الفيديو للبداية عند التنشيط
          video.currentTime = 0;

          // تشغيل الصوت تلقائياً
          video.muted = false;
          setIsMuted(false);

          // تشغيل الفيديو مع معالجة الأخطاء
          await video.play();
          setIsPlaying(true);
          console.log(`✅ تم تشغيل الفيديو مع الصوت: ${post.PostID}`);
        } catch (error) {
          // إذا فشل تشغيل الصوت، جرب بدون صوت
          try {
            video.muted = true;
            setIsMuted(true);
            await video.play();
            setIsPlaying(true);
            console.log(`✅ تم تشغيل الفيديو بدون صوت: ${post.PostID}`);
          } catch (secondError) {
            console.error(`❌ خطأ في تشغيل الفيديو ${post.PostID}:`, secondError);
            setIsPlaying(false);
          }
        }
      } else {
        // إيقاف الفيديو فوراً عند عدم التنشيط
        video.pause();
        setIsPlaying(false);
        console.log(`⏸️ تم إيقاف الفيديو: ${post.PostID}`);
      }
    };

    // تأخير قصير لضمان الانتقال السلس
    const timeoutId = setTimeout(handleVideoAction, 100);

    // تنظيف عند إلغاء التحميل
    return () => {
      clearTimeout(timeoutId);
      if (video && !video.paused) {
        video.pause();
      }
    };
  }, [isActive, post.PostID]);

  // التعامل مع النقر على الفيديو (مطابق للتيك توك)
  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video || !isActive) return; // فقط إذا كان الفيديو نشط

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      console.log(`تم إيقاف الفيديو بالنقر: ${post.PostID}`);
    } else {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log(`تم تشغيل الفيديو بالنقر: ${post.PostID}`);
          })
          .catch(console.error);
      }
    }
  };

  // التعامل مع كتم/إلغاء كتم الصوت
  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // إخفاء الضوابط بعد فترة
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  // دالة لإنشاء لون فريد بناءً على اسم المستخدم
  const getAvatarColor = (name: string) => {
    const colors = [
      '#4F46E5', '#059669', '#DC2626', '#7C3AED', 
      '#EA580C', '#0891B2', '#BE185D', '#65A30D'
    ];
    
    if (!name) return colors[0];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      if (diffDays < 7) return `منذ ${diffDays} أيام`;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  return (
    <div
      className="absolute inset-0 w-full bg-black"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0, // يملأ كامل حاوية الريلز حتى حافة الشريط الأبيض
        touchAction: 'none', // منع أي حركة
        userSelect: 'none', // منع تحديد النص
        WebkitUserSelect: 'none', // منع تحديد النص على Safari
        WebkitTouchCallout: 'none', // منع قائمة السياق على iOS
        overflow: 'hidden' // منع أي تمرير
      }}
    >
      {/* الفيديو ثابت تماماً مع صوت تلقائي */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        style={{
          touchAction: 'none', // منع أي تفاعل حركي
          userSelect: 'none', // منع تحديد النص
          WebkitUserSelect: 'none' // منع تحديد النص على Safari
        }}
        src={videoUrl}
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        controls={false}
        onClick={handleVideoClick}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onTouchStart={(e) => e.stopPropagation()} // منع تمرير اللمس
        onTouchMove={(e) => e.preventDefault()} // منع الحركة
        onTouchEnd={(e) => e.stopPropagation()} // منع تمرير اللمس
      />

      {/* طبقة شفافة للتحكم */}
      <div 
        className="absolute inset-0 z-10"
        onClick={handleVideoClick}
        onMouseEnter={() => setShowControls(true)}
      />

      {/* أيقونة التشغيل/الإيقاف */}
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-20 h-20 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            {isPlaying ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            )}
          </div>
        </div>
      )}

      {/* أزرار التفاعل - يمين الشاشة مع مساحة آمنة من البار السفلي */}
      <div className="absolute right-4 bottom-[calc(var(--reels-bottom-offset)+1rem)] z-30 flex flex-col space-y-3">
        {/* لايك - مُفعل ومحسن */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="flex flex-col items-center space-y-1 touch-manipulation"
        >
          <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all active:scale-95">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={post.isLiked ? "#ff3040" : "none"}
              stroke={post.isLiked ? "#ff3040" : "white"}
              strokeWidth="2"
              className="transition-all duration-200"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <span className="text-white text-xs font-ibm-arabic-medium">{post.Likes}</span>
        </button>

        {/* تعليقات - محسن */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCommentPress();
          }}
          className="flex flex-col items-center space-y-1 touch-manipulation"
        >
          <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all active:scale-95">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="transition-all duration-200">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span className="text-white text-xs font-ibm-arabic-medium">{post.Comment}</span>
        </button>




      </div>

      {/* معلومات المستخدم والوصف - أسفل يسار مع مساحة آمنة من البار السفلي */}
      <div className="absolute left-4 bottom-[calc(var(--reels-bottom-offset)+1rem)] z-30 max-w-[60%]">
        {/* معلومات المستخدم */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
          {/* أفاتار المستخدم */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-ibm-arabic-bold border-2 border-white"
            style={{ backgroundColor: getAvatarColor(post.postBy) }}
          >
            {post.postBy?.charAt(0) || 'م'}
          </div>
          
          {/* اسم المستخدم */}
          <div>
            <h3 className="text-white font-ibm-arabic-semibold text-lg">
              {post.postBy}
            </h3>
            {(post.Nameproject || post.StageName) && (
              <p className="text-gray-300 text-sm">
                {post.Nameproject && post.StageName 
                  ? `${post.Nameproject} - ${post.StageName}`
                  : post.Nameproject || post.StageName
                }
              </p>
            )}
          </div>
        </div>

        {/* وصف الفيديو */}
        {post.Data && (
          <p className="text-white text-base font-ibm-arabic-regular leading-relaxed mb-2">
            {post.Data}
          </p>
        )}

        {/* التاريخ */}
        <p className="text-gray-400 text-sm">
          {formatDate(post.timeminet)}
        </p>
      </div>

      {/* زر كتم/إلغاء كتم الصوت - في المنتصف */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleMuteToggle();
        }}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
      >
        {isMuted ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        )}
      </button>
    </div>
  );
}
