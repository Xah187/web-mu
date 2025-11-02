import React from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import SettingsIcon from '@/components/icons/SettingsIcon';
import { useTranslation } from '@/hooks/useTranslation';

interface BranchCardProps {
  title: string;
  projectCount: number;
  onPress: () => void;
  onSettingsPress?: () => void; // مطابق للتطبيق المحمول - يفتح modal الإعدادات بـ 6 خيارات
  showSettings?: boolean; // يظهر فقط للـ Admin
}

export default function BranchCard({
  title,
  projectCount,
  onPress,
  onSettingsPress,
  showSettings = false
}: BranchCardProps) {
  const { size, user } = useAppSelector((state: any) => state.user);
  const { t, isRTL } = useTranslation();
  const isEmployee = user?.data?.jobdiscrption === 'موظف';

  return (
    <div
      onClick={onPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPress();
        }
      }}
      className="branch-card theme-card transition-all duration-200 cursor-pointer relative hover:shadow-lg active:scale-95"
      style={{
        borderRadius: 16,
        backgroundColor: 'var(--color-card-background)',
        padding: `${verticalScale(10)}px ${scale(10)}px`,
        boxShadow: 'var(--shadow-sm)',
        minHeight: size <= 5 ? verticalScale(80) : 'auto',
        border: '1px solid var(--color-card-border)',
        // Ripple effect simulation
        backgroundImage: 'radial-gradient(circle, transparent 1%, var(--color-card-background) 1%)',
        backgroundPosition: 'center',
        backgroundSize: '15000%',
        transition: 'all 0.3s ease',
      }}
      onMouseDown={(e) => {
        const target = e.currentTarget;
        target.style.backgroundSize = '100%';
        target.style.backgroundColor = 'var(--color-surface-secondary)';
      }}
      onMouseUp={(e) => {
        const target = e.currentTarget;
        setTimeout(() => {
          if (target) {
            target.style.backgroundSize = '15000%';
            target.style.backgroundColor = 'var(--color-card-background)';
          }
        }, 200);
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        if (target) {
          target.style.backgroundSize = '15000%';
          target.style.backgroundColor = 'var(--color-card-background)';
        }
      }}
    >
      <div 
        className="flex justify-around items-center"
        style={{
          flexDirection: 'row'
        }}
      >
        <div
          className={`
            flex flex-col items-center justify-center
            ${!isEmployee ? 'mt-[8%]' : ''}
          `}
          style={{
            paddingLeft: showSettings ? '50px' : '0px', // Add padding to avoid overlap with settings button
            paddingRight: '10px'
          }}
        >
          <h3
            className="font-semibold text-center mb-1 theme-text-primary"
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: verticalScale(isEmployee ? 16 + size : 20 + size),
              color: 'var(--color-text-primary)',
              fontWeight: '600',
              lineHeight: 1.2,
              wordBreak: 'break-word'
            }}
          >
            {title}
          </h3>
          
          {isEmployee && (
            <>
              <p
                className="text-center mb-2 theme-text-secondary"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  fontSize: verticalScale(10 + size),
                  color: 'var(--color-text-secondary)',
                  fontWeight: '500'
                }}
              >
                {t('branchCard.projectCount')}
              </p>

              <div className="text-center">
                <span
                  style={{
                    fontSize: verticalScale(48),
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    fontWeight: '700',
                    color: 'var(--color-primary)'
                  }}
                >
                  {projectCount}
                </span>
                <span
                  className="mr-1"
                  style={{
                    fontSize: verticalScale(10 + size),
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    fontWeight: '500',
                    color: 'var(--color-primary)'
                  }}
                >
                  {' '}{t('branchCard.projects')}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Settings Button - مطابق للتطبيق المحمول (SettingSvg) */}
        {showSettings && onSettingsPress && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSettingsPress();
            }}
            className="absolute bg-white hover:bg-blue-50 rounded-full transition-all duration-200 shadow-md hover:shadow-lg border border-gray-100"
            style={{
              top: '8px',
              [isRTL ? 'right' : 'left']: '8px',
              padding: '8px',
              zIndex: 10
            }}
            title={t('branchCard.branchSettings')}
          >
            {/* Three dots icon - مطابق للتطبيق المحمول */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="5" r="2" fill={colors.BLUE} />
              <circle cx="12" cy="12" r="2" fill={colors.BLUE} />
              <circle cx="12" cy="19" r="2" fill={colors.BLUE} />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
