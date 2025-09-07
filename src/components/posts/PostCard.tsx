'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import LikeIcon from '@/components/icons/LikeIcon';
import CommentIcon from '@/components/icons/CommentIcon';
import PlayIcon from '@/components/icons/PlayIcon';

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
      // This matches the mobile app's convertVideotoimag function
      return url.replace(/\.[^/.]+$/, '.jpg'); // Replace extension with .jpg
    }
    return url;
  };

  // URLs للملفات - مطابق لآلية التطبيق المحمول
  const STORAGE_URL = 'https://storage.googleapis.com/demo_backendmoshrif_bucket-1';

  // Helper function to build image URL safely - مطابق لآلية التطبيق المحمول
  const buildImageUrl = (url: string) => {
    if (!url) return null;

    // If URL is already absolute, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // استخدام Google Cloud Storage للملفات
    return `${STORAGE_URL}/${url}`;
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 w-full"
      style={{
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(8)
      }}
      onClick={() => onPress?.(post)}
    >
      {/* Header - User Info (matching mobile app exactly) */}
      <div 
        className="flex items-center justify-between"
        style={{
          marginTop: 13,
          marginLeft: 10,
          marginRight: 10,
          padding: 10
        }}
      >
        <div className="flex items-start flex-1">
          {/* User Avatar - عرض أول حرف من اسم المستخدم */}
          <div
            className="rounded-full flex items-center justify-center text-white font-ibm-arabic-bold"
            style={{
              width: scale(40),
              height: scale(40),
              backgroundColor: getAvatarColor(post.postBy || ''),
              borderRadius: scale(40),
              fontSize: scale(16)
            }}
          >
            {post.postBy?.charAt(0) || 'م'}
          </div>
          
          {/* User Info */}
          <div 
            style={{
              marginLeft: scale(10),
              marginRight: scale(10)
            }}
          >
            <div
              className="flex flex-wrap items-center gap-1"
              style={{
                maxWidth: '95%',
                overflow: 'hidden',
                paddingLeft: scale(5),
                paddingRight: scale(5),
                flexWrap: 'wrap'
              }}
            >
              <span
                style={{
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  fontSize: verticalScale(11),
                  color: '#212121'
                }}
              >
                {post.postBy}
              </span>
              <span
                style={{
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  fontSize: verticalScale(11),
                  color: '#212121',
                  marginLeft: '4px',
                  marginRight: '4px'
                }}
              >
                في
              </span>
              <span
                style={{
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  fontSize: verticalScale(11),
                  color: '#212121'
                }}
                className="line-clamp-2"
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
                fontSize: verticalScale(10),
                color: '#212121'
              }}
            >
              {formatDate(post.timeminet)}
            </div>
          </div>
        </div>
      </div>

      {/* Body - Content (matching mobile app structure) */}
      <div 
        className="flex flex-col justify-center items-center relative"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 1,
          marginBottom: 1,
          marginLeft: 10,
          marginRight: 10,
          paddingLeft: 10,
          paddingRight: 10
        }}
      >
        {/* Text Content */}
        <p 
          className="text-right w-full"
          style={{
            fontFamily: fonts.IBMPlexSansArabicRegular,
            fontSize: verticalScale(12),
            marginBottom: verticalScale(16),
            color: '#212121'
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
            
            {/* Media Display */}
            <div 
              className="relative rounded-2xl overflow-hidden"
              style={{
                backgroundColor: colors.BLACK,
                height: scale(200),
                width: '100%',
                borderRadius: 16,
                top: scale(-10)
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

      {/* Footer - Actions (matching mobile app exactly) */}
      <div 
        className="flex items-center justify-around"
        style={{
          top: '2%',
          justifyContent: 'space-around',
          marginTop: 5,
          marginBottom: 15,
          marginLeft: 15,
          marginRight: 15,
          alignItems: 'center',
          paddingTop: 5,
          paddingBottom: 5
        }}
      >
        {/* Like Button */}
        <button
          className="flex items-center hover:bg-gray-50 transition-colors"
          style={{ marginLeft: 15, marginRight: 15 }}
          onClick={(e) => {
            e.stopPropagation();
            onLike(post.PostID);
          }}
        >
          <span 
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: scale(12),
              color: '#212121',
              marginLeft: 8
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

        {/* Comment Button - مطابق لآلية التطبيق المحمول */}
        <button
          className="flex items-center hover:bg-gray-50 transition-colors"
          style={{ marginLeft: 15, marginRight: 15 }}
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
              fontSize: scale(12),
              color: '#212121',
              marginLeft: 8
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