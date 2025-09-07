'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import useTemplet from '@/hooks/useTemplet';
import { URLFIL } from '@/lib/api/axios';

export default function SubTempletPage() {
  const params = useParams();
  const search = useSearchParams();
  const stageId = Number(params.stageId);
  const stageName = search.get('name') || '';
  const { fetchStageSub, createStageSub, updateStageSub, deleteStageSub } = useTemplet();
  const [subItems, setSubItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const bring = async (last = 0) => {
    setLoading(true);
    const data = await fetchStageSub(stageId, last);
    if (Array.isArray(data)) {
      setSubItems(prev => (last === 0 ? data : [...prev, ...data]));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (stageId) bring(0);
  }, [stageId]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const StageSubName = String(form.get('StageSubName') || '').trim();
    const file = (fileRef.current?.files && fileRef.current.files[0]) ? fileRef.current.files[0] : undefined;
    if (!StageSubName) return;
    const ok = await createStageSub({ StageID: stageId, StageSubName, file });
    if (ok) {
      (e.currentTarget as HTMLFormElement).reset();
      if (fileRef.current) fileRef.current.value = '';
      await bring(0);
    }
  };

  return (
    <div className="min-h-screen bg-home">
      <div className="bg-white rounded-b-3xl shadow-sm p-4">
        <h1 className="font-ibm-arabic-semibold text-black text-xl">القوالب الفرعية - {stageName}</h1>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Create sub template */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-ibm-arabic-semibold text-black mb-3">إضافة قالب فرعي</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">اسم القالب الفرعي</label>
              <input name="StageSubName" className="w-full border rounded-xl p-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">مرفق (اختياري)</label>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" className="w-full" />
            </div>
            <button disabled={loading} className="w-full bg-blue text-white rounded-xl p-3 disabled:opacity-50">
              {loading ? 'جاري الإضافة...' : 'إضافة'}
            </button>
          </form>
        </div>

        {/* List sub templates */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-ibm-arabic-semibold text-black mb-3">القائمة</h2>
          {loading && subItems.length === 0 ? (
            <div className="py-10 text-center">جارٍ التحميل...</div>
          ) : (
            <div className="space-y-2">
              {subItems.map((s: any, idx: number) => (
                <div key={idx} className="border rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-ibm-arabic-semibold text-black">{s.StageSubName}</p>
                    {!!s.attached && (
                      <a href={`${URLFIL}/` + s.attached} target="_blank" rel="noreferrer" className="text-blue text-sm inline-block mt-1">
                        عرض المرفق
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => { if (s.StageSubID) { const ok = await deleteStageSub(s.StageSubID); if (ok) await bring(0); } }}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}

              {subItems.length > 0 && (
                <div className="pt-2">
                  <button onClick={() => bring(subItems[subItems.length - 1]?.StageSubID || 0)} className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    تحميل المزيد
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


