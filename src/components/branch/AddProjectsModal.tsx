'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';

interface BranchMember {
  id: number;
  userName: string;
  PhoneNumber: string;
  Email: string;
  job: string;
  jobdiscrption: string;
  jobHOM?: string;
  image?: string;
  Date: string;
}

interface Project {
  id: number;
  Nameproject: string;
  Note: string;
  TypeOFContract: string;
  LocationProject: string;
  GuardNumber: string;
  numberBuilding: number;
  Referencenumber: number;
  Date: string;
}

interface AddProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: BranchMember | null;
  branchId: number;
  onSuccess: () => void;
}

// قائمة الصلاحيات المتاحة - مطابق للتطبيق المحمول
const AVAILABLE_PERMISSIONS = [
  'اقفال المرحلة',
  'اضافة مرحلة فرعية',
  'إضافة مرحلة رئيسية',
  'تعديل مرحلة رئيسية',
  'تشييك الانجازات الفرعية',
  'إضافة تأخيرات',
  'انشاء مجلد او تعديله',
  'انشاء عمليات مالية',
  'ترتيب المراحل',
  'إنشاء طلبات',
  'تشييك الطلبات',
  'إشعارات المالية',
];

export default function AddProjectsModal({
  isOpen,
  onClose,
  member,
  branchId,
  onSuccess
}: AddProjectsModalProps) {
  const { user } = useSelector((state: any) => state.user || {});
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [currentUserProjects, setCurrentUserProjects] = useState<number[]>([]);
  const [showPermissionsStep, setShowPermissionsStep] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      fetchProjects();
      fetchUserCurrentProjects();
    }
  }, [isOpen, member, branchId]);

  if (!isOpen || !member) return null;

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // جلب مشاريع الفرع - مطابق للتطبيق المحمول
      const response = await axiosInstance.get(
        `/brinshCompany/BringProject?IDcompanySub=${branchId}&IDfinlty=0&type=cache`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.data?.data) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      Tostget('خطأ في جلب المشاريع');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCurrentProjects = async () => {
    try {
      // جلب المشاريع الحالية للمستخدم - مطابق للتطبيق المحمول
      const response = await axiosInstance.get(
        `/user/BringvalidityuserinBransh?PhoneNumber=${member.PhoneNumber}&idBrinsh=${branchId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.data?.data) {
        setCurrentUserProjects(response.data.data);
        setSelectedProjects(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user projects:', error);
    }
  };

  const handleProjectToggle = (projectId: number) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleNextStep = () => {
    if (selectedProjects.length === 0) {
      Tostget('يرجى اختيار مشروع واحد على الأقل');
      return;
    }
    setShowPermissionsStep(true);
  };

  const handleSubmit = async () => {
    if (selectedPermissions.length === 0) {
      Tostget('يرجى اختيار صلاحية واحدة على الأقل');
      return;
    }

    setLoading(true);
    try {
      // إضافة مشاريع متعددة للمستخدم - مطابق للتطبيق المحمول
      const response = await axiosInstance.put('/user/InsertmultipleProjecsinvalidity', {
        ProjectesNew: selectedProjects,
        Validitynew: selectedPermissions,
        idBrinsh: branchId,
        PhoneNumber: member.PhoneNumber
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      if (response.status === 200) {
        Tostget('تم إضافة المشاريع بنجاح');
        onSuccess();
        onClose();
        resetModal();
      }
    } catch (error) {
      console.error('Error adding projects:', error);
      Tostget('خطأ في إضافة المشاريع');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setSelectedProjects([]);
    setSelectedPermissions([]);
    setShowPermissionsStep(false);
    setCurrentUserProjects([]);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-6 text-center">
          {showPermissionsStep ? 'اختيار الصلاحيات' : 'إضافة مشاريع للمستخدم'}
        </h3>
        
        <div className="mb-4 text-center">
          <p className="text-sm font-ibm-arabic-medium text-gray-600">
            المستخدم: <span className="font-ibm-arabic-bold text-blue-600">{member.userName}</span>
          </p>
        </div>

        {!showPermissionsStep ? (
          // خطوة اختيار المشاريع
          <div>
            <h4 className="text-md font-ibm-arabic-bold text-gray-800 mb-4">
              اختر المشاريع ({selectedProjects.length} محدد)
            </h4>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-4 border rounded-xl cursor-pointer transition-colors ${
                      selectedProjects.includes(project.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleProjectToggle(project.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-ibm-arabic-semibold text-gray-900 text-right">
                          {project.Nameproject}
                        </h5>
                        <p className="text-sm text-gray-600 text-right mt-1">
                          {project.TypeOFContract} • {project.LocationProject}
                        </p>
                      </div>
                      
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedProjects.includes(project.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedProjects.includes(project.id) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // خطوة اختيار الصلاحيات
          <div>
            <h4 className="text-md font-ibm-arabic-bold text-gray-800 mb-4">
              اختر الصلاحيات ({selectedPermissions.length} محدد)
            </h4>
            
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <button
                  key={permission}
                  onClick={() => handlePermissionToggle(permission)}
                  className={`p-3 text-sm font-ibm-arabic-medium rounded-lg border transition-colors text-right ${
                    selectedPermissions.includes(permission)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {permission}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={showPermissionsStep ? () => setShowPermissionsStep(false) : handleClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
          >
            {showPermissionsStep ? 'السابق' : 'إلغاء'}
          </button>
          
          <button
            onClick={showPermissionsStep ? handleSubmit : handleNextStep}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الحفظ...
              </>
            ) : showPermissionsStep ? (
              'حفظ المشاريع'
            ) : (
              'التالي'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
