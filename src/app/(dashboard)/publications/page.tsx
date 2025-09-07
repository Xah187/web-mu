'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import FilterIcon from '@/components/icons/FilterIcon';

import PostCard from '@/components/posts/PostCard';
import FilterModal from '@/components/posts/FilterModal';
import CommentsModal from '@/components/posts/CommentsModal';
import VideoPlayerModal from '@/components/posts/VideoPlayerModal';
import ReelItem from '@/components/reels/ReelItem';
import usePosts, { FilterData } from '@/hooks/usePosts';
import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';
import { Tostget } from '@/components/ui/Toast';

export default function PublicationsPage() {
  const router = useRouter();
  const { user, size } = useAppSelector((state: any) => state.user);
  const { isEmployee } = useJobBasedPermissions();
  
  const [showFilter, setShowFilter] = useState(false);
  const [showComments, setShowComments] = useState<{ postId: number; show: boolean }>({ postId: 0, show: false });
  const [showVideoPlayer, setShowVideoPlayer] = useState<{ show: boolean; videoUrl: string; title: string }>({
    show: false,
    videoUrl: '',
    title: ''
  });

  // Reels mode states
  const [viewMode, setViewMode] = useState<'grid' | 'reels'>('grid');
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [reelHeight, setReelHeight] = useState(0); // ارتفاع كل فيديو
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);

  // Use posts hook
  const companyId = user?.data?.IDCompany;
  const {
    posts,
    branches,
    filterData,
    loading,
    refreshing,
    error,
    hasMore,
    refreshPosts,
    loadMorePosts,
    searchPosts,
    toggleLike,
    addComment,
    clearFilter,
    setFilterData,
    fetchBranches
  } = usePosts(companyId || 0);

  // فلترة الفيديوهات فقط للـ Reels mode
  const videoReels = posts.filter(post => {
    const isVideo = post.url?.includes('.mp4') ||
                   post.url?.includes('.mov') ||
                   post.url?.includes('.avi') ||
                   post.url?.includes('.webm');
    return isVideo && post.url;
  });

  // حساب ارتفاع كل فيديو (ارتفاع الشاشة ناقص الشريط السفلي)
  useEffect(() => {
    const calculateReelHeight = () => {
      const bottomNavHeight = 64; // ارتفاع الشريط السفلي
      const calculatedHeight = window.innerHeight - bottomNavHeight;
      setReelHeight(calculatedHeight);
    };

    // حساب الارتفاع عند التحميل
    calculateReelHeight();

    // إعادة حساب عند تغيير حجم الشاشة
    window.addEventListener('resize', calculateReelHeight);
    return () => window.removeEventListener('resize', calculateReelHeight);
  }, []);

  // التعامل مع التمرير بالماوس في Reels mode (مطابق للتيك توك)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (viewMode !== 'reels' || isScrolling.current || videoReels.length === 0) return;

    e.preventDefault();
    e.stopPropagation();
    isScrolling.current = true;

    // تحديد اتجاه التمرير بدقة أكبر
    const scrollThreshold = 30; // حساسية أكبر للتمرير

    if (Math.abs(e.deltaY) > scrollThreshold) {
      if (e.deltaY > 0 && currentReelIndex < videoReels.length - 1) {
        // التمرير لأسفل - الفيديو التالي
        setCurrentReelIndex(prev => {
          const newIndex = prev + 1;
          console.log(`🎬 انتقال إلى الفيديو ${newIndex + 1} من ${videoReels.length}`);
          return newIndex;
        });
      } else if (e.deltaY < 0 && currentReelIndex > 0) {
        // التمرير لأعلى - الفيديو السابق
        setCurrentReelIndex(prev => {
          const newIndex = prev - 1;
          console.log(`🎬 انتقال إلى الفيديو ${newIndex + 1} من ${videoReels.length}`);
          return newIndex;
        });
      }
    }

    // وقت انتظار محسن لمنع التمرير السريع
    setTimeout(() => {
      isScrolling.current = false;
    }, 600);
  }, [viewMode, currentReelIndex, videoReels.length]);

  // التعامل مع اللمس على الهاتف في Reels mode (مطابق للتيك توك)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (viewMode !== 'reels' || videoReels.length === 0) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (viewMode !== 'reels' || isScrolling.current || videoReels.length === 0) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    // حساسية محسنة للمس (مطابق للتيك توك)
    const swipeThreshold = 60; // حساسية متوسطة
    const velocity = Math.abs(diff);

    if (velocity > swipeThreshold) {
      isScrolling.current = true;

      if (diff > 0 && currentReelIndex < videoReels.length - 1) {
        // السحب لأعلى - الفيديو التالي
        setCurrentReelIndex(prev => {
          const newIndex = prev + 1;
          console.log(`📱 سحب لأعلى: انتقال إلى الفيديو ${newIndex + 1} من ${videoReels.length}`);
          return newIndex;
        });
      } else if (diff < 0 && currentReelIndex > 0) {
        // السحب لأسفل - الفيديو السابق
        setCurrentReelIndex(prev => {
          const newIndex = prev - 1;
          console.log(`📱 سحب لأسفل: انتقال إلى الفيديو ${newIndex + 1} من ${videoReels.length}`);
          return newIndex;
        });
      }

      // وقت انتظار محسن لضمان الثبات
      setTimeout(() => {
        isScrolling.current = false;
      }, 700);
    }
  };

  // Show loading if no company ID
  if (!companyId) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 
              className="font-cairo-bold text-gray-900"
              style={{ fontSize: verticalScale(20) }}
            >
              اليوميات
            </h1>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">جاري تحميل بيانات الشركة...</p>
          </div>
        </div>
      </div>
    );
  }

  // إضافة event listeners للـ Reels mode مع منع الحركة تماماً
  useEffect(() => {
    const container = containerRef.current;
    if (container && viewMode === 'reels') {
      // منع جميع أنواع التمرير والحركة
      const preventScroll = (e: Event) => e.preventDefault();
      const preventTouch = (e: TouchEvent) => {
        // السماح فقط باللمس الواحد للتنقل بين الفيديوهات
        if (e.touches.length === 1) {
          return; // السماح باللمس الواحد
        }
        e.preventDefault(); // منع اللمس المتعدد
      };

      container.addEventListener('wheel', handleWheel, { passive: false });
      document.body.addEventListener('wheel', preventScroll, { passive: false });
      document.body.addEventListener('touchmove', preventTouch, { passive: false });
      document.body.style.overflow = 'hidden'; // منع التمرير في الصفحة
      document.body.style.position = 'fixed'; // منع الحركة تماماً
      document.body.style.width = '100%';
      document.body.style.height = '100%';

      return () => {
        container.removeEventListener('wheel', handleWheel);
        document.body.removeEventListener('wheel', preventScroll);
        document.body.removeEventListener('touchmove', preventTouch);
        document.body.style.overflow = 'unset'; // استعادة التمرير
        document.body.style.position = 'unset';
        document.body.style.width = 'unset';
        document.body.style.height = 'unset';
      };
    }
  }, [handleWheel, viewMode]);

  // تحميل المزيد عند الاقتراب من النهاية في Reels mode
  useEffect(() => {
    if (viewMode === 'reels' && currentReelIndex >= videoReels.length - 2 && hasMore && !loading) {
      console.log('🔄 تحميل المزيد من الفيديوهات...');
      loadMorePosts();
    }
  }, [viewMode, currentReelIndex, videoReels.length, hasMore, loading, loadMorePosts]);

  // إعادة تعيين الفهرس عند تغيير نمط العرض أو تحديث الفيديوهات
  useEffect(() => {
    if (viewMode === 'reels' && videoReels.length > 0 && currentReelIndex >= videoReels.length) {
      console.log('🔄 إعادة تعيين الفهرس للفيديو الأول');
      setCurrentReelIndex(0);
    }
  }, [viewMode, videoReels.length, currentReelIndex]);

  // التعامل مع مفاتيح لوحة المفاتيح في Reels mode (مطابق للتيك توك)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'reels') return;

      // الخروج من وضع Reels بمفتاح Escape
      if (e.key === 'Escape') {
        setViewMode('grid');
        setCurrentReelIndex(0);
        return;
      }

      if (isScrolling.current || videoReels.length === 0) return;

      // منع السلوك الافتراضي للمفاتيح
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
      }

      if (e.key === 'ArrowDown' && currentReelIndex < videoReels.length - 1) {
        isScrolling.current = true;
        setCurrentReelIndex(prev => {
          const newIndex = prev + 1;
          console.log(`⌨️ مفتاح السهم لأسفل: انتقال إلى الفيديو ${newIndex + 1} من ${videoReels.length}`);
          return newIndex;
        });
        setTimeout(() => { isScrolling.current = false; }, 600);
      } else if (e.key === 'ArrowUp' && currentReelIndex > 0) {
        isScrolling.current = true;
        setCurrentReelIndex(prev => {
          const newIndex = prev - 1;
          console.log(`⌨️ مفتاح السهم لأعلى: انتقال إلى الفيديو ${newIndex + 1} من ${videoReels.length}`);
          return newIndex;
        });
        setTimeout(() => { isScrolling.current = false; }, 600);
      }
    };

    if (viewMode === 'reels') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [viewMode, currentReelIndex, videoReels.length]);

  // Handle scroll to load more (Grid mode only)
  useEffect(() => {
    if (viewMode === 'grid') {
      const handleScroll = () => {
        const scrollTop = document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.offsetHeight;
        const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

        console.log('Scroll debug:', {
          scrollTop,
          windowHeight,
          documentHeight,
          distanceFromBottom,
          hasMore,
          loading,
          refreshing,
          postsCount: posts.length
        });

        if (
          distanceFromBottom <= 100 &&
          hasMore &&
          !loading &&
          !refreshing
        ) {
          console.log('Loading more posts...');
          loadMorePosts();
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [viewMode, hasMore, loading, refreshing, loadMorePosts]);

  const handleRefresh = async () => {
    await refreshPosts();
  };

  const handleFilterPress = () => {
    setShowFilter(true);
  };

  const handleApplyFilter = (newFilter: Partial<FilterData>) => {
    // Check if filter is just default date filter
    const isDefaultFilter = newFilter.type === 'بحسب التاريخ' && 
                            !newFilter.nameProject && 
                            !newFilter.userName && 
                            !newFilter.branch;
    
    if (isDefaultFilter) {
      // Use regular fetch for date-only filter
      setFilterData({ ...filterData, ...newFilter });
      refreshPosts();
    } else {
      // Use search for complex filters
      searchPosts(newFilter);
    }
  };

  const handleClearFilter = () => {
    clearFilter();
  };

  const handleLike = async (postId: number) => {
    await toggleLike(postId);
  };

  const handleComment = (postId: number) => {
    setShowComments({ postId, show: true });
  };

  // Handle comment modal close
  const handleCloseComments = () => {
    setShowComments({ postId: 0, show: false });
  };

  // Handle comment added - refresh posts to update count
  const handleCommentAdded = () => {
    refreshPosts();
  };

  const handlePostPress = (postId: number) => {
    // Navigate to post details page
    router.push(`/publications/${postId}`);
  };

  // Handle video play - تشغيل الفيديو مباشرة
  const handleVideoPlay = (post: any) => {
    const STORAGE_URL = 'https://storage.googleapis.com/demo_backendmoshrif_bucket-1';
    const videoUrl = post.url.startsWith('http') ? post.url : `${STORAGE_URL}/${post.url}`;

    setShowVideoPlayer({
      show: true,
      videoUrl: videoUrl,
      title: `فيديو من ${post.postBy} - ${post.Nameproject || 'منشور'}`
    });
  };

  // Close video player
  const handleCloseVideoPlayer = () => {
    setShowVideoPlayer({ show: false, videoUrl: '', title: '' });
  };

  // Show error if exists
  if (error && posts.length === 0) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 
              className="font-cairo-bold text-gray-900"
              style={{ fontSize: verticalScale(20) }}
            >
              اليوميات
            </h1>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h3 className="text-lg font-cairo-semibold text-gray-900 mb-2">خطأ في تحميل اليوميات</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 
            className="font-cairo-bold text-gray-900"
            style={{ fontSize: verticalScale(20) }}
          >
            اليوميات
          </h1>
          
          <div className="flex items-center gap-3">
            {/* زر تبديل نمط العرض */}
            <button
              onClick={() => {
                setViewMode(viewMode === 'grid' ? 'reels' : 'grid');
                setCurrentReelIndex(0); // إعادة تعيين الفيديو الحالي
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title={viewMode === 'grid' ? 'عرض الفيديوهات' : 'عرض الشبكة'}
            >
              {viewMode === 'grid' ? (
                // أيقونة الفيديو للتبديل إلى Reels
                <svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <polygon points="10,8 16,12 10,16" fill="currentColor"/>
                </svg>
              ) : (
                // أيقونة الشبكة للتبديل إلى Grid
                <svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                </svg>
              )}
            </button>

            <button
              onClick={handleFilterPress}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FilterIcon size={scale(20)} />
            </button>


          </div>
        </div>

        {/* Active Filter Indicator */}
        {(filterData.nameProject || filterData.userName || filterData.branch || filterData.type !== 'بحسب التاريخ') && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">الفلاتر النشطة:</span>
            <div className="flex gap-2 flex-wrap">
              {filterData.type !== 'بحسب التاريخ' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {filterData.type}
                </span>
              )}
              {filterData.nameProject && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  مشروع: {filterData.nameProject}
                </span>
              )}
              {filterData.userName && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  مستخدم: {filterData.userName}
                </span>
              )}
              {filterData.branch && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  فرع: {filterData.branch}
                </span>
              )}
              <button
                onClick={handleClearFilter}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200"
              >
                مسح الكل
              </button>
            </div>
          </div>
        )}
      </div>



      {/* Content Area */}
      {viewMode === 'reels' ? (
        /* Reels Mode - عرض الفيديوهات بنمط Reels */
        <div className="flex-1 relative">
          {loading && videoReels.length === 0 ? (
            <div className="h-full bg-black flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>تحميل الفيديوهات...</p>
              </div>
            </div>
          ) : videoReels.length === 0 ? (
            <div className="h-full bg-black flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                </div>
                <h3 className="text-xl font-ibm-arabic-semibold mb-2">لا توجد فيديوهات</h3>
                <p className="text-gray-400">لم يتم العثور على أي فيديوهات في اليوميات</p>
              </div>
            </div>
          ) : (
            /* Container الرئيسي محسن للجوال */
            <div
              ref={containerRef}
              className="fixed inset-0 bg-black"
              style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: '64px', // فوق الشريط السفلي مباشرة
                touchAction: 'none', // منع أي حركة أو تمرير
                userSelect: 'none', // منع تحديد النص
                WebkitUserSelect: 'none', // منع تحديد النص على Safari
                WebkitTouchCallout: 'none', // منع قائمة السياق على iOS
                zIndex: 20 // فوق المحتوى العادي لكن تحت الشريط السفلي
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* عرض الفيديو الحالي فقط - عناصر ثابتة */}
              {videoReels.length > 0 && videoReels[currentReelIndex] && (
                <ReelItem
                  key={`${videoReels[currentReelIndex].PostID}-${currentReelIndex}`}
                  post={videoReels[currentReelIndex]}
                  isActive={true}
                  onLike={() => handleLike(videoReels[currentReelIndex].PostID)}
                  onComment={() => handleComment(videoReels[currentReelIndex].PostID)}
                  onCommentPress={() => handleComment(videoReels[currentReelIndex].PostID)}
                  onShare={() => {
                    // مشاركة الفيديو
                    if (navigator.share) {
                      navigator.share({
                        title: `فيديو من ${videoReels[currentReelIndex].postBy}`,
                        text: videoReels[currentReelIndex].Data || '',
                        url: window.location.href
                      });
                    }
                  }}
                  onSave={() => {
                    // حفظ الفيديو - يمكن تطوير هذا لاحقاً
                    Tostget('تم حفظ الفيديو');
                  }}
                  onExit={() => {
                    setViewMode('grid');
                    setCurrentReelIndex(0);
                  }}
                />
              )}

              {/* زر الخروج من وضع Reels */}
              <div className="absolute top-4 left-4 z-30">
                <button
                  onClick={() => {
                    setViewMode('grid');
                    setCurrentReelIndex(0);
                  }}
                  className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all active:scale-95"
                  title="الخروج من وضع الفيديوهات"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M19 12H5"/>
                    <polyline points="12,19 5,12 12,5"/>
                  </svg>
                </button>
              </div>

              {/* مؤشر الفيديو الحالي - ثابت */}
              <div className="absolute top-4 right-4 z-30">
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentReelIndex + 1} / {videoReels.length}
                </div>
              </div>

              {/* مؤشر التحميل - ثابت */}
              {loading && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
                  <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">تحميل المزيد...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Grid Mode - العرض التقليدي */
        <div className="flex-1 px-4 pb-20">
          {loading && posts.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : posts.length > 0 ? (
            <>
              {/* Grid Layout للمنشورات */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {posts.map((post, index) => (
                  <PostCard
                    key={index.toString()}
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onCommentPress={handleComment}
                    onPress={(post) => {
                      // إذا كان فيديو، شغله مباشرة، وإلا انتقل للتفاصيل
                      const isVideo = post.url?.includes('.mp4') || post.url?.includes('.mov') || post.url?.includes('.avi') || post.url?.includes('.webm');
                      if (isVideo) {
                        handleVideoPlay(post);
                      } else {
                        handlePostPress(post.PostID);
                      }
                    }}
                  />
                ))}
              </div>

              {/* Load More Indicator */}
              {hasMore && (
                <div className="flex items-center justify-center py-4">
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <button
                      onClick={loadMorePosts}
                      className="px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-cairo-medium"
                    >
                      تحميل المزيد
                    </button>
                  )}
                </div>
              )}

              {!hasMore && posts.length > 5 && (
                <div className="text-center py-4">
                  <span className="text-gray-500 text-sm">تم عرض جميع اليوميات</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <g id="megaphone-01">
                    <path d="M13.8181 4.68994L10.0802 7.05656C9.25187 7.65018 9.23691 7.66058 8.39636 7.66683L5.67759 7.68625C4.11919 7.69745 2.85323 8.97169 2.85323 10.5302V11.3216C2.85323 12.8867 4.12783 14.1616 5.69273 14.1616H8.41702C9.00055 14.1616 9.55987 14.3923 9.97525 14.8029L13.816 18.5897C14.3899 19.1573 15.2672 19.2723 15.9671 18.87C16.6715 18.4651 17.0711 17.6367 16.9244 16.7954L15.9607 11.1074"/>
                    <path d="M21.1468 10.8894C21.1468 13.0723 19.3837 14.8354 17.2008 14.8354C15.0179 14.8354 13.2549 13.0723 13.2549 10.8894C13.2549 8.70656 15.0179 6.94354 17.2008 6.94354C19.3837 6.94354 21.1468 8.70656 21.1468 10.8894Z"/>
                  </g>
                </svg>
              </div>
              <h3 className="text-lg font-cairo-semibold text-gray-900 mb-2">لا توجد يوميات</h3>
              <p className="text-gray-500 text-center">لم يتم العثور على أي يوميات حتى الآن</p>
              {(filterData.nameProject || filterData.userName || filterData.branch || filterData.type !== 'بحسب التاريخ') && (
                <button
                  onClick={handleClearFilter}
                  className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-cairo-medium"
                >
                  مسح الفلتر
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={handleApplyFilter}
        onClear={handleClearFilter}
        branches={branches}
        currentFilter={filterData}
        loading={loading}
        onFetchBranches={fetchBranches}
      />

      {/* Comments Modal */}
      <CommentsModal
        isOpen={showComments.show}
        onClose={handleCloseComments}
        postId={showComments.postId}
        currentCommentCount={posts.find(p => p.PostID === showComments.postId)?.Comment || 0}
        onCommentAdded={handleCommentAdded}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={showVideoPlayer.show}
        onClose={handleCloseVideoPlayer}
        videoUrl={showVideoPlayer.videoUrl}
        title={showVideoPlayer.title}
      />
    </div>
  );
}