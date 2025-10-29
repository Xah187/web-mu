'use client';

import React, { useEffect, useMemo, useState } from 'react';
import useTemplet from '@/hooks/useTemplet';
import { useAppSelector } from '@/store';
import { useRouter } from 'next/navigation';
import ResponsiveLayout, { PageHeader, ContentSection, ResponsiveGrid, Card } from '@/components/layout/ResponsiveLayout';
import ExcelUploadModal from '@/components/project/ExcelUploadModal';

export default function TempletPage() {
  const { size } = useAppSelector((s: any) => s.user);
  const {
    loading,
    stageHomes,
    hasMoreData,
    fetchStageTypes,
    fetchStageHomes,
    loadMoreStageHomes,
    createStageHome,
    updateStageHome,
    deleteStageHome,
  } = useTemplet();
  const router = useRouter();

  const [stageName, setStageName] = useState('');
  const [days, setDays] = useState<number>(0);
  const [ratio, setRatio] = useState<number>(0);
  const [attached, setAttached] = useState('');
  const [editingStage, setEditingStage] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExcelUploadModal, setShowExcelUploadModal] = useState(false);

  // Types for filtering list (like mobile app)
  const [stageTypes, setStageTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>('عام');

  useEffect(() => {
    // Load available stage types then fetch list for the first type
    (async () => {
      console.log('🔄 Loading stage types...');
      const types = await fetchStageTypes();
      console.log('📋 Fetched types:', types);

      if (Array.isArray(types) && types.length > 0) {
        setStageTypes(types);
        const firstType = types[0]?.Type || 'عام';
        console.log('✅ Selected first type:', firstType);
        setSelectedType(firstType);
        const homes = await fetchStageHomes(firstType, 0);
        console.log('📋 Fetched homes for type', firstType, ':', homes);

        // Log Stagestype_id values
        if (homes && homes.length > 0) {
          homes.forEach((home, i) => {
            console.log(`  [${i}] StageID=${home.StageID}, Stagestype_id=${home.Stagestype_id} (type: ${typeof home.Stagestype_id})`);
          });
        }
      } else {
        // fallback
        console.log('⚠️ No types found, using fallback');
        setStageTypes([{ id: 0, Type: 'عام' }]);
        setSelectedType('عام');
        const homes = await fetchStageHomes('عام', 0);
        console.log('📋 Fetched homes for fallback type عام:', homes);
      }
    })();
  }, [fetchStageTypes, fetchStageHomes]);

  const canCreate = useMemo(() => stageName.trim().length > 0 && days >= 0 && selectedType.trim().length > 0, [stageName, days, selectedType]);

  const handleCreate = async () => {
    if (!canCreate) return;
    // Use selectedType instead of type (like mobile app)
    const ok = await createStageHome({ Type: selectedType, StageName: stageName.trim(), Days: days, Ratio: ratio, attached });
    if (ok) {
      setStageName('');
      setDays(0);
      setRatio(0);
      setAttached('');
      await fetchStageHomes(selectedType, 0);
    }
  };

  const handleEdit = (stage: any) => {
    setEditingStage(stage);
    setShowEditModal(true);
  };

  const handleUpdate = async (updatedData: { Type: string; StageName: string; Days: number; Ratio: number; attached: string }) => {
    if (!editingStage) return;
    const ok = await updateStageHome({
      StageIDtemplet: editingStage.StageIDtemplet,
      ...updatedData
    });
    if (ok) {
      setShowEditModal(false);
      setEditingStage(null);
      await fetchStageHomes(selectedType, 0);
    }
  };

  return (
    <ResponsiveLayout header={<PageHeader title="قوالب المراحل" backButton={<button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-lg" aria-label="الرجوع"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>} />}>
      <ContentSection>
        {/* Excel Upload Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowExcelUploadModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-ibm-arabic-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            ارفاق اكسل
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 2xl:gap-24">
          {/* Create Card */}
          <Card className="h-fit">
            <div className="p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="font-ibm-arabic-bold text-black text-lg mb-2 leading-relaxed">إضافة قالب جديد</h2>
                <p className="text-gray-500 text-sm leading-relaxed">قم بإنشاء قالب مرحلة جديد لاستخدامه في المشاريع</p>
              </div>
              <div className="space-y-4">
                {/* النوع المحدد (عرض فقط) */}
                <div className="space-y-2">
                  <label className="block text-sm font-ibm-arabic-semibold text-gray-800 mb-2 leading-relaxed">النوع المحدد</label>
                  <div className="w-full border-2 border-blue-200 bg-blue-50 rounded-lg px-3 py-3 text-sm font-ibm-arabic-bold text-blue-700 leading-relaxed">
                    {selectedType}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">يمكنك تغيير النوع من الأزرار في الأعلى</p>
                </div>

                {/* اسم المرحلة */}
                <div className="space-y-2">
                  <label className="block text-sm font-ibm-arabic-semibold text-gray-800 mb-2 leading-relaxed">اسم المرحلة</label>
                  <input
                    value={stageName}
                    onChange={e => setStageName(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-3 text-sm font-ibm-arabic-medium leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                    placeholder="أدخل اسم المرحلة"
                  />
                </div>

                {/* عدد الأيام والنسبة التقديرية */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-ibm-arabic-semibold text-gray-800 mb-2 leading-relaxed">عدد الأيام</label>
                    <input
                      type="number"
                      value={days}
                      onChange={e => setDays(Number(e.target.value || 0))}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-3 text-sm font-ibm-arabic-medium leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-ibm-arabic-semibold text-gray-800 mb-2 leading-relaxed">النسبة التقديرية (%)</label>
                    <input
                      type="number"
                      value={ratio}
                      onChange={e => setRatio(Number(e.target.value || 0))}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-3 text-sm font-ibm-arabic-medium leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                {/* دليل خارجي */}
                <div className="space-y-2">
                  <label className="block text-sm font-ibm-arabic-semibold text-gray-800 mb-2 leading-relaxed">دليل خارجي (رابط)</label>
                  <input
                    type="text"
                    value={attached}
                    onChange={e => setAttached(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-3 text-sm font-ibm-arabic-medium leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                    placeholder="رابط خارجي (اختياري)"
                  />
                </div>

                {/* زر الإضافة */}
                <div className="pt-4 border-t border-gray-100 mt-6">
                  <button
                    onClick={handleCreate}
                    disabled={!canCreate || loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-4 py-3 font-ibm-arabic-bold text-sm leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="leading-relaxed">جاري الإضافة...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="leading-relaxed">إضافة قالب</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* List Card */}
          <Card className="h-fit">
            <div className="p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="font-ibm-arabic-bold text-black text-lg mb-2 leading-relaxed">قوالب المراحل المتاحة</h2>
                <p className="text-gray-500 text-sm leading-relaxed">إدارة وعرض جميع قوالب المراحل الموجودة</p>
              </div>

              {/* Types filter (like mobile app categories) */}
              <div className="mb-4 flex flex-wrap gap-2">
                {stageTypes.map((t) => (
                  <button
                    key={t.id ?? t.Type}
                    onClick={async () => {
                      setSelectedType(t.Type);
                      await fetchStageHomes(t.Type, 0);
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-ibm-arabic-medium border ${selectedType === t.Type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                  >
                    {t.Type}
                  </button>
                ))}
              </div>

            {loading && stageHomes.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm">جارٍ تحميل القوالب...</p>
              </div>
            ) : stageHomes.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">لا توجد قوالب متاحة حالياً</p>
                <p className="text-gray-400 text-xs mt-1">قم بإنشاء قالب جديد للبدء</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stageHomes.map((s, idx) => (
                  <div
                    key={idx}
                    className="group border-2 border-gray-200 rounded-lg p-4 hover:border-blue-200 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50/30 cursor-pointer"
                    onClick={() => { if (s.StageID) router.push(`/templet/${s.StageID}?name=${encodeURIComponent(s.StageName || '')}&Stagestype_id=${s.Stagestype_id ?? 0}`); }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-ibm-arabic-semibold text-sm shadow-lg">
                            {s.StageName?.charAt(0) || 'ق'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-ibm-arabic-bold text-black text-base truncate leading-relaxed mb-1">{s.StageName}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {s.Type}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10" />
                                </svg>
                                {s.Days} يوم
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => { e.stopPropagation(); if (s.StageID) router.push(`/templet/${s.StageID}?name=${encodeURIComponent(s.StageName || '')}&Stagestype_id=${s.Stagestype_id ?? 0}`); }}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-ibm-arabic-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          عرض الفرعي
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(s); }}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200 text-sm font-ibm-arabic-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          تعديل
                        </button>
                        <button
                          onClick={async (e) => { e.stopPropagation(); if (s.StageID) { const ok = await deleteStageHome(s.StageID); if (ok) await fetchStageHomes(selectedType, 0); } }}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-ibm-arabic-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* زر تحميل المزيد */}
                {hasMoreData && stageHomes.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => loadMoreStageHomes(selectedType)}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-lg px-4 py-3 font-ibm-arabic-medium text-sm leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-100 hover:to-gray-200 transition-all duration-200 border border-gray-200 hover:border-gray-300"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>جاري التحميل...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          <span>تحميل المزيد من القوالب</span>
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
            </div>
          </Card>
        </div>

      {/* Edit Modal */}
      {showEditModal && editingStage && (
        <EditStageModal
          stage={editingStage}
          onClose={() => {
            setShowEditModal(false);
            setEditingStage(null);
          }}
          onUpdate={handleUpdate}
          loading={loading}
        />
      )}

      {/* Excel Upload Modal */}
      <ExcelUploadModal
        isOpen={showExcelUploadModal}
        onClose={() => setShowExcelUploadModal(false)}
        onSuccess={async () => {
          // Wait a bit for backend to process
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Reload page to see new data (matching mobile app behavior)
          window.location.reload();
        }}
      />
      </ContentSection>
    </ResponsiveLayout>
  );
}

// Edit Modal Component
function EditStageModal({
  stage,
  onClose,
  onUpdate,
  loading
}: {
  stage: any;
  onClose: () => void;
  onUpdate: (data: { Type: string; StageName: string; Days: number; Ratio: number; attached: string }) => void;
  loading: boolean;
}) {
  const [type, setType] = useState(stage.Type || '');
  const [stageName, setStageName] = useState(stage.StageName || '');
  const [days, setDays] = useState(stage.Days || 0);
  const [ratio, setRatio] = useState(stage.Ratio || 0);
  const [attached, setAttached] = useState(stage.attached || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stageName.trim() && type.trim()) {
      onUpdate({ Type: type, StageName: stageName.trim(), Days: days, Ratio: ratio, attached });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-ibm-arabic-bold text-black text-xl leading-relaxed">تعديل القالب</h3>
                <p className="text-gray-500 text-sm leading-relaxed">تحديث بيانات قالب المرحلة</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
              title="إغلاق"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* النوع */}
          <div className="space-y-3">
            <label className="block text-sm font-ibm-arabic-semibold text-gray-800 mb-3 leading-relaxed">النوع</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-base font-ibm-arabic-medium leading-relaxed focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
              required
            >
              <option value="عام">عام</option>
              <option value="عظم مع قبو">عظم مع قبو</option>
              <option value="عظم بدون قبو">عظم بدون قبو</option>
              <option value="تشطيب مع قبو">تشطيب مع قبو</option>
              <option value="تشطيب بدون قبو">تشطيب بدون قبو</option>
            </select>
          </div>

          {/* اسم المرحلة */}
          <div className="space-y-3">
            <label className="block text-sm font-ibm-arabic-semibold text-gray-800 mb-3 leading-relaxed">اسم المرحلة</label>
            <input
              value={stageName}
              onChange={e => setStageName(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-base font-ibm-arabic-medium leading-relaxed focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
              placeholder="أدخل اسم المرحلة"
              required
            />
          </div>

          {/* عدد الأيام والنسبة التقديرية */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-sm font-ibm-arabic-semibold text-gray-800 mb-3 leading-relaxed">عدد الأيام</label>
              <input
                type="number"
                value={days}
                onChange={e => setDays(Number(e.target.value || 0))}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-base font-ibm-arabic-medium leading-relaxed focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-ibm-arabic-semibold text-gray-800 mb-3 leading-relaxed">النسبة التقديرية (%)</label>
              <input
                type="number"
                value={ratio}
                onChange={e => setRatio(Number(e.target.value || 0))}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-base font-ibm-arabic-medium leading-relaxed focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* دليل خارجي */}
          <div className="space-y-3">
            <label className="block text-sm font-ibm-arabic-semibold text-gray-800 mb-3 leading-relaxed">دليل خارجي (رابط)</label>
            <input
              type="text"
              value={attached}
              onChange={e => setAttached(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-base font-ibm-arabic-medium leading-relaxed focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
              placeholder="رابط خارجي (اختياري)"
            />
          </div>

          {/* الأزرار */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-100 mt-8">
            <button
              type="submit"
              disabled={loading || !stageName.trim() || !type.trim()}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl px-6 py-4 font-ibm-arabic-bold text-base leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="leading-relaxed">جاري التحديث...</span>
                </div>
              ) : (
                'تحديث القالب'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-ibm-arabic-semibold text-base leading-relaxed"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
