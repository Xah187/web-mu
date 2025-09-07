'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import useValidityUser from '@/hooks/useValidityUser';

// Types
interface ClosedProject {
  id: number;
  Nameproject: string;
  Note: string;
  TypeOFContract: string;
  LocationProject: string;
  GuardNumber: string;
  numberBuilding: number;
  Referencenumber: number;
  Date: string;
  Contractsigningdate?: string;
}

export default function ClosedProjectsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const branchId = parseInt(params.id as string);
  const branchName = searchParams.get('branchName') || 'الفرع';
  
  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();

  const [projects, setProjects] = useState<ClosedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchClosedProjects();
  }, [branchId]);

  const fetchClosedProjects = async (lastId = 0) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/brinshCompany/BringDataprojectClosed?IDCompanySub=${branchId}&IDfinlty=${lastId}`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        }
      );

      if (response.data?.data) {
        const newProjects = response.data.data;
        if (lastId === 0) {
          setProjects(newProjects);
        } else {
          setProjects(prev => [...prev, ...newProjects]);
        }
        setHasMore(newProjects.length > 0);
      }
    } catch (error) {
      console.error('Error fetching closed projects:', error);
      Tostget('خطأ في جلب المشاريع المغلقة');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProjects = () => {
    if (hasMore && !loading && projects.length > 0) {
      const lastProject = projects[projects.length - 1];
      fetchClosedProjects(lastProject.id);
    }
  };

  const reopenProject = async (projectId: number) => {
    const hasPermission = await Uservalidation('إغلاق وفتح المشروع', projectId);
    if (!hasPermission) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [projectId]: true }));

    try {
      await axiosInstance.get('/brinshCompany/CloseOROpenProject', {
        params: { idProject: projectId },
        headers: { Authorization: `Bearer ${user?.accessToken}` }
      });

      Tostget('تم فتح المشروع بنجاح');

      // Remove project from closed list
      setProjects(prev => prev.filter(p => p.id !== projectId));

      // Navigate back to branch projects page after successful reopening
      setTimeout(() => {
        router.push(`/branch/${branchId}/projects`);
      }, 1500); // Give time for the success message to show

    } catch (error) {
      console.error('Error reopening project:', error);
      Tostget('خطأ في فتح المشروع');
    } finally {
      setActionLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4" style={{ paddingTop: '35px' }}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h1 className="text-lg font-ibm-arabic-bold text-gray-900">المشاريع المغلقة</h1>
            <p className="text-sm font-ibm-arabic-medium text-gray-600">{branchName}</p>
          </div>
          
          <div className="w-10"></div>
        </div>

        {/* Stats */}
        <div className="mt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-center">
              <div className="text-2xl font-ibm-arabic-bold text-red-600 mb-1">
                {projects.length}
              </div>
              <div className="text-sm font-ibm-arabic-medium text-gray-600">
                إجمالي المشاريع المغلقة
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading && projects.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <>
            <div className="space-y-3">
              {projects.map((project) => (
                <ClosedProjectCard
                  key={project.id}
                  project={project}
                  onReopen={() => reopenProject(project.id)}
                  loading={actionLoading[project.id]}
                  formatDate={formatDate}
                />
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={loadMoreProjects}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-ibm-arabic-semibold transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                      تحميل المزيد
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.2.45 4.53 1.23"/>
              </svg>
            </div>
            <p className="text-gray-500 font-ibm-arabic-medium">لا توجد مشاريع مغلقة</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Closed Project Card Component
interface ClosedProjectCardProps {
  project: ClosedProject;
  onReopen: () => void;
  loading: boolean;
  formatDate: (date: string) => string;
}

function ClosedProjectCard({ project, onReopen, loading, formatDate }: ClosedProjectCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-ibm-arabic-bold text-gray-900 text-lg mb-2">
              {project.Nameproject}
            </h3>
            
            {project.Note && (
              <p className="text-gray-600 font-ibm-arabic-medium text-sm mb-3">
                {project.Note}
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">نوع العقد:</span>
                <span className="font-ibm-arabic-medium text-gray-900 mr-2">
                  {project.TypeOFContract}
                </span>
              </div>
              
              <div>
                <span className="text-gray-500">عدد المباني:</span>
                <span className="font-ibm-arabic-bold text-gray-900 mr-2">
                  {project.numberBuilding}
                </span>
              </div>
              
              <div>
                <span className="text-gray-500">الرقم المرجعي:</span>
                <span className="font-ibm-arabic-bold text-gray-900 mr-2">
                  {project.Referencenumber}
                </span>
              </div>
              
              <div>
                <span className="text-gray-500">تاريخ الإنشاء:</span>
                <span className="font-ibm-arabic-medium text-gray-900 mr-2">
                  {formatDate(project.Date)}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onReopen}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-ibm-arabic-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
            فتح المشروع
          </button>
        </div>
      </div>
    </div>
  );
}
