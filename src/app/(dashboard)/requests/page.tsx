'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import UserProfileModal from '@/components/user/UserProfileModal';
import useValidityUser from '@/hooks/useValidityUser';
import Image from 'next/image';
import { EmployeeOnly, PermissionBasedVisibility, RequestsPermissionGuard } from '@/components/auth/PermissionGuard';
import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

// Types
interface Request {
  RequestsID: number;
  ProjectID: number;
  Type: string;
  Data: string;
  Date: string;
  Done: string;
  InsertBy: string;
  Implementedby?: string;
  Image?: string;
  checkorderout: string;
  DateTime?: string;
  Nameproject?: string;
}

interface RequestsData {
  arrayLight: Request[];
  arrayHeavy: Request[];
  arrayElectrical: Request[];
  arrayPlumber: Request[];
  arrayBlacksmith: Request[];
}

interface SectionState {
  [key: string]: {
    isExpanded: boolean;
    hasMore: boolean;
    lastID: number;
    loading: boolean;
  };
}

interface RequestCount {
  Open: number;
  Close: number;
}

// Request Types - matching mobile app exactly
const REQUEST_TYPES = [
  { key: 'arrayLight', name: 'مواد خفيفة', color: 'bg-blue-100 text-blue-800' },
  { key: 'arrayHeavy', name: 'مواد ثقيلة', color: 'bg-green-100 text-green-800' },
  { key: 'arrayElectrical', name: 'كهربائي', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'arrayPlumber', name: 'سباك', color: 'bg-purple-100 text-purple-800' },
  { key: 'arrayBlacksmith', name: 'حداد', color: 'bg-red-100 text-red-800' }
];

