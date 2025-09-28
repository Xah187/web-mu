'use client';

import React, { useState } from 'react';

interface OperationFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onUpdate: () => void;
  input: string | null;
  setInput: (value: string | null) => void;
  type: 'folder' | 'file';
}

export default function OperationFileModal({
  isOpen,
  onClose,
  onDelete,
  onUpdate,
  input,
  setInput,
  type
}: OperationFileModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await onDelete();
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!input?.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onUpdate();
      setShowEditForm(false);
      onClose();
    } catch (error) {
      console.error('Error updating:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    setShowEditForm(false);
    onClose();
  };

  // نموذج تأكيد الحذف
  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
          className="w-full max-w-md shadow-2xl"
          style={{
            backgroundColor: 'var(--theme-card-background)',
            border: '1px solid var(--theme-border)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div className="text-center">
            {/* أيقونة التحذير */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            
            <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">
              تأكيد الحذف
            </h3>
            
            <p className="text-gray-600 font-ibm-arabic-medium mb-6">
              هل أنت متأكد من حذف {type === 'folder' ? 'المجلد' : 'الملف'} "{input}"؟
              <br />
              <span className="text-red-600 text-sm">
                لا يمكن التراجع عن هذا الإجراء
              </span>
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              إلغاء
            </button>
            
            <button
              onClick={confirmDelete}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-ibm-arabic-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الحذف...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                  </svg>
                  حذف
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // نموذج التعديل
  if (showEditForm) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
          className="w-full max-w-md shadow-2xl"
          style={{
            backgroundColor: 'var(--theme-card-background)',
            border: '1px solid var(--theme-border)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div className="text-center mb-6">
            {/* أيقونة التعديل */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            
            <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">
              تعديل {type === 'folder' ? 'المجلد' : 'الملف'}
            </h3>
            
            <p className="text-gray-600 font-ibm-arabic-medium">
              أدخل الاسم الجديد {type === 'folder' ? 'للمجلد' : 'للملف'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="editName" className="block text-sm font-ibm-arabic-semibold text-gray-700 mb-2">
                {type === 'folder' ? 'اسم المجلد' : 'اسم الملف'}
              </label>
              <input
                type="text"
                id="editName"
                value={input || ''}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`أدخل ${type === 'folder' ? 'اسم المجلد' : 'اسم الملف'}...`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-ibm-arabic-medium"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowEditForm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                إلغاء
              </button>
              
              <button
                onClick={handleUpdate}
                disabled={loading || !input?.trim()}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    حفظ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // القائمة الرئيسية للعمليات
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-md shadow-2xl"
        style={{
          backgroundColor: 'var(--theme-card-background)',
          border: '1px solid var(--theme-border)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div className="text-center mb-6">
          <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">
            عمليات {type === 'folder' ? 'المجلد' : 'الملف'}
          </h3>
          
          <p className="text-gray-600 font-ibm-arabic-medium">
            "{input}"
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleEdit}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            تعديل
          </button>

          <button
            onClick={handleDelete}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-ibm-arabic-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
            </svg>
            حذف
          </button>

          <button
            onClick={handleClose}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
