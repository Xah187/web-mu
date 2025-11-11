'use client';

import React from 'react';
import { useAppSelector } from '@/store';
import { colors } from '@/constants/colors';
import { scale, verticalScale } from '@/utils/responsiveSize';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, size, language } = useAppSelector((state: any) => state.user);
  const { t, isRTL, dir } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
      style={{ direction: dir as 'rtl' | 'ltr' }}
    >
      <div
        className="bg-black bg-opacity-40 absolute inset-0"
        onClick={onClose}
      />

      <div
        className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl"
        style={{
          padding: '32px 24px',
          direction: dir as 'rtl' | 'ltr'
        }}
      >
        {/* User Avatar and Basic Info */}
        <div className="flex flex-col items-center" style={{ marginBottom: '24px' }}>
          <div
            className="bg-peach rounded-full flex items-center justify-center overflow-hidden"
            style={{
              width: scale(80),
              height: scale(80),
              backgroundColor: '#FFE4E1',
              marginBottom: '16px'
            }}
          >
            <Image
              src="/images/figma/male.png"
              alt="User Avatar"
              width={80}
              height={80}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <h3
            className="font-ibm-arabic-bold text-gray-900 text-center"
            style={{
              fontSize: verticalScale(18 + size),
              marginBottom: '8px',
              textAlign: 'center'
            }}
          >
            {user?.data?.userName || t('profile.user')}
          </h3>

          <p
            className="font-ibm-arabic-medium text-gray-600 text-center"
            style={{
              fontSize: verticalScale(14 + size),
              textAlign: 'center'
            }}
          >
            {user?.data?.job || t('profile.notSpecified')}
          </p>
        </div>

        {/* User Details */}
        <div style={{ marginBottom: '24px' }}>
          <div
            className="bg-gray-50 rounded-xl"
            style={{
              padding: '16px 20px',
              marginBottom: '12px'
            }}
          >
            <p
              className="font-ibm-arabic-medium text-gray-700"
              style={{
                fontSize: verticalScale(14 + size),
                textAlign: isRTL ? 'right' : 'left',
                direction: dir as 'rtl' | 'ltr'
              }}
            >
              <span className="text-gray-500">{t('profile.phoneNumber')}: </span>
              <span className="font-ibm-arabic-semibold">
                {user?.data?.PhoneNumber || t('profile.notSpecified')}
              </span>
            </p>
          </div>

          <div
            className="bg-gray-50 rounded-xl"
            style={{
              padding: '16px 20px',
              marginBottom: '12px'
            }}
          >
            <p
              className="font-ibm-arabic-medium text-gray-700"
              style={{
                fontSize: verticalScale(14 + size),
                textAlign: isRTL ? 'right' : 'left',
                direction: dir as 'rtl' | 'ltr'
              }}
            >
              <span className="text-gray-500">{t('profile.idNumber')}: </span>
              <span className="font-ibm-arabic-semibold">
                {user?.data?.IDNumber || t('profile.notSpecified')}
              </span>
            </p>
          </div>

          <div
            className="bg-gray-50 rounded-xl"
            style={{
              padding: '16px 20px'
            }}
          >
            <p
              className="font-ibm-arabic-medium text-gray-700"
              style={{
                fontSize: verticalScale(14 + size),
                textAlign: isRTL ? 'right' : 'left',
                direction: dir as 'rtl' | 'ltr'
              }}
            >
              <span className="text-gray-500">{t('profile.jobDescription')}: </span>
              <span className="font-ibm-arabic-semibold">
                {user?.data?.jobdiscrption || t('profile.notSpecified')}
              </span>
            </p>
          </div>
        </div>

        {/* Permissions Section */}
        {user?.data?.Validity && user.data.Validity.filter((item: any) => item?.NameBransh !== undefined).length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4
              className="font-ibm-arabic-bold text-gray-900"
              style={{
                fontSize: verticalScale(16 + size),
                marginBottom: '16px',
                textAlign: isRTL ? 'right' : 'left',
                direction: dir as 'rtl' | 'ltr'
              }}
            >
              {t('profile.permissions')}
            </h4>

            <div>
              {user.data.Validity
                .filter((item: any) => item?.NameBransh !== undefined)
                .map((item: any, index: number) => (
                  <div
                    key={index}
                    className="bg-blue-50 rounded-xl border border-blue-100"
                    style={{
                      padding: '16px 20px',
                      marginBottom: index < user.data.Validity.filter((i: any) => i?.NameBransh !== undefined).length - 1 ? '12px' : '0'
                    }}
                  >
                    <div
                      className="flex items-center"
                      style={{
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p
                          className="font-ibm-arabic-semibold text-blue-800"
                          style={{
                            fontSize: verticalScale(14 + size),
                            textAlign: isRTL ? 'right' : 'left'
                          }}
                        >
                          {item?.job || t('profile.notSpecified')}
                        </p>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          className="font-ibm-arabic-medium text-blue-600"
                          style={{
                            fontSize: verticalScale(14 + size),
                            textAlign: isRTL ? 'left' : 'right'
                          }}
                        >
                          {item?.NameBransh || t('profile.notSpecified')}
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
          className="w-full bg-gray-200 text-gray-800 rounded-xl font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
          style={{
            fontSize: verticalScale(15 + size),
            padding: '14px 24px'
          }}
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  );
};

export default UserProfileModal;
