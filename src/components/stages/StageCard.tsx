'use client';

import React from 'react';
import { Stage } from '@/hooks/useProjectDetails';
import { scale } from '@/utils/responsiveSize';
import useValidityUser from '@/hooks/useValidityUser';
import { useStageProgress } from '@/hooks/useStageProgress';

interface StageCardProps {
  stage: Stage;
  onPress: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

const StageCard: React.FC<StageCardProps> = ({
  stage,
  onPress,
  onDelete,
  loading = false,
}) => {
  const { hasPermission } = useValidityUser();

  // Use the custom hook to get accurate progress
  const { calculatedRate } = useStageProgress({
    stageId: stage.StageID,
    projectId: stage.ProjectID,
    initialRate: stage.rate || 0,
  });



  const getProgressColor = (rate: number) => {
    if (rate >= 80) return '#10B981'; // green
    if (rate >= 50) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col items-center cursor-pointer group">
      {/* Stage Name */}
      <div className="flex items-center justify-center mb-6">
        <h3
          className="font-ibm-arabic-bold text-gray-900 text-center line-clamp-2 group-hover:text-blue-600 transition-colors"
          style={{ fontSize: scale(15) }}
        >
          {stage.StageName}
        </h3>
        {/* Sub-stages indicator */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="text-gray-400 group-hover:text-blue-500 transition-colors mr-2"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>

      {/* Circular Progress */}
      <div
        className="relative cursor-pointer hover:scale-110 transition-transform duration-300"
        onClick={onPress}
      >
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke={getProgressColor(calculatedRate)}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 35}`}
              strokeDashoffset={`${2 * Math.PI * 35 * (1 - calculatedRate / 100)}`}
              className="transition-all duration-700"
            />
          </svg>
          {/* Percentage Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-ibm-arabic-bold"
              style={{
                fontSize: scale(18),
                color: getProgressColor(calculatedRate)
              }}
            >
              {String(calculatedRate).slice(0, 4)}%
            </span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-4 flex flex-col items-center">
        <span
          className={`px-4 py-2 rounded-full text-sm font-ibm-arabic-medium ${
            calculatedRate >= 100
              ? 'bg-green-100 text-green-700'
              : calculatedRate > 0
              ? 'bg-blue-100 text-blue-700'
              : 'bg-orange-100 text-orange-700'
          }`}
        >
          {calculatedRate >= 100 ? 'تم إنجاز' : calculatedRate > 0 ? 'قيد التنفيذ' : 'لم يبدأ'}
        </span>

        {/* Click hint */}
        <p className="text-xs text-gray-500 mt-2 group-hover:text-blue-500 transition-colors">
          اضغط لعرض المراحل الفرعية
        </p>
      </div>

      {/* Delete Button - Only if user has permission */}
      {onDelete && hasPermission('ترتيب المراحل') && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="mt-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

export default StageCard;
