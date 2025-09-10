'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface VideoPostProps {
  videoUrl: string;
  thumbnailUrl?: string;
  onPlay: () => void;
  className?: string;
}

export default function VideoPost({ videoUrl, thumbnailUrl, onPlay, className = '' }: VideoPostProps) {
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://35.247.12.97:8080';
  
  const buildImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_URL}/${url}`;
  };

  // Convert video URL to thumbnail (like mobile app's convertVideotoimag)
  const getThumbnailUrl = () => {
    if (thumbnailUrl) return buildImageUrl(thumbnailUrl);
    if (videoUrl) {
      // Replace video extension with .jpg
      const thumbnail = videoUrl.replace(/\.[^/.]+$/, '.jpg');
      return buildImageUrl(thumbnail);
    }
    return null;
  };

  return (
    <div 
      className={`relative rounded-xl overflow-hidden bg-black cursor-pointer group ${className}`}
      onClick={onPlay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Thumbnail */}
      {!thumbnailError && getThumbnailUrl() ? (
        <Image
          src={getThumbnailUrl()!}
          alt="Video thumbnail"
          fill
          className="object-cover"
          onError={() => setThumbnailError(true)}
          unoptimized={process.env.NODE_ENV === 'development'}
          priority={false}
        />
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="text-center text-white">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <p className="font-ibm-arabic-medium">فيديو</p>
            <p className="text-xs text-gray-300 mt-1">اضغط للمشاهدة</p>
          </div>
        </div>
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-200" />

      {/* Play Button - مطابق لآلية الدردشات */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`bg-white bg-opacity-90 rounded-full p-4 shadow-lg transition-all duration-200 ${
          isHovered ? 'bg-opacity-100 scale-110' : ''
        }`}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
      </div>

      {/* Video Badge */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1 rtl:space-x-reverse">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
        <span>فيديو</span>
      </div>

      {/* Hover Hint */}
      <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white text-xs px-3 py-1 rounded-full transition-opacity duration-200 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        اضغط لمشاهدة الفيديو
      </div>
    </div>
  );
}
