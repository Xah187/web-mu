import axios from 'axios';
import axiosRetry from 'axios-retry';

// API Base URL - يمكن تغييره حسب البيئة
// NOTE: Mobile app uses http://35.247.12.97:8080 directly
// But web must use https://mushrf.net (which proxies to 35.247.12.97:8080)
// because direct IP access may be blocked by firewall
export const Api = 'https://mushrf.net';
//export const Api = 'http://35.247.12.97:8080'; // fallback/debug only
// URLs للملفات والتحميلات - matching mobile app exactly
export const URLFILDonlwod = `${Api}/upload`;
export const URLFIL = `https://storage.googleapis.com/demo_backendmoshrif_bucket-1`;
export const URLFILFiles = `${Api}/api/Files`;

// إنشاء instance من Axios
const axiosInstance = axios.create({
  baseURL: `${Api}/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إعداد retry policy
axiosRetry(axiosInstance, {
  retries: 10, // إعادة المحاولة 10 مرات
  retryDelay: axiosRetry.exponentialDelay, // استخدام تأخير أسي
  retryCondition: (error) => {
    // إعادة المحاولة في حال الخطأ 500 أو مشاكل الشبكة
    return error.response?.status === 500 || 
           error.code === 'ECONNABORTED' ||
           error.code === 'ERR_NETWORK';
  },
});

// Request interceptor لإضافة التوكن
axiosInstance.interceptors.request.use(
  (config) => {
    // إضافة التوكن من localStorage إذا كان موجود
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor للتعامل مع الأخطاء
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // إذا كان الخطأ 401 والطلب ليس retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // يمكن إضافة منطق refresh token هنا
      // const newToken = await refreshToken();
      // if (newToken) {
      //   originalRequest.headers.Authorization = `Bearer ${newToken}`;
      //   return axiosInstance(originalRequest);
      // }
      
      // إذا فشل التجديد، توجيه للصفحة الرئيسية
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
