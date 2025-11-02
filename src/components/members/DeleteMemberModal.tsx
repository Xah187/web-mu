'use client';

import { useState } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import ButtonLong from '@/components/design/ButtonLong';
import { Tostget } from '@/components/ui/Toast';
import axiosInstance from '@/lib/api/axios';
import { useTranslation } from '@/hooks/useTranslation';

interface User {
  id: string;
  userName: string;
  IDNumber: string;
  PhoneNumber: string;
  job: string;
  jobdiscrption: string;
  Email?: string;
  image?: string;
  Validity?: string[];
}

interface DeleteMemberModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteMemberModal({ user: deleteUser, onClose, onSuccess }: DeleteMemberModalProps) {
  const { size } = useAppSelector((state: any) => state.user);
  const { t, isRTL, dir } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const dataToSend = {
        id: deleteUser.id,
        PhoneNumber: deleteUser.PhoneNumber
      };

      console.log('Deleting user with data:', dataToSend);

      const response = await axiosInstance.put('user/DeletUser', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Delete response:', response.data);

      if (response.status === 200) {
        if (response.data?.success || response.data?.message === 'تمت العملية بنجاح' || response.data === 'تمت العملية بنجاح') {
          Tostget(t('members.deleteSuccess'));
          onSuccess();
        } else {
          Tostget(response.data?.message || response.data || t('members.deleteError'));
        }
      } else {
        Tostget(isRTL ? 'حدث خطأ في الخادم' : 'Server error occurred');
      }
    } catch (error: any) {
      console.error('Error deleting member:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        Tostget(isRTL ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' : 'Session expired, please login again');
      } else if (error.response?.status === 403) {
        Tostget(t('members.noPermissionDelete'));
      } else {
        Tostget(error.response?.data?.message || t('members.deleteError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ direction: dir as 'rtl' | 'ltr' }}>
      <div className="bg-white rounded-2xl w-full max-w-md" style={{ direction: dir as 'rtl' | 'ltr' }}>
        {/* Icon */}
        <div className="flex justify-center pt-6 pb-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={colors.RED} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 text-center">
          <h2
            className="font-bold text-xl mb-2"
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: verticalScale(18 + size),
              color: colors.BLACK
            }}
          >
            {t('members.deleteMember')}
          </h2>

          <p
            className="text-gray-600 mb-4"
            style={{
              fontFamily: fonts.CAIROBOLD,
              fontSize: verticalScale(14 + size)
            }}
          >
            {t('members.confirmDelete')}
          </p>
          
          <p 
            className="font-semibold text-lg"
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: verticalScale(16 + size),
              color: colors.BLUE
            }}
          >
            {deleteUser.userName}
          </p>
          
          <p 
            className="text-sm text-gray-500 mt-2"
            style={{
              fontFamily: fonts.CAIROBOLD,
              fontSize: verticalScale(12 + size)
            }}
          >
            {deleteUser.PhoneNumber}
          </p>
          
          <div className="rounded-lg p-3 mt-4"
               style={{
                 backgroundColor: 'var(--color-warning)' + '20',
                 border: '1px solid var(--color-warning)'
               }}>
            <p
              className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}
              style={{
                fontFamily: fonts.CAIROBOLD,
                fontSize: verticalScale(12 + size),
                color: 'var(--color-warning)'
              }}
            >
              {t('members.deleteWarning')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 flex gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`} style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-medium transition-colors theme-button-secondary"
            style={{
              fontFamily: fonts.CAIROBOLD,
              fontSize: 14 + size,
              backgroundColor: 'var(--color-surface-secondary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)'
            }}
            disabled={loading}
          >
            {t('members.cancel')}
          </button>

          <ButtonLong
            text={loading ? t('members.deleting') : t('members.delete')}
            Press={handleDelete}
            disabled={loading}
            styleButton={{
              flex: 1,
              backgroundColor: colors.RED
            }}
          />
        </div>
      </div>
    </div>
  );
}
