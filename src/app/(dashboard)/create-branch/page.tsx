'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import Input from '@/components/design/Input';
import ButtonLong from '@/components/design/ButtonLong';
import ArrowIcon from '@/components/icons/ArrowIcon';
import useUserPermissions from '@/hooks/useUserPermissions';
import useValidityUser from '@/hooks/useValidityUser';
import PermissionGuard, { AdminGuard } from '@/components/auth/PermissionGuard';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import { useTranslation } from '@/hooks/useTranslation';

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

// User selection modal component
interface User {
  id: string;
  userName: string;
  job: string;
  PhoneNumber: string;
  Email: string;
}

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'AdminSub' | 'UserSub';
  onSelectUser: (user: User) => void;
  onSelectUsers: (users: User[]) => void;
  selectedCount: number;
}

function UserSelectionModal({
  isOpen,
  onClose,
  type,
  onSelectUser,
  onSelectUsers,
  selectedCount
}: UserSelectionModalProps) {
  const { user } = useAppSelector(state => state.user);
  const { t, isRTL, dir } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, type]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `user/BringUserCompanyinv2?IDCompany=${user?.data?.IDCompany}&idBrinsh=0&type=${type}&number=0&kind_request=all`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        // Filter out Admin users as per mobile app logic
        const filteredUsers = response.data.data.filter((u: User) => u.job !== 'Admin');
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Tostget(t('createBranch.errorFetchingUsers'));
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    if (type === 'AdminSub') {
      // Single selection for branch manager
      onSelectUser(selectedUser);
      onClose();
    } else {
      // Multiple selection for members
      const isSelected = selectedUserIds.includes(selectedUser.id);
      let newSelectedIds: string[];

      if (isSelected) {
        newSelectedIds = selectedUserIds.filter(id => id !== selectedUser.id);
      } else {
        newSelectedIds = [...selectedUserIds, selectedUser.id];
      }

      setSelectedUserIds(newSelectedIds);
    }
  };

  const handleConfirmSelection = () => {
    if (type === 'UserSub') {
      const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
      onSelectUsers(selectedUsers);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-hidden" style={{ direction: dir as 'rtl' | 'ltr' }}>
      <div className="bg-white rounded-lg w-full max-w-md sm:max-w-lg lg:max-w-xl max-h-[70vh] sm:max-h-[75vh] flex flex-col shadow-2xl" style={{ direction: dir as 'rtl' | 'ltr' }}>
        {/* Header - Fixed */}
        <div className={`p-3 sm:p-4 border-b border-bordercolor bg-white rounded-t-lg flex-shrink-0`}>
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between mb-3`}>
            <h2
              className="font-bold text-lg sm:text-xl"
              style={{
                fontFamily: fonts.IBMPlexSansArabicBold,
                color: colors.BLACK,
                textAlign: isRTL ? 'right' : 'left'
              }}
            >
              {type === 'AdminSub' ? t('createBranch.selectManager') : t('createBranch.selectMembers')}
            </h2>
            <button
              onClick={onClose}
              className="text-greay hover:text-black w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Bulk Selection Controls for UserSub */}
          {type === 'UserSub' && users.length > 0 && !loading && (
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <span
                className="text-sm text-gray-600"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicMedium
                }}
              >
                {t('createBranch.selectedCount', { selected: selectedUserIds.length, total: users.length })}
              </span>

              <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <button
                  onClick={() => setSelectedUserIds(users.map(u => u.id))}
                  className="px-3 py-1 text-xs bg-blue/10 text-blue rounded-lg hover:bg-blue/20 transition-colors"
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicMedium
                  }}
                >
                  {t('createBranch.selectAll')}
                </button>

                <button
                  onClick={() => setSelectedUserIds([])}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  style={{
                    fontFamily: fonts.IBMPlexSansArabicMedium
                  }}
                >
                  {t('createBranch.clearAll')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 min-h-0"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#CBD5E0 #F7FAFC'
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 6px;
            }
            div::-webkit-scrollbar-track {
              background: #F7FAFC;
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb {
              background: #CBD5E0;
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: #A0AEC0;
            }
          `}</style>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue"></div>
              <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-greay`}>{t('createBranch.loading')}</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-greay text-lg">{t('createBranch.noUsersAvailable')}</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3 pb-2">
              {users.map((u, index) => (
                <button
                  key={u.id}
                  onClick={() => handleUserSelect(u)}
                  className={`
                    w-full text-right p-3 sm:p-4 rounded-xl border transition-all duration-200 active:scale-98 cursor-pointer relative
                    ${selectedUserIds.includes(u.id)
                      ? 'bg-blue/10 border-blue shadow-lg hover:bg-blue/15 hover:shadow-xl'
                      : 'bg-white border-bordercolor hover:bg-blue/5 hover:border-blue/50 hover:shadow-lg'
                    }
                  `}
                  style={{
                    transform: 'translateZ(0)', // Enable hardware acceleration
                    backfaceVisibility: 'hidden' // Improve performance
                  }}
                >
                  {/* Selection indicator stripe */}
                  {selectedUserIds.includes(u.id) && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue rounded-r-xl"></div>
                  )}

                  {/* Multi-select hint for UserSub */}
                  {type === 'UserSub' && (
                    <div className="absolute top-2 left-2 text-xs text-gray-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-right">
                      <p
                        className="font-medium mb-1 text-sm sm:text-base"
                        style={{
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          color: colors.BLACK
                        }}
                      >
                        {u.userName}
                      </p>
                      <p
                        className="text-xs sm:text-sm mb-1"
                        style={{
                          color: colors.GREAY,
                          fontFamily: fonts.IBMPlexSansArabicRegular
                        }}
                      >
                        {u.job}
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          color: colors.BLUE,
                          fontFamily: fonts.IBMPlexSansArabicRegular
                        }}
                      >
                        {u.PhoneNumber}
                      </p>
                    </div>

                    {type === 'UserSub' && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Multiple Selection Indicator */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`
                              w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                              ${selectedUserIds.includes(u.id)
                                ? 'bg-blue border-blue scale-110 shadow-lg'
                                : 'border-bordercolor hover:border-blue/50 hover:scale-105'
                              }
                            `}
                          >
                            {selectedUserIds.includes(u.id) && (
                              <span className="text-white text-sm sm:text-base font-bold">✓</span>
                            )}
                          </div>

                          {/* Multi-select icon hint */}
                          <div className="flex gap-1 mt-1">
                            <div className="w-1 h-1 bg-blue/40 rounded-full"></div>
                            <div className="w-1 h-1 bg-blue/40 rounded-full"></div>
                            <div className="w-1 h-1 bg-blue/40 rounded-full"></div>
                          </div>
                        </div>

                        {/* Selection count badge */}
                        {selectedUserIds.includes(u.id) && (
                          <div className="bg-blue text-white text-xs px-2 py-1 rounded-full animate-pulse">
                            {selectedUserIds.findIndex(id => id === u.id) + 1}
                          </div>
                        )}
                      </div>
                    )}

                    {type === 'AdminSub' && (
                      <div className="text-blue transition-transform hover:scale-110 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        {type === 'UserSub' && (
          <div className="border-t border-bordercolor p-3 sm:p-4 bg-gray-50 rounded-b-lg flex-shrink-0">
            <div className={`flex gap-3 sm:gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <button
                onClick={onClose}
                className="flex-1 bg-white border border-gray-300 text-black py-2 sm:py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm active:scale-98 cursor-pointer"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicMedium
                }}
              >
                {t('createBranch.cancel')}
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={selectedUserIds.length === 0}
                className={`
                  flex-1 py-2 sm:py-3 rounded-xl text-white transition-all duration-200 text-sm font-medium shadow-lg active:scale-98 cursor-pointer relative
                  ${selectedUserIds.length === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-xl hover:scale-105'
                  }
                `}
                style={{
                  backgroundColor: colors.BLUE,
                  fontFamily: fonts.IBMPlexSansArabicMedium
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  {selectedUserIds.length > 0 && (
                    <div className="flex items-center gap-1">
                      {/* Users icons */}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>

                      {/* Selection count badge */}
                      <span className="bg-white text-blue text-xs px-2 py-1 rounded-full font-bold">
                        {selectedUserIds.length}
                      </span>
                    </div>
                  )}

                  <span>
                    {selectedUserIds.length === 0
                      ? t('createBranch.selectUsers')
                      : selectedUserIds.length === 1
                        ? t('createBranch.addOneMember')
                        : t('createBranch.addMultipleMembers', { count: selectedUserIds.length })
                    }
                  </span>
                </div>

                {/* Animated selection indicator */}
                {selectedUserIds.length > 0 && (
                  <div className="absolute top-0 right-0 -mt-2 -mr-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 right-0"></div>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateBranchPage() {
  const router = useRouter();
  const { user, size } = useAppSelector(state => state.user);
  const { t, isRTL, dir } = useTranslation();
  const { checkPermission } = useUserPermissions();

  // Form states - matching mobile app exactly
  const [start, setStart] = useState({
    NameSub: false,
    BranchAddress: false,
    Email: false,
    PhoneNumber: false,
  });

  const [title, setTitle] = useState({
    NameSub: '',
    BranchAddress: '',
    Email: '',
    PhoneNumber: '',
  });

  const [startUser, setStartUser] = useState({
    kind: '',
    boolen: false,
  });

  const [check, setCheck] = useState(0); // Selected branch manager count
  const [checkGloble, setCheckGloble] = useState<{[key: string]: User}>({}); // Selected members
  const [loading, setLoading] = useState(false);

  // Check permission on component mount
  useEffect(() => {
    const checkAccess = async () => {
      const hasPermission = await checkPermission('Admin');
      if (!hasPermission) {
        router.push('/home');
      }
    };
    checkAccess();
  }, []);

  const handleInputChange = (value: string, field: keyof typeof title) => {
    setTitle(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectBranchManager = (selectedUser: User) => {
    setCheck(1);
    // Store the selected manager in checkGloble with special key
    setCheckGloble(prev => ({ ...prev, branchManager: selectedUser }));
  };

  const handleSelectMembers = (selectedUsers: User[]) => {
    const membersObject = selectedUsers.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as {[key: string]: User});

    // Keep branch manager if exists, add members
    setCheckGloble(prev => {
      const newCheckGloble = { ...membersObject };
      if (prev.branchManager) {
        newCheckGloble.branchManager = prev.branchManager;
      }
      return newCheckGloble;
    });
  };

  const validateForm = () => {
    if (!title.NameSub.trim()) {
      Tostget(t('createBranch.enterBranchName'));
      return false;
    }
    if (!title.BranchAddress.trim()) {
      Tostget(t('createBranch.enterBranchAddress'));
      return false;
    }
    if (!title.Email.trim()) {
      Tostget(t('createBranch.enterEmail'));
      return false;
    }
    if (!title.PhoneNumber.trim()) {
      Tostget(t('createBranch.enterBranchPhone'));
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(title.Email)) {
      Tostget(t('createBranch.invalidEmail'));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data exactly like mobile app
      const submitData = {
        ...title,
        NumberCompany: user?.data?.IDCompany,
        check: check,
        checkGloble: checkGloble,
      };

      const response = await axiosInstance.post('company/brinsh', JSON.stringify(submitData), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken}`
        }
      });

      if (response.status === 200) {
        Tostget(response.data?.success || t('createBranch.createSuccess'));

        // Navigate back to home and trigger refresh
        setTimeout(() => {
          router.push('/home?refresh=branches');
        }, 1500);
      } else {
        Tostget(t('createBranch.createError'));
      }

    } catch (error: any) {
      console.error('Create branch error:', error);

      if (error.response?.data?.message) {
        Tostget(error.response.data.message);
      } else {
        Tostget(t('createBranch.connectionError'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate responsive dimensions like mobile app
  const Height = size <= 5 ? '10%' : '20%';
  const textAbsolut = {
    top: size <= 5 ? verticalScale(5) : verticalScale(-10),
    fontSize: verticalScale(10 + size),
    fontWeight: '500',
    fontFamily: fonts.IBMPlexSansArabicMedium,
    color: '#7e879a',
    textAlign: 'right' as const,
    position: 'absolute' as const,
    marginHorizontal: scale(10)
  };

  // Show user selection modal
  if (startUser.boolen) {
    return (
      <UserSelectionModal
        isOpen={startUser.boolen}
        onClose={() => setStartUser({ kind: '', boolen: false })}
        type={startUser.kind as 'AdminSub' | 'UserSub'}
        onSelectUser={handleSelectBranchManager}
        onSelectUsers={handleSelectMembers}
        selectedCount={Object.keys(checkGloble).length}
      />
    );
  }

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title={t('createBranch.title')}
          backButton={
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t('createBranch.back')}
              style={{ direction: dir as 'rtl' | 'ltr' }}
            >
              <ArrowIcon size={24} color={colors.BLACK} />
            </button>
          }
        />
      }
    >
      <ContentSection>





      {/* Form Content - Centered Container with Scroll */}
      <div className="flex justify-center px-4 py-6 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl">

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Branch Name */}
            <div className="w-full">
              <Input
                name={t('createBranch.branchName')}
                value={title.NameSub}
                onChange={(value) => handleInputChange(value, 'NameSub')}
                type="text"
                height="55px"
                marginBottom={0}
              />
            </div>

            {/* Branch Address */}
            <div className="w-full">
              <Input
                name={t('createBranch.branchAddress')}
                value={title.BranchAddress}
                onChange={(value) => handleInputChange(value, 'BranchAddress')}
                type="text"
                height="55px"
                marginBottom={0}
              />
            </div>

            {/* Email */}
            <div className="w-full">
              <Input
                name={t('createBranch.email')}
                value={title.Email}
                onChange={(value) => handleInputChange(value, 'Email')}
                type="email"
                height="55px"
                marginBottom={0}
              />
            </div>

            {/* Phone Number */}
            <div className="w-full">
              <Input
                name={t('createBranch.branchPhone')}
                value={title.PhoneNumber}
                onChange={(value) => {
                  // Convert Arabic to English numbers like mobile app
                  const convertedValue = value.replace(/[٠-٩]/g, (d) =>
                    String.fromCharCode(d.charCodeAt(0) - 1584)
                  );
                  handleInputChange(convertedValue, 'PhoneNumber');
                }}
                type="tel"
                height="55px"
                marginBottom={0}
              />
            </div>

            {/* Optional User Selection Buttons */}
            <div className="space-y-4 mt-8">

              {/* Add Branch Manager Button */}
              <button
                onClick={() => setStartUser({ kind: 'AdminSub', boolen: true })}
                className="w-full bg-blue/5 border border-dashed border-blue/20 rounded-2xl p-4 sm:p-6 hover:bg-blue/10 transition-all duration-200 hover:shadow-md active:scale-98 cursor-pointer"
                style={{ minHeight: '80px' }}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  {/* Label */}
                  <p
                    className="text-xs sm:text-sm text-gray-500 mb-1"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicMedium
                    }}
                  >
                    {t('createBranch.addManagerOptional')}
                  </p>

                  {/* Content */}
                  <div className="flex items-center justify-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M5.48131 12.9014C4.30234 13.6034 1.21114 15.0369 3.09389 16.8306C4.01359 17.7068 5.03791 18.3334 6.32573 18.3334H13.6743C14.9621 18.3334 15.9864 17.7068 16.9061 16.8306C18.7888 15.0369 15.6977 13.6034 14.5187 12.9014C11.754 11.2552 8.24599 11.2552 5.48131 12.9014Z"
                        stroke="#2117FB"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.75 5.41675C13.75 7.48781 12.0711 9.16675 10 9.16675C7.92893 9.16675 6.25 7.48781 6.25 5.41675C6.25 3.34568 7.92893 1.66675 10 1.66675C12.0711 1.66675 13.75 3.34568 13.75 5.41675Z"
                        stroke="#2117FB"
                        strokeWidth="1.5"
                      />
                    </svg>

                    <span
                      className="text-sm sm:text-base font-semibold"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        color: colors.BLACK
                      }}
                    >
                      {check > 0 ? t('createBranch.managerSelected') : t('createBranch.addBranchManager')}
                    </span>
                  </div>
                </div>
              </button>

              {/* Add Members Button */}
              <button
                onClick={() => setStartUser({ kind: 'UserSub', boolen: true })}
                className="w-full bg-blue/5 border border-dashed border-blue/20 rounded-2xl p-4 sm:p-6 hover:bg-blue/10 transition-all duration-200 hover:shadow-md active:scale-98 cursor-pointer"
                style={{ minHeight: '80px' }}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  {/* Label */}
                  <p
                    className="text-xs sm:text-sm text-gray-500 mb-1"
                    style={{
                      fontFamily: fonts.IBMPlexSansArabicMedium
                    }}
                  >
                    {t('createBranch.addMembersOptional')}
                  </p>

                  {/* Content */}
                  <div className="flex items-center justify-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M5.48131 12.9014C4.30234 13.6034 1.21114 15.0369 3.09389 16.8306C4.01359 17.7068 5.03791 18.3334 6.32573 18.3334H13.6743C14.9621 18.3334 15.9864 17.7068 16.9061 16.8306C18.7888 15.0369 15.6977 13.6034 14.5187 12.9014C11.754 11.2552 8.24599 11.2552 5.48131 12.9014Z"
                        stroke="#2117FB"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.75 5.41675C13.75 7.48781 12.0711 9.16675 10 9.16675C7.92893 9.16675 6.25 7.48781 6.25 5.41675C6.25 3.34568 7.92893 1.66675 10 1.66675C12.0711 1.66675 13.75 3.34568 13.75 5.41675Z"
                        stroke="#2117FB"
                        strokeWidth="1.5"
                      />
                    </svg>

                    <span
                      className="text-sm sm:text-base font-semibold"
                      style={{
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        color: colors.BLACK
                      }}
                    >
                      {Object.keys(checkGloble).length > 0
                        ? t('createBranch.membersSelected')
                        : t('createBranch.addMembers')}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 w-full">
            <ButtonLong
              text={t('createBranch.create')}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </ContentSection>
  </ResponsiveLayout>
  );
}
