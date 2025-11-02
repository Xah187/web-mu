'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/store';
import ButtonCreat from '@/components/design/ButtonCreat';
import { useCompanyData } from '@/hooks/useCompanyData';
import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';
import useValidityUser from '@/hooks/useValidityUser';
import { AdminGuard } from '@/components/auth/PermissionGuard';

import BranchCard from '@/components/design/BranchCard';
import { Tostget } from '@/components/ui/Toast';
import BranchEditModal from '@/components/branches/BranchEditModal';
import useBranchOperations from '@/hooks/useBranchOperations';

import UserProfileModal from '@/components/user/UserProfileModal';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';

// Import responsive layout components
import ResponsiveLayout, {
  PageHeader,
  ContentSection,
  ResponsiveGrid,
  Card
} from '@/components/layout/ResponsiveLayout';
import SettingsDropdown from '@/components/ui/SettingsDropdown';
import useDataHome from '@/hooks/useDataHome';


export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state: any) => state.user);
  const { t, isRTL } = useTranslation();

  // Use the new company data hook
  const { homeData, loading, refreshData, fetchCompanyData } = useCompanyData();

  // Permission system (existing)
  // Job-based permission system (consistent everywhere - recommended)
  const { isAdmin, isEmployee } = useJobBasedPermissions();

  // Validity-based permission system for specific operations
  const { Uservalidation } = useValidityUser();

  // Branch operations hook
  const { updateBranchData, loading: branchOperationLoading } = useBranchOperations();

  // DataHome hook for saving branch data
  const { saveBranchData } = useDataHome();

  // Branch edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  // User profile modal state
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Screen size state for responsive grid
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    // Handle window resize for responsive grid
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Initial data load is handled by the hook
  }, []);

  // Listen for refresh parameter to update data after changes
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
    } else if (refreshParam === 'company') {
      // Show loading message
      Tostget('جاري تحديث بيانات الشركة...');

      // Refresh data when returning from company info edit
      refreshData().then(() => {
        // Show success message after data is loaded
        setTimeout(() => {
          Tostget('تم تحديث بيانات الشركة بنجاح');
        }, 500);
      });

      // Clear the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('refresh');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, refreshData]);



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
  const handleCovenant = async () => {
    // Check covenant permission like mobile app
    const hasPermission = await Uservalidation('covenant', 0);
    if (hasPermission) {
      // Navigate to covenant page with company branch ID
      // Mobile app: HomeAdmin.tsx line 490-492
      // Passes: IDCompanyBransh: 0 (means all company covenants)
      // typePage defaults to "FinancialCustodyall" in CovenantBrinsh.tsx line 28
      const branchId = 0; // 0 means all company covenants (not specific branch)
      router.push(`/covenant?branchId=${branchId}&type=FinancialCustodyall`);
    }
    // Error message is handled by Uservalidation
  };

  // Handle branch navigation - go to branch projects
  const handleBranchPress = async (branch: any) => {
    // Save branch data to DataHome BEFORE navigation (matching mobile app)
    // Mobile app: Src/Screens/HomeAdmin.tsx passes Email & PhoneNumber in route.params (line 486-492)
    // Web: We save to localStorage before navigation
    console.log('=== Saving Branch Data Before Navigation ===');
    console.log('Branch:', branch);
    console.log('NameSub:', branch.NameSub);
    console.log('Email:', branch.Email);
    console.log('PhoneNumber:', branch.PhoneNumber);

    try {
      await saveBranchData({
        IDCompanyBransh: branch.id,
        nameBransh: branch.NameSub,
        Email: branch.Email,
        PhoneNumber: branch.PhoneNumber
      });
      console.log('✅ Branch data saved before navigation');
    } catch (error) {
      console.error('❌ Error saving branch data:', error);
    }

    console.log('==========================================');

    // Navigate to branch projects page
    router.push(`/branch/${branch.id}/projects?name=${encodeURIComponent(branch.NameSub)}`);
  };

  // Handle branch settings - مطابق للتطبيق المحمول (يفتح modal الإعدادات بـ 6 خيارات)
  // Mobile app: HomeAdmin.tsx line 535-544
  const handleBranchSettings = async (branch: any) => {
    // في التطبيق المحمول: يتحقق من صلاحية Admin
    const hasPermission = await Uservalidation('Admin');
    if (hasPermission) {
      setSelectedBranch(branch);
      setEditModalOpen(true);
    }
    // Error message is handled by Uservalidation
  };

  // Handle save branch changes
  const handleSaveBranch = async (updatedBranch: any) => {
    try {
      // مطابق للتطبيق المحمول - إرسال NumberCompany مع البيانات
      await updateBranchData({
        id: updatedBranch.id,
        NumberCompany: updatedBranch.NumberCompany || user?.data?.IDCompany,
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
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div
              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{
                borderColor: 'var(--color-primary)',
                borderTopColor: 'transparent'
              }}
            ></div>
            <p style={{ color: 'var(--color-text-secondary)' }}>جاري تحميل البيانات...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title={`${t('home.welcome')}، ${user?.data?.userName || t('home.user')}`}
          subtitle={user?.data?.job || t('home.job')}
          actions={
            <div className="flex items-center gap-3">
              <SettingsDropdown showLabel={false} />

              {/* User Profile */}
              <button
                onClick={() => setShowUserProfile(true)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors focus-ring"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 border border-white shadow-sm"
                >
                  <Image
                    src="/images/figma/male.png"
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>
            </div>
          }
        />
      }
    >
      {/* Top section wrapped for consistent inner spacing */}
      <ContentSection>
        {/* Company Info Card */}
        <Card className="mb-6">
          <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="flex-1">
              <h2
                className={`font-semibold mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
                style={{
                  fontSize: 'var(--font-size-xl)',
                  color: 'var(--color-text-primary)'
                }}
              >
                {homeData?.nameCompany || user?.data?.CompanyName || t('home.companyName')}
              </h2>
              <p
                className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span>{t('home.commercialRegistrationNumber')}: </span>
                <span
                  className="font-semibold"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {homeData?.CommercialRegistrationNumber || user?.data?.CommercialRegistrationNumber || t('home.notSpecified')}
                </span>
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleEditCompany}
                className="p-2 rounded-lg transition-colors focus-ring"
                style={{
                  backgroundColor: loading ? 'var(--color-border-light)' : 'transparent',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading}
                title={t('home.editCompany') || 'تعديل بيانات الشركة'}
              >
                {loading ? (
                  <div
                    className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full"
                    style={{ borderColor: 'var(--color-primary)' }}
                  ></div>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="mb-6">
          <h3
            className={`font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-primary)'
            }}
          >
            {t('home.quickActions')}
          </h3>

          <div className={`action-buttons-container ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Create Branch - requires Admin permission check */}
            <AdminGuard>
              <ButtonCreat
                text={t('home.createBranch')}
                onpress={handleCreateBranch}
                className="px-4 py-2.5 text-center text-sm whitespace-nowrap"
              />
            </AdminGuard>

            {/* Members - Admin can manage all members */}
            <AdminGuard>
              <ButtonCreat
                text={t('home.members')}
                onpress={handleMembers}
                className="px-4 py-2.5 text-center text-sm whitespace-nowrap"
              />
            </AdminGuard>

            {/* Covenant - show ONLY for Admin (matching mobile app exactly: HomeAdmin.tsx line 439) */}
            {/* Mobile app: {job === 'Admin' && <ButtonCreat text="العهد" />} */}
            {/* Note: مالية is treated as Admin (job = 'مالية' ? 'Admin' : job) */}
            <AdminGuard>
              <ButtonCreat
                text={t('home.covenant')}
                number={homeData?.Covenantnumber || user?.data?.Covenantnumber || 0}
                onpress={handleCovenant}
                className="px-4 py-2.5 text-center text-sm whitespace-nowrap"
              />
            </AdminGuard>
          </div>
        </Card>
      </ContentSection>

      {/* Branches Section */}
      <ContentSection>
        <h3
          className={`font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-primary)'
          }}
        >
          {t('home.branches')} ({homeData?.data?.length || 0})
        </h3>

        {homeData?.data && Array.isArray(homeData.data) && homeData.data.length > 0 ? (
          <div
            className="branches-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: screenWidth < 480 ? '1fr' : screenWidth < 768 ? 'repeat(2, 1fr)' : screenWidth < 1024 ? 'repeat(3, 1fr)' : screenWidth < 1280 ? 'repeat(4, 1fr)' : 'repeat(5, 1fr)',
              gap: screenWidth < 480 ? '0.75rem' : screenWidth < 768 ? '1.25rem' : '1.5rem',
              width: '100%'
            }}
          >
            {/* مطابق للتطبيق المحمول HomeAdmin.tsx السطر 517-520: يستخدم index كـ key */}
            {/* إضافة فلترة للبيانات المكررة لتجنب مشكلة duplicate keys */}
            {homeData.data
              .filter((branch: any, index: number, self: any[]) =>
                // إزالة الفروع المكررة - الاحتفاظ بأول ظهور فقط
                index === self.findIndex((b: any) => b.id === branch.id)
              )
              .map((branch: any, index: number) => (
              <BranchCard
                key={`branch-${branch.id}-${index}`} // استخدام composite key مطابق للتطبيق المحمول
                title={branch.NameSub}
                projectCount={branch.CountProject || 0}
                onPress={() => handleBranchPress(branch)}
                onSettingsPress={() => handleBranchSettings(branch)}
                showSettings={isAdmin} // مطابق للتطبيق المحمول: displaySetting={permissions['اعدادات'] ? 'flex': 'none'}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4 mx-auto"
              style={{ backgroundColor: 'var(--color-border-light)' }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-secondary)"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4m0-14a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10m-5 3v6m-2-3h4" />
              </svg>
            </div>
            <h3
              className={`font-semibold mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
              style={{
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text-primary)'
              }}
            >
              {t('home.branches')} (0)
            </h3>
            <p
              className={`mb-6 max-w-sm mx-auto ${isRTL ? 'text-right' : 'text-left'}`}
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)'
              }}
            >
              {t('home.noBranchesMessage')}
            </p>

            {/* Create Branch Button for empty state - only if admin */}
            {isAdmin && (
              <ButtonCreat
                text={t('home.createFirstBranch')}
                onpress={handleCreateBranch}
              />
            )}
          </Card>
        )}
      </ContentSection>

      {/* Modals */}
      <BranchEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedBranch(null);
        }}
        branch={selectedBranch}
        onSave={handleSaveBranch}
        loading={branchOperationLoading}
        onRefresh={fetchCompanyData}
      />

      <UserProfileModal
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
    </ResponsiveLayout>
  );
}