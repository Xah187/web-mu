'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import useValidityUser from '@/hooks/useValidityUser';
import { Tostget } from '@/components/ui/Toast';

interface BranchSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: number;
  branchName: string;
  onEditBranch: () => void;
}

export default function BranchSettingsModal({
  isOpen,
  onClose,
  branchId,
  branchName,
  onEditBranch
}: BranchSettingsModalProps) {
  const router = useRouter();
  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  if (!isOpen) return null;

  const handleEditBranchData = async () => {
    const hasPermission = await Uservalidation('تعديل بيانات الفرغ', 0);
    if (hasPermission) {
      onEditBranch();
      onClose();
    }
  };

  const handleClosedProjects = async () => {
    const hasPermission = await Uservalidation('المشاريع المغلقة', 0);
    if (hasPermission) {
      router.push(`/branch/${branchId}/closed-projects?branchName=${encodeURIComponent(branchName)}`);
      onClose();
    }
  };

  const handleBranchMembers = () => {
    router.push(`/branch/${branchId}/members?branchName=${encodeURIComponent(branchName)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-ibm-arabic-bold text-gray-600 mb-6 text-center">
          الاعدادات
        </h3>
        
        <div className="space-y-3">
          {/* Edit Branch Data */}
          <button
            onClick={handleEditBranchData}
            className="w-full p-4 text-right bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors flex items-center justify-start gap-3"
            disabled={loading.editData}
          >
            {loading.editData ? (
              <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-600">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                <path d="M14 22H22"/>
              </svg>
            )}
            <span className="font-ibm-arabic-semibold text-gray-900">تعديل البيانات</span>
          </button>
          
          {/* Closed Projects */}
          <button
            onClick={handleClosedProjects}
            className="w-full p-4 text-right bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors flex items-center justify-start gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-600">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.2.45 4.53 1.23"/>
              <path d="M16 3v4l4-2"/>
            </svg>
            <span className="font-ibm-arabic-semibold text-gray-900">المشاريع المغلقة</span>
          </button>
          
          {/* Branch Members */}
          <button
            onClick={handleBranchMembers}
            className="w-full p-4 text-right bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors flex items-center justify-start gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-600">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span className="font-ibm-arabic-semibold text-gray-900">اعضاء الفرع</span>
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-200 text-gray-800 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}
