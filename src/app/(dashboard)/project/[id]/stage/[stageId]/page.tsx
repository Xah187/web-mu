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
import StageCloseModal from '@/components/stages/StageCloseModal';
import StageStatusBadge from '@/components/stages/StageStatusBadge';
import StageInfoModal from '@/components/stages/StageInfoModal';
import SubStageOptionsModal from '@/components/stages/SubStageOptionsModal';
import SubStageEditModal from '@/components/stages/SubStageEditModal';
import StageEditModal from '@/components/stages/StageEditModal';

// Stage Header Component with progress bar and action buttons
const StageHeader = ({ 
  stageName, 
  progress,
  startDate,
  endDate,
  onBack,
  onChat,
  onDelays,
  onEdit,
  onClose,
  isCompleted,
  canClose,
  user
}: {
  stageName: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  onBack: () => void;
  onChat: () => void;
  onDelays: () => void;
  onEdit: () => void;
  onClose: () => void;
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
    <div className="bg-white rounded-b-3xl px-4 pb-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pt-4 pb-4">
        <button onClick={onBack} className="p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Close/Open Stage Button - Permission-based */}
        {hasPermission('اقفال المرحلة') && (
          <button
            onClick={onClose}
            className={`px-3 py-2 rounded-lg border flex items-center space-x-2 space-x-reverse ${
              isCompleted
                ? 'bg-green-50 border-green-200'
                : progress === 100
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
            }`}
            disabled={progress < 100 && !isCompleted}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isCompleted ? "#10B981" : progress === 100 ? "#FF0F0F" : "#9CA3AF"}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.02331 5.5C4.59826 7.11238 3 9.86954 3 13C3 17.9706 7.02944 22 12 22C16.9706 22 21 17.9706 21 13C21 9.86954 19.4017 7.11238 16.9767 5.5" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2V10" />
            </svg>
            <span className={`text-sm font-ibm-arabic-semibold ${
              isCompleted
                ? 'text-green-600'
                : progress === 100
                  ? 'text-red-600'
                  : 'text-gray-400'
            }`}>
              {isCompleted
                ? (canClose ? 'عمليات الفتح' : 'فتح المرحلة')
                : (canClose ? 'عمليات الاقفال' : 'اقفال المرحلة')
              }
            </span>
          </button>
        )}

        <button className="p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7 7 0 00-14 0v2" />
          </svg>
        </button>
      </div>

      {/* Stage Title and Edit */}
      <div className="flex items-center justify-center space-x-3 space-x-reverse mb-4">
        <h1 className="font-ibm-arabic-bold text-gray-900 text-center" style={{ fontSize: scale(16) }}>
          {stageName}
        </h1>
        {hasPermission('تعديل مرحلة رئيسية') && (
          <button onClick={onEdit} className="p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${typeof progress === 'number' && !isNaN(progress) ? progress : 0}%` }}
          />
        </div>
        {/* Progress Badge */}
        <div
          className="absolute -top-6 bg-gray-100 px-2 py-1 rounded-lg text-xs font-ibm-arabic-bold text-blue-600"
          style={{ left: `${Math.max(0, Math.min((typeof progress === 'number' && !isNaN(progress) ? progress : 0) - 5, 90))}%` }}
        >
          {(typeof progress === 'number' && !isNaN(progress) ? progress : 0).toFixed(1)}%
        </div>
      </div>

      {/* Dates */}
      <div className="flex justify-between text-center mb-4">
        <div>
          <p className="text-xs text-blue-600 font-ibm-arabic-bold">تاريخ البداية</p>
          <p className="text-xs text-blue-600 font-ibm-arabic-bold">{formatDate(startDate)}</p>
        </div>
        <div>
          <p className="text-xs text-blue-600 font-ibm-arabic-bold">تاريخ النهاية</p>
          <p className="text-xs text-blue-600 font-ibm-arabic-bold">{formatDate(endDate)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-6 space-x-reverse">
        <button
          onClick={onChat}
          className="flex items-center space-x-2 space-x-reverse bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm font-ibm-arabic-semibold">تواصل</span>
        </button>

        {hasPermission('إضافة تأخيرات') && (
          <button
            onClick={onDelays}
            className="flex items-center space-x-2 space-x-reverse bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-ibm-arabic-semibold">التأخيرات</span>
          </button>
        )}
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
  user
}: {
  subStage: SubStage;
  isSelected: boolean;
  isSelectMode: boolean;
  onToggleComplete: () => void;
  onToggleSelect: () => void;
  onSettings: () => void;
  onOpenAttachment: () => void;
  user: any;
}) => {
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

  const notes = subStage.Note ? JSON.parse(subStage.Note) : [];
  const hasNotes = notes.length > 0;

  return (
    <div className="bg-white rounded-2xl mx-4 mb-3 shadow-sm">
      <div className="p-4">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 space-x-reverse flex-1">
            {/* Checkbox */}
            <button
              onClick={isSelectMode ? onToggleSelect : onToggleComplete}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                isSelectMode 
                  ? (isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300')
                  : (isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300')
              }`}
            >
              {((isSelectMode && isSelected) || (!isSelectMode && isCompleted)) && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Title */}
            <p className={`font-ibm-arabic-semibold flex-1 ${
              isCompleted ? 'text-green-600' : 'text-gray-900'
            }`}>
              {subStage.StageSubName}
            </p>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-2 space-x-reverse">
            {subStage.attached && (
              <button onClick={onOpenAttachment} className="p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}
            
            <button onClick={onSettings} className="p-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Completion Info */}
        {isCompleted && completedBy && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-ibm-arabic-semibold text-gray-900 text-sm">{completedBy.userName}</p>
                <p className="text-xs text-gray-500">
                  {completedBy.Date ? formatDateEnglish(completedBy.Date) : ''}
                </p>
              </div>
              <div className="bg-green-100 px-2 py-1 rounded-full">
                <span className="text-xs font-ibm-arabic-medium text-green-700">{completedBy.type}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Notes Section */}
      {hasNotes && (
        <div className="border-t border-gray-100">
          <button className="w-full p-2 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
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
  const { subStages, loading: loadingSub, hasMore, fetchInitial, loadMore, error: subError } = useSubStages();

  const [stageDetails, setStageDetails] = useState<any>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSubStage, setSelectedSubStage] = useState<SubStage | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubStage, setEditingSubStage] = useState<SubStage | null>(null);
  const [showStageEditModal, setShowStageEditModal] = useState(false);

  // Load stage details and sub-stages
  useEffect(() => {
    if (projectId && stageId && user?.accessToken) {
      fetchStageDetails();
    }
  }, [projectId, stageId, user?.accessToken, fetchInitial]);

  const fetchStageDetails = async () => {
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
      if (await Uservalidation('تشييك الانجازات الفرعية', projectId)) {
        try {
          await axiosInstance.post(
            '/brinshCompany/AddORCanselAchievment',
            { StageSubID: subStageId },
            {
              headers: { Authorization: `Bearer ${user.accessToken}` },
            }
          );
          // Refresh data - use stage details StageID
          if (stageDetails?.StageID) {
            fetchInitial(projectId, stageDetails.StageID);
          }
        } catch (error) {
          console.error('Error toggling completion:', error);
        }
      }
    }
  };

  const handleToggleSelect = (subStageId: number) => {
    setSelectedItems(prev => 
      prev.includes(subStageId) 
        ? prev.filter(id => id !== subStageId)
        : [...prev, subStageId]
    );
  };

  const handleSelectAll = async () => {
    if (isSelectMode) {
      // Save selected items
      if (await Uservalidation('تشييك الانجازات الفرعية', projectId)) {
        try {
          await axiosInstance.post(
            '/brinshCompany/AddORCanselAchievmentarrayall',
            { arrayStageSubID: selectedItems },
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
        } catch (error) {
          console.error('Error saving selections:', error);
        }
      }
    } else {
      setIsSelectMode(true);
      setSelectedItems([]);
    }
  };

  const handleCancelSelect = () => {
    setIsSelectMode(false);
    setSelectedItems([]);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <StageHeader
        stageName={stageDetails?.StageName || `المرحلة ${stageId}`}
        progress={typeof stageDetails?.rate === 'number' && !isNaN(stageDetails.rate) ? stageDetails.rate : 0}
        startDate={stageDetails?.StartDate}
        endDate={stageDetails?.EndDate}
        onBack={() => router.back()}
        onChat={() => router.push(`/chat?ProjectID=${projectId}&typess=${encodeURIComponent(String(stageId))}&nameRoom=${encodeURIComponent('تواصل')}&nameProject=${encodeURIComponent(stageDetails?.StageName || '')}`)}
        onDelays={() => router.push(`/project/${projectId}/stage/${stageId}/delays`)}
        onEdit={handleEditStage}
        onClose={handleCloseStage}
        isCompleted={stageDetails?.Done === 'true'}
        canClose={stageDetails?.NoteOpen !== null || stageDetails?.NoteClosed !== null}
        user={user}
      />

      {/* Stage Status Badge */}
      {stageDetails && (
        <div className="px-4">
          <StageStatusBadge stage={stageDetails} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between p-4">
        {hasPermission('اضافة مرحلة فرعية') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
          >
            انشاء مهمة فرعية جديدة
          </button>
        )}

        <div className="flex space-x-3 space-x-reverse">
          {isSelectMode && (
            <button
              onClick={handleCancelSelect}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
          )}
          <button
            onClick={handleSelectAll}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
          >
            {isSelectMode ? 'حفظ' : 'تحديد'}
          </button>
        </div>
      </div>

      {/* Sub Stages List */}
      <div className="pb-4 page-content">
        {loadingSub && subStages.length === 0 ? (
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
          <div className="list-container">
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
                user={user}
              />
            ))}
            
            {hasMore && (
              <div className="px-4 pt-6 text-center">
                <button 
                  onClick={() => loadMore(projectId, stageId)}
                  disabled={loadingSub}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center mx-auto"
                >
                  {loadingSub && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                  )}
                  {loadingSub ? 'جاري التحميل...' : 'تحميل المزيد'}
                </button>
              </div>
            )}

            {/* Loading indicator for load more */}
            {loadingSub && subStages.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                <span className="mr-3 text-gray-600 font-ibm-arabic-medium text-sm">جاري تحميل المزيد...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-4">إضافة مهمة فرعية جديدة</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddSubStage(
                formData.get('name') as string,
                formData.get('file') as File | undefined
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-ibm-arabic-medium text-gray-700 mb-2">اسم المهمة</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل اسم المهمة الفرعية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-ibm-arabic-medium text-gray-700 mb-2">مرفق (اختياري)</label>
                  <input
                    name="file"
                    type="file"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex space-x-3 space-x-reverse mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
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
          onAddNote={() => {
            // TODO: Implement add note functionality
            console.log('Add note for:', selectedSubStage.StageSubID);
          }}
          onDelete={() => {
            // TODO: Implement delete functionality
            console.log('Delete:', selectedSubStage.StageSubID);
          }}
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
    </div>
  );
};

export default StageDetailsPage;