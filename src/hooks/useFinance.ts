'use client';

import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
// Note: Tostget will be imported from a proper toast library when available
const Tostget = (message: string) => {
  console.log('Toast:', message);
  // Temporary implementation - replace with actual toast library
};

// Convert Arabic numbers to English (matching mobile app)
export const convertArabicToEnglish = (arabicNumber: string): string => {
  const arabicToEnglishMap: { [key: string]: string } = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5',
    '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };

  return arabicNumber.split('').map(char => arabicToEnglishMap[char] || char).join('');
};

// Number formatting utility matching mobile app exactly
export const Totaltofixt = (number: number | string): string => {
  // Convert Arabic numbers to English first if it's a string
  let numString = String(number);
  if (typeof number === 'string') {
    numString = convertArabicToEnglish(numString);
  }
  
  const numValue = parseFloat(numString) || 0;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

// Truncate formatted number for display (like mobile app)
export const truncateNumber = (num: number | string, maxLength: number = 7): string => {
  const numValue = parseFloat(String(num)) || 0;
  const formatted = Totaltofixt(numValue); // Format first, then truncate
  return formatted.length > maxLength ? formatted.slice(0, maxLength) + '..' : formatted;
};

// Format date with full year in English (DD-MM-YYYY)
export const formatDateEnglish = (dateString: string): string => {
  try {
    // Convert Arabic date string to English first
    const englishDateString = convertArabicToEnglish(dateString);
    
    // Try to parse the date
    const date = new Date(englishDateString);
    
    // If invalid date, try to handle different formats
    if (isNaN(date.getTime())) {
      // Handle Arabic Hijri dates or other formats - convert to basic English
      const converted = convertArabicToEnglish(dateString);
      return converted.replace(/[^\d\/\-\.]/g, ''); // Keep only numbers and separators
    }
    
    // Format with full year: DD-MM-YYYY in English
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()); // Full year
    return `${day}-${month}-${year}`;
  } catch {
    // Fallback: just convert Arabic numbers to English
    return convertArabicToEnglish(dateString);
  }
};

export interface FinanceItem {
  id: number;
  Amount: number;
  Data: string;
  Date: string;
  Image?: any[];
  InvoiceNo?: number;
  RevenueId?: number;
  ReturnsId?: number;
  Expenseid?: number;
  ClassificationName?: string;
  Taxable?: string;
  CreatedDate?: string;
  Bank?: string;
}

export interface FinanceTotals {
  Nameproject: string;
  TotalExpense: number;
  TotalRevenue: number;
  TotalReturns: number;
  RemainingBalance: number;
}

export interface UseFinanceReturn {
  // Data
  expenses: FinanceItem[];
  revenues: FinanceItem[];
  returns: FinanceItem[];
  totals: FinanceTotals | null;
  searchResults: FinanceItem[];
  
  // Loading states
  loading: boolean;
  loadingTotals: boolean;
  
  // Error states
  error: string | null;
  
  // Functions
  fetchExpenses: (projectId: number, lastId?: number) => Promise<void>;
  fetchRevenues: (projectId: number, lastId?: number) => Promise<void>;
  fetchReturns: (projectId: number, lastId?: number) => Promise<void>;
  fetchTotals: (projectId: number) => Promise<void>;
  searchFinance: (projectId: number, searchParams: any) => Promise<void>;
  addExpense: (data: any) => Promise<void>;
  addRevenue: (data: any) => Promise<void>;
  addReturn: (data: any) => Promise<void>;
  updateExpense: (id: number, data: any) => Promise<void>;
  updateRevenue: (id: number, data: any) => Promise<void>;
  updateReturn: (id: number, data: any) => Promise<void>;
  deleteFinanceItem: (item: FinanceItem, operationType: string) => Promise<boolean>;
  clearSearch: () => void;
  refresh: () => void;
}

