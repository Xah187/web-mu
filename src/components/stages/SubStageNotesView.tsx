'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { scale } from '@/utils/responsiveSize';
import { SubStageNote } from '@/hooks/useSubStages';
import { formatDateEnglish } from '@/hooks/useFinance';

interface SubStageNotesViewProps {
  notes: SubStageNote[];
  onEditNote: (note: SubStageNote) => void;
  onDeleteNote: (noteId: number) => void;
  canEdit?: boolean;
  loading?: boolean;
}

const SubStageNotesView: React.FC<SubStageNotesViewProps> = ({
  notes,
  onEditNote,
  onDeleteNote,
  canEdit = false,
  loading = false
}) => {
  const [expandedNote, setExpandedNote] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    return formatDateEnglish(dateString);
  };

  const handleDeleteConfirm = (noteId: number) => {
    onDeleteNote(noteId);
    setShowDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mx-auto text-gray-400 mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p 
          className="text-gray-500 font-ibm-arabic-medium"
          style={{ fontSize: scale(14) }}
        >
          لا توجد ملاحظات
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <motion.div
          key={note.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
        >
          {/* Note Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 space-x-reverse mb-1">
                <span 
                  className="font-ibm-arabic-semibold text-gray-900"
                  style={{ fontSize: scale(14) }}
                >
                  {note.userName}
                </span>
                <span 
                  className="text-gray-500 font-ibm-arabic-regular"
                  style={{ fontSize: scale(12) }}
                >
                  •
                </span>
                <span 
                  className="text-gray-500 font-ibm-arabic-regular"
                  style={{ fontSize: scale(12) }}
                >
                  {formatDate(note.Date)}
                </span>
              </div>
            </div>

            {/* Actions */}
            {canEdit && (
              <div className="flex items-center space-x-1 space-x-reverse">
                <button
                  onClick={() => onEditNote(note)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="تعديل الملاحظة"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(note.id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="حذف الملاحظة"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Note Content */}
          <div className="mb-3">
            <p 
              className={`text-gray-800 font-ibm-arabic-regular leading-relaxed ${
                note.Note.length > 150 && expandedNote !== note.id ? 'line-clamp-3' : ''
              }`}
              style={{ fontSize: scale(14) }}
            >
              {note.Note}
            </p>
            
            {note.Note.length > 150 && (
              <button
                onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                className="text-blue-600 hover:text-blue-700 font-ibm-arabic-medium mt-2 text-sm"
              >
                {expandedNote === note.id ? 'عرض أقل' : 'عرض المزيد'}
              </button>
            )}
          </div>

          {/* Files */}
          {note.File && note.File.length > 0 && (
            <div className="space-y-2">
              <p 
                className="text-gray-600 font-ibm-arabic-medium"
                style={{ fontSize: scale(12) }}
              >
                المرفقات:
              </p>
              <div className="flex flex-wrap gap-2">
                {note.File.map((fileName, index) => (
                  <a
                    key={index}
                    href={`/api/files/${fileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 space-x-reverse px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span 
                      className="text-gray-700 font-ibm-arabic-regular text-sm truncate max-w-32"
                      title={fileName}
                    >
                      {fileName}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          <AnimatePresence>
            {showDeleteConfirm === note.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p 
                  className="text-red-800 font-ibm-arabic-medium mb-3"
                  style={{ fontSize: scale(14) }}
                >
                  هل أنت متأكد من حذف هذه الملاحظة؟
                </p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleDeleteConfirm(note.id)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded font-ibm-arabic-medium hover:bg-red-700 transition-colors"
                    style={{ fontSize: scale(12) }}
                  >
                    حذف
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded font-ibm-arabic-medium hover:bg-gray-300 transition-colors"
                    style={{ fontSize: scale(12) }}
                  >
                    إلغاء
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default SubStageNotesView;
