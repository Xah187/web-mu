'use client';

import React from 'react';
import { useAppSelector } from '@/store';
import { colors } from '@/constants/colors';
import { scale, verticalScale } from '@/utils/responsiveSize';
import Image from 'next/image';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, size } = useAppSelector((state: any) => state.user);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-black bg-opacity-40 absolute inset-0"
        onClick={onClose}
      />
      
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl">
        {/* User Avatar and Basic Info */}
        <div className="flex flex-col items-center mb-6">
          <div 
            className="bg-peach rounded-full flex items-center justify-center mb-4 overflow-hidden"
            style={{ 
              width: scale(70), 
              height: scale(70),
              backgroundColor: '#FFE4E1'
            }}
          >
            <Image
              src="/images/figma/male.png"
              alt="User Avatar"
              width={70}
              height={70}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          
          <h3 
            className="font-ibm-arabic-bold text-gray-900 text-center mb-2"
            style={{ fontSize: verticalScale(16 + size) }}
          >
            {user?.data?.userName || 'المستخدم'}
          </h3>
          
          <p 
            className="font-ibm-arabic-medium text-gray-600 text-center"
            style={{ fontSize: verticalScale(14 + size) }}
          >
            {user?.data?.job || 'غير محدد'}
          </p>
        </div>

        {/* User Details */}
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p 
              className="font-ibm-arabic-medium text-gray-700 text-right"
              style={{ fontSize: verticalScale(13 + size) }}
            >
              <span className="text-gray-500">رقم الجوال: </span>
              <span className="font-ibm-arabic-semibold">
                {user?.data?.PhoneNumber || 'غير محدد'}
              </span>
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <p 
              className="font-ibm-arabic-medium text-gray-700 text-right"
              style={{ fontSize: verticalScale(13 + size) }}
            >
              <span className="text-gray-500">رقم البطاقة: </span>
              <span className="font-ibm-arabic-semibold">
                {user?.data?.IDNumber || 'غير محدد'}
              </span>
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <p 
              className="font-ibm-arabic-medium text-gray-700 text-right"
              style={{ fontSize: verticalScale(13 + size) }}
            >
              <span className="text-gray-500">الوصف الوظيفي: </span>
              <span className="font-ibm-arabic-semibold">
                {user?.data?.jobdiscrption || 'غير محدد'}
              </span>
            </p>
          </div>
        </div>

        {/* Permissions Section */}
        {user?.data?.Validity && user.data.Validity.filter((item: any) => item?.NameBransh !== undefined).length > 0 && (
          <div className="mb-6">
            <h4 
              className="font-ibm-arabic-bold text-gray-900 text-right mb-4"
              style={{ fontSize: verticalScale(15 + size) }}
            >
              الصلاحيات
            </h4>
            
            <div className="space-y-3">
              {user.data.Validity
                .filter((item: any) => item?.NameBransh !== undefined)
                .map((item: any, index: number) => (
                  <div key={index} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 text-right">
                        <p 
                          className="font-ibm-arabic-semibold text-blue-800"
                          style={{ fontSize: verticalScale(13 + size) }}
                        >
                          {item?.job || 'غير محدد'}
                        </p>
                      </div>
                      <div className="flex-1 text-left">
                        <p 
                          className="font-ibm-arabic-medium text-blue-600"
                          style={{ fontSize: verticalScale(13 + size) }}
                        >
                          {item?.NameBransh || 'غير محدد'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
          style={{ fontSize: verticalScale(14 + size) }}
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};

export default UserProfileModal;
