'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { scale } from '@/utils/responsiveSize';
import { toast } from '@/lib/toast';

interface SubStageNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string, files?: File[]) => Promise<void>;
  subStage: {
    StageSubID: number;
    StageSubName: string;
  };
  loading?: boolean;
  editingNote?: {
    id: number;
    Note: string;
    File?: string[] | null;
  } | null;
}

const SubStageNoteModal: React.FC<SubStageNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subStage,
  loading = false,
  editingNote = null
}) => {
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingNote) {
        setNote(editingNote.Note || '');
      } else {
        setNote('');
      }
      setFiles([]);
    }
  }, [isOpen, editingNote]);

  const handleSave = async () => {
    if (!note.trim()) {
      toast.error('يجب إدخال نص الملاحظة');
      return;
    }

    try {
      await onSave(note.trim(), files.length > 0 ? files : undefined);
      onClose();
      setNote('');
      setFiles([]);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
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
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 
                    className="font-ibm-arabic-bold text-gray-900"
                    style={{ fontSize: scale(18) }}
                  >
                    {editingNote ? 'تعديل الملاحظة' : 'إضافة ملاحظة جديدة'}
                  </h2>
                  <p 
                    className="text-gray-600 font-ibm-arabic-medium mt-1"
                    style={{ fontSize: scale(14) }}
                  >
                    {subStage.StageSubName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Note Input */}
                <div className="space-y-2">
                  <label 
                    className="block font-ibm-arabic-medium text-gray-700"
                    style={{ fontSize: scale(14) }}
                  >
                    نص الملاحظة *
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب ملاحظتك هنا..."
                    className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-regular text-right resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    style={{ fontSize: scale(14) }}
                  />
                  <p 
                    className="text-gray-500 text-sm font-ibm-arabic-regular"
                    style={{ fontSize: scale(12) }}
                  >
                    اضغط Ctrl + Enter للحفظ السريع
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <label 
                    className="block font-ibm-arabic-medium text-gray-700"
                    style={{ fontSize: scale(14) }}
                  >
                    المرفقات (اختياري)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="note-files"
                    />
                    <label
                      htmlFor="note-files"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span 
                        className="text-gray-600 font-ibm-arabic-medium"
                        style={{ fontSize: scale(14) }}
                      >
                        اضغط لإضافة ملفات
                      </span>
                    </label>
                  </div>

                  {/* Selected Files */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span 
                            className="text-gray-700 font-ibm-arabic-regular truncate"
                            style={{ fontSize: scale(12) }}
                          >
                            {file.name}
                          </span>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 space-x-reverse p-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 font-ibm-arabic-medium hover:bg-gray-100 rounded-lg transition-colors"
                  style={{ fontSize: scale(14) }}
                >
                  إلغاء
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={loading || !note.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: scale(14) }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2 space-x-reverse">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>جاري الحفظ...</span>
                    </div>
                  ) : (
                    editingNote ? 'حفظ التعديل' : 'إضافة الملاحظة'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubStageNoteModal;
