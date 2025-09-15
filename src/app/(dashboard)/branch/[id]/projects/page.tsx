'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import useBranchProjects, { Project } from '@/hooks/useBranchProjects';
import { scale } from '@/utils/responsiveSize';
import { formatDateEnglish, Totaltofixt } from '@/hooks/useFinance';
import axiosInstance from '@/lib/api/axios';
import UserProfileModal from '@/components/user/UserProfileModal';
import BranchSettingsModal from '@/components/branch/BranchSettingsModal';
import BranchDataEditModal from '@/components/branches/BranchDataEditModal';
import { Tostget } from '@/components/ui/Toast';
import useValidityUser from '@/hooks/useValidityUser';
import { EmployeeOnly, PermissionBasedVisibility } from '@/components/auth/PermissionGuard';
import Image from 'next/image';
import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';



// Project Card Component - Exactly matching mobile app BoxProject
const ProjectCardMobile = ({
  project,
  notificationCount,
  onPress,
  onNotifications,
  onLocation,
  onGuard,
  onClose,
  onDelete,
  user,
  loading
}: {
  project: Project;
  notificationCount: number;
  onPress: () => void;
  onNotifications: () => void;
  onLocation: () => void;
  onGuard: () => void;
  onClose: () => void;
  onDelete: () => void;
  user: any;
  loading: boolean;
}) => {
  const [showFullCost, setShowFullCost] = useState(false);
  const { hasPermission } = useValidityUser();

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header - Clickable area to enter project */}
      <div
        className="relative mb-4 cursor-pointer hover:bg-gray-50 rounded-lg p-3 transition-colors"
        onClick={onPress}
      >
        {/* زر الإشعارات ثابت ولا يؤثر على التوسيط */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNotifications();
          }}
          className="absolute left-2 top-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* زر الحذف في نفس مستوى زر الإشعارات */}
        {hasPermission('حذف المشروع') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute right-2 top-2 p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            )}
          </button>
        )}

        {/* العنوان والملاحظة في المنتصف */}
        <div className="flex-1 min-w-0 mx-auto text-center px-10 min-h-[60px] flex flex-col justify-center">
          <h3
            className="font-ibm-arabic-semibold text-gray-900 mb-1 text-center"
            style={{
              fontSize: scale(13),
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: '1.2rem',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
            }}
            title={project.Nameproject}
          >
            {project.Nameproject}
          </h3>
          {project.Note ? (
            <p
              className="font-ibm-arabic-regular text-gray-600 text-sm text-center"
              style={{
                fontSize: scale(10),
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: '1rem',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
              title={project.Note || ''}
            >
              {project.Note}
            </p>
          ) : (
            <p
              className="font-ibm-arabic-regular text-gray-600 text-sm text-center opacity-0 select-none"
              style={{
                fontSize: scale(10),
                lineHeight: '1rem',
              }}
            >
              -
            </p>
          )}
        </div>
      </div>

      {/* Content bounded by notification/delete rails */}
      <div style={{ paddingLeft: '8px', paddingRight: '8px' }}>

      {/* Progress Bar - Enhanced with animation */}
      <div className="mb-4 relative">
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-1000 ease-out relative"
            style={{ width: `${project.rate || 0}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>

            {/* Percentage indicator at the beginning of the blue line */}
            {(project.rate || 0) > 0 && (
              <div
                className="absolute bg-white border-2 border-blue-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all duration-1000 ease-out"
                style={{
                  left: '-16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '10px'
                }}
              >
                <span className="font-ibm-arabic-bold text-blue-600 text-xs">
                  {Math.round(project.rate || 0)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {showFullCost && (
            <div
              className="absolute bg-white border border-gray-200 rounded-lg px-3 py-2 z-10 shadow-lg"
              onClick={() => setShowFullCost(false)}
            >
              <p className="font-ibm-arabic-semibold text-gray-900" style={{ fontSize: scale(13) }}>
                {project.cost}
              </p>
            </div>
          )}
          <button
            onClick={() => setShowFullCost(!showFullCost)}
            className="text-right"
          >
            <p className="font-ibm-arabic-semibold text-gray-900" style={{ fontSize: scale(13) }}>
              الرصيد:
            </p>
            <p className="font-ibm-arabic-semibold text-gray-900" style={{ fontSize: scale(13) }}>
              {Totaltofixt(project.cost || 0)} ر.س
            </p>
          </button>
        </div>

        <div className="text-center">
          <p className="font-ibm-arabic-semibold text-gray-900" style={{ fontSize: scale(13) }}>
            بداية المشروع
          </p>
          <p className="font-ibm-arabic-semibold text-gray-900" style={{ fontSize: scale(13) }}>
            {project.ProjectStartdate ? formatDateEnglish(project.ProjectStartdate) : 'لم يحدد بعد'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-4 space-x-2 space-x-reverse">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLocation();
          }}
          className="flex-1 flex flex-col items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2117FB" strokeWidth="1.5">
            <path d="M15.5 11C15.5 12.933 13.933 14.5 12 14.5C10.067 14.5 8.5 12.933 8.5 11C8.5 9.067 10.067 7.5 12 7.5C13.933 7.5 15.5 9.067 15.5 11Z"/>
            <path d="M12 2C16.8706 2 21 6.03298 21 10.9258C21 15.8965 16.8033 19.3847 12.927 21.7567C12.6445 21.9162 12.325 22 12 22C11.675 22 11.3555 21.9162 11.073 21.7567C7.2039 19.3616 3 15.9137 3 10.9258C3 6.03298 7.12944 2 12 2Z"/>
          </svg>
          <span className="font-ibm-arabic-semibold text-gray-900 text-xs mt-1">الموقع</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onGuard();
          }}
          className="flex-1 flex flex-col items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2117FB" strokeWidth="1.5">
            <path d="M5.4221 11.9539C4.66368 10.6314 4.29748 9.55158 4.07667 8.45696C3.7501 6.83806 4.49745 5.25665 5.7355 4.24758C6.25876 3.82111 6.85858 3.96682 7.168 4.52192L7.86654 5.77513C8.42023 6.76845 8.69707 7.26511 8.64216 7.79167C8.58726 8.31823 8.2139 8.74708 7.46718 9.6048L5.4221 11.9539ZM5.4221 11.9539C6.95721 14.6306 9.36627 17.041 12.0461 18.5779M12.0461 18.5779C13.3686 19.3363 14.4484 19.7025 15.543 19.9233C17.1619 20.2499 18.7434 19.5025 19.7524 18.2645C20.1789 17.7413 20.0332 17.1414 19.4781 16.832L18.2249 16.1334C17.2315 15.5797 16.7349 15.3029 16.2083 15.3578C15.6818 15.4127 15.2529 15.7861 14.3952 16.5328L12.0461 18.5779Z"/>
          </svg>
          <span className="font-ibm-arabic-semibold text-gray-900 text-xs mt-1">الحارس</span>
        </button>

        {project.rate !== undefined && project.rate >= 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex-1 flex flex-col items-center p-2 rounded-lg transition-colors bg-red-50 hover:bg-red-100 text-red-600"
            disabled={loading}
            aria-label="إغلاق المشروع"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="font-ibm-arabic-semibold text-xs mt-1">إغلاق المشروع</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Bottom Section - Team Members only */}
      <div className="flex items-center justify-center">
        {/* Team Members Icons */}
        <div className="flex items-center">
          <div className="flex -space-x-2 space-x-reverse">
            {[...Array(Math.min(project.countuser || 0, 3))].map((_, index) => (
              <div
                key={index}
                className="w-8 h-8 bg-blue-100 rounded-full border-2 border-white flex items-center justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            ))}
            {(project.countuser || 0) > 3 && (
              <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-600">
                  +{(project.countuser || 0) - 3}
                </span>
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Close bounded content wrapper */}
      </div>
    </div>
  );
};

const BranchProjectsPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const branchId = parseInt(params.id as string);
  const branchName = searchParams.get('name') || 'الفرع';

  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation, hasPermission } = useValidityUser();

  const {
    projects,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    fetchProjects,
    loadMoreProjects,
    refreshProjects,
    filterProjects,
  } = useBranchProjects();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});
  const [searchTitle, setSearchTitle] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState<{ [key: number]: number }>({});
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);
  const [branchData, setBranchData] = useState<any>(null);
  const [actionType, setActionType] = useState<'close' | 'delete' | null>(null);

  // Responsive grid like Home page
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check permissions
  const canShowEmployee = hasPermission('تعديل بيانات الفرغ') || hasPermission('إنشاء المشروع') || hasPermission('إشعارات المالية') || hasPermission('انشاء عمليات مالية') || hasPermission('إنشاء طلبات');

  // Load projects on mount
  useEffect(() => {
    if (branchId && user?.accessToken) {
      fetchProjects(branchId);
    }
  }, [branchId, user?.accessToken]);

  const handleBack = () => {
    router.back();
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
  };

  const handleNotificationsBranch = () => {
    router.push(`/notifications?branchId=${branchId}&type=allBrinsh`);
  };

  const handleUserProfile = () => {
    setShowUserProfile(true);
  };

  const handleEditBranch = async () => {
    try {
      // Fetch branch data for editing - مطابق للتطبيق المحمول
      const response = await axiosInstance.post('/company/brinsh/bring', {
        IDCompany: user?.data?.IDCompany,
        type: 'update'
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      if (response.data?.data) {
        const branch = response.data.data.find((b: any) => b.id === branchId);
        if (branch) {
          setBranchData(branch);
          setShowEditBranchModal(true);
        }
      }
    } catch (error) {
      console.error('Error fetching branch data:', error);
      Tostget('خطأ في جلب بيانات الفرع');
    }
  };

  const handleSaveBranch = async (updatedBranch: any) => {
    try {
      await axiosInstance.put('/company/brinsh/Update', updatedBranch, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      Tostget('تم تحديث بيانات الفرع بنجاح');
      setShowEditBranchModal(false);
      setBranchData(null);
    } catch (error) {
      console.error('Error updating branch:', error);
      Tostget('خطأ في تحديث بيانات الفرع');
    }
  };

  const handleRequests = () => {
    // Navigate to requests page - matching mobile app exactly
    router.push(`/requests?idProject=${branchId}&typepage=all&nameproject=${encodeURIComponent(branchName || 'الفرع')}`);
  };

  const handleFinance = () => {
    // Navigate to covenant (financial custody) page for this branch - matching mobile app
    router.push(`/covenant?branchId=${branchId}`);
  };

  const handleCreateProject = () => {
    router.push(`/project/create?branchId=${branchId}`);
  };

  const handleProjectPress = (project: Project) => {
    router.push(`/project/${project.id}`);
  };

  const handleProjectNotifications = (projectId: number) => {
    router.push(`/project/${projectId}/notifications`);
  };

  const handleProjectLocation = async (project: Project) => {
    if (project.LocationProject) {
      try {
        window.open(project.LocationProject, '_blank');
      } catch (error) {
        console.error('Error opening location:', error);
        alert('لم يتم تحديد موقع للمشروع');
      }
    } else {
      alert('لم يتم تحديد موقع للمشروع');
    }
  };

  const handleProjectGuard = (project: Project) => {
    // التحقق من وجود رقم الحارس وأنه ليس null أو undefined
    if (project.GuardNumber !== null && project.GuardNumber !== undefined && project.GuardNumber !== '') {
      try {
        // تحويل الرقم إلى string للتأكد
        let phoneNumber = String(project.GuardNumber);

        // تنظيف الرقم من المسافات والرموز غير المرغوبة
        phoneNumber = phoneNumber.replace(/\s+/g, '').replace(/[^\d]/g, '');

        // التأكد من أن الرقم ليس فارغاً بعد التنظيف
        if (phoneNumber.length === 0) {
          alert('رقم الحارس غير صحيح');
          return;
        }

        // إضافة 0 في البداية إذا لم يكن موجوداً (مطابق للتطبيق المحمول)
        if (!phoneNumber.startsWith('0')) {
          phoneNumber = '0' + phoneNumber;
        }

        // محاولة فتح تطبيق الهاتف
        const telLink = `tel:${phoneNumber}`;

        // إنشاء رابط مؤقت والنقر عليه
        const link = document.createElement('a');
        link.href = telLink;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // عرض رسالة تأكيد
        console.log(`محاولة الاتصال بـ: ${phoneNumber}`);
      } catch (error) {
        console.error('خطأ في معالجة رقم الهاتف:', error);
        alert('خطأ في رقم الحارس');
      }
    } else {
      alert('لم يتم تحديد رقم للحارس');
    }
  };

  const handleCloseProject = async (project: Project) => {
    // Check permission before showing modal - matching mobile app exactly
    const hasPermission = await Uservalidation('اغلاق المشروع', 0);
    if (hasPermission) {
      setSelectedProject(project);
      setActionType('close');
      setShowDeleteModal(true);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    // Check permission before showing modal - matching mobile app exactly
    const hasPermission = await Uservalidation('حذف المشروع', 0);
    if (hasPermission) {
      setSelectedProject(project);
      setActionType('delete');
      setShowDeleteModal(true);
    }
  };

  const confirmAction = async () => {
    if (!selectedProject || !actionType) return;

    setActionLoading(prev => ({ ...prev, [selectedProject.id]: true }));
    try {
      if (actionType === 'close') {
        await axiosInstance.get('/brinshCompany/CloseOROpenProject', {
          params: { idProject: selectedProject.id },
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        });
        alert('تمت عملية إغلاق المشروع بنجاح');
      } else if (actionType === 'delete') {
        await axiosInstance.get('/brinshCompany/DeletProjectwithDependencies', {
          params: { idProject: selectedProject.id },
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        });
        alert('تمت عملية حذف المشروع بنجاح');
      }

      setShowDeleteModal(false);
      setSelectedProject(null);
      setActionType(null);

      // Refresh projects list
      await refreshProjects(branchId);
    } catch (error) {
      console.error(`Error ${actionType}ing project:`, error);
      alert(`فشل في ${actionType === 'close' ? 'إغلاق' : 'حذف'} المشروع`);
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedProject.id]: false }));
    }
  };

  const handleSearch = () => {
    setShowSearchModal(true);
  };

  const handleClearSearch = () => {
    setSearchTitle('');
    setIsSearching(false);
    // Reset to all projects
    fetchProjects(branchId);
  };

  const performSearch = async () => {
    if (!searchTitle.trim()) {
      handleClearSearch();
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await filterProjects(branchId, searchTitle.trim());
      // The hook will update the projects state automatically
      setShowSearchModal(false);

      // عرض رسالة إذا لم توجد نتائج
      if (searchResults.length === 0) {
        alert('لم يتم العثور على مشاريع تطابق البحث');
      }
    } catch (error) {
      console.error('خطأ في البحث:', error);
      alert('فشل في البحث');
    }
  };

  const handleRefresh = () => {
    refreshProjects(branchId);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      loadMoreProjects(branchId);
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-ibm-arabic-medium">جاري تحميل المشاريع...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-ibm-arabic-medium mb-4">حدث خطأ في تحميل المشاريع</p>
          <button
            onClick={() => fetchProjects(branchId)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-ibm-arabic-semibold"
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
          title={branchName}
          backButton={
            <button onClick={handleBack} className="p-2 hover:bg-gray-50 rounded-lg transition-colors" aria-label="رجوع">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          }
          actions={
            <div className="flex items-center gap-2">
              {canShowEmployee && (
                <button onClick={handleSettings} className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title="الإعدادات">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M15.5 12C15.5 13.933 13.933 15.5 12 15.5C10.067 15.5 8.5 13.933 8.5 12C8.5 10.067 10.067 8.5 12 8.5C13.933 8.5 15.5 10.067 15.5 12Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M21.011 14.0968C21.5329 13.9561 21.7939 13.8857 21.8969 13.7511C22 13.6166 22 13.4001 22 12.9672V11.0335C22 10.6006 22 10.3841 21.8969 10.2496C21.7938 10.115 21.5329 10.0446 21.011 9.90389C19.0606 9.3779 17.8399 7.33882 18.3433 5.40118C18.4817 4.8683 18.5509 4.60187 18.4848 4.4456C18.4187 4.28933 18.2291 4.18165 17.8497 3.96627L16.125 2.98704C15.7528 2.7757 15.5667 2.67003 15.3997 2.69253C15.2326 2.71503 15.0442 2.90304 14.6672 3.27904C13.208 4.73479 10.7936 4.73473 9.33434 3.27895C8.95743 2.90294 8.76898 2.71494 8.60193 2.69243C8.43489 2.66993 8.24877 2.7756 7.87653 2.98694L6.15184 3.96618C5.77253 4.18154 5.58287 4.28922 5.51678 4.44546C5.45068 4.60171 5.51987 4.86818 5.65825 5.40111C6.16137 7.33881 4.93972 9.37794 2.98902 9.90391C2.46712 10.0446 2.20617 10.115 2.10308 10.2495C2 10.3841 2 10.6006 2 11.0335V12.9672C2 13.4001 2 13.6166 2.10308 13.7511C2.20615 13.8857 2.46711 13.9561 2.98902 14.0968C4.9394 14.6228 6.16008 16.6619 5.65672 18.5995C5.51829 19.1324 5.44907 19.3988 5.51516 19.5551C5.58126 19.7114 5.77092 19.8191 6.15025 20.0344L7.87495 21.0137C8.24721 21.225 8.43334 21.3307 8.6004 21.3082C8.76746 21.2857 8.95588 21.0976 9.33271 20.7216C10.7927 19.2647 13.2088 19.2646 14.6689 20.7215C15.0457 21.0976 15.2341 21.2856 15.4012 21.3081C15.5682 21.3306 15.7544 21.2249 16.1266 21.0136L17.8513 20.0343C18.2307 19.819 18.4204 19.7113 18.4864 19.555C18.5525 19.3987 18.4833 19.1323 18.3448 18.5994C17.8412 16.6619 19.0609 14.6229 21.011 14.0968Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}

              {/* Branch Requests in Header */}
              <PermissionBasedVisibility permission="إنشاء طلبات">
                <button onClick={handleRequests} className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title="طلبات الفرع">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </PermissionBasedVisibility>

              {/* Branch Covenant (Finance) in Header */}
              <PermissionBasedVisibility permission="انشاء عمليات مالية">
                <button onClick={handleFinance} className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title="عهد الفرع">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="2" y="6" width="20" height="12" rx="2" ry="2" strokeWidth="1.8"/>
                    <circle cx="16" cy="12" r="2" strokeWidth="1.8"/>
                    <path d="M6 10h4" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M6 14h3" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </PermissionBasedVisibility>

              <button onClick={handleNotificationsBranch} className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors" title="الإشعارات">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {Object.values(notificationCounts).reduce((a, b) => a + b, 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {Object.values(notificationCounts).reduce((a, b) => a + b, 0) > 99 ? '99+' : Object.values(notificationCounts).reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </button>
              <button onClick={handleUserProfile} className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center" aria-label="الملف الشخصي">
                <Image src="/images/figma/male.png" alt="User" width={36} height={36} className="rounded-full" />
              </button>
            </div>
          }
        />
      }
    >
      <ContentSection>

      {/* Action Bar - Compact for Web */}
      <div className="px-6 py-4 flex items-center justify-between bg-white mx-4 rounded-lg shadow-sm border border-gray-100 mb-12">
        {/* Create Project Button - Show for employees only like mobile app */}
        <EmployeeOnly>
          <PermissionBasedVisibility permission="إنشاء المشروع">
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-0 text-blue-600 hover:underline font-ibm-arabic-semibold bg-transparent p-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14m-7-7h14"/>
              </svg>
              إنشاء مشروع
            </button>
          </PermissionBasedVisibility>
        </EmployeeOnly>


        <div className="flex items-center gap-3">
          {isSearching && searchTitle && (
            <button
              onClick={handleClearSearch}
              className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg font-ibm-arabic-medium border border-gray-200 hover:bg-gray-200 transition-colors shadow-sm"
            >
              إلغاء البحث
            </button>
          )}

          <button
            onClick={handleSearch}
            className="p-2 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors shadow-sm"
            title="بحث"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Spacer before projects */}
      <div className="h-6"></div>

      {/* Projects List */}
      <div className="px-4 pb-20 pt-4">
        {/* Search Results Info */}
        {isSearching && searchTitle && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-8">
            <p className="text-blue-800 font-ibm-arabic-medium text-sm text-right">
              نتائج البحث عن: "{searchTitle}" ({projects.length} مشروع)
            </p>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto mb-4 text-gray-400">
              {isSearching ? (
                <>
                  <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
                </>
              ) : (
                <>
                  <path d="M9 11H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-4"/>
                  <polyline points="9,11 12,14 15,11"/>
                  <line x1="12" y1="2" x2="12" y2="14"/>
                </>
              )}
            </svg>
            <h3 className="text-lg font-ibm-arabic-semibold text-gray-900 mb-2">
              {isSearching ? 'لم يتم العثور على مشاريع' : 'لا توجد مشاريع'}
            </h3>
            <p className="text-gray-600 font-ibm-arabic-regular">
              {isSearching
                ? 'لم يتم العثور على مشاريع تطابق البحث'
                : (canShowEmployee ? 'ابدأ بإنشاء أول مشروع' : 'لم يتم العثور على مشاريع في هذا الفرع')
              }
            </p>
            {isSearching && (
              <button
                onClick={handleClearSearch}
                className="mt-3 text-blue-600 font-ibm-arabic-medium hover:text-blue-800 transition-colors"
              >
                عرض جميع المشاريع
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Refresh indicator */}
            {refreshing && (
              <div className="py-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}

            <div className="px-6 pb-24 pt-8">
              <div
                className="projects-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: screenWidth < 640 ? '1fr' : screenWidth < 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                  gap: screenWidth < 640 ? '0.75rem' : '1rem',
                  width: '100%'
                }}
              >
                {projects.map((project, index) => (
                  <div key={`${project.id}-${index}`}>
                    <ProjectCardMobile
                      project={project}
                      notificationCount={notificationCounts[project.id] || 0}
                      onPress={() => handleProjectPress(project)}
                      onNotifications={() => handleProjectNotifications(project.id)}
                      onLocation={() => handleProjectLocation(project)}
                      onGuard={() => handleProjectGuard(project)}
                      onClose={() => handleCloseProject(project)}
                      onDelete={() => handleDeleteProject(project)}
                      user={user}
                      loading={actionLoading[project.id] || false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري التحميل...</span>
                    </div>
                  ) : (
                    'تحميل المزيد'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      </ContentSection>

      {/* Modals */}
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-4 text-center">
              {actionType === 'delete' ? 'تأكيد الحذف' : 'تأكيد الإغلاق'}
            </h3>
            <p className="text-gray-600 font-ibm-arabic-regular mb-6 text-center">
              {actionType === 'delete'
                ? `هل أنت متأكد من حذف المشروع "${selectedProject.Nameproject}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                : `هل أنت متأكد من إغلاق المشروع "${selectedProject.Nameproject}"؟`
              }
            </p>
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProject(null);
                  setActionType(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
                disabled={actionLoading[selectedProject.id]}
              >
                إلغاء
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 py-2 rounded-lg font-ibm-arabic-semibold transition-colors disabled:opacity-50 ${
                  actionType === 'delete'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={actionLoading[selectedProject.id]}
              >
                {actionLoading[selectedProject.id]
                  ? (actionType === 'delete' ? 'جاري الحذف...' : 'جاري الإغلاق...')
                  : (actionType === 'delete' ? 'حذف' : 'إغلاق')
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-4">البحث في المشاريع</h3>

            {/* Search Input */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  placeholder="ادخل اسم المشروع هنا"
                  className="w-full p-4 pr-12 border border-gray-200 rounded-xl font-ibm-arabic-medium text-right focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      performSearch();
                    }
                  }}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280">
                    <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                    <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={() => setShowSearchModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={performSearch}
                disabled={!searchTitle.trim()}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                بحث
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />

      {/* Branch Settings Modal */}
      <BranchSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        branchId={branchId}
        branchName={branchName || 'الفرع'}
        onEditBranch={handleEditBranch}
      />

      {/* Branch Data Edit Modal */}
      <BranchDataEditModal
        isOpen={showEditBranchModal}
        onClose={() => {
          setShowEditBranchModal(false);
          setBranchData(null);
        }}
        branch={branchData}
        onSave={handleSaveBranch}
        loading={false}
      />
    </ResponsiveLayout>
  );
};

export default BranchProjectsPage;