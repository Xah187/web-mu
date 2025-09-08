'use client';

import { useState, useEffect } from 'react';
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

  // Fetch posts with pagination
  const fetchPosts = async (reset = false) => {
    if (!user?.accessToken || !companyId) return;

    console.log('Fetching posts...', { reset, companyId, userName: user.data?.userName });

    if (reset) {
      setLoading(true);
      setError(null);
    }

    try {
      const lastPostId = reset ? 0 : (posts.length > 0 ? posts[posts.length - 1].PostID : 0);
      
      const data = await apiFetchPosts(companyId, lastPostId, user.data?.userName);
      
      if (data?.data && Array.isArray(data.data)) {
        const newPosts = data.data as Post[];
        const filteredPosts = filterPostsForUser(newPosts);
        
        if (reset) {
          setPosts(filteredPosts);
        } else {
          setPosts(prev => [...prev, ...filteredPosts]);
        }
        
        // Check if there are more posts
        setHasMore(newPosts.length > 0);
        
        console.log('Posts fetched successfully:', {
          newPostsCount: newPosts.length,
          totalPosts: reset ? filteredPosts.length : posts.length + filteredPosts.length,
          hasMore: newPosts.length > 0
        });
      } else {
        console.log('No posts data received');
        setHasMore(false);
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setError('خطأ في جلب اليوميات');
      Tostget('خطأ في جلب اليوميات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh posts
  const refreshPosts = async () => {
    setRefreshing(true);
    await fetchPosts(true);
  };

  // Load more posts
  const loadMorePosts = async () => {
    console.log('loadMorePosts called:', { loading, hasMore, postsCount: posts.length });
    if (!loading && hasMore) {
      console.log('Fetching more posts...');
      await fetchPosts(false);
    } else {
      console.log('Cannot load more:', { loading, hasMore });
    }
  };

  // Search posts
  const searchPosts = async (searchData: Partial<FilterData>) => {
    if (!user?.accessToken || !companyId) return;

    setLoading(true);
    setError(null);

    try {
      // Merge current filter with new search data
      const finalFilterData = {
        ...filterData,
        ...searchData,
        CompanyID: companyId
      };

      // Format dates for API
      const formatDateForAPI = (date: Date | undefined) => {
        if (!date) return '';
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };

      const searchParams = {
        ...finalFilterData,
        DateStart: formatDateForAPI(finalFilterData.DateStart),
        DateEnd: formatDateForAPI(finalFilterData.DateEnd),
        user: user.data?.userName || ''
      };

      const data = await apiSearchPosts(searchParams);
      
      if (data?.data && Array.isArray(data.data)) {
        const searchResults = data.data as Post[];
        const filteredResults = filterPostsForUser(searchResults);
        setPosts(filteredResults);
        setHasMore(false); // Search results don't support pagination
        
        console.log('Search completed:', {
          resultsCount: filteredResults.length,
          searchParams: finalFilterData
        });
      } else {
        setPosts([]);
        setHasMore(false);
      }
    } catch (error: any) {
      console.error('Error searching posts:', error);
      setError('خطأ في البحث');
      Tostget('خطأ في البحث');
    } finally {
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
  const clearFilter = () => {
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
    fetchPosts(true);
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
