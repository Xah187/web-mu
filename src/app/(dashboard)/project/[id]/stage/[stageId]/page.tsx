'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { colors } from '@/constants/colors';
import { scale, verticalScale } from '@/utils/responsiveSize';
import useValidityUser from '@/hooks/useValidityUser';
import useSubStages, { SubStage, ClosingOperation } from '@/hooks/useSubStages';
import { formatDateEnglish } from '@/hooks/useFinance';
import useProjectDetails from '@/hooks/useProjectDetails';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import StageCloseModal from '@/components/stages/StageCloseModal';
import StageStatusBadge from '@/components/stages/StageStatusBadge';
import StageInfoModal from '@/components/stages/StageInfoModal';
import SubStageOptionsModal from '@/components/stages/SubStageOptionsModal';
import SubStageEditModal from '@/components/stages/SubStageEditModal';
import SubStageNoteModal from '@/components/stages/SubStageNoteModal';
import SubStageNotesModal from '@/components/stages/SubStageNotesModal';
import StageEditModal from '@/components/stages/StageEditModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import useSubStageNotes from '@/hooks/useSubStageNotes';
import StageAchievementModal from '@/components/stages/StageAchievementModal';

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

// Stage Header Component with progress bar and action buttons
const StageHeader = ({
  stageName,
  progress,
  startDate,
  endDate,
  ratio,
  onBack,
  onChat,
  onDelays,
  onEdit,
  onClose,
  onAttachAchievement,
  isCompleted,
  canClose,
  user
}: {
  stageName: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  ratio?: number;
  onBack: () => void;
  onChat: () => void;
  onDelays: () => void;
  onEdit: () => void;
  onClose: () => void;
  onAttachAchievement: () => void;
  isCompleted: boolean;
  canClose: boolean;
  user: any;
}) => {
  const { hasPermission } = useValidityUser();
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return formatDateEnglish(dateString);
  };

  return (
    <div
      className="bg-white rounded-b-3xl"
      style={{
        padding: `${scale(16)}px ${scale(20)}px ${scale(24)}px`,
      }}
    >
      {/* Top Navigation */}
      <div
        className="flex items-center justify-between"
        style={{
          paddingTop: `${scale(16)}px`,
          paddingBottom: `${scale(16)}px`
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: `${scale(8)}px`,
            borderRadius: `${scale(8)}px`,
            transition: 'all 0.2s ease'
          }}
          className="hover:bg-gray-100"
        >
          <svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Close/Open Stage Button - Permission-based */}
        {hasPermission('اقفال المرحلة') && (
          <button
            onClick={onClose}
            className={`border flex items-center transition-all duration-200 ${
              isCompleted
                ? 'bg-green-50 border-green-200 hover:bg-green-100'
                : progress === 100
                  ? 'bg-red-50 border-red-200 hover:bg-red-100'
                  : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
            }`}
            style={{
              padding: `${scale(8)}px ${scale(12)}px`,
              borderRadius: `${scale(8)}px`,
              gap: `${scale(8)}px`
            }}
            disabled={progress < 100 && !isCompleted}
          >
            <svg
              width={scale(20)}
              height={scale(20)}
              viewBox="0 0 24 24"
              fill="none"
              stroke={isCompleted ? "#10B981" : progress === 100 ? "#FF0F0F" : "#9CA3AF"}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.02331 5.5C4.59826 7.11238 3 9.86954 3 13C3 17.9706 7.02944 22 12 22C16.9706 22 21 17.9706 21 13C21 9.86954 19.4017 7.11238 16.9767 5.5" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2V10" />
            </svg>
            <span
              className={`font-ibm-arabic-semibold ${
                isCompleted
                  ? 'text-green-600'
                  : progress === 100
                    ? 'text-red-600'
                    : 'text-gray-400'
              }`}
              style={{ fontSize: `${scale(13)}px` }}
            >
              {isCompleted
                ? (canClose ? 'عمليات الفتح' : 'فتح المرحلة')
                : (canClose ? 'عمليات الاقفال' : 'اقفال المرحلة')
              }
            </span>
          </button>
        )}

        <button
          style={{
            padding: `${scale(8)}px`,
            borderRadius: `${scale(8)}px`,
            transition: 'all 0.2s ease'
          }}
          className="hover:bg-gray-100"
        >
          <svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7 7 0 00-14 0v2" />
          </svg>
        </button>
      </div>

      {/* Stage Title and Edit */}
      <div
        className="flex items-center justify-center"
        style={{
          gap: `${scale(12)}px`,
          marginBottom: `${scale(20)}px`
        }}
      >
        <h1
          className="font-ibm-arabic-bold text-gray-900 text-center"
          style={{ fontSize: `${scale(18)}px` }}
        >
          {stageName}
        </h1>
        {hasPermission('تعديل مرحلة رئيسية') && (
          <button
            onClick={onEdit}
            style={{
              padding: `${scale(4)}px`,
              borderRadius: `${scale(6)}px`,
              transition: 'all 0.2s ease'
            }}
            className="hover:bg-blue-50"
          >
            <svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24" fill="none" stroke="#3B82F6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div
        className="relative"
        style={{ marginBottom: `${scale(24)}px` }}
      >
        <div
          className="w-full bg-gray-200 rounded-full transition-all duration-300"
          style={{ height: `${scale(12)}px` }}
        >
          <div
            className="bg-blue-600 rounded-full transition-all duration-500 shadow-sm"
            style={{
              width: `${typeof progress === 'number' && !isNaN(progress) ? progress : 0}%`,
              height: `${scale(12)}px`
            }}
          />
        </div>
        {/* Progress Badge */}
        <div
          className="absolute bg-white border border-gray-200 shadow-md font-ibm-arabic-bold text-blue-600"
          style={{
            top: `${scale(-32)}px`,
            left: `${Math.max(0, Math.min((typeof progress === 'number' && !isNaN(progress) ? progress : 0) - 5, 90))}%`,
            padding: `${scale(6)}px ${scale(10)}px`,
            borderRadius: `${scale(8)}px`,
            fontSize: `${scale(12)}px`
          }}
        >
          {(typeof progress === 'number' && !isNaN(progress) ? progress : 0).toFixed(1)}%
        </div>
      </div>

      {/* Dates and Ratio */}
      <div
        className="flex justify-around text-center"
        style={{ marginBottom: `${scale(20)}px` }}
      >
        <div
          className="bg-blue-50 rounded-lg"
          style={{
            padding: `${scale(12)}px ${scale(16)}px`,
            borderRadius: `${scale(12)}px`
          }}
        >
          <p
            className="text-blue-600 font-ibm-arabic-bold"
            style={{
              fontSize: `${scale(11)}px`,
              marginBottom: `${scale(4)}px`
            }}
          >
            تاريخ البداية
          </p>
          <p
            className="text-blue-700 font-ibm-arabic-bold"
            style={{ fontSize: `${scale(12)}px` }}
          >
            {formatDate(startDate)}
          </p>
        </div>
        <div
          className="bg-blue-50 rounded-lg"
          style={{
            padding: `${scale(12)}px ${scale(16)}px`,
            borderRadius: `${scale(12)}px`
          }}
        >
          <p
            className="text-blue-600 font-ibm-arabic-bold"
            style={{
              fontSize: `${scale(11)}px`,
              marginBottom: `${scale(4)}px`
            }}
          >
            تاريخ النهاية
          </p>
          <p
            className="text-blue-700 font-ibm-arabic-bold"
            style={{ fontSize: `${scale(12)}px` }}
          >
            {formatDate(endDate)}
          </p>
        </div>
        <div
          className="bg-blue-50 rounded-lg"
          style={{
            padding: `${scale(12)}px ${scale(16)}px`,
            borderRadius: `${scale(12)}px`
          }}
        >
          <p
            className="text-blue-600 font-ibm-arabic-bold"
            style={{
              fontSize: `${scale(11)}px`,
              marginBottom: `${scale(4)}px`
            }}
          >
            النسبة التقديرية
          </p>
          <p
            className="text-blue-700 font-ibm-arabic-bold text-center"
            style={{ fontSize: `${scale(12)}px` }}
          >
            {ratio || 0}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="flex justify-center"
        style={{ gap: `${scale(12)}px` }}
      >
        <button
          onClick={onChat}
          className="flex items-center bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
          style={{
            padding: `${scale(12)}px ${scale(16)}px`,
            borderRadius: `${scale(12)}px`,
            gap: `${scale(8)}px`
          }}
        >
          <svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span
            className="font-ibm-arabic-semibold text-gray-700"
            style={{ fontSize: `${scale(13)}px` }}
          >
            تواصل
          </span>
        </button>

        {hasPermission('إضافة تأخيرات') && (
          <button
            onClick={onDelays}
            className="flex items-center bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            style={{
              padding: `${scale(12)}px ${scale(16)}px`,
              borderRadius: `${scale(12)}px`,
              gap: `${scale(8)}px`
            }}
          >
            <svg width={scale(20)} height={scale(20)} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span
              className="font-ibm-arabic-semibold text-gray-700"
              style={{ fontSize: `${scale(13)}px` }}
            >
              التأخيرات
            </span>
          </button>
        )}

        <button
          onClick={onAttachAchievement}
          className="flex items-center bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
          style={{
            padding: `${scale(12)}px ${scale(16)}px`,
            borderRadius: `${scale(12)}px`,
            gap: `${scale(8)}px`
          }}
        >
          <span
            className="font-ibm-arabic-semibold text-gray-700"
            style={{ fontSize: `${scale(13)}px` }}
          >
            إرفاق إنجاز المرحلة
          </span>
        </button>
      </div>
    </div>
  );
};

