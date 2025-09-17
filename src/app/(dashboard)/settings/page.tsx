'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/constants/colors';
import { verticalScale } from '@/utils/responsiveSize';
import { useAppSelector, useAppDispatch } from '@/store';
import { clearUser } from '@/store/slices/userSlice';
import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';
import { Tostget } from '@/components/ui/Toast';
import Image from 'next/image';
import { AdminGuard, EmployeeOnly, PermissionBasedVisibility } from '@/components/auth/PermissionGuard';
import ResponsiveLayout, { PageHeader, ContentSection, ResponsiveGrid } from '@/components/layout/ResponsiveLayout';

interface SettingItemProps {
  title: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  color?: string;
  width?: string;
  display?: 'flex' | 'none';
}

function SettingItem({ title, icon, onPress, color = colors.BLACK, width = '100%', display = 'flex' }: SettingItemProps) {
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

// Modal for viewing user profile
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

// Delete Account Confirmation Modal
function DeleteAccountModal({ visible, onClose, onConfirm }: { visible: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm">
        <div className="p-6 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v9a2 2 0 002 2h8a2 2 0 002-2V9m0 0V6a2 2 0 00-2-2H8a2 2 0 00-2 2v3m0 0h8m0 0V9" />
            </svg>
          </div>
          <h3 className="font-cairo-bold text-black text-lg mb-2">
            حذف حسابك
          </h3>
          <p className="font-cairo text-gray-600 mb-6">
            هل أنت متأكد من رغبتك في حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 rounded-lg font-cairo font-medium transition-colors"
              style={{
                backgroundColor: colors.RED,
                color: 'white'
              }}
            >
              حذف الحساب
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-cairo font-medium hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, size, language: _language } = useAppSelector(state => state.user);
  const jobBasedPermissions = useJobBasedPermissions();
  const { isAdmin, isEmployee: _isEmployee } = jobBasedPermissions;
  const showTemplet = (Number(user?.data?.IDCompany) === 1) && (isAdmin || ['مدير الفرع','مدير عام','مدير تنفيذي'].includes(user?.data?.job || ''));

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [financeDisabled, setFinanceDisabled] = useState(false);

  // إظهار/إخفاء قسم البروفايل داخل المحتوى (نُبقي الزر في الهيدر فعال)
  const showInlineProfile = false;

  // Admin phone numbers (from mobile app)
  const adminPhoneNumbers = ['502464530', '567256943'];
  const isSystemAdmin = adminPhoneNumbers.includes(user?.data?.PhoneNumber || '');

  // Preparation button - Show for all users like mobile app (check permissions on click)
  // In mobile app, the button is always visible and permission check happens on press

  const handleLogout = async () => {
    try {
      // Close modal first
      setShowLogoutConfirm(false);

      // Clear user data
      dispatch(clearUser());
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');

      Tostget('تم تسجيل الخروج بنجاح');
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      Tostget('حدث خطأ أثناء تسجيل الخروج');
      setShowLogoutConfirm(false); // Close modal on error too
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Close modal first
      setShowDeleteConfirm(false);

      // TODO: Implement delete account API call
      Tostget('سيتم حذف الحساب قريباً');
    } catch (error) {
      console.error('Delete account error:', error);
      Tostget('حدث خطأ أثناء حذف الحساب');
      setShowDeleteConfirm(false); // Close modal on error too
    }
  };

  const handleLanguageChange = () => {
    router.push('/settings/language');
  };

  const _handlePendingOperations = () => {
    router.push('/settings/pending-operations');
  };

  const handleFontSize = () => {
    router.push('/settings/font-size');
  };

  const handleAbout = () => {
    router.push('/settings/about');
  };

  const handleContact = () => {
    router.push('/settings/contact');
  };

  const handleConsultations = () => {
    router.push('/settings/consultations');
  };

  const handleDecisions = () => {
    router.push('/settings/decisions');
  };

  const _handleChats = () => {
    router.push('/settings/chats');
  };

  const handleApprovals = () => {
    router.push('/settings/approvals');
  };

  const handleAttendance = async () => {
    // In mobile app, ALL employees can access basic preparation (check in/out)
    // Permission check only happens for advanced HR features inside the preparation page
    router.push('/preparation');
  };

  const handleFinanceToggle = () => {
    if (isAdmin) {
      setFinanceDisabled(!financeDisabled);
      // TODO: Implement finance toggle API
      Tostget(financeDisabled ? 'تم تفعيل العمليات المالية' : 'تم توقيف العمليات المالية');
    } else {
      Tostget('ليس في نطاق صلاحياتك');
    }
  };

  return (
    <>
      {/* User Profile Modal */}
      <UserProfileModal
        visible={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        user={user?.data}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-red" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </div>
              <h3 className="font-cairo-bold text-black text-lg mb-2">
                تأكيد تسجيل الخروج
              </h3>
              <p className="font-cairo text-gray-600 mb-6">
                هل أنت متأكد من رغبتك في تسجيل الخروج؟
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 px-4 rounded-lg font-cairo font-medium transition-colors"
                  style={{
                    backgroundColor: colors.RED,
                    color: 'white'
                  }}
                >
                  تسجيل الخروج
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-cairo font-medium hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ResponsiveLayout header={<PageHeader title="الإعدادات" actions={<button onClick={() => setShowUserProfile(true)} className="w-9 h-9 rounded-full overflow-hidden bg-peach flex items-center justify-center" aria-label="الملف الشخصي"><Image src="/images/figma/male.png" alt="User" width={36} height={36} className="rounded-full" /></button>} />}>
        <ContentSection>
        {/* Header with User Profile (hidden, replaced by header avatar button) */}
        {showInlineProfile && (
          <div className="bg-white rounded-b-3xl w-full p-3 pb-6" style={{ minHeight: verticalScale(140) }}>
            {/* Settings Title */}
            <div className="flex justify-start items-center pt-2 pb-1">
              <h1
                className="font-ibm-arabic-bold text-black text-right"
                style={{ fontSize: verticalScale(16 + size) }}
              >
                الاعدادات
              </h1>
            </div>

            {/* User Profile Section - Centered */}
            <div className="flex flex-col items-center justify-center mt-2">
              <button
                onClick={() => setShowUserProfile(true)}
                className="flex flex-col items-center justify-center"
              >
                <div
                  className="bg-peach rounded-full flex items-center justify-center mb-2"
                  style={{
                    width: verticalScale(50),
                    height: verticalScale(50)
                  }}
                >
                  <Image
                    src="/images/figma/male.png"
                    alt="User Avatar"
                    width={50}
                    height={50}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <p
                  className="font-ibm-arabic-bold text-black text-center mb-1"
                  style={{ fontSize: verticalScale(14 + size) }}
                >
                  {user?.data?.userName}
                </p>
                <p
                  className="font-ibm-arabic-bold text-gray-500 text-center"
                  style={{ fontSize: verticalScale(12 + size) }}
                >
                  {user?.data?.job || user?.data?.jobdiscrption || 'غير محدد'}
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Spacer */}
        <div style={{ height: verticalScale(24) }}></div>

        {/* Settings Grid */}
        <div className="px-4">
          <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
            {/* Language */}
            <SettingItem
              title="اللغة"
              onPress={handleLanguageChange}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M7 8.37931H11.5M11.5 8.37931H14.5M11.5 8.37931V7M17 8.37931H14.5M14.5 8.37931C13.9725 10.2656 12.8679 12.0487 11.6071 13.6158M11.6071 13.6158C10.5631 14.9134 9.41205 16.0628 8.39286 17M11.6071 13.6158C10.9643 12.8621 10.0643 11.6426 9.80714 11.0909M11.6071 13.6158L13.5357 15.6207" stroke={colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="10" stroke={colors.BLUE} strokeWidth="2" />
                </svg>
              }
            />

            {/* Templet access - Admin only like mobile app */}
            <AdminGuard>
              <PermissionBasedVisibility permission="Admin">
                {showTemplet && (
                  <SettingItem
                    title="قوالب المراحل"
                    onPress={() => router.push('/templet')}
                    icon={
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke={colors.BLUE} strokeWidth="2" />
                        <path d="M9 9h6v6H9z" stroke={colors.BLUE} strokeWidth="2" fill={colors.BLUE} fillOpacity="0.1" />
                        <path d="M9 3v18" stroke={colors.BLUE} strokeWidth="1" />
                        <path d="M15 3v18" stroke={colors.BLUE} strokeWidth="1" />
                        <path d="M3 9h18" stroke={colors.BLUE} strokeWidth="1" />
                        <path d="M3 15h18" stroke={colors.BLUE} strokeWidth="1" />
                      </svg>
                    }
                  />
                )}
              </PermissionBasedVisibility>
            </AdminGuard>

            {/* Employee-only features */}
            <EmployeeOnly>
              <SettingItem
                title="اعتمادات"
                onPress={handleApprovals}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke={colors.BLUE} strokeWidth="2" />
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.22.45 4.56 1.23" stroke={colors.BLUE} strokeWidth="2" />
                  </svg>
                }
              />

              <SettingItem
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

              <SettingItem
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
            <SettingItem
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

            {/* Font Size - Always show */}
            <SettingItem
              title="حجم الخط"
              onPress={handleFontSize}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7V4h16v3" stroke={colors.BLUE} strokeWidth="2" />
                  <path d="M9 20h6" stroke={colors.BLUE} strokeWidth="2" />
                  <path d="M12 4v16" stroke={colors.BLUE} strokeWidth="2" />
                  <circle cx="7" cy="12" r="2" stroke={colors.BLUE} strokeWidth="1.5" fill="none" />
                  <circle cx="17" cy="12" r="3" stroke={colors.BLUE} strokeWidth="1.5" fill="none" />
                </svg>
              }
            />

            {/* About and Contact */}
            <SettingItem
              title="حول منصة مشرف"
              onPress={handleAbout}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke={colors.BLUE} strokeWidth="2" />
                  <path d="M12 16v-4" stroke={colors.BLUE} strokeWidth="2" />
                  <path d="M12 8h.01" stroke={colors.BLUE} strokeWidth="2" />
                </svg>
              }
            />

            <SettingItem
              title="تواصل معنا"
              onPress={handleContact}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke={colors.BLUE} strokeWidth="2" />
                </svg>
              }
            />
          </ResponsiveGrid>
        </div>

         {/* Bottom Actions - Full Width */}
         <div className="px-4 mt-8 mb-24 space-y-3">
           {/* Admin Finance Toggle - Smaller */}
           <AdminGuard>
             <div className="flex justify-center">
               <div className="bg-white rounded-2xl px-3 py-2 flex items-center justify-between max-w-sm gap-4">
                 <span
                   className="font-ibm-arabic-semibold text-right"
                   style={{
                     fontSize: verticalScale(14),
                     color: colors.BLUE
                   }}
                 >
                   توقيف العمليات اليدوية لقسم المالية
                 </span>
                 <button
                   onClick={handleFinanceToggle}
                   className="relative inline-flex items-center justify-center w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none border font-ibm-arabic-bold text-xs text-white"
                   style={{
                     backgroundColor: financeDisabled ? colors.RED : colors.BLUE,
                     borderColor: financeDisabled ? colors.RED : colors.BLUE
                   }}
                 >
                   {financeDisabled ? 'OFF' : 'ON'}
                 </button>
               </div>
             </div>
           </AdminGuard>

           {/* Delete Account - Smaller */}
           <div className="flex justify-center">
             <button
               onClick={() => setShowDeleteConfirm(true)}
               className="bg-white rounded-2xl px-3 py-2 flex items-center justify-start gap-2 max-w-xs"
             >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.RED} strokeWidth="2">
               <polyline points="3,6 5,6 21,6" />
               <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2v2" />
               <line x1="10" y1="11" x2="10" y2="17" />
               <line x1="14" y1="11" x2="14" y2="17" />
             </svg>
             <span
               className="font-ibm-arabic-semibold text-right"
               style={{
                 fontSize: verticalScale(14),
                 color: colors.RED
               }}
             >
               حذف حسابي
             </span>
             </button>
           </div>

           {/* Logout - Smaller */}
           <div className="flex justify-center">
             <button
               onClick={() => setShowLogoutConfirm(true)}
               className="bg-white rounded-2xl px-3 py-2 flex items-center justify-start gap-2 max-w-xs"
             >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.RED} strokeWidth="2">
               <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
               <polyline points="16,17 21,12 16,7" />
               <line x1="21" y1="12" x2="9" y2="12" />
             </svg>
             <span
               className="font-ibm-arabic-semibold text-right"
               style={{
                 fontSize: verticalScale(14),
                 color: colors.RED
               }}
             >
               تسجيل خروج
             </span>
             </button>
           </div>

           {/* System Admin Features */}
           {isSystemAdmin && (
             <div className="w-full">
               <SettingItem
                 title="طلبات الاشتراك"
                 onPress={() => Tostget('صفحة طلبات الاشتراك قريباً')}
                 width="100%"
               />
             </div>
           )}
         </div>
        </ContentSection>
      </ResponsiveLayout>
    </>
  );
}
