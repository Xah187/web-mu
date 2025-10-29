'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';

interface UserData {
  IDCompany?: number;
  userName?: string;
}

interface User {
  accessToken?: string;
  data?: UserData;
}

export interface Branch {
  id: number;
  name: string;
  NameSub: string;
}

export interface Project {
  id: number;
  name: string;
  Nameproject: string;
}

export interface ReportData {
  NameCompany?: string;
  Nameproject?: string;
  TypeOFContract?: string;
  startDateProject?: string;
  EndDateProject?: string;
  Daysremaining?: number;
  rateProject?: number;
  countStageall?: number;
  countSTageTrue?: number;
  StagesPending?: number;
  LateStages?: number;
  TotalRevenue?: number;
  TotalExpense?: number;
  TotalReturns?: number;
  TotalcosttothCompany?: number;
  TotalDelayDay?: number;
  DelayProject?: Array<{
    countdayDelay: number;
    Type: string;
    Note: string;
    DateNote: string;
  }>;
  RateRequests?: number;
  countallRequests?: number;
  countCLOSE?: number;
  boss?: string;
  MostAccomplished?: Array<{
    userName: string;
    Count: number;
    rate: number;
  }>;
  ratematchtime?: number;
}

export default function useReports() {
  const userState = useAppSelector((state) => state.user);
  const user = userState?.user; // Extract the actual user object
  const [branches, setBranches] = useState<Branch[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  // Fetch branches
  const fetchBranches = async (type = 'cache') => {
    if (!user?.accessToken || !user?.data?.IDCompany) {
      return;
    }

    setBranchesLoading(true);

    try {
      // الباك اند الجديد يستخدم GET بدلاً من POST
      const response = await axiosInstance.get(
        `company/brinsh/bring?IDCompany=${user.data.IDCompany}&type=${type}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      if (response.status === 200 && response.data?.data) {
        // Use the same simple approach as usePosts
        const branchesData = response.data.data.map((branch: any) => ({
          id: branch.id,
          name: branch.NameSub || branch.name,
          NameSub: branch.NameSub || branch.name
        }));

        setBranches(branchesData);
        Tostget(`تم تحميل ${branchesData.length} فرع`);
      } else {
        setBranches([]);
        Tostget('لا توجد فروع متاحة');
      }
    } catch (error: any) {
      console.error('Error fetching branches:', error);
      Tostget('خطأ في جلب الفروع');
    } finally {
      setBranchesLoading(false);
    }
  };

  // Fetch projects for selected branch
  const fetchProjects = async (branchId: number, lastProjectId = 0) => {
    if (!user?.accessToken || !branchId) {
      return;
    }

    setProjectsLoading(true);
    
    try {
      // Using the correct endpoint from mobile app: brinshCompany/BringProject
      const response = await axiosInstance.get(
        `brinshCompany/BringProject?IDcompanySub=${branchId}&IDfinlty=${lastProjectId}&type=cache`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      if (response.status === 200 && response.data) {
        let projectsArray = [];
        
        if (response.data.data && Array.isArray(response.data.data)) {
          projectsArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          projectsArray = response.data;
        }

        if (projectsArray.length > 0) {
          const projectsData = projectsArray.map((project: any) => ({
            id: project.id,
            name: project.Nameproject || project.name,
            Nameproject: project.Nameproject || project.name
          }));

          if (lastProjectId === 0) {
            setProjects(projectsData);
          } else {
            setProjects(prev => [...prev, ...projectsData]);
          }

          // Check if there are more projects to load
          // If we got less than expected (usually 10-20), assume no more
          setHasMoreProjects(projectsData.length >= 10);

          Tostget(`تم تحميل ${projectsData.length} مشروع`);
        } else {
          if (lastProjectId === 0) {
            setProjects([]);
            setHasMoreProjects(false);
            Tostget('لا توجد مشاريع متاحة');
          } else {
            // No more projects to load
            setHasMoreProjects(false);
          }
        }
      }
    } catch (error: any) {
      Tostget('خطأ في جلب المشاريع');
      if (lastProjectId === 0) {
        setProjects([]);
      }
    } finally {
      setProjectsLoading(false);
    }
  };

  // Fetch report data for selected project
  const fetchReportData = async (projectId: number) => {
    if (!user?.accessToken || !projectId) {
      return;
    }

    setLoading(true);
    
    try {
      // Using the correct endpoint from mobile app: brinshCompany/BringReportforProject
      const response = await axiosInstance.get(
        `brinshCompany/BringReportforProject?ProjectID=${projectId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      if (response.status === 200 && response.data) {
        let reportData = null;
        
        if (response.data.data) {
          reportData = response.data.data;
        } else if (response.data) {
          reportData = response.data;
        }

        if (reportData) {
          setReportData(reportData);
          Tostget('تم تحميل التقرير بنجاح');
        } else {
          setReportData(null);
          Tostget('لا توجد بيانات تقرير متاحة');
        }
      }
    } catch (error: any) {
      Tostget('خطأ في جلب بيانات التقرير');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all projects for a branch (continuous loading until all are fetched)
  const fetchAllProjects = async (branchId: number) => {
    let allProjects: Project[] = [];
    let lastProjectId = 0;
    let hasMore = true;

    setProjectsLoading(true);

    while (hasMore) {
      try {
        const response = await axiosInstance.get(
          `brinshCompany/BringProject?IDcompanySub=${branchId}&IDfinlty=${lastProjectId}&type=cache`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user?.accessToken}`
            }
          }
        );

        if (response.status === 200 && response.data) {
          let projectsArray = [];

          if (response.data.data && Array.isArray(response.data.data)) {
            projectsArray = response.data.data;
          } else if (Array.isArray(response.data)) {
            projectsArray = response.data;
          }

          if (projectsArray.length > 0) {
            const projectsData = projectsArray.map((project: any) => ({
              id: project.id,
              name: project.Nameproject || project.name,
              Nameproject: project.Nameproject || project.name
            }));

            allProjects = [...allProjects, ...projectsData];
            lastProjectId = projectsData[projectsData.length - 1].id;

            // Update UI with current progress
            setProjects([...allProjects]);

            // Small delay to prevent overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 200));
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        hasMore = false;
      }
    }

    setHasMoreProjects(false);
    setProjectsLoading(false);

    if (allProjects.length > 0) {
      Tostget(`تم تحميل جميع المشاريع: ${allProjects.length} مشروع`);
    } else {
      Tostget('لا توجد مشاريع متاحة');
    }
  };

  // Select branch and fetch its projects
  const selectBranch = async (branch: Branch) => {
    setSelectedBranch(branch);
    setSelectedProject(null);
    setReportData(null);
    setProjects([]);
    setHasMoreProjects(true);

    if (branch.id > 0) {
      await fetchAllProjects(branch.id);
    }
  };

  // Select project and fetch its report
  const selectProject = async (project: Project) => {
    setSelectedProject(project);
    setReportData(null);
    
    if (project.id > 0) {
      await fetchReportData(project.id);
    }
  };

  // Load more projects (pagination)
  const loadMoreProjects = async () => {
    if (!selectedBranch || projects.length === 0) return;
    
    const lastProject = projects[projects.length - 1];
    if (lastProject) {
      await fetchProjects(selectedBranch.id, lastProject.id);
    }
  };

  // Reset selections
  const resetSelections = () => {
    setSelectedBranch(null);
    setSelectedProject(null);
    setReportData(null);
    setProjects([]);
    setHasMoreProjects(true);
  };

  // Generate Financial Statement Report (PDF)
  const generateFinancialStatement = async (projectId: number, type: 'all' | 'party') => {
    if (!user?.accessToken || !projectId) {
      Tostget('الرجاء اختيار مشروع أولاً');
      return null;
    }

    setReportLoading(true);
    try {
      const response = await axiosInstance.get(
        `brinshCompany/BringStatmentFinancialforproject?ProjectID=${projectId}&type=${type}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      if (response.status === 200 && response.data?.url) {
        return response.data.url;
      } else {
        Tostget('فشل في إنشاء التقرير المالي');
        return null;
      }
    } catch (error: any) {
      console.error('Error generating financial statement:', error);
      Tostget('خطأ في إنشاء التقرير المالي');
      return null;
    } finally {
      setReportLoading(false);
    }
  };

  // Generate Requests Report (PDF)
  const generateRequestsReport = async (projectId: number, type: 'part' | 'all') => {
    if (!user?.accessToken || !projectId) {
      Tostget('الرجاء اختيار مشروع أولاً');
      return null;
    }

    setReportLoading(true);
    try {
      const response = await axiosInstance.get(
        `brinshCompany/BringreportRequessts?id=${projectId}&type=${type}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      if (response.status === 200 && response.data?.namefile) {
        return response.data.namefile;
      } else {
        Tostget(response.data?.success || 'فشل في إنشاء تقرير الطلبات');
        return null;
      }
    } catch (error: any) {
      console.error('Error generating requests report:', error);
      Tostget('خطأ في إنشاء تقرير الطلبات');
      return null;
    } finally {
      setReportLoading(false);
    }
  };

  // Generate Timeline Report (PDF)
  const generateTimelineReport = async (projectId: number) => {
    if (!user?.accessToken || !projectId) {
      Tostget('الرجاء اختيار مشروع أولاً');
      return null;
    }

    setReportLoading(true);
    try {
      const response = await axiosInstance.get(
        `brinshCompany/BringreportTimeline?ProjectID=${projectId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      if (response.status === 200 && response.data?.namefile) {
        return response.data.namefile;
      } else {
        Tostget('فشل في إنشاء تقرير الجدول الزمني');
        return null;
      }
    } catch (error: any) {
      console.error('Error generating timeline report:', error);
      Tostget('خطأ في إنشاء تقرير الجدول الزمني');
      return null;
    } finally {
      setReportLoading(false);
    }
  };

  // Initialize by fetching branches
  useEffect(() => {
    if (user?.accessToken && user?.data?.IDCompany) {
      fetchBranches();
    }
  }, [user?.accessToken, user?.data?.IDCompany]);

  return {
    branches,
    projects,
    selectedBranch,
    selectedProject,
    reportData,
    loading,
    branchesLoading,
    projectsLoading,
    hasMoreProjects,
    reportLoading,
    fetchBranches,
    fetchProjects,
    selectBranch,
    selectProject,
    loadMoreProjects,
    resetSelections,
    generateFinancialStatement,
    generateRequestsReport,
    generateTimelineReport
  };
}
