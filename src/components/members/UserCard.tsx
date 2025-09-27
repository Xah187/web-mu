'use client';

import { useState } from 'react';
import Image from 'next/image';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import SettingsIcon from '@/components/icons/SettingsIcon';

interface UserCardProps {
  user: {
    id: string;
    userName: string;
    IDNumber: string;
    PhoneNumber: string;
    job: string;
    jobdiscrption: string;
    Email?: string;
    image?: string;
    Validity?: string[];
  };
  onEdit: () => void;
  onDelete: () => void;
  onEditPermissions?: () => void;
  showActions?: boolean;
}

export default function UserCard({ user, onEdit, onDelete, onEditPermissions, showActions = true }: UserCardProps) {
  const { size } = useAppSelector((state: any) => state.user);
  const [showMenu, setShowMenu] = useState(false);

  const handleSettingsClick = () => {
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit();
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDelete();
  };

  const handleEditPermissions = () => {
    setShowMenu(false);
    if (onEditPermissions) {
      onEditPermissions();
    }
  };

  // Apply mobile app ChackMangment logic exactly
  const getDisplayJobTitle = () => {
    // In mobile app: if checkId !== 0, prefer jobHOM except for branch manager
    // For web, we'll prefer jobdiscrption over job (like mobile app)
    if (user.job === 'مدير الفرع') {
      return user.job;
    } else {
      return user.jobdiscrption || user.job || 'غير محدد';
    }
  };

  const getJobColor = (job: string) => {
    switch (job) {
      case 'Admin':
      case 'مدير عام':
        return colors.BLUE;
      case 'مالية':
        return colors.GREEN;
      case 'مدير الفرع':
        return colors.BLUE;
      default:
        return colors.GREAY;
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          {/* User Avatar */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.userName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-lg">
                {user.userName.charAt(0)}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-black truncate"
              style={{
                fontFamily: fonts.IBMPlexSansArabicSemiBold,
                fontSize: verticalScale(14 + size)
              }}
            >
              {user.userName}
            </h3>
            
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-sm"
                style={{
                  fontFamily: fonts.CAIROBOLD,
                  fontSize: verticalScale(11 + size),
                  color: getJobColor(getDisplayJobTitle())
                }}
              >
                {getDisplayJobTitle()}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span 
                className="text-xs text-gray-500"
                style={{
                  fontFamily: fonts.CAIROBOLD,
                  fontSize: verticalScale(10 + size)
                }}
              >
                {user.PhoneNumber}
              </span>
              
              {user.IDNumber && (
                <>
                  <span className="text-gray-400">•</span>
                  <span 
                    className="text-xs text-gray-500"
                    style={{
                      fontFamily: fonts.CAIROBOLD,
                      fontSize: verticalScale(10 + size)
                    }}
                  >
                    {user.IDNumber}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="relative">
            <button
              onClick={handleSettingsClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <SettingsIcon size={20} color={colors.GREAY} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute left-0 top-full mt-1 rounded-lg shadow-lg overflow-hidden z-50 min-w-[180px] theme-card"
                     style={{
                       backgroundColor: 'var(--color-card-background)',
                       border: '1px solid var(--color-card-border)',
                       boxShadow: 'var(--shadow-lg)'
                     }}>
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-3 text-right hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <svg 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke={colors.BLUE} 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span
                      style={{
                        fontFamily: fonts.CAIROBOLD,
                        fontSize: 14 + size,
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      تعديل البيانات
                    </span>
                  </button>

                  {onEditPermissions && (
                    <>
                      <div className="border-t border-gray-100" />
                      <button
                        onClick={handleEditPermissions}
                        className="w-full px-4 py-3 text-right hover:bg-blue-50 transition-colors flex items-center gap-3"
                      >
                        <svg 
                          width="18" 
                          height="18" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke={colors.BLUE} 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <circle cx="12" cy="16" r="1" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span 
                          style={{
                            fontFamily: fonts.CAIROBOLD,
                            fontSize: 14 + size,
                            color: colors.BLACK
                          }}
                        >
                          تعديل الصلاحيات
                        </span>
                      </button>
                    </>
                  )}
                  
                  <div className="border-t border-gray-100" />
                  
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-3 text-right hover:bg-red-50 transition-colors flex items-center gap-3"
                  >
                    <svg 
                      width="18" 
                      height="18" 
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
                    <span 
                      style={{
                        fontFamily: fonts.CAIROBOLD,
                        fontSize: 14 + size,
                        color: colors.RED
                      }}
                    >
                      حذف العضو
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