// Sub Stage Card Component
const SubStageCard = ({
  subStage,
  isSelected,
  isSelectMode,
  onToggleComplete,
  onToggleSelect,
  onSettings,
  onOpenAttachment,
  onNoteClick,
  user: _user
}: {
  subStage: SubStage;
  isSelected: boolean;
  isSelectMode: boolean;
  onToggleComplete: () => void;
  onToggleSelect: () => void;
  onSettings: () => void;
  onOpenAttachment: () => void;
  onNoteClick?: (note: any) => void;
  user: any;
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const isCompleted = subStage.Done === 'true';
  let completedBy: ClosingOperation | null = null;

  if (isCompleted && subStage.closingoperations) {
    try {
      const operations: ClosingOperation[] = JSON.parse(subStage.closingoperations);
      completedBy = operations.find(op => op.type === 'تم الانجاز') || operations[operations.length - 1];
    } catch (e) {
      console.error('Error parsing closing operations:', e);
    }
  }

  // Parse notes and achievements
  const notes = subStage.Note ? (() => {
    try {
      return JSON.parse(subStage.Note);
    } catch {
      return [];
    }
  })() : [];

  const achievements = subStage.closingoperations ? (() => {
    try {
      return JSON.parse(subStage.closingoperations);
    } catch {
      return [];
    }
  })() : [];

  const hasNotes = notes.length > 0;
  const hasAchievements = achievements.length > 0;
  const hasNotesOrAchievements = hasNotes || hasAchievements;

  const formatDate = (dateString: string) => {
    return formatDateEnglish(dateString);
  };

  return (
    <div
      className="group relative bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
      style={{
        borderRadius: `${scale(16)}px`,
        marginBottom: `${scale(16)}px`
      }}
    >
      <div style={{ padding: `${scale(20)}px` }}>
        {/* Top Row */}
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: `${scale(16)}px` }}
        >
          <div
            className="flex items-center flex-1"
            style={{ gap: `${scale(12)}px` }}
          >
            {/* Checkbox */}
            <button
              onClick={isSelectMode ? onToggleSelect : onToggleComplete}
              className={`rounded border-2 flex items-center justify-center transition-all duration-200 ${
                isSelectMode
                  ? (isSelected ? 'bg-blue-500 border-blue-500 hover:bg-blue-600' : 'border-gray-300 hover:border-blue-300')
                  : (isCompleted ? 'bg-green-500 border-green-500 hover:bg-green-600' : 'border-gray-300 hover:border-green-300')
              }`}
              style={{
                width: `${scale(24)}px`,
                height: `${scale(24)}px`,
                borderRadius: `${scale(6)}px`
              }}
            >
              {((isSelectMode && isSelected) || (!isSelectMode && isCompleted)) && (
                <svg width={scale(14)} height={scale(14)} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Title */}
            <p
              className={`font-ibm-arabic-semibold flex-1 min-w-0 ${
                isCompleted ? 'text-green-600' : 'text-gray-900'
              }`}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: `${scale(20)}px`,
                fontSize: `${scale(14)}px`,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }}
              title={subStage.StageSubName}
            >
              {subStage.StageSubName}
            </p>
          </div>

          {/* Action Icons */}
          <div
            className="flex items-center"
            style={{ gap: `${scale(8)}px` }}
          >
            {subStage.attached && (
              <button
                onClick={onOpenAttachment}
                className="hover:bg-gray-100 transition-colors duration-200"
                style={{
                  padding: `${scale(6)}px`,
                  borderRadius: `${scale(6)}px`
                }}
              >
                <svg width={scale(18)} height={scale(18)} viewBox="0 0 24 24" fill="none" stroke="#6B7280">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}

            <button
              onClick={onSettings}
              className="hover:bg-gray-100 transition-colors duration-200"
              style={{
                padding: `${scale(6)}px`,
                borderRadius: `${scale(6)}px`
              }}
            >
              <svg width={scale(18)} height={scale(18)} viewBox="0 0 24 24" fill="none" stroke="#6B7280">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Completion Info */}
        {isCompleted && completedBy && (
          <div
            className="bg-gray-50 border border-gray-100"
            style={{
              borderRadius: `${scale(12)}px`,
              padding: `${scale(16)}px`,
              marginBottom: `${scale(16)}px`
            }}
          >
            <div
              className="flex items-center"
              style={{ gap: `${scale(12)}px` }}
            >
              <div
                className="bg-blue-100 rounded-full flex items-center justify-center"
                style={{
                  width: `${scale(32)}px`,
                  height: `${scale(32)}px`
                }}
              >
                <svg width={scale(16)} height={scale(16)} viewBox="0 0 24 24" fill="none" stroke="#3B82F6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p
                  className="font-ibm-arabic-semibold text-gray-900"
                  style={{ fontSize: `${scale(13)}px` }}
                >
                  {completedBy.userName}
                </p>
                <p
                  className="text-gray-500"
                  style={{ fontSize: `${scale(11)}px` }}
                >
                  {completedBy.Date ? formatDateEnglish(completedBy.Date) : ''}
                </p>
              </div>
              <div
                className="bg-green-100"
                style={{
                  padding: `${scale(6)}px ${scale(12)}px`,
                  borderRadius: `${scale(20)}px`
                }}
              >
                <span
                  className="font-ibm-arabic-medium text-green-700"
                  style={{ fontSize: `${scale(11)}px` }}
                >
                  {completedBy.type}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Notes Section */}
      {(hasNotes || hasAchievements) && (
        <div className="border-t border-gray-100">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="w-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
            style={{ padding: `${scale(12)}px` }}
          >
            <svg
              width={scale(18)}
              height={scale(18)}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              className={`transform transition-transform duration-200 ${showNotes ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Notes and Achievements Content */}
          {showNotes && (
            <div style={{ padding: `${scale(16)}px` }}>
              {/* Achievements */}
              {achievements.map((achievement: any, index: number) => (
                <div
                  key={`achievement-${index}`}
                  className="bg-green-50 border border-green-200 rounded-lg mb-3"
                  style={{ padding: `${scale(12)}px` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center" style={{ gap: `${scale(8)}px` }}>
                      <div
                        className="bg-blue-100 rounded-full flex items-center justify-center"
                        style={{
                          width: `${scale(24)}px`,
                          height: `${scale(24)}px`
                        }}
                      >
                        <svg width={scale(12)} height={scale(12)} viewBox="0 0 24 24" fill="none" stroke="#3B82F6">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p
                          className="font-ibm-arabic-semibold text-gray-900"
                          style={{ fontSize: `${scale(12)}px` }}
                        >
                          {achievement.userName}
                        </p>
                        <p
                          className="text-gray-500"
                          style={{ fontSize: `${scale(10)}px` }}
                        >
                          {formatDate(achievement.Date)}
                        </p>
                      </div>
                    </div>
                    <div
                      className="bg-green-100"
                      style={{
                        padding: `${scale(4)}px ${scale(8)}px`,
                        borderRadius: `${scale(12)}px`
                      }}
                    >
                      <span
                        className="font-ibm-arabic-medium text-green-700"
                        style={{ fontSize: `${scale(10)}px` }}
                      >
                        {achievement.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Notes */}
              {notes.map((note: any, index: number) => (
                <div
                  key={`note-${index}`}
                  className="bg-gray-50 border border-gray-200 rounded-lg mb-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  style={{ padding: `${scale(12)}px` }}
                  onClick={() => onNoteClick && onNoteClick(note)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center" style={{ gap: `${scale(8)}px` }}>
                      <div
                        className="bg-blue-100 rounded-full flex items-center justify-center"
                        style={{
                          width: `${scale(24)}px`,
                          height: `${scale(24)}px`
                        }}
                      >
                        <svg width={scale(12)} height={scale(12)} viewBox="0 0 24 24" fill="none" stroke="#3B82F6">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p
                          className="font-ibm-arabic-semibold text-gray-900"
                          style={{ fontSize: `${scale(12)}px` }}
                        >
                          {note.userName}
                        </p>
                        <p
                          className="text-gray-500"
                          style={{ fontSize: `${scale(10)}px` }}
                        >
                          {formatDate(note.Date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Note Content */}
                  <div style={{ width: '80%' }}>
                    <p
                      className="text-gray-800 font-ibm-arabic-regular"
                      style={{
                        fontSize: `${scale(12)}px`,
                        lineHeight: `${scale(18)}px`
                      }}
                    >
                      {note.Note}
                    </p>
                  </div>

                  {/* Note Files */}
                  {note.File && note.File.length > 0 && (
                    <div
                      className="flex flex-wrap mt-2"
                      style={{ gap: `${scale(8)}px` }}
                    >
                      {note.File.map((fileName: string, fileIndex: number) => (
                        <a
                          key={fileIndex}
                          href={`/api/files/${fileName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 space-x-reverse px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="truncate max-w-20" title={fileName}>
                            {fileName}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Component
const StageDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const projectId = parseInt(params.id as string);
  const stageId = params.stageId as string;

  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation, hasPermission } = useValidityUser();

  const { project, fetchProjectDetails } = useProjectDetails();
  const { subStages, loading: loadingSub, hasMore, fetchInitial, loadMore, error: subError, setSubStages, uploadStageAchievement } = useSubStages();

  const [stageDetails, setStageDetails] = useState<any>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedForCompletion, setSelectedForCompletion] = useState<number[]>([]);
  const [selectedForCancellation, setSelectedForCancellation] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubStage, setSelectedSubStage] = useState<SubStage | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubStageId, setPendingSubStageId] = useState<number | null>(null);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubStage, setEditingSubStage] = useState<SubStage | null>(null);
  const [showStageEditModal, setShowStageEditModal] = useState(false);
  const [loadingStage, setLoadingStage] = useState(false);
  const [deletingSubStage, setDeletingSubStage] = useState(false);

  // Notes states
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [noteSubStage, setNoteSubStage] = useState<SubStage | null>(null);

  // Achievement modal state
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // Notes hook
  const { addNote, loading: notesLoading } = useSubStageNotes();

  // Load stage details and sub-stages
  useEffect(() => {
    if (projectId && stageId && user?.accessToken) {
      // تفريغ الحالة القديمة فوراً حتى لا يظهر اسم/بيانات مرحلة سابقة أثناء التحميل
      setStageDetails(null);
      setSubStages([]);
      fetchStageDetails();
    }
  }, [projectId, stageId, user?.accessToken, fetchInitial]);

  const fetchStageDetails = async () => {
    setLoadingStage(true);
    try {
      const response = await axiosInstance.get(
        `/brinshCompany/BringStageOneObject?ProjectID=${projectId}&StageID=${stageId}`,
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        }
      );
      const stageData = response.data?.data || response.data;

      if (!stageData) {
        console.error('No stage data received');
        return;
      }

      setStageDetails(stageData);

      // Use the StageID from the response data, or fallback to URL stageId
      const stageIdToUse = stageData.StageID || stageId;

      // Fetch sub-stages using the correct StageID (can be string like "A1")
      fetchInitial(projectId, stageIdToUse);

    } catch (error) {
      console.error('Error fetching stage details:', error);
      // If API fails, still try to fetch sub-stages with URL stageId
      fetchInitial(projectId, stageId);
    } finally {
      setLoadingStage(false);
    }
  };

  const handleCloseStage = () => {
    // تطبيق نفس آلية التطبيق المحمول
    // إذا كانت المرحلة تحتوي على ملاحظات، اعرض معلومات المرحلة أولاً
    if (stageDetails?.NoteOpen !== null || stageDetails?.NoteClosed !== null) {
      setShowInfoModal(true);
    } else {
      // انتقل مباشرة إلى مودال الإغلاق/الفتح
      setShowCloseModal(true);
    }
  };

  const handleProceedToClose = () => {
    // إغلاق مودال المعلومات وفتح مودال الإغلاق/الفتح
    setShowInfoModal(false);
    setShowCloseModal(true);
  };

  const handleCloseSuccess = () => {
    // تحديث تفاصيل المرحلة بعد نجاح العملية
    fetchStageDetails();
  };

  const handleToggleComplete = async (subStageId: number) => {
    if (!isSelectMode) {
      // Show confirmation modal instead of direct execution
      setPendingSubStageId(subStageId);
      setShowConfirmModal(true);
    }
  };

  const confirmToggleComplete = async () => {
    if (pendingSubStageId && await Uservalidation('تشييك الانجازات الفرعية', projectId)) {
      try {
        setIsToggleLoading(true);
        await axiosInstance.post(
          '/brinshCompany/AddORCanselAchievment',
          { StageSubID: pendingSubStageId },
          {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          }
        );
        // Refresh data - use stage details StageID
        if (stageDetails?.StageID) {
          fetchInitial(projectId, stageDetails.StageID);
        }
        setShowConfirmModal(false);
        setPendingSubStageId(null);
      } catch (error) {
        console.error('Error toggling completion:', error);
      } finally {
        setIsToggleLoading(false);
      }
    }
  };

  const handleToggleSelect = (subStageId: number) => {
    const subStage = subStages.find(stage => stage.StageSubID === subStageId);
    const isCurrentlyCompleted = subStage?.Done === 'true';

    if (!selectedForCompletion.includes(subStageId) && !selectedForCancellation.includes(subStageId)) {
      // First selection - add to appropriate array based on current status
      if (isCurrentlyCompleted) {
        setSelectedForCancellation(prev => [...prev, subStageId]);
      } else {
        setSelectedForCompletion(prev => [...prev, subStageId]);
      }
    } else {
      // Already selected - remove from both arrays
      setSelectedForCompletion(prev => prev.filter(id => id !== subStageId));
      setSelectedForCancellation(prev => prev.filter(id => id !== subStageId));
    }

    // Update selectedItems for UI display
    setSelectedItems(prev =>
      prev.includes(subStageId)
        ? prev.filter(id => id !== subStageId)
        : [...prev, subStageId]
    );
  };

  const handleSelectAll = async () => {
    if (isSelectMode) {
      // Save selected items with proper completion/cancellation arrays
      if (await Uservalidation('تشييك الانجازات الفرعية', projectId)) {
        try {
          await axiosInstance.post(
            '/brinshCompany/AddORCanselAchievmentarrayall',
            {
              selectAllarray: selectedForCompletion,
              selectAllarraycansle: selectedForCancellation
            },
            {
              headers: { Authorization: `Bearer ${user.accessToken}` },
            }
          );
          // Refresh data - use stage details StageID
          if (stageDetails?.StageID) {
            fetchInitial(projectId, stageDetails.StageID);
          }
          setIsSelectMode(false);
          setSelectedItems([]);
          setSelectedForCompletion([]);
          setSelectedForCancellation([]);
        } catch (error) {
          console.error('Error saving selections:', error);
        }
      }
    } else {
      setIsSelectMode(true);
      setSelectedItems([]);
      setSelectedForCompletion([]);
      setSelectedForCancellation([]);
    }
  };

  const handleCancelSelect = () => {
    setIsSelectMode(false);
    setSelectedItems([]);
    setSelectedForCompletion([]);
    setSelectedForCancellation([]);
  };

  const handleAddSubStage = async (name: string, file?: File) => {
    if (await Uservalidation('اضافة مرحلة فرعية', projectId)) {
      try {
        const formData = new FormData();
        formData.append('StageSubName', name);
        const stageIdToUse = (stageDetails?.StageID ?? stageId) as any;
        formData.append('StageID', String(stageIdToUse));
        formData.append('ProjectID', String(projectId));
        if (file) formData.append('file', file);

        await axiosInstance.post('/brinshCompany/v2/StageSub', formData, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });

        // Refresh data - use stage details StageID
        if (stageDetails?.StageID) {
          fetchInitial(projectId, stageDetails.StageID);
        }
        setShowAddModal(false);
      } catch (error) {
        console.error('Error adding sub-stage:', error);
      }
    }
  };

  const handleEditStage = async () => {
    if (!stageDetails) return;

    // التحقق من الصلاحيات
    const hasPermission = await Uservalidation('تعديل مرحلة رئيسية', projectId);
    if (!hasPermission) {
      return;
    }

    setShowStageEditModal(true);
  };

  const handleUpdateStage = async (name: string, days: number) => {
    if (!stageDetails) return;

    try {
      await axiosInstance.put('/brinshCompany/UpdateDataStage', {
        ProjectID: projectId,
        StageID: stageDetails.StageID,
        StageName: name,
        Days: days
      }, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
      });

      // تحديث البيانات
      fetchStageDetails();

      setShowStageEditModal(false);
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const handleSubStageOptions = (subStage: SubStage) => {
    setSelectedSubStage(subStage);
    setShowOptionsModal(true);
  };

  const handleEditSubStage = async () => {
    if (!selectedSubStage) return;

    // التحقق من الصلاحيات
    const hasPermission = await Uservalidation('تعديل مرحلة فرعية' as any, projectId);
    if (!hasPermission) {
      return;
    }

    setEditingSubStage(selectedSubStage);
    setShowOptionsModal(false);
    setShowEditModal(true);
  };

  const handleUpdateSubStage = async (name: string, file?: File) => {
    if (!editingSubStage) return;

    try {
      const formData = new FormData();
      formData.append('StageSubID', String(editingSubStage.StageSubID));
      formData.append('StageSubName', name);
      if (file) formData.append('file', file);

      await axiosInstance.put('/brinshCompany/v2/UpdateDataStageSub', formData, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      // تحديث البيانات
      if (stageDetails?.StageID) {
        fetchInitial(projectId, stageDetails.StageID);
      }

      setShowEditModal(false);
      setEditingSubStage(null);
    } catch (error) {
      console.error('Error updating sub-stage:', error);
    }
  };

  // Notes handlers
  const handleAddNote = () => {
    if (!selectedSubStage) return;
    setNoteSubStage(selectedSubStage);
    setShowOptionsModal(false);
    setShowAddNoteModal(true);
  };

  const handleViewNotes = () => {
    if (!selectedSubStage) return;
    setNoteSubStage(selectedSubStage);
    setShowOptionsModal(false);
    setShowNotesModal(true);
  };

  const handleAddNoteSubmit = async (note: string, files?: File[]) => {
    if (!noteSubStage) return;

    const success = await addNote(noteSubStage.StageSubID, note, files);
    if (success) {
      setShowAddNoteModal(false);
      setNoteSubStage(null);
      // Refresh sub-stages to get updated notes
      if (stageDetails?.StageID) {
        fetchInitial(projectId, stageDetails.StageID);
      }
    }
  };

  const handleNotesUpdated = () => {
    // Refresh sub-stages to get updated notes
    if (stageDetails?.StageID) {
      fetchInitial(projectId, stageDetails.StageID);
    }
  };

  const handleDeleteSubStage = async () => {
    if (!selectedSubStage) return;

    // التحقق من الصلاحيات
    const hasPermission = await Uservalidation('حذف مرحلة فرعية' as any, projectId);
    if (!hasPermission) {
      return;
    }

    try {
      setDeletingSubStage(true);

      // استخدام نفس API endpoint المستخدم في التطبيق المحمول
      await axiosInstance.get(`/brinshCompany/DeleteStageSub?StageSubID=${selectedSubStage.StageSubID}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      // إغلاق المودال وتحديث القائمة
      setShowOptionsModal(false);
      setSelectedSubStage(null);

      // تحديث قائمة المهام الفرعية
      if (stageDetails?.StageID) {
        await fetchInitial(projectId, stageDetails.StageID);
      }

      // رسالة نجاح
      Tostget('تم حذف المهمة الفرعية بنجاح');

    } catch (error) {
      console.error('Error deleting sub-stage:', error);
      Tostget('فشل في حذف المهمة الفرعية');
    } finally {
      setDeletingSubStage(false);
    }
  };

  const handleUploadAchievement = async (file: File) => {
    if (!stageDetails?.StageID) return;

    const success = await uploadStageAchievement(projectId, stageDetails.StageID, file);
    if (success) {
      setShowAchievementModal(false);
    }
  };

  if (subError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-gray-600 mb-4">{subError}</p>
          <button
            onClick={() => stageDetails?.StageID && fetchInitial(projectId, stageDetails.StageID)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title={stageDetails?.StageName || 'جارٍ التحميل...'}
          backButton={
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-lg" aria-label="رجوع">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          }
          actions={
            <div className="flex items-center gap-3">
              {hasPermission('اقفال المرحلة') && (
                <button
                  onClick={handleCloseStage}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-ibm-arabic-semibold ${
                    stageDetails?.Done === 'true'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : (typeof stageDetails?.rate === 'number' && stageDetails.rate === 100)
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={(typeof stageDetails?.rate === 'number' ? stageDetails.rate : 0) < 100 && stageDetails?.Done !== 'true'}
                >
                  {stageDetails?.Done === 'true'
                    ? ((stageDetails?.NoteOpen !== null || stageDetails?.NoteClosed !== null) ? 'عمليات الفتح' : 'فتح المرحلة')
                    : ((stageDetails?.NoteOpen !== null || stageDetails?.NoteClosed !== null) ? 'عمليات الاقفال' : 'اقفال المرحلة')}
                </button>
              )}
              {hasPermission('إضافة تأخيرات') && (
                <button onClick={() => router.push(`/project/${projectId}/stage/${stageId}/delays`)} className="p-2 hover:bg-gray-50 rounded-lg" aria-label="التأخيرات">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
              <button onClick={() => router.push(`/chat?ProjectID=${projectId}&typess=${encodeURIComponent(String(stageId))}&nameRoom=${encodeURIComponent('تواصل')}&nameProject=${encodeURIComponent(stageDetails?.StageName || '')}`)} className="p-2 hover:bg-gray-50 rounded-lg" aria-label="تواصل">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              {hasPermission('تعديل مرحلة رئيسية') && (
                <button onClick={handleEditStage} className="p-2 hover:bg-gray-50 rounded-lg" aria-label="تعديل">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
          }
        />
      }
    >
      <ContentSection>
        {/* Stage Status Badge */}
        {stageDetails && (
          <div className="mb-4">
            <StageStatusBadge stage={stageDetails} />
          </div>
        )}

        {/* Stage Info Section - Dates and Ratio */}
        {stageDetails && (
          <div
            className="bg-white rounded-2xl mb-6"
            style={{
              padding: `${scale(20)}px`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Dates and Ratio */}
            <div
              className="flex justify-around text-center"
              style={{ gap: `${scale(12)}px` }}
            >
              <div
                className="bg-blue-50 rounded-lg"
                style={{
                  padding: `${scale(12)}px ${scale(16)}px`,
                  borderRadius: `${scale(12)}px`
                }}
              >
                <p
                  className="text-blue-600 font-ibm-arabic-bold"
                  style={{
                    fontSize: `${scale(11)}px`,
                    marginBottom: `${scale(4)}px`
                  }}
                >
                  تاريخ البداية
                </p>
                <p
                  className="text-blue-700 font-ibm-arabic-bold"
                  style={{ fontSize: `${scale(12)}px` }}
                >
                  {stageDetails.StartDate ? formatDateEnglish(stageDetails.StartDate) : '-'}
                </p>
              </div>
              <div
                className="bg-blue-50 rounded-lg"
                style={{
                  padding: `${scale(12)}px ${scale(16)}px`,
                  borderRadius: `${scale(12)}px`
                }}
              >
                <p
                  className="text-blue-600 font-ibm-arabic-bold"
                  style={{
                    fontSize: `${scale(11)}px`,
                    marginBottom: `${scale(4)}px`
                  }}
                >
                  تاريخ النهاية
                </p>
                <p
                  className="text-blue-700 font-ibm-arabic-bold"
                  style={{ fontSize: `${scale(12)}px` }}
                >
                  {stageDetails.EndDate ? formatDateEnglish(stageDetails.EndDate) : '-'}
                </p>
              </div>
              <div
                className="bg-blue-50 rounded-lg"
                style={{
                  padding: `${scale(12)}px ${scale(16)}px`,
                  borderRadius: `${scale(12)}px`
                }}
              >
                <p
                  className="text-blue-600 font-ibm-arabic-bold"
                  style={{
                    fontSize: `${scale(11)}px`,
                    marginBottom: `${scale(4)}px`
                  }}
                >
                  النسبة التقديرية
                </p>
                <p
                  className="text-blue-700 font-ibm-arabic-bold text-center"
                  style={{ fontSize: `${scale(12)}px` }}
                >
                  {stageDetails.Ratio || 0}
                </p>
              </div>
            </div>

            {/* Attach Achievement Button */}
            <div
              className="flex justify-center"
              style={{ marginTop: `${scale(16)}px` }}
            >
              <button
                onClick={() => setShowAchievementModal(true)}
                className="flex items-center bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                style={{
                  padding: `${scale(12)}px ${scale(16)}px`,
                  borderRadius: `${scale(12)}px`,
                  gap: `${scale(8)}px`
                }}
              >
                <span
                  className="font-ibm-arabic-semibold text-gray-700"
                  style={{ fontSize: `${scale(13)}px` }}
                >
                  إرفاق إنجاز المرحلة
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className="flex justify-between items-center"
          style={{ marginBottom: `${scale(20)}px` }}
        >
          {hasPermission('اضافة مرحلة فرعية') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-ibm-arabic-semibold bg-transparent hover:bg-blue-50 transition-all duration-200"
              style={{
                padding: `${scale(8)}px ${scale(12)}px`,
                borderRadius: `${scale(8)}px`,
                fontSize: `${scale(14)}px`
              }}
            >
              إنشاء مهمة فرعية جديدة
            </button>
          )}

          <div
            className="flex items-center"
            style={{ gap: `${scale(12)}px` }}
          >
            {isSelectMode && (
              <button
                onClick={handleCancelSelect}
                className="bg-gray-200 text-gray-800 font-ibm-arabic-semibold hover:bg-gray-300 transition-colors duration-200"
                style={{
                  padding: `${scale(10)}px ${scale(16)}px`,
                  borderRadius: `${scale(8)}px`,
                  fontSize: `${scale(13)}px`
                }}
              >
                إلغاء
              </button>
            )}
            <button
              onClick={handleSelectAll}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-ibm-arabic-semibold bg-transparent hover:bg-blue-50 transition-all duration-200"
              style={{
                padding: `${scale(8)}px ${scale(12)}px`,
                borderRadius: `${scale(8)}px`,
                fontSize: `${scale(14)}px`
              }}
            >
              {isSelectMode ? 'حفظ' : 'تحديد'}
            </button>
          </div>
        </div>

        {/* Sub Stages List */}
        <div className="pb-4">
        {(loadingStage || (loadingSub && subStages.length === 0)) ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="mr-3 text-gray-600 font-ibm-arabic-medium">جاري تحميل المراحل الفرعية...</span>
          </div>
        ) : subStages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 font-ibm-arabic-medium">لا توجد مراحل فرعية</p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: `${scale(20)}px` }}
          >
            {subStages.map((subStage) => (
              <SubStageCard
                key={subStage.StageSubID}
                subStage={subStage}
                isSelected={selectedItems.includes(subStage.StageSubID)}
                isSelectMode={isSelectMode}
                onToggleComplete={() => handleToggleComplete(subStage.StageSubID)}
                onToggleSelect={() => handleToggleSelect(subStage.StageSubID)}
                onSettings={() => handleSubStageOptions(subStage)}
                onOpenAttachment={() => {
                  if (subStage.attached) {
                    window.open(subStage.attached, '_blank');
                  }
                }}
                onNoteClick={(_note) => {
                  // Handle note click - could open edit modal or show note details
                  setNoteSubStage(subStage);
                  setShowNotesModal(true);
                }}
                user={user}
              />
            ))}

            {hasMore && (
              <div
                className="text-center"
                style={{
                  padding: `${scale(24)}px ${scale(16)}px 0`,
                  gridColumn: '1 / -1'
                }}
              >
                <button
                  onClick={() => loadMore(projectId, stageId)}
                  disabled={loadingSub}
                  className="bg-blue-600 text-white font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center mx-auto shadow-md hover:shadow-lg"
                  style={{
                    padding: `${scale(12)}px ${scale(24)}px`,
                    borderRadius: `${scale(12)}px`,
                    fontSize: `${scale(14)}px`,
                    gap: `${scale(8)}px`
                  }}
                >
                  {loadingSub && (
                    <div
                      className="animate-spin rounded-full border-b-2 border-white"
                      style={{
                        width: `${scale(16)}px`,
                        height: `${scale(16)}px`
                      }}
                    />
                  )}
                  {loadingSub ? 'جاري التحميل...' : 'تحميل المزيد'}
                </button>
              </div>
            )}

            {/* Loading indicator for load more */}
            {loadingSub && subStages.length > 0 && (
              <div
                className="flex items-center justify-center"
                style={{
                  padding: `${scale(16)}px`,
                  gridColumn: '1 / -1',
                  gap: `${scale(12)}px`
                }}
              >
                <div
                  className="animate-spin rounded-full border-b-2 border-blue-600"
                  style={{
                    width: `${scale(24)}px`,
                    height: `${scale(24)}px`
                  }}
                />
                <span
                  className="text-gray-600 font-ibm-arabic-medium"
                  style={{ fontSize: `${scale(13)}px` }}
                >
                  جاري تحميل المزيد...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      </ContentSection>


      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-md shadow-2xl"
            style={{
              backgroundColor: 'var(--theme-card-background)',
              border: '1px solid var(--theme-border)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Header */}
            <div
              className="text-center relative"
              style={{
                borderBottom: '1px solid var(--theme-border)',
                background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '20px',
                paddingBottom: '20px',
                marginBottom: '16px',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px'
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--theme-success-alpha, rgba(16, 185, 129, 0.1))' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2v20M2 12h20" stroke="var(--theme-success, #10b981)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3
                  className="font-bold"
                  style={{
                    fontSize: '18px',
                    fontFamily: 'var(--font-ibm-arabic-bold)',
                    color: 'var(--theme-text-primary)',
                    lineHeight: 1.4
                  }}
                >
                  إضافة مهمة فرعية جديدة
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 left-4 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
                style={{
                  padding: '10px',
                  backgroundColor: 'var(--theme-surface-secondary)',
                  border: '1px solid var(--theme-border)',
                  color: 'var(--theme-text-secondary)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            {/* Content */}
            <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '16px' }}>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddSubStage(
                  formData.get('name') as string,
                  formData.get('file') as File | undefined
                );
              }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label
                      className="block font-medium"
                      style={{
                        fontSize: '14px',
                        fontFamily: 'var(--font-ibm-arabic-medium)',
                        color: 'var(--theme-text-secondary)',
                        marginBottom: '8px'
                      }}
                    >
                      اسم المهمة
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="أدخل اسم المهمة الفرعية"
                      className="w-full rounded-xl transition-all duration-200 focus:scale-[1.02]"
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--theme-input-background)',
                        border: '1px solid var(--theme-border)',
                        color: 'var(--theme-text-primary)',
                        fontSize: '16px',
                        fontFamily: 'var(--font-ibm-arabic-medium)'
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="block font-medium"
                      style={{
                        fontSize: '14px',
                        fontFamily: 'var(--font-ibm-arabic-medium)',
                        color: 'var(--theme-text-secondary)',
                        marginBottom: '8px'
                      }}
                    >
                      مرفق (اختياري)
                    </label>
                    <input
                      name="file"
                      type="file"
                      className="w-full rounded-xl transition-all duration-200 focus:scale-[1.02]"
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--theme-input-background)',
                        border: '1px solid var(--theme-border)',
                        color: 'var(--theme-text-primary)',
                        fontSize: '16px',
                        fontFamily: 'var(--font-ibm-arabic-medium)'
                      }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="flex gap-3"
                  style={{
                    borderTop: '1px solid var(--theme-border)',
                    background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    margin: '8px 0'
                  }}
                >
                  <button
                    type="submit"
                    className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'var(--theme-success)',
                      color: 'white',
                      fontSize: '16px',
                      fontFamily: 'var(--font-ibm-arabic-semibold)',
                      border: 'none',
                      width: '45%'
                    }}
                  >
                    إضافة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'var(--theme-surface-secondary)',
                      color: 'var(--theme-text-primary)',
                      fontSize: '16px',
                      fontFamily: 'var(--font-ibm-arabic-semibold)',
                      border: '1px solid var(--theme-border)',
                      width: '45%'
                    }}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>

            {/* Decorative bottom element */}
            <div
              className="flex justify-center"
              style={{
                paddingBottom: '8px',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px'
              }}
            >
              <div
                className="w-12 h-1 rounded-full"
                style={{ backgroundColor: 'var(--theme-border)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stage Info Modal */}
      {stageDetails && (
        <StageInfoModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          onProceedToClose={handleProceedToClose}
          stage={stageDetails}
        />
      )}

      {/* Stage Close Modal */}
      {stageDetails && (
        <StageCloseModal
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          stage={stageDetails}
          onSuccess={handleCloseSuccess}
        />
      )}

      {/* SubStage Options Modal */}
      {selectedSubStage && (
        <SubStageOptionsModal
          isOpen={showOptionsModal}
          onClose={() => {
            setShowOptionsModal(false);
            setSelectedSubStage(null);
          }}
          onEdit={handleEditSubStage}
          onAddNote={handleAddNote}
          onViewNotes={handleViewNotes}
          onDelete={handleDeleteSubStage}
          loading={deletingSubStage}
          subStage={selectedSubStage}
        />
      )}

      {/* SubStage Edit Modal */}
      {editingSubStage && (
        <SubStageEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingSubStage(null);
          }}
          onSave={handleUpdateSubStage}
          subStage={editingSubStage}
          loading={loadingSub}
        />
      )}

      {/* Stage Edit Modal */}
      {stageDetails && (
        <StageEditModal
          isOpen={showStageEditModal}
          onClose={() => setShowStageEditModal(false)}
          onSave={handleUpdateStage}
          stage={stageDetails}
          loading={loadingSub}
        />
      )}

      {/* Confirmation Modal for Individual Task Toggle */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingSubStageId(null);
        }}
        onConfirm={confirmToggleComplete}
        title="تأكيد العملية"
        message={
          pendingSubStageId && subStages.find(stage => stage.StageSubID === pendingSubStageId)?.Done === 'true'
            ? 'هل ترغب بالفعل إلغاء الإنجاز؟'
            : 'هل ترغب بالفعل تنفيذ المرحلة؟'
        }
        isLoading={isToggleLoading}
      />

      {/* Add Note Modal */}
      {noteSubStage && (
        <SubStageNoteModal
          isOpen={showAddNoteModal}
          onClose={() => {
            setShowAddNoteModal(false);
            setNoteSubStage(null);
          }}
          onSave={handleAddNoteSubmit}
          subStage={noteSubStage}
          loading={notesLoading}
        />
      )}

      {/* Notes View Modal */}
      {noteSubStage && (
        <SubStageNotesModal
          isOpen={showNotesModal}
          onClose={() => {
            setShowNotesModal(false);
            setNoteSubStage(null);
          }}
          subStage={noteSubStage}
          onNotesUpdated={handleNotesUpdated}
        />
      )}

      {/* Stage Achievement Modal */}
      <StageAchievementModal
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        onSubmit={handleUploadAchievement}
        stageName={stageDetails?.StageName || ''}
      />
    </ResponsiveLayout>
  );
};

export default StageDetailsPage;