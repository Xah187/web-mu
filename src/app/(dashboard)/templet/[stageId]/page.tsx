'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import useTemplet from '@/hooks/useTemplet';
import { URLFIL } from '@/lib/api/axios';
import ResponsiveLayout, { PageHeader, ContentSection, ResponsiveGrid, Card } from '@/components/layout/ResponsiveLayout';

export default function SubTempletPage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const stageId = Number(params.stageId);
  const stageName = search.get('name') || '';
  const { fetchStageSub, createStageSub, updateStageSub, deleteStageSub } = useTemplet();
  const [subItems, setSubItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMoreSubData, setHasMoreSubData] = useState(true);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [attachmentViewer, setAttachmentViewer] = useState<{ open: boolean; type: 'image' | 'video'; url: string } | null>(null);
  const [editingSubStage, setEditingSubStage] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCreateFile, setSelectedCreateFile] = useState<File | null>(null);

  const handleOpenAttachment = (attached?: string) => {
    if (!attached) return;
    const ext = attached.split('.').pop()?.toLowerCase();
    if (!ext) return;
    const url = `${URLFIL}/` + attached;

    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      setAttachmentViewer({ open: true, type: 'image', url });
    } else if (['mp4', 'mov'].includes(ext)) {
      setAttachmentViewer({ open: true, type: 'video', url });
    } else {
      window.open(url, '_blank');
    }
  };

  const getFileType = (filename?: string) => {
    if (!filename) return 'unknown';
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return 'unknown';

    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'image';
    if (['mp4', 'mov'].includes(ext)) return 'video';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
    return 'file';
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828l-6.586 6.586a2 2 0 102.828 2.828L16 9" />
          </svg>
        );
    }
  };


  const bring = async (last = 0) => {
    if (loading) return; // منع التحميل المتكرر

    setLoading(true);
    const data = await fetchStageSub(stageId, last);
    if (Array.isArray(data)) {
      // تحديث حالة وجود المزيد من البيانات
      setHasMoreSubData(data.length >= 10);

      if (last === 0) {
        // استبدال القائمة بالكامل مع إزالة أي تكرارات محتملة من السيرفر
        const unique = Array.from(new Map((data || []).map(d => [d.StageSubID, d])).values());
        setSubItems(unique);
      } else {
        // تجنب التكرار عند الإلحاق
        setSubItems(prev => {
          const existingIds = new Set(prev.map(item => item.StageSubID));
          const newItems = (data || []).filter(item => !existingIds.has(item.StageSubID));
          return [...prev, ...newItems];
        });
      }
    } else {
      setHasMoreSubData(false);
    }
    setLoading(false);
  };

  const loadMoreSubStages = async () => {
    if (!hasMoreSubData || loading || subItems.length === 0) return;

    const lastItem = subItems[subItems.length - 1];
    if (lastItem?.StageSubID) {
      await bring(lastItem.StageSubID);
    }
  };

  useEffect(() => {
    if (stageId) bring(0);
  }, [stageId]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const StageSubName = String(form.get('StageSubName') || '').trim();
    const file = selectedCreateFile;
    if (!StageSubName) return;
    const ok = await createStageSub({ StageID: stageId, StageSubName, file });
    if (ok) {
      (e.currentTarget as HTMLFormElement).reset();
      setSelectedCreateFile(null);
      await bring(0);
    }
  };

  const handleCreateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedCreateFile(file);
  };

  const handleEditSubStage = (subStage: any) => {
    setEditingSubStage(subStage);
    setShowEditModal(true);
  };

  const handleUpdateSubStage = async (updatedData: { StageSubName: string; file?: File | null }) => {
    if (!editingSubStage) return;
    const ok = await updateStageSub({
      StageSubID: editingSubStage.StageSubID,
      ...updatedData
    });
    if (ok) {
      setShowEditModal(false);
      setEditingSubStage(null);
      await bring(0);
    }
  };

  return (
    <>
      {/* Enhanced Attachment Viewer Modal */}
      {attachmentViewer?.open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    {attachmentViewer.type === 'image' ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-ibm-arabic-semibold text-black text-lg">عرض المرفق</h3>
                    <p className="text-gray-500 text-sm">
                      {attachmentViewer.type === 'image' ? 'صورة' : 'فيديو'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(attachmentViewer.url, '_blank')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-800"
                    title="فتح في تبويب جديد"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setAttachmentViewer(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-800"
                    aria-label="إغلاق"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 bg-gray-50 flex items-center justify-center min-h-[400px] max-h-[calc(90vh-120px)] overflow-auto">
              {attachmentViewer.type === 'image' ? (
                <div className="relative group">
                  <img
                    src={attachmentViewer.url}
                    alt="Attachment"
                    className="max-h-[70vh] max-w-full w-auto rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                    style={{ objectFit: 'contain' }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-xl transition-colors duration-300"></div>
                </div>
              ) : (
                <div className="w-full max-w-3xl">
                  <video
                    src={attachmentViewer.url}
                    controls
                    className="w-full max-h-[70vh] rounded-xl shadow-lg bg-black"
                    style={{ objectFit: 'contain' }}
                  >
                    متصفحك لا يدعم تشغيل الفيديو
                  </video>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  اضغط خارج النافذة أو على زر الإغلاق للخروج
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAttachmentViewer(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-ibm-arabic-medium"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ResponsiveLayout header={<PageHeader title={`القوالب الفرعية - ${stageName}`} backButton={<button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-lg" aria-label="الرجوع"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>} />}>
      <ContentSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 2xl:gap-24">
          {/* Create sub template */}
          <Card className="h-fit">
            <div className="p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="font-ibm-arabic-bold text-black text-lg mb-2 leading-relaxed">إضافة قالب فرعي جديد</h2>
                <p className="text-gray-500 text-sm leading-relaxed">قم بإنشاء قالب فرعي مع إمكانية إرفاق ملفات</p>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                {/* اسم القالب الفرعي */}
                <div className="space-y-2">
                  <label className="block text-sm font-ibm-arabic-semibold text-gray-800 mb-2 leading-relaxed">اسم القالب الفرعي</label>
                  <input
                    name="StageSubName"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-3 text-sm font-ibm-arabic-medium leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
                    placeholder="أدخل اسم القالب الفرعي"
                    required
                  />
                </div>

                {/* مرفق */}
                <div className="space-y-2">
                  <label className="block text-sm font-ibm-arabic-semibold text-gray-800 mb-2 leading-relaxed">مرفق (اختياري)</label>
                <div className="relative">
                  <div className="relative overflow-hidden">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={handleCreateFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full border-2 border-gray-200 rounded-lg px-3 py-3 text-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus-within:bg-white flex items-center justify-between">
                      <span className="text-gray-500 font-ibm-arabic-medium leading-relaxed">
                        {selectedCreateFile ? selectedCreateFile.name : 'اختر ملف للرفع'}
                      </span>
                      <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-ibm-arabic-semibold hover:bg-blue-100 transition-colors duration-200">
                        تصفح
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 leading-relaxed">
                    يمكنك رفع الصور، الفيديو، أو المستندات (PDF, Word, Excel, PowerPoint)
                  </div>
                </div>
                </div>

                {/* زر الإضافة */}
                <div className="pt-4 border-t border-gray-100 mt-6">
                  <button
                    disabled={loading}
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
                        <span className="leading-relaxed">إضافة قالب فرعي</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Card>

          {/* List sub templates */}
          <Card className="h-fit">
            <div className="p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="font-ibm-arabic-bold text-black text-lg mb-2 leading-relaxed">القوالب الفرعية المتاحة</h2>
                <p className="text-gray-500 text-sm leading-relaxed">إدارة وعرض جميع القوالب الفرعية مع المرفقات</p>
              </div>
            {loading && subItems.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm">جارٍ تحميل القوالب الفرعية...</p>
              </div>
            ) : subItems.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">لا توجد قوالب فرعية متاحة حالياً</p>
                <p className="text-gray-400 text-xs mt-1">قم بإنشاء قالب فرعي جديد للبدء</p>
              </div>
            ) : (
              <div className="space-y-4">
                {subItems.map((s: any, idx: number) => (
                  <div key={s.StageSubID ?? idx} className="group border-2 border-gray-200 rounded-lg p-4 hover:border-blue-200 hover:shadow-md transition-all duration-200 bg-white">
                    <div className="flex items-start gap-4">
                      {/* رقم المرحلة */}
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-ibm-arabic-bold text-sm flex-shrink-0 shadow-lg">
                        {idx + 1}
                      </div>

                      {/* محتوى المرحلة */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-ibm-arabic-bold text-black text-base mb-3 leading-relaxed">{s.StageSubName}</h3>

                        {s.attached && (
                          <div className="space-y-4">
                            {/* معاينة المرفق */}
                            <div className="flex items-start gap-3">
                              {getFileType(s.attached) === 'image' ? (
                                <div className="relative group cursor-pointer" onClick={() => handleOpenAttachment(s.attached)}>
                                  <img
                                    src={`${URLFIL}/${s.attached}`}
                                    alt="معاينة المرفق"
                                    className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-400 transition-colors duration-200"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors duration-200 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                                  <div className="text-gray-500">
                                    {getFileIcon(getFileType(s.attached))}
                                  </div>
                                </div>
                              )}

                              {/* معلومات المرفق */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-ibm-arabic-medium ${
                                    getFileType(s.attached) === 'image' ? 'bg-blue-50 text-blue-700' :
                                    getFileType(s.attached) === 'video' ? 'bg-purple-50 text-purple-700' :
                                    getFileType(s.attached) === 'pdf' ? 'bg-red-50 text-red-700' :
                                    'bg-green-50 text-green-700'
                                  }`}>
                                    {getFileIcon(getFileType(s.attached))}
                                    {getFileType(s.attached) === 'image' ? 'صورة' :
                                     getFileType(s.attached) === 'video' ? 'فيديو' :
                                     getFileType(s.attached) === 'pdf' ? 'PDF' :
                                     'مرفق'}
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 truncate mb-2">{s.attached}</p>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAttachment(s.attached)}
                                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-ibm-arabic-medium"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  عرض المرفق
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* عرض حالة المرفق */}
                      {!s.attached && (
                        <div className="mt-2">
                          <div className="inline-flex items-center gap-2 bg-gray-50 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-ibm-arabic-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828l-6.586 6.586a2 2 0 102.828 2.828L16 9" />
                            </svg>
                            لا يوجد مرفق
                          </div>
                        </div>
                      )}

                      {/* أزرار التحكم */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => handleEditSubStage(s)}
                          className="w-8 h-8 bg-green-50 text-green-500 rounded-full hover:bg-green-100 hover:text-green-600 transition-colors duration-200 flex items-center justify-center group-hover:scale-110 transform"
                          title="تعديل المرحلة الفرعية"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={async () => { if (s.StageSubID) { const ok = await deleteStageSub(s.StageSubID); if (ok) await bring(0); } }}
                          className="w-8 h-8 bg-red-50 text-red-500 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors duration-200 flex items-center justify-center group-hover:scale-110 transform"
                          title="حذف المرحلة الفرعية"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* زر تحميل المزيد */}
                {hasMoreSubData && subItems.length > 0 && (
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <button
                      onClick={loadMoreSubStages}
                      disabled={loading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200 text-sm font-ibm-arabic-medium border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          تحميل المزيد من القوالب الفرعية
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
      </ContentSection>

      {/* Edit Sub Stage Modal */}
      {showEditModal && editingSubStage && (
        <EditSubStageModal
          subStage={editingSubStage}
          onClose={() => {
            setShowEditModal(false);
            setEditingSubStage(null);
          }}
          onUpdate={handleUpdateSubStage}
          loading={loading}
        />
      )}
    </ResponsiveLayout>
    </>
  );
}

// Edit Sub Stage Modal Component
function EditSubStageModal({
  subStage,
  onClose,
  onUpdate,
  loading
}: {
  subStage: any;
  onClose: () => void;
  onUpdate: (data: { StageSubName: string; file?: File | null }) => void;
  loading: boolean;
}) {
  const [stageSubName, setStageSubName] = useState(subStage.StageSubName || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stageSubName.trim()) {
      onUpdate({ StageSubName: stageSubName.trim(), file: selectedFile });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
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
                <h3 className="font-ibm-arabic-bold text-black text-xl leading-relaxed">تعديل القالب الفرعي</h3>
                <p className="text-gray-500 text-sm leading-relaxed">تحديث بيانات القالب الفرعي</p>
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
          {/* اسم القالب الفرعي */}
          <div className="space-y-3">
            <label className="block text-sm font-ibm-arabic-semibold text-gray-800 mb-3 leading-relaxed">اسم القالب الفرعي</label>
            <input
              value={stageSubName}
              onChange={e => setStageSubName(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-base font-ibm-arabic-medium leading-relaxed focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white"
              placeholder="أدخل اسم القالب الفرعي"
              required
            />
          </div>

          {/* تحديث المرفق */}
          <div className="space-y-3">
            <label className="block text-sm font-ibm-arabic-semibold text-gray-800 mb-3 leading-relaxed">تحديث المرفق (اختياري)</label>
            <div className="relative">
              <div className="relative overflow-hidden">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-base focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus-within:bg-white flex items-center justify-between">
                  <span className="text-gray-500 font-ibm-arabic-medium leading-relaxed">
                    {selectedFile ? selectedFile.name : 'اختر ملف للرفع'}
                  </span>
                  <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-ibm-arabic-semibold hover:bg-green-100 transition-colors duration-200">
                    تصفح
                  </div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-500 leading-relaxed">
                {subStage.attached ? 'يوجد مرفق حالي - اختر ملف جديد للاستبدال' : 'يمكنك رفع الصور، الفيديو، أو المستندات'}
              </div>
              {selectedFile && (
                <div className="mt-3 text-sm text-green-600 bg-green-50 p-3 rounded-lg leading-relaxed">
                  ملف جديد محدد: {selectedFile.name}
                </div>
              )}
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-100 mt-8">
            <button
              type="submit"
              disabled={loading || !stageSubName.trim()}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl px-6 py-4 font-ibm-arabic-bold text-base leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="leading-relaxed">جاري التحديث...</span>
                </div>
              ) : (
                'تحديث القالب الفرعي'
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


