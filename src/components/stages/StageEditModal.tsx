'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { fonts } from '@/constants/fonts';
import { toast } from '@/lib/toast';
import { useTranslation } from '@/hooks/useTranslation';

interface StageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, days: number, ratio?: number, attached?: string) => Promise<void>;
  stage: {
    StageID: number;
    ProjectID: number;
    StageName: string;
    Days: number;
    Ratio?: number;
    attached?: string;
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
  const { t, isRTL, dir } = useTranslation();
  const [name, setName] = useState('');
  const [days, setDays] = useState('');
  const [ratio, setRatio] = useState('');
  const [attached, setAttached] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (isOpen && stage) {
      setName(stage.StageName || '');
      setDays(String(stage.Days || ''));
      setRatio(String(stage.Ratio || ''));
      setAttached(stage.attached || '');
    }
  }, [isOpen, stage]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(t('projectModals.editStage.requiredName'));
      return;
    }

    if (!days.trim() || isNaN(Number(days)) || Number(days) <= 0) {
      toast.error(t('projectModals.editStage.requiredDays'));
      return;
    }

    try {
      await onSave(
        name.trim(),
        Number(days),
        ratio.trim() ? Number(ratio) : undefined,
        attached.trim() || undefined
      );
      onClose();
      setName('');
      setDays('');
      setRatio('');
      setAttached('');
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
                maxWidth: `${scale(450)}px`,
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
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2"/>
                      <path d="M2 17L12 22L22 17" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2"/>
                      <path d="M2 12L12 17L22 12" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h2
                    className="font-bold"
                    style={{
                      fontSize: `${scale(18)}px`,
                      fontFamily: fonts.IBMPlexSansArabicBold,
                      color: 'var(--theme-text-primary)',
                      lineHeight: 1.4,
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {t('projectModals.editStage.title')}
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
              <div className="p-6 space-y-6">
                {/* Current Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p
                    className="text-gray-600 font-ibm-arabic-medium mb-2"
                    style={{
                      fontSize: scale(12),
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {t('projectModals.editStage.currentStage')}
                  </p>
                  <p
                    className="text-gray-900 font-ibm-arabic-semibold mb-1"
                    style={{
                      fontSize: scale(14),
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {stage.StageName}
                  </p>
                  <p
                    className="text-gray-600 font-ibm-arabic-medium mb-1"
                    style={{
                      fontSize: scale(12),
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {t('projectModals.editStage.daysCount', { days: stage.Days })}
                  </p>
                  {stage.Ratio !== undefined && stage.Ratio !== null && (
                    <p
                      className="text-gray-600 font-ibm-arabic-medium"
                      style={{
                        fontSize: scale(12),
                        direction: dir as 'rtl' | 'ltr',
                        textAlign: isRTL ? 'right' : 'left'
                      }}
                    >
                      {t('projectModals.editStage.ratioCount', { ratio: stage.Ratio })}
                    </p>
                  )}
                </div>

                {/* Stage Name Input */}
                <div className="space-y-2">
                  <label
                    className="block font-ibm-arabic-medium text-gray-700"
                    style={{
                      fontSize: scale(14),
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {t('projectModals.editStage.stageName')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={t('projectModals.editStage.stageNamePlaceholder')}
                    className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-regular focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      fontSize: scale(14),
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                    dir={dir as 'rtl' | 'ltr'}
                  />
                </div>

                {/* Days Input */}
                <div className="space-y-2">
                  <label
                    className="block font-ibm-arabic-medium text-gray-700"
                    style={{
                      fontSize: scale(14),
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {t('projectModals.editStage.daysLabel')}
                  </label>
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={t('projectModals.editStage.daysPlaceholder')}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-regular focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      fontSize: scale(14),
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                    dir={dir as 'rtl' | 'ltr'}
                  />
                </div>

                {/* Ratio Input */}
                <div className="space-y-2">
                  <label
                    className="block font-ibm-arabic-medium text-gray-700"
                    style={{
                      fontSize: scale(14),
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {t('projectModals.editStage.ratioLabel')}
                  </label>
                  <input
                    type="number"
                    value={ratio}
                    onChange={(e) => setRatio(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={t('projectModals.editStage.ratioPlaceholder')}
                    min="0"
                    max="100"
                    className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-regular focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      fontSize: scale(14),
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                    dir={dir as 'rtl' | 'ltr'}
                  />
                </div>

                {/* External Guide Input */}
                <div className="space-y-2">
                  <label
                    className="block font-ibm-arabic-medium text-gray-700"
                    style={{
                      fontSize: scale(14),
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {t('projectModals.editStage.externalGuideLabel')}
                  </label>
                  <input
                    type="text"
                    value={attached}
                    onChange={(e) => setAttached(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={t('projectModals.editStage.externalGuidePlaceholder')}
                    className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-regular focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      fontSize: scale(14),
                      direction: dir as 'rtl' | 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                    dir={dir as 'rtl' | 'ltr'}
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
                      style={{
                        fontSize: scale(11),
                        direction: dir as 'rtl' | 'ltr',
                        textAlign: isRTL ? 'right' : 'left'
                      }}
                    >
                      {t('projectModals.editStage.warning')}
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
                    {t('projectModals.editStage.cancel')}
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
                        <span>{t('projectModals.editStage.saving')}</span>
                      </div>
                    ) : (
                      t('projectModals.editStage.save')
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
