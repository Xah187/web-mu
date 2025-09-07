'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  user
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
    <div className="bg-white rounded-b-3xl px-4 pb-6">
      {/* Top Navigation */}
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

      {/* Project Title and Edit */}
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

      {/* Stats Container */}
      <div className="border border-gray-200 rounded-2xl p-4 mb-6">
        {/* Remaining Days - Top Center */}
        <div className="text-center mb-4">
          <p className="text-gray-600 text-sm mb-1" style={{ fontSize: scale(12) }}>إجمالي الأيام المتبقية</p>
          <p
            className={`font-ibm-arabic-bold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}
            style={{ fontSize: scale(20), fontFeatureSettings: '"tnum"' }}
          >
            {remainingDays}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="flex justify-center items-center space-x-4 space-x-reverse">
          {/* Daily Cost */}
          <div className="text-center flex-1">
            <p className="text-gray-600 text-xs mb-1" style={{ fontSize: scale(12) }}>التكلفة اليومية</p>
            <p className="font-ibm-arabic-bold text-gray-900" style={{ fontSize: scale(16), fontFeatureSettings: '"tnum"' }}>
              {formatCurrency(project.ConstCompany || 0)}
              <span className="text-xs mr-1">ر.س</span>
            </p>
          </div>

          {/* Separator */}
          <div className="w-px h-12 bg-gray-200" />

          {/* Days Count */}
          <div className="text-center flex-1">
            <p className="text-gray-600 text-xs mb-1" style={{ fontSize: scale(12) }}>عدد الأيام</p>
            <p className="font-ibm-arabic-bold text-gray-900" style={{ fontSize: scale(16), fontFeatureSettings: '"tnum"' }}>
              {project.DaysUntiltoday || 0}
            </p>
          </div>

          {/* Separator */}
          <div className="w-px h-12 bg-gray-200" />

          {/* Total Cost */}
          <div className="text-center flex-1">
            <p className="text-gray-600 text-xs mb-1" style={{ fontSize: scale(12) }}>إجمالي التكلفة</p>
            <p className="font-ibm-arabic-bold text-gray-900" style={{ fontSize: scale(16), fontFeatureSettings: '"tnum"' }}>
              {formatCurrency(project.TotalcosttothCompany || 0).slice(0, 8)}
              {String(project.TotalcosttothCompany).length > 8 && '..'}
              <span className="text-xs mr-1">ر.س</span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-8 space-x-reverse gap-4">
        <button
          onClick={onRequests}
          className="flex items-center space-x-2 space-x-reverse bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-ibm-arabic-semibold">طلبات</span>
        </button>

        <button
          onClick={onFinance}
          className="flex items-center space-x-2 space-x-reverse bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span className="text-sm font-ibm-arabic-semibold">مالية</span>
        </button>

        <button
          onClick={onArchives}
          className="flex items-center space-x-2 space-x-reverse bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6m0 0l6-6m-6 6V3" />
          </svg>
          <span className="text-sm font-ibm-arabic-semibold">أرشيف</span>
        </button>
      </div>
    </div>
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
    <div className="flex flex-col items-center mb-6">
      {/* Stage Name */}
      <h3
        className="font-ibm-arabic-bold text-gray-900 mb-4 text-center"
        style={{ fontSize: scale(14) }}
      >
        {stage.StageName}
      </h3>

      {/* Circular Progress */}
      <div
        className="relative cursor-pointer hover:scale-105 transition-transform duration-200 mb-3"
        onClick={onPress}
      >
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="#E5E7EB"
              strokeWidth="6"
              fill="none"
            />
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
            <span
              className="font-ibm-arabic-bold text-blue-600"
              style={{ fontSize: scale(16) }}
            >
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-ibm-arabic-medium ${
            isCompleted
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
          }`}
        >
          {isCompleted ? 'تم إنجاز' : 'غير منجز'}
        </span>
      </div>

      {/* Delete Button - Only if has permission */}
      {hasPermission('حذف مرحلة رئيسية') && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
      />

      {/* Pull to refresh indicator */}
      <div
        className="p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleRefresh}
      >
        <p className="text-sm text-gray-600">
          {refreshing ? 'جاري التحديث...' : 'اضغط للتحديث'}
        </p>
      </div>

      {/* Action Buttons - Show for employees only like mobile app */}
      <EmployeeOnly>
        <PermissionBasedVisibility permission="إضافة مرحلة رئيسية">
          <div className="flex justify-between items-center p-4">
            <button
              onClick={handleAddStage}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
              style={{ fontSize: scale(14) }}
            >
              انشاء مهمة
            </button>

          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={handleQualityEvaluation}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
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
      <div className="px-6 pb-8 page-content">
        {/* Spacer before stages */}
        <div className="h-4"></div>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 list-container">
              {stages.map((stage) => (
                <div key={stage.StageCustID} className="transform transition-all duration-200 hover:scale-105">
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
    </div>
  );
};

export default ProjectDetailsPage;