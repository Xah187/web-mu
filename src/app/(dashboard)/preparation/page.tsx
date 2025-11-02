'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { Tostget } from '@/components/ui/Toast';
import ButtonCreat from '@/components/design/ButtonCreat';
import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';
import useValidityUser from '@/hooks/useValidityUser';
import { useTranslation } from '@/hooks/useTranslation';

import { URLFIL } from '@/lib/api/axios';
import HRUsersManagement from '@/components/hr/HRUsersManagement';
import BackArrowIcon from '@/components/icons/BackArrowIcon';

// Import responsive layout components
import ResponsiveLayout, {
  PageHeader,
  ContentSection,
  ResponsiveGrid,
  Card
} from '@/components/layout/ResponsiveLayout';

interface Employee {
  id: string;
  userName: string;
  PhoneNumber: string;
  job: string;
}

interface PreparationRecord {
  id: string;
  userName: string;
  PhoneNumber: string;
  job: string;
  Dateday: string;
  CheckIntime: string;
  CheckOUTtime: string;
  CheckInFile: {
    name: string;
    size: number;
  } | null;
  CheckoutFile: {
    name: string;
    size: number;
  } | null;
}

type ViewType = 'buttons' | 'hr' | 'overtime' | 'addHR' | 'checkIn' | 'checkOut';

