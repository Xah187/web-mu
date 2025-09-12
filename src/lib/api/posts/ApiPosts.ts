'use client';

import axiosInstance from '@/lib/api/axios';
import { useAppSelector } from '@/store';

/**
 * Posts API functions - separated from business logic
 * Matches mobile app structure: Src/functions/posts/ApiPosts.tsx
 */
export default function useApiPosts() {
  const { user } = useAppSelector(state => state.user);

  /**
   * Fetch posts with pagination
   * @param companyId - Company ID
   * @param lastPostId - Last post ID for pagination
   * @param userName - User name
   */
  const fetchPosts = async (companyId: number, lastPostId: number = 0, userName?: string) => {
    if (!user?.accessToken || !companyId) {
      throw new Error('Missing authentication or company ID');
    }

    // Try different URL formats to see what works
    const userParam = userName || user.data?.userName || '';
    const urls = [
      `posts/BringPost?CompanyID=${companyId}&PostID=${lastPostId}&user=${userParam}`,
      `posts/BringPost?CompanyID=${companyId}&PostID=${lastPostId}`,
      `posts/BringPost?CompanyID=${companyId}&PostID=${lastPostId}&user=`
    ];

    console.log('API BringPost trying URLs:', urls);

    // Try first URL (with user)
    let url = urls[0];
    let response;

    try {
      response = await axiosInstance.get(url, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      console.log('API BringPost response:', response.data);

      // If empty result, try without user parameter
      if (!response.data?.data || response.data.data.length === 0) {
        console.log('Trying BringPost without user parameter...');
        url = urls[1]; // Without user
        response = await axiosInstance.get(url, {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`
          }
        });
        console.log('API BringPost (no user) response:', response.data);
      }
    } catch (error) {
      console.error('Error in BringPost:', error);
      throw error;
    }
    return response.data;
  };

  /**
   * Search posts with filters
   * @param filterData - Filter parameters
   */
  const searchPosts = async (filterData: any) => {
    if (!user?.accessToken) {
      throw new Error('Missing authentication');
    }

    // Build URL exactly like mobile app without URLSearchParams encoding
    const url = `posts/SearchPosts?CompanyID=${filterData.CompanyID}&DateStart=${filterData.DateStart || ''}&DateEnd=${filterData.DateEnd || ''}&type=${filterData.type || 'بحسب التاريخ'}&nameProject=${filterData.nameProject || ''}&userName=${filterData.userName || ''}&PostID=${filterData.PostID || 0}&branch=${filterData.branch || ''}&user=${user.data?.userName || ''}`;

    console.log('API SearchPosts URL:', url);
    console.log('API SearchPosts filterData:', filterData);

    const response = await axiosInstance.get(url, {
      headers: {
        'Authorization': `Bearer ${user.accessToken}`
      }
    });

    console.log('API SearchPosts response:', response.data);
    return response.data;
  };

  /**
   * Toggle like on post
   * @param postId - Post ID
   */
  const toggleLike = async (postId: number) => {
    if (!user?.accessToken) {
      throw new Error('Missing authentication');
    }

    const response = await axiosInstance.get(
      `posts/Likesinsert?PostID=${postId}&userName=${user.data?.userName}`,
      {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      }
    );

    return response.data;
  };

  /**
   * Add comment to post
   * @param postId - Post ID
   * @param comment - Comment text
   */
  const addComment = async (postId: number, comment: string) => {
    if (!user?.accessToken) {
      throw new Error('Missing authentication');
    }

    const response = await axiosInstance.post(
      'posts/insertComment',
      {
        PostID: postId,
        Comment: comment,
        userName: user.data?.userName
      },
      {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  };

  /**
   * Fetch branches for filtering
   * @param companyId - Company ID
   */
  const fetchBranches = async (companyId: number) => {
    if (!user?.accessToken) {
      throw new Error('Missing authentication');
    }

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

    return response.data;
  };

  return {
    fetchPosts,
    searchPosts,
    toggleLike,
    addComment,
    fetchBranches
  };
}
