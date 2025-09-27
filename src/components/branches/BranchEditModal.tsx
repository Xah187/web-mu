'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/store';
import { BranchData } from '@/hooks/useCompanyData';
import { Tostget } from '@/components/ui/Toast';
import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';
import useBranchOperations from '@/hooks/useBranchOperations';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { verticalScale } from '@/utils/responsiveSize';
import BranchDataEditModal from './BranchDataEditModal';
import EvaluationLinkModal from './EvaluationLinkModal';
import BranchDeleteVerificationModal from './BranchDeleteVerificationModal';
import BranchManagerModal from './BranchManagerModal';
import BranchMembersModal from './BranchMembersModal';
import BranchFinanceModal from './BranchFinanceModal';

interface BranchEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: BranchData | null;
  onSave: (updatedBranch: BranchData) => Promise<void>;
  loading?: boolean;
  onRefresh?: () => void;
}

interface OperationButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  title: string;
  isLoading?: boolean;
  isDelete?: boolean;
}

// Edit Icon Component (SvgEdite3)
const EditIcon = ({ size = "25" }: { size?: string }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path
      d="M8.57425 18.3011H7.82584C5.11876 18.3011 3.76522 18.3011 2.92424 17.4469C2.08325 16.5925 2.08325 15.2176 2.08325 12.4678V8.3011C2.08325 5.55124 2.08325 4.17632 2.92424 3.32205C3.76522 2.46777 5.11876 2.46777 7.82584 2.46777H10.2869C12.994 2.46777 14.5755 2.51376 15.4166 3.36803C16.2576 4.2223 16.2499 5.55124 16.2499 8.3011V9.28977"
      stroke="#2117FB"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.2877 1.66675V3.33341M9.121 1.66675V3.33341M4.95435 1.66675V3.33341"
      stroke="#2117FB"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.83325 12.4999H9.16659M5.83325 8.33325H12.4999"
      stroke="#2117FB"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      opacity="0.93"
      d="M17.2999 12.3988C16.5454 11.5535 16.0927 11.6038 15.5897 11.7547C15.2376 11.8051 14.0304 13.2141 13.5274 13.6627C12.7016 14.4786 11.872 15.3186 11.8173 15.4282C11.6609 15.6824 11.5155 16.1327 11.4451 16.6359C11.3143 17.3907 11.1256 18.2405 11.3646 18.3133C11.6035 18.3861 12.2699 18.2462 13.0244 18.1355C13.5274 18.0449 13.8795 17.9442 14.131 17.7933C14.4831 17.582 15.137 16.8372 16.2637 15.7301C16.9704 14.9861 17.6519 14.4721 17.8532 13.9689C18.0544 13.2141 17.7526 12.8115 17.2999 12.3988Z"
      stroke="#2117FB"
      strokeWidth="1.5"
    />
  </svg>
);

// Delete Icon Component (Svgdelete)
const DeleteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M19 6L18.4216 15.1137C18.2738 17.4422 18.1999 18.6065 17.6007 19.4435C17.3044 19.8574 16.9231 20.2066 16.4807 20.4691C15.586 21 14.3884 21 11.9932 21C9.59491 21 8.39575 21 7.50045 20.4681C7.05781 20.2052 6.67627 19.8553 6.3801 19.4407C5.78109 18.6024 5.70882 17.4365 5.5643 15.1047L5 6"
      stroke="#FF0F0F"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M4 6H20M15.6051 6L14.9983 4.79291C14.5952 3.99108 14.3936 3.59016 14.046 3.34012C13.9689 3.28466 13.8872 3.23532 13.8018 3.1926C13.4168 3 12.9548 3 12.0307 3C11.0834 3 10.6098 3 10.2184 3.20067C10.1316 3.24515 10.0489 3.29649 9.97092 3.35415C9.61924 3.61431 9.42278 4.0299 9.02988 4.86108L8.49148 6"
      stroke="#FF0F0F"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10 16V11"
      stroke="#FF0F0F"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M14 16V11"
      stroke="#FF0F0F"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

