'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { scale } from '@/utils/responsiveSize';
import useValidityUser from '@/hooks/useValidityUser';
import useProjectDetails, { Stage, ProjectDetails } from '@/hooks/useProjectDetails';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import ReorderStagesModal from '@/components/project/ReorderStagesModal';
import AddProjectUsersModal from '@/components/project/AddProjectUsersModal';
import { EmployeeOnly, PermissionBasedVisibility } from '@/components/auth/PermissionGuard';
import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';


// Enhanced Project Header with proper data display
const ProjectHeader = ({
  project,
  onBack,
  onEdit,
  onNotifications,
  onArchives,
  onFinance,
  onRequests,
  onStartProject,
  isStarted,
  user,
  showTopNav = true,
}: {
  project: ProjectDetails | null;
  onBack: () => void;
  onEdit: () => void;
  onNotifications: () => void;
  onArchives: () => void;
  onFinance: () => void;
  onRequests: () => void;
  onStartProject: () => void;
  isStarted: boolean;
  user: any;
  showTopNav?: boolean;
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

          <button onClick={onNotifications} className="p-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
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

          {/* Start Project Button */}
          {!isStarted && user?.data?.jobdiscrption === 'موظف' && (
            <button
              onClick={onStartProject}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
              style={{ fontSize: scale(12) }}
            >
              بدء تنفيذ المشروع
            </button>
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
                إجمالي الأيام المتبقية
              </p>
              <div className="text-center">
                <span
                  className={`font-ibm-arabic-bold ${
                    isOverdue ? 'text-red-600' : 'text-blue-600'
                  }`}
                  style={{ fontSize: scale(20), fontFeatureSettings: '"tnum"' }}
                >
                  {remainingDays}
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 sm:p-3 lg:p-4 overflow-hidden">
            <div className="rounded-lg p-2 sm:p-3 lg:p-4 text-center border border-green-200 bg-green-50/60 shadow-sm overflow-hidden">
              <p className="text-green-700 font-ibm-arabic-medium mb-1 sm:mb-2" style={{ fontSize: scale(10) }}>
                التكلفة اليومية
              </p>
              <p className="font-ibm-arabic-bold text-green-800" style={{ fontSize: scale(12), fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(project.ConstCompany || 0)}
                <span className="text-xs mr-1">ر.س</span>
              </p>
            </div>
          </div>

          {/* Days Count Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 sm:p-3 lg:p-4 overflow-hidden">
            <div className="rounded-lg p-2 sm:p-3 lg:p-4 text-center border border-blue-200 bg-blue-50/60 shadow-sm overflow-hidden">
              <p className="text-blue-700 font-ibm-arabic-medium mb-1 sm:mb-2" style={{ fontSize: scale(10) }}>
                عدد الأيام
              </p>
              <p className="font-ibm-arabic-bold text-blue-800" style={{ fontSize: scale(12), fontFeatureSettings: '"tnum"' }}>
                {project.DaysUntiltoday || 0}
              </p>
            </div>
          </div>

          {/* Total Cost Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 sm:p-3 lg:p-4 overflow-hidden">
            <div className="rounded-lg p-2 sm:p-3 lg:p-4 text-center border border-orange-200 bg-orange-50/60 shadow-sm overflow-hidden">
              <p className="text-orange-700 font-ibm-arabic-medium mb-1 sm:mb-2" style={{ fontSize: scale(10) }}>
                إجمالي التكلفة
              </p>
              <p className="font-ibm-arabic-bold text-orange-800" style={{ fontSize: scale(12), fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(project.TotalcosttothCompany || 0).slice(0, 8)}
                {String(project.TotalcosttothCompany).length > 8 && '..'}
                <span className="text-xs mr-1">ر.س</span>
              </p>
            </div>
          </div>
        </div>

        {/* Spacer between stats and actions (slightly reduced) */}
        <div className="h-4 sm:h-5 lg:h-6"></div>

        {/* Actions Grid - Always 3 columns */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
          {/* Requests Button Container */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1 sm:p-2 lg:p-3 overflow-hidden">
            <button
              onClick={onRequests}
              className="group w-full bg-gray-50/50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50/30 transition-all p-1 sm:p-2 lg:p-3 flex flex-col items-center"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-blue-50 rounded-full flex items-center justify-center mb-1 group-hover:bg-blue-100 transition-colors">
                <svg width="12" height="12" className="sm:w-3 sm:h-3 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none" stroke="#2117fb" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs font-ibm-arabic-semibold text-gray-900 group-hover:text-blue-600" style={{ fontSize: scale(9) }}>طلبات</span>
            </button>
          </div>

          {/* Finance Button Container */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1 sm:p-2 lg:p-3 overflow-hidden">
            <button
              onClick={onFinance}
              className="group w-full bg-gray-50/50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-green-200 hover:bg-green-50/30 transition-all p-1 sm:p-2 lg:p-3 flex flex-col items-center"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-green-50 rounded-full flex items-center justify-center mb-1 group-hover:bg-green-100 transition-colors">
                <svg width="12" height="12" className="sm:w-3 sm:h-3 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-xs font-ibm-arabic-semibold text-gray-900 group-hover:text-green-600" style={{ fontSize: scale(9) }}>مالية</span>
            </button>
          </div>

          {/* Archives Button Container */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1 sm:p-2 lg:p-3 overflow-hidden">
            <button
              onClick={onArchives}
              className="group w-full bg-gray-50/50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-200 hover:bg-orange-50/30 transition-all p-1 sm:p-2 lg:p-3 flex flex-col items-center"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-orange-50 rounded-full flex items-center justify-center mb-1 group-hover:bg-orange-100 transition-colors">
                <svg width="12" height="12" className="sm:w-3 sm:h-3 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8l6 6m0 0l6-6m-6 6V3" />
                </svg>
              </div>
              <span className="text-xs font-ibm-arabic-semibold text-gray-900 group-hover:text-orange-600" style={{ fontSize: scale(9) }}>أرشيف</span>
            </button>
          </div>
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
  const isCompleted = stage.Done === 'true';
  const progress = stage.rate || 0;

  return (
    <div className="group relative h-full bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
      {/* Subtle top cover */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-blue-50/70 to-transparent pointer-events-none" />

      <div className="relative p-5 pt-6 flex flex-col items-center">
        {/* Title centered above progress */}
        <div className="w-full mb-3 text-center px-2">
          <h3
            className="font-ibm-arabic-bold text-gray-900 text-base"
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
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-ibm-arabic-medium ${
              isCompleted ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}
          >
            {isCompleted ? 'تم إنجاز' : 'غير منجز'}
          </span>
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

        <div className="text-xs text-gray-500 mb-1">نسبة الإنجاز</div>

        {/* Delete Button - Only if has permission */}
        {hasPermission('حذف مرحلة رئيسية') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-3 left-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="حذف المرحلة"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
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

  const { user } = useSelector((state: any) => state.user || {});
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
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [newStageName, setNewStageName] = useState('');
  const [newStageDays, setNewStageDays] = useState('');
  const [startDate, setStartDate] = useState<string>('');

  const [sortOption, setSortOption] = useState<'default' | 'progress' | 'name' | 'status'>('default');

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

  const handleNotifications = () => {
    router.push(`/project/${projectId}/notifications`);
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
    // Check if user has permission to start project (using validation function like in mobile app)
    const hasPermission = await Uservalidation('تعديل بيانات المشروع', projectId);
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
        Tostget('تم بدء تنفيذ المشروع بنجاح');
        // Refresh project data
        await fetchProjectDetails(projectId);
      }
    } catch (error) {
      console.error('Error starting project:', error);
      Tostget('خطأ في بدء تنفيذ المشروع');
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
      alert('لايوجد هناك رابط للانتقال اليه');
    }
  };

  const confirmAddStage = async () => {
    if (!newStageName.trim() || !newStageDays.trim()) return;

    try {
      await addStage(projectId, newStageName.trim(), parseInt(newStageDays));
      setShowAddStageModal(false);
      setNewStageName('');
      setNewStageDays('');
    } catch (error) {
      console.error('خطأ في إضافة المرحلة:', error);
    }
  };

  const confirmDeleteStage = async () => {
    if (!selectedStage) return;

    try {
      await deleteStage(Number(projectId), Number(selectedStage.StageID));
      setShowDeleteModal(false);
      setSelectedStage(null);
    } catch (error) {
      console.error('خطأ في حذف المرحلة:', error);
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
          <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
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
          title={project?.Nameproject || 'المشروع'}
          backButton={
            <button onClick={handleBack} className="p-2 hover:bg-gray-50 rounded-lg" aria-label="الرجوع">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          }
          actions={
            <div className="flex items-center gap-4 sm:gap-6">
              {hasPermission('تعديل بيانات المشروع') && (
                <button onClick={handleEdit} className="p-2 hover:bg-gray-50 rounded-lg" aria-label="تعديل المشروع">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              <button onClick={handleArchives} className="p-2 hover:bg-gray-50 rounded-lg" aria-label="الأرشيف">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 7h18M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M5 7h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7z"></path>
                </svg>
              </button>
              {hasPermission('انشاء عمليات مالية') && (
                <button onClick={handleFinance} className="p-2 hover:bg-gray-50 rounded-lg" aria-label="المالية">
                  <span className="text-green-600 font-bold text-base">$</span>
                </button>
              )}
              {hasPermission('إنشاء طلبات') && (
                <button onClick={handleRequests} className="p-2 hover:bg-gray-50 rounded-lg" aria-label="الطلبات">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 00-2 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </button>
              )}
              <button onClick={handleNotifications} className="p-2 hover:bg-gray-50 rounded-lg" aria-label="الإشعارات">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </button>
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
          onNotifications={handleNotifications}
          onArchives={handleArchives}
          onFinance={handleFinance}
          onRequests={handleRequests}
          onStartProject={handleStartProject}
          isStarted={isProjectStarted}
          user={user}
          showTopNav={false}
        />

      {/* Pull to refresh indicator */}
      {refreshing && (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-600">جاري التحديث...</p>
        </div>
      )}

      {/* Action Buttons - Show for employees only like mobile app */}
      <EmployeeOnly>
        <PermissionBasedVisibility permission="إضافة مرحلة رئيسية">
          <div className="flex justify-between items-center p-4">
            <button
              onClick={handleAddStage}
              className="text-blue-600 hover:underline font-ibm-arabic-semibold bg-transparent p-0"
              style={{ fontSize: scale(14) }}
            >
              إنشاء مهمة
            </button>

          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={handleQualityEvaluation}
              className="text-blue-600 hover:underline font-ibm-arabic-semibold bg-transparent p-0"
              style={{ fontSize: scale(14) }}
            >
              تقييم الجودة
            </button>

            <div className="relative">
              <button
                onClick={() => setShowSettingsModal((v)=>!v)}
                className="p-3"
                title="المزيد"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {showSettingsModal && (
                <div className="fixed inset-0 z-[1000] bg-black/40" onClick={() => setShowSettingsModal(false)}>
                  <div
                    className="absolute left-1/2 top-1/2 w-[min(22rem,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-2 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full text-right px-4 py-2 hover:bg-gray-50"
                      onClick={async () => {
                        if (await Uservalidation('إضافة مرحلة رئيسية', projectId)) {
                          setShowAddStageModal(true);
                        }
                        setShowSettingsModal(false);
                      }}
                    >
                      إضافة مرحلة (مهمة)
                    </button>
                    <button
                      className="w-full text-right px-4 py-2 hover:bg-gray-50"
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
                              Tostget('لايمكن إعادة ترتيب المراحل فهناك مراحل قد انجزت');
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }
                        setShowSettingsModal(false);
                      }}
                    >
                      ترتيب المراحل
                    </button>
                    <button
                      className="w-full text-right px-4 py-2 hover:bg-gray-50"
                      onClick={async () => {
                        const ok = await Uservalidation('تعديل صلاحيات', 0);
                        if (!ok) { setShowSettingsModal(false); return; }
                        setShowAddUsersModal(true);
                        setShowSettingsModal(false);
                      }}
                    >
                      إضافة مستخدمين
                    </button>
                    <button
                      className="w-full text-right px-4 py-2 hover:bg-gray-50"

                      onClick={async () => {
                        if (await Uservalidation('تعديل بيانات المشروع', projectId)) {
                          setShowEditStartDateModal(true);
                        }
                        setShowSettingsModal(false);
                      }}
                    >
                      تعديل تاريخ بداية المشروع
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </PermissionBasedVisibility>
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
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 shadow-sm text-center overflow-hidden">
              <div className="text-xs text-blue-700 font-ibm-arabic-medium mb-1">إجمالي المراحل</div>
              <div className="text-lg font-ibm-arabic-bold text-blue-800">{stages?.length || 0}</div>
            </div>

            {/* Open/Completed Card */}
            <div className="p-3 rounded-xl bg-green-50/60 border border-green-200 shadow-sm text-center overflow-hidden">
              <div className="text-xs text-green-700 font-ibm-arabic-medium mb-1">المفتوحة / المكتملة</div>
              <div className="text-lg font-ibm-arabic-bold text-green-800">
                {(stages?.length || 0) - (stages?.filter(s => s.Done === 'true').length || 0)} / {(stages?.filter(s => s.Done === 'true').length || 0)}
              </div>
            </div>
          </div>

          {/* Sort Control - Matching Page Design */}
          <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 justify-center">
              <label className="text-sm text-orange-700 font-ibm-arabic-medium">ترتيب:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="border border-orange-300 rounded-lg px-3 py-1 text-sm bg-white/80 font-ibm-arabic-medium focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-orange-800"
              >
                <option value="default">الافتراضي</option>
                <option value="status">الحالة (المفتوحة أولاً)</option>
                <option value="progress">التقدم (الأعلى أولاً)</option>
                <option value="name">الاسم (أ-ي)</option>
              </select>
            </div>
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
            <p className="text-gray-500 font-ibm-arabic-medium mb-6 text-lg">لا توجد مراحل في هذا المشروع</p>
            {user?.data?.jobdiscrption === 'موظف' && (
              <button
                onClick={handleAddStage}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-ibm-arabic-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                إضافة أول مرحلة
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-4">إضافة مرحلة جديدة</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-ibm-arabic-medium text-gray-700 mb-2">اسم المرحلة</label>
                <input
                  type="text"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل اسم المرحلة"
                />
              </div>
              <div>
                <label className="block text-sm font-ibm-arabic-medium text-gray-700 mb-2">عدد الأيام</label>
                <input
                  type="number"
                  value={newStageDays}
                  onChange={(e) => setNewStageDays(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل عدد الأيام"
                  min="1"
                />
              </div>
            </div>

            <div className="flex space-x-3 space-x-reverse mt-6">
              <button
                onClick={confirmAddStage}
                disabled={!newStageName.trim() || !newStageDays.trim() || loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الإضافة...' : 'إضافة'}
              </button>
              <button
                onClick={() => {
                  setShowAddStageModal(false);
                  setNewStageName('');
                  setNewStageDays('');
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Edit Start Date Modal */}
      {showEditStartDateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-4">تعديل تاريخ بداية المشروع</h3>
            <div>
              <label className="block text-sm font-ibm-arabic-medium text-gray-700 mb-2">تاريخ البداية</label>
              <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="flex space-x-3 space-x-reverse mt-6">
              <button
                onClick={async ()=>{
                  try {
                    await axiosInstance.put('/brinshCompany/UpdateStartdate', {
                      data: { ProjectID: projectId, ProjectStartdate: startDate }
                    }, { headers: { Authorization: `Bearer ${user?.accessToken}` } });
                    Tostget('تم تحديث تاريخ بداية المشروع');
                    setShowEditStartDateModal(false);
                    await fetchProjectDetails(projectId);
                  } catch (e) {
                    console.error(e);
                    Tostget('فشل تحديث التاريخ');
                  }
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
              >
                حفظ
              </button>
              <button onClick={()=>setShowEditStartDateModal(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors">إلغاء</button>
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
        onSaved={async () => { /* no-op */ }}
      />

      {/* Delete Stage Modal */}
      {showDeleteModal && selectedStage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-4">حذف المرحلة</h3>

            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف المرحلة "{selectedStage.StageName}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>

            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={confirmDeleteStage}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-ibm-arabic-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الحذف...' : 'حذف'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStage(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
              >
                إلغاء
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