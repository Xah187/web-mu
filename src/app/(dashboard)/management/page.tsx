'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/constants/colors';
import { verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import { EmployeeOnly } from '@/components/auth/PermissionGuard';
import ResponsiveLayout, { PageHeader, ContentSection, ResponsiveGrid } from '@/components/layout/ResponsiveLayout';
import Image from 'next/image';

interface ManagementItemProps {
  title: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  color?: string;
  width?: string;
  display?: 'flex' | 'none';
}

function ManagementItem({ title, icon, onPress, color = colors.BLACK, width = '100%', display = 'flex' }: ManagementItemProps) {
  return (
    <button
      onClick={onPress}
      className="rounded-2xl bg-white overflow-hidden p-4 py-5 m-1 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
      style={{
        width,
        display,
        minHeight: verticalScale(80),
        marginBottom: verticalScale(8)
      }}
    >
      {icon && (
        <div className="flex-shrink-0 mb-2">
          {icon}
        </div>
      )}
      <span
        className="font-ibm-arabic-semibold text-center leading-tight"
        style={{
          fontSize: verticalScale(14),
          color,
          lineHeight: 1.2
        }}
      >
        {title}
      </span>
    </button>
  );
}

// User Profile Modal (same as settings page)
function UserProfileModal({ visible, onClose, user }: { visible: boolean; onClose: () => void; user: any }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-bordercolor">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-ibm-arabic-semibold text-darkslategray">
              الملف الشخصي
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-peach rounded-full mx-auto mb-4 flex items-center justify-center">
              <Image
                src="/images/figma/male.png"
                alt="User Avatar"
                width={60}
                height={60}
                className="rounded-full"
              />
            </div>
            <h3 className="font-ibm-arabic-bold text-lg text-darkslategray mb-2">
              {user?.userName}
            </h3>
            <p className="font-ibm-arabic text-gray-600">
              {user?.job || user?.jobdiscrption || 'غير محدد'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-cairo text-gray-700">
                <strong className="text-blue">رقم الهوية:</strong> {user?.IDNumber}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-cairo text-gray-700">
                <strong className="text-blue">رقم الهاتف:</strong> {user?.PhoneNumber}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-cairo text-gray-700">
                <strong className="text-blue">البريد الإلكتروني:</strong> {user?.Email || 'غير محدد'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-cairo text-gray-700">
                <strong className="text-blue">صفة المستخدم:</strong> {user?.data?.jobdiscrption || user?.data?.job || 'غير محدد'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-bordercolor">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-blue text-white rounded-lg font-cairo font-medium hover:bg-blue-600 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManagementPage() {
  const router = useRouter();
  const { user, size } = useAppSelector(state => state.user);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const handleApprovals = () => {
    router.push('/settings/approvals');
  };

  const handleDecisions = () => {
    router.push('/settings/decisions');
  };

  const handleConsultations = () => {
    router.push('/settings/consultations');
  };

  const handleAttendance = async () => {
    // In mobile app, ALL employees can access basic preparation (check in/out)
    // Permission check only happens for advanced HR features inside the preparation page
    router.push('/preparation');
  };

  return (
    <>
      {/* User Profile Modal */}
      <UserProfileModal
        visible={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        user={user?.data}
      />

      <ResponsiveLayout 
        header={
          <PageHeader 
            title="الإدارة" 
            actions={
              <button 
                onClick={() => setShowUserProfile(true)} 
                className="w-9 h-9 rounded-full overflow-hidden bg-peach flex items-center justify-center" 
                aria-label="الملف الشخصي"
              >
                <Image 
                  src="/images/figma/male.png" 
                  alt="User" 
                  width={36} 
                  height={36} 
                  className="rounded-full" 
                />
              </button>
            } 
          />
        }
      >
        <ContentSection>
          {/* Spacer */}
          <div style={{ height: verticalScale(24) }}></div>

          {/* Management Grid */}
          <div className="px-4">
            <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
              
              {/* Employee-only features */}
              <EmployeeOnly>
                <ManagementItem
                  title="اعتمادات"
                  onPress={handleApprovals}
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4" stroke={colors.BLUE} strokeWidth="2" />
                      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.22.45 4.56 1.23" stroke={colors.BLUE} strokeWidth="2" />
                    </svg>
                  }
                />

                <ManagementItem
                  title="قرارات"
                  onPress={handleDecisions}
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M14.9263 2.91103L8.27352 6.10452C7.76151 6.35029 7.21443 6.41187 6.65675 6.28693C6.29177 6.20517 6.10926 6.16429 5.9623 6.14751C4.13743 5.93912 3 7.38342 3 9.04427V9.95573C3 11.6166 4.13743 13.0609 5.9623 12.8525C6.10926 12.8357 6.29178 12.7948 6.65675 12.7131C7.21443 12.5881 7.76151 12.6497 8.27352 12.8955L14.9263 16.089C16.4534 16.8221 17.217 17.1886 18.0684 16.9029C18.9197 16.6172 19.2119 16.0041 19.7964 14.778C21.4012 11.4112 21.4012 7.58885 19.7964 4.22196C19.2119 2.99586 18.9197 2.38281 18.0684 2.0971C17.217 1.8114 16.4534 2.17794 14.9263 2.91103Z"
                        stroke={colors.BLUE}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                />

                <ManagementItem
                  title="استشارات"
                  onPress={handleConsultations}
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={colors.BLUE} strokeWidth="2" />
                      <path d="M8 10h8" stroke={colors.BLUE} strokeWidth="1.5" />
                      <path d="M8 14h6" stroke={colors.BLUE} strokeWidth="1.5" />
                    </svg>
                  }
                />
              </EmployeeOnly>

              {/* Preparation button - Show for all users like mobile app */}
              <ManagementItem
                title="تحضير"
                onPress={handleAttendance}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke={colors.BLUE} strokeWidth="2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke={colors.BLUE} strokeWidth="2" />
                    <path d="M9 12l2 2 4-4" stroke={colors.BLUE} strokeWidth="2" />
                  </svg>
                }
              />

            </ResponsiveGrid>
          </div>
        </ContentSection>
      </ResponsiveLayout>
    </>
  );
}
