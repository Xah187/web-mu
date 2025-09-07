"use client";

import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "@/lib/api/axios";
import { Tostget } from "@/components/ui/Toast";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Stage } from "@/hooks/useProjectDetails";

interface ReorderStagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: Stage[];
  onSaved: () => Promise<void> | void;
}

export default function ReorderStagesModal({ isOpen, onClose, stages, onSaved }: ReorderStagesModalProps) {
  const { user } = useSelector((state: any) => state.user || {});
  const [saving, setSaving] = useState(false);

  // Prepare a reorderable list referencing the original items
  const [order, setOrder] = useState<number[]>(() => stages?.map((_, idx) => idx) || []);

  // Update order when stages change (e.g., when loaded from server)
  React.useEffect(() => {
    if (stages && stages.length > 0) {
      setOrder(stages.map((_, idx) => idx));
    }
  }, [stages]);

  const orderedStages = useMemo(() => order.map((i) => stages[i]).filter(Boolean), [order, stages]);

  // dnd-kit sensors (mouse/touch + keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const move = (from: number, to: number) => {
    setOrder((prev) => {
      const arr = [...prev];
      if (to < 0 || to >= arr.length) return arr;
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return arr;
    });
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onSave = async () => {
    try {
      setSaving(true);
      // API expects objects array under DataStage, keep same shape as mobile
      await axiosInstance.put(
        "/brinshCompany/RearrangeStage",
        { DataStage: orderedStages },
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      Tostget("تم حفظ الترتيب");
      await onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      Tostget("فشل حفظ الترتيب");

    } finally {
      setSaving(false);
    }
  };

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg px-3 py-2 bg-gray-50 cursor-move" {...attributes} {...listeners}>
      {children}
    </div>
  );
}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-4">ترتيب المراحل</h3>
        <p className="text-gray-600 mb-4">اسحب العناصر لتغيير الترتيب، ثم اضغط حفظ.</p>
        <div className="space-y-2 max-h-96 overflow-auto">
          {orderedStages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد مراحل للترتيب</p>
              <p className="text-xs mt-2">تأكد من وجود مراحل في المشروع</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event: DragEndEvent) => {
                const { active, over } = event;
                if (!over || active.id === over.id) return;
                const ids = order.map((i, idx) => (stages[i]?.StageCustID || stages[i]?.StageID || idx).toString());
                const oldIndex = ids.indexOf(active.id.toString());
                const newIndex = ids.indexOf(over.id.toString());
                if (oldIndex === -1 || newIndex === -1) return;
                setOrder((prev) => arrayMove(prev, oldIndex, newIndex));
              }}
            >
              <SortableContext
                items={order.map((i, idx) => (stages[i]?.StageCustID || stages[i]?.StageID || idx).toString())}
                strategy={verticalListSortingStrategy}
              >
                {orderedStages.map((s, visualIdx) => {
                  if (!s) return null;
                  const id = (s.StageCustID || s.StageID || visualIdx).toString();
                  return (
                    <SortableRow key={id} id={id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-ibm-arabic-semibold">{s.StageName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{s.Done === "true" ? "منجز" : "غير منجز"}</span>
                          <div className="flex gap-1">
                            <button className="px-2 py-1 text-xs bg-gray-100 rounded" onClick={() => move(visualIdx, visualIdx - 1)}>↑</button>
                            <button className="px-2 py-1 text-xs bg-gray-100 rounded" onClick={() => move(visualIdx, visualIdx + 1)}>↓</button>
                          </div>
                        </div>
                      </div>
                    </SortableRow>
                  );
                })}
              </SortableContext>
            </DndContext>
          )}
        </div>
        <div className="flex space-x-3 space-x-reverse mt-6">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

