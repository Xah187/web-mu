'use client';

import React, { useState } from 'react';
import { Project } from '@/hooks/useBranchProjects';
import useValidityUser from '@/hooks/useValidityUser';
import moment from 'moment';

// Bell Icon matching the exact original design
const BellIcon = ({ number = 0 }: { number?: number }) => (
  <div className="relative">
    <svg width="22" height="19" viewBox="0 0 22 19" fill="none">
      <path
        d="M1.52992 13.394C1.31727 14.7471 2.268 15.6862 3.43205 16.1542C7.89481 17.9486 14.1052 17.9486 18.5679 16.1542C19.732 15.6862 20.6827 14.7471 20.4701 13.394C20.3394 12.5625 19.6932 11.8701 19.2144 11.194C18.5873 10.2975 18.525 9.3197 18.5249 8.27941C18.5249 4.2591 15.1559 1 11 1C6.84413 1 3.47513 4.2591 3.47513 8.27941C3.47503 9.3197 3.41272 10.2975 2.78561 11.194C2.30684 11.8701 1.66061 12.5625 1.52992 13.394Z"
        stroke="#9CA3AF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <div className="absolute top-0 left-1.5">
      <svg width="10" height="5" viewBox="0 0 10 5" fill="none">
        <path
          d="M1 1C1.79613 1.6219 2.8475 2 4 2C5.1525 2 6.2039 1.6219 7 1"
          stroke="#9CA3AF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    {number > 0 && (
      <div className="absolute -top-1 -right-1">
        <svg width="17" height="17" viewBox="0 0 11 11" fill="none">
          <circle cx="5.5" cy="5.5" r="5.5" fill="#2117FB" />
        </svg>
        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 text-[8px] font-bold text-white leading-none">
          {number > 99 ? String(number).slice(0, 1) + '+' : number}
        </span>
      </div>
    )}
  </div>
);

