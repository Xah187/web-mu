"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "@/lib/api/axios";
import { Tostget } from "@/components/ui/Toast";
import PermissionList from "@/components/Permissions/PermissionList";
import { PermissionType } from "@/types/permissions";

interface AddProjectUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onSaved: () => Promise<void> | void;
}

interface CompanyMember {
  id: number;
  userName: string;
  PhoneNumber: string;
  image?: string;
}

export default function AddProjectUsersModal({ isOpen, onClose, projectId, onSaved }: AddProjectUsersModalProps) {
  const { user } = useSelector((state: any) => state.user || {});
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [lastId, setLastId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<PermissionType[]>([]);

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
      const res = await axiosInstance.get(`/user/BringUserCompany?IDCompany=${user?.data?.IDCompany}&number=${number}&kind_request=all`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.accessToken}` }
      });
      if (res.status === 200) {
        const list: CompanyMember[] = res.data?.data || [];
        setMembers(prev => reset ? list : [...prev, ...list]);
        if (list.length > 0) setLastId(list[list.length - 1].id);
        setHasMore(list.length > 0);
      }
    } catch (e) {
      console.error(e);
      Tostget("خطأ في جلب المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    const s = search.trim();
    return members.filter(m => m.userName?.includes(s) || m.PhoneNumber?.includes(s));
  }, [search, members]);

  const toggle = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const submit = async () => {
    try {
      if (selected.length === 0) {
        Tostget("يرجى اختيار مستخدم واحد على الأقل");
        return;
      }
      if (selectedPerms.length === 0) {
        Tostget("يرجى اختيار صلاحية واحدة على الأقل");
        setPermModalOpen(true);
        return;
      }
      setLoading(true);
      // استخدم InsertmultipleProjecsinvalidity كما في التطبيق
      const phoneNumbers = members.filter(m => selected.includes(m.id)).map(m => m.PhoneNumber);
      if (phoneNumbers.length === 0) {
        Tostget("لم يتم العثور على أرقام هواتف للمستخدمين المحددين");
        return;
      }
      // إرسال لكل رقم هاتف كما يفعل التطبيق بإضافة مشاريع متعددة لمستخدم واحد، هنا مستخدمين متعددين لنفس المشروع
      for (const phone of phoneNumbers) {
        await axiosInstance.put('/user/InsertmultipleProjecsinvalidity', {
          ProjectesNew: [projectId],
          Validitynew: selectedPerms,
          idBrinsh: user?.data?.IDCompanyBransh,
          PhoneNumber: phone
        }, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.accessToken}` } });
      }
      Tostget("تمت إضافة المستخدمين للمشروع");
      await onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      Tostget("فشل إضافة المستخدمين");
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
                lineHeight: 1.4
              }}
            >
              إضافة مستخدمين للمشروع
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
                fontFamily: 'var(--font-ibm-arabic-medium)'
              }}
              placeholder="ابحث بالاسم أو الرقم"
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
            {filtered.map(m => (
              <label
                key={m.id}
                className="flex items-center justify-between transition-all duration-200 hover:scale-[1.01]"
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--theme-border)',
                  cursor: 'pointer'
                }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(m.id)}
                    onChange={()=>toggle(m.id)}
                    className="w-4 h-4 rounded"
                    style={{
                      accentColor: 'var(--theme-primary)'
                    }}
                  />
                  <div>
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
                </div>
              </label>
            ))}
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

          <div style={{ marginTop: '16px', marginBottom: '24px' }}>
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
            {loading ? 'جارٍ الحفظ...' : 'حفظ'}
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
                <PermissionList
                  selectedPermissions={selectedPerms}
                  onPermissionChange={(perms)=>setSelectedPerms(perms as PermissionType[])}
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

