'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/store';
import axiosInstance from '@/lib/api/axios';

interface StageProgressHookProps {
  stageId?: number | string;
  projectId?: number;
  initialRate?: number;
}

export const useStageProgress = ({ stageId, projectId, initialRate = 0 }: StageProgressHookProps) => {
  const { user } = useAppSelector((state: any) => state.user);
  const [calculatedRate, setCalculatedRate] = useState<number>(initialRate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateProgress = useCallback(async () => {
    if (!user?.accessToken || !stageId || !projectId) {
      return initialRate;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch sub-stages for this stage
      const response = await axiosInstance.get(
        `/brinshCompany/BringStagesub?ProjectID=${projectId}&StageID=${stageId}&type=all&number=0`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      const subStages = response.data?.data || [];

      if (!Array.isArray(subStages) || subStages.length === 0) {
        // No sub-stages, use initial rate
        return initialRate;
      }

      // Calculate percentage based on completed sub-stages
      const completedSubStages = subStages.filter((sub: any) => sub.Done === 'true').length;
      const totalSubStages = subStages.length;
      const calculatedPercentage = (completedSubStages / totalSubStages) * 100;

      // Keep the same precision as mobile app (up to 1 decimal place)
      return parseFloat(calculatedPercentage.toFixed(1));
    } catch (error) {
      console.error('Error calculating stage progress:', error);
      setError('خطأ في حساب تقدم المرحلة');
      return initialRate;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken, stageId, projectId, initialRate]);

  const refreshProgress = useCallback(async () => {
    const newRate = await calculateProgress();
    setCalculatedRate(newRate);
    return newRate;
  }, [calculateProgress]);

  // Update rate when initial rate changes
  useEffect(() => {
    const validRate = typeof initialRate === 'number' && !isNaN(initialRate) ? initialRate : 0;
    // Keep the same precision as the original rate from API
    setCalculatedRate(parseFloat(validRate.toFixed(1)));
  }, [initialRate]);

  // Auto-calculate progress on mount if we have the required data
  useEffect(() => {
    if (stageId && projectId && user?.accessToken) {
      refreshProgress();
    }
  }, [stageId, projectId, user?.accessToken, refreshProgress]);

  return {
    calculatedRate,
    loading,
    error,
    refreshProgress,
    calculateProgress,
  };
};

export default useStageProgress;