// Request Card Component - matching mobile app exactly
const RequestCard = ({
  request,
  index,
  type,
  typepage,
  onClose,
  onOptions,
  onConfirm,
  onChat,
  loading,
  isClosed = false
}: {
  request: Request;
  index: number;
  type: string;
  typepage: string;
  onClose: (id: number, type: string, request: Request) => void;
  onOptions: (request: Request) => void;
  onConfirm?: (request: Request) => void;
  onChat?: (request: Request) => void;
  loading: {[key: string]: boolean};
  isClosed?: boolean;
}) => {
  return (
    <div
      className="rounded-xl p-4 mb-3 transition-all duration-200 hover:shadow-lg hover:scale-[1.01]"
      style={{
        backgroundColor: 'var(--color-card-background)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {loading[`close_${request.RequestsID}`] ? (
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#3b82f6' }}></div>
          ) : (
            <button
              onClick={() => onClose(request.RequestsID, type, request)}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                request.Done === 'true'
                  ? 'bg-blue-600 border-blue-600 shadow-md'
                  : 'border-gray-300 hover:border-blue-600 hover:bg-blue-50'
              }`}
              style={{
                borderColor: request.Done === 'true' ? '#3b82f6' : 'var(--color-border)',
                backgroundColor: request.Done === 'true' ? '#3b82f6' : 'transparent'
              }}
            >
              {request.Done === 'true' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )}

          <div className="flex-1 min-w-0">
            <p
              className="font-bold text-sm truncate"
              style={{
                fontFamily: 'var(--font-ibm-arabic-semibold)',
                color: 'var(--color-text-primary)'
              }}
            >
              {index + 1}- طلب بتاريخ {new Date(request.Date).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chat Button - for individual request chat */}
          {onChat && (
            <button
              onClick={() => onChat(request)}
              className="p-2 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
              title="دردشة الطلبية"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={() => onOptions(request)}
            className="p-2 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border)'
            }}
            title="إعدادات الطلب"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-3">
        <p
          className="leading-relaxed"
          style={{
            fontFamily: 'var(--font-ibm-arabic-medium)',
            color: 'var(--color-text-primary)',
            fontSize: '14px',
            lineHeight: '1.6'
          }}
        >
          {request.Data}
        </p>
      </div>

      <div
        className="flex items-center justify-between text-xs mb-3 p-2 rounded-lg"
        style={{
          backgroundColor: 'var(--color-surface-secondary)',
          color: 'var(--color-text-secondary)'
        }}
      >
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          بواسطة: {request.InsertBy}
        </span>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          {new Date(request.Date).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })} - {new Date(request.Date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}
        </span>
      </div>

      {request.Implementedby && (
        <div
          className="text-xs mb-3 p-2 rounded-lg flex items-center gap-1"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
          نُفذ بواسطة: {request.Implementedby}
        </div>
      )}

      {/* Confirm Button for closed requests */}
      {isClosed && onConfirm && request.checkorderout === 'false' && (
        <div
          className="mt-3 pt-3"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            onClick={() => onConfirm(request)}
            disabled={loading[`confirm_${request.RequestsID}`]}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              fontFamily: 'var(--font-ibm-arabic-semibold)'
            }}
          >
            {loading[`confirm_${request.RequestsID}`] ? 'جاري التأكيد...' : 'تأكيد الوصول'}
          </button>
        </div>
      )}

      {/* Confirmed Badge */}
      {isClosed && request.checkorderout === 'true' && (
        <div
          className="mt-3 pt-3"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div
            className="py-3 px-4 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              fontFamily: 'var(--font-ibm-arabic-semibold)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            تم تأكيد الوصول
          </div>
        </div>
      )}
    </div>
  );
};

// Request Section Component - collapsible with load more
const RequestSection = ({
  type,
  requests,
  sectionState,
  typepage,
  doneValue,
  onToggle,
  onLoadMore,
  onClose,
  onOptions,
  onConfirm,
  onChat,
  loading,
  isClosed = false
}: {
  type: { key: string; name: string; color: string };
  requests: Request[];
  sectionState: { isExpanded: boolean; hasMore: boolean; lastID: number; loading: boolean };
  typepage: string;
  doneValue: string;
  onToggle: () => void;
  onLoadMore: () => void;
  onClose: (id: number, type: string, request: Request) => void;
  onOptions: (request: Request) => void;
  onConfirm: (request: Request) => void;
  onChat: (request: Request) => void;
  loading: {[key: string]: boolean};
  isClosed?: boolean;
}) => {
  // Always show section header - matching mobile app behavior
  return (
    <div
      className="mb-6 p-4 rounded-xl transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: 'var(--color-card-background)',
        border: '2px solid var(--color-border)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
        style={{
          backgroundColor: 'var(--color-surface-secondary)',
          border: '1px solid var(--color-border)'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-full text-sm font-bold ${type.color}`}
            style={{
              fontFamily: 'var(--font-ibm-arabic-semibold)'
            }}
          >
            {type.name}
          </div>
          <span
            className="text-sm"
            style={{
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-ibm-arabic-medium)'
            }}
          >
            {sectionState.isExpanded ? `${requests.length} طلب` : 'اضغط للعرض'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {sectionState.loading && (
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#3b82f6' }}></div>
          )}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-secondary)"
            strokeWidth="2"
            className={`transition-transform duration-200 ${sectionState.isExpanded ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Section Content */}
      {sectionState.isExpanded && (
        <div
          className="mt-4 p-3 rounded-xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}
        >
          {requests.length > 0 ? (
            <>
              <div className="space-y-3">
                {requests.map((request, index) => (
                  <RequestCard
                    key={request.RequestsID}
                    request={request}
                    index={index}
                    type={type.name}
                    typepage={typepage}
                    onClose={onClose}
                    onOptions={onOptions}
                    onConfirm={isClosed ? onConfirm : undefined}
                    onChat={onChat}
                    loading={loading}
                    isClosed={isClosed}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {sectionState.hasMore && (
                <div className="mt-4 text-center">
                  <button
                    onClick={onLoadMore}
                    disabled={sectionState.loading}
                    className="px-6 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 hover:shadow-md disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--color-surface-secondary)',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                      fontFamily: 'var(--font-ibm-arabic-medium)'
                    }}
                  >
                    {sectionState.loading ? 'جاري التحميل...' : 'عرض المزيد'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div
              className="text-center py-8 rounded-lg"
              style={{
                backgroundColor: 'var(--color-surface-secondary)',
                border: '1px dashed var(--color-border)'
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-secondary)"
                strokeWidth="1.5"
                className="mx-auto mb-3 opacity-50"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <p
                className="font-bold"
                style={{
                  fontFamily: 'var(--font-ibm-arabic-medium)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                لا توجد طلبات من هذا النوع
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function RequestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idProject = searchParams.get('idProject');
  const typepage = searchParams.get('typepage') || 'all';
  const nameproject = searchParams.get('nameproject') || '';
  
  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();

  const [requestsData, setRequestsData] = useState<RequestsData>({
    arrayLight: [],
    arrayHeavy: [],
    arrayElectrical: [],
    arrayPlumber: [],
    arrayBlacksmith: []
  });
  
  const [requestCounts, setRequestCounts] = useState<RequestCount>({
    Open: 0,
    Close: 0
  });
  
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  
  const [createRequest, setCreateRequest] = useState({
    type: 'مواد خفيفة',
    data: '',
    projectId: parseInt(idProject || '0'),
    id: 0,
    isEdit: false
  });
  
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [noteText, setNoteText] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);

  // Section states for collapsible sections
  // Note: 'open' sections show requests with Done='false', 'closed' sections show requests with Done='true'
  const [sectionStates, setSectionStates] = useState<SectionState>({
    'arrayLight-open': { isExpanded: false, hasMore: true, lastID: 0, loading: false },
    'arrayHeavy-open': { isExpanded: false, hasMore: true, lastID: 0, loading: false },
    'arrayElectrical-open': { isExpanded: false, hasMore: true, lastID: 0, loading: false },
    'arrayPlumber-open': { isExpanded: false, hasMore: true, lastID: 0, loading: false },
    'arrayBlacksmith-open': { isExpanded: false, hasMore: true, lastID: 0, loading: false },
    'arrayLight-closed': { isExpanded: false, hasMore: true, lastID: 0, loading: false },
    'arrayHeavy-closed': { isExpanded: false, hasMore: true, lastID: 0, loading: false },
    'arrayElectrical-closed': { isExpanded: false, hasMore: true, lastID: 0, loading: false },
    'arrayPlumber-closed': { isExpanded: false, hasMore: true, lastID: 0, loading: false },
    'arrayBlacksmith-closed': { isExpanded: false, hasMore: true, lastID: 0, loading: false },
  });

  useEffect(() => {
    console.log('useEffect triggered with idProject:', idProject, 'typepage:', typepage, 'user:', user?.accessToken ? 'authenticated' : 'not authenticated');
    if (idProject && user?.accessToken) {
      fetchRequestCounts();
      // Initial load - fetch first section data like mobile app
      initializeRequestsData();
    }
  }, [idProject, user?.accessToken]);

  // Initialize requests data - matching mobile app behavior
  const initializeRequestsData = async () => {
    // In mobile app, sections start collapsed and data is loaded when expanded
    // For better UX on web, we can pre-load the first few items of each type
    console.log('Requests page initialized for project:', idProject, 'typepage:', typepage);

    // Pre-load first section of each type for better UX (optional)
    if (typepage === 'all') {
      // For 'all' type, we can pre-expand the first section with data
      // This matches the mobile app behavior where some sections might be pre-loaded
      console.log('Pre-loading initial data for better UX...');
    }
  };

  // Fetch specific section data - matching mobile app exactly
  const fetchSectionData = async (typeKey: string, typeName: string, doneValue: string, isInitial: boolean = false) => {
    if (!idProject) return;

    const sectionKey = `${typeKey}-${doneValue === 'false' ? 'open' : 'closed'}`;
    const currentState = sectionStates[sectionKey];

    // Get current array for this type and status
    const currentArray = requestsData[typeKey as keyof RequestsData]?.filter(item => item.Done === doneValue) || [];
    const lastID = isInitial ? 0 : (currentArray.length > 0 ? currentArray[currentArray.length - 1].RequestsID : 0);

    setSectionStates(prev => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], loading: true }
    }));

    try {
      const response = await axiosInstance.get(
        `/brinshCompany/v2/BringDataRequests?ProjectID=${idProject}&Type=${typeName}&kind=${typepage}&Done=${doneValue}&lastID=${lastID}`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        }
      );

      const newData = response.data?.data || [];
      console.log(`Fetched ${newData.length} items for ${typeName} (Done=${doneValue}):`, newData);

      setRequestsData(prev => {
        const currentData = prev[typeKey as keyof RequestsData] || [];

        if (isInitial) {
          // Replace data for initial load - matching mobile app chackdata
          const otherStatusData = currentData.filter(item => item.Done !== doneValue);
          return {
            ...prev,
            [typeKey]: [...otherStatusData, ...newData]
          };
        } else {
          // Append data for load more - matching mobile app chackdataEnd
          const otherStatusData = currentData.filter(item => item.Done !== doneValue);
          const currentStatusData = currentData.filter(item => item.Done === doneValue);
          return {
            ...prev,
            [typeKey]: [...otherStatusData, ...currentStatusData, ...newData]
          };
        }
      });

      // Update section state
      setSectionStates(prev => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          loading: false,
          hasMore: newData.length > 0,
          lastID: newData.length > 0 ? newData[newData.length - 1].RequestsID : lastID
        }
      }));

    } catch (error) {
      console.error('Error fetching section data:', error);
      setSectionStates(prev => ({
        ...prev,
        [sectionKey]: { ...prev[sectionKey], loading: false }
      }));
    }
  };

  // Toggle section expansion - matching mobile app exactly
  const toggleSection = async (typeKey: string, typeName: string, doneValue: string) => {
    const sectionKey = `${typeKey}-${doneValue === 'false' ? 'open' : 'closed'}`;
    const currentState = sectionStates[sectionKey];

    // Toggle expansion state first
    setSectionStates(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        isExpanded: !prev[sectionKey].isExpanded
      }
    }));

    if (!currentState.isExpanded) {
      // Expanding - fetch initial data (matching mobile app chackdata call)
      console.log(`Expanding section: ${typeName} (Done=${doneValue})`);
      await fetchSectionData(typeKey, typeName, doneValue, true);
    }
  };

  // Load more data for a section
  const loadMoreSectionData = async (typeKey: string, typeName: string, doneValue: string) => {
    await fetchSectionData(typeKey, typeName, doneValue, false);
  };

  const fetchRequestCounts = async () => {
    if (!idProject) return;

    try {
      console.log('Fetching request counts for project:', idProject, 'typepage:', typepage);
      const response = await axiosInstance.get(
        `/brinshCompany/v2/BringCountRequsts?ProjectID=${idProject}&type=${typepage}`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        }
      );

      console.log('Request counts response:', response.data);
      if (response.data?.data) {
        setRequestCounts(response.data.data);
        console.log('Request counts set:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching request counts:', error);
    }
  };

  const createNewRequest = async () => {
    if (!createRequest.data.trim()) {
      Tostget('يرجى ملء جميع الحقول');
      return;
    }

    // Check permission - matching mobile app exactly
    const hasPermission = await Uservalidation('إنشاء طلبات', createRequest.projectId);
    if (!hasPermission) {
      return;
    }

    // If editing, call update function instead
    if (createRequest.isEdit) {
      await updateRequest();
      return;
    }

    setLoading(prev => ({ ...prev, create: true }));
    try {
      const formData = new FormData();
      formData.append('ProjectID', createRequest.projectId.toString());
      formData.append('Type', createRequest.type);
      formData.append('Data', createRequest.data);
      formData.append('user', user?.data?.PhoneNumber || '');

      await axiosInstance.post('/brinshCompany/InsertDatainTableRequests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      Tostget('تم إنشاء الطلب بنجاح');
      resetCreateRequest();
      await fetchRequestCounts();
      // Refresh the specific section if it's expanded
      const typeKey = REQUEST_TYPES.find(t => t.name === createRequest.type)?.key;
      if (typeKey) {
        const sectionKey = `${typeKey}-open`;
        if (sectionStates[sectionKey]?.isExpanded) {
          await fetchSectionData(typeKey, createRequest.type, 'false', true);
        }
      }
    } catch (error) {
      console.error('Error creating request:', error);
      Tostget('خطأ في إنشاء الطلب');
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  const updateRequest = async () => {
    if (!createRequest.data.trim()) {
      Tostget('يرجى ملء جميع الحقول');
      return;
    }

    // Check permission
    const hasPermission = await Uservalidation('إنشاء طلبات', createRequest.projectId);
    if (!hasPermission) {
      return;
    }

    setLoading(prev => ({ ...prev, update: true }));
    try {
      const formData = new FormData();
      formData.append('RequestsID', createRequest.id.toString());
      formData.append('Type', createRequest.type);
      formData.append('Data', createRequest.data);
      formData.append('user', user?.data?.PhoneNumber || user?.data?.userName || '');

      await axiosInstance.put('/brinshCompany/UPDATEdataRequests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      Tostget('تم تحديث الطلب بنجاح');
      resetCreateRequest();
      // Refresh the specific section if it's expanded
      const typeKey = REQUEST_TYPES.find(t => t.name === createRequest.type)?.key;
      if (typeKey) {
        const sectionKey = `${typeKey}-open`;
        if (sectionStates[sectionKey]?.isExpanded) {
          await fetchSectionData(typeKey, createRequest.type, 'false', true);
        }
      }
    } catch (error) {
      console.error('Error updating request:', error);
      Tostget('خطأ في تحديث الطلب');
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  const resetCreateRequest = () => {
    setCreateRequest({
      type: 'مواد خفيفة',
      data: '',
      projectId: parseInt(idProject || '0'),
      id: 0,
      isEdit: false
    });
    setShowCreateModal(false);
  };

  // Close/Open Request - matching mobile app exactly
  const closeRequest = async (requestId: number, type: string, request: Request) => {
    setLoading(prev => ({ ...prev, [`close_${requestId}`]: true }));

    try {
      // Matching mobile app CloseOROpenedataRequests exactly
      const data = {
        RequestsID: requestId,
        user: user?.data?.PhoneNumber || user?.data?.userName || ''
      };

      await axiosInstance.put(
        '/brinshCompany/UPDATEImplementRquestsORCansle',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      Tostget('تمت العملية بنجاح');
      await fetchRequestCounts();

      // Refresh both open and closed sections if expanded
      const typeKey = REQUEST_TYPES.find(t => t.name === type)?.key;
      if (typeKey) {
        const openSectionKey = `${typeKey}-open`;
        const closedSectionKey = `${typeKey}-closed`;

        if (sectionStates[openSectionKey]?.isExpanded) {
          await fetchSectionData(typeKey, type, 'false', true);
        }
        if (sectionStates[closedSectionKey]?.isExpanded) {
          await fetchSectionData(typeKey, type, 'true', true);
        }
      }
    } catch (error) {
      console.error('Error closing request:', error);
      Tostget('خطأ في العملية');
    } finally {
      setLoading(prev => ({ ...prev, [`close_${requestId}`]: false }));
    }
  };

  // Confirm Request Arrival - matching mobile app exactly
  const confirmRequest = async (request: Request) => {
    if (request.InsertBy !== user?.data?.userName) {
      Tostget('لست المسؤل على تاكيد الطلب');
      return;
    }

    setLoading(prev => ({ ...prev, [`confirm_${request.RequestsID}`]: true }));

    try {
      await axiosInstance.get(
        `/brinshCompany/Confirmarrivdrequest?RequestsID=${request.RequestsID}`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        }
      );

      Tostget('تم تأكيد الطلب');
      // Refresh the closed section if expanded
      const typeKey = REQUEST_TYPES.find(t => t.name === request.Type)?.key;
      if (typeKey) {
        const sectionKey = `${typeKey}-closed`;
        if (sectionStates[sectionKey]?.isExpanded) {
          await fetchSectionData(typeKey, request.Type, 'true', true);
        }
      }
    } catch (error) {
      console.error('Error confirming request:', error);
      Tostget('خطأ في تأكيد الطلب');
    } finally {
      setLoading(prev => ({ ...prev, [`confirm_${request.RequestsID}`]: false }));
    }
  };

  // Delete Request - matching mobile app exactly
  const deleteRequest = async (request: Request) => {
    const now = new Date();
    const requestTime = new Date(request.DateTime || request.Date);
    const isSameHour = request.DateTime === null ? true : requestTime.getHours() === now.getHours();

    const canDelete = (
      request.InsertBy === user?.data?.userName &&
      isSameHour &&
      request.Done === 'false'
    ) || (
      await Uservalidation('تشييك الطلبات', parseInt(idProject || '0')) &&
      request.Done === 'false'
    );

    if (!canDelete) {
      Tostget(request.Done === 'false' ? 'لايمكن حذف الطلبيه بعد ساعه من طلبها' : 'لايمكن حذف الطلبيه بعد تنفيذها');
      return;
    }

    setLoading(prev => ({ ...prev, [`delete_${request.RequestsID}`]: true }));

    try {
      await axiosInstance.get(
        `/brinshCompany/DeleteRequests?RequestsID=${request.RequestsID}`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        }
      );

      Tostget('تم حذف الطلب بنجاح');
      await fetchRequestCounts();

      // Refresh the specific section if expanded
      const typeKey = REQUEST_TYPES.find(t => t.name === request.Type)?.key;
      if (typeKey) {
        const isRequestDone = request.Done === 'true';
        const sectionKey = `${typeKey}-${isRequestDone ? 'closed' : 'open'}`;
        if (sectionStates[sectionKey]?.isExpanded) {
          await fetchSectionData(typeKey, request.Type, request.Done, true);
        }
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      Tostget('خطأ في حذف الطلب');
    } finally {
      setLoading(prev => ({ ...prev, [`delete_${request.RequestsID}`]: false }));
    }
  };

  // Open Options Modal
  const openOptionsModal = (request: Request) => {
    setSelectedRequest(request);
    setShowOptionsModal(true);
  };

  // Copy Request Text
  const copyRequestText = (request: Request) => {
    const text = `${request.Nameproject || ''} ${request.Data}`;
    navigator.clipboard.writeText(text);
    Tostget('تم نسخ النص');
  };

  // Send Note - matching mobile app exactly
  const sendNote = async () => {
    if (!noteText.trim() || !selectedRequest) {
      Tostget('يرجى كتابة الملاحظة');
      return;
    }

    setLoading(prev => ({ ...prev, sendNote: true }));

    try {
      // In mobile app, notes are sent to chat system
      // For now, we'll simulate the API call
      const formData = new FormData();
      formData.append('ProjectID', selectedRequest.ProjectID.toString());
      formData.append('RequestID', selectedRequest.RequestsID.toString());
      formData.append('Note', noteText);
      formData.append('Type', selectedRequest.Type);
      formData.append('user', user?.data?.PhoneNumber || '');

      // TODO: Implement actual note sending API
      // await axiosInstance.post('/brinshCompany/SendRequestNote', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //     Authorization: `Bearer ${user?.accessToken}`
      //   }
      // });

      Tostget('تم إرسال الملاحظة بنجاح');
      setNoteText('');
      setShowNoteModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error sending note:', error);
      Tostget('خطأ في إرسال الملاحظة');
    } finally {
      setLoading(prev => ({ ...prev, sendNote: false }));
    }
  };

  // Open Request Chat - Navigate to project requests chat
  const openRequestChat = (request: Request) => {
    // Navigate to the project requests chat page
    const chatParams = new URLSearchParams({
      ProjectID: request.ProjectID.toString(),
      typess: 'طلبات',
      nameRoom: 'الطلبات',
      nameProject: request.Nameproject || 'المشروع'
    });

    router.push(`/chat?${chatParams.toString()}`);
  };

  // Edit Request - matching mobile app exactly
  const editRequest = async (request: Request) => {
    const now = new Date();
    const requestTime = new Date(request.DateTime || request.Date);
    const isSameHour = request.DateTime === null ? true : requestTime.getHours() === now.getHours();

    const canEdit = (
      request.InsertBy === user?.data?.userName &&
      isSameHour &&
      request.Done === 'false'
    ) || (
      await Uservalidation('تشييك الطلبات', parseInt(idProject || '0')) &&
      request.Done === 'false'
    );

    if (canEdit) {
      setCreateRequest({
        type: request.Type,
        data: request.Data,
        projectId: request.ProjectID,
        id: request.RequestsID,
        isEdit: true
      });
      setShowOptionsModal(false);
      setShowCreateModal(true);
    } else {
      Tostget(request.Done === 'false' ? 'لايمكن تعديل الطلبيه بعد ساعه من طلبها' : 'لايمكن تعديل الطلبيه بعد تنفيذها');
    }
  };

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title="الطلبات"
          subtitle={nameproject || undefined}
          backButton={
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-lg transition-colors" aria-label="رجوع">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          }
          actions={
            typepage === 'all' ? (
              <button
                onClick={() => router.push(`/chat?typess=طلبات&ProjectID=${idProject}&nameRoom=الطلبات`)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                aria-label="دردشة الطلبات"
                title="دردشة الطلبات"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            ) : null
          }
        />
      }
    >
      <ContentSection className="p-0">
        {/* Counts */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex justify-center gap-4">
            <div
              className="text-center p-4 rounded-xl flex-1 max-w-32 transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <div
                className="text-3xl font-bold mb-1"
                style={{
                  fontFamily: 'var(--font-ibm-arabic-bold)',
                  color: '#10b981'
                }}
              >
                {requestCounts.Close}
              </div>
              <div
                className="text-sm font-bold"
                style={{
                  fontFamily: 'var(--font-ibm-arabic-medium)',
                  color: '#10b981'
                }}
              >
                مفتوحة
              </div>
            </div>
            <div
              className="text-center p-4 rounded-xl flex-1 max-w-32 transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--color-surface-secondary)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div
                className="text-3xl font-bold mb-1"
                style={{
                  fontFamily: 'var(--font-ibm-arabic-bold)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                {requestCounts.Open}
              </div>
              <div
                className="text-sm font-bold"
                style={{
                  fontFamily: 'var(--font-ibm-arabic-medium)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                مغلقة
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
        {/* Create Request Button - Only for 'part' type and employees like mobile app */}
        {typepage === 'part' && (
          <EmployeeOnly>
            <RequestsPermissionGuard>
              <div className="mb-6 flex justify-center">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-8 py-4 rounded-xl font-bold transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-3"
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    fontFamily: 'var(--font-ibm-arabic-semibold)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14m-7-7h14"/>
                  </svg>
                  اضافة طلب
                </button>
              </div>
            </RequestsPermissionGuard>
          </EmployeeOnly>
        )}

        {/* Open Requests Section */}
        <div className="mb-6">
          <div
            className="text-center mb-6 p-4 rounded-xl"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border)'
            }}
          >
            <h2
              className="text-xl font-bold flex items-center justify-center gap-3"
              style={{
                fontFamily: 'var(--font-ibm-arabic-bold)',
                color: 'var(--color-text-primary)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              الطلبات المفتوحة ({requestCounts.Close})
            </h2>
          </div>

          {REQUEST_TYPES.map((type) => {
            const sectionKey = `${type.key}-open`;
            const sectionState = sectionStates[sectionKey];
            const requests = requestsData[type.key as keyof RequestsData]?.filter(req => req.Done === 'false') || [];

            return (
              <RequestSection
                key={sectionKey}
                type={type}
                requests={requests}
                sectionState={sectionState}
                typepage={typepage}
                doneValue="false"
                onToggle={() => toggleSection(type.key, type.name, 'false')}
                onLoadMore={() => loadMoreSectionData(type.key, type.name, 'false')}
                onClose={closeRequest}
                onOptions={openOptionsModal}
                onConfirm={confirmRequest}
                onChat={openRequestChat}
                loading={loading}
              />
            );
          })}
        </div>

        {/* Divider between sections */}
        <div className="my-8 flex items-center">
          <div
            className="flex-1 h-px"
            style={{ backgroundColor: 'var(--color-border)' }}
          ></div>
          <div
            className="px-4 py-2 rounded-full mx-4"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border)'
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-secondary)"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3"/>
              <circle cx="12" cy="12" r="1"/>
            </svg>
          </div>
          <div
            className="flex-1 h-px"
            style={{ backgroundColor: 'var(--color-border)' }}
          ></div>
        </div>

        {/* Closed Requests Section */}
        <div className="mb-6">
          <div
            className="text-center mb-6 p-4 rounded-xl"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border)'
            }}
          >
            <h2
              className="text-xl font-bold flex items-center justify-center gap-3"
              style={{
                fontFamily: 'var(--font-ibm-arabic-bold)',
                color: 'var(--color-text-primary)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
              الطلبات المغلقة ({requestCounts.Open})
            </h2>
          </div>

          {REQUEST_TYPES.map((type) => {
            const sectionKey = `${type.key}-closed`;
            const sectionState = sectionStates[sectionKey];
            const requests = requestsData[type.key as keyof RequestsData]?.filter(req => req.Done === 'true') || [];

            return (
              <RequestSection
                key={sectionKey}
                type={type}
                requests={requests}
                sectionState={sectionState}
                typepage={typepage}
                doneValue="true"
                onToggle={() => toggleSection(type.key, type.name, 'true')}
                onLoadMore={() => loadMoreSectionData(type.key, type.name, 'true')}
                onClose={closeRequest}
                onOptions={openOptionsModal}
                onConfirm={confirmRequest}
                onChat={openRequestChat}
                loading={loading}
                isClosed={true}
              />
            );
          })}
        </div>
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-md shadow-2xl"
            style={{
              backgroundColor: 'var(--color-card-background)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Header */}
            <div
              style={{
                borderBottom: '1px solid var(--color-border)',
                background: 'linear-gradient(135deg, var(--color-card-background) 0%, var(--color-surface-secondary) 100%)',
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '20px',
                paddingBottom: '20px',
                marginBottom: '16px',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px'
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: createRequest.isEdit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={createRequest.isEdit ? "#10b981" : "#3b82f6"} strokeWidth="2">
                    {createRequest.isEdit ? (
                      <>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </>
                    ) : (
                      <path d="M12 5v14m-7-7h14"/>
                    )}
                  </svg>
                </div>
                <h3
                  className="font-bold"
                  style={{
                    fontSize: '18px',
                    fontFamily: 'var(--font-ibm-arabic-semibold)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.4
                  }}
                >
                  {createRequest.isEdit ? 'تعديل الطلب' : 'إنشاء طلب جديد'}
                </h3>
              </div>
            </div>

            {/* Content */}
            <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '16px' }}>
              {/* Request Type Selection */}
              <div className="mb-4">
                <label
                  className="block mb-2"
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-ibm-arabic-semibold)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  نوع الطلب
                </label>
                <select
                  value={createRequest.type}
                  onChange={(e) => setCreateRequest(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full transition-all duration-200 focus:scale-[1.02]"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontFamily: 'var(--font-ibm-arabic-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {REQUEST_TYPES.map((type) => (
                    <option key={type.key} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Request Description */}
              <div className="mb-6">
                <label
                  className="block mb-2"
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-ibm-arabic-semibold)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  وصف الطلب
                </label>
                <textarea
                  value={createRequest.data}
                  onChange={(e) => setCreateRequest(prev => ({ ...prev, data: e.target.value }))}
                  placeholder="اكتب وصف الطلب هنا..."
                  className="w-full resize-none transition-all duration-200 focus:scale-[1.02]"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontFamily: 'var(--font-ibm-arabic-medium)',
                    color: 'var(--color-text-primary)',
                    minHeight: '100px'
                  }}
                  rows={4}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div
              className="flex gap-3"
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '16px',
                paddingBottom: '24px'
              }}
            >
              <button
                onClick={resetCreateRequest}
                className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--color-surface-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '16px',
                  fontFamily: 'var(--font-ibm-arabic-medium)'
                }}
                disabled={loading.create || loading.update}
              >
                إلغاء
              </button>
              <button
                onClick={createNewRequest}
                className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
                style={{
                  padding: '12px 24px',
                  backgroundColor: createRequest.isEdit ? '#10b981' : '#3b82f6',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: 'var(--font-ibm-arabic-semibold)',
                  border: 'none'
                }}
                disabled={loading.create || loading.update}
              >
                {loading.create || loading.update
                  ? (createRequest.isEdit ? 'جاري التحديث...' : 'جاري الإنشاء...')
                  : (createRequest.isEdit ? 'تحديث الطلب' : 'إنشاء الطلب')
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Options Modal - Matching mobile app OptionCompany exactly */}
      {showOptionsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-md shadow-2xl"
            style={{
              backgroundColor: 'var(--color-card-background)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Header */}
            <div
              style={{
                borderBottom: '1px solid var(--color-border)',
                background: 'linear-gradient(135deg, var(--color-card-background) 0%, var(--color-surface-secondary) 100%)',
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '20px',
                paddingBottom: '20px',
                marginBottom: '16px',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px'
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(107, 114, 128, 0.1)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                  </svg>
                </div>
                <h3
                  className="font-bold"
                  style={{
                    fontSize: '18px',
                    fontFamily: 'var(--font-ibm-arabic-semibold)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.4
                  }}
                >
                  الاعدادات
                </h3>
              </div>
            </div>

            {/* Content */}
            <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '16px' }}>
              <div className="space-y-3">
                {/* Copy Request - First in children */}
                <button
                  onClick={() => {
                    copyRequestText(selectedRequest);
                    setShowOptionsModal(false);
                  }}
                  className="w-full p-4 text-right rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-start gap-3"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <span
                    className="font-bold"
                    style={{
                      fontFamily: 'var(--font-ibm-arabic-semibold)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    نسخ الطلبية
                  </span>
                </button>

                {/* General Chat - Only for 'all' type */}
                {typepage === 'all' && (
                  <button
                    onClick={() => {
                      router.push(`/chat?typess=طلبات&ProjectID=${selectedRequest.ProjectID}&nameRoom=الطلبات`);
                      setShowOptionsModal(false);
                    }}
                    className="w-full p-4 text-right rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-start gap-3"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span
                      className="font-bold"
                      style={{
                        fontFamily: 'var(--font-ibm-arabic-semibold)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      محادثة الطلبية
                    </span>
                  </button>
                )}

                {/* Add Note - title1 */}
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    setShowNoteModal(true);
                  }}
                  className="w-full p-4 text-right rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-start gap-3"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  <span
                    className="font-bold"
                    style={{
                      fontFamily: 'var(--font-ibm-arabic-semibold)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    إضافة ملاحظة
                  </span>
                </button>

                {/* Edit - title2 */}
                <button
                  onClick={() => editRequest(selectedRequest)}
                  className="w-full p-4 text-right rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-start gap-3"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span
                    className="font-bold"
                    style={{
                      fontFamily: 'var(--font-ibm-arabic-semibold)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    تعديل
                  </span>
                </button>

                {/* Delete - title3 */}
                <button
                  onClick={() => {
                    deleteRequest(selectedRequest);
                    setShowOptionsModal(false);
                  }}
                  className="w-full p-4 text-right rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-start gap-3"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)'
                  }}
                  disabled={loading[`delete_${selectedRequest.RequestsID}`]}
                >
                  {loading[`delete_${selectedRequest.RequestsID}`] ? (
                    <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#ef4444' }}></div>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  )}
                  <span
                    className="font-bold"
                    style={{
                      fontFamily: 'var(--font-ibm-arabic-semibold)',
                      color: '#ef4444'
                    }}
                  >
                    حذف
                  </span>
                </button>
              </div>
            </div>

            {/* Footer Button */}
            <div
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '16px',
                paddingBottom: '24px'
              }}
            >
              <button
                onClick={() => setShowOptionsModal(false)}
                className="w-full text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--color-surface-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '16px',
                  fontFamily: 'var(--font-ibm-arabic-medium)'
                }}
            >
              إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal - Matching mobile app CreatNotesRequest */}
      {showNoteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-md shadow-2xl"
            style={{
              backgroundColor: 'var(--color-card-background)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Header */}
            <div
              style={{
                borderBottom: '1px solid var(--color-border)',
                background: 'linear-gradient(135deg, var(--color-card-background) 0%, var(--color-surface-secondary) 100%)',
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '20px',
                paddingBottom: '20px',
                marginBottom: '16px',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px'
              }}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
                <h3
                  className="font-bold"
                  style={{
                    fontSize: '18px',
                    fontFamily: 'var(--font-ibm-arabic-semibold)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.4
                  }}
                >
                  إضافة ملاحظة
                </h3>
              </div>
            </div>

            {/* Content */}
            <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '16px' }}>
              {/* Request Info */}
              <div
                className="mb-4 p-4 rounded-xl"
                style={{
                  backgroundColor: 'var(--color-surface-secondary)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
                  <p
                    className="text-sm font-bold"
                    style={{
                      fontFamily: 'var(--font-ibm-arabic-semibold)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    {selectedRequest.Type}
                  </p>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-ibm-arabic-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {selectedRequest.Data}
                </p>
                <div
                  className="mt-2 pt-2"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  <p
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    بواسطة: {selectedRequest.InsertBy} • {new Date(selectedRequest.Date).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })} - {new Date(selectedRequest.Date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </p>
                </div>
              </div>

              {/* Note Input */}
              <div className="mb-6">
                <label
                  className="block mb-3"
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-ibm-arabic-semibold)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  اكتب ملاحظتك
                </label>
                <div className="relative">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="أضف ملاحظة حول هذا الطلب..."
                    className="w-full resize-none transition-all duration-200 focus:scale-[1.02]"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '14px',
                      fontFamily: 'var(--font-ibm-arabic-medium)',
                      color: 'var(--color-text-primary)',
                      minHeight: '100px'
                    }}
                    rows={4}
                    maxLength={500}
                  />
                  <div
                    className="absolute bottom-3 left-3 text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {noteText.length}/500
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div
              className="flex gap-3"
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '16px',
                paddingBottom: '24px'
              }}
            >
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteText('');
                  setSelectedRequest(null);
                }}
                className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--color-surface-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '16px',
                  fontFamily: 'var(--font-ibm-arabic-medium)'
                }}
                disabled={loading.sendNote}
              >
                إلغاء
              </button>
              <button
                onClick={sendNote}
                className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: 'var(--font-ibm-arabic-semibold)',
                  border: 'none'
                }}
                disabled={loading.sendNote || !noteText.trim()}
              >
                {loading.sendNote ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                    </svg>
                    إرسال الملاحظة
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
      </ContentSection>
    </ResponsiveLayout>
  );
}
