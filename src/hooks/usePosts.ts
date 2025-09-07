'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import axiosInstance from '@/lib/api/axios';
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

export interface Comment {
  CommentID: number;
  PostID: number;
  UserName: string;
  CommentText: string;
  CommentDate: string;
  CommentTime: string;
}

export default function usePosts(companyId: number) {
  const { user, Validity } = useAppSelector(state => state.user);
  const { isEmployee } = useJobBasedPermissions();
  
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
   * Replicates mobile app logic exactly:
   * - For employees (jobdiscrption === 'موظف'): show all posts (no filtering)
   * - For non-employees: filter posts based on projects in their Validity
   *
   * Note: Since the backend already handles filtering for non-employees,
   * we only need to apply client-side filtering if needed
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
      
      const url = `posts/BringPost?CompanyID=${companyId}&PostID=${lastPostId}&user=${user.data?.userName}`;
      console.log('Fetching from URL:', url);
      
      const response = await axiosInstance.get(url, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      console.log('Posts response:', response.data);

      if (response.status === 200 && response.data?.data) {
        const newPosts = response.data.data;

        // Apply filtering like mobile app
        const filteredPosts = filterPostsForUser(newPosts);

        if (reset) {
          setPosts(filteredPosts);
        } else {
          setPosts(prev => [...prev, ...filteredPosts]);
        }

        // Check if there are more posts (like mobile app)
        // Backend returns 5 posts per request, if less than 5, we've reached the end
        setHasMore(newPosts.length >= 5);

        console.log('Posts loaded successfully:', filteredPosts.length, 'filtered posts out of', newPosts.length, 'total. HasMore:', newPosts.length >= 5);
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

      const queryParams = new URLSearchParams({
        CompanyID: finalFilterData.CompanyID.toString(),
        DateStart: formatDateForAPI(finalFilterData.DateStart),
        DateEnd: formatDateForAPI(finalFilterData.DateEnd),
        type: finalFilterData.type || 'بحسب التاريخ',
        nameProject: finalFilterData.nameProject || '',
        userName: finalFilterData.userName || '',
        PostID: finalFilterData.PostID.toString(),
        branch: finalFilterData.branch || '',
        user: user.data?.userName || ''
      });

      console.log('Search params:', queryParams.toString());

      const response = await axiosInstance.get(
        `posts/SearchPosts?${queryParams.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      console.log('Search response:', response.data);

      if (response.status === 200 && response.data?.data) {
        const searchResults = response.data.data;

        // Apply filtering like mobile app
        const filteredResults = filterPostsForUser(searchResults);
        setPosts(filteredResults);
        setHasMore(false); // Search results don't have pagination

        console.log('Search completed:', filteredResults.length, 'filtered posts out of', searchResults.length, 'total');
      }
    } catch (error: any) {
      console.error('Error searching posts:', error);
      setError('خطأ في البحث');
      Tostget('خطأ في البحث');
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches for filter
  const fetchBranches = async () => {
    if (!user?.accessToken) return;

    console.log('Fetching branches...');
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        'company/brinsh/bring',
        {
          IDCompany: companyId,
          type: 'cache'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      console.log('Branches response:', response.data);

      if (response.status === 200 && response.data?.data) {
        setBranches(response.data.data);
        console.log('Branches set:', response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching branches:', error);
      Tostget('خطأ في جلب الفروع');
    } finally {
      setLoading(false);
    }
  };

  // Like/Unlike post
  const toggleLike = async (postId: number) => {
    if (!user?.accessToken) return;

    try {
      const response = await axiosInstance.get(
        `posts/Likesinsert?PostID=${postId}&userName=${user.data?.userName}`,
        {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      if (response.status === 200) {
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
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      Tostget('خطأ في الإعجاب');
    }
  };

  // Add comment
  const addComment = async (postId: number, commentText: string) => {
    if (!user?.accessToken || !commentText.trim()) return;

    try {
      const response = await axiosInstance.post(
        'posts/Commentinsert',
        {
          PostId: postId,
          commentText: commentText.trim(),
          userName: user.data?.userName
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      if (response.status === 200) {
        // Update comment count
        setPosts(prev => 
          prev.map(post => 
            post.PostID === postId
              ? { ...post, Comment: post.Comment + 1 }
              : post
          )
        );
        
        Tostget('تم إضافة التعليق بنجاح');
        return true;
      }
    } catch (error: any) {
      console.error('Error adding comment:', error);
      Tostget('خطأ في إضافة التعليق');
      return false;
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