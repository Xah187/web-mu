'use client';

import React from 'react';
import { scale } from '@/utils/responsiveSize';
import { useTranslation } from '@/hooks/useTranslation';

interface StageStatusBadgeProps {
  stage: {
    Done: string;
    rate: number;
    CloseDate?: string | null;
    NoteOpen?: string | null;
    NoteClosed?: string | null;
    Difference?: number;
  };
}

const StageStatusBadge: React.FC<StageStatusBadgeProps> = ({ stage }) => {
  const { t } = useTranslation();
  const isCompleted = stage.Done === 'true';
  const hasNotes = stage.NoteOpen !== null || stage.NoteClosed !== null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('stageInfoModal.notSpecified');

    try {
      const date = new Date(dateString);
      // تنسيق بالميلادي بترتيب سنة-شهر-يوم
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return t('stageInfoModal.invalidDate');
    }
  };

  const getStatusInfo = () => {
    if (isCompleted) {
      return {
        text: t('stageInfoModal.stageClosed'),
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        )
      };
    } else if (stage.rate === 100) {
      return {
        text: t('stageDetails.readyToClose'),
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };
    } else {
      return {
        text: t('stageInfoModal.stageOpen'),
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 8.9-3"/>
          </svg>
        )
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center space-x-2 space-x-reverse px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
          {statusInfo.icon}
          <span 
            className={`font-ibm-arabic-semibold ${statusInfo.textColor}`}
            style={{ fontSize: scale(12) }}
          >
            {statusInfo.text}
          </span>
        </div>

        {/* Progress Percentage */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <span 
            className="font-ibm-arabic-bold text-blue-600"
            style={{ fontSize: scale(14) }}
          >
            {Math.round(stage.rate)}%
          </span>
          <span
            className="text-gray-500 font-ibm-arabic-medium"
            style={{ fontSize: scale(12) }}
          >
            {t('stageDetails.taskCompleted')}
          </span>
        </div>
      </div>

      {/* Stage Details */}
      <div className="space-y-2">
        {/* Close Date */}
        {isCompleted && stage.CloseDate && (
          <div className="flex items-center justify-between">
            <span
              className="text-gray-600 font-ibm-arabic-medium"
              style={{ fontSize: scale(12) }}
            >
              {t('stageInfoModal.closeDate')}
            </span>
            <span
              className="text-gray-900 font-ibm-arabic-semibold"
              style={{ fontSize: scale(12) }}
            >
              {formatDate(stage.CloseDate)}
            </span>
          </div>
        )}

        {/* Difference */}
        {isCompleted && stage.Difference !== undefined && (
          <div className="flex items-center justify-between">
            <span
              className="text-gray-600 font-ibm-arabic-medium"
              style={{ fontSize: scale(12) }}
            >
              {t('stageInfoModal.difference')}
            </span>
            <span
              className={`font-ibm-arabic-semibold ${
                stage.Difference > 0 ? 'text-green-600' : stage.Difference < 0 ? 'text-red-600' : 'text-gray-900'
              }`}
              style={{ fontSize: scale(12) }}
            >
              {stage.Difference} {t('stageInfoModal.days')}
            </span>
          </div>
        )}

        {/* Notes Indicator */}
        {hasNotes && (
          <div className="flex items-center space-x-2 space-x-reverse">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span
              className="text-gray-600 font-ibm-arabic-medium"
              style={{ fontSize: scale(11) }}
            >
              {t('stageDetails.hasNotes')}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                stage.rate === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${stage.rate}%` }}
            />
          </div>
        </div>

        {/* Completion Requirements */}
        {!isCompleted && stage.rate < 100 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span 
                className="text-yellow-700 font-ibm-arabic-medium"
                style={{ fontSize: scale(11) }}
              >
                يجب إكمال جميع المهام الفرعية (100%) قبل إغلاق المرحلة
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StageStatusBadge;
