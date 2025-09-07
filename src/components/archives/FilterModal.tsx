'use client';

import React, { useState, useEffect } from 'react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  setTitle: (title: string) => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  title,
  setTitle
}: FilterModalProps) {
  const [searchTerm, setSearchTerm] = useState(title);

  useEffect(() => {
    setSearchTerm(title);
  }, [title]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTitle(searchTerm);
    onClose();
  };

  const handleClear = () => {
    setSearchTerm('');
    setTitle('');
    onClose();
  };

  const handleClose = () => {
    setSearchTerm(title); // Reset to original value
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          {/* أيقونة الفلترة */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
            </svg>
          </div>
          
          <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">
            فلترة المجلدات
          </h3>
          
          <p className="text-gray-600 font-ibm-arabic-medium">
            ابحث عن مجلد معين في الأرشيف
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="searchTerm" className="block text-sm font-ibm-arabic-semibold text-gray-700 mb-2">
              اسم المجلد
            </label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن مجلد..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-ibm-arabic-medium"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>

            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-ibm-arabic-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                مسح
              </button>
            )}
            
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-ibm-arabic-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              بحث
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
