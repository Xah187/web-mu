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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl" onClick={(e)=>e.stopPropagation()}>
        <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-4">إضافة مستخدمين للمشروع</h3>

        <div className="flex items-center gap-3 mb-4">
          <input value={search} onChange={(e)=>setSearch(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" placeholder="ابحث بالاسم أو الرقم" />
          <button onClick={()=>fetchMembers(true)} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">تحديث</button>
        </div>

        <div className="max-h-80 overflow-auto border rounded-lg">
          {filtered.map(m => (
            <label key={m.id} className="flex items-center justify-between px-3 py-2 border-b">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={selected.includes(m.id)} onChange={()=>toggle(m.id)} />
                <div>
                  <div className="text-sm font-ibm-arabic-semibold">{m.userName}</div>
                  <div className="text-xs text-gray-600">{m.PhoneNumber}</div>
                </div>
              </div>
            </label>
          ))}
          {hasMore && (
            <div className="p-3 text-center">
              <button disabled={loading} onClick={()=>fetchMembers(false)} className="px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50">
                {loading ? 'جارٍ التحميل...' : 'تحميل المزيد'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={()=>setPermModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            اختيار الصلاحيات ({selectedPerms.length})
          </button>
        </div>

        <div className="flex space-x-3 space-x-reverse mt-6">
          <button onClick={submit} disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? 'جارٍ الحفظ...' : 'حفظ'}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors">
            إلغاء
          </button>
        </div>

        {permModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-xl">
              <h4 className="text-md font-ibm-arabic-bold mb-3">صلاحيات المشروع للمستخدم</h4>
              <PermissionList
                selectedPermissions={selectedPerms}
                onPermissionChange={(perms)=>setSelectedPerms(perms as PermissionType[])}
              />
              <div className="flex gap-3 mt-4">
                <button onClick={()=>setPermModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">تم</button>
                <button onClick={()=>{ setSelectedPerms([]); setPermModalOpen(false); }} className="px-4 py-2 bg-gray-200 rounded-lg">إلغاء</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

