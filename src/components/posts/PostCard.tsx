'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import LikeIcon from '@/components/icons/LikeIcon';
import CommentIcon from '@/components/icons/CommentIcon';
import PlayIcon from '@/components/icons/PlayIcon';
import { URLFIL } from '@/lib/api/axios';

interface PostCardProps {
  post: {
    PostID: number;
    postBy: string;
    Nameproject?: string;
    StageName?: string;
    Data: string;
    timeminet: string;
    url?: string;
    Likes: number;
    Comment: number;
    Likeuser?: boolean;
  };
  onLike: (postId: number) => void;
  onComment: (postId: number) => void;
  onPress?: (post: PostCardProps['post']) => void;
  onCommentPress?: (postId: number) => void;
}

export default function PostCard({ post, onLike, onComment, onPress, onCommentPress }: PostCardProps) {
  const [imageError, setImageError] = useState(false);

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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // تحقق من اليوم الحالي
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      // نفس اليوم - عرض التاريخ والوقت بالميلادي (سنة-شهر-يوم)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return `${year}-${month}-${day} ${timeStr}`;
    } else {
      // يوم مختلف - عرض التاريخ فقط بالميلادي (سنة-شهر-يوم)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };

  const isVideo = post.url?.includes('.mp4') || post.url?.includes('.mov') || post.url?.includes('.avi');
  
  // Convert video URL to thumbnail if needed (like mobile app's convertVideotoimag)
  const getMediaUrl = (url: string) => {
    if (!url) return '';
    // If it's a video, try to get thumbnail version
    if (isVideo) {
      // Mobile app uses PNG thumbnails
      return url.replace(/\.[^/.]+$/, '.png');
    }
    return url;
  };

  // Helper function to build image URL safely - مطابق لآلية التطبيق المحمول
  const buildImageUrl = (url: string) => {
    if (!url) return null;

    // If URL is already absolute, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // استخدام Google Cloud Storage بنفس URLFIL
    return `${URLFIL}/${url.replace(/^\/+/, '')}`;
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 w-full h-full flex flex-col post-card-grid"
      style={{
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(8),
        minHeight: scale(280), // ارتفاع أصغر للشبكة
        maxWidth: '100%' // منع التوسع الزائد
      }}
      onClick={() => onPress?.(post)}
    >
      {/* Header - User Info (optimized for grid) */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          marginTop: scale(8),
          marginLeft: scale(12),
          marginRight: scale(12),
          padding: scale(8)
        }}
      >
        <div className="flex items-start flex-1">
          {/* User Avatar - محسن للشبكة */}
          <div
            className="rounded-full flex items-center justify-center text-white font-ibm-arabic-bold flex-shrink-0"
            style={{
              width: scale(32),
              height: scale(32),
              backgroundColor: getAvatarColor(post.postBy || ''),
              borderRadius: scale(32),
              fontSize: scale(14)
            }}
          >
            {post.postBy?.charAt(0) || 'م'}
          </div>
          
          {/* User Info - محسن للشبكة */}
          <div
            className="flex-1 min-w-0"
            style={{
              marginLeft: scale(8),
              marginRight: scale(8)
            }}
          >
            <div
              className="flex flex-wrap items-center gap-1"
              style={{
                maxWidth: '100%',
                overflow: 'hidden',
                paddingLeft: scale(2),
                paddingRight: scale(2),
                flexWrap: 'wrap'
              }}
            >
              <span
                className="truncate"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  fontSize: verticalScale(10),
                  color: '#212121'
                }}
              >
                {post.postBy}
              </span>
              <span
                style={{
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  fontSize: verticalScale(10),
                  color: '#212121',
                  marginLeft: '2px',
                  marginRight: '2px'
                }}
              >
                في
              </span>
              <span
                style={{
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  fontSize: verticalScale(10),
                  color: '#212121'
                }}
                className="line-clamp-1 truncate"
              >
                {post.Nameproject && post.StageName
                  ? `${post.Nameproject} - ${post.StageName}`
                  : post.Nameproject || post.StageName || ''
                }
              </span>
            </div>
            <div
              style={{
                fontFamily: fonts.IBMPlexSansArabicSemiBold,
                fontSize: verticalScale(9),
                color: '#666666'
              }}
            >
              {formatDate(post.timeminet)}
            </div>
          </div>
        </div>
      </div>

      {/* Body - Content (optimized for grid layout) */}
      <div
        className="flex flex-col justify-center items-center relative flex-1 post-content"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: scale(4),
          marginBottom: scale(4),
          marginLeft: scale(12),
          marginRight: scale(12),
          paddingLeft: scale(8),
          paddingRight: scale(8)
        }}
      >
        {/* Text Content - محسن للشبكة */}
        <p
          className="text-right w-full line-clamp-3"
          style={{
            fontFamily: fonts.IBMPlexSansArabicRegular,
            fontSize: verticalScale(11),
            marginBottom: verticalScale(12),
            color: '#212121',
            lineHeight: '1.4'
          }}
          dir="rtl"
        >
          {post.Data}
        </p>

        {/* Media Content */}
        {post.url && (
          <>
            {/* Play Button for Videos - Positioned absolutely like mobile app */}
            {isVideo && (
              <button
                className="absolute z-10 flex items-center justify-center"
                style={{
                  position: 'absolute',
                  zIndex: 1,
                  top: '50%',
                  alignSelf: 'center'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPress?.(post);
                }}
              >
                <PlayIcon size={48} />
              </button>
            )}
            
            {/* Media Display - محسن للشبكة */}
            <div
              className="relative rounded-2xl overflow-hidden post-media"
              style={{
                backgroundColor: colors.BLACK,
                aspectRatio: '16 / 9', // نسبة أفضل للفيديوهات
                width: '100%',
                borderRadius: 12,
                maxHeight: scale(180) // حد أقصى للارتفاع
              }}
            >
              {!imageError && post.url && buildImageUrl(getMediaUrl(post.url)) ? (
                <Image
                  src={buildImageUrl(getMediaUrl(post.url))!}
                  alt="Post media"
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                  unoptimized={process.env.NODE_ENV === 'development'}
                  priority={false}
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-white text-center">
                    {post.url ? 'لا يمكن تحميل الوسائط' : 'لا توجد وسائط'}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer - Actions (optimized for grid) */}
      <div
        className="flex items-center justify-around flex-shrink-0 mt-auto post-footer"
        style={{
          justifyContent: 'space-around',
          marginTop: scale(8),
          marginBottom: scale(12),
          marginLeft: scale(12),
          marginRight: scale(12),
          alignItems: 'center',
          paddingTop: scale(8),
          paddingBottom: scale(4)
        }}
      >
        {/* Like Button - محسن للشبكة */}
        <button
          className="flex items-center hover:bg-gray-50 transition-colors rounded-lg"
          style={{
            marginLeft: scale(8),
            marginRight: scale(8),
            padding: scale(4)
          }}
          onClick={(e) => {
            e.stopPropagation();
            onLike(post.PostID);
          }}
        >
          <span
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: scale(11),
              color: '#212121',
              marginLeft: scale(6)
            }}
          >
            {post.Likes}
          </span>
          <LikeIcon
            size={18}
            fill={post.Likeuser ? '#FF0F0F' : colors.WHITE}
          />
        </button>

        {/* Separator (matching mobile app SVG) */}
        <svg width="1" height="21" viewBox="0 0 1 21" fill="none">
          <path
            d="M0.5 1L0.499999 20"
            stroke="#EBEBED"
            strokeLinecap="round"
          />
        </svg>

        {/* Comment Button - محسن للشبكة */}
        <button
          className="flex items-center hover:bg-gray-50 transition-colors rounded-lg"
          style={{
            marginLeft: scale(8),
            marginRight: scale(8),
            padding: scale(4)
          }}
          onClick={(e) => {
            e.stopPropagation();
            // استخدام onCommentPress لفتح مودال التعليقات
            if (onCommentPress) {
              onCommentPress(post.PostID);
            } else {
              onComment(post.PostID);
            }
          }}
        >
          <span
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: scale(11),
              color: '#212121',
              marginLeft: scale(6)
            }}
          >
            {post.Comment}
          </span>
          <CommentIcon size={18} />
        </button>
      </div>
    </div>
  );
}