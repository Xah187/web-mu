'use client';

import { useState } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import ButtonLong from '@/components/design/ButtonLong';
import { Tostget } from '@/components/ui/Toast';
import axiosInstance from '@/lib/api/axios';

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
          Tostget('تم حذف العضو بنجاح');
          onSuccess();
        } else {
          Tostget(response.data?.message || response.data || 'فشل في حذف العضو');
        }
      } else {
        Tostget('حدث خطأ في الخادم');
      }
    } catch (error: any) {
      console.error('Error deleting member:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        Tostget('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
      } else if (error.response?.status === 403) {
        Tostget('ليس لديك صلاحية لحذف هذا العضو');
      } else {
        Tostget(error.response?.data?.message || 'خطأ في حذف العضو');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
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
            حذف العضو
          </h2>
          
          <p 
            className="text-gray-600 mb-4"
            style={{
              fontFamily: fonts.CAIROBOLD,
              fontSize: verticalScale(14 + size)
            }}
          >
            هل أنت متأكد من حذف العضو
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
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <p 
              className="text-sm text-yellow-800"
              style={{
                fontFamily: fonts.CAIROBOLD,
                fontSize: verticalScale(12 + size)
              }}
            >
              تحذير: لا يمكن التراجع عن هذا الإجراء
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            style={{
              fontFamily: fonts.CAIROBOLD,
              fontSize: 14 + size
            }}
            disabled={loading}
          >
            إلغاء
          </button>
          
          <ButtonLong
            text={loading ? 'جاري الحذف...' : 'تأكيد الحذف'}
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