export default function useFinance(): UseFinanceReturn {
  const { user } = useSelector((state: any) => state.user || {});
  
  const [expenses, setExpenses] = useState<FinanceItem[]>([]);
  const [revenues, setRevenues] = useState<FinanceItem[]>([]);
  const [returns, setReturns] = useState<FinanceItem[]>([]);
  const [totals, setTotals] = useState<FinanceTotals | null>(null);
  const [searchResults, setSearchResults] = useState<FinanceItem[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingTotals, setLoadingTotals] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generic function to fetch finance data
  const fetchFinanceData = useCallback(async (
    endpoint: string,
    projectId: number,
    lastId: number = 0,
    setter: React.Dispatch<React.SetStateAction<FinanceItem[]>>
  ) => {
    if (!user?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(
        `/brinshCompany/${endpoint}?idproject=${projectId}&lastID=${lastId}`,
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        }
      );

      console.log(`${endpoint} response:`, response.data);
      const data = response.data?.data || [];
      console.log(`${endpoint} data:`, data);

      // Log image data for debugging
      if (data.length > 0) {
        console.log(`${endpoint} - First item Image field:`, data[0]?.Image, typeof data[0]?.Image);
      }
      if (lastId === 0) {
        setter(data);
      } else {
        setter(prev => [...prev, ...data]);
      }
    } catch (e: any) {
      console.error(`Error fetching ${endpoint}:`, e);
      setError(`خطأ في جلب ${endpoint}`);
      Tostget(`خطأ في جلب ${endpoint}`);
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const fetchExpenses = useCallback(async (projectId: number, lastId: number = 0) => {
    await fetchFinanceData('BringExpense', projectId, lastId, setExpenses);
  }, [fetchFinanceData]);

  const fetchRevenues = useCallback(async (projectId: number, lastId: number = 0) => {
    await fetchFinanceData('BringRevenue', projectId, lastId, setRevenues);
  }, [fetchFinanceData]);

  const fetchReturns = useCallback(async (projectId: number, lastId: number = 0) => {
    await fetchFinanceData('BringReturned', projectId, lastId, setReturns);
  }, [fetchFinanceData]);

  const fetchTotals = useCallback(async (projectId: number) => {
    if (!user?.accessToken) return;
    try {
      setLoadingTotals(true);
      setError(null);
      
      const response = await axiosInstance.get(
        `/brinshCompany/BringTotalAmountproject?ProjectID=${projectId}`,
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        }
      );

      console.log('BringTotalAmountproject response:', response.data);
      setTotals(response.data || null);
    } catch (e: any) {
      console.error('Error fetching totals:', e);
      setError('خطأ في جلب الإجماليات');
      Tostget('خطأ في جلب الإجماليات');
    } finally {
      setLoadingTotals(false);
    }
  }, [user?.accessToken]);

  const searchFinance = useCallback(async (projectId: number, searchParams: any) => {
    if (!user?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        ProjectID: projectId.toString(),
        ...searchParams
      });
      
      const response = await axiosInstance.get(
        `/brinshCompany/SearchinFinance?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        }
      );
      
      setSearchResults(response.data?.data || []);
    } catch (e: any) {
      console.error('Error searching finance:', e);
      setError('خطأ في البحث');
      Tostget('خطأ في البحث');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const addExpense = useCallback(async (data: any) => {
    if (!user?.accessToken) return;
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          if (key === 'image' && data[key]) {
            formData.append('image', data[key]);
          } else {
            formData.append(key, data[key].toString());
          }
        }
      });
      
      await axiosInstance.post('/brinshCompany/ExpenseInsert', formData, {
        headers: { 
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      
      Tostget('تم إضافة المصروف بنجاح');
    } catch (e: any) {
      console.error('Error adding expense:', e);
      setError('خطأ في إضافة المصروف');
      Tostget('خطأ في إضافة المصروف');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const addRevenue = useCallback(async (data: any) => {
    if (!user?.accessToken) return;
    try {
      setLoading(true);
      setError(null);

      console.log('=== Adding Revenue (عهد) ===');
      console.log('Data:', data);

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          if (key === 'image' && data[key]) {
            formData.append('image', data[key]);
          } else {
            formData.append(key, data[key].toString());
          }
        }
      });

      console.log('FormData keys:', Array.from(formData.keys()));

      // FIXED: Changed from RevenueInsert to RevenuesInsert (with 's')
      // Matching mobile app: Src/functions/companyBransh/ApisAllCompanybransh.tsx line 1523
      await axiosInstance.post('/brinshCompany/RevenuesInsert', formData, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      console.log('✅ Revenue added successfully');
      Tostget('تم إضافة العهد بنجاح');
    } catch (e: any) {
      console.error('❌ Error adding revenue:', e);
      console.error('Response:', e.response?.data);
      setError('خطأ في إضافة العهد');
      Tostget(e.response?.data?.message || 'خطأ في إضافة العهد');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const addReturn = useCallback(async (data: any) => {
    if (!user?.accessToken) return;
    try {
      setLoading(true);
      setError(null);

      console.log('=== Adding Return (مرتجعات) ===');
      console.log('Data:', data);

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          if (key === 'image' && data[key]) {
            formData.append('image', data[key]);
          } else {
            formData.append(key, data[key].toString());
          }
        }
      });

      console.log('FormData keys:', Array.from(formData.keys()));

      // FIXED: Changed from ReturnInsert to ReturnsInsert (with 's')
      // Matching mobile app: Src/functions/companyBransh/ApisAllCompanybransh.tsx line 1656
      await axiosInstance.post('/brinshCompany/ReturnsInsert', formData, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      console.log('✅ Return added successfully');
      Tostget('تم إضافة المرتجع بنجاح');
    } catch (e: any) {
      console.error('❌ Error adding return:', e);
      console.error('Response:', e.response?.data);
      setError('خطأ في إضافة المرتجع');
      Tostget(e.response?.data?.message || 'خطأ في إضافة المرتجع');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const updateExpense = useCallback(async (id: number, data: any) => {
    if (!user?.accessToken) return;
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('Expenseid', id.toString()); // Fixed: use Expenseid instead of InvoiceNo
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          if (key === 'image' && data[key]) {
            formData.append('image', data[key]);
          } else {
            formData.append(key, data[key].toString());
          }
        }
      });

      console.log('updateExpense - sending data:', { id, data });

      await axiosInstance.put('/brinshCompany/ExpenseUpdate', formData, { // Use PUT like mobile app
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      Tostget('تم تحديث المصروف بنجاح');
    } catch (e: any) {
      console.error('Error updating expense:', e);
      setError('خطأ في تحديث المصروف');
      Tostget('خطأ في تحديث المصروف');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const updateRevenue = useCallback(async (id: number, data: any) => {
    if (!user?.accessToken) return;
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('RevenueId', id.toString());
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          if (key === 'image' && data[key]) {
            formData.append('image', data[key]);
          } else {
            formData.append(key, data[key].toString());
          }
        }
      });

      console.log('updateRevenue - sending data:', { id, data });

      await axiosInstance.put('/brinshCompany/RevenuesUpdate', formData, { // Use PUT like mobile app
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      Tostget('تم تحديث الإيراد بنجاح');
    } catch (e: any) {
      console.error('Error updating revenue:', e);
      setError('خطأ في تحديث الإيراد');
      Tostget('خطأ في تحديث الإيراد');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const updateReturn = useCallback(async (id: number, data: any) => {
    if (!user?.accessToken) return;
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('ReturnsId', id.toString());
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          if (key === 'image' && data[key]) {
            formData.append('image', data[key]);
          } else {
            formData.append(key, data[key].toString());
          }
        }
      });

      console.log('updateReturn - sending data:', { id, data });

      await axiosInstance.put('/brinshCompany/ReturnsUpdate', formData, { // Use PUT like mobile app
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      Tostget('تم تحديث المرتجع بنجاح');
    } catch (e: any) {
      console.error('Error updating return:', e);
      setError('خطأ في تحديث المرتجع');
      Tostget('خطأ في تحديث المرتجع');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const deleteFinanceItem = useCallback(async (item: FinanceItem, operationType: string): Promise<boolean> => {
    if (!user?.accessToken) return false;
    try {
      setLoading(true);
      setError(null);

      // Determine ID and type based on operation type (matching mobile app logic)
      let id: number;
      let type: string;

      if (operationType === 'مصروفات') {
        id = item.Expenseid || 0;
        type = 'مصروفات';
      } else if (operationType === 'عهد') {
        id = item.RevenueId || 0;
        type = 'عهد';
      } else {
        id = item.ReturnsId || 0;
        type = 'مرتجعات';
      }

      // Use GET request like mobile app
      await axiosInstance.get(`/brinshCompany/DeleteFinance?id=${id}&type=${type}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });

      Tostget('تم حذف العنصر بنجاح');
      return true;
    } catch (e: any) {
      console.error('Error deleting finance item:', e);
      setError('خطأ في حذف العنصر');
      Tostget('خطأ في حذف العنصر');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  const refresh = useCallback(() => {
    setExpenses([]);
    setRevenues([]);
    setReturns([]);
    setSearchResults([]);
    setTotals(null);
    setError(null);
  }, []);

  return {
    expenses,
    revenues,
    returns,
    totals,
    searchResults,
    loading,
    loadingTotals,
    error,
    fetchExpenses,
    fetchRevenues,
    fetchReturns,
    fetchTotals,
    searchFinance,
    addExpense,
    addRevenue,
    addReturn,
    updateExpense,
    updateRevenue,
    updateReturn,
    deleteFinanceItem,
    clearSearch,
    refresh
  };
}