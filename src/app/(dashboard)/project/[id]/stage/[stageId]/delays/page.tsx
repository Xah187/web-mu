'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import useDelays, { Delay } from '@/hooks/useDelays';
import { formatDateEnglish } from '@/hooks/useFinance';
import { scale } from '@/utils/responsiveSize';
import axiosInstance from '@/lib/api/axios';
import useValidityUser from '@/hooks/useValidityUser';
import { Tostget } from '@/components/ui/Toast';
import { useTranslation } from '@/hooks/useTranslation';

const Header = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-ibm-arabic-medium">{t('delays.back')}</span>
        </button>
        <h1 className="font-ibm-arabic-bold text-gray-900 text-center flex-1 mx-4" style={{ fontSize: scale(16) }}>{t('delays.title')}</h1>
        <div className="w-16" />
      </div>
    </div>
  );
};

const DelayRow = ({ delay, onEdit }: { delay: Delay; onEdit: () => void }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-ibm-arabic-semibold text-gray-900 mb-1">{delay.Type}</p>
          <p className="text-sm text-gray-700 mb-1">{delay.Note}</p>
          {!!delay.countdayDelay && <p className="text-xs text-gray-500">{t('delays.daysCount')}: {delay.countdayDelay}</p>}
          <p className="text-xs text-gray-500">{t('delays.date')}: {formatDateEnglish(delay.DateNote)}</p>
        </div>
        <button onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">{t('delays.edit')}</button>
      </div>
    </div>
  );
};

export default function StageDelaysPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const projectId = parseInt(params.id as string);
  const stageId = parseInt(params.stageId as string);

  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();
  const { delays, loading, fetchDelays, addDelay, updateDelay } = useDelays();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Delay | null>(null);
  const [form, setForm] = useState<{ type: string; note: string; countdayDelay: string }>({ type: '', note: '', countdayDelay: '' });
  const [stageDetails, setStageDetails] = useState<any>(null);

  // First fetch stage details to get correct StageID
  useEffect(() => {
    const fetchStageDetails = async () => {
      if (projectId && stageId && user?.accessToken) {
        try {
          const response = await axiosInstance.get(
            `/brinshCompany/BringStageOneObject?ProjectID=${projectId}&StageID=${stageId}`,
            {
              headers: { Authorization: `Bearer ${user.accessToken}` },
            }
          );
          const stageData = response.data?.data || response.data;
          setStageDetails(stageData);
          
          // After getting stage details, fetch delays using the correct StageID
          if (stageData?.StageID) {
            fetchDelays(projectId, stageData.StageID);
          }
        } catch (error) {
          console.error('Error fetching stage details:', error);
        }
      }
    };
    
    fetchStageDetails();
  }, [projectId, stageId, user?.accessToken, fetchDelays]);

  const onSubmit = async () => {
    if (!form.type.trim() || !form.note.trim()) {
      Tostget(t('delays.fillAllFields'));
      return;
    }

    // Check permission before adding/editing delay - matching mobile app (Delays.tsx)
    const hasPermission = await Uservalidation('إضافة تأخيرات', projectId);
    if (!hasPermission) {
      return;
    }

    if (editing) {
      await updateDelay(editing.StageNoteID, form.type.trim(), form.note.trim(), parseInt(form.countdayDelay || '0'));
      setEditing(null);
    } else {
      await addDelay(projectId, stageDetails?.StageID || stageId, form.type.trim(), form.note.trim(), parseInt(form.countdayDelay || '0'));
    }
    setForm({ type: '', note: '', countdayDelay: '' });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onBack={() => router.back()} />

      <div className="p-4">
        <div className="flex justify-end mb-3">
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
          >
            {t('delays.addDelayReason')}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : delays.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-ibm-arabic-medium">{t('delays.noDelays')}</p>
          </div>
        ) : (
          <div>
            {delays.map((d) => (
              <DelayRow key={d.StageNoteID} delay={d} onEdit={() => { setEditing(d); setForm({ type: d.Type || '', note: d.Note || '', countdayDelay: String(d.countdayDelay || '') }); setShowForm(true); }} />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-4">{editing ? t('delays.editDelay') : t('delays.addNewDelay')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-ibm-arabic-medium text-gray-700 mb-2">{t('delays.delayType')}</label>
                <input type="text" value={form.type} onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t('delays.delayTypePlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-ibm-arabic-medium text-gray-700 mb-2">{t('delays.description')}</label>
                <textarea value={form.note} onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-ibm-arabic-medium text-gray-700 mb-2">{t('delays.daysCount')}</label>
                <input type="number" value={form.countdayDelay} onChange={(e) => setForm(prev => ({ ...prev, countdayDelay: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="0" />
              </div>
            </div>
            <div className="flex space-x-3 space-x-reverse mt-6">
              <button onClick={onSubmit} disabled={!form.type.trim() || !form.note.trim() || loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">{loading ? t('delays.saving') : t('delays.save')}</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors">{t('delays.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


