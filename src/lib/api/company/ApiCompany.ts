/**
 * Company API functions for web application
 * Matches mobile app functionality for company operations
 */

interface FinanceToggleResponse {
  success: string;
  DisabledFinance: string;
}

interface UserRefreshResponse {
  data: {
    DisabledFinance?: string;
    [key: string]: any;
  };
}

interface ApiError {
  error: string;
}

/**
 * Toggle finance operations for company (Admin only)
 * Matches mobile app: OpenOrCloseopreationStopfinance
 */
export const toggleFinanceOperations = async (
  idCompany: string | number,
  accessToken: string
): Promise<FinanceToggleResponse> => {
  const response = await fetch(`/api/company/finance-toggle?idCompany=${idCompany}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'فشل في تنفيذ العملية');
  }

  return data;
};

/**
 * Refresh user data from backend
 * Gets updated company information including DisabledFinance
 */
export const refreshUserData = async (
  idCompany: string | number,
  accessToken: string
): Promise<UserRefreshResponse> => {
  const response = await fetch(`/api/user/refresh?idCompany=${idCompany}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'فشل في تحديث بيانات المستخدم');
  }

  return data;
};

/**
 * Company API functions object
 * Provides organized access to all company-related API calls
 */
export const ApiCompany = {
  toggleFinanceOperations,
  refreshUserData,

  // يمكن إضافة المزيد من دوال الشركة هنا مستقبلاً
  // مثل: updateCompanyData, getBranchData, etc.
};

export default ApiCompany;