// User List Icons matching original exactly
const UserListIcon = ({ countuser = 0 }: { countuser?: number }) => {
  const { isEmployee } = useValidityUser();

  return (
    <div className="flex items-center -space-x-1">
      {/* User 1 */}
      <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400 z-40" />

      {/* User 2 */}
      <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-indigo-500 z-30" />

      {/* User 3 */}
      <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-green-400 to-emerald-500 z-20" />

      {/* User 4 */}
      <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-yellow-400 to-orange-500 z-10" />

      {/* User 5 - Show for all users like mobile app */}
      <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-red-400 to-pink-500 z-0" />

      {/* Plus button - Show for all users like mobile app */}
      <div className="relative">
        <div className="relative">
          <svg width="25" height="25" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="17" r="15.5" fill="#2117FB" stroke="white" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 17 12" fill="none">
              <path
                d="M8 2.6665V13.3332"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M2.6665 8H13.3332"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete SVG Icon
const DeleteIcon = () => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19ZM10 11V17M14 11V17"
      stroke="#EF4444"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ProjectCardProps {
  project: Project;
  notificationCount?: number;
  onPress: () => void;
  onPressNotification?: () => void;
  onPressLocation?: () => void;
  onPressGuard?: () => void;
  onPressClose?: () => void;
  onPressDelete?: () => void;
  loading?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  notificationCount = 0,
  onPress,
  onPressNotification,
  onPressLocation,
  onPressGuard,
  onPressClose,
  onPressDelete,
  loading = false,
}) => {
  const { isEmployee } = useValidityUser();
  const [showCost, setShowCost] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      useGrouping: true,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString === 'null') return 'لم يحدد بعد';

    try {
      const date = new Date(dateString);
      // تنسيق بالميلادي بترتيب سنة-شهر-يوم
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 mb-2.5 mx-0"
      onClick={onPress}
      style={{
        borderRadius: 16,
      }}
    >
      {/* Header Section - Project name and Bell */}
      <div className="flex justify-between items-start px-7 pt-3 pb-2 relative">
        {/* Bell icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPressNotification?.();
          }}
          className="p-2 mt-1 ml-2"
        >
          <BellIcon number={notificationCount} />
        </button>

        {/* Delete button - positioned at same level as bell */}
        {onPressDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPressDelete();
            }}
            className="p-2 mt-1 mr-2 hover:bg-red-50 rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500" />
            ) : (
              <DeleteIcon />
            )}
          </button>
        )}

        {/* Project Title and Note - centered between bell and delete */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center min-h-[44px] flex flex-col justify-center" style={{ width: '60%' }}>
          <h3 className="font-semibold text-gray-900 mb-1 text-sm leading-tight text-center truncate">
            {project.Nameproject}
          </h3>
          {project.Note ? (
            <p className="text-gray-600 text-xs text-center truncate">
              {project.Note}
            </p>
          ) : (
            <p className="text-gray-600 text-xs text-center opacity-0 select-none">-</p>
          )}
        </div>
      </div>

      {/* Content bounded by notification/delete rails */}
      <div className="w-full" style={{ paddingLeft: '44px', paddingRight: '44px' }}>


      {/* Progress Section */}
      <div className="py-3 relative">
        {/* Progress Bar Container - RTL */}
        <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden" dir="rtl">
          {/* Progress Bar - grows from right to left */}
          <div
            className="bg-blue-600 h-6 rounded-full transition-all duration-700 ease-out relative flex items-center justify-center"
            style={{
              width: `${Math.max(Math.min(project.rate || 0, 100), 0)}%`,
              marginRight: '0',
              minWidth: (project.rate || 0) > 0 ? '50px' : '0px'
            }}
          >
            {/* Progress percentage - positioned at the beginning of the progress bar (right side) */}
            {(project.rate || 0) > 0 && (
              <div
                className="absolute inset-0 flex items-center justify-end pr-2 text-white text-xs font-bold transition-all duration-700 ease-out"
                style={{
                  minWidth: '40px'
                }}
              >
                <span>{Math.round(project.rate || 0)}%</span>
              </div>
            )}
          </div>

          {/* Fallback percentage for very small progress or zero */}
          {(project.rate || 0) === 0 && (
            <div className="absolute inset-0 flex items-center justify-end pr-3 text-gray-500 text-xs font-bold">
              <span>0%</span>
            </div>
          )}

          {/* Small progress fallback - show percentage outside if progress is too small */}
          {(project.rate || 0) > 0 && (project.rate || 0) < 15 && (
            <div className="absolute inset-0 flex items-center justify-end pr-3 text-gray-600 text-xs font-bold">
              <span>{Math.round(project.rate || 0)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Details Section - Balance and Start Date */}
      <div className="relative flex justify-between items-center py-3">
        {/* Balance Section */}
        <div className="text-right">
          {showCost && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCost(false);
              }}
              className="absolute bg-white px-2.5 py-1 rounded border shadow-sm text-sm z-10"
            >
              {formatCurrency(project.cost || 0)}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCost(!showCost);
            }}
            className="text-right pr-1"
          >
            <p className="text-gray-900 font-semibold text-sm mb-0.5 pr-1">
              الرصيد:
            </p>
            <p className="text-gray-900 font-semibold text-sm pr-1">
              {formatCurrency(project.cost || 0)} ر.س
            </p>
          </button>
        </div>

        {/* Project Start Date */}
        <div className="text-center">
          <p className="text-gray-900 font-semibold text-sm mb-0.5">
            بداية المشروع
          </p>
          <p className="text-gray-900 font-semibold text-sm">
            {formatDate(project.ProjectStartdate)}
          </p>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="flex justify-between items-center py-2 space-x-2">
        {/* Location Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPressLocation?.();
          }}
          className="flex-1 flex flex-col items-center justify-center theme-card py-1 px-1 mx-1 rounded-lg transition-colors"
          style={{
            minHeight: 50,
            width: '30%',
            backgroundColor: 'var(--color-card-background)',
            border: '1px solid var(--color-card-border)'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-1">
            <path
              d="M15.5 11C15.5 12.933 13.933 14.5 12 14.5C10.067 14.5 8.5 12.933 8.5 11C8.5 9.067 10.067 7.5 12 7.5C13.933 7.5 15.5 9.067 15.5 11Z"
              stroke="#2117FB"
              strokeWidth="1.5"
            />
            <path
              d="M12 2C16.8706 2 21 6.03298 21 10.9258C21 15.8965 16.8033 19.3847 12.927 21.7567C12.6445 21.9162 12.325 22 12 22C11.675 22 11.3555 21.9162 11.073 21.7567C7.2039 19.3616 3 15.9137 3 10.9258C3 6.03298 7.12944 2 12 2Z"
              stroke="#2117FB"
              strokeWidth="1.5"
            />
          </svg>
          <span className="text-gray-700 font-semibold text-sm">
            الموقع
          </span>
        </button>

        {/* Guard/Phone Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPressGuard?.();
          }}
          className="flex-1 flex flex-col items-center justify-center bg-white border border-gray-200 py-1 px-1 mx-1 rounded-lg hover:bg-gray-50 transition-colors"
          style={{ minHeight: 50, width: '30%' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-1">
            <path
              d="M5.4221 11.9539C4.66368 10.6314 4.29748 9.55158 4.07667 8.45696C3.7501 6.83806 4.49745 5.25665 5.7355 4.24758C6.25876 3.82111 6.85858 3.96682 7.168 4.52192L7.86654 5.77513C8.42023 6.76845 8.69707 7.26511 8.64216 7.79167C8.58726 8.31823 8.2139 8.74708 7.46718 9.6048L5.4221 11.9539ZM5.4221 11.9539C6.95721 14.6306 9.36627 17.041 12.0461 18.5779M12.0461 18.5779C13.3686 19.3363 14.4484 19.7025 15.543 19.9233C17.1619 20.2499 18.7434 19.5025 19.7524 18.2645C20.1789 17.7413 20.0332 17.1414 19.4781 16.832L18.2249 16.1334C17.2315 15.5797 16.7349 15.3029 16.2083 15.3578C15.6818 15.4127 15.2529 15.7861 14.3952 16.5328L12.0461 18.5779Z"
              stroke="#2117FB"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-gray-700 font-semibold text-sm">
            الحارس
          </span>
        </button>

        {/* Close Project Button */}
        {project.rate >= 0 && onPressClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPressClose();
            }}
            className="flex-1 flex items-center justify-center bg-gray-100 py-1 px-1 mx-1 rounded-lg hover:bg-gray-200 transition-colors"
            style={{ minHeight: 50, width: '30%' }}
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            ) : (
              <span className="text-gray-900 font-semibold text-sm text-center leading-tight">
                اغلاق المشروع
              </span>
            )}
          </button>
        )}
      </div>

      {/* Bottom Section - Team Members only */}
      <div className="flex items-center justify-center pb-4 pt-1">
        {/* Team Members Avatars */}
        <div className="flex items-center">
          <UserListIcon countuser={project.countuser} />
        </div>


      </div>

      {/* Close bounded content wrapper */}
      </div>

    </div>
  );
};

export default ProjectCard;