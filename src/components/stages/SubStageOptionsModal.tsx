'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { scale } from '@/utils/responsiveSize';

interface SubStageOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAddNote: () => void;
  onViewNotes: () => void;
  onDelete: () => void;
  loading?: boolean;
  subStage: {
    StageSubID: number;
    StageSubName: string;
    Note?: string | null;
  };
}

const SubStageOptionsModal: React.FC<SubStageOptionsModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onAddNote,
  onViewNotes,
  onDelete,
  loading = false,
  subStage
}) => {
  // Parse notes to get count
  const getNotesCount = () => {
    if (!subStage.Note) return 0;
    try {
      const notes = JSON.parse(subStage.Note);
      return Array.isArray(notes) ? notes.length : 0;
    } catch {
      return 0;
    }
  };

  const notesCount = getNotesCount();
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 
                    className="font-ibm-arabic-bold text-gray-900"
                    style={{ fontSize: scale(16) }}
                  >
                    الإعدادات
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
                {/* Add Note Option */}
                <button
                  onClick={onAddNote}
                  className="w-full flex items-center space-x-3 space-x-reverse p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span
                    className="font-ibm-arabic-semibold text-gray-900"
                    style={{ fontSize: scale(14) }}
                  >
                    إضافة ملاحظة
                  </span>
                </button>

                {/* View Notes Option */}
                {notesCount > 0 && (
                  <button
                    onClick={onViewNotes}
                    className="w-full flex items-center justify-between space-x-3 space-x-reverse p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span
                        className="font-ibm-arabic-semibold text-gray-900"
                        style={{ fontSize: scale(14) }}
                      >
                        عرض الملاحظات
                      </span>
                    </div>
                    <span
                      className="bg-blue-100 text-blue-800 text-xs font-ibm-arabic-semibold px-2 py-1 rounded-full"
                      style={{ fontSize: scale(11) }}
                    >
                      {notesCount}
                    </span>
                  </button>
                )}

                {/* Edit Option */}
                <button
                  onClick={onEdit}
                  className="w-full flex items-center space-x-3 space-x-reverse p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5}
                      d="M14.0737 3.88545C14.8189 3.07808 15.1915 2.6744 15.5874 2.43893C16.5427 1.87076 17.7191 1.85309 18.6904 2.39232C19.0929 2.6158 19.4769 3.00812 20.245 3.79276C21.0131 4.5774 21.3972 4.96972 21.6159 5.38093C22.1438 6.37312 22.1265 7.57479 21.5703 8.5507C21.3398 8.95516 20.9446 9.33578 20.1543 10.097L10.7506 19.1543C9.25288 20.5969 8.504 21.3182 7.56806 21.6837C6.63212 22.0493 5.6032 22.0224 3.54536 21.9686L3.26538 21.9613C2.63891 21.9449 2.32567 21.9367 2.14359 21.73C1.9615 21.5234 1.98636 21.2043 2.03608 20.5662L2.06308 20.2197C2.20301 18.4235 2.27297 17.5255 2.62371 16.7182C2.97444 15.9109 3.57944 15.2555 4.78943 13.9445L14.0737 3.88545Z"
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5}
                      d="M13 4L20 11"
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5}
                      d="M14 22H22"
                    />
                  </svg>
                  <span 
                    className="font-ibm-arabic-semibold text-gray-900"
                    style={{ fontSize: scale(14) }}
                  >
                    تعديل بيانات المرحلة
                  </span>
                </button>

                {/* Delete Option */}
                <button
                  onClick={onDelete}
                  disabled={loading}
                  className="w-full flex items-center space-x-3 space-x-reverse p-4 bg-gray-50 rounded-2xl hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  <span 
                    className={`font-ibm-arabic-semibold ${loading ? 'text-gray-400' : 'text-red-600'}`}
                    style={{ fontSize: scale(14) }}
                  >
                    حذف المرحلة
                  </span>
                </button>
              </div>

              {/* Footer */}
              <div className="p-6 pt-0">
                <div className="text-center">
                  <p 
                    className="text-gray-500 font-ibm-arabic-medium"
                    style={{ fontSize: scale(12) }}
                  >
                    {subStage.StageSubName}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubStageOptionsModal;
