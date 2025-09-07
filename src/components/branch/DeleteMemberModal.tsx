'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';

interface BranchMember {
  id: number;
  userName: string;
  PhoneNumber: string;
  Email: string;
  job: string;
  jobdiscrption: string;
  jobHOM?: string;
  image?: string;
  Date: string;
}

interface DeleteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: BranchMember | null;
  onSuccess: () => void;
}

export default function DeleteMemberModal({
  isOpen,
  onClose,
  member,
  onSuccess
}: DeleteMemberModalProps) {
  const { user } = useSelector((state: any) => state.user || {});
  const [loading, setLoading] = useState(false);

  if (!isOpen || !member) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      // مطابق للتطبيق المحمول - API حذف مستخدم
      const deleteData = {
        id: member.id,
        PhoneNumber: member.PhoneNumber
      };

      const response = await axiosInstance.put('/user/DeletUser', deleteData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      if (response.data?.success === 'تمت العملية بنجاح') {
        Tostget('تم حذف العضو بنجاح');
        onSuccess();
        onClose();
      } else {
        Tostget(response.data?.success || 'فشل في حذف العضو');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      Tostget('خطأ في حذف العضو');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="text-center">
          {/* أيقونة التحذير */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          
          <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">
            تأكيد حذف العضو
          </h3>
          
          <p className="text-gray-600 font-ibm-arabic-medium mb-6">
            هل أنت متأكد من حذف العضو "{member.userName}"؟
            <br />
            <span className="text-red-600 text-sm">
              لا يمكن التراجع عن هذا الإجراء
            </span>
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
          >
            إلغاء
          </button>
          
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-ibm-arabic-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الحذف...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                </svg>
                حذف العضو
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
