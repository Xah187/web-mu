'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';
import { useTranslation } from '@/hooks/useTranslation';

// Types
interface ClosedProject {
  ProjectID: number; // Matching mobile app field name
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
  const { t, dir } = useTranslation();

  const branchId = parseInt(params.id as string);
  const branchName = searchParams.get('branchName') || t('closedProjectsPage.branch');

  const { user } = useSelector((state: any) => state.user || {});

  const [projects, setProjects] = useState<ClosedProject[]>([]);
  const [loading, setLoading] = useState(false);
  // Responsive grid like Home/Projects pages
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});

  const fetchClosedProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/brinshCompany/BringDataprojectClosed?IDCompanySub=${branchId}&IDfinlty=0`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        }
      );

      if (response.data?.data) {
        const newProjects = response.data.data;
        setProjects(newProjects);
      }
    } catch (error) {
      console.error('Error fetching closed projects:', error);
      Tostget(t('closedProjectsPage.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [branchId, user?.accessToken, t]);

  useEffect(() => {
    fetchClosedProjects();
  }, [fetchClosedProjects]);

  const reopenProject = async (projectId: number) => {
    // Prevent multiple simultaneous requests for the same project
    if (actionLoading[projectId]) {
      return;
    }

    // No permission check - matching mobile app behavior (lines 94-98 in ProjectColse.tsx)
    setActionLoading(prev => ({ ...prev, [projectId]: true }));

    try {
      const response = await axiosInstance.get(`/brinshCompany/CloseOROpenProject?idProject=${projectId}`, {
        headers: { Authorization: `Bearer ${user?.accessToken}` }
      });

      if (response.status === 200) {
        // Refresh the closed projects list (matching mobile app behavior)
        await fetchClosedProjects();
        Tostget(t('closedProjectsPage.reopenSuccess'));
      }

    } catch (error) {
      console.error('Error reopening project:', error);
      Tostget(t('closedProjectsPage.reopenError'));
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
    <ResponsiveLayout
      header={
        <PageHeader
          title={t('closedProjectsPage.title')}
          subtitle={branchName}
          backButton={
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label={t('closedProjectsPage.backButton')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          }
        />
      }
    >
      <ContentSection>
        {/* Stats */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-ibm-arabic-bold text-red-600 mb-1">
              {projects.length}
            </div>
            <div
              className="text-sm font-ibm-arabic-medium text-gray-600"
              style={{ direction: dir as 'rtl' | 'ltr' }}
            >
              {t('closedProjectsPage.totalClosedProjects')}
            </div>
          </div>
        </div>

        {/* Content */}
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
            <div
              className="projects-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: screenWidth < 640 ? '1fr' : screenWidth < 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: screenWidth < 640 ? '0.75rem' : '1rem',
                width: '100%'
              }}
            >
              {projects.map((project, index) => (
                <ClosedProjectCard
                  key={`${project.ProjectID}-${index}`}
                  project={project}
                  onReopen={() => reopenProject(project.ProjectID)}
                  loading={actionLoading[project.ProjectID]}
                  formatDate={formatDate}
                  t={t}
                  dir={dir}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.2.45 4.53 1.23"/>
              </svg>
            </div>
            <p
              className="text-gray-500 font-ibm-arabic-medium"
              style={{ direction: dir as 'rtl' | 'ltr' }}
            >
              {t('closedProjectsPage.noClosedProjects')}
            </p>
          </div>
        )}
      </ContentSection>
    </ResponsiveLayout>
  );
}

// Closed Project Card Component
interface ClosedProjectCardProps {
  project: ClosedProject;
  onReopen: () => void;
  loading: boolean;
  formatDate: (date: string) => string;
  t: (key: string) => string;
  dir: string;
}

function ClosedProjectCard({ project, onReopen, loading, formatDate, t, dir }: ClosedProjectCardProps) {
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

            <div
              className="grid grid-cols-2 gap-3 text-sm"
              style={{ direction: dir as 'rtl' | 'ltr' }}
            >
              <div>
                <span className="text-gray-500">{t('closedProjectsPage.contractType')}</span>
                <span className="font-ibm-arabic-medium text-gray-900 mr-2">
                  {project.TypeOFContract}
                </span>
              </div>

              <div>
                <span className="text-gray-500">{t('closedProjectsPage.buildingsCount')}</span>
                <span className="font-ibm-arabic-bold text-gray-900 mr-2">
                  {project.numberBuilding}
                </span>
              </div>

              <div>
                <span className="text-gray-500">{t('closedProjectsPage.referenceNumber')}</span>
                <span className="font-ibm-arabic-bold text-gray-900 mr-2">
                  {project.Referencenumber}
                </span>
              </div>

              <div>
                <span className="text-gray-500">{t('closedProjectsPage.creationDate')}</span>
                <span className="font-ibm-arabic-medium text-gray-900 mr-2">
                  {formatDate(project.Date)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReopen();
            }}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-ibm-arabic-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            style={{ direction: dir as 'rtl' | 'ltr' }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
            {t('closedProjectsPage.reopenProject')}
          </button>
        </div>
      </div>
    </div>
  );
}
