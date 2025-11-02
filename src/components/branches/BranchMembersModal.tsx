'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSelector } from '@/store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import ButtonLong from '@/components/design/ButtonLong';
import { Tostget } from '@/components/ui/Toast';
import axiosInstance from '@/lib/api/axios';
import { useTranslation } from '@/hooks/useTranslation';

interface BranchMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  branchName: string;
  onSuccess?: () => void;
}

interface User {
  id: number;
  userName: string;
  FirstName: string;
  LastName: string;
  jobdiscrption: string;
  Email: string;
  PhoneNumber: string;
  job: string;
}

/**
 * Branch Members Modal Component
 * Replicates mobile app's UserCompanyAdmin with UserSub kind functionality
 * 
 * Features:
 * - Load all company users
 * - Select/deselect branch members
 * - Add/remove members from branch
 * - Matches mobile app's UI and behavior
 */
export default function BranchMembersModal({
  isOpen,
  onClose,
  branchId,
  branchName,
  onSuccess
}: BranchMembersModalProps) {
  const { user, size, language } = useAppSelector(state => state.user);
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [currentMemberIds, setCurrentMemberIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUsers([]);
      setCurrentMemberIds([]);
      setSelectedUserIds([]);
      setHasMore(true);
      loadUsers(0);
    }
  }, [isOpen]);

  const loadUsers = async (number: number = 0) => {
    try {
      if (number === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // مطابق للتطبيق المحمول - جلب مستخدمي الشركة مع Pagination
      // في التطبيق: kind='user' يتم تمريره كـ type
      const response = await axiosInstance.get(
        `/user/BringUserCompanyinv2?IDCompany=${user?.data?.IDCompany}&idBrinsh=${branchId}&type=user&number=${number}&kind_request=all`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.data?.data) {
        const newUsers = response.data.data;

        if (newUsers.length === 0 || newUsers.length < 10) {
          setHasMore(false);
        }

        if (number === 0) {
          setUsers(newUsers);

          const currentMembers = newUsers
            .filter((user: any) => user.is_in_branch === 'true')
            .map((user: any) => user.id);

          setCurrentMemberIds(currentMembers);
          setSelectedUserIds(currentMembers);
        } else {
          // تجنب التكرار - تحقق من أن المستخدم غير موجود بالفعل
          setUsers(prev => {
            const existingIds = new Set(prev.map(u => u.id));
            const uniqueNewUsers = newUsers.filter((u: User) => !existingIds.has(u.id));

            // تحديث قائمة الأعضاء الحاليين
            const newCurrentMembers = uniqueNewUsers
              .filter((user: any) => user.is_in_branch === 'true')
              .map((user: any) => user.id);

            if (newCurrentMembers.length > 0) {
              setCurrentMemberIds(prevMembers => [...prevMembers, ...newCurrentMembers]);
              setSelectedUserIds(prevSelected => [...prevSelected, ...newCurrentMembers]);
            }

            return [...prev, ...uniqueNewUsers];
          });
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      Tostget(t('branchSettings.failedToLoadUsers'), 'error');
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && users.length > 0) {
      const lastUserId = users[users.length - 1].id;
      loadUsers(lastUserId);
    }
  }, [loadingMore, hasMore, users]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage > 0.8) {
      handleLoadMore();
    }
  }, [handleLoadMore]);

  const handleUserToggle = (userId: number) => {
    setSelectedUserIds(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // تحديد المستخدمين الجدد والمستخدمين المحذوفين
      const newMembers = selectedUserIds.filter(id => !currentMemberIds.includes(id));
      const removedMembers = currentMemberIds.filter(id => !selectedUserIds.includes(id));

      // مطابق للتطبيق المحمول - تحديث أعضاء الفرع
      // Mobile: kind='user', type='عضو'
      // checkGloblenew: object with {id: {id, Validity: []}}
      // checkGlobleold: object with {id: id}
      const checkGloblenew = newMembers.reduce((acc, id) => {
        acc[id] = { id, Validity: [] };
        return acc;
      }, {} as Record<number, any>);

      const checkGlobleold = removedMembers.reduce((acc, id) => {
        acc[id] = id;
        return acc;
      }, {} as Record<number, number>);

      const updateData = {
        idBrinsh: parseInt(branchId),
        type: 'عضو',
        checkGloblenew,
        checkGlobleold,
        kind: 'user'
      };

      const response = await axiosInstance.put('/user/updat/userBrinshv2', updateData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      if (response.status === 200) {
        const addedCount = newMembers.length;
        const removedCount = removedMembers.length;

        let message = t('branchSettings.membersUpdatedSuccess');
        if (addedCount > 0 && removedCount > 0) {
          message = `${t('branchSettings.added')} ${addedCount} ${t('branchSettings.andRemoved')} ${removedCount} ${t('branchSettings.fromBranchMembers')}`;
        } else if (addedCount > 0) {
          message = `${t('branchSettings.added')} ${addedCount} ${t('branchSettings.newMemberToBranch')}`;
        } else if (removedCount > 0) {
          message = `${t('branchSettings.removed')} ${removedCount} ${t('branchSettings.memberFromBranch')}`;
        }

        Tostget(message, 'success');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating branch members:', error);
      Tostget(error.response?.data?.message || t('branchSettings.membersUpdatedError'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const hasChanges = JSON.stringify(selectedUserIds.sort()) !== JSON.stringify(currentMemberIds.sort());

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-lg max-h-[95vh] overflow-hidden shadow-2xl"
        style={{
          backgroundColor: 'var(--theme-card-background)',
          border: '1px solid var(--theme-border)',
          borderRadius: `${scale(20)}px`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          direction: language === 'ar' ? 'rtl' : 'ltr'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="text-center"
          style={{
            borderBottom: '1px solid var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
            paddingLeft: scale(24),
            paddingRight: scale(24),
            paddingTop: scale(20),
            paddingBottom: scale(20),
            marginBottom: scale(16)
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--theme-success-alpha, rgba(16, 185, 129, 0.1))' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="var(--theme-success, #10b981)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8.5" cy="7" r="4" stroke="var(--theme-success, #10b981)" strokeWidth="2"/>
                <line x1="20" y1="8" x2="20" y2="14" stroke="var(--theme-success, #10b981)" strokeWidth="2"/>
                <line x1="23" y1="11" x2="17" y2="11" stroke="var(--theme-success, #10b981)" strokeWidth="2"/>
              </svg>
            </div>
            <h3
              className="font-bold"
              style={{
                fontSize: `${verticalScale(18 + (size || 0))}px`,
                fontFamily: fonts.IBMPlexSansArabicBold,
                color: 'var(--theme-text-primary)',
                lineHeight: 1.4
              }}
            >
              {t('branchSettings.manageBranchMembers')}
            </h3>
          </div>

          <p
            style={{
              fontSize: `${verticalScale(14 + (size || 0))}px`,
              lineHeight: 1.5,
              color: 'var(--theme-text-secondary)',
              marginBottom: scale(8)
            }}
          >
            {t('branchSettings.manageBranchMembers')} "{branchName}"
          </p>

          <div
            className="rounded-xl"
            style={{
              backgroundColor: 'var(--theme-info-alpha, rgba(59, 130, 246, 0.1))',
              color: 'var(--theme-info, #3b82f6)',
              fontSize: verticalScale(13),
              padding: `${scale(8)}px ${scale(12)}px`,
              fontFamily: fonts.IBMPlexSansArabicMedium
            }}
          >
            {t('branchSettings.selected')} {selectedUserIds.length} {t('branchSettings.of')} {users.length} {t('branchSettings.user')}
          </div>
        </div>

        {/* Content */}
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto max-h-[calc(95vh-300px)]"
          style={{
            paddingLeft: scale(24),
            paddingRight: scale(24),
            paddingBottom: scale(16),
            marginBottom: scale(16)
          }}
          onScroll={handleScroll}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className={language === 'ar' ? 'mr-2' : 'ml-2'} style={{ color: '#6b7280' }}>{t('branchSettings.loadingUsers')}</span>
            </div>
          ) : users.length > 0 ? (
            <>
              <div className="space-y-3">
                {users.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                const isCurrentMember = currentMemberIds.includes(user.id);
                
                return (
                  <div
                    key={user.id}
                    className="rounded-2xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))'
                        : 'var(--theme-surface-secondary)',
                      border: isSelected
                        ? '2px solid var(--theme-primary)'
                        : '1px solid var(--theme-border)',
                      padding: `${verticalScale(16)}px ${scale(20)}px`,
                      boxShadow: isSelected
                        ? '0 4px 12px rgba(99, 102, 241, 0.2)'
                        : '0 2px 4px rgba(0, 0, 0, 0.05)',
                      marginBottom: scale(12)
                    }}
                    onClick={() => handleUserToggle(user.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className="font-semibold"
                            style={{
                              fontSize: `${verticalScale(14 + (size || 0))}px`,
                              fontFamily: fonts.IBMPlexSansArabicSemiBold,
                              color: 'var(--theme-text-primary)'
                            }}
                          >
                            {user.FirstName} {user.LastName}
                          </p>
                          {isCurrentMember && (
                            <span
                              className="text-xs rounded-full"
                              style={{
                                backgroundColor: 'var(--theme-success-alpha, rgba(16, 185, 129, 0.1))',
                                color: 'var(--theme-success, #10b981)',
                                padding: `${scale(4)}px ${scale(8)}px`,
                                fontSize: verticalScale(10),
                                fontFamily: fonts.IBMPlexSansArabicMedium
                              }}
                            >
                              ✅ {t('branchSettings.currentMember')}
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: `${verticalScale(12 + (size || 0))}px`,
                            color: 'var(--theme-text-secondary)',
                            fontFamily: fonts.IBMPlexSansArabicRegular
                          }}
                        >
                          {user.userName} • {user.jobdiscrption}
                        </p>
                      </div>

                      <div
                        className="rounded-full flex items-center justify-center"
                        style={{
                          width: scale(24),
                          height: scale(24),
                          backgroundColor: isSelected
                            ? 'var(--theme-primary)'
                            : 'var(--theme-surface)',
                          border: `2px solid ${isSelected ? 'var(--theme-primary)' : 'var(--theme-border)'}`,
                          color: isSelected ? '#ffffff' : 'var(--theme-text-tertiary)'
                        }}
                      >
                        {isSelected && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20,6 9,17 4,12"></polyline>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className={language === 'ar' ? 'mr-2' : 'ml-2'} style={{ color: '#6b7280', fontSize: '14px' }}>
                    {t('branchSettings.loadingMore')}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('branchSettings.noUsersAvailable')}</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div
          className="flex gap-4 justify-center items-center"
          style={{
            borderTop: '1px solid var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
            paddingLeft: scale(24),
            paddingRight: scale(24),
            paddingTop: scale(16),
            paddingBottom: scale(16),
            margin: `${scale(8)}px 0`
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={submitting || !hasChanges}
            className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
            style={{
              fontSize: verticalScale(14),
              color: '#ffffff',
              backgroundColor: 'var(--theme-primary)',
              fontFamily: fonts.IBMPlexSansArabicBold,
              border: '2px solid var(--theme-primary)',
              padding: `${verticalScale(12)}px ${scale(16)}px`,
              maxWidth: '45%',
              minHeight: verticalScale(48),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            {submitting ? (
              <div
                className="border-2 border-white border-t-transparent rounded-full animate-spin"
                style={{ width: scale(16), height: scale(16), marginLeft: scale(8) }}
              />
            ) : (
              `💾 ${t('branchSettings.save')}`
            )}
          </button>

          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
            style={{
              fontSize: verticalScale(14),
              color: 'var(--theme-text-primary)',
              backgroundColor: 'var(--theme-surface-secondary)',
              fontFamily: fonts.IBMPlexSansArabicBold,
              border: '2px solid var(--theme-border)',
              padding: `${verticalScale(12)}px ${scale(16)}px`,
              maxWidth: '45%',
              minHeight: verticalScale(48),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            ❌ {t('branchSettings.cancel')}
          </button>
        </div>

        {/* Decorative bottom element */}
        <div className="flex justify-center" style={{ paddingBottom: scale(8) }}>
          <div
            className="w-12 h-1 rounded-full"
            style={{ backgroundColor: 'var(--theme-border)' }}
          />
        </div>
      </div>
    </div>
  );
}
