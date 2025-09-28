'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import useValidityUser from '@/hooks/useValidityUser';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';

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
  const { user, size } = useSelector((state: any) => state.user || {});
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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
      style={{
        zIndex: 1050
      }}
    >
      <div
        className="w-full shadow-2xl"
        style={{
          backgroundColor: 'var(--theme-card-background)',
          border: '1px solid var(--theme-border)',
          borderRadius: `${scale(20)}px`,
          maxWidth: `${scale(400)}px`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div
          className="text-center"
          style={{ marginBottom: `${scale(24)}px` }}
        >
          {/* أيقونة المجلد */}
          <div
            className="mx-auto flex items-center justify-center rounded-full bg-blue-100"
            style={{
              width: `${scale(48)}px`,
              height: `${scale(48)}px`,
              marginBottom: `${scale(16)}px`
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-600"
              style={{
                width: `${scale(24)}px`,
                height: `${scale(24)}px`
              }}
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>

          <h3
            className="text-gray-900 font-ibm-arabic-bold"
            style={{
              fontSize: `${scale(18 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicBold,
              marginBottom: `${scale(8)}px`,
              lineHeight: 1.4
            }}
          >
            إنشاء مجلد جديد
          </h3>

          <p
            className="text-gray-600 font-ibm-arabic-medium"
            style={{
              fontSize: `${scale(14 + size)}px`,
              fontFamily: fonts.IBMPlexSansArabicMedium,
              lineHeight: 1.5
            }}
          >
            أدخل اسم المجلد الجديد في الأرشيف
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: `${scale(16)}px` }}
        >
          <div>
            <label
              htmlFor="folderName"
              className="block text-gray-700 font-ibm-arabic-semibold"
              style={{
                fontSize: `${scale(14 + size)}px`,
                fontFamily: fonts.IBMPlexSansArabicSemiBold,
                marginBottom: `${scale(8)}px`
              }}
            >
              اسم المجلد
            </label>
            <input
              type="text"
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="أدخل اسم المجلد..."
              className="w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-ibm-arabic-medium transition-all duration-200"
              style={{
                padding: `${scale(12)}px ${scale(16)}px`,
                borderColor: colors.BORDERCOLOR,
                borderRadius: `${scale(8)}px`,
                fontSize: `${scale(14 + size)}px`,
                fontFamily: fonts.IBMPlexSansArabicMedium,
                opacity: loading ? 0.6 : 1
              }}
              disabled={loading}
              autoFocus
            />
          </div>

          <div
            className="flex"
            style={{
              gap: `${scale(12)}px`,
              paddingTop: `${scale(16)}px`
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 text-gray-800 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              style={{
                padding: `${scale(12)}px ${scale(16)}px`,
                borderRadius: `${scale(8)}px`,
                fontSize: `${scale(14 + size)}px`,
                fontFamily: fonts.IBMPlexSansArabicSemiBold
              }}
              disabled={loading}
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={loading || !folderName.trim()}
              className="flex-1 text-white rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md"
              style={{
                backgroundColor: colors.BLUE,
                padding: `${scale(12)}px ${scale(16)}px`,
                borderRadius: `${scale(8)}px`,
                fontSize: `${scale(14 + size)}px`,
                fontFamily: fonts.IBMPlexSansArabicSemiBold,
                gap: `${scale(8)}px`
              }}
            >
              {loading ? (
                <>
                  <div
                    className="border-2 border-white border-t-transparent rounded-full animate-spin"
                    style={{
                      width: `${scale(16)}px`,
                      height: `${scale(16)}px`
                    }}
                  ></div>
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      width: `${scale(16)}px`,
                      height: `${scale(16)}px`
                    }}
                  >
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
