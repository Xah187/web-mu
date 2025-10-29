'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';

interface Project {
  id: number;
  Nameproject: string;
  cheack: string;
}

interface AddMultipleProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: number;
  memberPhoneNumber: string;
  memberName: string;
  onSuccess: () => void;
}

export default function AddMultipleProjectsModal({
  isOpen,
  onClose,
  branchId,
  memberPhoneNumber,
  memberName,
  onSuccess
}: AddMultipleProjectsModalProps) {
  const { user } = useSelector((state: any) => state.user || {});
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [lastProjectId, setLastProjectId] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // قائمة الصلاحيات للمشروع - مطابق للتطبيق المحمول
  const projectPermissions = [
    'اقفال المرحلة',
    'اضافة مرحلة فرعية',
    'إضافة مرحلة رئيسية',
    'تعديل مرحلة رئيسية',
    'حذف مرحلة رئيسية',
    'حذف مهمة فرعية',
    'تشييك الانجازات الفرعية',
    'إضافة تأخيرات',
    'انشاء مجلد او تعديله',
    'انشاء عمليات مالية',
    'ترتيب المراحل',
    'إنشاء طلبات',
    'تشييك الطلبات',
    'إشعارات المالية',
    'إظهار المالية',
    'إظهار الإرشيف',
    'إظهار التكلفه اليومية',
    'إضافة مستخدمين للمشروع',
    'بدء المشروع',
    'تعديل تاريخ بدء المشروع',
    'تعديل بيانات المشروع',
    'حذف مشروع'
  ];

  useEffect(() => {
    if (isOpen) {
      fetchProjects(true);
    }
  }, [isOpen]);

  const fetchProjects = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setLastProjectId(0);
        setProjects([]);
        setSelectedProjects([]);
      } else {
        setLoadingMore(true);
      }

      const number = reset ? 0 : lastProjectId;
      
      // مطابق للتطبيق المحمول - GET /user/BringvalidityuserinBransh
      const response = await axiosInstance.get(
        `/user/BringvalidityuserinBransh?PhoneNumber=${memberPhoneNumber}&idBrinsh=${branchId}&number=${number}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      console.log('📊 المشاريع المتاحة:', response.data);

      if (response.data?.data && Array.isArray(response.data.data)) {
        const newProjects = response.data.data;
        
        if (reset) {
          setProjects(newProjects);
          // تحديد المشاريع الموجودة مسبقاً
          const existingProjects = newProjects
            .filter((p: Project) => p.cheack === 'true')
            .map((p: Project) => p.id);
          setSelectedProjects(existingProjects);
        } else {
          setProjects(prev => [...prev, ...newProjects]);
        }

        if (newProjects.length > 0) {
          setLastProjectId(newProjects[newProjects.length - 1].id);
        }

        setHasMore(newProjects.length >= 10);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      Tostget('خطأ في جلب المشاريع');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleToggleProject = (projectId: number) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const handleTogglePermission = (permission: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedProjects.length === 0) {
      Tostget('يرجى اختيار مشروع واحد على الأقل');
      return;
    }

    if (selectedPermissions.length === 0) {
      Tostget('يرجى اختيار صلاحية واحدة على الأقل');
      return;
    }

    setLoading(true);
    try {
      // مطابق للتطبيق المحمول - PUT /user/InsertmultipleProjecsinvalidity
      const response = await axiosInstance.put('/user/InsertmultipleProjecsinvalidity', {
        ProjectesNew: selectedProjects,
        Validitynew: selectedPermissions,
        idBrinsh: branchId,
        PhoneNumber: memberPhoneNumber
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      if (response.data?.success === 'تمت العملية بنجاح') {
        Tostget('تم إضافة المشاريع بنجاح');
        onSuccess();
        onClose();
      } else {
        Tostget(response.data?.success || 'فشل في إضافة المشاريع');
      }
    } catch (error) {
      console.error('Error adding projects:', error);
      Tostget('خطأ في إضافة المشاريع');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-ibm-arabic-bold text-gray-900">
            إضافة مشاريع متعددة - {memberName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Projects Section */}
        <div className="mb-6">
          <h3 className="text-lg font-ibm-arabic-semibold text-gray-900 mb-4">
            اختر المشاريع ({selectedProjects.length})
          </h3>
          
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-ibm-arabic-medium">
                لا توجد مشاريع متاحة
              </div>
            ) : (
              <>
                {projects.map((project) => {
                  const isSelected = selectedProjects.includes(project.id);
                  const isExisting = project.cheack === 'true';
                  
                  return (
                    <div
                      key={project.id}
                      onClick={() => handleToggleProject(project.id)}
                      className={`p-4 border-b border-gray-200 last:border-b-0 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        
                        <div className="flex-1 font-ibm-arabic-semibold text-gray-900">
                          {project.Nameproject}
                        </div>

                        {isExisting && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-ibm-arabic-medium">
                            موجود بالفعل
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {loadingMore && (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                )}
                
                {hasMore && !loadingMore && (
                  <div className="p-4 text-center">
                    <button
                      onClick={() => fetchProjects(false)}
                      className="text-blue-600 font-ibm-arabic-semibold hover:text-blue-700"
                    >
                      تحميل المزيد
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Permissions Section */}
        <div className="mb-6">
          <h3 className="text-lg font-ibm-arabic-semibold text-gray-900 mb-4">
            اختر الصلاحيات ({selectedPermissions.length})
          </h3>
          
          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {projectPermissions.map((permission) => {
              const isSelected = selectedPermissions.includes(permission);
              
              return (
                <button
                  key={permission}
                  onClick={() => handleTogglePermission(permission)}
                  className={`p-3 border-2 rounded-lg font-ibm-arabic-medium text-sm transition-colors ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {permission}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
          >
            إلغاء
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading || selectedProjects.length === 0 || selectedPermissions.length === 0}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الإضافة...
              </>
            ) : (
              'إضافة المشاريع'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

