'use client';

import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

/**
 * useDataHome - Manages DataHome in localStorage
 * Matches mobile app's DataHome storage pattern:
 * - HomAdminFunction: saves nameCompany, Country, Cost
 * - HomSubFunction: saves nameBransh, Email, PhoneNumber
 * - PageHomeProjectFunction: saves nameProject
 */

export interface DataHome {
  nameCompany?: string;
  Country?: string;
  Cost?: string | number;
  nameBransh?: string;
  Email?: string;
  PhoneNumber?: string;
  nameProject?: string;
  IDCompanyBransh?: number;
}

export default function useDataHome() {
  const { getItemsStorage, setItemsStorage } = useLocalStorage();

  /**
   * Save company data (from HomeAdmin)
   * Matches: Src/functions/companyBransh/HomAdminFunction.tsx (lines 52-61)
   */
  const saveCompanyData = useCallback(async (data: {
    nameCompany: string;
    Country: string;
    Cost: string | number;
  }) => {
    try {
      const objectCompany: DataHome = {
        nameCompany: data.nameCompany,
        Country: data.Country,
        Cost: data.Cost,
      };
      console.log('[useDataHome] Saving company data:', objectCompany);
      await setItemsStorage(objectCompany, 'DataHome');
      console.log('[useDataHome] ✅ Company data saved successfully');
    } catch (error) {
      console.error('[useDataHome] ❌ Error saving company data:', error);
    }
  }, [setItemsStorage]);

  /**
   * Save branch data (from HomSub)
   * Matches: Src/functions/companyBransh/HomSubFunction.tsx (lines 85-99)
   */
  const saveBranchData = useCallback(async (data: {
    IDCompanyBransh: number;
    nameBransh: string;
    Email: string;
    PhoneNumber: string;
  }) => {
    try {
      const dataHome = await getItemsStorage<DataHome>('DataHome');
      console.log('[useDataHome] Current DataHome:', dataHome);
      console.log('[useDataHome] Merging branch data:', data);

      const objectCompany: DataHome = {
        ...dataHome,
        IDCompanyBransh: data.IDCompanyBransh,
        nameBransh: data.nameBransh,
        Email: data.Email,
        PhoneNumber: data.PhoneNumber,
      };
      console.log('[useDataHome] Final DataHome to save:', objectCompany);
      await setItemsStorage(objectCompany, 'DataHome');
      console.log('[useDataHome] ✅ Branch data saved successfully');
    } catch (error) {
      console.error('[useDataHome] ❌ Error saving branch data:', error);
    }
  }, [getItemsStorage, setItemsStorage]);

  /**
   * Save project data (from PageHomeProject)
   * Matches: Src/functions/companyBransh/PageHomeProjectFunction.tsx (lines 48-57)
   */
  const saveProjectData = useCallback(async (nameProject: string) => {
    try {
      const dataHome = await getItemsStorage<DataHome>('DataHome');
      console.log('[useDataHome] Current DataHome:', dataHome);
      console.log('[useDataHome] Adding project name:', nameProject);

      const objectCompany: DataHome = {
        ...dataHome,
        nameProject: nameProject,
      };
      console.log('[useDataHome] Final DataHome to save:', objectCompany);
      await setItemsStorage(objectCompany, 'DataHome');
      console.log('[useDataHome] ✅ Project data saved successfully');
    } catch (error) {
      console.error('[useDataHome] ❌ Error saving project data:', error);
    }
  }, [getItemsStorage, setItemsStorage]);

  /**
   * Get all DataHome
   */
  const getDataHome = useCallback(async (): Promise<DataHome | null> => {
    try {
      return await getItemsStorage<DataHome>('DataHome');
    } catch (error) {
      console.error('Error getting DataHome:', error);
      return null;
    }
  }, [getItemsStorage]);

  /**
   * Update DataHome with partial data
   */
  const updateDataHome = useCallback(async (partialData: Partial<DataHome>) => {
    try {
      const dataHome = await getItemsStorage<DataHome>('DataHome');
      const updatedData: DataHome = {
        ...dataHome,
        ...partialData,
      };
      await setItemsStorage(updatedData, 'DataHome');
    } catch (error) {
      console.error('Error updating DataHome:', error);
    }
  }, [getItemsStorage, setItemsStorage]);

  return {
    saveCompanyData,
    saveBranchData,
    saveProjectData,
    getDataHome,
    updateDataHome,
  };
}

