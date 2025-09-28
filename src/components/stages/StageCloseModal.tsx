'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
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
              className="w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: 'var(--theme-card-background)',
                border: '1px solid var(--theme-border)',
                borderRadius: `${scale(20)}px`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              {/* Header */}
              <div
                className="text-center relative"
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
                    style={{
                      backgroundColor: isStageOpen
                        ? 'var(--theme-error-alpha, rgba(239, 68, 68, 0.1))'
                        : 'var(--theme-success-alpha, rgba(16, 185, 129, 0.1))'
                    }}
                  >
                    {isStageOpen ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6 6 18M6 6l12 12" stroke="var(--theme-error, #ef4444)" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="var(--theme-success, #10b981)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="10" stroke="var(--theme-success, #10b981)" strokeWidth="2"/>
                      </svg>
                    )}
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
                    {actionText.title}
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
                {/* Stage Info */}
                <div
                  className="rounded-xl"
                  style={{
                    backgroundColor: 'var(--theme-surface-secondary)',
                    border: '1px solid var(--theme-border)',
                    padding: scale(16),
                    marginBottom: scale(16)
                  }}
                >
                  <h3
                    className="font-semibold"
                    style={{
                      fontSize: `${scale(16)}px`,
                      fontFamily: fonts.IBMPlexSansArabicSemiBold,
                      color: 'var(--theme-text-primary)',
                      marginBottom: scale(12)
                    }}
                  >
                    {stage.StageName}
                  </h3>

                  <div style={{ marginBottom: scale(8) }}>
                    <p
                      className="font-medium"
                      style={{
                        fontSize: `${scale(14)}px`,
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        color: 'var(--theme-text-secondary)',
                        marginBottom: scale(4)
                      }}
                    >
                      نسبة الإنجاز: <span style={{ color: 'var(--theme-primary)', fontWeight: 'bold' }}>{stage.rate}%</span>
                    </p>

                    {stage.EndDate && (
                      <p
                        className="font-medium"
                        style={{
                          fontSize: `${scale(14)}px`,
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          color: 'var(--theme-text-secondary)',
                          marginBottom: scale(4)
                        }}
                      >
                        تاريخ الانتهاء المتوقع: {formatDate(stage.EndDate)}
                      </p>
                    )}

                    {stage.CloseDate && (
                      <>
                        <p
                          className="font-medium"
                          style={{
                            fontSize: `${scale(14)}px`,
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            color: 'var(--theme-text-secondary)',
                            marginBottom: scale(4)
                          }}
                        >
                          تاريخ الإغلاق: {formatDate(stage.CloseDate)}
                        </p>
                        {stage.Difference !== undefined && (
                          <p
                            className="font-medium"
                            style={{
                              fontSize: `${scale(14)}px`,
                              fontFamily: fonts.IBMPlexSansArabicMedium,
                              color: 'var(--theme-text-secondary)'
                            }}
                          >
                            الفارق: {stage.Difference} يوم
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Validation Messages */}
                {isStageOpen && !isStageCompleted && (
                  <div
                    className="rounded-xl"
                    style={{
                      backgroundColor: 'var(--theme-error-alpha, rgba(239, 68, 68, 0.1))',
                      border: '1px solid var(--theme-error)',
                      padding: scale(16),
                      marginBottom: scale(16)
                    }}
                  >
                    <p
                      className="font-medium"
                      style={{
                        color: 'var(--theme-error)',
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        fontSize: `${scale(14)}px`
                      }}
                    >
                      لا يمكن إغلاق المرحلة قبل إنهاء جميع المهام الفرعية (100%)
                    </p>
                  </div>
                )}

                {/* Note Input */}
                <div style={{ marginBottom: scale(24) }}>
                  <label
                    className="block font-medium"
                    style={{
                      fontSize: `${scale(14)}px`,
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      color: 'var(--theme-text-secondary)',
                      marginBottom: scale(8)
                    }}
                  >
                    الملاحظة *
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={actionText.placeholder}
                    className="w-full rounded-xl transition-all duration-200 focus:scale-[1.02] resize-none"
                    rows={4}
                    style={{
                      padding: `${scale(12)}px ${scale(16)}px`,
                      backgroundColor: 'var(--theme-input-background)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text-primary)',
                      fontSize: `${scale(14)}px`,
                      fontFamily: fonts.IBMPlexSansArabicRegular,
                      textAlign: 'right'
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div
                className="flex gap-3"
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
                    padding: `${scale(12)}px ${scale(24)}px`,
                    backgroundColor: 'var(--theme-surface-secondary)',
                    color: 'var(--theme-text-primary)',
                    fontSize: `${scale(16)}px`,
                    fontFamily: fonts.IBMPlexSansArabicSemiBold,
                    border: '1px solid var(--theme-border)',
                    width: '45%'
                  }}
                >
                  إلغاء
                </button>

                <button
                  onClick={handleCloseOrOpenStage}
                  disabled={loading || !note.trim() || (isStageOpen && !isStageCompleted)}
                  className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    padding: `${scale(12)}px ${scale(24)}px`,
                    backgroundColor: isStageOpen ? 'var(--theme-error)' : 'var(--theme-success)',
                    color: 'white',
                    fontSize: `${scale(16)}px`,
                    fontFamily: fonts.IBMPlexSansArabicSemiBold,
                    border: 'none',
                    width: '45%'
                  }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="animate-spin rounded-full border-b-2 border-white"
                        style={{ width: scale(16), height: scale(16) }}
                      />
                      <span>جاري المعالجة...</span>
                    </div>
                  ) : (
                    actionText.buttonText
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

export default StageCloseModal;
