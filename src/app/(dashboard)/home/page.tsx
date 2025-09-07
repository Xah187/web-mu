'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAppSelector } from '@/store';
import ButtonCreat from '@/components/design/ButtonCreat';
import { useCompanyData } from '@/hooks/useCompanyData';
import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';
import useValidityUser from '@/hooks/useValidityUser';
import PermissionGuard, { AdminGuard } from '@/components/auth/PermissionGuard';

import BranchCard from '@/components/design/BranchCard';
import { Tostget } from '@/components/ui/Toast';
import BranchEditModal from '@/components/branches/BranchEditModal';
import useBranchOperations from '@/hooks/useBranchOperations';

import BellIcon from '@/components/icons/BellIcon';
import UserProfileModal from '@/components/user/UserProfileModal';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state: any) => state.user);

  // Use the new company data hook
  const { homeData, loading, refreshData, fetchCompanyData } = useCompanyData();

  // Permission system (existing)
  // Job-based permission system (consistent everywhere - recommended)
  const { isAdmin, isBranchManager } = useJobBasedPermissions();
  
  // Branch operations hook
  const { updateBranchData, loading: branchOperationLoading } = useBranchOperations();

  // Local state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Branch edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  // User profile modal state
  const [showUserProfile, setShowUserProfile] = useState(false);

  useEffect(() => {
    // Initial data load is handled by the hook
    fetchNotifications();
  }, []);

  // Listen for refresh parameter to update branches after creating new branch
  useEffect(() => {
    const refreshParam = searchParams?.get('refresh');
    if (refreshParam === 'branches') {
      // Show loading message
      Tostget('جاري تحديث قائمة الفروع...');
      
      // Refresh data when returning from branch creation
      refreshData().then(() => {
        // Show success message after data is loaded
        setTimeout(() => {
          Tostget('تم تحديث قائمة الفروع بنجاح');
        }, 500);
      });
      
      // Clear the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('refresh');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, refreshData]);

  const fetchNotifications = async () => {
    try {
      // Implement notification fetching logic here
      setNotifications([]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      await fetchNotifications();
      Tostget('تم تحديث البيانات');
    } catch (error) {
      console.error('Error refreshing data:', error);
      Tostget('خطأ في تحديث البيانات');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle edit company data with fetching - matches mobile app exactly
  const handleEditCompany = async () => {
    if (!isAdmin) {
      Tostget('ليس لديك صلاحية لتعديل بيانات الشركة');
      return;
    }

    if (!user?.data?.IDCompany) {
      Tostget('لا يمكن العثور على معرف الشركة');
      return;
    }

    try {
      // Fetch latest company data before editing - exactly like mobile app
      await fetchCompanyData();
      // Navigate to edit page
      router.push('/company-info');
    } catch (error) {
      console.error('Error fetching company data:', error);
      // Still allow editing with basic data if fetch fails
      Tostget('سيتم استخدام البيانات الأساسية للتعديل');
      router.push('/company-info');
    }
  };

  // Handle create branch with permission check - matches mobile app exactly
  const handleCreateBranch = () => {
    if (isAdmin) {
      router.push('/create-branch');
    } else {
      Tostget('غير مصرح لك بهذا الإجراء');
    }
  };

  // Handle members navigation - Admin only
  const handleMembers = () => {
    if (!isAdmin) {
      Tostget('ليس لديك صلاحية لإدارة الأعضاء');
      return;
    }
    router.push('/members');
  };

  // Handle covenant with permission check - matches mobile app exactly
  const handleCovenant = () => {
    if (isAdmin) {
      // Navigate to covenant page with company branch ID
      const branchId = user?.data?.IDCompany || '';
      router.push(`/covenant?branchId=${branchId}`);
    } else {
      Tostget('غير مصرح لك بهذا الإجراء');
    }
  };

  // Handle branch navigation - go to branch projects
  const handleBranchPress = (branch: any) => {
    router.push(`/branch/${branch.id}/projects?name=${encodeURIComponent(branch.NameSub)}`);
  };

  // Handle branch settings - only for admins
  const handleBranchSettings = (branch: any) => {
    if (isAdmin) {
      router.push(`/branch/${branch.id}/settings`);
    } else {
      Tostget('غير مصرح لك بهذا الإجراء');
    }
  };

  // Handle branch edit - open edit modal
  const handleBranchEdit = (branch: any) => {
    if (isAdmin || isBranchManager) {
      setSelectedBranch(branch);
      setEditModalOpen(true);
    } else {
      Tostget('ليس لديك صلاحية لتعديل بيانات الفرع');
    }
  };

  // Handle save branch changes
  const handleSaveBranch = async (updatedBranch: any) => {
    try {
      await updateBranchData({
        id: updatedBranch.id,
        NameSub: updatedBranch.NameSub,
        BranchAddress: updatedBranch.BranchAddress,
        Email: updatedBranch.Email,
        PhoneNumber: updatedBranch.PhoneNumber,
        Linkevaluation: updatedBranch.Linkevaluation
      });
      
      // Refresh data to show updated information
      await refreshData();
    } catch (error: any) {
      throw error; // Let the modal handle the error display
    }
  };

  if (loading && !homeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.HOME || '#f6f8fe' }}>
      {/* Header Section - Optimized for Web */}
      <div className="bg-white shadow-md border-b border-gray-100" style={{
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        paddingBottom: '16px'
      }}>
        <div className="pt-6 px-6">
          {/* User Info Row - Compact for Web */}
          <div className="flex items-center justify-between mb-4">
            {/* Left Side - User Info */}
            <button
              onClick={() => setShowUserProfile(true)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 transition-colors"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-white shadow-sm"
              >
                <Image
                  src="/images/figma/male.png"
                  alt="User Avatar"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-right">
                <h2 className="font-ibm-arabic-semibold text-gray-900 text-sm">
                  {user?.data?.userName}
                </h2>
                <p className="font-ibm-arabic-medium text-gray-600 text-xs">
                  {user?.data?.job || 'الوظيفة'}
                </p>
              </div>
            </button>

            {/* Right Side - Notifications */}
            <div className="flex items-center">
              <BellIcon count={notifications.length} />
            </div>
          </div>

          {/* Company Info - Compact for Web */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-ibm-arabic-semibold text-gray-900 text-lg flex-1">
                {homeData?.nameCompany || user?.data?.CompanyName || 'اسم الشركة'}
              </h1>
              {isAdmin && (
                <button
                  onClick={handleEditCompany}
                  className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                  title="تعديل بيانات الشركة"
                >
                  {loading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.BLUE}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            <p className="text-sm font-ibm-arabic-medium text-gray-600 text-right">
              <span>رقم السجل التجاري: </span>
              <span className="text-blue-600 font-ibm-arabic-semibold">
                {homeData?.CommercialRegistrationNumber || user?.data?.CommercialRegistrationNumber || 'غير محدد'}
              </span>
            </p>
          </div>



          {/* Action Buttons - Compact for Web */}
          <div className="flex justify-center gap-3 flex-wrap">
            {/* Create Branch - requires Admin permission check */}
            <AdminGuard>
              <ButtonCreat
                text="إنشاء فرع"
                onpress={handleCreateBranch}
                className="px-4 py-2 text-sm"
              />
            </AdminGuard>

            {/* Members - Admin can manage all members */}
            <AdminGuard>
              <ButtonCreat
                text="الأعضاء"
                onpress={handleMembers}
                className="px-4 py-2 text-sm"
              />
            </AdminGuard>

            {/* Covenant - only show if user is Admin or has financial permissions */}
            <PermissionGuard
              permissions={['Admin', 'انشاء عمليات مالية']}
              requireAll={false}
            >
              <ButtonCreat
                text="العهد"
                number={homeData?.Covenantnumber || user?.data?.Covenantnumber || 0}
                onpress={handleCovenant}
                className="px-4 py-2 text-sm"
              />
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Branches Section */}
      <div className="flex-1 px-6 py-4">
        {/* Pull to refresh - Compact */}
        <div className="mb-4 flex justify-center">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-blue-600 hover:text-blue-700 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md font-ibm-arabic-medium text-sm"
          >
            {refreshing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>جاري التحديث...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>تحديث</span>
              </div>
            )}
          </button>
        </div>



        {/* Branches Grid */}
        {homeData?.data && Array.isArray(homeData.data) && homeData.data.length > 0 ? (
          <div className="branches-container mb-20">
            {homeData.data.map((branch: any) => (
              <BranchCard
                key={branch.id}
                title={branch.NameSub}
                projectCount={branch.CountProject || 0}
                onPress={() => handleBranchPress(branch)}
                onSettingsPress={() => handleBranchSettings(branch)}
                onEditPress={() => handleBranchEdit(branch)}
                showSettings={isAdmin}
                showEdit={isAdmin || isBranchManager}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                className="text-gray-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4m0-14a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10m-5 3v6m-2-3h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد فروع</h3>
            <p className="text-gray-500 text-center mb-6 max-w-sm">
              لم يتم إنشاء أي فروع بعد. ابدأ بإنشاء فرع جديد لإدارة مشاريعك.
            </p>
            
            {/* Create Branch Button for empty state - only if admin */}
            {isAdmin && (
              <ButtonCreat
                text="إنشاء أول فرع"
                onpress={handleCreateBranch}
              />
            )}
          </div>
        )}
      </div>

      {/* Branch Edit Modal */}
      <BranchEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedBranch(null);
        }}
        branch={selectedBranch}
        onSave={handleSaveBranch}
        loading={branchOperationLoading}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
    </div>
  );
}