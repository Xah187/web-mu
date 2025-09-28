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
    backgroundColor: 'var(--theme-card-background)',
    border: '1px solid var(--theme-border)',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '8px',
    cursor: 'move'
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-md shadow-2xl"
        style={{
          backgroundColor: 'var(--theme-card-background)',
          border: '1px solid var(--theme-border)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div
          className="text-center relative"
          style={{
            borderBottom: '1px solid var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
            paddingLeft: '24px',
            paddingRight: '24px',
            paddingTop: '20px',
            paddingBottom: '20px',
            marginBottom: '16px',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px'
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="var(--theme-primary, #6366f1)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3
              className="font-bold"
              style={{
                fontSize: '18px',
                fontFamily: 'var(--font-ibm-arabic-bold)',
                color: 'var(--theme-text-primary)',
                lineHeight: 1.4
              }}
            >
              ترتيب المراحل
            </h3>
          </div>
          <p
            style={{
              fontSize: '14px',
              fontFamily: 'var(--font-ibm-arabic-medium)',
              color: 'var(--theme-text-secondary)',
              marginBottom: '8px'
            }}
          >
            اسحب العناصر لتغيير الترتيب، ثم اضغط حفظ
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 left-4 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
            style={{
              padding: '10px',
              backgroundColor: 'var(--theme-surface-secondary)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text-secondary)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '16px' }}>
          <div
            className="max-h-96 overflow-auto rounded-xl"
            style={{
              backgroundColor: 'var(--theme-surface-secondary)',
              border: '1px solid var(--theme-border)',
              padding: '16px',
              marginBottom: '24px'
            }}
          >
            {orderedStages.length === 0 ? (
              <div
                className="text-center py-8"
                style={{
                  color: 'var(--theme-text-secondary)'
                }}
              >
                <p style={{ fontFamily: 'var(--font-ibm-arabic-medium)', fontSize: '16px' }}>لا توجد مراحل للترتيب</p>
                <p style={{ fontFamily: 'var(--font-ibm-arabic-regular)', fontSize: '12px', marginTop: '8px' }}>تأكد من وجود مراحل في المشروع</p>
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
                        <span
                          style={{
                            fontSize: '14px',
                            fontFamily: 'var(--font-ibm-arabic-semibold)',
                            color: 'var(--theme-text-primary)'
                          }}
                        >
                          {s.StageName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              fontSize: '12px',
                              fontFamily: 'var(--font-ibm-arabic-regular)',
                              color: s.Done === "true" ? 'var(--theme-success)' : 'var(--theme-warning)',
                              backgroundColor: s.Done === "true" ? 'var(--theme-success-alpha, rgba(16, 185, 129, 0.1))' : 'var(--theme-warning-alpha, rgba(245, 158, 11, 0.1))',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: `1px solid ${s.Done === "true" ? 'var(--theme-success)' : 'var(--theme-warning)'}`
                            }}
                          >
                            {s.Done === "true" ? "منجز" : "غير منجز"}
                          </span>
                          <div className="flex gap-1">
                            <button
                              className="rounded transition-all duration-200 hover:scale-110"
                              style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                backgroundColor: 'var(--theme-surface-secondary)',
                                border: '1px solid var(--theme-border)',
                                color: 'var(--theme-text-primary)'
                              }}
                              onClick={() => move(visualIdx, visualIdx - 1)}
                            >
                              ↑
                            </button>
                            <button
                              className="rounded transition-all duration-200 hover:scale-110"
                              style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                backgroundColor: 'var(--theme-surface-secondary)',
                                border: '1px solid var(--theme-border)',
                                color: 'var(--theme-text-primary)'
                              }}
                              onClick={() => move(visualIdx, visualIdx + 1)}
                            >
                              ↓
                            </button>
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
        </div>

        {/* Footer */}
        <div
          className="flex gap-3"
          style={{
            borderTop: '1px solid var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
            paddingLeft: '24px',
            paddingRight: '24px',
            paddingTop: '16px',
            paddingBottom: '16px',
            margin: '8px 0'
          }}
        >
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--theme-primary)',
              color: 'white',
              fontSize: '16px',
              fontFamily: 'var(--font-ibm-arabic-semibold)',
              border: 'none',
              width: '45%'
            }}
          >
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--theme-surface-secondary)',
              color: 'var(--theme-text-primary)',
              fontSize: '16px',
              fontFamily: 'var(--font-ibm-arabic-semibold)',
              border: '1px solid var(--theme-border)',
              width: '45%'
            }}
          >
            إلغاء
          </button>
        </div>

        {/* Decorative bottom element */}
        <div
          className="flex justify-center"
          style={{
            paddingBottom: '8px',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px'
          }}
        >
          <div
            className="w-12 h-1 rounded-full"
            style={{ backgroundColor: 'var(--theme-border)' }}
          />
        </div>
      </div>
    </div>
  );
}

