'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import useValidityUser from '@/hooks/useValidityUser';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
}

export default function CreateFolderModal({
  isOpen,
  onClose,
  onSuccess,
  projectId
}: CreateFolderModalProps) {
  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();
  
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      Tostget('يجب إدخال اسم المجلد');
      return;
    }

    // التحقق من الصلاحيات - مطابق للتطبيق المحمول
    const hasPermission = await Uservalidation('انشاء مجلد او تعديله', projectId);
    if (!hasPermission) {
      return;
    }

    setLoading(true);
    try {
      // مطابق للتطبيق المحمول - API call
      const response = await axiosInstance.post('/brinshCompany/AddFolderArchivesnew', {
        ProjectID: projectId,
        FolderName: folderName.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      if (response.status === 200) {
        Tostget(response.data?.success || 'تم إنشاء المجلد بنجاح');
        setFolderName('');
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      Tostget('خطأ في إنشاء المجلد');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFolderName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          {/* أيقونة المجلد */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          
          <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">
            إنشاء مجلد جديد
          </h3>
          
          <p className="text-gray-600 font-ibm-arabic-medium">
            أدخل اسم المجلد الجديد في الأرشيف
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="folderName" className="block text-sm font-ibm-arabic-semibold text-gray-700 mb-2">
              اسم المجلد
            </label>
            <input
              type="text"
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="أدخل اسم المجلد..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-ibm-arabic-medium"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              إلغاء
            </button>
            
            <button
              type="submit"
              disabled={loading || !folderName.trim()}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    <line x1="12" y1="11" x2="12" y2="17"/>
                    <line x1="9" y1="14" x2="15" y2="14"/>
                  </svg>
                  إنشاء المجلد
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
