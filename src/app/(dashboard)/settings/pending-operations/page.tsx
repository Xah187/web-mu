'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';

interface PendingItem {
  idSendr: string;
  File: {
    name: string;
    nameProject: string;
    nameRoom: string;
    size?: number;
    type?: string;
  };
  arrived?: boolean;
}

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

export default function PendingOperationsPage() {
  const router = useRouter();
  const { size } = useAppSelector(state => state.user);
  const [items, setItems] = useState<PendingItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Placeholder: load from localStorage (to be replaced with actual logic if needed)
    const raw = localStorage.getItem('pendingOperations');
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {}
    } else {
      setItems([]);
    }
  };

  const handleRetry = (item: PendingItem) => {
    // Placeholder retry logic
    alert(`إعادة محاولة رفع: ${item.File.name}`);
  };

  const handleRemove = (item: PendingItem) => {
    const filtered = items.filter(i => i.idSendr !== item.idSendr);
    setItems(filtered);
    localStorage.setItem('pendingOperations', JSON.stringify(filtered));
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadData();
      setRefreshing(false);
    }, 600);
  };

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title="عمليات قيد الرفع"
          backButton={
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="رجوع">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
          }
        />
      }
    >
      <ContentSection className="p-4">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onRefresh}
            className="py-2 px-4 bg-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            تحديث
          </button>
          <span className="text-gray-600 font-ibm-arabic" style={{ fontSize: scale(12 + size) }}>
            إجمالي: {items.length}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                <path d="M3 3v18h18" />
                <path d="M7 13l3 3 7-7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لايوجد عمليات قيد الرفع</h3>
            <p className="text-gray-600">عند بدء رفع ملفات ستظهر هنا</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.idSendr} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-ibm-arabic-semibold text-gray-900" style={{ fontSize: scale(14 + size) }}>
                    {item.File.nameProject} — {item.File.nameRoom}
                  </p>
                  <p className="text-gray-600" style={{ fontSize: scale(12 + size) }}>
                    {item.File.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRetry(item)}
                    className="py-2 px-3 border border-blue text-blue rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    إعادة المحاولة
                  </button>
                  <button
                    onClick={() => handleRemove(item)}
                    className="py-2 px-3 border border-red text-red rounded-lg hover:bg-red-50 transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

      </ContentSection>
    </ResponsiveLayout>
  );
}
