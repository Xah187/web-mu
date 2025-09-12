'use client';

import React from 'react';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileType: 'image' | 'video' | 'document';
  fileName?: string;
}

export default function FileViewerModal({
  isOpen,
  onClose,
  fileUrl,
  fileType,
  fileName
}: FileViewerModalProps) {
  if (!isOpen) return null;

  // بناء URL الملف - مطابق للتطبيق المحمول
  const getFileUrl = () => {
    // استخدام نفس URLFIL من التطبيق المحمول
    const URLFIL = 'https://storage.googleapis.com/demo_backendmoshrif_bucket-1';
    return `${URLFIL}/${fileUrl}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getFileUrl();
    link.download = fileName || fileUrl;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    const fullUrl = getFileUrl();

    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center">
            <img
              src={fullUrl}
              alt={fileName || fileUrl}
              className="max-w-full max-h-[calc(90vh-120px)] object-contain rounded-lg"
              onError={(e) => {
                console.error('Error loading image:', e);
              }}
            />
          </div>
        );

      case 'video':
        return (
          <div className="flex items-center justify-center">
            <video
              src={fullUrl}
              controls
              className="max-w-full max-h-[calc(90vh-120px)] rounded-lg"
              onError={(e) => {
                console.error('Error loading video:', e);
              }}
            >
              متصفحك لا يدعم تشغيل الفيديو
            </video>
          </div>
        );

      case 'document':
        return (
          <div className="w-full h-[calc(90vh-120px)]">
            <object data={fullUrl} type="application/pdf" className="w-full h-full rounded-lg">
              <iframe src={fullUrl} className="w-full h-full rounded-lg" />
              <div className="text-center py-12">
                <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">{fileName || fileUrl}</h3>
                <p className="text-gray-600 font-ibm-arabic-medium mb-4">
                  لا يمكن عرض المستند هنا، يمكنك تحميله لفتحه.
                </p>
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-ibm-arabic-medium inline-flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  تحميل الملف
                </button>
              </div>
            </object>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <p className="text-gray-500 font-ibm-arabic-medium">
              لا يمكن عرض هذا النوع من الملفات
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-7xl max-h-[90vh] w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-ibm-arabic-bold text-gray-900 truncate">
            {fileName || fileUrl}
          </h3>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {(fileType === 'image' || fileType === 'video') && (
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="تحميل"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="إغلاق"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
