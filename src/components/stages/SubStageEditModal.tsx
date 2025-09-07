'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { scale } from '@/utils/responsiveSize';
import { toast } from '@/lib/toast';

interface SubStageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, file?: File) => Promise<void>;
  subStage: {
    StageSubID: number;
    StageSubName: string;
    attached?: string | null;
  };
  loading?: boolean;
}

const SubStageEditModal: React.FC<SubStageEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subStage,
  loading = false
}) => {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (isOpen && subStage) {
      setName(subStage.StageSubName || '');
      setFile(null);
    }
  }, [isOpen, subStage]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('يجب إدخال اسم المهمة');
      return;
    }

    try {
      await onSave(name.trim(), file || undefined);
      onClose();
      setName('');
      setFile(null);
    } catch (error) {
      console.error('Error updating sub-stage:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleInputFocus = () => {
    setKeyboardVisible(true);
  };

  const handleInputBlur = () => {
    setKeyboardVisible(false);
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
            initial={{ opacity: 0, scale: 0.95, y: keyboardVisible ? -100 : 20 }}
            animate={{ opacity: 1, scale: 1, y: keyboardVisible ? -100 : 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 
                    className="font-ibm-arabic-bold text-gray-900"
                    style={{ fontSize: scale(16) }}
                  >
                    تعديل المهمة
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
                {/* Current Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p 
                    className="text-gray-600 font-ibm-arabic-medium mb-2"
                    style={{ fontSize: scale(12) }}
                  >
                    المهمة الحالية:
                  </p>
                  <p 
                    className="text-gray-900 font-ibm-arabic-semibold"
                    style={{ fontSize: scale(14) }}
                  >
                    {subStage.StageSubName}
                  </p>
                  {subStage.attached && (
                    <div className="mt-2 flex items-center space-x-2 space-x-reverse">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span 
                        className="text-gray-500 font-ibm-arabic-medium"
                        style={{ fontSize: scale(11) }}
                      >
                        يحتوي على مرفق
                      </span>
                    </div>
                  )}
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <label 
                    className="block font-ibm-arabic-medium text-gray-700"
                    style={{ fontSize: scale(14) }}
                  >
                    اسم المهمة الجديد
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="أدخل اسم المهمة الجديد"
                    className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-regular text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ fontSize: scale(14) }}
                  />
                </div>

                {/* File Input */}
                <div className="space-y-2">
                  <label 
                    className="block font-ibm-arabic-medium text-gray-700"
                    style={{ fontSize: scale(14) }}
                  >
                    إرفاق ملف (اختياري)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-input"
                      accept="*/*"
                    />
                    <label
                      htmlFor="file-input"
                      className="w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <div className="text-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto mb-2 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span 
                          className={`font-ibm-arabic-medium ${file ? 'text-green-600' : 'text-gray-500'}`}
                          style={{ fontSize: scale(12) }}
                        >
                          {file ? 'تم إرفاق ملف بنجاح' : 'إرفاق ملف'}
                        </span>
                        {file && (
                          <p 
                            className="text-gray-400 font-ibm-arabic-regular mt-1"
                            style={{ fontSize: scale(10) }}
                          >
                            {file.name}
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-0">
                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-ibm-arabic-semibold hover:bg-gray-200 transition-colors"
                    style={{ fontSize: scale(14) }}
                  >
                    إلغاء
                  </button>
                  
                  <button
                    onClick={handleSave}
                    disabled={loading || !name.trim()}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontSize: scale(14) }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2 space-x-reverse">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        <span>جاري الحفظ...</span>
                      </div>
                    ) : (
                      'حفظ التعديل'
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

export default SubStageEditModal;
