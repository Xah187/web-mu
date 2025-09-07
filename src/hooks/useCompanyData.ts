import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';


export interface CompanyData {
  id: string;
  NameCompany: string;
  BuildingNumber: string;
  StreetName: string;
  NeighborhoodName: string;
  PostalCode: string;
  City: string;
  Country: string;
  TaxNumber: string;
  Cost: string;
  CommercialRegistrationNumber: string;
  Covenantnumber?: number;
}

export interface BranchData {
  id: string;
  NameSub: string;
  BranchAddress: string;
  Email: string;
  PhoneNumber: string;
  CountProject: number;
  Linkevaluation?: string;
}

export interface HomeData {
  nameCompany: string;
  CommercialRegistrationNumber: string;
  Covenantnumber: number;
  branchCount: number;
  data: BranchData[];
}

export const useCompanyData = () => {
  const { user } = useAppSelector((state: any) => state.user);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyData = async () => {
    if (!user?.data?.IDCompany) return;

    setLoading(true);
    setError(null);

    try {
      // Store token in localStorage for axios interceptor
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', user.accessToken);
      }
      
      const response = await axiosInstance.get(
        `company?idCompany=${user.data.IDCompany}`
      );
      
      if (response.status === 200) {
        // Handle different response structures
        if (response.data.data) {
          setCompanyData(response.data.data);
        } else if (response.data) {
          setCompanyData(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      setError('خطأ في جلب بيانات الشركة');
      Tostget('خطأ في جلب بيانات الشركة');
    } finally {
      setLoading(false);
    }
  };

  const fetchHomeData = async (type = 'cache') => {
    if (!user?.data?.IDCompany) return;

    setLoading(true);
    setError(null);

    try {
      const requestData = {
        IDCompany: user.data.IDCompany,
        type: type
      };

      // Store token in localStorage for axios interceptor
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', user.accessToken);
      }
      
      const response = await axiosInstance.post(
        'company/brinsh/bring',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`
          }
        }
      );

      if (response.status === 200 && response.data) {
        // Mobile app does NOT filter branches - it shows all branches from the API response
        // Only Admin/Branch Manager permissions affect UI buttons, not branch visibility
        setHomeData(response.data);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
      setError('خطأ في جلب بيانات الصفحة الرئيسية');
      Tostget('خطأ في جلب بيانات الصفحة الرئيسية');
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyData = async (data: Partial<CompanyData>) => {
    if (!user?.accessToken) return false;

    setLoading(true);
    setError(null);

    try {
      // Store token in localStorage for axios interceptor
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', user.accessToken);
      }
      
      const response = await axiosInstance.put(
        'company',
        data
      );

      if (response.data && response.data.success) {
        Tostget('تم تحديث بيانات الشركة بنجاح');
        await fetchCompanyData(); // Refresh data
        await fetchHomeData(); // Refresh home data
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating company data:', error);
      setError('خطأ في تحديث بيانات الشركة');
      Tostget('خطأ في تحديث بيانات الشركة');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchCompanyData(), fetchHomeData('update')]);
  };

  useEffect(() => {
    if (user?.data?.IDCompany) {
      fetchCompanyData();
      fetchHomeData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.data?.IDCompany]);

  return {
    companyData,
    homeData,
    loading,
    error,
    fetchCompanyData,
    fetchHomeData,
    updateCompanyData,
    refreshData
  };
};


