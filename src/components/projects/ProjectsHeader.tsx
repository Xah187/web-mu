'use client';

import React from 'react';

interface ProjectsHeaderProps {
  branchName: string;
  userName: string;
  userRole: string;
  onBack: () => void;
  onSettings: () => void;
  onNotifications: () => void;
  onCreateProject: () => void;
  onSearch?: () => void;
  onRequests?: () => void;
}

const ProjectsHeader: React.FC<ProjectsHeaderProps> = ({
  branchName,
  userName,
  userRole,
  onBack,
  onSettings,
  onNotifications,
  onCreateProject,
  onSearch,
  onRequests
}) => {
  return (
    <div className="bg-white border-b border-gray-200">
      {/* Top Header with back, settings, and bell */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="rotate-180">
            <path
              d="M9 18L15 12L9 6"
              stroke="#374151"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button
            onClick={onSettings}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="#374151" strokeWidth="2"/>
              <path d="M12 1V3" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 21V23" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
              <path d="M4.22 4.22L5.64 5.64" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18.36 18.36L19.78 19.78" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
              <path d="M1 12H3" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
              <path d="M21 12H23" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
              <path d="M4.22 19.78L5.64 18.36" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18.36 5.64L19.78 4.22" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            onClick={onNotifications}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
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
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1">
              <svg width="17" height="17" viewBox="0 0 11 11" fill="none">
                <circle cx="5.5" cy="5.5" r="5.5" fill="#2117FB" />
              </svg>
              <span className="absolute top-0 left-1/2 transform -translate-x-1/2 text-[8px] font-bold text-white">
                3
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* User Info Section - matching original exactly */}
      <div className="bg-gray-50 px-4 py-4">
        <div className="flex items-center justify-between">
          {/* User Profile Section */}
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse flex-1">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {userName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-gray-900 text-sm">
                {userName}
              </h3>
              <p className="text-gray-600 text-xs">
                {userRole}
              </p>
            </div>
          </div>

          {/* Branch Name */}
          <div className="text-center flex-1">
            <h2 className="text-lg font-bold text-gray-900">
              {branchName}
            </h2>
          </div>

          {/* Right Side Icons */}
          <div className="flex flex-col items-center space-y-4 flex-1 justify-center">
            {/* Requests Icon */}
            <button 
              className="p-2"
              onClick={onRequests}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 7H21L19 19H5L3 7Z"
                  stroke="#2117FB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 7L2 3H1"
                  stroke="#2117FB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Blue Truck Icon */}
            <div className="text-blue-600">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M1 3H15L13 21H3L1 3Z"
                  stroke="#2117FB"
                  strokeWidth="2"
                  fill="#2117FB"
                  fillOpacity="0.1"
                />
                <path
                  d="M16 8H20L23 13V17H20"
                  stroke="#2117FB"
                  strokeWidth="2"
                />
                <circle
                  cx="7"
                  cy="17"
                  r="2"
                  stroke="#2117FB"
                  strokeWidth="2"
                />
                <circle
                  cx="17"
                  cy="17"
                  r="2"
                  stroke="#2117FB"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <button
          onClick={onCreateProject}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
        >
          + إنشاء مشروع
        </button>
        
        <button
          onClick={onSearch}
          className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#6B7280" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProjectsHeader;
