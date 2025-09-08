'use client';

import axiosInstance from '@/lib/api/axios';
import { useAppSelector } from '@/store';

/**
 * Projects API functions - separated from business logic
 * Matches mobile app structure: Src/functions/companyBransh/ApisAllCompanybransh.tsx
 */
export default function useApiProjects() {
  const { user } = useAppSelector(state => state.user);

  /**
   * Fetch project details
   * @param projectId - Project ID
   */
  const fetchProjectDetails = async (projectId: number) => {
    if (!user?.accessToken) {
      throw new Error('Missing authentication');
    }

    const response = await axiosInstance.get(
      `/brinshCompany/BringProjectObjectone?idProject=${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    return response.data;
  };

  /**
   * Fetch project stages
   * @param projectId - Project ID
   * @param lastStageId - Last stage ID for pagination
   * @param type - Type of fetch (update, cache, etc.)
   */
  const fetchStages = async (projectId: number, lastStageId: number = 0, type: string = 'cache') => {
    if (!user?.accessToken) {
      throw new Error('Missing authentication');
    }

    const response = await axiosInstance.get(
      `/brinshCompany/BringStageProject?idProject=${projectId}&StageID=${lastStageId}&type=${type}`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    return response.data;
  };

  /**
   * Add new stage to project
   * @param projectId - Project ID
   * @param stageName - Stage name
   * @param days - Number of days
   */
  const addStage = async (projectId: number, stageName: string, days: number) => {
    if (!user?.accessToken) {
      throw new Error('Missing authentication');
    }

    const response = await axiosInstance.post(
      '/brinshCompany/insertStage',
      {
        idProject: projectId,
        StageName: stageName,
        Days: days,
        userName: user.data?.userName
      },
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    return response.data;
  };

  /**
   * Delete stage from project
   * @param projectId - Project ID
   * @param stageId - Stage ID
   */
  const deleteStage = async (projectId: number, stageId: number) => {
    if (!user?.accessToken) {
      throw new Error('Missing authentication');
    }

    const response = await axiosInstance.delete(
      `/brinshCompany/deleteStage?idProject=${projectId}&StageID=${stageId}&userName=${user.data?.userName}`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    return response.data;
  };

  /**
   * Fetch projects for branch
   * @param branchId - Branch ID
   * @param lastProjectId - Last project ID for pagination
   * @param type - Type of fetch
   */
  const fetchBranchProjects = async (branchId: number, lastProjectId: number = 0, type: string = 'cache') => {
    if (!user?.accessToken) {
      throw new Error('Missing authentication');
    }

    const response = await axiosInstance.get(
      `/brinshCompany/BringProject?IDCompanyBransh=${branchId}&IDfinlty=${lastProjectId}&type=${type}`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    return response.data;
  };

  /**
   * Create new project
   * @param projectData - Project data
   */
  const createProject = async (projectData: any) => {
    if (!user?.accessToken) {
      throw new Error('Missing authentication');
    }

    const response = await axiosInstance.post(
      '/brinshCompany/insertProject',
      {
        ...projectData,
        userName: user.data?.userName
      },
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    return response.data;
  };

  /**
   * Delete project
   * @param projectId - Project ID
   */
  const deleteProject = async (projectId: number) => {
    if (!user?.accessToken) {
      throw new Error('Missing authentication');
    }

    const response = await axiosInstance.delete(
      `/brinshCompany/deleteProject?idProject=${projectId}&userName=${user.data?.userName}`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    return response.data;
  };

  /**
   * Close or open project
   * @param projectId - Project ID
   * @param status - New status
   */
  const toggleProjectStatus = async (projectId: number, status: string) => {
    if (!user?.accessToken) {
      throw new Error('Missing authentication');
    }

    const response = await axiosInstance.put(
      '/brinshCompany/closeProject',
      {
        idProject: projectId,
        status: status,
        userName: user.data?.userName
      },
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    return response.data;
  };

  /**
   * Filter projects
   * @param filterData - Filter parameters
   */
  const filterProjects = async (filterData: any) => {
    if (!user?.accessToken) {
      throw new Error('Missing authentication');
    }

    const queryParams = new URLSearchParams({
      IDCompanyBransh: filterData.IDCompanyBransh?.toString() || '',
      nameProject: filterData.nameProject || '',
      status: filterData.status || '',
      DateStart: filterData.DateStart || '',
      DateEnd: filterData.DateEnd || '',
      userName: user.data?.userName || ''
    });

    const response = await axiosInstance.get(
      `/brinshCompany/filterProjects?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    return response.data;
  };

  return {
    fetchProjectDetails,
    fetchStages,
    addStage,
    deleteStage,
    fetchBranchProjects,
    createProject,
    deleteProject,
    toggleProjectStatus,
    filterProjects
  };
}
