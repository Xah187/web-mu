'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { scale, verticalScale } from '@/utils/responsiveSize';
import useValidityUser from '@/hooks/useValidityUser';
import axiosInstance from '@/lib/api/axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toast } from '@/lib/toast';

interface StageCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: {
    StageID: number;
    ProjectID: number;
    StageName: string;
    Done: string;
    rate: number;
    CloseDate?: string | null;
    NoteClosed?: string | null;
    NoteOpen?: string | null;
    EndDate?: string;
    Difference?: number;
  };
  onSuccess?: () => void;
}

const StageCloseModal: React.FC<StageCloseModalProps> = ({
  isOpen,
  onClose,
  stage,
  onSuccess
}) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { Uservalidation } = useValidityUser();
  const user = useSelector((state: RootState) => state.user);

  const isStageCompleted = stage.rate === 100;
  const isStageOpen = stage.Done === 'false';
  const hasNotes = stage.NoteOpen !== null || stage.NoteClosed !== null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'لم يحدد';

    try {
      const date = new Date(dateString);
      // تنسيق بالميلادي بترتيب سنة-شهر-يوم
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  const handleCloseOrOpenStage = async () => {
    if (!note.trim()) {
      toast.error('يجب إدخال الملاحظة أولاً');
      return;
    }

    // Check if trying to close an incomplete stage
    if (isStageOpen && !isStageCompleted) {
      toast.error('لا يمكن إغلاق المرحلة قبل إنهاء جميع المهام الفرعية (100%)');
      return;
    }

    // Check permissions
    const hasPermission = await Uservalidation('اقفال المرحلة', stage.ProjectID);
    if (!hasPermission) {
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(
        '/brinshCompany/ClassCloaseOROpenStage',
        {
          StageID: stage.StageID,
          ProjectID: stage.ProjectID,
          Note: note,
          RecordedBy: user?.user?.data?.userName || '',
        },
        {
          headers: {
            Authorization: `Bearer ${user?.user?.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const successMessage = response.data?.success || 'تمت العملية بنجاح';
        toast.success(successMessage);

        // إذا كانت الرسالة تحتوي على خطأ من الباك إند (مثل عدم اكتمال المهام)
        if (successMessage.includes('لايمكن اغلاق')) {
          setLoading(false);
          return;
        }

        onSuccess?.();
        onClose();
        setNote('');
      }
    } catch (error: any) {
      console.error('Error closing/opening stage:', error);
      const errorMessage = error.response?.data?.success || 'فشل في تنفيذ العملية';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getActionText = () => {
    if (isStageOpen) {
      return {
        title: 'عملية إغلاق المرحلة',
        placeholder: 'ملاحظة لإغلاق المرحلة',
        buttonText: 'إغلاق المرحلة',
        buttonColor: 'bg-red-600 hover:bg-red-700'
      };
    } else {
      return {
        title: 'عملية فتح المرحلة',
        placeholder: 'اعطي سبب واضح لفتح المرحلة',
        buttonText: 'فتح المرحلة',
        buttonColor: 'bg-green-600 hover:bg-green-700'
      };
    }
  };

  const actionText = getActionText();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 
                    className="font-ibm-arabic-bold text-gray-900"
                    style={{ fontSize: scale(18) }}
                  >
                    {actionText.title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Stage Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h3 
                    className="font-ibm-arabic-semibold text-gray-900"
                    style={{ fontSize: scale(16) }}
                  >
                    {stage.StageName}
                  </h3>
                  
                  <div className="space-y-1 text-sm">
                    <p className="font-ibm-arabic-medium text-gray-600">
                      نسبة الإنجاز: <span className="text-blue-600 font-bold">{stage.rate}%</span>
                    </p>
                    
                    {stage.EndDate && (
                      <p className="font-ibm-arabic-medium text-gray-600">
                        تاريخ الانتهاء المتوقع: {formatDate(stage.EndDate)}
                      </p>
                    )}

                    {stage.CloseDate && (
                      <>
                        <p className="font-ibm-arabic-medium text-gray-600">
                          تاريخ الإغلاق: {formatDate(stage.CloseDate)}
                        </p>
                        {stage.Difference !== undefined && (
                          <p className="font-ibm-arabic-medium text-gray-600">
                            الفارق: {stage.Difference} يوم
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Validation Messages */}
                {isStageOpen && !isStageCompleted && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 font-ibm-arabic-medium text-sm">
                      لا يمكن إغلاق المرحلة قبل إنهاء جميع المهام الفرعية (100%)
                    </p>
                  </div>
                )}

                {/* Note Input */}
                <div className="space-y-2">
                  <label 
                    className="block font-ibm-arabic-medium text-gray-700"
                    style={{ fontSize: scale(14) }}
                  >
                    الملاحظة *
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={actionText.placeholder}
                    className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-regular text-right resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    style={{ fontSize: scale(14) }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 space-x-reverse pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-ibm-arabic-semibold hover:bg-gray-200 transition-colors"
                    style={{ fontSize: scale(14) }}
                  >
                    إلغاء
                  </button>
                  
                  <button
                    onClick={handleCloseOrOpenStage}
                    disabled={loading || !note.trim() || (isStageOpen && !isStageCompleted)}
                    className={`flex-1 px-4 py-3 text-white rounded-lg font-ibm-arabic-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${actionText.buttonColor}`}
                    style={{ fontSize: scale(14) }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2 space-x-reverse">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        <span>جاري المعالجة...</span>
                      </div>
                    ) : (
                      actionText.buttonText
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StageCloseModal;
