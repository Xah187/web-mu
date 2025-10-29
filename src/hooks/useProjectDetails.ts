import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import useDataHome from './useDataHome';

export interface Stage {
  StageCustID: number;
  StageID: number | string;
  ProjectID: number;
  StageName: string;
  Done: string;
  rate: number;
  Days: number;
  Ratio?: number;
  attached?: string;
  StageStartdate: string | null;
  StageEnddate: string | null;
  Delays?: number;
  Notes?: string;
  TotalCost?: number;
  CompletedTasks?: number;
  TotalTasks?: number;
}

export interface ProjectDetails {
  id?: number;
  ProjectID?: number;
  Nameproject: string;
  Note?: string;
  rate: number;
  cost: number;
  ProjectStartdate: string | null;
  Daysremaining?: number;
  TotalcosttothCompany?: number;
  ConstCompany?: number;
  DaysUntiltoday?: number;
  LocationProject?: string;
  GuardNumber?: string;
  Linkevaluation?: string;
  countuser?: number;
  TypeOFContract?: string;
  IDcompanySub?: number;
  IDCompanySub?: number; // معرف الفرع - مطابق للتطبيق المحمول
  EndDate?: string;
  StartDate?: string;
  DisabledFinance?: boolean;
}

interface UseProjectDetailsReturn {
  project: ProjectDetails | null;
  stages: Stage[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasMoreStages: boolean;
  fetchProjectDetails: (projectId: number) => Promise<void>;
  fetchStages: (projectId: number, lastStageId?: number, type?: string) => Promise<void>;
  loadMoreStages: (projectId: number) => Promise<void>;
  refreshProject: (projectId: number) => Promise<void>;
  addStage: (projectId: number, stageName: string, days: number, ratio?: number, attached?: string) => Promise<void>;
  deleteStage: (projectId: number, stageId: number) => Promise<void>;
}

export const useProjectDetails = (): UseProjectDetailsReturn => {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreStages, setHasMoreStages] = useState(true);

  const { user } = useSelector((state: any) => state.user || {});
  const { saveProjectData } = useDataHome();

  const fetchProjectDetails = useCallback(async (projectId: number) => {
    if (!user?.accessToken) {
      setError('لا يوجد رمز وصول صالح');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        `/brinshCompany/BringProjectObjectone?idProject=${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      // في التطبيق الأصلي، البيانات في result.data.data
      const projectData = response.data?.data || response.data;

      if (projectData) {
        setProject(projectData);

        // Save project data to localStorage (matching mobile app's AsyncStorage)
        // Matches: Src/functions/companyBransh/PageHomeProjectFunction.tsx (lines 48-57)
        if (projectData.Nameproject) {
          await saveProjectData(projectData.Nameproject);
        }
      }
    } catch (error: any) {
      console.error('خطأ في جلب تفاصيل المشروع:', error);
      setError(error.response?.data?.message || 'فشل في جلب تفاصيل المشروع');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const fetchStages = useCallback(async (
    projectId: number, 
    lastStageId: number = 0, 
    type: string = 'cache'
  ) => {
    if (!user?.accessToken) {
      setError('لا يوجد رمز وصول صالح');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Always use v2 endpoint to match mobile app behavior
      const endpoint = `/brinshCompany/v2/BringStage?ProjectID=${projectId}&type=${type}&number=${lastStageId}`;
        
      const response = await axiosInstance.get(endpoint, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      // في التطبيق الأصلي، البيانات في result.data.data
      const stagesData = response.data?.data || response.data;
      
      if (stagesData && Array.isArray(stagesData)) {
        if (lastStageId === 0) {
          // First load or refresh
          setStages(stagesData);
        } else {
          // Load more (pagination)
          setStages(prev => [...prev, ...stagesData]);
        }
        
        // Check if there are more stages to load based on pagination logic
        // If we get less than 8 items or if type is 'all', there are no more stages
        if (type === 'all' || stagesData.length < 8) {
          setHasMoreStages(false);
        } else {
          setHasMoreStages(stagesData.length >= 8);
        }
      } else {
        setStages([]);
        setHasMoreStages(false);
      }
    } catch (error: any) {
      console.error('خطأ في جلب المراحل:', error);
      setError(error.response?.data?.message || 'فشل في جلب المراحل');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const loadMoreStages = useCallback(async (projectId: number) => {
    if (!hasMoreStages || loading) return;
    
    const lastStageId = stages.length > 0 ? stages[stages.length - 1].StageCustID : 0;
    await fetchStages(projectId, lastStageId, 'update');
  }, [hasMoreStages, loading, stages, fetchStages]);

  const refreshProject = useCallback(async (projectId: number) => {
    try {
      setRefreshing(true);
      setError(null);
      setHasMoreStages(true); // Reset pagination state
      
      // Fetch both project details and stages
      await Promise.all([
        fetchProjectDetails(projectId),
        fetchStages(projectId, 0, 'update')
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProjectDetails, fetchStages]);

  const addStage = useCallback(async (
    projectId: number,
    stageName: string,
    days: number,
    ratio: number = 0,
    attached: string = ''
  ) => {
    if (!user?.accessToken) {
      setError('لا يوجد رمز وصول صالح');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get project details to extract TypeOFContract like mobile app
      const typeOfContract = project?.TypeOFContract || '';

      const response = await axiosInstance.post(
        '/brinshCompany/Stage',
        {
          StageName: stageName,
          ProjectID: projectId,
          TypeOFContract: typeOfContract,
          Days: days,
          Ratio: ratio,
          attached: attached
        },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        // Refresh stages after adding
        await fetchStages(projectId, 0, 'update');
      }
    } catch (error: any) {
      console.error('خطأ في إضافة المرحلة:', error);
      setError(error.response?.data?.message || 'فشل في إضافة المرحلة');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken, fetchStages, project]);

  const deleteStage = useCallback(async (projectId: number, stageId: number) => {
    if (!user?.accessToken) {
      setError('لا يوجد رمز وصول صالح');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        `/brinshCompany/DeleteStageHome?ProjectID=${projectId}&StageID=${stageId}`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        // Remove stage from local state
        setStages(prev => prev.filter(stage => stage.StageID !== stageId));
      }
    } catch (error: any) {
      console.error('خطأ في حذف المرحلة:', error);
      setError(error.response?.data?.message || 'فشل في حذف المرحلة');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  return {
    project,
    stages,
    loading,
    refreshing,
    error,
    hasMoreStages,
    fetchProjectDetails,
    fetchStages,
    loadMoreStages,
    refreshProject,
    addStage,
    deleteStage,
  };
};

export default useProjectDetails;
