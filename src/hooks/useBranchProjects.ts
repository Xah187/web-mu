import { useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '@/lib/api/axios';

import { setBoss } from '@/store/slices/userSlice';

export interface Project {
  id: number;
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
  GuardNumber?: string | null;
  Linkevaluation?: string;
  countuser?: number;
  TypeOFContract?: string;
  ProjectID?: number;
}

interface UseBranchProjectsReturn {
  projects: Project[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  fetchProjects: (branchId: number, lastProjectId?: number, type?: string) => Promise<void>;
  fetchAllProjectsAtOnce: (branchId: number, type?: string) => Promise<void>;
  loadMoreProjects: (branchId: number) => Promise<void>;
  refreshProjects: (branchId: number) => Promise<void>;
  deleteProject: (projectId: number) => Promise<void>;
  closeProject: (projectId: number) => Promise<void>;
  filterProjects: (branchId: number, searchTerm: string) => Promise<Project[]>;
}

export const useBranchProjects = (): UseBranchProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useSelector((state: any) => state.user || {});
  const dispatch = useDispatch();
  
  // استخدام useRef لتتبع حالة التحميل الحالي
  const isLoadingRef = useRef(false);

  // دالة لتحميل جميع المشاريع مرة واحدة من خلال تحميل جميع الدفعات تلقائياً
  const fetchAllProjectsAtOnce = useCallback(async (branchId: number, type: string = 'cache') => {
    if (!user?.accessToken) {
      setError('لا يوجد رمز وصول صالح');
      return;
    }

    // منع التكرار أثناء التحميل
    if (isLoadingRef.current || loading || loadingMore) {
      console.log('🔄 تحميل قيد التنفيذ، تجاهل الطلب المكرر');
      return;
    }

    try {
      isLoadingRef.current = true; // تعيين حالة التحميل
      setLoading(true);
      setError(null);
      setProjects([]); // إعادة تعيين المشاريع قبل التحميل
      console.log('🚀 جاري تحميل جميع المشاريع للفرع:', branchId);

      let allProjects: Project[] = [];
      let lastProjectId = 0;
      let hasMoreData = true;
      let batchCount = 0;

      while (hasMoreData) {
        batchCount++;
        console.log(`📦 تحميل الدفعة ${batchCount}...`);

        const response = await axiosInstance.get(
          `/brinshCompany/BringProject?IDcompanySub=${branchId}&IDfinlty=${lastProjectId}&type=${type}`,
          {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          }
        );
        // Mobile app sets boss from this endpoint if provided
        if (response?.data?.boss !== undefined) {
          dispatch(setBoss(response.data.boss));
        }

        // استخراج بيانات المشاريع
        let projectsData = response.data?.data;
        if (!projectsData && response.data) {
          if (Array.isArray(response.data)) {
            projectsData = response.data;
          } else if (response.data.result) {
            projectsData = response.data.result;
          } else if (response.data.projects) {
            projectsData = response.data.projects;
          }
        }

        // Server already filters projects based on user permissions (like mobile app)
        // No client-side filtering needed - projects are already filtered by getProjectsForUser on server

        if (projectsData && Array.isArray(projectsData) && projectsData.length > 0) {
          allProjects = [...allProjects, ...projectsData];
          console.log(`✅ الدفعة ${batchCount}: ${projectsData.length} مشروع (المجموع: ${allProjects.length})`);
          
          // تحديث الواجهة مع المشاريع الحالية
          setProjects([...allProjects]);
          
          // التحقق إذا كان هناك المزيد من المشاريع (الباك إند يرسل 3 في كل دفعة)
          if (projectsData.length < 3) {
            hasMoreData = false;
            console.log('🎉 تم تحميل جميع المشاريع!');
          } else {
            // تحديد lastProjectId للدفعة التالية
            lastProjectId = projectsData[projectsData.length - 1]?.id || 
                          projectsData[projectsData.length - 1]?.ProjectID || 0;
          }
        } else {
          hasMoreData = false;
          console.log('📭 لا توجد مشاريع في هذه الدفعة');

          // إذا كانت هذه الدفعة الأولى ولا توجد مشاريع، تأكد من تحديث الحالة
          if (batchCount === 1) {
            console.log('📋 المستخدم لا يملك صلاحية لأي مشاريع في هذا الفرع');
            setProjects([]); // تأكد من أن المشاريع فارغة
            setHasMore(false);
          }
        }

        // حد أمان لمنع التكرار اللانهائي
        if (batchCount >= 50) {
          console.warn('⚠️ تم الوصول للحد الأقصى من المحاولات');
          break;
        }

        // تأخير قصير بين الطلبات
        if (hasMoreData) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      setHasMore(false);
      console.log(`🎊 انتهى بنجاح: تم تحميل ${allProjects.length} مشروع في ${batchCount} دفعة`);
      console.log('📋 قائمة المشاريع النهائية:', allProjects.map(p => ({ id: p.id, name: p.Nameproject })));

    } catch (error: any) {
      console.error('❌ خطأ في جلب المشاريع:', error);

      if (error.response?.status === 400) {
        // خطأ 400 يعني عادة أن المستخدم لا يملك صلاحية للوصول لمشاريع هذا الفرع
        console.log('📋 المستخدم لا يملك صلاحية للوصول لمشاريع هذا الفرع');
        setProjects([]); // عرض صفحة فارغة
        setHasMore(false);
        setError(null); // لا نعرض خطأ، فقط صفحة فارغة
      } else if (error.response?.status === 500) {
        setError('خطأ في الخادم. يرجى المحاولة لاحقاً');
      } else if (error.response?.status === 401) {
        setError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
      } else if (error.response?.status === 404) {
        setError('لم يتم العثور على البيانات المطلوبة');
      } else {
        setError(error.response?.data?.message || 'فشل في جلب المشاريع');
      }
    } finally {
      isLoadingRef.current = false; // إعادة تعيين حالة التحميل
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user?.accessToken]);

  const fetchProjects = useCallback(async (
    branchId: number, 
    lastProjectId: number = 0, 
    type: string = 'cache'
  ) => {
    // للتحميل الأولي، استخدم الدالة الجديدة لتحميل جميع المشاريع مرة واحدة
    if (lastProjectId === 0) {
      return fetchAllProjectsAtOnce(branchId, type);
    }
    
    // للـ pagination (لن نحتاجه عادة الآن، لكن نبقيه للتوافق)
    // هذا المنطق القديم للدفعة الواحدة...
    console.log('Using legacy single-batch fetch for pagination');
  }, [fetchAllProjectsAtOnce]);

  // Load more projects (pagination)
  const loadMoreProjects = useCallback(async (branchId: number) => {
    if (!hasMore || loadingMore || loading) {
      return;
    }

    if (projects.length === 0) {
      return;
    }

    setLoadingMore(true);
    
    // Use the last project's ID for pagination
    const lastProjectId = projects[projects.length - 1]?.id || projects[projects.length - 1]?.ProjectID || 0;
    await fetchProjects(branchId, lastProjectId, 'cache');
  }, [projects, hasMore, loadingMore, loading, fetchProjects]);

  const refreshProjects = useCallback(async (branchId: number) => {
    try {
      setRefreshing(true);
      setError(null);
      await fetchAllProjectsAtOnce(branchId, 'update');
    } finally {
      setRefreshing(false);
    }
  }, [fetchAllProjectsAtOnce]);

  const deleteProject = useCallback(async (projectId: number) => {
    if (!user?.accessToken) {
      setError('لا يوجد رمز وصول صالح');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.delete(
        `/brinshCompany/DeletProjectwithDependencies?idProject=${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        // Remove project from local state
        setProjects(prev => prev.filter(project => project.id !== projectId));
      }
    } catch (error: any) {
      console.error('خطأ في حذف المشروع:', error);
      setError(error.response?.data?.message || 'فشل في حذف المشروع');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const closeProject = useCallback(async (projectId: number) => {
    if (!user?.accessToken) {
      setError('لا يوجد رمز وصول صالح');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        `/brinshCompany/CloseOROpenProject?idProject=${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        // Update project status in local state
        setProjects(prev => 
          prev.map(project => 
            project.id === projectId 
              ? { ...project, rate: -1 } // Assuming closed projects have rate -1
              : project
          )
        );
      }
    } catch (error: any) {
      console.error('خطأ في إغلاق المشروع:', error);
      setError(error.response?.data?.message || 'فشل في إغلاق المشروع');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const filterProjects = useCallback(async (
    branchId: number,
    searchTerm: string
  ): Promise<Project[]> => {
    if (!user?.accessToken) {
      setError('لا يوجد رمز وصول صالح');
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        `/brinshCompany/FilterProject?IDCompanySub=${branchId}&search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      // في التطبيق الأصلي، البيانات في result.data.data
      const filterData = response.data?.data;
      let searchResults = Array.isArray(filterData) ? filterData : [];

      // Server already filters search results based on user permissions (like mobile app)
      // No client-side filtering needed - results are already filtered by FilterProject on server

      // تحديث قائمة المشاريع بنتائج البحث
      setProjects(searchResults);
      setHasMore(false); // إيقاف التحميل الإضافي عند البحث

      return searchResults;
    } catch (error: any) {
      console.error('خطأ في فلترة المشاريع:', error);
      setError(error.response?.data?.message || 'فشل في فلترة المشاريع');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  return {
    projects,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    fetchProjects,
    fetchAllProjectsAtOnce,
    loadMoreProjects,
    refreshProjects,
    deleteProject,
    closeProject,
    filterProjects,
  };
};



export default useBranchProjects;