function OperationButton({ onPress, icon, title, isLoading = false, isDelete = false }: OperationButtonProps) {
  const { size } = useAppSelector((state: any) => state.user);
  
  return (
    <button
      onClick={onPress}
      disabled={isLoading}
      className="operation-button"
      style={{
        borderRadius: 16,
        backgroundColor: '#f6f8fe',
        marginBottom: verticalScale(10),
        borderStyle: 'dashed',
        borderColor: 'rgba(27, 78, 209, 0.2)',
        borderWidth: 1,
        width: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        padding: 10,
        paddingTop: 19,
        paddingBottom: 15,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: size <= 5 ? verticalScale(56) : 'auto',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '1px dashed rgba(27, 78, 209, 0.2)',
        overflow: 'hidden'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#e8f0fe';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#f6f8fe';
      }}
    >
      {/* Loading or Icon */}
      {isLoading ? (
        <div 
          style={{
            width: 25,
            height: 25,
            border: `2px solid ${colors.BLUE}`,
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: 8
          }}
        />
      ) : (
        <div style={{ marginBottom: 8 }}>
          {icon}
        </div>
      )}
      
      {/* Title */}
      <span
        style={{
          fontWeight: '600',
          fontFamily: fonts.IBMPlexSansArabicSemiBold,
          color: isDelete ? colors.RED : colors.BLACK,
          textAlign: 'center',
          margin: '0 9px',
          fontSize: verticalScale(16 + size)
        }}
      >
        {title}
      </span>
    </button>
  );
}

