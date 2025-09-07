import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Tostget } from '@/components/ui/Toast';

export const useProjectActions = () => {
  const router = useRouter();

  // Handle project location - open in maps
  const handleLocation = useCallback((project: any) => {
    if (project?.LocationProject && project.LocationProject !== null) {
      // Open location in new tab/window
      window.open(project.LocationProject, '_blank');
    } else {
      // Show toast notification
      Tostget('لم يتم تحديد موقع للمشروع', 'warning');
    }
  }, []);

  // Handle guard phone call
  const handleGuard = useCallback((project: any) => {
    if (project?.GuardNumber && project.GuardNumber !== null) {
      // Create phone call link
      const phoneNumber = `0${project.GuardNumber}`;
      window.location.href = `tel:${phoneNumber}`;
    } else {
      // Show toast notification
      Tostget('لم يتم تحديد رقم للحارس', 'warning');
    }
  }, []);

  // Navigate to project requests
  const handleRequests = useCallback((branchId: number) => {
    router.push(`/branch/${branchId}/requests`);
  }, [router]);

  // Navigate to project notifications
  const handleNotifications = useCallback((projectId: number) => {
    router.push(`/project/${projectId}/notifications`);
  }, [router]);

  return {
    handleLocation,
    handleGuard,
    handleRequests,
    handleNotifications,
  };
};

export default useProjectActions;
