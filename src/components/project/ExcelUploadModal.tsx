'use client';

import React, { useState, useEffect, useRef } from 'react';
import { scale } from '@/utils/responsiveSize';
import useTemplet from '@/hooks/useTemplet';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number;
  onSuccess?: () => void;
}

export default function ExcelUploadModal({ isOpen, onClose, projectId, onSuccess }: ExcelUploadModalProps) {
  const { fetchExcelTemplate, uploadExcelTemplate, loading } = useTemplet();
  const [templateData, setTemplateData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplateData();
    }
  }, [isOpen]);

  const loadTemplateData = async () => {
    const data = await fetchExcelTemplate();
    setTemplateData(data);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        '.xlsx',
        '.xls'
      ];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        setSelectedFile(file);
      } else {
        alert('يرجى اختيار ملف Excel (.xlsx أو .xls)');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('يرجى اختيار ملف أولاً');
      return;
    }

    const success = await uploadExcelTemplate(selectedFile, projectId);
    if (success) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Close modal first
      onClose();

      // Then call onSuccess to refresh data
      // Use setTimeout to ensure modal is closed before refresh
      setTimeout(() => {
        onSuccess?.();
      }, 100);
    }
  };

  const handleDownloadTemplate = () => {
    if (templateData?.file) {
      window.open(templateData.file, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1001] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-ibm-arabic-bold text-gray-900" style={{ fontSize: scale(18) }}>
            رفع ملف Excel للمراحل
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="إغلاق"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions Section */}
          <div className="space-y-4">
            <h3 className="font-ibm-arabic-semibold text-gray-800" style={{ fontSize: scale(16) }}>
              آلية إضافة المراحل الرئيسية
            </h3>
            
            {/* Image 1 - Main Stages */}
            {templateData?.Image1 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={templateData.Image1} 
                  alt="آلية إضافة المراحل الرئيسية" 
                  className="w-full h-auto"
                />
              </div>
            )}

            <h3 className="font-ibm-arabic-semibold text-gray-800 pt-4" style={{ fontSize: scale(16) }}>
              آلية إضافة المراحل الفرعية
            </h3>

            {/* Image 2 - Sub Stages */}
            {templateData?.Image2 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={templateData.Image2} 
                  alt="آلية إضافة المراحل الفرعية" 
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>

          {/* Download Template Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleDownloadTemplate}
              disabled={!templateData?.file || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-ibm-arabic-semibold flex items-center gap-2"
              style={{ fontSize: scale(14) }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              تنزيل ملف الإرفاق
            </button>
          </div>

          {/* Upload Section */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h3 className="font-ibm-arabic-semibold text-gray-800" style={{ fontSize: scale(16) }}>
              رفع ملف الإرفاق
            </h3>

            {/* File Input */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileSelect}
                className="hidden"
                id="excel-file-input"
              />
              <label
                htmlFor="excel-file-input"
                className="block w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="font-ibm-arabic-medium text-gray-600" style={{ fontSize: scale(14) }}>
                    {selectedFile ? selectedFile.name : 'اضغط لاختيار ملف Excel'}
                  </span>
                  <span className="text-xs text-gray-500">
                    (.xlsx, .xls)
                  </span>
                </div>
              </label>

              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-ibm-arabic-medium text-gray-700" style={{ fontSize: scale(13) }}>
                      {selectedFile.name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-ibm-arabic-semibold flex items-center gap-2"
                style={{ fontSize: scale(14) }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    رفع ملف الإرفاق
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-yellow-600 flex-shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="space-y-1">
                <p className="font-ibm-arabic-semibold text-yellow-800" style={{ fontSize: scale(13) }}>
                  ملاحظة مهمة:
                </p>
                <p className="font-ibm-arabic-regular text-yellow-700" style={{ fontSize: scale(12) }}>
                  • يجب أن يكون الملف بصيغة Excel (.xlsx أو .xls)
                  <br />
                  • يجب اتباع التنسيق الموضح في الصور أعلاه
                  <br />
                  • يمكنك تنزيل ملف القالب واستخدامه كمرجع
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-ibm-arabic-medium"
            style={{ fontSize: scale(14) }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

