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

interface BranchManagerModalProps {
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
 * Branch Manager Modal Component
 * Replicates mobile app's UserCompanyAdmin with AdminSub kind functionality
 *
 * Features:
 * - Load all company users
 * - Select new branch manager
 * - Update branch manager via API
 * - Matches mobile app's UI and behavior
 */
export default function BranchManagerModal({
  isOpen,
  onClose,
  branchId,
  branchName,
  onSuccess
}: BranchManagerModalProps) {
  const { user, size, language } = useAppSelector(state => state.user);
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUsers([]);
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
      // في التطبيق: kind='AdminSub' يتم تمريره كـ type
      const response = await axiosInstance.get(
        `/user/BringUserCompanyinv2?IDCompany=${user?.data?.IDCompany}&idBrinsh=${branchId}&type=AdminSub&number=${number}&kind_request=all`,
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
        } else {
          setUsers(prev => {
            const existingIds = new Set(prev.map(u => u.id));
            const uniqueNewUsers = newUsers.filter((u: User) => !existingIds.has(u.id));
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

  const handleSubmit = async () => {
    if (!selectedUserId) {
      Tostget(t('branchSettings.pleaseSelectNewManager'));
      return;
    }

    try {
      setSubmitting(true);

      // مطابق للتطبيق المحمول - تحديث مدير الفرع
      // Mobile: kind='AdminSub' -> kind='boss', type='مدير الفرع'
      const updateData = {
        idBrinsh: parseInt(branchId),
        type: 'مدير الفرع',
        checkGloblenew: selectedUserId, // مطابق للتطبيق - رقم واحد وليس array
        checkGlobleold: null,
        kind: 'boss'
      };

      const response = await axiosInstance.put('/user/updat/userBrinshv2', updateData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      if (response.status === 200) {
        Tostget(t('branchSettings.managerUpdatedSuccess'), 'success');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating branch manager:', error);
      Tostget(error.response?.data?.message || t('branchSettings.managerUpdatedError'), 'error');
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
              style={{ backgroundColor: 'var(--theme-warning-alpha, rgba(245, 158, 11, 0.1))' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2"/>
                <path d="M16 11L18 13L22 9" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

              {t('branchSettings.changeBranchManager')}
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
            {t('branchSettings.selectNewManagerFor')} "{branchName}"
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
            {t('branchSettings.selected')} {selectedUserId ? 1 : 0} {t('branchSettings.of')} {users.length} {t('branchSettings.user')}
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
                {users.map((user: any) => {
                  const isSelected = selectedUserId === user.id;
                  const isCurrentManager = user.Adminbransh === 'true';

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
                      onClick={() => setSelectedUserId(user.id)}
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
                            {isCurrentManager && (
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
                                ✅ {t('branchSettings.currentManager')}
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
            disabled={submitting || !selectedUserId}
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
