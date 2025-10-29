'use client';

import React, { useState } from 'react';
import { scale } from '@/utils/responsiveSize';

interface StageAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  stageName: string;
}

const StageAchievementModal: React.FC<StageAchievementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  stageName
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedFile);
      handleClose();
    } catch (error) {
      console.error('Error uploading achievement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg mx-4"
        style={{
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="border-b border-gray-200"
          style={{
            padding: `${scale(20)}px ${scale(24)}px`
          }}
        >
          <div className="flex items-center justify-between">
            <h3
              className="font-ibm-arabic-bold text-gray-900"
              style={{ fontSize: `${scale(18)}px` }}
            >
              إرفاق إنجاز المرحلة
            </h3>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p
            className="text-gray-600 font-ibm-arabic-medium mt-2"
            style={{ fontSize: `${scale(14)}px` }}
          >
            {stageName}
          </p>
        </div>

        {/* Content */}
        <div
          style={{
            padding: `${scale(24)}px`
          }}
        >
          {/* File Input */}
          <div className="mb-6">
            <label
              className="block text-gray-700 font-ibm-arabic-semibold mb-3"
              style={{ fontSize: `${scale(14)}px` }}
            >
              اختر ملف أو صورة
            </label>
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg font-ibm-arabic-medium"
              style={{
                padding: `${scale(12)}px`,
                fontSize: `${scale(14)}px`
              }}
            />
          </div>

          {/* Preview */}
          {selectedFile && (
            <div className="mb-6">
              <p
                className="text-gray-700 font-ibm-arabic-semibold mb-3"
                style={{ fontSize: `${scale(14)}px` }}
              >
                معاينة
              </p>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full rounded-lg border border-gray-200"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              ) : (
                <div
                  className="bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center"
                  style={{
                    padding: `${scale(40)}px`,
                    minHeight: '200px'
                  }}
                >
                  <div className="text-center">
                    <svg
                      width={scale(48)}
                      height={scale(48)}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9CA3AF"
                      className="mx-auto mb-3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p
                      className="text-gray-500 font-ibm-arabic-medium"
                      style={{ fontSize: `${scale(14)}px` }}
                    >
                      {selectedFile.name}
                    </p>
                    <p
                      className="text-gray-400 font-ibm-arabic-medium mt-1"
                      style={{ fontSize: `${scale(12)}px` }}
                    >
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="border-t border-gray-200 flex gap-3"
          style={{
            padding: `${scale(20)}px ${scale(24)}px`
          }}
        >
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-100 text-gray-700 font-ibm-arabic-semibold rounded-lg hover:bg-gray-200 transition-colors"
            style={{
              padding: `${scale(12)}px`,
              fontSize: `${scale(14)}px`
            }}
            disabled={isSubmitting}
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isSubmitting}
            className={`flex-1 font-ibm-arabic-semibold rounded-lg transition-colors ${
              !selectedFile || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            style={{
              padding: `${scale(12)}px`,
              fontSize: `${scale(14)}px`
            }}
          >
            {isSubmitting ? 'جارٍ الرفع...' : 'رفع'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageAchievementModal;