export default function BranchEditModal({
  isOpen,
  onClose,
  branch,
  onSave,
  loading = false,
  onRefresh
}: BranchEditModalProps) {
  const { user, size } = useAppSelector((state: any) => state.user);
  const { isAdmin, hasJobPermission } = useJobBasedPermissions();
  const {
    updateBranchData,
    addEvaluationLink,
    requestBranchDeletion,
    confirmBranchDeletion
  } = useBranchOperations();

  // Loading states for specific operations
  const [loadingOperation, setLoadingOperation] = useState<string | null>(null);
  
  // Modal states
  const [showDataEditModal, setShowDataEditModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showDeleteVerificationModal, setShowDeleteVerificationModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);

  // Operation handlers
  const handleEditBranch = () => {
    setShowDataEditModal(true);
  };

  const handleChangeManager = () => {
    // Open manager modal instead of navigation - مطابق للتطبيق المحمول
    setShowManagerModal(true);
  };

  const handleMemberManagement = () => {
    // Open members modal instead of navigation - مطابق للتطبيق المحمول
    setShowMembersModal(true);
  };

  const handleFinancePermissions = () => {
    // Open finance modal instead of navigation - مطابق للتطبيق المحمول
    setShowFinanceModal(true);
  };

  const handleEvaluationLink = () => {
    setShowEvaluationModal(true);
  };

  const handleDeleteBranch = async () => {
    if (!branch) return;

    // إضافة تحذير أولي
    const confirmMessage = `هل أنت متأكد من حذف فرع "${branch.NameSub}"؟\n\nسيتم حذف جميع المشاريع والبيانات المرتبطة به. هذا الإجراء لا يمكن التراجع عنه.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoadingOperation('إرسال رمز التحقق');
      console.log('Requesting branch deletion for branch:', branch.id);
      await requestBranchDeletion(branch.id);
      console.log('Branch deletion request successful, showing verification modal');
      setShowDeleteVerificationModal(true);
    } catch (error: any) {
      console.error('Error requesting branch deletion:', error);
      Tostget(error.message || 'فشل في إرسال رمز التحقق', 'error');
    } finally {
      setLoadingOperation(null);
    }
  };

  const handleConfirmDeletion = async (verificationCode: string) => {
    try {
      await confirmBranchDeletion(verificationCode);
      onClose();
      // Trigger a refresh of the parent component
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error confirming branch deletion:', error);
      throw error; // Re-throw to be handled by the modal
    }
  };

  // Handle save branch data
  const handleSaveBranchData = async (updatedBranch: any) => {
    try {
      await updateBranchData({
        id: updatedBranch.id,
        NameSub: updatedBranch.NameSub,
        BranchAddress: updatedBranch.BranchAddress,
        Email: updatedBranch.Email,
        PhoneNumber: updatedBranch.PhoneNumber
      });
      
      // Update parent component
      await onSave(updatedBranch);
    } catch (error: any) {
      throw error; // Let the modal handle the error display
    }
  };

  // Handle save evaluation link
  const handleSaveEvaluationLink = async (link: string) => {
    try {
      if (!branch) return;
      
      await addEvaluationLink(branch.id, link);
      
      // Update the branch data
      const updatedBranch = {
        ...branch,
        Linkevaluation: link
      };
      
      await onSave(updatedBranch);
    } catch (error: any) {
      throw error; // Let the modal handle the error display
    }
  };

  if (!isOpen || !branch) return null;

  return (
    <>
      {/* Add keyframes for spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-white rounded-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
          style={{
            maxWidth: '480px',
            minWidth: '400px',
            fontFamily: fonts.IBMPlexSansArabicSemiBold,
            transform: 'translateY(0)',
            margin: 'auto'
          }}
        >
          {/* Header */}
          <div 
            className="border-b relative"
            style={{
              padding: `${verticalScale(16)}px ${verticalScale(20)}px`,
              borderBottomColor: '#e5e7eb',
              borderBottomWidth: 1,
              minHeight: verticalScale(60),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Close button in top-left corner */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                left: verticalScale(16),
                top: verticalScale(16),
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-tertiary)',
                transition: 'color 0.2s ease',
                zIndex: 10
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Centered title */}
            <h2 
              style={{
                fontFamily: fonts.IBMPlexSansArabicSemiBold,
                fontSize: verticalScale(16 + size),
                color: colors.BORDER,
                fontWeight: '600',
                textAlign: 'center',
                margin: 0
              }}
            >
              إعدادات الفرع: {branch.NameSub}
            </h2>
          </div>

          {/* Content - Operations List */}
          <div 
            className="overflow-y-auto"
            style={{
              maxHeight: '75vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: `${verticalScale(20)}px ${verticalScale(16)}px`,
              paddingBottom: verticalScale(30)
            }}
          >
            {/* 1. تعديل بيانات الفرع */}
            <OperationButton
              onPress={handleEditBranch}
              icon={<EditIcon />}
              title="تعديل بيانات الفرع"
              isLoading={loadingOperation === 'تعديل بيانات الفرع'}
            />

            {/* 2. تغيير مدير فرع */}
            {isAdmin && (
              <OperationButton
                onPress={handleChangeManager}
                icon={<EditIcon />}
                title="تغيير مدير فرع"
                isLoading={loadingOperation === 'تغيير مدير فرع'}
              />
            )}

            {/* 3. اضافة او ازالة عضوء */}
            {(isAdmin || hasJobPermission('تعديل صلاحيات')) && (
              <OperationButton
                onPress={handleMemberManagement}
                icon={<EditIcon />}
                title="اضافة او ازالة عضوء"
                isLoading={loadingOperation === 'اضافة او ازالة عضوء'}
              />
            )}

            {/* 4. اضافة صلاحية مالية الفرع */}
            {(isAdmin || hasJobPermission('انشاء عمليات مالية')) && (
              <OperationButton
                onPress={handleFinancePermissions}
                icon={<EditIcon />}
                title="اضافة صلاحية مالية الفرع"
                isLoading={loadingOperation === 'اضافة صلاحية مالية الفرع'}
              />
            )}

            {/* 5. اضافة رابط التقييم */}
            <OperationButton
              onPress={handleEvaluationLink}
              icon={<EditIcon />}
              title="اضافة رابط التقييم"
            />

            {/* 6. حذف الفرع */}
            {isAdmin && (
              <OperationButton
                onPress={handleDeleteBranch}
                icon={<DeleteIcon />}
                title="حذف الفرع"
                isLoading={loadingOperation === 'حذف الفرع'}
                isDelete={true}
              />
            )}
          </div>
        </div>
      </div>

      {/* Sub Modals */}
      <BranchDataEditModal
        isOpen={showDataEditModal}
        onClose={() => setShowDataEditModal(false)}
        branch={branch}
        onSave={handleSaveBranchData}
        loading={loadingOperation === 'تعديل بيانات الفرع'}
      />

      <EvaluationLinkModal
        isOpen={showEvaluationModal}
        onClose={() => setShowEvaluationModal(false)}
        onSave={handleSaveEvaluationLink}
        loading={loadingOperation === 'رابط التقييم'}
        initialLink={branch?.Linkevaluation || ''}
      />

      <BranchDeleteVerificationModal
        isOpen={showDeleteVerificationModal}
        onClose={() => setShowDeleteVerificationModal(false)}
        onConfirm={handleConfirmDeletion}
        loading={loadingOperation === 'حذف الفرع'}
        branchName={branch?.NameSub || ''}
      />

      {/* Branch Manager Modal */}
      <BranchManagerModal
        isOpen={showManagerModal}
        onClose={() => setShowManagerModal(false)}
        branchId={branch?.id?.toString() || ''}
        branchName={branch?.NameSub || ''}
        onSuccess={() => {
          setShowManagerModal(false);
          onRefresh?.();
        }}
      />

      {/* Branch Members Modal */}
      <BranchMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        branchId={branch?.id?.toString() || ''}
        branchName={branch?.NameSub || ''}
        onSuccess={() => {
          setShowMembersModal(false);
          onRefresh?.();
        }}
      />

      {/* Branch Finance Modal */}
      <BranchFinanceModal
        isOpen={showFinanceModal}
        onClose={() => setShowFinanceModal(false)}
        branchId={branch?.id?.toString() || ''}
        branchName={branch?.NameSub || ''}
        onSuccess={() => {
          setShowFinanceModal(false);
          onRefresh?.();
        }}
      />
    </>
  );
}