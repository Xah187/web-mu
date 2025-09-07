'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { scale } from '@/utils/responsiveSize';
import { toast } from '@/lib/toast';

interface StageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, days: number) => Promise<void>;
  stage: {
    StageID: number;
    ProjectID: number;
    StageName: string;
    Days: number;
  };
  loading?: boolean;
}

const StageEditModal: React.FC<StageEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  stage,
  loading = false
}) => {
  const [name, setName] = useState('');
  const [days, setDays] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (isOpen && stage) {
      setName(stage.StageName || '');
      setDays(String(stage.Days || ''));
    }
  }, [isOpen, stage]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('يجب إدخال اسم المرحلة');
      return;
    }

    if (!days.trim() || isNaN(Number(days)) || Number(days) <= 0) {
      toast.error('يجب إدخال عدد أيام صحيح');
      return;
    }

    try {
      await onSave(name.trim(), Number(days));
      onClose();
      setName('');
      setDays('');
    } catch (error) {
      console.error('Error updating stage:', error);
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
                    تعديل المرحلة
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
                    المرحلة الحالية:
                  </p>
                  <p 
                    className="text-gray-900 font-ibm-arabic-semibold mb-1"
                    style={{ fontSize: scale(14) }}
                  >
                    {stage.StageName}
                  </p>
                  <p 
                    className="text-gray-600 font-ibm-arabic-medium"
                    style={{ fontSize: scale(12) }}
                  >
                    عدد الأيام: {stage.Days} يوم
                  </p>
                </div>

                {/* Stage Name Input */}
                <div className="space-y-2">
                  <label 
                    className="block font-ibm-arabic-medium text-gray-700"
                    style={{ fontSize: scale(14) }}
                  >
                    اسم المرحلة
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="أدخل اسم المرحلة"
                    className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-regular text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ fontSize: scale(14) }}
                  />
                </div>

                {/* Days Input */}
                <div className="space-y-2">
                  <label 
                    className="block font-ibm-arabic-medium text-gray-700"
                    style={{ fontSize: scale(14) }}
                  >
                    عدد أيام المرحلة
                  </label>
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="أدخل عدد الأيام"
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-regular text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ fontSize: scale(14) }}
                  />
                </div>

                {/* Warning Message */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span 
                      className="text-yellow-700 font-ibm-arabic-medium"
                      style={{ fontSize: scale(11) }}
                    >
                      قد لا يتم تغيير عدد الأيام إذا كانت هناك مراحل مقفلة
                    </span>
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
                    disabled={loading || !name.trim() || !days.trim()}
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

export default StageEditModal;
