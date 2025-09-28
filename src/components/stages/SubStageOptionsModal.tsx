'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { fonts } from '@/constants/fonts';

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
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
            <div
              className="w-full shadow-2xl"
              style={{
                backgroundColor: 'var(--theme-card-background)',
                border: '1px solid var(--theme-border)',
                borderRadius: `${scale(20)}px`,
                maxWidth: `${scale(350)}px`,
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
                    style={{ backgroundColor: 'var(--theme-warning-alpha, rgba(245, 158, 11, 0.1))' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2"/>
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
                    خيارات المهمة
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
                {/* Add Note Option */}
                <button
                  onClick={onAddNote}
                  className="w-full flex items-center gap-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  style={{
                    padding: scale(16),
                    backgroundColor: 'var(--theme-success-alpha, rgba(16, 185, 129, 0.1))',
                    border: '1px solid var(--theme-success)',
                    marginBottom: scale(12)
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--theme-success)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: scale(14),
                      fontFamily: fonts.IBMPlexSansArabicSemiBold,
                      color: 'var(--theme-success)'
                    }}
                  >
                    📝 إضافة ملاحظة جديدة
                  </span>
                </button>

                {/* View Notes Option */}
                {notesCount > 0 && (
                  <button
                    onClick={onViewNotes}
                    className="w-full flex items-center justify-between rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                    style={{
                      padding: scale(16),
                      backgroundColor: 'var(--theme-info-alpha, rgba(59, 130, 246, 0.1))',
                      border: '1px solid var(--theme-info)',
                      marginBottom: scale(12)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--theme-info)' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span
                        style={{
                          fontSize: scale(14),
                          fontFamily: fonts.IBMPlexSansArabicSemiBold,
                          color: 'var(--theme-info)'
                        }}
                      >
                        📄 عرض الملاحظات
                      </span>
                    </div>
                    <span
                      className="rounded-full"
                      style={{
                        fontSize: scale(11),
                        fontFamily: fonts.IBMPlexSansArabicSemiBold,
                        backgroundColor: 'var(--theme-info)',
                        color: '#ffffff',
                        padding: `${scale(4)}px ${scale(8)}px`
                      }}
                    >
                      {notesCount}
                    </span>
                  </button>
                )}

                {/* Edit Option */}
                <button
                  onClick={onEdit}
                  className="w-full flex items-center gap-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  style={{
                    padding: scale(16),
                    backgroundColor: 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))',
                    border: '1px solid var(--theme-primary)',
                    marginBottom: scale(12)
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.0737 3.88545C14.8189 3.07808 15.1915 2.6744 15.5874 2.43893C16.5427 1.87076 17.7191 1.85309 18.6904 2.39232C19.0929 2.6158 19.4769 3.00812 20.245 3.79276C21.0131 4.5774 21.3972 4.96972 21.6159 5.38093C22.1438 6.37312 22.1265 7.57479 21.5703 8.5507C21.3398 8.95516 20.9446 9.33578 20.1543 10.097L10.7506 19.1543C9.25288 20.5969 8.504 21.3182 7.56806 21.6837C6.63212 22.0493 5.6032 22.0224 3.54536 21.9686L3.26538 21.9613C2.63891 21.9449 2.32567 21.9367 2.14359 21.73C1.9615 21.5234 1.98636 21.2043 2.03608 20.5662L2.06308 20.2197C2.20301 18.4235 2.27297 17.5255 2.62371 16.7182C2.97444 15.9109 3.57944 15.2555 4.78943 13.9445L14.0737 3.88545Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 4L20 11"
                      />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: scale(14),
                      fontFamily: fonts.IBMPlexSansArabicSemiBold,
                      color: 'var(--theme-primary)'
                    }}
                  >
                    ✏️ تعديل بيانات المهمة
                  </span>
                </button>

                {/* Delete Option */}
                <button
                  onClick={onDelete}
                  disabled={loading}
                  className="w-full flex items-center gap-3 rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                  style={{
                    padding: scale(16),
                    backgroundColor: 'var(--theme-error-alpha, rgba(239, 68, 68, 0.1))',
                    border: '1px solid var(--theme-error, #ef4444)',
                    marginBottom: scale(12)
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: loading ? 'var(--theme-text-tertiary)' : 'var(--theme-error, #ef4444)' }}
                  >
                    {loading ? (
                      <div
                        className="animate-spin rounded-full border-2 border-white border-t-transparent"
                        style={{ width: scale(16), height: scale(16) }}
                      />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: scale(14),
                      fontFamily: fonts.IBMPlexSansArabicSemiBold,
                      color: loading ? 'var(--theme-text-tertiary)' : 'var(--theme-error, #ef4444)'
                    }}
                  >
                    🗑️ حذف المهمة
                  </span>
                </button>
              </div>

              {/* Footer */}
              <div
                className="text-center"
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
                <p
                  style={{
                    fontSize: scale(12),
                    color: 'var(--theme-text-secondary)',
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    marginBottom: scale(8)
                  }}
                >
                  🎯 المهمة المحددة:
                </p>
                <p
                  style={{
                    fontSize: scale(14),
                    color: 'var(--theme-text-primary)',
                    fontFamily: fonts.IBMPlexSansArabicSemiBold
                  }}
                >
                  {subStage.StageSubName}
                </p>
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

export default SubStageOptionsModal;
