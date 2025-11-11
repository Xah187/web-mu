'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { scale } from '@/utils/responsiveSize';
import { fonts } from '@/constants/fonts';
import { colors } from '@/constants/colors';
import useValidityUser from '@/hooks/useValidityUser';
import useProjectDetails, { Stage, ProjectDetails } from '@/hooks/useProjectDetails';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import ReorderStagesModal from '@/components/project/ReorderStagesModal';
import AddProjectUsersModal from '@/components/project/AddProjectUsersModal';
import { EmployeeOnly, PermissionBasedVisibility } from '@/components/auth/PermissionGuard';
import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';
import { useTranslation } from '@/hooks/useTranslation';


// Enhanced Project Header with proper data display
const ProjectHeader = ({
  project,
  onBack,
  onEdit,
  onArchives,
  onFinance,
  onRequests,
  onStartProject,
  isStarted,
  user,
  showTopNav = true,
  showFinancialData = true, // New prop to control financial data visibility
  t,
  isRTL,
}: {
  project: ProjectDetails | null;
  onBack: () => void;
  onEdit: () => void;
  onArchives: () => void;
  onFinance: () => void;
  onRequests: () => void;
  onStartProject: () => void;
  isStarted: boolean;
  user: any;
  showTopNav?: boolean;
  showFinancialData?: boolean; // Matching mobile app NavbarPhase.tsx line 181-258
  t: (key: string) => string;
  isRTL: boolean;
}) => {
  if (!project) {
    return (
      <div className="bg-white rounded-b-3xl p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const remainingDays = project.Daysremaining || 0;
  const isOverdue = remainingDays < 0;

  return (
    <>
      <div className="bg-gray-50/30 rounded-b-3xl px-4 pb-8">
        {/* Top Navigation */}
        {showTopNav && (
        <div className="flex items-center justify-between pt-4 pb-4">
          <button onClick={onBack} className="p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        )}

        {/* Project Title and Edit (hidden when using PageHeader) */}
        {showTopNav && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 space-x-reverse flex-1">
            <h1 className="font-ibm-arabic-bold text-gray-900 flex-1" style={{ fontSize: scale(16) }}>
              {project.Nameproject}
            </h1>
            <button onClick={onEdit} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
        )}

          {/* Start Project Button - Matching mobile app NavbarPhase.tsx line 111 */}
          {/* Mobile app checks: ProjectStartdate === null && permissions['بدء المشروع'] */}
          {!isStarted && (
            <PermissionBasedVisibility permission="بدء المشروع">
              <button
                onClick={onStartProject}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
                style={{ fontSize: scale(12) }}
              >
                {t('projectDetails.startProject')}
              </button>
            </PermissionBasedVisibility>
          )}
      </div>

      {/* Stats and Actions Section - Matching Stages Layout Exactly */}
      <div className="pb-8">
        {/* Spacer before stats - matching stages */}
        <div className="h-4"></div>

        {/* Remaining Days Section - Separated */}
        <div className="mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-6 overflow-hidden">
            <div className="text-center">
              <p className="text-gray-600 font-ibm-arabic-medium mb-2" style={{ fontSize: scale(11) }}>
                {isOverdue ? t('projectDetails.overdueDays') : t('projectDetails.remainingDays')}
              </p>
              <div className="text-center">
                <span
                  className={`font-ibm-arabic-bold ${
                    isOverdue ? 'text-red-600' : 'text-blue-600'
                  }`}
                  style={{ fontSize: scale(20), fontFeatureSettings: '"tnum"' }}
                >
                  {Math.abs(remainingDays)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer between remaining days and stats */}
        <div className="h-4 sm:h-5 lg:h-6"></div>

        {/* Stats Grid - Always 3 columns */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 mb-4">
          {/* Daily Cost Card */}
          <div className="theme-card rounded-xl shadow-sm p-2 sm:p-3 lg:p-4 overflow-hidden">
            <div className="rounded-lg p-2 sm:p-3 lg:p-4 text-center border shadow-sm overflow-hidden"
                 style={{
                   borderColor: 'var(--color-primary)',
                   backgroundColor: 'var(--color-primary)' + '20'
                 }}>
              <p className="font-ibm-arabic-medium mb-1 sm:mb-2"
                 style={{
                   fontSize: scale(10),
                   color: 'var(--color-text-primary)'
                 }}>
                {t('projectDetails.totalExpenses')}
              </p>
              <p className="font-ibm-arabic-bold"
                 style={{
                   fontSize: scale(12),
                   fontFeatureSettings: '"tnum"',
                   color: 'var(--color-text-primary)'
                 }}>
                {/* Matching mobile app NavbarPhase.tsx line 181-183 */}
                {showFinancialData ? formatCurrency(project.ConstCompany || 0) : 'xxxx'}
                {showFinancialData && <span className="text-xs mr-1">{t('projectDetails.sar')}</span>}
              </p>
            </div>
          </div>

          {/* Days Count Card */}
          <div className="theme-card rounded-xl shadow-sm p-2 sm:p-3 lg:p-4 overflow-hidden">
            <div className="rounded-lg p-2 sm:p-3 lg:p-4 text-center border shadow-sm overflow-hidden"
                 style={{
                   borderColor: 'var(--color-primary)',
                   backgroundColor: 'var(--color-primary)' + '20'
                 }}>
              <p className="font-ibm-arabic-medium mb-1 sm:mb-2"
                 style={{
                   fontSize: scale(10),
                   color: 'var(--color-text-primary)'
                 }}>
                {t('projectDetails.days')}
              </p>
              <p className="font-ibm-arabic-bold"
                 style={{
                   fontSize: scale(12),
                   fontFeatureSettings: '"tnum"',
                   color: 'var(--color-text-primary)'
                 }}>
                {/* Matching mobile app NavbarPhase.tsx line 218-220 */}
                {showFinancialData ? (project.DaysUntiltoday || 0) : 'xxxx'}
              </p>
            </div>
          </div>

          {/* Total Cost Card */}
          <div className="theme-card rounded-xl shadow-sm p-2 sm:p-3 lg:p-4 overflow-hidden">
            <div className="rounded-lg p-2 sm:p-3 lg:p-4 text-center border shadow-sm overflow-hidden"
                 style={{
                   borderColor: 'var(--color-primary)',
                   backgroundColor: 'var(--color-primary)' + '20'
                 }}>
              <p className="font-ibm-arabic-medium mb-1 sm:mb-2"
                 style={{
                   fontSize: scale(10),
                   color: 'var(--color-text-primary)'
                 }}>
                {t('projectDetails.totalRevenues')}
              </p>
              <p className="font-ibm-arabic-bold"
                 style={{
                   fontSize: scale(12),
                   fontFeatureSettings: '"tnum"',
                   color: 'var(--color-text-primary)'
                 }}>
                {/* Matching mobile app NavbarPhase.tsx line 249-251 */}
                {showFinancialData ? (
                  <>
                    {formatCurrency(project.TotalcosttothCompany || 0).slice(0, 8)}
                    {String(project.TotalcosttothCompany).length > 8 && '..'}
                    <span className="text-xs mr-1">{t('projectDetails.sar')}</span>
                  </>
                ) : 'xxxx'}
              </p>
            </div>
          </div>
        </div>

        {/* Spacer between stats and actions (slightly reduced) */}
        <div className="h-4 sm:h-5 lg:h-6"></div>

        {/* Actions Grid - Always 3 columns */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
          {/* Requests Button Container */}
          <div className="theme-card rounded-xl shadow-sm p-1 sm:p-2 lg:p-3 overflow-hidden">
            <button
              onClick={onRequests}
              className="group w-full rounded-lg border shadow-sm hover:shadow-md transition-all p-1 sm:p-2 lg:p-3 flex flex-col items-center"
              style={{
                borderColor: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary)' + '20'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)' + '30';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)' + '20';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center mb-1 transition-colors"
                   style={{ backgroundColor: 'var(--color-primary)' + '30' }}>
                <svg width="12" height="12" className="sm:w-3 sm:h-3 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              <span className="text-xs font-ibm-arabic-semibold" style={{ fontSize: scale(9), color: 'var(--color-text-primary)' }}>{t('projectDetails.requestsLabel')}</span>
            </button>
          </div>

          {/* Finance Button Container - Matching mobile app NavbarPhase.tsx line 277 */}
          {/* Mobile app checks: permissions['إظهار المالية'] */}
          <PermissionBasedVisibility permission="إظهار المالية">
            <div className="theme-card rounded-xl shadow-sm p-1 sm:p-2 lg:p-3 overflow-hidden">
              <button
                onClick={onFinance}
                className="group w-full rounded-lg border shadow-sm hover:shadow-md transition-all p-1 sm:p-2 lg:p-3 flex flex-col items-center"
                style={{
                  borderColor: 'var(--color-primary)',
                  backgroundColor: 'var(--color-primary)' + '20'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)' + '30';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)' + '20';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                }}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center mb-1 transition-colors"
                     style={{ backgroundColor: 'var(--color-primary)' + '30' }}>
                  <svg width="12" height="12" className="sm:w-3 sm:h-3 lg:w-4 lg:h-4" viewBox="0 0 1124.14 1256.39" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" fill="var(--color-primary)"/>
                    <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z" fill="var(--color-primary)"/>
                  </svg>
                </div>
                <span className="text-xs font-ibm-arabic-semibold" style={{ fontSize: scale(9), color: 'var(--color-text-primary)' }}>{t('projectDetails.financeLabel')}</span>
              </button>
            </div>
          </PermissionBasedVisibility>

          {/* Archives Button Container - Matching mobile app NavbarPhase.tsx line 285 */}
          {/* Mobile app checks: permissions['إظهار الإرشيف'] */}
          <PermissionBasedVisibility permission="إظهار الإرشيف">
            <div className="theme-card rounded-xl shadow-sm p-1 sm:p-2 lg:p-3 overflow-hidden">
              <button
                onClick={onArchives}
                className="group w-full rounded-lg border shadow-sm hover:shadow-md transition-all p-1 sm:p-2 lg:p-3 flex flex-col items-center"
                style={{
                  borderColor: 'var(--color-primary)',
                  backgroundColor: 'var(--color-primary)' + '20'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)' + '30';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)' + '20';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                }}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center mb-1 transition-colors"
                     style={{ backgroundColor: 'var(--color-primary)' + '30' }}>
                  <svg width="12" height="12" className="sm:w-3 sm:h-3 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="8" width="18" height="12" rx="2" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="2" y="4" width="20" height="4" rx="1" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="9" y="12" width="6" height="2" rx="1" fill="var(--color-primary)"/>
                    <line x1="7" y1="16" x2="17" y2="16" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="7" y1="18" x2="14" y2="18" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-xs font-ibm-arabic-semibold" style={{ fontSize: scale(9), color: 'var(--color-text-primary)' }}>{t('projectDetails.archiveLabel')}</span>
              </button>
            </div>
          </PermissionBasedVisibility>
        </div>
      </div>
    </>
  );
};

// Enhanced Stage Card matching mobile app design
const StageCard = ({
  stage,
  onPress,
  onDelete
}: {
  stage: Stage;
  onPress: () => void;
  onDelete: () => void;
}) => {
  const { hasPermission } = useValidityUser();
  const { t } = useTranslation();
  const isCompleted = stage.Done === 'true';
  const progress = stage.rate || 0;

  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stage.attached) {
      window.open(stage.attached, '_blank', 'noopener,noreferrer');
    } else {
      Tostget(t('projectDetails.noExternalLink'));
    }
  };

  return (
    <div className="group relative h-full bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
      <div className="relative p-5 pt-6 flex flex-col items-center">
        {/* Title centered above progress */}
        <div className="w-full mb-3 text-center">
          <h3
            className="font-ibm-arabic-bold text-gray-900 text-base px-2"
            style={{
              fontSize: scale(14),
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: '1.25rem',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
            }}
            title={stage.StageName}
          >
            {stage.StageName}
          </h3>
          <div className="flex justify-center mt-2 px-3">
            <span
              className={`inline-block rounded-full font-ibm-arabic-medium whitespace-nowrap ${
                isCompleted ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}
              style={{
                fontSize: '9px',
                lineHeight: '1.4',
                padding: '2px 8px',
                maxWidth: 'calc(100% - 8px)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isCompleted ? t('projectDetails.stageCompleted') : t('projectDetails.stageNotCompleted')}
            </span>
          </div>
        </div>

        {/* Circular Progress */}
        <div
          className="relative cursor-pointer hover:scale-105 transition-transform duration-200 mb-2"
          onClick={onPress}
        >
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle cx="50" cy="50" r="35" stroke="#E5E7EB" strokeWidth="6" fill="none" />
              {/* Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r="35"
                stroke="#3B82F6"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 35}`}
                strokeDashoffset={`${2 * Math.PI * 35 * (1 - progress / 100)}`}
                className="transition-all duration-500"
              />
            </svg>
            {/* Percentage Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-ibm-arabic-bold text-blue-600" style={{ fontSize: scale(16) }}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-1">{t('projectDetails.completionRate')}</div>

        {/* Action Buttons Row - Top of card */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
          {/* External Link Button - Right side */}
          <button
            onClick={handleExternalLinkClick}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label={t('projectDetails.externalGuide')}
            title={stage.attached ? t('projectDetails.openExternalGuide') : t('projectDetails.noExternalLinkAvailable')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01" />
            </svg>
          </button>

          {/* Delete Button - Left side - Only if has permission */}
          {hasPermission('حذف مرحلة رئيسية') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              aria-label={t('projectDetails.deleteStage')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
const ProjectDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  // const searchParams = useSearchParams();

  const projectId = parseInt(params.id as string);

  const { user, size } = useSelector((state: any) => state.user || {});
  const { t, isRTL, dir } = useTranslation();
  const { Uservalidation, hasPermission } = useValidityUser();

  const {
    project,
    stages,
    loading,
    refreshing,
    error,
    hasMoreStages,
    fetchProjectDetails,
    fetchStages,
    loadMoreStages,
    refreshProject,
    addStage,
    deleteStage,
  } = useProjectDetails();

  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);
  const [showEditStartDateModal, setShowEditStartDateModal] = useState(false);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [stageData, setStageData] = useState({
    StageName: '',
    Days: 0,
    Ratio: 0,
    attached: ''
  });
  const [startDate, setStartDate] = useState<string>('');

  const [sortOption, setSortOption] = useState<'default' | 'progress' | 'name' | 'status'>('default');

  // Check permission for showing financial data - Matching mobile app NavbarPhase.tsx line 50
  const [showFinancialData, setShowFinancialData] = useState(false);

  useEffect(() => {
    const checkFinancialPermission = async () => {
      const hasPermission = await Uservalidation('إظهار التكلفه اليومية', projectId);
      setShowFinancialData(hasPermission);
    };
    checkFinancialPermission();
  }, [Uservalidation, projectId]);

  const sortedStages = useMemo(() => {
    const arr = [...(stages || [])];
    switch (sortOption) {
      case 'progress':
        return arr.sort((a, b) => (b.rate || 0) - (a.rate || 0));
      case 'name':
        return arr.sort((a, b) => (a.StageName || '').localeCompare(b.StageName || ''));
      case 'status':
        // Open first (Done !== 'true'), then by progress desc
        return arr.sort((a, b) => {
          const aOpen = a.Done !== 'true' ? 0 : 1;
          const bOpen = b.Done !== 'true' ? 0 : 1;
          if (aOpen !== bOpen) return aOpen - bOpen;
          return (b.rate || 0) - (a.rate || 0);
        });
      default:
        return arr;
    }
  }, [stages, sortOption]);


  // Load project data on mount
  useEffect(() => {
          if (projectId && user?.accessToken) {
        fetchProjectDetails(projectId);
        // Use 'update' type to match mobile app behavior and get all stages
        fetchStages(projectId, 0, 'update');
      }
  }, [projectId, user?.accessToken, fetchProjectDetails, fetchStages]);

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = useCallback(async () => {
    if (projectId) {
      await refreshProject(projectId);
    }
  }, [projectId, refreshProject]);

  const handleEdit = async () => {
    // Check permissions using Uservalidation like mobile app
    const hasPermission = await Uservalidation('تعديل بيانات المشروع', 0);
    if (hasPermission) {
      router.push(`/project/${projectId}/edit`);
    }
  };

  const handleArchives = () => {
    router.push(`/project/${projectId}/archives`);
  };

  const handleFinance = () => {
    router.push(`/project/${projectId}/finance`);
  };

  const handleRequests = () => {
    router.push(`/project/${projectId}/requests`);
  };

  const handleStartProject = async () => {
    // Check if user has permission to start project - matching mobile app exactly (PageHomeProject.tsx line 306-310)
    // Mobile app uses: if (await Uservalidation('تعديل تاريخ بدء المشروع', Validity))
    const hasPermission = await Uservalidation('تعديل تاريخ بدء المشروع', projectId);
    if (!hasPermission) {
      return;
    }

    try {
      const response = await axiosInstance.put(
        '/brinshCompany/UpdateStartdate',
        {
          data: {
            ProjectID: projectId,
            ProjectStartdate: new Date().toISOString(),
          }
        },
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        }
      );

      if (response.status === 200) {
        Tostget(t('projectDetails.projectStartSuccess'));
        // Refresh project data
        await fetchProjectDetails(projectId);
      }
    } catch (error) {
      console.error('Error starting project:', error);
      Tostget(t('projectDetails.projectStartError'));
    }
  };

  const handleStagePress = (stage: Stage) => {
    // Check if StageID exists, otherwise use StageCustID as fallback
    const stageIdToUse = stage.StageID || stage.StageCustID;

    if (!stageIdToUse) {
      console.error('No valid StageID found for stage:', stage);
      return;
    }

    router.push(`/project/${projectId}/stage/${stageIdToUse}`);
  };

  const handleAddStage = async () => {
    if (await Uservalidation('إضافة مرحلة رئيسية', projectId)) {
      setShowAddStageModal(true);
    }
  };

  const handleDeleteStage = async (stage: Stage) => {
    if (await Uservalidation('حذف مرحلة رئيسية', projectId)) {
      setSelectedStage(stage);
      setShowDeleteModal(true);
    }
  };

  const handleQualityEvaluation = () => {
    if (project?.Linkevaluation) {
      window.open(project.Linkevaluation, '_blank');
    } else {
      alert(t('projectDetails.noQualityLink'));
    }
  };

  const confirmAddStage = async () => {
    if (!stageData.StageName.trim()) {
      alert(t('projectDetails.stageNameRequired'));
      return;
    }

    try {
      await addStage(
        projectId,
        stageData.StageName.trim(),
        stageData.Days,
        stageData.Ratio,
        stageData.attached
      );
      setShowAddStageModal(false);
      setStageData({
        StageName: '',
        Days: 0,
        Ratio: 0,
        attached: ''
      });
    } catch (error) {
      console.error(t('projectDetails.addStageError'), error);
    }
  };

  const updateDays = (type: 'plus' | 'minus') => {
    setStageData(prev => ({
      ...prev,
      Days: type === 'plus' ? prev.Days + 1 : prev.Days > 0 ? prev.Days - 1 : 0
    }));
  };

  const confirmDeleteStage = async () => {
    if (!selectedStage) return;

    try {
      await deleteStage(Number(projectId), Number(selectedStage.StageID));
      setShowDeleteModal(false);
      setSelectedStage(null);
    } catch (error) {
      console.error(t('projectDetails.deleteStageError'), error);
    }
  };

  const isProjectStarted = project?.ProjectStartdate !== null;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">{t('projectDetails.loadingData')}</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
          >
            {t('projectDetails.retryLoad')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title={project?.Nameproject || t('projectDetails.project')}
          backButton={
            <button onClick={handleBack} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" aria-label={t('projectDetails.backToProject')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          }
          actions={
            <div className="flex items-center gap-4 sm:gap-6">
              {hasPermission('تعديل بيانات المشروع') && (
                <button onClick={handleEdit} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" aria-label={t('projectDetails.editProject')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              <button onClick={handleArchives} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" aria-label={t('projectDetails.archiveLabel')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="2" y="4" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="9" y="12" width="6" height="2" rx="1" fill="currentColor"/>
                  <line x1="7" y1="16" x2="17" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="7" y1="18" x2="14" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {hasPermission('انشاء عمليات مالية') && (
                <button onClick={handleFinance} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" aria-label={t('projectDetails.financeLabel')}>
                  <svg width="18" height="18" viewBox="0 0 1124.14 1256.39" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" fill="currentColor"/>
                    <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z" fill="currentColor"/>
                  </svg>
                </button>
              )}
              {hasPermission('إنشاء طلبات') && (
                <button onClick={handleRequests} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" aria-label={t('projectDetails.requestsLabel')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </button>
              )}
            </div>
          }
        />
      }
    >
      <ContentSection>
        <ProjectHeader
          project={project}
          onBack={handleBack}
          onEdit={handleEdit}
          onArchives={handleArchives}
          onFinance={handleFinance}
          onRequests={handleRequests}
          onStartProject={handleStartProject}
          isStarted={isProjectStarted}
          user={user}
          showTopNav={false}
          showFinancialData={showFinancialData}
          t={t}
          isRTL={isRTL}
        />

      {/* Pull to refresh indicator */}
      {refreshing && (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-600">{t('projectDetails.refreshing')}</p>
        </div>
      )}

      {/* Action Buttons - Show for employees only like mobile app (PageHomeProject.tsx line 338) */}
      <EmployeeOnly>
        <div className="flex justify-between items-center p-4">
          {/* Create Stage Button */}
          <PermissionBasedVisibility permission="إضافة مرحلة رئيسية">
            <button
              onClick={handleAddStage}
              className="text-blue-600 hover:underline font-ibm-arabic-semibold bg-transparent p-0"
              style={{ fontSize: scale(14) }}
            >
              {t('projectDetails.createStage')}
            </button>
          </PermissionBasedVisibility>

          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={handleQualityEvaluation}
              className="text-blue-600 hover:underline font-ibm-arabic-semibold bg-transparent p-0"
              style={{ fontSize: scale(14), direction: dir as 'rtl' | 'ltr', textAlign: isRTL ? 'right' : 'left' }}
            >
              {t('projectDetails.qualityEvaluation')}
            </button>

            {/* Settings button */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsModal((v)=>!v)}
                className="p-3"
                title={t('projectDetails.more')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {showSettingsModal && (
                <div
                  className="fixed inset-0 z-[1000] bg-black/40"
                  onClick={() => setShowSettingsModal(false)}
                  style={{ padding: '20px' }}
                >
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-lg overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      direction: dir as 'rtl' | 'ltr',
                      width: 'min(24rem, 92vw)',
                      maxHeight: '85vh',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Header */}
                    <div
                      className="border-b border-gray-200"
                      style={{
                        padding: '20px 24px'
                      }}
                    >
                      <h3
                        className="font-ibm-arabic-bold text-gray-900"
                        style={{
                          fontSize: '18px',
                          textAlign: isRTL ? 'right' : 'left'
                        }}
                      >
                        {t('projectDetails.settings')}
                      </h3>
                    </div>

                    {/* Options */}
                    <div
                      style={{
                        padding: '12px 0',
                        overflowY: 'auto',
                        flex: 1
                      }}
                    >
                      {/* 1. إنشاء مرحلة */}
                      <button
                        className="w-full hover:bg-gray-50 flex items-center font-ibm-arabic-semibold transition-colors"
                        style={{
                          fontSize: '15px',
                          backgroundColor: 'transparent',
                          padding: '16px 24px',
                          textAlign: isRTL ? 'right' : 'left',
                          direction: dir as 'rtl' | 'ltr',
                          gap: '14px',
                          justifyContent: 'flex-start'
                        }}
                        onClick={async () => {
                          if (await Uservalidation('إضافة مرحلة رئيسية', projectId)) {
                            setShowAddStageModal(true);
                          }
                          setShowSettingsModal(false);
                        }}
                      >
                        <svg width="22" height="22" viewBox="0 0 15 16" fill="none" style={{ flexShrink: 0 }}>
                          <path d="M7.5 3V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2.5 8H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          {t('projectDetails.createStage')}
                        </span>
                      </button>

                      {/* 2. ترتيب المراحل */}
                      <button
                        className="w-full hover:bg-gray-50 flex items-center font-ibm-arabic-semibold transition-colors"
                        style={{
                          fontSize: '15px',
                          backgroundColor: 'transparent',
                          padding: '16px 24px',
                          textAlign: isRTL ? 'right' : 'left',
                          direction: dir as 'rtl' | 'ltr',
                          gap: '14px',
                          justifyContent: 'flex-start'
                        }}
                        onClick={async () => {
                          if (await Uservalidation('ترتيب المراحل', projectId)) {
                            try {
                              const res = await axiosInstance.get(`/brinshCompany/v2/BringStage`, {
                                params: { ProjectID: projectId, type: 'update', number: 0 },
                                headers: { Authorization: `Bearer ${user.accessToken}` },
                              });
                              const stageall = [...(stages || []), ...(res.data?.data || [])];
                              const verifyDone = stageall.find((pic: any) => pic.Done === 'true');
                              if (!verifyDone) {
                                setShowReorderModal(true);
                              } else {
                                Tostget(t('projectDetails.cannotReorderStages'));
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }
                          setShowSettingsModal(false);
                        }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                          <path d="M14.0737 3.88545C14.8189 3.07808 15.1915 2.6744 15.5874 2.43893C16.5427 1.87076 17.7191 1.85309 18.6904 2.39232C19.0929 2.6158 19.4769 3.00812 20.245 3.79276C21.0131 4.5774 21.3972 4.96972 21.6159 5.38093C22.1438 6.37312 22.1265 7.57479 21.5703 8.5507C21.3398 8.95516 20.9446 9.33578 20.1543 10.097L10.7506 19.1543C9.25288 20.5969 8.504 21.3182 7.56806 21.6837C6.63212 22.0493 5.6032 22.0224 3.54536 21.9686L3.26538 21.9613C2.63891 21.9449 2.32567 21.9367 2.14359 21.73C1.9615 21.5234 1.98636 21.2043 2.03608 20.5662L2.06308 20.2197C2.20301 18.4235 2.27297 17.5255 2.62371 16.7182C2.97444 15.9109 3.57944 15.2555 4.78943 13.9445L14.0737 3.88545Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                          <path d="M13 4L20 11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                          <path d="M14 22H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          {t('projectDetails.reorderStages')}
                        </span>
                      </button>

                      {/* 3. اضافة مستخدمين - Matching mobile app PageHomeProject.tsx line 192-199 */}
                      {/* تم تغييره ليفتح صفحة كاملة بدلاً من مودال - مطابق للتطبيق المحمول PageUsers.tsx */}
                      <button
                        className="w-full hover:bg-gray-50 flex items-center font-ibm-arabic-semibold transition-colors"
                        style={{
                          fontSize: '15px',
                          backgroundColor: 'transparent',
                          padding: '16px 24px',
                          textAlign: isRTL ? 'right' : 'left',
                          direction: dir as 'rtl' | 'ltr',
                          gap: '14px',
                          justifyContent: 'flex-start'
                        }}
                        onClick={async () => {
                          const ok = await Uservalidation('إضافة مستخدمين للمشروع', projectId);
                          if (!ok) { setShowSettingsModal(false); return; }
                          // فتح صفحة أعضاء المشروع بدلاً من المودال
                          // استخدام IDcompanySub من بيانات المشروع (مطابق للتطبيق المحمول)
                          const branchId = project?.IDcompanySub || project?.IDCompanySub || user?.data?.IDCompanyBransh || '';
                          router.push(`/project/${projectId}/members?name=${encodeURIComponent(project?.Nameproject || 'المشروع')}&branchId=${branchId}`);
                          setShowSettingsModal(false);
                        }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <line x1="19" y1="8" x2="19" y2="14"/>
                          <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                        <span style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          {t('projectDetails.addUsers')}
                        </span>
                      </button>

                      {/* 4. تعديل تاريخ بدء المشروع - Matching mobile app PageHomeProject.tsx line 223-232 */}
                      <button
                        className="w-full hover:bg-gray-50 flex items-center font-ibm-arabic-semibold transition-colors"
                        style={{
                          fontSize: '15px',
                          backgroundColor: 'transparent',
                          padding: '16px 24px',
                          textAlign: isRTL ? 'right' : 'left',
                          direction: dir as 'rtl' | 'ltr',
                          gap: '14px',
                          justifyContent: 'flex-start'
                        }}
                        onClick={async () => {
                          if (await Uservalidation('تعديل تاريخ بدء المشروع', projectId)) {
                            const verifyDone = stages?.find((pic: any) => pic.Done === 'true');
                            if (!verifyDone) {
                              setShowEditStartDateModal(true);
                            } else {
                              Tostget(t('projectDetails.cannotEditStartDate'));
                            }
                          }
                          setShowSettingsModal(false);
                        }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                          <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          {t('projectDetails.editStartDate')}
                        </span>
                      </button>

                      {/* 5. تعديل بيانات المشروع */}
                      <button
                        className="w-full hover:bg-gray-50 flex items-center font-ibm-arabic-semibold transition-colors"
                        style={{
                          fontSize: '15px',
                          backgroundColor: 'transparent',
                          padding: '16px 24px',
                          textAlign: isRTL ? 'right' : 'left',
                          direction: dir as 'rtl' | 'ltr',
                          gap: '14px',
                          justifyContent: 'flex-start'
                        }}
                        onClick={async () => {
                          if (await Uservalidation('تعديل بيانات المشروع', projectId)) {
                            handleEdit();
                          }
                          setShowSettingsModal(false);
                        }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ flexShrink: 0 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          {t('projectDetails.editProjectData')}
                        </span>
                      </button>

                      {/* 6. حذف المشروع */}
                      <button
                        className="w-full hover:bg-red-50 flex items-center font-ibm-arabic-semibold transition-colors text-red-600"
                        style={{
                          fontSize: '15px',
                          backgroundColor: 'transparent',
                          padding: '16px 24px',
                          textAlign: isRTL ? 'right' : 'left',
                          direction: dir as 'rtl' | 'ltr',
                          gap: '14px',
                          justifyContent: 'flex-start'
                        }}
                        onClick={async () => {
                          if (await Uservalidation('حذف مشروع', projectId)) {
                            setShowDeleteProjectModal(true);
                          }
                          setShowSettingsModal(false);
                        }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ flexShrink: 0 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span style={{ textAlign: isRTL ? 'right' : 'left' }}>
                          {t('projectDetails.deleteProject')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </EmployeeOnly>

      {/* Stages Grid */}
      <div className="pb-8">
        {/* Spacer before stages */}
        <div className="h-4"></div>
        {/* Quick Stats + Sorting */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Stats Cards - Direct on Page Background */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {/* Total Stages Card */}
            <div className="p-3 rounded-xl border shadow-sm text-center overflow-hidden"
                 style={{
                   borderColor: 'var(--color-primary)',
                   backgroundColor: 'var(--color-primary)' + '20'
                 }}>
              <div className="text-xs font-ibm-arabic-medium mb-1" style={{ color: 'var(--color-text-primary)', direction: dir as 'rtl' | 'ltr', textAlign: isRTL ? 'center' : 'center' }}>{t('projectDetails.totalStages')}</div>
              <div className="text-lg font-ibm-arabic-bold" style={{ color: 'var(--color-text-primary)' }}>{stages?.length || 0}</div>
            </div>

            {/* Open/Completed Card */}
            <div className="p-3 rounded-xl border shadow-sm text-center overflow-hidden"
                 style={{
                   borderColor: 'var(--color-primary)',
                   backgroundColor: 'var(--color-primary)' + '20'
                 }}>
              <div className="text-xs font-ibm-arabic-medium mb-1" style={{ color: 'var(--color-text-primary)', direction: dir as 'rtl' | 'ltr', textAlign: isRTL ? 'center' : 'center' }}>{t('projectDetails.openCompleted')}</div>
              <div className="text-lg font-ibm-arabic-bold" style={{ color: 'var(--color-text-primary)' }}>
                {(stages?.length || 0) - (stages?.filter(s => s.Done === 'true').length || 0)} / {(stages?.filter(s => s.Done === 'true').length || 0)}
              </div>
            </div>
          </div>

          {/* Sort Control - Matching Page Design */}
          <div className="flex items-center gap-3 justify-center">
            <label className="text-sm font-ibm-arabic-medium" style={{ color: 'var(--color-text-primary)', direction: dir as 'rtl' | 'ltr', textAlign: isRTL ? 'right' : 'left' }}>{t('projectDetails.sort')}:</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="rounded-lg px-3 py-1 text-sm font-ibm-arabic-medium focus:outline-none focus:ring-2 focus:border-transparent"
              style={{
                border: '1px solid var(--color-primary)',
                backgroundColor: 'var(--color-card-background)',
                color: 'var(--color-text-primary)',
                direction: dir as 'rtl' | 'ltr',
                textAlign: isRTL ? 'right' : 'left'
              }}
              dir={dir as 'rtl' | 'ltr'}
            >
              <option value="default">{t('projectDetails.sortDefault')}</option>
              <option value="status">{t('projectDetails.sortStatus')}</option>
              <option value="progress">{t('projectDetails.sortProgress')}</option>
              <option value="name">{t('projectDetails.sortName')}</option>
            </select>
          </div>
        </div>

        {/* Spacer between stats and stages grid */}
        <div className="h-4 sm:h-5 lg:h-6"></div>

        {loading && stages.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : stages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 font-ibm-arabic-medium mb-6 text-lg" style={{ direction: dir as 'rtl' | 'ltr', textAlign: isRTL ? 'center' : 'center' }}>{t('projectDetails.noStages')}</p>
            {user?.data?.jobdiscrption === 'موظف' && (
              <button
                onClick={handleAddStage}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-ibm-arabic-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                {t('projectDetails.addFirstStage')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 list-container">
              {sortedStages.map((stage, index) => (
                <div key={`${stage.StageCustID || stage.StageID}-${index}`} className="h-full">
                  <StageCard
                    stage={stage}
                    onPress={() => handleStagePress(stage)}
                    onDelete={() => handleDeleteStage(stage)}
                  />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreStages && (
              <div className="mt-10 text-center">

                <button
                  onClick={() => loadMoreStages(projectId)}
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-ibm-arabic-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري التحميل...</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14m-7-7h14"/>
                      </svg>
                      <span>تحميل المزيد</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Stage Modal */}
      {showAddStageModal && (
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
                    <path d="M12 5v14M5 12h14" stroke="var(--theme-success, #10b981)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3
                  className="font-bold"
                  style={{
                    fontSize: '18px',
                    fontFamily: 'var(--font-ibm-arabic-bold)',
                    color: 'var(--theme-text-primary)',
                    lineHeight: 1.4,
                    direction: dir as 'rtl' | 'ltr',
                    textAlign: isRTL ? 'center' : 'center'
                  }}
                >
                  {t('projectModals.createStage.title')}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddStageModal(false);
                  setStageData({
                    StageName: '',
                    Days: 0,
                    Ratio: 0,
                    attached: ''
                  });
                }}
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
              {/* Days Counter */}
              <div
                className="flex justify-between items-center rounded-xl mb-4"
                style={{
                  backgroundColor: 'var(--theme-surface-secondary)',
                  padding: '16px',
                  border: '1px solid var(--theme-border)'
                }}
              >
                <div>
                  <label
                    className="block mb-1"
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-ibm-arabic-medium)',
                      color: 'var(--theme-text-secondary)',
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {t('projectModals.createStage.days')}
                  </label>
                  <div
                    style={{
                      fontSize: '18px',
                      fontFamily: 'var(--font-ibm-arabic-semibold)',
                      color: 'var(--theme-text-primary)',
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {stageData.Days} <span style={{ fontSize: '14px' }}>{t('projectModals.createStage.day')}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => updateDays('plus')}
                    className="rounded transition-all duration-200 hover:scale-110"
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--theme-card-background)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text-primary)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 15l-6-6-6 6"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => updateDays('minus')}
                    className="rounded transition-all duration-200 hover:scale-110"
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--theme-card-background)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text-primary)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Stage Name and Ratio in one row */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label
                    className="block mb-2"
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-ibm-arabic-medium)',
                      color: 'var(--theme-text-secondary)',
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {t('projectModals.createStage.stageName')}
                  </label>
                  <input
                    type="text"
                    value={stageData.StageName}
                    onChange={(e) => setStageData(prev => ({ ...prev, StageName: e.target.value }))}
                    className="w-full rounded-xl transition-all duration-200"
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--theme-surface-secondary)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text-primary)',
                      fontSize: '14px',
                      fontFamily: 'var(--font-ibm-arabic-medium)',
                      textAlign: isRTL ? 'right' : 'left',
                      direction: dir as 'rtl' | 'ltr'
                    }}
                    placeholder={t('projectModals.createStage.stageName')}
                    dir={dir as 'rtl' | 'ltr'}
                  />
                </div>

                <div className="flex-1">
                  <label
                    className="block mb-2"
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-ibm-arabic-medium)',
                      color: 'var(--theme-text-secondary)',
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {t('projectModals.createStage.ratio')}
                  </label>
                  <input
                    type="number"
                    value={stageData.Ratio}
                    onChange={(e) => setStageData(prev => ({ ...prev, Ratio: Number(e.target.value) || 0 }))}
                    className="w-full rounded-xl transition-all duration-200"
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--theme-surface-secondary)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text-primary)',
                      fontSize: '14px',
                      fontFamily: 'var(--font-ibm-arabic-medium)',
                      textAlign: isRTL ? 'right' : 'left',
                      direction: dir as 'rtl' | 'ltr'
                    }}
                    placeholder={t('projectModals.createStage.ratio')}
                    min="0"
                    dir={dir as 'rtl' | 'ltr'}
                  />
                </div>
              </div>

              {/* External Link */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  className="block mb-2"
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-ibm-arabic-medium)',
                    color: 'var(--theme-text-secondary)',
                    direction: dir as 'rtl' | 'ltr',
                    textAlign: isRTL ? 'right' : 'left'
                  }}
                >
                  {t('projectModals.createStage.externalGuide')}
                </label>
                <input
                  type="text"
                  value={stageData.attached}
                  onChange={(e) => setStageData(prev => ({ ...prev, attached: e.target.value }))}
                  className="w-full rounded-xl transition-all duration-200"
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--theme-surface-secondary)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-ibm-arabic-medium)',
                    textAlign: isRTL ? 'right' : 'left',
                    direction: dir as 'rtl' | 'ltr'
                  }}
                  placeholder={t('projectModals.createStage.externalLink')}
                  dir={dir as 'rtl' | 'ltr'}
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
                margin: '8px 0',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px'
              }}
            >
              <button
                onClick={confirmAddStage}
                disabled={!stageData.StageName.trim() || loading}
                className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
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
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t('projectModals.createStage.adding')}</span>
                  </>
                ) : (
                  t('projectModals.createStage.create')
                )}
              </button>
              <button
                onClick={() => {
                  setShowAddStageModal(false);
                  setStageData({
                    StageName: '',
                    Days: 0,
                    Ratio: 0,
                    attached: ''
                  });
                }}
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
                {t('projectModals.createStage.cancel')}
              </button>
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


      {/* Edit Start Date Modal */}
      {showEditStartDateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ direction: dir as 'rtl' | 'ltr' }}>
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
                  style={{ backgroundColor: 'var(--theme-warning-alpha, rgba(245, 158, 11, 0.1))' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2"/>
                  </svg>
                </div>
                <h3
                  className="font-bold"
                  style={{
                    fontSize: '18px',
                    fontFamily: 'var(--font-ibm-arabic-bold)',
                    color: 'var(--theme-text-primary)',
                    lineHeight: 1.4,
                    textAlign: 'center'
                  }}
                >
                  {t('projectDetails.editStartDateTitle')}
                </h3>
              </div>
              <button
                onClick={()=>setShowEditStartDateModal(false)}
                className="absolute top-4 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
                style={{
                  padding: '10px',
                  backgroundColor: 'var(--theme-surface-secondary)',
                  border: '1px solid var(--theme-border)',
                  color: 'var(--theme-text-secondary)',
                  [isRTL ? 'right' : 'left']: '16px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '16px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label
                  className="block"
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-ibm-arabic-medium)',
                    color: 'var(--theme-text-primary)',
                    marginBottom: '8px',
                    textAlign: isRTL ? 'right' : 'left'
                  }}
                >
                  {t('projectDetails.selectStartDate')}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e)=>setStartDate(e.target.value)}
                  className="w-full rounded-xl transition-all duration-200 focus:scale-[1.02]"
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--theme-input-background)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                    fontSize: '16px',
                    fontFamily: 'var(--font-ibm-arabic-medium)',
                    direction: dir as 'rtl' | 'ltr'
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
                margin: '8px 0',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px',
                flexDirection: isRTL ? 'row-reverse' : 'row'
              }}
            >
              <button
                onClick={async ()=>{
                  try {
                    await axiosInstance.put('/brinshCompany/UpdateStartdate', {
                      data: { ProjectID: projectId, ProjectStartdate: startDate }
                    }, { headers: { Authorization: `Bearer ${user?.accessToken}` } });
                    Tostget(t('projectDetails.startDateUpdated'));
                    setShowEditStartDateModal(false);
                    await fetchProjectDetails(projectId);
                  } catch (e) {
                    console.error(e);
                    Tostget(t('projectDetails.startDateUpdateFailed'));
                  }
                }}
                className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--theme-warning)',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: 'var(--font-ibm-arabic-semibold)',
                  border: 'none',
                  width: '45%'
                }}
              >
                {t('projectDetails.save')}
              </button>
              <button
                onClick={()=>setShowEditStartDateModal(false)}
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
                {t('projectDetails.cancel')}
              </button>
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



      {/* Reorder Stages Modal - draggable */}
      <ReorderStagesModal
        isOpen={showReorderModal}
        onClose={() => setShowReorderModal(false)}
        stages={stages || []}
        onSaved={async () => { await fetchStages(projectId, 0, 'update'); }}
      />

      {/* Add Project Users Modal - search + permissions */}
      <AddProjectUsersModal
        isOpen={showAddUsersModal}
        onClose={() => setShowAddUsersModal(false)}
        projectId={projectId}
        branchId={(project as any)?.IDCompanyBransh} // تمرير branchId - مطابق للتطبيق المحمول
        onSaved={async () => { /* no-op */ }}
      />

      {/* Delete Stage Modal - Enhanced Design */}
      {showDeleteModal && selectedStage && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
          style={{ zIndex: 1050 }}
        >
          <div
            className="w-full shadow-2xl relative animate-in fade-in zoom-in duration-200"
            style={{
              backgroundColor: 'var(--theme-card-background)',
              border: '1px solid var(--theme-border)',
              borderRadius: `${scale(20)}px`,
              maxWidth: `${scale(450)}px`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Header with Icon */}
            <div
              className="text-center"
              style={{
                borderBottom: '1px solid var(--theme-border)',
                background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
                paddingLeft: scale(24),
                paddingRight: scale(24),
                paddingTop: scale(24),
                paddingBottom: scale(20),
                borderTopLeftRadius: `${scale(20)}px`,
                borderTopRightRadius: `${scale(20)}px`
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                {/* Warning Icon */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '2px solid rgba(239, 68, 68, 0.2)'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9V13" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M12 17H12.01" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
              <h3
                className="font-bold"
                style={{
                  fontSize: `${scale(20 + size)}px`,
                  fontFamily: fonts.IBMPlexSansArabicBold,
                  lineHeight: 1.4,
                  color: 'var(--theme-text-primary)'
                }}
              >
                حذف المرحلة الرئيسية
              </h3>
            </div>

            {/* Content */}
            <div style={{
              paddingLeft: scale(24),
              paddingRight: scale(24),
              paddingTop: scale(20),
              paddingBottom: scale(20)
            }}>
              {/* Stage Name Badge */}
              <div
                className="mb-4 p-3 rounded-xl text-center"
                style={{
                  backgroundColor: 'var(--theme-surface-secondary)',
                  border: '1px solid var(--theme-border)'
                }}
              >
                <p
                  className="font-semibold"
                  style={{
                    fontSize: `${scale(16 + size)}px`,
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    color: 'var(--theme-text-primary)',
                    wordBreak: 'break-word'
                  }}
                >
                  {selectedStage.StageName}
                </p>
              </div>

              {/* Warning Message */}
              <p
                className="text-center"
                style={{
                  fontSize: `${scale(14 + size)}px`,
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  lineHeight: 1.6,
                  color: 'var(--theme-text-secondary)'
                }}
              >
                هل أنت متأكد من حذف هذه المرحلة؟
                <br />
                <span style={{ color: '#ef4444', fontFamily: fonts.IBMPlexSansArabicBold }}>
                  هذا الإجراء لا يمكن التراجع عنه
                </span>
              </p>
            </div>

            {/* Action Buttons */}
            <div
              className="flex gap-3 justify-center items-center"
              style={{
                borderTop: '1px solid var(--theme-border)',
                background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
                paddingLeft: scale(24),
                paddingRight: scale(24),
                paddingTop: scale(20),
                paddingBottom: scale(20),
                borderBottomLeftRadius: `${scale(20)}px`,
                borderBottomRightRadius: `${scale(20)}px`
              }}
            >
              {/* Delete Button */}
              <button
                onClick={confirmDeleteStage}
                disabled={loading}
                className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontSize: scale(15),
                  color: '#ffffff',
                  backgroundColor: '#ef4444',
                  fontFamily: fonts.IBMPlexSansArabicBold,
                  border: '2px solid #ef4444',
                  padding: `${scale(14)}px ${scale(20)}px`,
                  minHeight: scale(50),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: scale(8),
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                {loading ? (
                  <>
                    <div
                      className="border-2 border-white border-t-transparent rounded-full animate-spin"
                      style={{ width: scale(18), height: scale(18) }}
                    />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>حذف المرحلة</span>
                  </>
                )}
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStage(null);
                }}
                disabled={loading}
                className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                style={{
                  fontSize: scale(15),
                  color: 'var(--theme-text-primary)',
                  backgroundColor: 'var(--theme-surface-secondary)',
                  fontFamily: fonts.IBMPlexSansArabicBold,
                  border: '2px solid var(--theme-border)',
                  padding: `${scale(14)}px ${scale(20)}px`,
                  minHeight: scale(50),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteProjectModal && (
        <div className="fixed inset-0 z-[1001] bg-black/40 flex items-center justify-center p-4" style={{ direction: dir as 'rtl' | 'ltr' }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-ibm-arabic-bold text-gray-900" style={{ fontSize: scale(18), textAlign: isRTL ? 'right' : 'left' }}>
                {t('projectDetails.deleteProjectTitle')}
              </h3>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="flex items-start gap-4 mb-4" style={{ flexDirection: isRTL ? 'row' : 'row' }}>
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-ibm-arabic-semibold text-gray-900 mb-2" style={{ fontSize: scale(15), textAlign: isRTL ? 'right' : 'left' }}>
                    {t('projectDetails.deleteProjectConfirm')}
                  </p>
                  <p className="font-ibm-arabic-regular text-gray-600" style={{ fontSize: scale(13), textAlign: isRTL ? 'right' : 'left' }}>
                    {t('projectDetails.deleteProjectWarning')}
                  </p>
                  {project && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="font-ibm-arabic-medium text-gray-700" style={{ fontSize: scale(13), textAlign: isRTL ? 'right' : 'left' }}>
                        {t('projectDetails.project')}: <span className="font-ibm-arabic-bold">{project.Nameproject}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 rounded-b-2xl" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <button
                onClick={() => setShowDeleteProjectModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-ibm-arabic-semibold disabled:opacity-50"
                style={{ fontSize: scale(14) }}
              >
                {t('projectDetails.cancel')}
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await axiosInstance.delete(`/brinshCompany/DeletProjectwithDependencies`, {
                      params: { id: projectId },
                      headers: { Authorization: `Bearer ${user.accessToken}` }
                    });
                    if (res.status === 200) {
                      Tostget(t('projectDetails.projectDeleted'));
                      setShowDeleteProjectModal(false);
                      router.back();
                    }
                  } catch (e: any) {
                    console.error(e);
                    Tostget(e.response?.data?.error || t('projectDetails.projectDeleteFailed'));
                  }
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-ibm-arabic-bold disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontSize: scale(14) }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('projectDetails.deleting')}
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t('projectDetails.deleteProject')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ContentSection>
    </ResponsiveLayout>
  );
};

export default ProjectDetailsPage;