'use client';

import axiosInstance from '@/lib/api/axios';

/**
 * Authentication API functions - separated from business logic
 * Matches mobile app structure: Src/functions/Login/LoginUser.tsx
 */
export default function useApiAuth() {

  /**
   * Login user
   * @param userName - User name
   * @param password - Password
   */
  const loginUser = async (userName: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', {
      userName,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  };

  /**
   * Refresh token
   * @param refreshToken - Refresh token
   */
  const refreshToken = async (refreshToken: string) => {
    const response = await axiosInstance.post('/auth/refresh', {
      refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  };

  /**
   * Logout user
   * @param accessToken - Access token
   */
  const logoutUser = async (accessToken: string) => {
    const response = await axiosInstance.post('/auth/logout', {}, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  };

  /**
   * Get user validity/permissions
   * @param userName - User name
   * @param accessToken - Access token
   */
  const getUserValidity = async (userName: string, accessToken: string) => {
    const response = await axiosInstance.get(`/auth/validity?userName=${userName}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.data;
  };

  /**
   * Update user FCM token for notifications
   * @param userName - User name
   * @param fcmToken - FCM token
   * @param accessToken - Access token
   */
  const updateFCMToken = async (userName: string, fcmToken: string, accessToken: string) => {
    const response = await axiosInstance.put('/auth/fcm-token', {
      userName,
      fcmToken
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  };

  /**
   * Verify user session
   * @param accessToken - Access token
   */
  const verifySession = async (accessToken: string) => {
    const response = await axiosInstance.get('/auth/verify', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.data;
  };

  /**
   * Change password
   * @param userName - User name
   * @param oldPassword - Old password
   * @param newPassword - New password
   * @param accessToken - Access token
   */
  const changePassword = async (userName: string, oldPassword: string, newPassword: string, accessToken: string) => {
    const response = await axiosInstance.put('/auth/change-password', {
      userName,
      oldPassword,
      newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  };

  /**
   * Reset password request
   * @param userName - User name
   */
  const requestPasswordReset = async (userName: string) => {
    const response = await axiosInstance.post('/auth/reset-password-request', {
      userName
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  };

  /**
   * Reset password with code
   * @param userName - User name
   * @param resetCode - Reset code
   * @param newPassword - New password
   */
  const resetPassword = async (userName: string, resetCode: string, newPassword: string) => {
    const response = await axiosInstance.post('/auth/reset-password', {
      userName,
      resetCode,
      newPassword
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  };

  return {
    loginUser,
    refreshToken,
    logoutUser,
    getUserValidity,
    updateFCMToken,
    verifySession,
    changePassword,
    requestPasswordReset,
    resetPassword
  };
}
