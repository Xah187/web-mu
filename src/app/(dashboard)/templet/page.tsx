'use client';

import React, { useEffect, useMemo, useState } from 'react';
import useTemplet from '@/hooks/useTemplet';
import { useAppSelector } from '@/store';
import { useRouter } from 'next/navigation';

export default function TempletPage() {
  const { size } = useAppSelector((s: any) => s.user);
  const {
    loading,
    stageHomes,
    fetchStageHomes,
    createStageHome,
    deleteStageHome,
  } = useTemplet();
  const router = useRouter();

  const [type, setType] = useState('عام');
  const [stageName, setStageName] = useState('');
  const [days, setDays] = useState<number>(0);

  useEffect(() => {
    fetchStageHomes(0);
  }, [fetchStageHomes]);

  const canCreate = useMemo(() => stageName.trim().length > 0 && days >= 0 && type.trim().length > 0, [stageName, days, type]);

  const handleCreate = async () => {
    if (!canCreate) return;
    const ok = await createStageHome({ Type: type, StageName: stageName.trim(), Days: days });
    if (ok) {
      setStageName('');
      setDays(0);
      await fetchStageHomes(0);
    }
  };

  return (
    <div className="min-h-screen bg-home">
      <div className="bg-white rounded-b-3xl shadow-sm p-4">
        <h1 className="font-ibm-arabic-semibold text-black text-xl">قوالب المراحل</h1>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Create Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-ibm-arabic-semibold text-black mb-3">إضافة قالب</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">النوع</label>
              <input value={type} onChange={e => setType(e.target.value)} className="w-full border rounded-xl p-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">اسم المرحلة</label>
              <input value={stageName} onChange={e => setStageName(e.target.value)} className="w-full border rounded-xl p-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">الأيام</label>
              <input type="number" value={days} onChange={e => setDays(Number(e.target.value || 0))} className="w-full border rounded-xl p-2" />
            </div>
            <button onClick={handleCreate} disabled={!canCreate || loading} className="w-full bg-blue text-white rounded-xl p-3 disabled:opacity-50">
              {loading ? 'جاري الإضافة...' : 'إضافة'}
            </button>
          </div>
        </div>

        {/* List Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-ibm-arabic-semibold text-black mb-3">القائمة</h2>
          {loading && stageHomes.length === 0 ? (
            <div className="py-10 text-center">جارٍ التحميل...</div>
          ) : (
            <div className="space-y-2">
              {stageHomes.map((s, idx) => (
                <div key={idx} className="border rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-ibm-arabic-semibold text-black">{s.StageName}</p>
                    <p className="text-sm text-gray-500">النوع: {s.Type} • الأيام: {s.Days}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { if (s.StageID) router.push(`/templet/${s.StageID}?name=${encodeURIComponent(s.StageName || '')}`); }}
                      className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      فتح الفرعي
                    </button>
                    <button onClick={async () => { if (s.StageID) { const ok = await deleteStageHome(s.StageID); if (ok) await fetchStageHomes(0); } }} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


