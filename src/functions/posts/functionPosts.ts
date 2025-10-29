'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/store';
import useApiPosts from '@/lib/api/posts/ApiPosts';
import { Tostget } from '@/components/ui/Toast';
import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';

export interface Post {
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
}

export interface FilterData {
  CompanyID: number;
  DateStart: Date;
  DateEnd: Date;
  Done: boolean;
  type: string;
  nameProject: string;
  userName: string;
  branch: string;
  PostID: number;
}

/**
 * Posts business logic functions - separated from API calls
 * Matches mobile app structure: Src/functions/posts/funcationPosts.tsx
 */
export default function useFunctionPosts(companyId: number) {
  const { user, Validity } = useAppSelector(state => state.user);
  const { isEmployee } = useJobBasedPermissions();
  
  // API functions
  const {
    fetchPosts: apiFetchPosts,
    searchPosts: apiSearchPosts,
    toggleLike: apiToggleLike,
    addComment: apiAddComment,
    fetchBranches: apiFetchBranches
  } = useApiPosts();
  
  // State
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const isFetchingRef = useRef(false); // يمنع الطلبات المتزامنة والتكرار

  // Filter state - matching mobile app structure
  const [filterData, setFilterData] = useState<FilterData>({
    CompanyID: companyId,
    DateStart: new Date(),
    DateEnd: new Date(),
    Done: false,
    type: 'بحسب التاريخ',
    nameProject: '',
    userName: '',
    branch: '',
    PostID: 0
  });

  /**
   * Filter posts for user based on permissions
   * Replicates mobile app logic exactly
   */
  const filterPostsForUser = (allPosts: Post[]): Post[] => {
    // If user is employee, show all posts (like mobile app)
    if (isEmployee) {
      return allPosts;
    }

    // For non-employees, the backend already filters posts based on project permissions
    // So we can return all posts as they are already filtered
    // This matches the mobile app behavior where filtering happens on the server
    return allPosts;
  };

  // Helper: unique by PostID
  const dedupeByPostId = (arr: Post[]) => {
    const map = new Map<number, Post>();
    for (const p of arr) {
      if (!map.has(p.PostID)) map.set(p.PostID, p);
    }
    return Array.from(map.values());
  };

  // Helper: format date like mobile (yy-MM-DD)
  const formatDateForAPIHelper = (date?: Date | string) => {
    if (!date) return '';

    // If it's already a string, return as is (might be pre-formatted)
    if (typeof date === 'string') {
      return date;
    }

    // If it's a Date object, format it
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch posts with pagination - use SearchPosts (date range) + PostID paging
  const fetchPosts = async (reset = false) => {
    if (!user?.accessToken || !companyId) return;
    if (isFetchingRef.current) {
      console.log('Skip fetch: already fetching');
      return;
    }

    console.log('Fetching posts...', {
      reset,
      companyId,
      userName: user?.data?.userName,
      userJob: user?.data?.jobdiscrption,
      isEmployee
    });

    if (reset) {
      setLoading(true);
      setError(null);
    }

    try {
      isFetchingRef.current = true;
      const lastPostId = reset ? 0 : (posts.length > 0 ? posts[posts.length - 1].PostID : 0);

      console.log('Fetch posts params:', {
        reset,
        lastPostId,
        currentPostsCount: posts.length,
        lastPost: posts.length > 0 ? posts[posts.length - 1] : null
      });

      // EXACTLY like mobile app: use BringPost for default feed, SearchPosts for filters
      // Mobile app: if (FilterData.Done === true) use SearchPosts, else use BringPost
      // BringPost passes PhoneNumber correctly which is required for employee users
      let data;
      if (!filterData.Done) {
        console.log('Using BringPost for default feed (like mobile app)...');

        // Use BringPost API like mobile app
        // Note: Backend has hardcoded date "2025-07-14" but it passes PhoneNumber correctly
        // which is required for employee users to see posts from their projects
        data = await apiFetchPosts(companyId, lastPostId, user?.data?.userName || '');
        console.log('BringPost result:', data);
      } else {
        const params = {
          CompanyID: companyId,
          DateStart: formatDateForAPIHelper(filterData.DateStart as any),
          DateEnd: formatDateForAPIHelper(filterData.DateEnd as any),
          type: filterData.type || 'بحسب التاريخ',
          nameProject: filterData.nameProject || '',
          userName: filterData.userName || '',
          PostID: lastPostId,
          branch: filterData.branch || '',
          user: user?.data?.userName || ''
        };
        console.log('Using SearchPosts for active filter paging:', params);
        data = await apiSearchPosts(params);
      }

      console.log('API Response full data:', data);

      if (data?.data && Array.isArray(data.data)) {
        const newPosts = data.data as Post[];
        console.log('Raw posts from API:', newPosts.slice(0, 3)); // Log first 3 posts

        // Add isLiked property for compatibility with ReelItem
        const postsWithLikeStatus = newPosts.map(post => ({
          ...post,
          isLiked: post.Likeuser || false
        }));

        const filteredPosts = filterPostsForUser(postsWithLikeStatus);

        if (reset) {
          setPosts(filteredPosts);
        } else {
          setPosts(prev => dedupeByPostId([...prev, ...filteredPosts]));
        }

        // Check if there are more posts - like mobile app: continue until 0 results
        const hasMorePosts = newPosts.length > 0;
        setHasMore(hasMorePosts);

        console.log('Posts fetched successfully:', {
          newPostsCount: newPosts.length,
          totalPosts: reset ? filteredPosts.length : dedupeByPostId([...posts, ...filteredPosts]).length,
          hasMore: hasMorePosts,
          lastPostId: newPosts.length > 0 ? newPosts[newPosts.length - 1].PostID : 'none'
        });
      } else {
        console.log('No posts data received:', data);
        setHasMore(false);
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setError('خطأ في جلب اليوميات');
      Tostget('خطأ في جلب اليوميات');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh posts
  const refreshPosts = async () => {
    setRefreshing(true);
    await fetchPosts(true);
  };

  // Load more posts - exactly like mobile app handallBring
  const loadMorePosts = async () => {
    console.log('loadMorePosts called:', { loading, postsCount: posts.length, isFetching: isFetchingRef.current, filterDone: filterData.Done });
    if (isFetchingRef.current || !hasMore) {
      console.log('Cannot load more now - already fetching or no more data');
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);

      // Exactly like mobile app handallBring logic
      if (filterData.Done === true) {
        // Like mobile: BringSearchPosts with current filter + last PostID
        const lastId = posts.length > 0 ? posts[posts.length - 1]?.PostID : 0;
        const data = {
          ...filterData,
          PostID: lastId,
        };
        await BringSearchPostsLikeMobile(data, posts);
      } else {
        // Like mobile: BringDataPost
        await BringDataPostLikeMobile();
      }
    } catch (error) {
      console.error('Error in loadMorePosts:', error);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  // Exactly like mobile app BringDataPost
  const BringDataPostLikeMobile = async () => {
    try {
      const lastPostId = posts.length > 0 ? posts[posts.length - 1]?.PostID : 0;
      const result = await apiFetchPosts(companyId, lastPostId, user?.data?.userName);

      if (result?.data && result.data.length > 0) {
        const newPosts = result.data as Post[];
        const postsWithLikeStatus = newPosts.map(post => ({ ...post, isLiked: post.Likeuser || false }));
        const filtered = filterPostsForUser(postsWithLikeStatus);
        // Like mobile: let arrays = [...arrayPosts, ...result];
        setPosts(prev => dedupeByPostId([...prev, ...filtered]));
        console.log('BringDataPost fetched:', { count: newPosts.length });
      }
    } catch (error) {
      console.error('Error in BringDataPostLikeMobile:', error);
    }
  };

  // Exactly like mobile app BringSearchPosts
  const BringSearchPostsLikeMobile = async (Datafilter: any, arrayPost: Post[]) => {
    try {
      const data = {
        ...Datafilter,
        DateStart: formatDateForAPIHelper(Datafilter.DateStart),
        DateEnd: formatDateForAPIHelper(Datafilter.DateEnd),
      };

      // Like mobile: dispatch(setFilterData({...data, Done: true}));
      setFilterData({ ...data, Done: true });

      const result = await apiSearchPosts(data);
      if (result?.data && Array.isArray(result.data)) {
        const newPosts = result.data as Post[];
        const postsWithLikeStatus = newPosts.map(post => ({ ...post, isLiked: post.Likeuser || false }));
        const filtered = filterPostsForUser(postsWithLikeStatus);

        // If no new posts, stop loading more (like mobile app behavior)
        if (newPosts.length === 0) {
          setHasMore(false);
          console.log('BringSearchPosts: No more posts available');
          return;
        }

        // Exactly like mobile app logic:
        let arrays;
        if (arrayPost.length > 0) {
          arrays = [...arrayPost, ...filtered];
        } else {
          arrays = filtered;
        }
        setPosts(dedupeByPostId(arrays));
        console.log('BringSearchPosts fetched:', { count: newPosts.length });
      } else {
        // No data received, stop loading
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error in BringSearchPostsLikeMobile:', error);
      setHasMore(false);
    }
  };

  // Search posts - exactly like mobile app BringSearchPosts
  const searchPosts = async (searchData: Partial<FilterData>) => {
    if (!user?.accessToken || !companyId) return;
    if (isFetchingRef.current) {
      console.log('Skip search: already fetching');
      return;
    }

    setLoading(true);
    setError(null);
    isFetchingRef.current = true;

    try {
      // Merge current filter with new search data exactly like mobile app
      const finalFilterData = {
        ...filterData,
        ...searchData,
        CompanyID: companyId
      };

      // Format helpers
      const formatYY = (date?: Date) => {
        if (!date) return '';
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      const formatYYYY = (date?: Date) => {
        if (!date) return '';
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      // Build primary (yy) params
      const yyParams = {
        ...finalFilterData,
        DateStart: formatYY(finalFilterData.DateStart),
        DateEnd: formatYY(finalFilterData.DateEnd),
        PostID: 0,
        user: user?.data?.userName || ''
      };

      console.log('Searching posts with params:', yyParams);

      // Track which params we finally used (to persist exact strings into filter state)
      let usedParams = yyParams;
      let data = await apiSearchPosts(yyParams);

      // Fallback: if no results with yy-MM-DD, try YYYY-MM-DD
      if (!data?.data || data.data.length === 0) {
        const yyyyParams = {
          ...finalFilterData,
          DateStart: formatYYYY(finalFilterData.DateStart),
          DateEnd: formatYYYY(finalFilterData.DateEnd),
          PostID: 0,
          user: user?.data?.userName || ''
        };
        console.log('Primary search empty, trying fallback YYYY-MM-DD:', yyyyParams);
        usedParams = yyyyParams;
        data = await apiSearchPosts(yyyyParams);
      }

      if (data?.data && Array.isArray(data.data)) {
        const searchResults = data.data as Post[];

        // Add isLiked property for compatibility with ReelItem
        const postsWithLikeStatus = searchResults.map(post => ({
          ...post,
          isLiked: post.Likeuser || false
        }));

        const filteredResults = filterPostsForUser(postsWithLikeStatus);

        // Exactly like mobile app BringSearchPosts: replace posts completely
        setPosts(filteredResults);
        // Allow loading more after first page
        setHasMore(true);

        // Persist the exact date strings we used (yy or yyyy) so pagination uses same
        setFilterData({
          ...finalFilterData,
          DateStart: usedParams.DateStart as any,
          DateEnd: usedParams.DateEnd as any,
          Done: true
        });

        console.log('Search completed:', {
          resultsCount: filteredResults.length,
          searchParams: usedParams
        });
      } else {
        console.log('No search results');
        setPosts([]);
        setFilterData({ ...finalFilterData, Done: true });
        setHasMore(false);
      }
    } catch (error: any) {
      console.error('Error searching posts:', error);
      setError('خطأ في البحث');
      Tostget('خطأ في البحث');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  // Like/Unlike post
  const toggleLike = async (postId: number) => {
    if (!user?.accessToken) return;

    try {
      await apiToggleLike(postId);
      
      // Update the post in local state
      setPosts(prev => 
        prev.map(post => 
          post.PostID === postId
            ? {
                ...post,
                Likeuser: !post.Likeuser,
                Likes: post.Likeuser ? post.Likes - 1 : post.Likes + 1
              }
            : post
        )
      );
    } catch (error: any) {
      console.error('Error toggling like:', error);
      Tostget('خطأ في الإعجاب');
    }
  };

  // Add comment to post
  const addComment = async (postId: number, comment: string) => {
    if (!user?.accessToken || !comment.trim()) return;

    try {
      await apiAddComment(postId, comment);
      
      // Update comment count in local state
      setPosts(prev => 
        prev.map(post => 
          post.PostID === postId
            ? { ...post, Comment: post.Comment + 1 }
            : post
        )
      );
      
      Tostget('تم إضافة التعليق بنجاح');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      Tostget('خطأ في إضافة التعليق');
    }
  };

  // Fetch branches for filtering
  const fetchBranches = async () => {
    if (!user?.accessToken || !companyId) return;

    try {
      const data = await apiFetchBranches(companyId);
      
      if (data?.data && Array.isArray(data.data)) {
        setBranches(data.data);
      }
    } catch (error: any) {
      console.error('Error fetching branches:', error);
      // Don't show error toast for branches as it's not critical
    }
  };

  // Clear filter
  // Clear filter exactly like mobile app CanselFilter
  const clearFilter = async () => {
    // Clear posts array first like mobile app
    setPosts([]);

    // Reset filter data exactly like mobile app CanselFilter
    setFilterData({
      CompanyID: companyId,
      DateStart: new Date(),
      DateEnd: new Date(),
      Done: false,
      type: 'بحسب التاريخ',
      nameProject: '',
      userName: '',
      branch: '',
      PostID: 0
    });

    // Fetch fresh posts using BringPost like mobile app BringDataPost
    await fetchPosts(true);
  };



  // Initial load
  useEffect(() => {
    if (companyId && user?.accessToken) {
      fetchPosts(true);
      fetchBranches();
    }
  }, [companyId, user?.accessToken]);

  return {
    // Data
    posts,
    branches,
    filterData,
    
    // State
    loading,
    refreshing,
    error,
    hasMore,
    
    // Actions
    fetchPosts,
    refreshPosts,
    loadMorePosts,
    searchPosts,
    toggleLike,
    addComment,
    clearFilter,
    setFilterData,
    fetchBranches
  };
}
