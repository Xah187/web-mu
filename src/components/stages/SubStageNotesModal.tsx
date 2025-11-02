'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/constants/colors';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { fonts } from '@/constants/fonts';
import { SubStageNote } from '@/hooks/useSubStages';
import SubStageNotesView from './SubStageNotesView';
import SubStageNoteModal from './SubStageNoteModal';
import useSubStageNotes from '@/hooks/useSubStageNotes';
import useValidityUser from '@/hooks/useValidityUser';
import { useTranslation } from '@/hooks/useTranslation';

interface SubStageNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  subStage: {
    StageSubID: number;
    StageSubName: string;
    Note?: string | null;
  };
  onNotesUpdated: () => void;
}

const SubStageNotesModal: React.FC<SubStageNotesModalProps> = ({
  isOpen,
  onClose,
  subStage,
  onNotesUpdated
}) => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<SubStageNote[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<SubStageNote | null>(null);

  const { parseNotes, addNote, editNote, deleteNote, loading } = useSubStageNotes();
  const { hasPermission } = useValidityUser();

  // Check permissions
  const canAddNote = hasPermission('تعديل مرحلة فرعية');
  const canEditNote = hasPermission('تعديل مرحلة فرعية');

  // Parse notes when modal opens or subStage changes
  useEffect(() => {
    if (isOpen && subStage.Note) {
      const parsedNotes = parseNotes(subStage.Note);
      setNotes(parsedNotes);
    } else {
      setNotes([]);
    }
  }, [isOpen, subStage.Note, parseNotes]);

  const handleAddNote = async (noteText: string, files?: File[]) => {
    const success = await addNote(subStage.StageSubID, noteText, files);
    if (success) {
      setShowAddModal(false);
      onNotesUpdated();
    }
  };

  const handleEditNote = async (noteText: string, files?: File[]) => {
    if (!editingNote) return;
    
    const success = await editNote(
      subStage.StageSubID,
      editingNote.id,
      noteText,
      files
    );
    
    if (success) {
      setEditingNote(null);
      onNotesUpdated();
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    const success = await deleteNote(subStage.StageSubID, noteId);
    if (success) {
      onNotesUpdated();
    }
  };

  const handleEditNoteClick = (note: SubStageNote) => {
    setEditingNote(note);
  };

  return (
    <>
      {/* Main Notes Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl mx-auto max-h-[80vh] flex flex-col shadow-xl"
              style={{
                backgroundColor: 'var(--theme-card-background)',
                border: '1px solid var(--theme-border)',
                borderRadius: `${scale(20)}px`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex-1">
                  <h2
                    className="font-ibm-arabic-bold text-gray-900"
                    style={{ fontSize: scale(18) }}
                  >
                    {t('notesModal.title')}
                  </h2>
                  <p 
                    className="text-gray-600 font-ibm-arabic-medium mt-1"
                    style={{ fontSize: scale(14) }}
                  >
                    {subStage.StageSubName}
                  </p>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  {/* Add Note Button */}
                  {canAddNote && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
                      style={{ fontSize: scale(14) }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>{t('notesModal.addNote')}</span>
                    </button>
                  )}

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <SubStageNotesView
                  notes={notes}
                  onEditNote={handleEditNoteClick}
                  onDeleteNote={handleDeleteNote}
                  canEdit={canEditNote}
                  loading={loading}
                />
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span
                    className="text-gray-500 font-ibm-arabic-regular"
                    style={{ fontSize: scale(14) }}
                  >
                    {notes.length === 0 ? t('notesModal.noNotes') : t('notesModal.notesCount', { count: notes.length })}
                  </span>

                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 font-ibm-arabic-medium hover:bg-gray-100 rounded-lg transition-colors"
                    style={{ fontSize: scale(14) }}
                  >
                    {t('notesModal.close')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Note Modal */}
      <SubStageNoteModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddNote}
        subStage={subStage}
        loading={loading}
      />

      {/* Edit Note Modal */}
      <SubStageNoteModal
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        onSave={handleEditNote}
        subStage={subStage}
        loading={loading}
        editingNote={editingNote}
      />
    </>
  );
};

export default SubStageNotesModal;
