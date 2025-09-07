import React from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import SettingsIcon from '@/components/icons/SettingsIcon';

interface BranchCardProps {
  title: string;
  projectCount: number;
  onPress: () => void;
  onSettingsPress?: () => void;
  onEditPress?: () => void;
  showSettings?: boolean;
  showEdit?: boolean;
}

export default function BranchCard({ 
  title, 
  projectCount, 
  onPress, 
  onSettingsPress,
  onEditPress,
  showSettings = false,
  showEdit = false 
}: BranchCardProps) {
  const { size, user } = useAppSelector((state: any) => state.user);
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
      className="branch-card bg-white transition-all duration-200 cursor-pointer relative hover:shadow-lg active:scale-95"
      style={{
        borderRadius: 16,
        backgroundColor: colors.WHITE,
        padding: `${verticalScale(10)}px ${scale(10)}px`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        minHeight: size <= 5 ? verticalScale(80) : 'auto',
        // Ripple effect simulation
        backgroundImage: 'radial-gradient(circle, transparent 1%, ' + colors.WHITE + ' 1%)',
        backgroundPosition: 'center',
        backgroundSize: '15000%',
        transition: 'background-size 0.2s',
      }}
      onMouseDown={(e) => {
        const target = e.currentTarget;
        target.style.backgroundSize = '100%';
        target.style.backgroundColor = colors.PINK;
      }}
      onMouseUp={(e) => {
        const target = e.currentTarget;
        setTimeout(() => {
          if (target) {
            target.style.backgroundSize = '15000%';
            target.style.backgroundColor = colors.WHITE;
          }
        }, 200);
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        if (target) {
          target.style.backgroundSize = '15000%';
          target.style.backgroundColor = colors.WHITE;
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
            paddingLeft: showEdit ? '50px' : '0px', // Add padding to avoid overlap with edit button
            paddingRight: '10px'
          }}
        >
          <h3
            className="font-semibold text-center mb-1"
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: verticalScale(isEmployee ? 16 + size : 20 + size),
              color: colors.BLACK,
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
                className="text-center mb-2"
                style={{
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  fontSize: verticalScale(10 + size),
                  color: '#4f5665',
                  fontWeight: '500'
                }}
              >
                عدد المشاريع
              </p>
              
              <div className="text-center">
                <span 
                  style={{
                    fontSize: verticalScale(48),
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    fontWeight: '700',
                    color: colors.BLUE
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
                    color: colors.BLUE
                  }}
                >
                  {' '}مشاريع
                </span>
              </div>
            </>
          )}
        </div>

        {/* Edit Button - Single button in top-left corner */}
        {showEdit && onEditPress && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditPress();
            }}
            className="absolute bg-white hover:bg-blue-50 rounded-full transition-all duration-200 shadow-md hover:shadow-lg border border-gray-100"
            style={{
              top: '8px',
              left: '8px',
              padding: '8px',
              zIndex: 10
            }}
            title="تعديل الفرع"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.BLUE}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
