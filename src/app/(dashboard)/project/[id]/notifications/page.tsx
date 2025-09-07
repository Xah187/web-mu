'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import useNotifications from '@/hooks/useNotifications';

const ProjectNotificationsPage = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.id as string);
  
  const { user } = useSelector((state: any) => state.user || {});
  const { notifications, loading, hasMore, fetchInitial, loadMore } = useNotifications();

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="rotate-180">
              <path
                d="M9 18L15 12L9 6"
                stroke="#374151"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">إشعارات المشروع</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 5.5l15 15m-15-15L9 15l6-6" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {n.Title || n.title || 'إشعار'}
                    </p>
                    <p className="text-gray-600 mt-1 text-sm">
                      {n.Message || n.message || ''}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {n.CreatedAt || n.createdAt || ''}
                  </span>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="pt-2">
                <button
                  onClick={loadMore}
                  className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  تحميل المزيد
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectNotificationsPage;
