'use client';

import React, { useState, useEffect } from 'react';
import { Tostget } from '@/components/ui/Toast';
import useBranchOperations from '@/hooks/useBranchOperations';

interface BranchManagerTabProps {
  branchId: string;
  branchName: string;
  currentManager?: {
    id: string;
    name: string;
    userName: string;
  } | null;
}

interface User {
  id: string;
  userName: string;
  FirstName: string;
  LastName: string;
  jobdiscrption: string;
  Email: string;
}

export default function BranchManagerTab({ 
  branchId, 
  branchName, 
  currentManager 
}: BranchManagerTabProps) {
  const { getBranchUsers, updateBranchManager, loading } = useBranchOperations();
  
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load available users when component mounts
  useEffect(() => {
    loadAvailableUsers();
  }, [branchId]);

  const loadAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      const users = await getBranchUsers(branchId);
      setAvailableUsers(users || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      Tostget('فشل في تحميل قائمة المستخدمين', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdateManager = async () => {
    try {
      if (!selectedUserId) {
        Tostget('يرجى اختيار مدير الفرع');
        return;
      }

      await updateBranchManager(branchId, selectedUserId);
      setSelectedUserId('');
      
      // Refresh the available users list
      await loadAvailableUsers();
    } catch (error: any) {
      console.error('Error updating branch manager:', error);
      Tostget(error.message || 'فشل في تحديث مدير الفرع', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">إدارة مدير الفرع</h3>
      
      {/* Current Manager */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">المدير الحالي</h4>
        {currentManager ? (
          <div className="text-blue-700">
            <p><strong>الاسم:</strong> {currentManager.name}</p>
            <p><strong>اسم المستخدم:</strong> {currentManager.userName}</p>
          </div>
        ) : (
          <p className="text-blue-700">لا يوجد مدير محدد لهذا الفرع</p>
        )}
      </div>

      {/* Change Manager Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-4">تعيين مدير جديد</h4>
        
        {loadingUsers ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="mr-2 text-gray-600">جاري تحميل المستخدمين...</span>
          </div>
        ) : availableUsers.length > 0 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختر المدير الجديد:
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- اختر مدير الفرع --</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.FirstName} {user.LastName} ({user.userName}) - {user.jobdiscrption}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleUpdateManager}
              disabled={loading || !selectedUserId}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{loading ? 'جاري التحديث...' : 'تعيين كمدير للفرع'}</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">لا يوجد مستخدمون متاحون في هذا الفرع</p>
            <button
              onClick={loadAvailableUsers}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              إعادة التحميل
            </button>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="mr-3">
            <h4 className="text-sm font-medium text-yellow-800">ملاحظة مهمة</h4>
            <p className="text-sm text-yellow-700 mt-1">
              هذه الميزة قيد التطوير. ستكون متاحة قريباً لإدارة مدراء الفروع بشكل كامل.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
