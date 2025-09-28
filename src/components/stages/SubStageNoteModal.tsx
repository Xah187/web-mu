'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { fonts } from '@/constants/fonts';
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full mx-auto relative"
              style={{
                backgroundColor: 'var(--theme-card-background)',
                border: '1px solid var(--theme-border)',
                borderRadius: `${scale(20)}px`,
                maxWidth: `${scale(450)}px`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="text-center"
                style={{
                  borderBottom: '1px solid var(--theme-border)',
                  background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
                  paddingLeft: scale(24),
                  paddingRight: scale(24),
                  paddingTop: scale(20),
                  paddingBottom: scale(20),
                  marginBottom: scale(16),
                  borderTopLeftRadius: `${scale(20)}px`,
                  borderTopRightRadius: `${scale(20)}px`
                }}
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--theme-success-alpha, rgba(16, 185, 129, 0.1))' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="var(--theme-success, #10b981)" strokeWidth="2"/>
                      <polyline points="14,2 14,8 20,8" stroke="var(--theme-success, #10b981)" strokeWidth="2"/>
                      <line x1="16" y1="13" x2="8" y2="13" stroke="var(--theme-success, #10b981)" strokeWidth="2"/>
                      <line x1="16" y1="17" x2="8" y2="17" stroke="var(--theme-success, #10b981)" strokeWidth="2"/>
                      <polyline points="10,9 9,9 8,9" stroke="var(--theme-success, #10b981)" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <h2
                      className="font-bold"
                      style={{
                        fontSize: `${scale(18)}px`,
                        fontFamily: fonts.IBMPlexSansArabicBold,
                        color: 'var(--theme-text-primary)',
                        lineHeight: 1.4
                      }}
                    >
                      {editingNote ? 'تعديل الملاحظة' : 'إضافة ملاحظة جديدة'}
                    </h2>
                    <p
                      style={{
                        fontSize: `${scale(14)}px`,
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        color: 'var(--theme-text-secondary)',
                        marginTop: scale(4)
                      }}
                    >
                      {subStage.StageSubName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-4 left-4 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
                  style={{
                    padding: '10px',
                    backgroundColor: 'var(--theme-surface-secondary)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text-secondary)'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div style={{ paddingLeft: scale(24), paddingRight: scale(24), paddingBottom: scale(16) }}>
                {/* Note Input */}
                <div style={{ marginBottom: scale(20) }}>
                  <label
                    className="block"
                    style={{
                      fontSize: scale(14),
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      color: 'var(--theme-text-primary)',
                      marginBottom: scale(8)
                    }}
                  >
                    نص الملاحظة *
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب ملاحظتك هنا..."
                    className="w-full rounded-xl transition-all duration-200 focus:scale-[1.02] resize-none"
                    rows={4}
                    style={{
                      padding: scale(12),
                      backgroundColor: 'var(--theme-input-background)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text-primary)',
                      fontSize: scale(14),
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      textAlign: 'right'
                    }}
                  />
                  <p
                    style={{
                      fontSize: scale(12),
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      color: 'var(--theme-text-secondary)',
                      marginTop: scale(8)
                    }}
                  >
                    اضغط Ctrl + Enter للحفظ السريع
                  </p>
                </div>

                {/* File Upload */}
                <div style={{ marginBottom: scale(24) }}>
                  <label
                    className="block"
                    style={{
                      fontSize: scale(14),
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      color: 'var(--theme-text-primary)',
                      marginBottom: scale(8)
                    }}
                  >
                    المرفقات (اختياري)
                  </label>
                  <div
                    className="rounded-xl text-center transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      border: '2px dashed var(--theme-border)',
                      padding: scale(16),
                      backgroundColor: 'var(--theme-surface-secondary)'
                    }}
                  >
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
                      className="cursor-pointer flex flex-col items-center"
                      style={{ gap: scale(8) }}
                    >
                      <svg
                        width={scale(32)}
                        height={scale(32)}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--theme-text-secondary)"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span
                        style={{
                          fontSize: scale(14),
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          color: 'var(--theme-text-secondary)'
                        }}
                      >
                        اضغط لإضافة ملفات
                      </span>
                    </label>
                  </div>

                  {/* Selected Files */}
                  {files.length > 0 && (
                    <div style={{ marginTop: scale(12), gap: scale(8), display: 'flex', flexDirection: 'column' }}>
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-xl transition-all duration-200"
                          style={{
                            padding: scale(12),
                            backgroundColor: 'var(--theme-surface-secondary)',
                            border: '1px solid var(--theme-border)'
                          }}
                        >
                          <span
                            className="truncate"
                            style={{
                              fontSize: scale(12),
                              fontFamily: fonts.IBMPlexSansArabicRegular,
                              color: 'var(--theme-text-primary)'
                            }}
                          >
                            {file.name}
                          </span>
                          <button
                            onClick={() => removeFile(index)}
                            className="rounded-lg transition-all duration-200 hover:scale-110"
                            style={{
                              padding: scale(4),
                              color: 'var(--theme-error)',
                              backgroundColor: 'var(--theme-error-alpha, rgba(239, 68, 68, 0.1))'
                            }}
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
              <div
                className="flex gap-4 justify-center items-center relative"
                style={{
                  borderTop: '1px solid var(--theme-border)',
                  background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
                  paddingLeft: scale(24),
                  paddingRight: scale(24),
                  paddingTop: scale(16),
                  paddingBottom: scale(16),
                  margin: `${scale(8)}px 0`,
                  borderBottomLeftRadius: `${scale(20)}px`,
                  borderBottomRightRadius: `${scale(20)}px`
                }}
              >
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                  style={{
                    fontSize: scale(14),
                    color: 'var(--theme-text-primary)',
                    backgroundColor: 'var(--theme-surface-secondary)',
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    border: '2px solid var(--theme-border)',
                    padding: `${scale(12)}px ${scale(16)}px`,
                    flex: '1',
                    minHeight: scale(48),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  إلغاء
                </button>

                <button
                  onClick={handleSave}
                  disabled={loading || !note.trim()}
                  className="text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                  style={{
                    fontSize: scale(14),
                    color: '#ffffff',
                    backgroundColor: 'var(--theme-success)',
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    border: '2px solid var(--theme-success)',
                    padding: `${scale(12)}px ${scale(16)}px`,
                    flex: '1',
                    minHeight: scale(48),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center" style={{ gap: scale(8) }}>
                      <div
                        className="border-2 border-white border-t-transparent rounded-full animate-spin"
                        style={{ width: scale(16), height: scale(16) }}
                      />
                      <span>جاري الحفظ...</span>
                    </div>
                  ) : (
                    editingNote ? 'حفظ التعديل' : 'إضافة الملاحظة'
                  )}
                </button>

                {/* Decorative bottom element */}
                <div
                  className="flex justify-center"
                  style={{
                    position: 'absolute',
                    bottom: scale(8),
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%'
                  }}
                >
                  <div
                    className="w-12 h-1 rounded-full"
                    style={{ backgroundColor: 'var(--theme-border)' }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubStageNoteModal;
