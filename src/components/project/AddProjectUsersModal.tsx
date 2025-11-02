"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "@/lib/api/axios";
import { Tostget } from "@/components/ui/Toast";
import PermissionList from "@/components/Permissions/PermissionList";
import { PermissionType } from "@/types/permissions";
import { useTranslation } from "@/hooks/useTranslation";

interface AddProjectUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  branchId?: number; // إضافة branchId - مطابق للتطبيق المحمول
  onSaved: () => Promise<void> | void;
}

interface CompanyMember {
  id: number;
  userName: string;
  PhoneNumber: string;
  image?: string;
  is_in_ProjectID?: string; // "true" or "false" - مطابق للتطبيق المحمول
  original_is_in?: string; // القيمة الأصلية
}

export default function AddProjectUsersModal({ isOpen, onClose, projectId, branchId, onSaved }: AddProjectUsersModalProps) {
  const { user } = useSelector((state: any) => state.user || {});
  const { t, isRTL, dir } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [search, setSearch] = useState("");
  const [lastId, setLastId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<PermissionType[]>([]);

  // حالة التغييرات - مطابق للتطبيق المحمول PageUsers.tsx
  const [checkGloblenew, setCheckGloblenew] = useState<Record<number, { id: number; Validity: string[] }>>({});
  const [checkGlobledelete, setCheckGlobledelete] = useState<Record<number, number>>({});

  useEffect(() => {
    if (isOpen) {
      fetchMembers(true);
    }
  }, [isOpen]);

  // Close on ESC and lock scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  const fetchMembers = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setLastId(null);
        setHasMore(true);
      }
      const number = reset ? 0 : (lastId || 0);

      console.log('🔍 Fetching members for project:', projectId, 'branch:', branchId);

      // مطابق للتطبيق المحمول PageUsers.tsx السطر 134-138:
      // عندما type = رقم المشروع و scope = 'select' (أي نريد إضافة أعضاء)
      // يجب استخدام targetScope = 'none' لعرض أعضاء الفرع فقط (وليس أعضاء المشروع)
      // هذا يسمح بإضافة أعضاء من الفرع إلى المشروع
      const res = await axiosInstance.get(
        `/user/BringUserCompanyinv2?IDCompany=${user?.data?.IDCompany}&idBrinsh=${branchId || user?.data?.IDCompanyBransh}&type=${projectId}&number=${number}&kind_request=all&selectuser=none`,
        {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.accessToken}` }
        }
      );

      console.log('📊 Members API response:', res.data);
      console.log('📊 Response structure:', {
        hasData: !!res.data,
        dataType: Array.isArray(res.data) ? 'array' : typeof res.data,
        dataLength: Array.isArray(res.data) ? res.data.length : res.data?.data?.length,
        firstItem: Array.isArray(res.data) ? res.data[0] : res.data?.data?.[0]
      });

      // معالجة الاستجابة - مطابق للتطبيق المحمول normalizeApiResult
      // الاستجابة قد تكون: { data: [...] } أو [...] مباشرة
      let list: CompanyMember[] = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        list = res.data.data;
      }

      console.log('📋 Normalized list:', {
        length: list.length,
        firstItem: list[0]
      });

      // إضافة original_is_in لكل عضو - مطابق للتطبيق المحمول
      const membersWithOriginal = list.map((member: any) => ({
        ...member,
        original_is_in: member.is_in_ProjectID || 'false'
      }));

      console.log('✅ Members with original_is_in:', membersWithOriginal.slice(0, 2));

      if (reset) {
        setMembers(membersWithOriginal);
      } else {
        setMembers(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMembers = membersWithOriginal.filter((m: CompanyMember) => !existingIds.has(m.id));
          return [...prev, ...newMembers];
        });
      }

      if (list.length > 0) setLastId(list[list.length - 1].id);
      setHasMore(list.length >= 10);
    } catch (e) {
      console.error(e);
      Tostget(t('projectModals.addUsers.error'));
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    const s = search.trim();
    return members.filter(m => m.userName?.includes(s) || m.PhoneNumber?.includes(s));
  }, [search, members]);

  // تبديل حالة العضو في المشروع - مطابق للتطبيق المحمول handleGlobalChoice
  const toggle = (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const currentValue = member.is_in_ProjectID || 'false';
    const newValue = currentValue === 'true' ? 'false' : 'true';
    const original = member.original_is_in || 'false';

    console.log('🔄 تغيير حالة العضو:', {
      memberId,
      memberName: member.userName,
      original,
      currentValue,
      newValue
    });

    // تحديث حالة العضو في القائمة
    const updatedMembers = members.map(m =>
      m.id === memberId ? { ...m, is_in_ProjectID: newValue } : m
    );
    setMembers(updatedMembers);

    // بناء القوائم الجديدة - مطابق للتطبيق المحمول
    const nextNew = { ...checkGloblenew };
    const nextDel = { ...checkGlobledelete };

    if (newValue !== original) {
      if (newValue === 'true') {
        // إضافة عضو جديد للمشروع
        nextNew[memberId] = { id: memberId, Validity: selectedPerms };
        delete nextDel[memberId];
        console.log('➕ إضافة عضو جديد للمشروع:', memberId);
      } else {
        // إزالة عضو من المشروع
        delete nextNew[memberId];
        if (original === 'true') {
          nextDel[memberId] = memberId;
          console.log('➖ إزالة عضو موجود من المشروع:', memberId);
        } else {
          delete nextDel[memberId];
          console.log('🔙 إلغاء إضافة عضو للمشروع:', memberId);
        }
      }
    } else {
      // العودة للحالة الأصلية
      delete nextNew[memberId];
      delete nextDel[memberId];
      console.log('↩️ العودة للحالة الأصلية:', memberId);
    }

    console.log('📊 القوائم المحدثة:', {
      checkGloblenew: nextNew,
      checkGlobledelete: nextDel
    });

    setCheckGloblenew(nextNew);
    setCheckGlobledelete(nextDel);
  };

  const submit = async () => {
    try {
      console.log('💾 حفظ التغييرات للمشروع:', {
        projectId,
        branchId,
        newMembers: checkGloblenew,
        deletedMembers: checkGlobledelete
      });

      // التحقق من وجود تغييرات
      const hasNewMembers = Object.keys(checkGloblenew).length > 0;
      const hasDeletedMembers = Object.keys(checkGlobledelete).length > 0;

      if (!hasNewMembers && !hasDeletedMembers) {
        Tostget('لم يتم إجراء أي تغييرات');
        return;
      }

      // التحقق من الصلاحيات للأعضاء الجدد فقط
      if (hasNewMembers && selectedPerms.length === 0) {
        Tostget("يرجى اختيار صلاحية واحدة على الأقل للأعضاء الجدد");
        setPermModalOpen(true);
        return;
      }

      setLoading(true);

      // تحديث الصلاحيات في checkGloblenew
      const updatedCheckGloblenew = { ...checkGloblenew };
      Object.keys(updatedCheckGloblenew).forEach(id => {
        updatedCheckGloblenew[parseInt(id)].Validity = selectedPerms;
      });

      // إرسال طلب واحد مع كل التغييرات - مطابق للتطبيق المحمول
      const requestData = {
        idBrinsh: branchId || user?.data?.IDCompanyBransh,
        type: projectId,
        checkGloblenew: updatedCheckGloblenew,
        checkGlobleold: checkGlobledelete,
        kind: 'user'
      };

      console.log('📤 إرسال الطلب:', requestData);

      const response = await axiosInstance.put('/user/updat/userBrinshv2', requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      console.log('📊 API Response:', {
        status: response.status,
        data: response.data
      });

      // التحقق من النجاح - مطابق للباك اند
      if (response.data?.success === true || response.data?.message === 'successfuly' || response.status === 200) {
        const addedCount = Object.keys(updatedCheckGloblenew).length;
        const removedCount = Object.keys(checkGlobledelete).length;

        if (addedCount > 0 && removedCount > 0) {
          Tostget(`تم إضافة ${addedCount} وحذف ${removedCount} من أعضاء المشروع`);
        } else if (addedCount > 0) {
          Tostget(`تم إضافة ${addedCount} عضو للمشروع`);
        } else if (removedCount > 0) {
          Tostget(`تم حذف ${removedCount} عضو من المشروع`);
        }

        // إعادة تعيين الحالة
        setCheckGloblenew({});
        setCheckGlobledelete({});
        setSelectedPerms([]);

        await onSaved();
        onClose();
      } else {
        Tostget(response.data?.message || 'فشل في حفظ التغييرات');
      }
    } catch (e: any) {
      console.error(e);
      const errorMessage = e.response?.data?.message || e.message || t('projectModals.addUsers.error');
      Tostget(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl shadow-2xl"
        style={{
          backgroundColor: 'var(--theme-card-background)',
          border: '1px solid var(--theme-border)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e)=>e.stopPropagation()}
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="var(--theme-primary, #6366f1)" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="var(--theme-primary, #6366f1)" strokeWidth="2"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="var(--theme-primary, #6366f1)" strokeWidth="2"/>
              </svg>
            </div>
            <h3
              className="font-bold"
              style={{
                fontSize: '18px',
                fontFamily: 'var(--font-ibm-arabic-bold)',
                color: 'var(--theme-text-primary)',
                lineHeight: 1.4,
                direction: dir as 'rtl' | 'ltr',
                textAlign: isRTL ? 'right' : 'left'
              }}
            >
              {t('projectModals.addUsers.title')}
            </h3>
          </div>
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
          <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
            <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="flex-1 rounded-xl transition-all duration-200 focus:scale-[1.02]"
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--theme-input-background)',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text-primary)',
                fontSize: '16px',
                fontFamily: 'var(--font-ibm-arabic-medium)',
                direction: dir as 'rtl' | 'ltr',
                textAlign: isRTL ? 'right' : 'left'
              }}
              placeholder={t('projectModals.addUsers.search')}
              dir={dir as 'rtl' | 'ltr'}
            />
            <button
              onClick={()=>fetchMembers(true)}
              className="rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--theme-surface-secondary)',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text-primary)',
                fontSize: '14px',
                fontFamily: 'var(--font-ibm-arabic-medium)'
              }}
            >
              تحديث
            </button>
          </div>

          <div
            className="max-h-80 overflow-auto rounded-xl"
            style={{
              backgroundColor: 'var(--theme-surface-secondary)',
              border: '1px solid var(--theme-border)',
              marginBottom: '16px'
            }}
          >
            {filtered.map(m => {
              const isInProject = m.is_in_ProjectID === 'true';
              return (
                <label
                  key={m.id}
                  className="flex items-center justify-between transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--theme-border)',
                    cursor: 'pointer',
                    backgroundColor: isInProject ? 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.05))' : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={isInProject}
                      onChange={()=>toggle(m.id)}
                      className="w-4 h-4 rounded"
                      style={{
                        accentColor: 'var(--theme-primary)'
                      }}
                    />
                    <div className="flex-1">
                      <div
                        style={{
                          fontSize: '14px',
                          fontFamily: 'var(--font-ibm-arabic-semibold)',
                          color: 'var(--theme-text-primary)',
                          marginBottom: '4px'
                        }}
                      >
                        {m.userName}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontFamily: 'var(--font-ibm-arabic-regular)',
                          color: 'var(--theme-text-secondary)'
                        }}
                      >
                        {m.PhoneNumber}
                      </div>
                    </div>
                    {isInProject && (
                      <div
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-ibm-arabic-medium)',
                          color: 'var(--theme-primary)',
                          backgroundColor: 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))',
                          padding: '4px 8px',
                          borderRadius: '8px'
                        }}
                      >
                        في المشروع
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
            {hasMore && (
              <div className="p-3 text-center">
                <button
                  disabled={loading}
                  onClick={()=>fetchMembers(false)}
                  className="rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))',
                    border: '1px solid var(--theme-primary)',
                    color: 'var(--theme-primary)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-ibm-arabic-medium)'
                  }}
                >
                  {loading ? 'جارٍ التحميل...' : 'تحميل المزيد'}
                </button>
              </div>
            )}
          </div>

          {/* عرض عدد التغييرات */}
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--theme-surface-secondary)',
                border: '1px solid var(--theme-border)',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'var(--font-ibm-arabic-medium)',
                color: 'var(--theme-text-primary)',
                direction: dir as 'rtl' | 'ltr',
                textAlign: isRTL ? 'right' : 'left'
              }}
            >
              {Object.keys(checkGloblenew).length > 0 && (
                <div style={{ color: 'var(--theme-success)', marginBottom: '4px' }}>
                  ✓ سيتم إضافة {Object.keys(checkGloblenew).length} عضو
                </div>
              )}
              {Object.keys(checkGlobledelete).length > 0 && (
                <div style={{ color: 'var(--theme-error)' }}>
                  ✗ سيتم حذف {Object.keys(checkGlobledelete).length} عضو
                </div>
              )}
              {Object.keys(checkGloblenew).length === 0 && Object.keys(checkGlobledelete).length === 0 && (
                <div style={{ color: 'var(--theme-text-secondary)' }}>
                  لم يتم إجراء أي تغييرات
                </div>
              )}
            </div>
          </div>

          {/* زر اختيار الصلاحيات - يظهر فقط إذا كان هناك أعضاء جدد */}
          {Object.keys(checkGloblenew).length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={()=>setPermModalOpen(true)}
                className="rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'var(--theme-primary)',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: 'var(--font-ibm-arabic-semibold)',
                  border: 'none'
                }}
              >
                اختيار الصلاحيات ({selectedPerms.length})
              </button>
            </div>
          )}
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
            margin: '8px 0',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px'
          }}
        >
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--theme-success)',
              color: 'white',
              fontSize: '16px',
              fontFamily: 'var(--font-ibm-arabic-semibold)',
              border: 'none',
              width: '45%'
            }}
          >
            {loading ? t('projectModals.addUsers.adding') : t('projectModals.addUsers.add')}
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
            {t('projectModals.addUsers.cancel')}
          </button>
        </div>

        {permModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="w-full max-w-xl shadow-2xl"
              style={{
                backgroundColor: 'var(--theme-card-background)',
                border: '1px solid var(--theme-border)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              {/* Sub-modal Header */}
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
                <div className="flex items-center justify-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--theme-warning-alpha, rgba(245, 158, 11, 0.1))' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="var(--theme-warning, #f59e0b)" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h4
                    style={{
                      fontSize: '16px',
                      fontFamily: 'var(--font-ibm-arabic-bold)',
                      color: 'var(--theme-text-primary)',
                      lineHeight: 1.4
                    }}
                  >
                    صلاحيات المشروع للمستخدم
                  </h4>
                </div>
              </div>

              {/* Sub-modal Content */}
              <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '16px' }}>
                {/* Matching mobile app AddValidity.tsx - type=1 for project permissions */}
                <PermissionList
                  selectedPermissions={selectedPerms}
                  onPermissionChange={(perms)=>setSelectedPerms(perms as PermissionType[])}
                  type="project"
                />
              </div>

              {/* Sub-modal Footer */}
              <div
                className="flex gap-3"
                style={{
                  borderTop: '1px solid var(--theme-border)',
                  background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  margin: '8px 0',
                  borderBottomLeftRadius: '20px',
                  borderBottomRightRadius: '20px'
                }}
              >
                <button
                  onClick={()=>setPermModalOpen(false)}
                  className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--theme-success)',
                    color: 'white',
                    fontSize: '16px',
                    fontFamily: 'var(--font-ibm-arabic-semibold)',
                    border: 'none',
                    width: '45%'
                  }}
                >
                  تم
                </button>
                <button
                  onClick={()=>{ setSelectedPerms([]); setPermModalOpen(false); }}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

