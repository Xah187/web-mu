'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { scale } from '@/utils/responsiveSize';

interface StageInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToClose: () => void;
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
    ClosedBy?: string;
    OpenBy?: string;
  };
}

const StageInfoModal: React.FC<StageInfoModalProps> = ({
  isOpen,
  onClose,
  onProceedToClose,
  stage
}) => {
  const isStageCompleted = stage.Done === 'true';
  const hasNotes = stage.NoteOpen !== null || stage.NoteClosed !== null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'لم يحدد';

    try {
      const date = new Date(dateString);
      // تنسيق بالميلادي بترتيب سنة-شهر-يوم مع الوقت
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

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
                    تفاصيل المرحلة
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
              <div className="p-6 space-y-6">
                {/* Stage Basic Info */}
                <div className="space-y-4">
                  <h3 
                    className="font-ibm-arabic-semibold text-gray-900 text-center"
                    style={{ fontSize: scale(16) }}
                  >
                    {stage.StageName}
                  </h3>

                  {/* Status Badge */}
                  <div className="flex justify-center">
                    <div className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-full ${
                      isStageCompleted 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        {isStageCompleted ? (
                          <>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <circle cx="12" cy="16" r="1"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </>
                        ) : (
                          <>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 8.9-3"/>
                          </>
                        )}
                      </svg>
                      <span 
                        className="font-ibm-arabic-semibold"
                        style={{ fontSize: scale(14) }}
                      >
                        {isStageCompleted ? 'مرحلة مقفلة' : 'مرحلة مفتوحة'}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="text-center">
                    <div className="mb-2">
                      <span 
                        className="font-ibm-arabic-bold text-blue-600"
                        style={{ fontSize: scale(24) }}
                      >
                        {Math.round(stage.rate)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          stage.rate === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${stage.rate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stage Details */}
                <div className="space-y-4">
                  {/* End Date */}
                  {stage.EndDate && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span 
                        className="text-gray-600 font-ibm-arabic-medium"
                        style={{ fontSize: scale(14) }}
                      >
                        تاريخ الانتهاء المتوقع:
                      </span>
                      <span 
                        className="text-gray-900 font-ibm-arabic-semibold"
                        style={{ fontSize: scale(14) }}
                      >
                        {formatDate(stage.EndDate)}
                      </span>
                    </div>
                  )}

                  {/* Close Date and Details */}
                  {isStageCompleted && stage.CloseDate && (
                    <>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span 
                          className="text-red-600 font-ibm-arabic-medium"
                          style={{ fontSize: scale(14) }}
                        >
                          تاريخ الإغلاق:
                        </span>
                        <span 
                          className="text-red-900 font-ibm-arabic-semibold"
                          style={{ fontSize: scale(14) }}
                        >
                          {formatDate(stage.CloseDate)}
                        </span>
                      </div>

                      {stage.Difference !== undefined && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span 
                            className="text-gray-600 font-ibm-arabic-medium"
                            style={{ fontSize: scale(14) }}
                          >
                            الفارق:
                          </span>
                          <span 
                            className={`font-ibm-arabic-semibold ${
                              stage.Difference > 0 ? 'text-green-600' : stage.Difference < 0 ? 'text-red-600' : 'text-gray-900'
                            }`}
                            style={{ fontSize: scale(14) }}
                          >
                            {stage.Difference} يوم
                          </span>
                        </div>
                      )}

                      {stage.ClosedBy && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span 
                            className="text-gray-600 font-ibm-arabic-medium"
                            style={{ fontSize: scale(14) }}
                          >
                            أغلقت بواسطة:
                          </span>
                          <span 
                            className="text-gray-900 font-ibm-arabic-semibold"
                            style={{ fontSize: scale(14) }}
                          >
                            {stage.ClosedBy}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Notes */}
                  {hasNotes && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span 
                          className="text-yellow-700 font-ibm-arabic-semibold"
                          style={{ fontSize: scale(14) }}
                        >
                          ملاحظات المرحلة
                        </span>
                      </div>
                      
                      {stage.NoteClosed && (
                        <div className="mb-2">
                          <span 
                            className="text-yellow-600 font-ibm-arabic-medium text-sm"
                            style={{ fontSize: scale(12) }}
                          >
                            ملاحظة الإغلاق:
                          </span>
                          <p 
                            className="text-yellow-800 font-ibm-arabic-regular mt-1"
                            style={{ fontSize: scale(13) }}
                          >
                            {stage.NoteClosed}
                          </p>
                        </div>
                      )}
                      
                      {stage.NoteOpen && (
                        <div>
                          <span 
                            className="text-yellow-600 font-ibm-arabic-medium text-sm"
                            style={{ fontSize: scale(12) }}
                          >
                            ملاحظة الفتح:
                          </span>
                          <p 
                            className="text-yellow-800 font-ibm-arabic-regular mt-1"
                            style={{ fontSize: scale(13) }}
                          >
                            {stage.NoteOpen}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 space-x-reverse pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-ibm-arabic-semibold hover:bg-gray-200 transition-colors"
                    style={{ fontSize: scale(14) }}
                  >
                    إغلاق
                  </button>
                  
                  <button
                    onClick={onProceedToClose}
                    className={`flex-1 px-4 py-3 text-white rounded-lg font-ibm-arabic-semibold transition-colors ${
                      isStageCompleted 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    style={{ fontSize: scale(14) }}
                  >
                    {isStageCompleted ? 'فتح المرحلة' : 'إغلاق المرحلة'}
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

export default StageInfoModal;
