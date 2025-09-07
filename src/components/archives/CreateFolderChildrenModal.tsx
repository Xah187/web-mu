'use client';

import React, { useState } from 'react';

interface CreateFolderChildrenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (idHome: number, kind: string, data: string | File) => void;
  archiveId: number;
  currentId: number;
}

export default function CreateFolderChildrenModal({
  isOpen,
  onClose,
  onSuccess,
  archiveId,
  currentId
}: CreateFolderChildrenModalProps) {
  const [activeTab, setActiveTab] = useState<'folder' | 'file'>('folder');
  const [folderName, setFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'folder') {
      if (!folderName.trim()) {
        return;
      }
      onSuccess(archiveId, 'folder', folderName.trim());
    } else {
      if (!selectedFile) {
        return;
      }
      onSuccess(archiveId, 'file', selectedFile);
    }
    
    // Reset form
    setFolderName('');
    setSelectedFile(null);
    setActiveTab('folder');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleClose = () => {
    setFolderName('');
    setSelectedFile(null);
    setActiveTab('folder');
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          {/* أيقونة الإنشاء */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          
          <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">
            إضافة جديد
          </h3>
          
          <p className="text-gray-600 font-ibm-arabic-medium">
            اختر نوع المحتوى الذي تريد إضافته
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('folder')}
            className={`flex-1 py-2 px-4 rounded-md font-ibm-arabic-medium transition-colors ${
              activeTab === 'folder'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            مجلد
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2 px-4 rounded-md font-ibm-arabic-medium transition-colors ${
              activeTab === 'file'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ملف
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'folder' ? (
            <div>
              <label htmlFor="folderName" className="block text-sm font-ibm-arabic-semibold text-gray-700 mb-2">
                اسم المجلد
              </label>
              <input
                type="text"
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="أدخل اسم المجلد..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-ibm-arabic-medium"
                disabled={loading}
                autoFocus
              />
            </div>
          ) : (
            <div>
              <label htmlFor="fileInput" className="block text-sm font-ibm-arabic-semibold text-gray-700 mb-2">
                اختيار ملف
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="fileInput"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                />
                <label
                  htmlFor="fileInput"
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors flex flex-col items-center justify-center min-h-[120px]"
                >
                  {selectedFile ? (
                    <div className="text-center">
                      <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                        </svg>
                      </div>
                      <p className="text-sm font-ibm-arabic-semibold text-gray-900 truncate max-w-full">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7,10 12,15 17,10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </div>
                      <p className="text-sm font-ibm-arabic-medium text-gray-600">
                        اضغط لاختيار ملف
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        أو اسحب الملف هنا
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              إلغاء
            </button>
            
            <button
              type="submit"
              disabled={
                loading || 
                (activeTab === 'folder' && !folderName.trim()) || 
                (activeTab === 'file' && !selectedFile)
              }
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-ibm-arabic-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  إضافة {activeTab === 'folder' ? 'المجلد' : 'الملف'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