export default function PreparationPage() {
  const router = useRouter();
  const { user, size } = useAppSelector((state: any) => state.user);
  const { t, isRTL, dir } = useTranslation();

  // Permission hooks
  const { isAdmin, isBranchManager } = useJobBasedPermissions();
  const { Uservalidation } = useValidityUser();

  // State management
  const [currentView, setCurrentView] = useState<ViewType>('buttons');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [preparationRecords, setPreparationRecords] = useState<PreparationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userVerificationStatus, setUserVerificationStatus] = useState<{
    canCheckIn: boolean;
    canCheckOut: boolean;
    lastChecked: string | null;
  }>({
    canCheckIn: true,
    canCheckOut: false,
    lastChecked: null
  });


  // Camera refs and state for direct camera capture (no gallery)
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Ref for search container to calculate dropdown position
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  const [hrLastID, setHrLastID] = useState<number>(0);
  const [hrHasMore, setHrHasMore] = useState<boolean>(true);

  // Overtime assignment states
  const [selectedOvertimeEmployee, setSelectedOvertimeEmployee] = useState<any>(null);
  const [selectedOvertimeDates, setSelectedOvertimeDates] = useState<string[]>([]);
  const [employeeSearchResults, setEmployeeSearchResults] = useState<any[]>([]);
  const [isAssigningOvertime, setIsAssigningOvertime] = useState(false);
  const [hrLoadingMore, setHrLoadingMore] = useState<boolean>(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);



  // State for HR permissions from API
  const [hasHRAccess, setHasHRAccess] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // Check permissions using existing hooks + API check (matching mobile app)
  const hasHRPermissions = () => {
    const hrJobs = ["مدير عام", "مدير تنفيذي", "موارد بشرية", "Admin"];
    const hasJobPermission = hrJobs.includes(user?.data?.job || '') || isAdmin || isBranchManager;
    return hasJobPermission || hasHRAccess;
  };

  const hasManagerPermissions = () => {
    // IMPORTANT: Only check job, NOT API result (matching mobile app line 209)
    // Users with HR access from API cannot give HR permissions to others
    const managerJobs = ["مدير عام", "مدير تنفيذي", "موارد بشرية", "Admin"];
    return managerJobs.includes(user?.data?.job || '') || isAdmin;
  };

  // Check HR permissions from API (matching mobile app openViliteduser)
  useEffect(() => {
    const checkHRPermissions = async () => {
      try {
        // First check if user has job-based permissions
        const hrJobs = ["مدير عام", "مدير تنفيذي", "موارد بشرية", "Admin"];
        const hasJobPermission = hrJobs.includes(user?.data?.job || '') || isAdmin || isBranchManager;

        if (hasJobPermission) {
          setHasHRAccess(true);
          setPermissionsLoaded(true);
          return;
        }

        // If no job permission, check API (like mobile app)
        let token: string | null = null;
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('user');
          try {
            const parsed = storedUser ? JSON.parse(storedUser) : null;
            token = parsed?.accessToken || null;
          } catch {}
          if (!token) token = localStorage.getItem('token');
        }

        const response = await fetch('/api/hr/check-access', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setHasHRAccess(data.hasAccess || false);
          // Note: hasManagerAccess is NOT set from API - only from job
        }
      } catch (error) {
        console.error('Error checking HR permissions:', error);
      } finally {
        setPermissionsLoaded(true);
      }
    };

    checkHRPermissions();
  }, [user, isAdmin, isBranchManager]);

  // Load initial data
  useEffect(() => {
    if (currentView === 'hr') {
      // Load daily preparations for all employees when HR view is opened
      loadDailyPreparations();
    }
  }, [selectedDate, currentView]);

  // Calculate dropdown position when search is shown
  useEffect(() => {
    if (showEmployeeSearch && searchContainerRef.current) {
      const containerRect = searchContainerRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const dropdownWidth = scale(320);

      // حساب المساحة المتاحة
      const spaceRight = screenWidth - containerRect.left;
      const spaceLeft = containerRect.right;

      let dynamicStyle: React.CSSProperties = {};

      if (spaceRight >= dropdownWidth) {
        // مساحة كافية لفتح القائمة لليسار (الاتجاه الطبيعي في RTL)
        dynamicStyle = { left: 0 };
      } else if (spaceLeft >= dropdownWidth) {
        // فتح لليمين إذا لم تكن هناك مساحة لليسار
        dynamicStyle = { right: 0 };
      } else {
        // استخدام كامل العرض المتاح
        if (spaceRight > spaceLeft) {
          dynamicStyle = {
            left: 0,
            width: `${Math.min(spaceRight - 20, scale(320))}px`
          };
        } else {
          dynamicStyle = {
            right: 0,
            width: `${Math.min(spaceLeft - 20, scale(320))}px`
          };
        }
      }

      setDropdownStyle(dynamicStyle);
    }
  }, [showEmployeeSearch]);

  // Load data when employee is selected
  useEffect(() => {
    if (currentView === 'hr' && selectedEmployee) {
      loadPreparationData();
    }
  }, [selectedEmployee]);

  // Load daily preparations for all employees (like mobile app BringHRpreparation)
  const loadDailyPreparations = useCallback(async () => {
    setLoading(true);
    try {
      // Reset pagination state
      setHrLastID(0);
      setHrHasMore(true);

      // Monthly date from selectedDate (UTC)
      const year = selectedDate.getUTCFullYear();
      const month = String(selectedDate.getUTCMonth() + 1).padStart(2, '0');
      const monthlyDate = `${year}-${month}`;

      // Get token like mobile app (from user.accessToken or fallback token)
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        try {
          const parsed = storedUser ? JSON.parse(storedUser) : null;
          token = parsed?.accessToken || null;
        } catch {}
        if (!token) token = localStorage.getItem('token');
      }

      // First page: lastID=0
      const response = await fetch(`/api/hr/preparation?date=${monthlyDate}&lastID=0`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.data || [];
        setPreparationRecords(items);

        // Clear selected employee when loading all preparations
        setSelectedEmployee(null);
        setSearchQuery('');
        setShowEmployeeSearch(false);

        // Update pagination markers
        const lastId = items.length ? (items[items.length - 1]?.id || 0) : 0;
        setHrLastID(lastId);
        setHrHasMore(items.length >= 10);
      } else {
        const errorData = await response.json();
        Tostget(errorData.error || t('preparationPage.errors.loadingPreparationData'), 'error');
      }
    } catch (error) {
      console.error('Error loading daily preparations:', error);
      Tostget(t('preparationPage.errors.loadingPreparationData'), 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, t]);
  // Load next page progressively (infinite scroll)
  const loadMorePreparations = useCallback(async () => {
    if (hrLoadingMore || !hrHasMore) return;
    setHrLoadingMore(true);
    try {
      const year = selectedDate.getUTCFullYear();
      const month = String(selectedDate.getUTCMonth() + 1).padStart(2, '0');
      const monthlyDate = `${year}-${month}`;

      let token: string | null = null;
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        try {
          const parsed = storedUser ? JSON.parse(storedUser) : null;
          token = parsed?.accessToken || null;
        } catch {}
        if (!token) token = localStorage.getItem('token');
      }

      const phoneParam = selectedEmployee ? `&phoneNumber=${selectedEmployee.PhoneNumber}` : '';
      const response = await fetch(`/api/hr/preparation?date=${monthlyDate}&lastID=${hrLastID}${phoneParam}` , {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.data || [];
        if (items.length > 0) {
          setPreparationRecords((prev) => [...prev, ...items]);
          const lastId = items[items.length - 1]?.id || hrLastID;
          setHrLastID(lastId);
          if (items.length < 10) setHrHasMore(false);

        } else {
          setHrHasMore(false);
        }
      } else {
        const errorData = await response.json();
        Tostget(errorData.error || t('preparationPage.errors.loadingPreparationData'), 'error');
      }
    } catch (e) {
      console.error('Error loading more preparations:', e);
    } finally {
      setHrLoadingMore(false);
    }
  }, [hrLoadingMore, hrHasMore, hrLastID, selectedEmployee, selectedDate, t]);



  // Infinite scroll observer for progressive loading
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const el = loadMoreRef.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hrHasMore && !hrLoadingMore) {
        loadMorePreparations();
      }
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hrHasMore, hrLoadingMore, loadMorePreparations]);


  // Get current location automatically (silently)
  useEffect(() => {
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        return;
      }

      const options = {
        enableHighAccuracy: false, // Less accurate but faster
        timeout: 5000, // Shorter timeout
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          // Silent fail - don't log errors for automatic location
          // Location will be requested when user actually needs it
        },
        options
      );
    };

    getCurrentLocation();
  }, []);

  // Auto-start camera when modal opens (no gallery)
  useEffect(() => {
    if ((currentView === 'checkIn' || currentView === 'checkOut') && !capturedPhoto && !isCameraActive && !isLoadingCamera) {
      startCamera();
    }
  }, [currentView]);

  // Start camera stream (no gallery)
  const startCamera = async () => {
    try {
      setIsLoadingCamera(true);
      setCameraError(null);
      setIsCameraActive(false);

      // Ensure this runs on client and over secure context (required by most browsers)
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        setCameraError(t('preparationPage.errors.browserOnly'));
        setIsLoadingCamera(false);
        return;
      }
      if (!(window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost')) {
        setCameraError(t('preparationPage.httpsRequired'));
        setIsLoadingCamera(false);
        return;
      }

      // Polyfill/fallbacks for older browsers (Safari/iOS/Firefox قديمة)
      const getUserMediaCompat = (constraints: MediaStreamConstraints) => {
        const anyNav: any = navigator;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          return navigator.mediaDevices.getUserMedia(constraints);
        }
        const legacy = anyNav.getUserMedia || anyNav.webkitGetUserMedia || anyNav.mozGetUserMedia || anyNav.msGetUserMedia;
        if (legacy) {
          return new Promise<MediaStream>((resolve, reject) => legacy.call(navigator, constraints, resolve, reject));
        }
        return Promise.reject(new Error('NOT_SUPPORTED'));
      };

      // Camera constraints tuned for compatibility
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'user' },
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      };

      let stream: MediaStream;
      try {
        stream = await getUserMediaCompat(constraints);
      } catch (err: any) {
        if (err?.message === 'NOT_SUPPORTED') {
          setCameraError(t('preparationPage.browserNotSupported'));
        } else if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
          setCameraError(t('preparationPage.cameraPermissionDenied'));
        } else if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') {
          setCameraError(t('preparationPage.cameraNotFound'));
        } else {
          setCameraError(t('preparationPage.cameraStartFailed'));
        }
        setIsLoadingCamera(false);
        return;
      }

      // Wait for video element to mount
      let attempts = 0;
      while (!videoRef.current && attempts < 30) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }
      if (!videoRef.current) throw new Error('Video element not found');

      const video = videoRef.current;
      // Improve iOS Safari compatibility
      try { video.setAttribute('playsinline', 'true'); } catch {}
      ;(video as any).playsInline = true;
      video.muted = true;

      video.srcObject = stream;
      streamRef.current = stream;

      await new Promise<void>((resolve, reject) => {
        const onLoaded = async () => {
          try {
            await video.play();
            setIsCameraActive(true);
            setIsLoadingCamera(false);
            resolve();
          } catch (e) {
            reject(e);
          }
        };
        const onError = (e: any) => reject(e);
        video.onloadedmetadata = onLoaded;
        video.onerror = onError;
        setTimeout(() => reject(new Error('Camera timeout')), 10000);
      });
    } catch (error: any) {
      console.error('Camera error:', error);
      setIsLoadingCamera(false);
      setIsCameraActive(false);
      let msg = t('preparationPage.errors.cameraAccess');
      if (error?.name === 'NotAllowedError') msg = t('preparationPage.errors.cameraPermission');
      else if (error?.name === 'NotFoundError') msg = t('preparationPage.errors.cameraNotFound');
      else if (error?.message === 'Camera timeout') msg = t('preparationPage.errors.cameraTimeout');
      else if (error?.message?.includes('Video element not found')) msg = t('preparationPage.errors.cameraInterface');
      setCameraError(msg);
      Tostget(msg, 'error');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    }
  };

  // Capture a photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) {
      Tostget(t('preparationPage.errors.cameraNotReady'), 'error');
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      Tostget(t('preparationPage.errors.imageProcessing'), 'error');
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(dataUrl);
    stopCamera();
    Tostget(t('preparationPage.success.photoCaptured'), 'success');
  };

  // Stop camera and cleanup
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsLoadingCamera(false);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Convert captured photo to mobile app format
  const convertPhotoToMobileFormat = async (): Promise<{uri: string, name: string, type: string, size: number} | null> => {
    if (!capturedPhoto) {
      Tostget(t('preparationPage.errors.noPhotoCaptured'), 'error');
      return null;
    }

    try {
      // Convert data URL to blob
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();

      const phoneNumber = user?.data?.PhoneNumber || 'unknown';
      const timestamp = new Date().getTime();
      const fileName = `${phoneNumber}${timestamp}-preparation.jpg`;

      // Create image object matching mobile app structure
      const imageObject = {
        uri: capturedPhoto,
        name: fileName,
        type: 'image/jpeg',
        size: blob.size
      };

      return imageObject;
    } catch (error) {
      console.error('Error converting photo:', error);
      Tostget(t('preparationPage.errors.imageProcessing'), 'error');
      return null;
    }
  };

  // Upload captured image to Google Cloud Storage (same as mobile app uploadFileInChunks)
  const uploadImageToGCS = async (nameFile: string, token: string): Promise<boolean> => {
    if (!capturedPhoto) return false;
    try {
      const blob = await (await fetch(capturedPhoto)).blob();
      const url = `https://storage.googleapis.com/upload/storage/v1/b/demo_backendmoshrif_bucket-1/o?uploadType=media&name=${encodeURIComponent(nameFile)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/jpeg',
          'Authorization': `Bearer ${token}`,
        },
        body: blob,
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('GCS upload failed:', res.status, text);
        return false;
      }
      return true;
    } catch (e) {
      console.error('GCS upload error:', e);
      return false;
    }
  };






  const loadPreparationData = async () => {
    if (!selectedEmployee) return;

    setLoading(true);
    try {
      // Reset pagination for filtered view
      setHrLastID(0);
      setHrHasMore(true);

      // Use monthly date (UTC)
      const year = selectedDate.getUTCFullYear();
      const month = String(selectedDate.getUTCMonth() + 1).padStart(2, '0');
      const monthlyDate = `${year}-${month}`;

      // Get token like mobile app (from user.accessToken or fallback token)
      let tokenEmp: string | null = null;
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        try {
          const parsed = storedUser ? JSON.parse(storedUser) : null;
          tokenEmp = parsed?.accessToken || null;
        } catch {}
        if (!tokenEmp) tokenEmp = localStorage.getItem('token');
      }

      const response = await fetch(`/api/hr/preparation?date=${monthlyDate}&phoneNumber=${selectedEmployee.PhoneNumber}&lastID=0`, {
        headers: {
          'Content-Type': 'application/json',
          ...(tokenEmp ? { 'Authorization': `Bearer ${tokenEmp}` } : {}),
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.data || [];
        setPreparationRecords(items);
        const lastId = items.length ? (items[items.length - 1]?.id || 0) : 0;
        setHrLastID(lastId);
        setHrHasMore(items.length >= 10);
      } else {
        const errorData = await response.json();
        Tostget(errorData.error || t('preparationPage.errors.loadingPreparationData'), 'error');
      }
    } catch (error) {
      console.error('Error loading preparation data:', error);
      Tostget(t('preparationPage.errors.loadingPreparationData'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Search employees function - Same as mobile app PressSearch
  const handleSearchEmployees = async () => {
    if (!searchQuery.trim()) {
      setEmployees([]);
      return;
    }

    try {
      // Get token like mobile app
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        try {
          const parsed = storedUser ? JSON.parse(storedUser) : null;
          token = parsed?.accessToken || null;
        } catch {}
        if (!token) token = localStorage.getItem('token');
      }

      // Use BringuserHR endpoint like mobile app
      const response = await fetch(`/api/hr/employees/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error searching employees:', error);
      setEmployees([]);
    }
  };

  // Handle employee selection - Same as mobile app onpressselectuser -> SearchPreparation
  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSearchQuery(employee.userName);
    setEmployees([]);
    setShowEmployeeSearch(false);
    // Load preparation data for selected employee like mobile app SearchPreparation
    loadPreparationData();
  };

  // Search employees for overtime assignment (separate from HR search)
  const searchEmployees = useCallback(async (query: string) => {
    console.log('🔍 searchEmployees called with query:', query);
    if (!query || query.length < 2) {
      console.log('🧹 Query too short, clearing results');
      setEmployeeSearchResults([]);
      setShowEmployeeSearch(false);
      return;
    }

    try {
      // Get token like mobile app (same as handleSearchEmployees)
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        try {
          const parsed = storedUser ? JSON.parse(storedUser) : null;
          token = parsed?.accessToken || null;
        } catch {}
        if (!token) token = localStorage.getItem('token');
      }

      const response = await fetch(`/api/hr/employees/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 نتائج البحث في إسناد الدوام الإضافي:', data);
        console.log('📊 عدد النتائج:', data.data?.length || 0);
        setEmployeeSearchResults(data.data || []);
        setShowEmployeeSearch(true);
      } else {
        console.error('❌ فشل البحث - Status:', response.status);
        const errorText = await response.text();
        console.error('❌ رسالة الخطأ:', errorText);
        setEmployeeSearchResults([]);
        setShowEmployeeSearch(false);
      }
    } catch (error) {
      console.error('❌ خطأ في البحث عن الموظفين للدوام الإضافي:', error);
      setEmployeeSearchResults([]);
      setShowEmployeeSearch(false);
    }
  }, []);

  // Handle overtime assignment - Same as mobile app opreationovertime
  const handleOvertimeAssignment = async (isAssigning: boolean) => {
    if (!selectedOvertimeEmployee || selectedOvertimeDates.length === 0) {
      Tostget(t('preparationPage.pleaseSelectEmployeeAndDates'), 'error');
      return;
    }

    console.log('🚀 بدء إسناد الدوام الإضافي');
    console.log('👤 الموظف المختار:', selectedOvertimeEmployee);
    console.log('📅 التواريخ المختارة:', selectedOvertimeDates);
    console.log('✅ نوع العملية:', isAssigning ? 'إسناد' : 'إلغاء');

    setIsAssigningOvertime(true);

    try {
      // Get token like mobile app
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        try {
          const parsed = storedUser ? JSON.parse(storedUser) : null;
          token = parsed?.accessToken || null;
        } catch {}
        if (!token) token = localStorage.getItem('token');
      }

      const response = await fetch('/api/hr/preparation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          PhoneNumber: selectedOvertimeEmployee.id,
          type: 'Overtimeassignment',
          Overtimeassignment: isAssigning ? 'true' : 'false',
          DateDay: selectedOvertimeDates,
          DateDayfalse: isAssigning ? [] : selectedOvertimeDates
        }),
      });

      const requestData = {
        PhoneNumber: selectedOvertimeEmployee.id,
        type: 'Overtimeassignment',
        Overtimeassignment: isAssigning ? 'true' : 'false',
        DateDay: selectedOvertimeDates,
        DateDayfalse: isAssigning ? [] : selectedOvertimeDates
      };
      console.log('📤 البيانات المرسلة:', requestData);

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Response data:', result);
        if (result.success) {
          Tostget(
            isAssigning
              ? t('preparationPage.overtimeAssignedSuccess', { name: selectedOvertimeEmployee.userName })
              : t('preparationPage.overtimeCancelledSuccess', { name: selectedOvertimeEmployee.userName }),
            'success'
          );

          // Reset form
          setSelectedOvertimeEmployee(null);
          setSelectedOvertimeDates([]);
          setSearchQuery('');
          setEmployeeSearchResults([]);
          setShowEmployeeSearch(false);
        } else {
          console.log('❌ فشل في العملية - النتيجة:', result);
          Tostget(result.message || t('preparationPage.errors.operationFailed'), 'error');
        }
      } else {
        const errorText = await response.text();
        console.log('❌ خطأ HTTP - Status:', response.status);
        console.log('❌ رسالة الخطأ:', errorText);
        Tostget(t('preparationPage.errors.operationFailed'), 'error');
      }
    } catch (error) {
      console.error('Error in overtime assignment:', error);
      Tostget(t('preparationPage.errors.operationError'), 'error');
    } finally {
      setIsAssigningOvertime(false);
    }
  };

  // Download PDF function - Same as mobile app shareepdf
  const downloadPDF = async () => {
    if (!selectedEmployee) return;

    try {
      // Get token like mobile app
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        try {
          const parsed = storedUser ? JSON.parse(storedUser) : null;
          token = parsed?.accessToken || null;
        } catch {}
        if (!token) token = localStorage.getItem('token');
      }

      // Format date for backend (YYYY-MM)
      const year = selectedDate.getUTCFullYear();
      const month = String(selectedDate.getUTCMonth() + 1).padStart(2, '0');
      const formattedDate = `${year}-${month}`;

      const response = await fetch(`/api/hr/pdf?date=${formattedDate}&phoneNumber=${selectedEmployee.PhoneNumber}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.url) {
          // Open PDF like mobile app using URLFIL
          const pdfUrl = `${URLFIL}/${data.url}`;
          window.open(pdfUrl, '_blank');
          Tostget(t('preparationPage.success.reportOpened'), 'success');
        } else {
          Tostget(t('preparationPage.errors.reportError'), 'error');
        }
      } else {
        const errorData = await response.json();
        Tostget(errorData.error || t('preparationPage.errors.loadingReport'), 'error');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Tostget(t('preparationPage.errors.loadingReport'), 'error');
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle month input (YYYY-MM format)
    const monthValue = e.target.value; // e.g., "2025-09"
    const [year, month] = monthValue.split('-');
    const newDate = new Date(parseInt(year), parseInt(month) - 1, 1); // First day of the month
    setSelectedDate(newDate);
  };

  const handleImageView = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return t('preparationPage.notSpecified');
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t('preparationPage.notSpecified');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    } catch {
      return dateString;
    }
  };

  // Request location when needed with fallback strategy
  const requestLocationIfNeeded = async (): Promise<boolean> => {
    if (currentLocation) {
      return true;
    }

    if (!navigator.geolocation) {
      Tostget(t('preparationPage.errors.locationNotSupported'), 'error');
      return false;
    }

    // Try high accuracy first, then fallback to low accuracy
    const tryGetLocation = (enableHighAccuracy: boolean, timeout: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const options = {
          enableHighAccuracy,
          timeout,
          maximumAge: 600000 // 10 minutes cache
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            resolve(true);
          },
          (error) => {
            resolve(false);
          },
          options
        );
      });
    };

    // Strategy 1: Try high accuracy with longer timeout
    let success = await tryGetLocation(true, 20000);
    if (success) return true;

    // Strategy 2: Try low accuracy with shorter timeout
    success = await tryGetLocation(false, 10000);
    if (success) return true;

    // Strategy 3: Try cached location only
    success = await tryGetLocation(false, 5000);
    if (success) return true;

    // All strategies failed - offer to continue with default location
    const useDefaultLocation = window.confirm(t('preparationPage.locationPrompt'));

    if (useDefaultLocation) {
      // Use a default location (company location or city center)
      setCurrentLocation({
        latitude: 24.7136, // Riyadh coordinates as default
        longitude: 46.6753
      });
      Tostget(t('preparationPage.success.defaultLocationUsed'), 'warning');
      return true;
    }

    return false;
  };

  // Check user verification before opening camera (same as mobile app)
  const checkUserVerification = async (type: 'CheckIn' | 'CheckOut'): Promise<any> => {
    try {
      setLoading(true);
      console.log('Checking user verification for:', type);

      // Get token from localStorage (same as mobile app)
      // In mobile app: user?.accessToken, in web: stored separately as 'token'
      let token = null;
      if (typeof window !== 'undefined') {
        // Try to get from user object first (like mobile app)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            token = userData.accessToken;
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }

        // Fallback to separate token storage
        if (!token) {
          token = localStorage.getItem('token');
        }
      }

      console.log('Token being sent:', token ? 'Token present' : 'No token');

      if (!token) {
        throw new Error(t('preparationPage.errors.noAuthToken'));
      }

      const response = await fetch(`/api/hr/userverification?type=${type}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      console.log('User verification result:', data);

      // Same as mobile app - always return the response, don't throw error here
      // Mobile app: if(Userverifications?.success) { ... } else { Tostget(Userverifications?.message) }
      return data;
    } catch (error: any) {
      console.error('Error checking user verification:', error);

      // Handle specific error cases like mobile app
      if (error?.message?.includes('تعذر الاتصال') || error?.message?.includes('fetch')) {
        Tostget(t('preparationPage.errors.connectionError'), 'error');
      } else if (error?.message?.includes('401') || error?.status === 401) {
        Tostget(t('preparationPage.errors.sessionExpired'), 'error');
        // Redirect to login like mobile app
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else if (error?.message?.includes('500') || error?.status === 500) {
        Tostget(t('preparationPage.errors.serverError'), 'error');
      } else {
        const errorMessage = error instanceof Error ? error.message : t('preparationPage.errors.preparationError');
        Tostget(errorMessage, 'error');
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      // Check local state first to prevent unnecessary API calls
      if (!userVerificationStatus.canCheckIn) {
        Tostget(t('preparationPage.errors.alreadyCheckedIn'), 'error');
        return;
      }

      // Step 1: Check if user can check in (same as mobile app Userverification)
      const verification = await checkUserVerification('CheckIn');
      if (!verification) return;

      // Same as mobile app: if(Userverifications?.success) { ... } else { Tostget(Userverifications?.message) }
      if (!verification.success) {
        Tostget(verification.message || t('preparationPage.errors.preparationNotAllowed'), 'error');
        // Update local state based on server response
        setUserVerificationStatus(prev => ({
          ...prev,
          canCheckIn: false,
          canCheckOut: verification.message?.includes(t('preparationPage.mustCheckInFirst')) ? false : true
        }));
        return;
      }

      // Step 2: Get location (same as mobile app locationFunction)
      const hasLocation = await requestLocationIfNeeded();
      if (!hasLocation) return;

      // Step 3: Open camera for photo capture (same as mobile app requestCameraPermission)
      setVerificationData(verification);
      setCurrentView('checkIn');
      // Camera will be started manually by user

    } catch (error) {
      console.error('Error in handleCheckIn:', error);
      Tostget(t('preparationPage.errors.preparationError'), 'error');
    }
  };

  const handleCheckOut = async () => {
    try {
      // Step 1: Check if user can check out (same as mobile app Userverification)
      // NO local state check - follow mobile app exactly: Userverification first
      const verification = await checkUserVerification('CheckOut');
      if (!verification) return;

      // Same as mobile app: if(Userverifications?.success) { ... } else { Tostget(Userverifications?.message) }
      if (!verification.success) {
        Tostget(verification.message || t('preparationPage.errors.preparationNotAllowed'), 'error');
        return;
      }

      // Step 2: Get location (same as mobile app locationFunction)
      const hasLocation = await requestLocationIfNeeded();
      if (!hasLocation) return;

      // Step 3: Open camera for photo capture (same as mobile app requestCameraPermission)
      setVerificationData(verification);
      setCurrentView('checkOut');
      // Camera will be started manually by user

    } catch (error) {
      console.error('Error in handleCheckOut:', error);
      Tostget(t('preparationPage.errors.preparationError'), 'error');
    }
  };

  const confirmCheckIn = async () => {
    try {
      setLoading(true);

      // Step 1: Check if photo was captured
      if (!capturedPhoto) {
        Tostget(t('preparationPage.errors.mustCapturePhoto'), 'error');
        setLoading(false);
        return;
      }

      if (!currentLocation || !verificationData) {
        Tostget(t('preparationPage.errors.locationOrVerificationFailed'), 'error');
        setLoading(false);
        return;
      }

      // Step 2: Convert photo to mobile app format
      const photoFile = await convertPhotoToMobileFormat();
      if (!photoFile) {
        setLoading(false);
        return;
      }

      const locationfanly = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      };

      // Add location to file object (same as mobile app)
      const file = {
        ...photoFile,
        // Force server-expected name from verification
        name: `${verificationData?.nameFile || (user?.data?.PhoneNumber + Date.now())}.jpg`,
        location: locationfanly
      };

      // Step 2: Prepare data exactly like mobile app
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateDay = `${year}-${month}-${day}`; // yy-MM-DD format exactly like mobile app

      const data = {
        PhoneNumber: user?.data?.PhoneNumber,
        type: 'CheckIn',
        DateDay: dateDay,
        Checktime: new Date().toUTCString(),
        CheckFile: file,
      };

      console.log('Sending preparation data (same as mobile app):', data);

      // Get token from localStorage (same as mobile app)
      // In mobile app: user?.accessToken, in web: stored separately as 'token'
      let token = null;
      if (typeof window !== 'undefined') {
        // Try to get from user object first (like mobile app)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            token = userData.accessToken;
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }

        // Fallback to separate token storage
        if (!token) {
          token = localStorage.getItem('token');
        }
      }

      if (!token) {
        throw new Error(t('preparationPage.errors.noAuthToken'));
      }

      // Step 3: Send to opreationPreparation endpoint (same as mobile app)
      const response = await fetch('/api/hr/preparation', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log('Preparation response:', result);

      // Handle both boolean success and string success (backend inconsistency)
      const isSuccess = result.success === true || result.success === 'تمت العملية بنجاح' || typeof result.success === 'string';

      if (response.ok && isSuccess) {
        // Step 4: Upload file in chunks (same as mobile app)
        // Upload image to GCS (same as mobile app)
        const nameFile = file.name;
        const tokenUpload = verificationData?.token;
        if (tokenUpload && nameFile) {
          const ok = await uploadImageToGCS(nameFile, tokenUpload);
          if (!ok) {
            Tostget(t('preparationPage.errors.registrationFailedImageUpload'), 'warning');
          }
        }

        Tostget(t('preparationPage.success.checkInSuccess'), 'success');
        stopCamera();
        setCurrentView('buttons');
        setVerificationData(null);
        setCapturedPhoto(null);
        // Refresh data
        await loadDailyPreparations();
      } else {
        Tostget(result.message || t('preparationPage.errors.checkInFailed'), 'error');
      }
    } catch (error) {
      console.error('Error confirming check in:', error);
      Tostget(t('preparationPage.errors.checkInError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmCheckOut = async () => {
    try {
      setLoading(true);

      // Step 1: Check if photo was captured
      if (!capturedPhoto) {
        Tostget(t('preparationPage.errors.mustCapturePhoto'), 'error');
        setLoading(false);
        return;
      }

      if (!currentLocation || !verificationData) {
        Tostget(t('preparationPage.errors.locationOrVerificationFailed'), 'error');
        setLoading(false);
        return;
      }

      // Step 2: Convert photo to mobile app format
      const photoFile = await convertPhotoToMobileFormat();
      if (!photoFile) {
        setLoading(false);
        return;
      }

      const locationfanly = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      };

      // Add location to file object (same as mobile app)
      const file = {
        ...photoFile,
        // Force server-expected name from verification
        name: `${verificationData?.nameFile || (user?.data?.PhoneNumber + Date.now())}.jpg`,
        location: locationfanly
      };

      // Step 2: Prepare data exactly like mobile app
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateDay = `${year}-${month}-${day}`; // yy-MM-DD format exactly like mobile app

      const data = {
        PhoneNumber: user?.data?.PhoneNumber,
        type: 'CheckOut',
        DateDay: dateDay,
        Checktime: new Date().toUTCString(),
        CheckFile: file,
      };

      console.log('Sending preparation data (same as mobile app):', data);

      // Get token from localStorage (same as mobile app)
      // In mobile app: user?.accessToken, in web: stored separately as 'token'
      let token = null;
      if (typeof window !== 'undefined') {
        // Try to get from user object first (like mobile app)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            token = userData.accessToken;
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }

        // Fallback to separate token storage
        if (!token) {
          token = localStorage.getItem('token');
        }
      }

      if (!token) {
        throw new Error(t('preparationPage.errors.noAuthToken'));
      }

      // Step 3: Send to opreationPreparation endpoint (same as mobile app)
      const response = await fetch('/api/hr/preparation', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log('Preparation response:', result);

      // Handle both boolean success and string success (backend inconsistency)
      const isSuccess = result.success === true || result.success === 'تمت العملية بنجاح' || typeof result.success === 'string';

      if (response.ok && isSuccess) {
        // Upload image to GCS (same as mobile app)
        const nameFile = file.name;
        const tokenUpload = verificationData?.token;
        if (tokenUpload && nameFile) {
          const ok = await uploadImageToGCS(nameFile, tokenUpload);
          if (!ok) {
            Tostget(t('preparationPage.errors.registrationFailedImageUpload'), 'warning');
          }
        }

        Tostget(t('preparationPage.success.checkOutSuccess'), 'success');
        stopCamera();
        setCurrentView('buttons');
        setVerificationData(null);
        setCapturedPhoto(null);
        // Refresh data
        await loadDailyPreparations();
      } else {
        Tostget(result.message || t('preparationPage.errors.checkOutFailed'), 'error');
      }
    } catch (error) {
      console.error('Error confirming check out:', error);
      Tostget(t('preparationPage.errors.checkOutError'), 'error');
    } finally {
      setLoading(false);
    }
  };



  return (
    <ResponsiveLayout>
      <PageHeader
        title={t('preparationPage.title')}
      />

      {/* Camera Modal */}
      {(currentView === 'checkIn' || currentView === 'checkOut') && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        >
          <div
            className="rounded-lg p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: colors.WHITE }}
          >
            <div className="text-center mb-4" style={{ direction: dir as 'rtl' | 'ltr' }}>
              <h3
                className={`mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
                style={{
                  fontSize: scale(18 + size),
                  fontFamily: fonts.IBMPlexSansArabicBold,
                  color: 'var(--color-text-primary)'
                }}
              >
                {t('preparationPage.capturePhoto')}
              </h3>
              <p
                className={isRTL ? 'text-right' : 'text-left'}
                style={{
                  fontSize: scale(14 + size),
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  color: 'var(--color-text-secondary)'
                }}
              >
                {t('preparationPage.ensureFaceVisible')}
              </p>
            </div>

            <div className="relative mb-4">
              {capturedPhoto ? (
                <div className="relative">
                  <img
                    src={capturedPhoto}
                    alt="Captured photo"
                    className="w-full rounded-lg"
                    style={{
                      height: verticalScale(250),
                      objectFit: 'cover',
                      border: '2px solid #4ade80'
                    }}
                  />
                  <div
                    className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs"
                    style={{ direction: dir as 'rtl' | 'ltr' }}
                  >
                    ✓ {t('preparationPage.photoCapturedBadge')}
                  </div>
                </div>
              ) : cameraError ? (
                <div className="flex flex-col items-center justify-center w-full rounded-lg"
                  style={{
                    height: verticalScale(250),
                    backgroundColor: '#fee2e2',
                    border: '2px solid #ef4444'
                  }}>
                  <div className="text-red-500 text-4xl mb-2">⚠️</div>
                  <p
                    className="text-center text-red-600 mb-4 px-4"
                    style={{ direction: dir as 'rtl' | 'ltr' }}
                  >
                    {cameraError}
                  </p>
                  <button
                    onClick={startCamera}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    style={{ direction: dir as 'rtl' | 'ltr' }}
                  >
                    {t('preparationPage.retryCamera')}
                  </button>
                </div>
              ) : isLoadingCamera ? (
                <div className="relative w-full rounded-lg"
                  style={{
                    height: verticalScale(250),
                    backgroundColor: 'var(--color-surface-secondary)',
                    border: '2px solid var(--color-border)'
                  }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full rounded-lg"
                    style={{ objectFit: 'cover', transform: 'scaleX(-1)' }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                    <p
                      className="text-center mb-2"
                      style={{
                        color: 'var(--color-text-secondary)',
                        direction: dir as 'rtl' | 'ltr'
                      }}
                    >
                      {t('preparationPage.startingCamera')}
                    </p>
                    <p
                      className="text-xs text-center"
                      style={{
                        color: 'var(--color-text-secondary)',
                        direction: dir as 'rtl' | 'ltr'
                      }}
                    >
                      {t('preparationPage.pleaseAllowCameraAccess')}
                    </p>
                  </div>
                </div>
              ) : isCameraActive ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg"
                    style={{
                      height: verticalScale(250),
                      objectFit: 'cover',
                      transform: 'scaleX(-1)',
                      border: '2px solid #3b82f6'
                    }}
                  />
                  <div
                    className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs"
                    style={{ direction: dir as 'rtl' | 'ltr' }}
                  >
                    {t('preparationPage.cameraReady')}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full rounded-lg"
                  style={{
                    height: verticalScale(250),
                    backgroundColor: 'var(--color-surface-secondary)',
                    border: '2px dashed var(--color-border)'
                  }}>
                  <div className="text-6xl mb-4">📷</div>
                  <p
                    className="text-center mb-4"
                    style={{
                      color: 'var(--color-text-secondary)',
                      direction: dir as 'rtl' | 'ltr'
                    }}
                  >
                    {t('preparationPage.clickToStartCamera')}
                  </p>
                </div>
              )}

              {/* Hidden canvas for photo capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>



            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <ButtonCreat
                text={t('preparationPage.cancel')}
                onpress={() => {
                  stopCamera();
                  setCurrentView('buttons');
                  setCapturedPhoto(null);
                }}
                styleButton={{
                  flex: 1,
                  backgroundColor: 'var(--color-text-secondary)',
                  color: colors.WHITE,
                  padding: `${scale(12)}px ${scale(16)}px`,
                  fontSize: scale(14 + size),
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  borderRadius: `${scale(8)}px`,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />

              {!capturedPhoto ? (
                <ButtonCreat
                  text={isCameraActive ? t('preparationPage.captureImage') : t('preparationPage.startCamera')}
                  onpress={() => (isCameraActive ? capturePhoto() : startCamera())}
                  styleButton={{
                    flex: 1,
                    backgroundColor: colors.GREEN,
                    color: colors.WHITE,
                    padding: `${scale(12)}px ${scale(16)}px`,
                    fontSize: scale(14 + size),
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    borderRadius: `${scale(8)}px`,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
              ) : (
                <div className={`flex gap-2 flex-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <ButtonCreat
                    text={t('preparationPage.retake')}
                    onpress={retakePhoto}
                    styleButton={{
                      flex: 1,
                      backgroundColor: colors.ORANGE,
                      color: colors.WHITE,
                      padding: `${scale(12)}px ${scale(16)}px`,
                      fontSize: scale(14 + size),
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      borderRadius: `${scale(8)}px`,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  />
                  <ButtonCreat
                    text={loading ? t('preparationPage.registering') : t('preparationPage.confirmPreparation')}
                    onpress={currentView === 'checkIn' ? confirmCheckIn : confirmCheckOut}
                    disabled={loading}
                    styleButton={{
                      flex: 1,
                      backgroundColor: colors.BLUE,
                      color: colors.WHITE,
                      opacity: loading ? 0.5 : 1,
                      padding: `${scale(12)}px ${scale(16)}px`,
                      fontSize: scale(14 + size),
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      borderRadius: `${scale(8)}px`,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 rounded-full p-2 z-10"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)'
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage}
              alt={t('preparationPage.preparationImage')}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <ContentSection>
        {/* Main Buttons View */}
        {currentView === 'buttons' && (
          <Card>
            <h2
              className="mb-6"
              style={{
                fontSize: scale(20 + size),
                fontFamily: fonts.IBMPlexSansArabicBold,
                color: 'var(--color-text-primary)',
                direction: dir as 'rtl' | 'ltr'
              }}
            >
              {t('preparationPage.preparationOptions')}
            </h2>

            {/* Basic buttons for all employees */}
            <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 2 }} gap="md" className="mb-6">
              <button
                onClick={handleCheckIn}
                className="p-6 rounded-lg flex items-center justify-center gap-3 transition-colors"
                style={{
                  backgroundColor: colors.GREEN,
                  color: colors.WHITE,
                  fontSize: scale(16 + size),
                  fontFamily: fonts.IBMPlexSansArabicBold,
                  cursor: userVerificationStatus.canCheckIn ? 'pointer' : 'not-allowed',
                  opacity: userVerificationStatus.canCheckIn ? 1 : 0.7,
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = userVerificationStatus.canCheckIn ? '0.9' : '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = userVerificationStatus.canCheckIn ? '1' : '0.7'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {t('preparationPage.checkInButton')}
              </button>

              <button
                onClick={handleCheckOut}
                className="p-6 rounded-lg flex items-center justify-center gap-3 transition-colors"
                style={{
                  backgroundColor: colors.RED,
                  color: colors.WHITE,
                  fontSize: scale(16 + size),
                  fontFamily: fonts.IBMPlexSansArabicBold,
                  cursor: userVerificationStatus.canCheckOut ? 'pointer' : 'not-allowed',
                  opacity: userVerificationStatus.canCheckOut ? 1 : 0.7,
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = userVerificationStatus.canCheckOut ? '0.9' : '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = userVerificationStatus.canCheckOut ? '1' : '0.7'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('preparationPage.checkOutButton')}
              </button>
            </ResponsiveGrid>

            {/* HR and Manager buttons */}
            {(hasHRPermissions() || hasManagerPermissions()) && (
              <div
                className="pt-6"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <h3
                  className="mb-4"
                  style={{
                    fontSize: scale(18 + size),
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    color: 'var(--color-text-primary)',
                    direction: dir as 'rtl' | 'ltr'
                  }}
                >
                  {t('preparationPage.additionalOptions')}
                </h3>

                <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
                  {hasHRPermissions() && (
                    <>
                      <ButtonCreat
                        text={t('preparationPage.preparationRecords')}
                        onpress={() => setCurrentView('hr')}
                        styleButton={{
                          backgroundColor: colors.BLUE,
                          color: colors.WHITE,
                          padding: scale(16),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: scale(8)
                        }}
                      />

                      <ButtonCreat
                        text={t('preparationPage.assignOvertime')}
                        onpress={() => setCurrentView('overtime')}
                        styleButton={{
                          backgroundColor: colors.BLUE,
                          color: colors.WHITE,
                          padding: scale(16),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: scale(8)
                        }}
                      />
                    </>
                  )}

                  {hasManagerPermissions() && (
                    <ButtonCreat
                      text={t('preparationPage.addHRPermissions')}
                      onpress={() => setCurrentView('addHR')}
                      styleButton={{
                        backgroundColor: colors.BLUE,
                        color: colors.WHITE,
                        padding: scale(16),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: scale(8)
                      }}
                    />
                  )}
                </ResponsiveGrid>
              </div>
            )}
          </Card>
        )}

        {/* HR View - Employee search and records */}
        {currentView === 'hr' && (
          <Card>
            <div
              style={{
                paddingBottom: `${scale(24)}px`,
                marginBottom: `${scale(24)}px`,
                borderBottom: '1px solid var(--color-border)'
              }}
            >
              <div
                className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                style={{
                  marginBottom: `${scale(16)}px`,
                  gap: `${scale(16)}px`,
                  direction: dir as 'rtl' | 'ltr'
                }}
              >
                <h2
                  className={isRTL ? 'text-right' : 'text-left'}
                  style={{
                    fontSize: scale(20 + size),
                    fontFamily: fonts.IBMPlexSansArabicBold,
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {t('preparationPage.preparationRecords')}
                </h2>
                <button
                  onClick={() => setCurrentView('buttons')}
                  className="flex items-center justify-center hover:opacity-80 transition-colors duration-200"
                  title={t('preparationPage.back')}
                  style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    padding: `${scale(10)}px`,
                    borderRadius: `${scale(8)}px`,
                    boxShadow: '0 2px 4px var(--color-card-shadow)',
                    transition: 'all 0.2s ease',
                    minWidth: `${scale(44)}px`,
                    minHeight: `${scale(44)}px`,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <BackArrowIcon
                    size={scale(20)}
                    color="var(--color-primary)"
                  />
                </button>
              </div>

              {/* Date and Actions Row */}
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between"
                style={{
                  gap: `${scale(16)}px`,
                  marginTop: `${scale(8)}px`
                }}
              >
                <div
                  className="flex items-end"
                  style={{ gap: `${scale(12)}px` }}
                >
                  <div>
                    <label
                      className={`block ${isRTL ? 'text-right' : 'text-left'}`}
                      style={{
                        fontSize: scale(12 + size),
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        color: 'var(--color-text-secondary)',
                        marginBottom: `${scale(6)}px`,
                        direction: dir as 'rtl' | 'ltr'
                      }}
                    >
                      {t('preparationPage.date')}
                    </label>
                    <div className="relative">
                      <input
                        id="preparation-date-filter"
                        name="preparation-date-filter"
                        type="month"
                        value={selectedDate.toISOString().slice(0, 7)}
                        onChange={handleDateChange}
                        className="rounded-lg"
                        style={{
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text-primary)',
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          fontSize: scale(14 + size),
                          padding: `${scale(10)}px ${scale(16)}px`,
                          borderRadius: `${scale(8)}px`
                        }}
                      />
                    </div>
                  </div>

                  {/* Filter Button - Same as mobile app FilterSvg - Now aligned with date input */}
                  <button
                    onClick={() => {
                      // empty() function from mobile app
                      setSelectedEmployee(null);
                      setSearchQuery('');
                      setEmployees([]);
                      setShowEmployeeSearch(!showEmployeeSearch);
                    }}
                    className="rounded-lg transition-colors shadow-sm hover:shadow-md"
                    title={t('preparationPage.filter')}
                    style={{
                      backgroundColor: 'var(--color-surface-secondary)',
                      padding: `${scale(12)}px`,
                      borderRadius: `${scale(8)}px`,
                      height: `${scale(44)}px`, // نفس ارتفاع input التاريخ تقريباً
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{
                        width: `${scale(20)}px`,
                        height: `${scale(20)}px`,
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.293.707l-2 2A1 1 0 0111 21v-6.586a1 1 0 00-.293-.707L4.293 7.293A1 1 0 014 6.586V4z" />
                    </svg>
                  </button>


                </div>

                {/* Summary Stats */}
                <div
                  className="rounded-lg min-w-fit"
                  style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    padding: `${scale(16)}px ${scale(20)}px`,
                    borderRadius: `${scale(12)}px`,
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div
                    style={{
                      fontSize: scale(12 + size),
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      color: 'var(--color-text-secondary)',
                      marginBottom: `${scale(6)}px`,
                      direction: dir as 'rtl' | 'ltr'
                    }}
                    className={isRTL ? 'text-right' : 'text-left'}
                  >
                    {t('preparationPage.totalRecords')}
                  </div>
                  <div
                    style={{
                      fontSize: scale(18 + size),
                      fontFamily: fonts.IBMPlexSansArabicBold,
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.2,
                      textAlign: 'center'
                    }}
                  >
                    {preparationRecords.length}
                  </div>
                </div>
              </div>
            </div>

              <div className="p-6">
                {/* Employee Search */}
                <div className="mb-6">
                  <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                    <label
                      className={`text-sm font-ibm-arabic-medium ${isRTL ? 'text-right' : 'text-left'}`}
                      style={{
                        color: 'var(--color-text-primary)',
                        direction: dir as 'rtl' | 'ltr'
                      }}
                    >
                      {t('preparationPage.searchForSpecificEmployee')}
                    </label>
                    {selectedEmployee && (
                      <button
                        onClick={() => {
                          setSelectedEmployee(null);
                          setSearchQuery('');
                          loadDailyPreparations();
                        }}
                        className="transition-colors duration-200"
                        style={{
                          fontSize: `${scale(12 + size)}px`,
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          padding: `${scale(6)}px ${scale(12)}px`,
                          borderRadius: `${scale(6)}px`,
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: '#dc2626',
                          marginBottom: `${scale(8)}px`, // رفع الزر قليلاً عن القائمة التي تحته
                          direction: dir as 'rtl' | 'ltr'
                        }}
                      >
                        {t('preparationPage.clearFilter')}
                      </button>
                    )}
                  </div>

                  {/* Search Input and Button - Same as mobile app */}
                  {showEmployeeSearch && (
                    <div
                      ref={searchContainerRef}
                      className="flex mb-3 relative"
                      style={{
                        gap: `${scale(12)}px`,
                        marginBottom: `${scale(16)}px`
                      }}
                    >
                      <input
                        id="preparation-employee-search"
                        name="preparation-employee-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('preparationPage.searchEmployee')}
                        className={`flex-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${isRTL ? 'text-right' : 'text-left'}`}
                        style={{
                          padding: `${scale(12)}px ${scale(16)}px`,
                          fontSize: `${scale(14 + size)}px`,
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          borderRadius: `${scale(8)}px`,
                          border: '1px solid var(--color-border)',
                          direction: dir as 'rtl' | 'ltr',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text-primary)'
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearchEmployees();
                          }
                        }}
                      />
                      <button
                        onClick={handleSearchEmployees}
                        className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        style={{
                          padding: `${scale(12)}px ${scale(20)}px`,
                          fontSize: `${scale(14 + size)}px`,
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          borderRadius: `${scale(8)}px`,
                          minWidth: `${scale(80)}px`,
                          direction: dir as 'rtl' | 'ltr'
                        }}
                      >
                        {t('preparationPage.searchButton')}
                      </button>
                    </div>
                  )}

                  {/* Employee Search Results */}
                  {showEmployeeSearch && employees.length > 0 && (
                    <div
                      className="absolute z-10 rounded-lg shadow-lg overflow-y-auto"
                      style={{
                        marginTop: `${scale(4)}px`,
                        borderRadius: `${scale(12)}px`,
                        maxHeight: `${verticalScale(240)}px`,
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        // تموضع ذكي للقائمة
                        width: `${scale(320)}px`, // عرض افتراضي
                        maxWidth: 'calc(100vw - 40px)', // لا يتجاوز عرض الشاشة
                        minWidth: `${scale(280)}px`, // حد أدنى للعرض
                        // تطبيق التموضع المحسوب ديناميكياً
                        ...dropdownStyle,
                      }}
                    >
                      {employees.map((employee) => (
                        <button
                          key={employee.id}
                          onClick={() => handleEmployeeSelect(employee)}
                          className="w-full text-right transition-colors duration-200 last:border-b-0"
                          style={{
                            padding: `${scale(16)}px ${scale(20)}px`,
                            borderBottom: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface)',
                            minHeight: `${scale(60)}px`, // حد أدنى للارتفاع لسهولة النقر
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end', // محاذاة لليمين في RTL
                            justifyContent: 'center',
                            gap: `${scale(4)}px`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                          }}
                        >
                          <div
                            className="font-ibm-arabic-medium"
                            style={{
                              fontSize: `${scale(15 + size)}px`,
                              lineHeight: 1.4,
                              fontFamily: fonts.IBMPlexSansArabicMedium,
                              textAlign: 'right',
                              width: '100%',
                              wordBreak: 'break-word',
                              color: 'var(--color-text-primary)'
                            }}
                          >
                            {employee.userName}
                          </div>
                          <div
                            style={{
                              fontSize: `${scale(12 + size)}px`,
                              lineHeight: 1.3,
                              fontFamily: fonts.IBMPlexSansArabicRegular,
                              textAlign: 'right',
                              width: '100%',
                              wordBreak: 'break-word',
                              color: 'var(--color-text-secondary)'
                            }}
                          >
                            {employee.job} - {employee.PhoneNumber}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Employee Info */}
                {selectedEmployee && (
                  <div
                    className="rounded-lg"
                    style={{
                      padding: `${scale(20)}px`,
                      marginBottom: `${scale(24)}px`,
                      borderRadius: `${scale(12)}px`,
                      backgroundColor: 'var(--color-surface-secondary)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <div
                      className="flex items-center justify-between"
                      style={{ gap: `${scale(16)}px` }}
                    >
                      <div>
                        <h3
                          className="font-ibm-arabic-bold"
                          style={{
                            fontSize: `${scale(18 + size)}px`,
                            marginBottom: `${scale(6)}px`,
                            lineHeight: 1.4,
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          {selectedEmployee.userName}
                        </h3>
                        <p
                          style={{
                            fontSize: `${scale(14 + size)}px`,
                            lineHeight: 1.3,
                            color: 'var(--color-text-secondary)'
                          }}
                        >
                          {selectedEmployee.job} - {selectedEmployee.PhoneNumber}
                        </p>
                      </div>
                      <div
                        className="flex"
                        style={{ gap: `${scale(12)}px` }}
                      >
                        <button
                          onClick={downloadPDF}
                          className="bg-blue-600 text-white rounded-lg font-ibm-arabic-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm hover:shadow-md"
                          style={{
                            padding: `${scale(10)}px ${scale(16)}px`,
                            fontSize: `${scale(13 + size)}px`,
                            borderRadius: `${scale(8)}px`,
                            gap: `${scale(6)}px`
                          }}
                        >
                          <svg
                            className=""
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{
                              width: `${scale(16)}px`,
                              height: `${scale(16)}px`
                            }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          {t('preparationPage.print')}
                        </button>
                        <div
                          className="rounded-full shadow-sm"
                          style={{
                            padding: `${scale(8)}px ${scale(16)}px`,
                            fontSize: `${scale(12 + size)}px`,
                            borderRadius: `${scale(20)}px`,
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-primary)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          {selectedDate.toLocaleDateString('en-CA')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}



                {/* Preparation Records */}
                {loading ? (
                  <div className="flex flex-col justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
                    <p style={{
                      color: 'var(--color-text-secondary)',
                      direction: dir as 'rtl' | 'ltr'
                    }}>{t('preparationPage.loadingData')}</p>
                  </div>
                ) : preparationRecords.length > 0 ? (
                  <div
                    className="space-y-6"
                    style={{
                      padding: `${scale(16)}px`,
                      gap: `${scale(24)}px`
                    }}
                  >
                    {preparationRecords.map((record, index) => (
                      <div
                        key={record.id || index}
                        className="rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                        style={{
                          marginBottom: `${scale(20)}px`,
                          borderRadius: `${scale(16)}px`,
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                      >
                        {/* Employee Header */}
                        <div
                          className="border-b"
                          style={{
                            padding: `${scale(20)}px ${scale(24)}px`,
                            borderRadius: `${scale(16)}px ${scale(16)}px 0 0`,
                            backgroundColor: 'var(--color-surface-secondary)',
                            borderBottomColor: 'var(--color-border)'
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div
                              className="space-y-2"
                              style={{ gap: `${scale(8)}px` }}
                            >
                              <h3
                                className="font-ibm-arabic-bold"
                                style={{
                                  fontSize: `${scale(18 + size)}px`,
                                  lineHeight: 1.4,
                                  marginBottom: `${scale(4)}px`,
                                  color: 'var(--color-text-primary)'
                                }}
                              >
                                {record.userName}
                              </h3>
                              <p
                                className={`rounded-full inline-block ${isRTL ? 'text-right' : 'text-left'}`}
                                style={{
                                  fontSize: `${scale(12 + size)}px`,
                                  padding: `${scale(6)}px ${scale(12)}px`,
                                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                  backgroundColor: 'var(--color-surface)',
                                  color: 'var(--color-text-secondary)',
                                  border: '1px solid var(--color-border)',
                                  direction: dir as 'rtl' | 'ltr'
                                }}
                              >
                                {record.job || t('preparationPage.employee')}
                              </p>
                            </div>

                            {/* Working Hours Display */}
                            {record.CheckIntime && record.CheckOUTtime && (
                              <div
                                className="text-center rounded-lg shadow-sm"
                                style={{
                                  padding: `${scale(12)}px ${scale(16)}px`,
                                  marginLeft: `${scale(12)}px`,
                                  marginRight: `${scale(12)}px`,
                                  backgroundColor: 'var(--color-surface)',
                                  border: '1px solid var(--color-border)'
                                }}
                              >
                                <div
                                  className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}
                                  style={{
                                    fontSize: `${scale(10 + size)}px`,
                                    marginBottom: `${scale(4)}px`,
                                    color: 'var(--color-primary)',
                                    direction: dir as 'rtl' | 'ltr'
                                  }}
                                >
                                  {t('preparationPage.totalWorkHours')}
                                </div>
                                <div
                                  className="font-ibm-arabic-bold"
                                  style={{
                                    fontSize: `${scale(14 + size)}px`,
                                    lineHeight: 1.3,
                                    color: 'var(--color-text-primary)'
                                  }}
                                >
                                  {(() => {
                                    const checkIn = new Date(record.CheckIntime);
                                    const checkOut = new Date(record.CheckOUTtime);
                                    const diffMs = checkOut.getTime() - checkIn.getTime();
                                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
                                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                                  })()}
                                </div>
                              </div>
                            )}

                            <div
                              className={isRTL ? 'text-right' : 'text-left'}
                              style={{
                                marginLeft: isRTL ? `${scale(16)}px` : '0',
                                marginRight: isRTL ? '0' : `${scale(16)}px`
                              }}
                            >
                              <div
                                style={{
                                  fontSize: `${scale(11 + size)}px`,
                                  marginBottom: `${scale(6)}px`,
                                  color: 'var(--color-text-secondary)',
                                  direction: dir as 'rtl' | 'ltr'
                                }}
                              >
                                {t('preparationPage.date')}
                              </div>
                              <div
                                className="font-medium rounded-lg shadow-sm"
                                style={{
                                  fontSize: `${scale(12 + size)}px`,
                                  padding: `${scale(8)}px ${scale(12)}px`,
                                  backgroundColor: 'var(--color-surface)',
                                  color: 'var(--color-text-primary)',
                                  border: '1px solid var(--color-border)'
                                }}
                              >
                                {formatDate(record.Dateday)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Check In/Out Details */}
                        <div
                          style={{
                            padding: `${scale(24)}px ${scale(24)}px ${scale(20)}px`
                          }}
                        >
                          <div
                            className="grid grid-cols-1 lg:grid-cols-2"
                            style={{ gap: `${scale(32)}px` }}
                          >
                            {/* Check In */}
                            <div
                              className="space-y-4"
                              style={{ gap: `${scale(16)}px` }}
                            >
                              <div
                                className="flex items-center border-b"
                                style={{
                                  gap: `${scale(12)}px`,
                                  paddingBottom: `${scale(12)}px`,
                                  marginBottom: `${scale(16)}px`,
                                  borderBottomColor: 'var(--color-border)'
                                }}
                              >
                                <div
                                  className="bg-green-500 rounded-full shadow-sm"
                                  style={{
                                    width: `${scale(16)}px`,
                                    height: `${scale(16)}px`
                                  }}
                                ></div>
                                <h4
                                  className="font-ibm-arabic-bold"
                                  style={{
                                    fontSize: `${scale(16 + size)}px`,
                                    lineHeight: 1.4,
                                    color: 'var(--color-text-primary)',
                                    direction: dir as 'rtl' | 'ltr'
                                  }}
                                >
                                  {t('preparationPage.checkInPreparation')}
                                </h4>
                              </div>

                              {record.CheckIntime ? (
                                <div
                                  className="space-y-4"
                                  style={{ gap: `${scale(16)}px` }}
                                >
                                  <div
                                    className="rounded-lg"
                                    style={{
                                      padding: `${scale(16)}px`,
                                      borderRadius: `${scale(12)}px`,
                                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                      border: '1px solid rgba(34, 197, 94, 0.3)'
                                    }}
                                  >
                                    <div
                                      className="flex items-center"
                                      style={{ gap: `${scale(12)}px` }}
                                    >
                                      <div
                                        className="rounded-lg"
                                        style={{
                                          padding: `${scale(8)}px`,
                                          borderRadius: `${scale(8)}px`,
                                          backgroundColor: 'rgba(34, 197, 94, 0.2)'
                                        }}
                                      >
                                        <svg
                                          className="text-green-600"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                          style={{
                                            width: `${scale(20)}px`,
                                            height: `${scale(20)}px`
                                          }}
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </div>
                                      <div>
                                        <div
                                          className="font-medium"
                                          style={{
                                            fontSize: `${scale(12 + size)}px`,
                                            marginBottom: `${scale(4)}px`,
                                            color: '#059669',
                                            direction: dir as 'rtl' | 'ltr'
                                          }}
                                        >
                                          {t('preparationPage.checkInTime')}
                                        </div>
                                        <div
                                          className="font-ibm-arabic-bold"
                                          style={{
                                            fontSize: `${scale(16 + size)}px`,
                                            lineHeight: 1.3,
                                            color: '#065f46'
                                          }}
                                        >
                                          {formatTime(record.CheckIntime)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {record.CheckInFile && record.CheckInFile.name && (
                                    <div
                                      style={{
                                        marginTop: `${scale(16)}px`
                                      }}
                                    >
                                      <div
                                        className="flex items-center"
                                        style={{
                                          fontSize: `${scale(12 + size)}px`,
                                          marginBottom: `${scale(12)}px`,
                                          gap: `${scale(8)}px`,
                                          color: 'var(--color-text-secondary)'
                                        }}
                                      >
                                        <svg
                                          className=""
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                          style={{
                                            width: `${scale(16)}px`,
                                            height: `${scale(16)}px`,
                                            direction: dir as 'rtl' | 'ltr'
                                          }}
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {t('preparationPage.checkInImage')}
                                      </div>
                                      <button
                                        onClick={() => handleImageView(`${URLFIL}/${record.CheckInFile!.name}`)}
                                        className="group relative w-full bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-green-300 transition-all duration-300"
                                        style={{
                                          height: `${verticalScale(144)}px`,
                                          borderRadius: `${scale(12)}px`
                                        }}
                                      >
                                        <img
                                          src={`${URLFIL}/${record.CheckInFile!.name}`}
                                          alt={t('preparationPage.checkInImage')}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                            if (nextElement) {
                                              nextElement.style.display = 'flex';
                                            }
                                          }}
                                        />
                                        <div className="hidden absolute inset-0 flex items-center justify-center bg-green-50">
                                          <div className="text-center">
                                            <svg
                                              className="text-green-400 mx-auto"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                              style={{
                                                width: `${scale(48)}px`,
                                                height: `${scale(48)}px`,
                                                marginBottom: `${scale(8)}px`
                                              }}
                                            >
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p
                                              className="text-green-600"
                                              style={{
                                                fontSize: `${scale(12 + size)}px`,
                                                direction: dir as 'rtl' | 'ltr'
                                              }}
                                            >
                                              {t('preparationPage.cannotLoadImage')}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                          <div className="bg-white bg-opacity-90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                                            <svg
                                              className="w-6 h-6"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                              style={{ color: 'var(--color-text-primary)' }}
                                            >
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                          </div>
                                        </div>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className="rounded-lg p-4 text-center"
                                  style={{
                                    backgroundColor: 'var(--color-surface-secondary)',
                                    border: '1px solid var(--color-border)'
                                  }}
                                >
                                  <svg
                                    className="w-8 h-8 mx-auto mb-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div
                                    className="text-sm"
                                    style={{
                                      color: 'var(--color-text-secondary)',
                                      direction: dir as 'rtl' | 'ltr'
                                    }}
                                  >
                                    {t('preparationPage.notPreparedYet')}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Check Out */}
                            <div
                              className="space-y-4"
                              style={{ gap: `${scale(16)}px` }}
                            >
                              <div
                                className="flex items-center border-b"
                                style={{
                                  gap: `${scale(12)}px`,
                                  paddingBottom: `${scale(12)}px`,
                                  marginBottom: `${scale(16)}px`,
                                  borderBottomColor: 'var(--color-border)'
                                }}
                              >
                                <div
                                  className="bg-red-500 rounded-full shadow-sm"
                                  style={{
                                    width: `${scale(16)}px`,
                                    height: `${scale(16)}px`
                                  }}
                                ></div>
                                <h4
                                  className="font-ibm-arabic-bold"
                                  style={{
                                    fontSize: `${scale(16 + size)}px`,
                                    lineHeight: 1.4,
                                    color: 'var(--color-text-primary)',
                                    direction: dir as 'rtl' | 'ltr'
                                  }}
                                >
                                  {t('preparationPage.checkOutPreparation')}
                                </h4>
                              </div>

                              {record.CheckOUTtime ? (
                                <div
                                  className="space-y-4"
                                  style={{ gap: `${scale(16)}px` }}
                                >
                                  <div
                                    className="rounded-lg"
                                    style={{
                                      padding: `${scale(16)}px`,
                                      borderRadius: `${scale(12)}px`,
                                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                      border: '1px solid rgba(239, 68, 68, 0.3)'
                                    }}
                                  >
                                    <div
                                      className="flex items-center"
                                      style={{ gap: `${scale(12)}px` }}
                                    >
                                      <div
                                        className="rounded-lg"
                                        style={{
                                          padding: `${scale(8)}px`,
                                          borderRadius: `${scale(8)}px`,
                                          backgroundColor: 'rgba(239, 68, 68, 0.2)'
                                        }}
                                      >
                                        <svg
                                          className="text-red-600"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                          style={{
                                            width: `${scale(20)}px`,
                                            height: `${scale(20)}px`
                                          }}
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </div>
                                      <div>
                                        <div
                                          className="font-medium"
                                          style={{
                                            fontSize: `${scale(12 + size)}px`,
                                            marginBottom: `${scale(4)}px`,
                                            color: '#dc2626',
                                            direction: dir as 'rtl' | 'ltr'
                                          }}
                                        >
                                          {t('preparationPage.checkOutTime')}
                                        </div>
                                        <div
                                          className="font-ibm-arabic-bold"
                                          style={{
                                            fontSize: `${scale(16 + size)}px`,
                                            lineHeight: 1.3,
                                            color: '#991b1b'
                                          }}
                                        >
                                          {formatTime(record.CheckOUTtime)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {record.CheckoutFile && record.CheckoutFile.name && (
                                    <div
                                      style={{
                                        marginTop: `${scale(16)}px`
                                      }}
                                    >
                                      <div
                                        className="flex items-center"
                                        style={{
                                          fontSize: `${scale(12 + size)}px`,
                                          marginBottom: `${scale(12)}px`,
                                          gap: `${scale(8)}px`,
                                          color: 'var(--color-text-secondary)'
                                        }}
                                      >
                                        <svg
                                          className=""
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                          style={{
                                            width: `${scale(16)}px`,
                                            height: `${scale(16)}px`,
                                            direction: dir as 'rtl' | 'ltr'
                                          }}
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {t('preparationPage.checkOutImage')}
                                      </div>
                                      <button
                                        onClick={() => handleImageView(`${URLFIL}/${record.CheckoutFile!.name}`)}
                                        className="group relative w-full bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-red-300 transition-all duration-300"
                                        style={{
                                          height: `${verticalScale(144)}px`,
                                          borderRadius: `${scale(12)}px`
                                        }}
                                      >
                                        <img
                                          src={`${URLFIL}/${record.CheckoutFile!.name}`}
                                          alt={t('preparationPage.checkOutImage')}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                            if (nextElement) {
                                              nextElement.style.display = 'flex';
                                            }
                                          }}
                                        />
                                        <div className="hidden absolute inset-0 flex items-center justify-center bg-red-50">
                                          <div className="text-center">
                                            <svg
                                              className="text-red-400 mx-auto"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                              style={{
                                                width: `${scale(48)}px`,
                                                height: `${scale(48)}px`,
                                                marginBottom: `${scale(8)}px`
                                              }}
                                            >
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p
                                              className="text-red-600"
                                              style={{
                                                fontSize: `${scale(12 + size)}px`,
                                                direction: dir as 'rtl' | 'ltr'
                                              }}
                                            >
                                              {t('preparationPage.cannotLoadImage')}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                          <div className="bg-white bg-opacity-90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                                            <svg
                                              className="w-6 h-6"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                              style={{ color: 'var(--color-text-primary)' }}
                                            >
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                          </div>
                                        </div>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className="rounded-lg text-center"
                                  style={{
                                    padding: `${scale(16)}px`,
                                    borderRadius: `${scale(12)}px`,
                                    backgroundColor: 'var(--color-surface-secondary)',
                                    border: '1px solid var(--color-border)'
                                  }}
                                >
                                  <svg
                                    className="mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{
                                      width: `${scale(32)}px`,
                                      height: `${scale(32)}px`,
                                      marginBottom: `${scale(8)}px`,
                                      color: 'var(--color-text-secondary)'
                                    }}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div
                                    style={{
                                      fontSize: `${scale(12 + size)}px`,
                                      color: 'var(--color-text-secondary)',
                                      direction: dir as 'rtl' | 'ltr'
                                    }}
                                  >
                                    {t('preparationPage.notCheckedOutYet')}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Load More Button - Outside the loop */}
                    {preparationRecords.length > 0 && (
                      <div
                        className="flex justify-center"
                        style={{
                          marginTop: `${scale(32)}px`,
                          paddingTop: `${scale(16)}px`
                        }}
                      >
                        {hrLoadingMore ? (
                          <div
                            className="flex items-center rounded-full"
                            style={{
                              gap: `${scale(12)}px`,
                              padding: `${scale(12)}px ${scale(24)}px`,
                              borderRadius: `${scale(24)}px`,
                              backgroundColor: 'var(--color-surface-secondary)',
                              color: 'var(--color-text-secondary)',
                              border: '1px solid var(--color-border)'
                            }}
                          >
                            <div
                              className="animate-spin rounded-full border-b-2"
                              style={{
                                width: `${scale(20)}px`,
                                height: `${scale(20)}px`,
                                borderColor: 'var(--color-primary)'
                              }}
                            ></div>
                            <span
                              className="font-medium"
                              style={{
                                fontSize: `${scale(14 + size)}px`,
                                direction: dir as 'rtl' | 'ltr'
                              }}
                            >
                              {t('preparationPage.loadingMore')}
                            </span>
                          </div>
                        ) : hrHasMore ? (
                          <button
                            onClick={loadMorePreparations}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                            style={{
                              padding: `${scale(12)}px ${scale(24)}px`,
                              fontSize: `${scale(14)}px`,
                              borderRadius: `${scale(24)}px`,
                              direction: dir as 'rtl' | 'ltr'
                            }}
                          >
                            {t('preparationPage.loadMoreRecords')}
                          </button>
                        ) : (
                          <div
                            className="rounded-full"
                            style={{
                              padding: `${scale(12)}px ${scale(24)}px`,
                              borderRadius: `${scale(24)}px`,
                              backgroundColor: 'var(--color-surface-secondary)',
                              border: '1px solid var(--color-border)'
                            }}
                          >
                            <span
                              className="font-medium"
                              style={{
                                fontSize: `${scale(12 + size)}px`,
                                color: 'var(--color-text-secondary)',
                                direction: dir as 'rtl' | 'ltr'
                              }}
                            >
                              {t('preparationPage.allRecordsDisplayed')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div ref={loadMoreRef} />
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div
                      className="rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6"
                      style={{
                        backgroundColor: 'var(--color-surface-secondary)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <svg
                        className="h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-ibm-arabic-bold mb-2"
                      style={{
                        color: 'var(--color-text-primary)',
                        direction: dir as 'rtl' | 'ltr'
                      }}
                    >
                      {t('preparationPage.noPreparationRecordsTitle')}
                    </h3>
                    <p
                      className={`max-w-sm mx-auto ${isRTL ? 'text-right' : 'text-left'}`}
                      style={{ color: 'var(--color-text-secondary)', direction: dir as 'rtl' | 'ltr' }}
                    >
                      {selectedEmployee
                        ? t('preparationPage.noPreparationRecordsForEmployee', { name: selectedEmployee.userName })
                        : t('preparationPage.noPreparationRecords')
                      }
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => {
                          setSelectedEmployee(null);
                          setShowEmployeeSearch(false);
                        }}
                        className="font-medium transition-colors duration-200"
                        style={{
                          fontSize: `${scale(13 + size)}px`,
                          fontFamily: fonts.IBMPlexSansArabicMedium,
                          padding: `${scale(8)}px ${scale(16)}px`,
                          borderRadius: `${scale(6)}px`,
                          backgroundColor: 'rgba(37, 99, 235, 0.1)',
                          border: '1px solid rgba(37, 99, 235, 0.2)',
                          color: 'var(--color-primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
                        }}
                      >
                        {t('preparationPage.viewAllRecords')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
          </Card>
        )}

        {/* Overtime View */}
        {currentView === 'overtime' && (
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2
                style={{
                  fontSize: scale(20 + size),
                  fontFamily: fonts.IBMPlexSansArabicBold,
                  color: 'var(--color-text-primary)',
                  direction: dir as 'rtl' | 'ltr'
                }}
                className={isRTL ? 'text-right' : 'text-left'}
              >
                {t('preparationPage.assignOvertime')}
              </h2>
              <button
                onClick={() => setCurrentView('buttons')}
                className="flex items-center justify-center hover:opacity-80 transition-colors duration-200"
                title={t('preparationPage.back')}
                style={{
                  backgroundColor: 'var(--color-surface-secondary)',
                  padding: `${scale(10)}px`,
                  borderRadius: `${scale(8)}px`,
                  boxShadow: '0 2px 4px var(--color-card-shadow)',
                  transition: 'all 0.2s ease',
                  minWidth: `${scale(44)}px`,
                  minHeight: `${scale(44)}px`,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <BackArrowIcon
                  size={scale(20)}
                  color="var(--color-primary)"
                />
              </button>
            </div>

            {/* Employee Search Section */}
            <div className="mb-6">
              <h3
                className={`mb-4 ${isRTL ? 'text-right' : 'text-left'}`}
                style={{
                  fontSize: scale(16 + size),
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  color: 'var(--color-text-primary)',
                  direction: dir as 'rtl' | 'ltr'
                }}
              >
                {t('preparationPage.searchForEmployee')}
              </h3>

              <div className="relative" ref={searchContainerRef}>
                <input
                  id="overtime-employee-search"
                  name="overtime-employee-search"
                  type="text"
                  placeholder={t('preparationPage.searchEmployeePlaceholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log('🔍 تغيير في البحث:', value);
                    setSearchQuery(value);
                    if (value.length >= 2) {
                      console.log('🚀 بدء البحث عن:', value);
                      searchEmployees(value);
                    } else {
                      console.log('🧹 مسح النتائج - النص قصير جداً');
                      setEmployeeSearchResults([]);
                      setShowEmployeeSearch(false);
                    }
                  }}
                  className="w-full"
                  style={{
                    fontSize: scale(14 + size),
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    padding: scale(12),
                    borderRadius: scale(8),
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)'
                  }}
                />

                {/* Search Results Dropdown */}
                {showEmployeeSearch && employeeSearchResults.length > 0 && (
                  <div
                    className="absolute z-10 rounded-lg shadow-lg overflow-y-auto"
                    style={{
                      ...dropdownStyle,
                      marginTop: scale(4),
                      borderRadius: scale(12),
                      maxHeight: scale(240),
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      boxShadow: 'var(--color-card-shadow) 0px 10px 25px -5px',
                      width: scale(320),
                      maxWidth: 'calc(100vw - 40px)',
                      minWidth: scale(280)
                    }}
                  >
                    {employeeSearchResults.map((employee, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedOvertimeEmployee(employee);
                          setSearchQuery(employee.userName);
                          setShowEmployeeSearch(false);
                          setEmployeeSearchResults([]);
                        }}
                        className="w-full text-right hover:opacity-80 last:border-b-0 transition-colors duration-200"
                        style={{
                          padding: scale(12) + 'px ' + scale(16) + 'px',
                          borderRadius: scale(5),
                          marginBottom: scale(2),
                          backgroundColor: 'var(--color-surface)',
                          borderBottom: '1px solid var(--color-border)'
                        }}
                      >
                        <div
                          style={{
                            fontSize: scale(14 + size),
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            textAlign: 'right',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          {employee.userName}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Employee Display */}
              {selectedOvertimeEmployee && (
                <div
                  className="mt-4 p-4 rounded-lg"
                  style={{
                    borderRadius: scale(8),
                    padding: scale(16),
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    border: '1px solid rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <div
                    style={{
                      fontSize: scale(14 + size),
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      color: 'var(--color-primary)',
                      marginBottom: scale(4),
                      direction: dir as 'rtl' | 'ltr'
                    }}
                    className={isRTL ? 'text-right' : 'text-left'}
                  >
                    {t('preparationPage.selectedEmployee', { name: selectedOvertimeEmployee.userName })}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOvertimeEmployee(null);
                      setSearchQuery('');
                      setSelectedOvertimeDates([]);
                    }}
                    className="transition-colors duration-200 mt-2"
                    style={{
                      fontSize: scale(12 + size),
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      padding: scale(6) + 'px ' + scale(12) + 'px',
                      borderRadius: scale(6),
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#dc2626',
                      direction: dir as 'rtl' | 'ltr'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#991b1b';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#dc2626';
                    }}
                  >
                    {t('preparationPage.deselectEmployee')}
                  </button>
                </div>
              )}
            </div>

            {/* Date Selection Section */}
            {selectedOvertimeEmployee && (
              <div className="mb-6">
                <h3
                  className="mb-4"
                  style={{
                    fontSize: scale(16 + size),
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    color: 'var(--color-text-primary)',
                    direction: dir as 'rtl' | 'ltr'
                  }}
                >
                  {t('preparationPage.selectOvertimeDates')}
                </h3>

                {/* Current Overtime Display */}
                <div
                  className="mb-4 p-4 rounded-lg"
                  style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <h4
                    className="mb-2"
                    style={{
                      fontSize: scale(14 + size),
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      color: 'var(--color-text-primary)',
                      direction: dir as 'rtl' | 'ltr'
                    }}
                  >
                    {t('preparationPage.currentOvertime')}
                  </h4>
                  <div
                    style={{
                      fontSize: scale(12 + size),
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    {selectedOvertimeEmployee?.Datedayovertime && selectedOvertimeEmployee.Datedayovertime.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedOvertimeEmployee.Datedayovertime.map((date: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded"
                            style={{
                              fontSize: scale(11 + size),
                              fontFamily: fonts.IBMPlexSansArabicMedium,
                              backgroundColor: 'rgba(34, 197, 94, 0.2)',
                              color: '#166534'
                            }}
                          >
                            {date}
                          </span>
                        ))}
                      </div>
                    ) : (
                      t('preparationPage.noOvertimeAssigned')
                    )}
                  </div>
                </div>

                <h4
                  className={`mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
                  style={{
                    fontSize: scale(14 + size),
                    fontFamily: fonts.IBMPlexSansArabicMedium,
                    color: 'var(--color-text-primary)',
                    direction: dir as 'rtl' | 'ltr'
                  }}
                >
                  {t('preparationPage.addNewDates')}
                </h4>

                <div className="mb-4">
                  <input
                    id="overtime-date-picker"
                    name="overtime-date-picker"
                    type="date"
                    className={`w-full p-3 rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}
                    style={{
                      fontSize: scale(14 + size),
                      fontFamily: fonts.IBMPlexSansArabicMedium,
                      padding: scale(12),
                      borderRadius: scale(8),
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      direction: dir as 'rtl' | 'ltr'
                    }}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      if (selectedDate && !selectedOvertimeDates.includes(selectedDate)) {
                        setSelectedOvertimeDates([...selectedOvertimeDates, selectedDate]);
                      }
                    }}
                  />
                </div>

                {/* Selected Dates Display */}
                {selectedOvertimeDates.length > 0 && (
                  <div className="mb-4">
                    <h4
                      className={`mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
                      style={{
                        fontSize: scale(14 + size),
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        color: 'var(--color-text-primary)',
                        direction: dir as 'rtl' | 'ltr'
                      }}
                    >
                      {t('preparationPage.selectedDates')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOvertimeDates.map((date, index) => (
                        <div
                          key={index}
                          className="flex items-center px-3 py-1 rounded-full"
                          style={{
                            fontSize: scale(12 + size),
                            fontFamily: fonts.IBMPlexSansArabicMedium,
                            backgroundColor: 'rgba(37, 99, 235, 0.2)',
                            color: '#1e40af'
                          }}
                        >
                          {date}
                          <button
                            onClick={() => {
                              setSelectedOvertimeDates(selectedOvertimeDates.filter((_, i) => i !== index));
                            }}
                            className="ml-2 transition-colors duration-200"
                            style={{ color: '#dc2626' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#991b1b';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#dc2626';
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedOvertimeDates.length > 0 && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleOvertimeAssignment(true)}
                      disabled={isAssigningOvertime}
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                      style={{
                        fontSize: scale(14 + size),
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        padding: scale(12),
                        borderRadius: scale(8),
                        direction: dir as 'rtl' | 'ltr'
                      }}
                    >
                      {isAssigningOvertime ? t('preparationPage.assigning') : t('preparationPage.assignOvertimeButton')}
                    </button>

                    <button
                      onClick={() => handleOvertimeAssignment(false)}
                      disabled={isAssigningOvertime}
                      className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                      style={{
                        fontSize: scale(14 + size),
                        fontFamily: fonts.IBMPlexSansArabicMedium,
                        padding: scale(12),
                        borderRadius: scale(8),
                        direction: dir as 'rtl' | 'ltr'
                      }}
                    >
                      {isAssigningOvertime ? t('preparationPage.cancelling') : t('preparationPage.cancelOvertimeButton')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Add HR View */}
        {currentView === 'addHR' && (
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2
                style={{
                  fontSize: scale(20 + size),
                  fontFamily: fonts.IBMPlexSansArabicBold,
                  color: 'var(--color-text-primary)',
                  direction: dir as 'rtl' | 'ltr'
                }}
                className={isRTL ? 'text-right' : 'text-left'}
              >
                {t('preparationPage.addHRPermissions')}
              </h2>
              <button
                onClick={() => setCurrentView('buttons')}
                className="flex items-center justify-center hover:opacity-80 transition-colors duration-200"
                title={t('preparationPage.back')}
                style={{
                  backgroundColor: 'var(--color-surface-secondary)',
                  padding: `${scale(10)}px`,
                  borderRadius: `${scale(8)}px`,
                  boxShadow: '0 2px 4px var(--color-card-shadow)',
                  transition: 'all 0.2s ease',
                  minWidth: `${scale(44)}px`,
                  minHeight: `${scale(44)}px`,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <BackArrowIcon
                  size={scale(20)}
                  color="var(--color-primary)"
                />
              </button>
            </div>

            {/* HR Users Management */}
            <HRUsersManagement
              user={user}
              size={size}
              onUserUpdate={() => {
                // Refresh any necessary data
                console.log('HR users updated');
              }}
            />
          </Card>
        )}
      </ContentSection>
    </ResponsiveLayout>
  );
}
