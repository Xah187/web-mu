'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { fonts } from '@/constants/fonts';
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
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
            <div
              className="w-full shadow-2xl"
              style={{
                backgroundColor: 'var(--theme-card-background)',
                border: '1px solid var(--theme-border)',
                borderRadius: `${scale(20)}px`,
                maxWidth: `${scale(400)}px`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
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
                    style={{ backgroundColor: 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M14.0737 3.88545C14.8189 3.07808 15.1915 2.6744 15.5874 2.43893C16.5427 1.87076 17.7191 1.85309 18.6904 2.39232C19.0929 2.6158 19.4769 3.00812 20.245 3.79276C21.0131 4.5774 21.3972 4.96972 21.6159 5.38093C22.1438 6.37312 22.1265 7.57479 21.5703 8.5507C21.3398 8.95516 20.9446 9.33578 20.1543 10.097L10.7506 19.1543C9.25288 20.5969 8.504 21.3182 7.56806 21.6837C6.63212 22.0493 5.6032 22.0224 3.54536 21.9686L3.26538 21.9613C2.63891 21.9449 2.32567 21.9367 2.14359 21.73C1.9615 21.5234 1.98636 21.2043 2.03608 20.5662L2.06308 20.2197C2.20301 18.4235 2.27297 17.5255 2.62371 16.7182C2.97444 15.9109 3.57944 15.2555 4.78943 13.9445L14.0737 3.88545Z"
                        stroke="var(--theme-primary)"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 4L20 11"
                        stroke="var(--theme-primary)"
                      />
                    </svg>
                  </div>
                  <h2
                    className="font-bold"
                    style={{
                      fontSize: `${scale(18)}px`,
                      fontFamily: fonts.IBMPlexSansArabicBold,
                      color: 'var(--theme-text-primary)',
                      lineHeight: 1.4
                    }}
                  >
                    تعديل المهمة الفرعية
                  </h2>
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
                {/* Current Info */}
                <div
                  className="rounded-xl"
                  style={{
                    backgroundColor: 'var(--theme-info-alpha, rgba(59, 130, 246, 0.1))',
                    padding: scale(16),
                    marginBottom: scale(20)
                  }}
                >
                  <p
                    style={{
                      fontSize: scale(12),
                      color: 'var(--theme-text-secondary)',
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      marginBottom: scale(8)
                    }}
                  >
                    📋 المهمة الحالية:
                  </p>
                  <p
                    style={{
                      fontSize: scale(14),
                      color: 'var(--theme-text-primary)',
                      fontFamily: fonts.IBMPlexSansArabicSemiBold,
                      marginBottom: scale(8)
                    }}
                  >
                    {subStage.StageSubName}
                  </p>
                  {subStage.attached && (
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--theme-success, #10b981)">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span
                        style={{
                          fontSize: scale(11),
                          color: 'var(--theme-success, #10b981)',
                          fontFamily: fonts.IBMPlexSansArabicMedium
                        }}
                      >
                        📎 يحتوي على مرفق
                      </span>
                    </div>
                  )}
                </div>

                {/* Name Input */}
                <div style={{ marginBottom: scale(20) }}>
                  <label
                    className="block"
                    style={{
                      fontSize: scale(14),
                      color: 'var(--theme-text-primary)',
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      marginBottom: scale(8)
                    }}
                  >
                    📝 اسم المهمة الجديد
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="أدخل اسم المهمة الجديد"
                    className="w-full text-right rounded-xl transition-all duration-200 focus:scale-[1.02]"
                    style={{
                      fontSize: scale(14),
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      backgroundColor: 'var(--theme-input-background)',
                      color: 'var(--theme-text-primary)',
                      border: '2px solid var(--theme-border)',
                      padding: `${scale(12)}px ${scale(16)}px`,
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      handleInputFocus();
                      e.target.style.borderColor = 'var(--theme-primary)';
                      e.target.style.boxShadow = '0 0 0 3px var(--theme-primary-alpha)';
                    }}
                    onBlur={(e) => {
                      handleInputBlur();
                      e.target.style.borderColor = 'var(--theme-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* File Input */}
                <div style={{ marginBottom: scale(20) }}>
                  <label
                    className="block"
                    style={{
                      fontSize: scale(14),
                      color: 'var(--theme-text-primary)',
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      marginBottom: scale(8)
                    }}
                  >
                    📎 إرفاق ملف (اختياري)
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
                      className="w-full flex items-center justify-center cursor-pointer rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                      style={{
                        padding: scale(16),
                        border: `2px dashed ${file ? 'var(--theme-success)' : 'var(--theme-border)'}`,
                        backgroundColor: file ? 'var(--theme-success-alpha, rgba(16, 185, 129, 0.1))' : 'var(--theme-surface-secondary)'
                      }}
                    >
                      <div className="text-center">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={file ? 'var(--theme-success)' : 'var(--theme-text-tertiary)'}
                          className="mx-auto mb-2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span
                          style={{
                            fontSize: scale(12),
                            color: file ? 'var(--theme-success)' : 'var(--theme-text-secondary)',
                            fontFamily: fonts.IBMPlexSansArabicMedium
                          }}
                        >
                          {file ? '✅ تم إرفاق ملف بنجاح' : '📁 اضغط لإرفاق ملف'}
                        </span>
                        {file && (
                          <p
                            style={{
                              fontSize: scale(10),
                              color: 'var(--theme-text-tertiary)',
                              fontFamily: fonts.IBMPlexSansArabicRegular,
                              marginTop: scale(4)
                            }}
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
              <div
                className="flex gap-4 justify-center items-center"
                style={{
                  borderTop: '1px solid var(--theme-border)',
                  background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
                  paddingLeft: scale(24),
                  paddingRight: scale(24),
                  paddingTop: scale(16),
                  paddingBottom: scale(16),
                  margin: `${scale(8)}px 0`
                }}
              >
                <button
                  onClick={onClose}
                  className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  style={{
                    fontSize: verticalScale(14),
                    color: 'var(--theme-text-primary)',
                    backgroundColor: 'var(--theme-surface-secondary)',
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    border: '2px solid var(--theme-border)',
                    padding: `${verticalScale(12)}px ${scale(16)}px`,
                    maxWidth: '45%',
                    minHeight: verticalScale(48),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  ❌ إلغاء
                </button>

                <button
                  onClick={handleSave}
                  disabled={loading || !name.trim()}
                  className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                  style={{
                    fontSize: verticalScale(14),
                    color: '#ffffff',
                    backgroundColor: 'var(--theme-primary)',
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    border: '2px solid var(--theme-primary)',
                    padding: `${verticalScale(12)}px ${scale(16)}px`,
                    maxWidth: '45%',
                    minHeight: verticalScale(48),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="border-2 border-white border-t-transparent rounded-full animate-spin"
                        style={{ width: scale(16), height: scale(16) }}
                      />
                      <span>جاري الحفظ...</span>
                    </div>
                  ) : (
                    '💾 حفظ التعديل'
                  )}
                </button>
              </div>

              {/* Decorative bottom element */}
              <div
                className="flex justify-center"
                style={{
                  paddingBottom: scale(8),
                  borderBottomLeftRadius: `${scale(20)}px`,
                  borderBottomRightRadius: `${scale(20)}px`
                }}
              >
                <div
                  className="w-12 h-1 rounded-full"
                  style={{ backgroundColor: 'var(--theme-border)' }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubStageEditModal;
