'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import useValidityUser from '@/hooks/useValidityUser';

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

// Types
interface Request {
  RequestsID: number;
  Type: string;
  Data: string;
  Date: string;
  DateTime: string | null;
  Done: string;
  InsertBy: string;
  ProjectID: number;
  checkorderout: string;
  Nameproject?: string;
}

interface RequestCounts {
  Close: number; // Open requests (Done='false')
  Open: number;  // Closed requests (Done='true')
}

const REQUEST_TYPES = [
  { key: 'light', name: 'مواد خفيفة', icon: '📦', color: 'bg-blue-500' },
  { key: 'heavy', name: 'مواد ثقيلة', icon: '🏗️', color: 'bg-orange-500' },
  { key: 'plumber', name: 'سباك', icon: '🔧', color: 'bg-green-500' },
  { key: 'electrical', name: 'كهربائي', icon: '⚡', color: 'bg-yellow-500' },
  { key: 'blacksmith', name: 'حداد', icon: '🔨', color: 'bg-red-500' },
];

export default function ProjectRequestsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const projectId = parseInt(params.id as string);
  const projectName = searchParams.get('projectName') || 'المشروع';

  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();

  const [requestCounts, setRequestCounts] = useState<RequestCounts>({ Close: 0, Open: 0 });
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [sectionStates, setSectionStates] = useState<{ [key: string]: { isExpanded: boolean; requests: Request[]; lastID: number; hasMore: boolean } }>({});
  const [exportingPDF, setExportingPDF] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  // Form data
  const [selectedType, setSelectedType] = useState('مواد خفيفة');
  const [requestData, setRequestData] = useState('');
  const [noteText, setNoteText] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // Edit form data
  const [editType, setEditType] = useState('مواد خفيفة');
  const [editData, setEditData] = useState('');

  useEffect(() => {
    fetchRequestCounts();
    initializeSections();
  }, [projectId]);

  const initializeSections = () => {
    const initialStates: { [key: string]: { isExpanded: boolean; requests: Request[]; lastID: number; hasMore: boolean } } = {};

    REQUEST_TYPES.forEach(type => {
      initialStates[`${type.key}-open`] = { isExpanded: false, requests: [], lastID: 0, hasMore: true };
      initialStates[`${type.key}-closed`] = { isExpanded: false, requests: [], lastID: 0, hasMore: true };
    });

    setSectionStates(initialStates);
  };

  const fetchRequestCounts = async () => {
    try {
      const response = await axiosInstance.get(
        `/brinshCompany/v2/BringCountRequsts?ProjectID=${projectId}&kind=part`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        }
      );

      if (response.data?.data) {
        setRequestCounts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching request counts:', error);
    }
  };

  // Export Requests Report as PDF - Matching mobile app
  const exportRequestsPDF = async () => {
    if (!projectId) {
      Tostget('معرف المشروع غير صحيح');
      return;
    }

    // Get typepage from URL params or default to 'part'
    const typepage = searchParams.get('typepage') || 'part';

    setExportingPDF(true);
    try {
      const response = await axiosInstance.get(
        `brinshCompany/BringreportRequessts?id=${projectId}&type=${typepage}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.accessToken}`
          }
        }
      );

      if (response.status === 200 && response.data?.namefile) {
        const baseUrl = process.env.NEXT_PUBLIC_FILE_URL || 'https://mushrf.net';
        window.open(`${baseUrl}/${response.data.namefile}`, '_blank');
        Tostget('تم إنشاء التقرير بنجاح');
      } else {
        Tostget(response.data?.success || 'فشل في إنشاء التقرير');
      }
    } catch (error: any) {
      console.error('Error exporting requests PDF:', error);
      Tostget(error.response?.data?.success || 'خطأ في تصدير التقرير');
    } finally {
      setExportingPDF(false);
    }
  };

  const fetchSectionData = async (typeKey: string, typeName: string, doneValue: string, isInitial = false) => {
    const sectionKey = `${typeKey}-${doneValue === 'false' ? 'open' : 'closed'}`;
    const currentSection = sectionStates[sectionKey];

    if (!currentSection?.hasMore && !isInitial) return;

    const lastID = isInitial ? 0 : currentSection?.lastID || 0;

    setLoading(prev => ({ ...prev, [sectionKey]: true }));

    try {
      const response = await axiosInstance.get(
        `/brinshCompany/v2/BringDataRequests?ProjectID=${projectId}&Type=${typeName}&kind=part&Done=${doneValue}&lastID=${lastID}`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        }
      );

      if (response.data?.data) {
        const newRequests = response.data.data;
        const hasMore = newRequests.length === 10; // Assuming 10 is the page size

        setSectionStates(prev => ({
          ...prev,
          [sectionKey]: {
            ...prev[sectionKey],
            requests: isInitial ? newRequests : [...(prev[sectionKey]?.requests || []), ...newRequests],
            lastID: newRequests.length > 0 ? newRequests[newRequests.length - 1].RequestsID : lastID,
            hasMore
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching section data:', error);
      Tostget('خطأ في جلب البيانات');
    } finally {
      setLoading(prev => ({ ...prev, [sectionKey]: false }));
    }
  };

  const toggleSection = async (typeKey: string, typeName: string, doneValue: string) => {
    const sectionKey = `${typeKey}-${doneValue === 'false' ? 'open' : 'closed'}`;
    const currentSection = sectionStates[sectionKey];

    if (!currentSection?.isExpanded) {
      // Expanding section - fetch data if empty
      if (currentSection?.requests.length === 0) {
        await fetchSectionData(typeKey, typeName, doneValue, true);
      }
    }

    setSectionStates(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        isExpanded: !prev[sectionKey]?.isExpanded
      }
    }));
  };

  const loadMoreSectionData = async (typeKey: string, typeName: string, doneValue: string) => {
    await fetchSectionData(typeKey, typeName, doneValue, false);
  };

  const createRequest = async () => {
    if (!requestData.trim()) {
      Tostget('يرجى إدخال بيانات الطلب');
      return;
    }

    const hasPermission = await Uservalidation('إنشاء طلبات', projectId);
    if (!hasPermission) {
      return;
    }

    setLoading(prev => ({ ...prev, createRequest: true }));
    try {
      const formData = new FormData();
      formData.append('ProjectID', projectId.toString());
      formData.append('Type', selectedType);
      formData.append('Data', requestData);
      formData.append('user', user?.data?.PhoneNumber || user?.data?.userName || '');

      // Add images if any (like mobile app)
      selectedImages.forEach((image, index) => {
        formData.append('image', image);
      });

      await axiosInstance.post('/brinshCompany/InsertDatainTableRequests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      Tostget('تم إنشاء الطلب بنجاح');
      setShowCreateModal(false);
      setRequestData('');
      setSelectedType('مواد خفيفة');
      setSelectedImages([]);

      // Refresh counts and relevant section
      await fetchRequestCounts();
      const typeKey = REQUEST_TYPES.find(t => t.name === selectedType)?.key;
      if (typeKey) {
        const openSectionKey = `${typeKey}-open`;
        if (sectionStates[openSectionKey]?.isExpanded) {
          await fetchSectionData(typeKey, selectedType, 'false', true);
        }
      }
    } catch (error) {
      console.error('Error creating request:', error);
      Tostget('خطأ في إنشاء الطلب');
    } finally {
      setLoading(prev => ({ ...prev, createRequest: false }));
    }
  };

  const closeRequest = async (requestId: number, type: string, request: Request) => {
    setLoading(prev => ({ ...prev, [`close_${requestId}`]: true }));

    try {
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

  const copyRequestText = (request: Request) => {
    const text = `${request.Type}: ${request.Data}`;
    navigator.clipboard.writeText(text);
    Tostget('تم نسخ النص');
  };

  const sendNote = async () => {
    if (!noteText.trim() || !selectedRequest) {
      Tostget('يرجى كتابة الملاحظة');
      return;
    }

    setLoading(prev => ({ ...prev, sendNote: true }));

    try {
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

  const editRequest = async (request: Request) => {
    const now = new Date();
    const requestTime = new Date(request.DateTime || request.Date);
    const isSameHour = request.DateTime === null ? true : requestTime.getHours() === now.getHours();

    const canEdit = (
      request.InsertBy === user?.data?.userName &&
      isSameHour &&
      request.Done === 'false'
    ) || (
      await Uservalidation('تشييك الطلبات', projectId) &&
      request.Done === 'false'
    );

    if (canEdit) {
      setEditType(request.Type);
      setEditData(request.Data);
      setSelectedRequest(request);
      setShowOptionsModal(false);
      setShowEditModal(true);
    } else {
      Tostget(request.Done === 'false' ? 'لايمكن تعديل الطلبيه بعد ساعه من طلبها' : 'لايمكن تعديل الطلبيه بعد تنفيذها');
    }
  };

  const updateRequest = async () => {
    if (!editData.trim() || !selectedRequest) {
      Tostget('يرجى ملء جميع الحقول');
      return;
    }

    const hasPermission = await Uservalidation('إنشاء طلبات', projectId);
    if (!hasPermission) {
      return;
    }

    setLoading(prev => ({ ...prev, updateRequest: true }));
    try {
      const formData = new FormData();
      formData.append('RequestsID', selectedRequest.RequestsID.toString());
      formData.append('Type', editType);
      formData.append('Data', editData);
      formData.append('user', user?.data?.PhoneNumber || user?.data?.userName || '');

      await axiosInstance.put('/brinshCompany/UPDATEdataRequests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      Tostget('تم تعديل الطلب بنجاح');
      setShowEditModal(false);
      setEditData('');
      setEditType('مواد خفيفة');
      setSelectedRequest(null);

      // Refresh counts and relevant section
      await fetchRequestCounts();
      const typeKey = REQUEST_TYPES.find(t => t.name === editType)?.key;
      if (typeKey) {
        const openSectionKey = `${typeKey}-open`;
        if (sectionStates[openSectionKey]?.isExpanded) {
          await fetchSectionData(typeKey, editType, 'false', true);
        }
      }
    } catch (error) {
      console.error('Error updating request:', error);
      Tostget('خطأ في تعديل الطلب');
    } finally {
      setLoading(prev => ({ ...prev, updateRequest: false }));
    }
  };

  const deleteRequest = async (request: Request) => {
    const now = new Date();
    const requestTime = new Date(request.DateTime || request.Date);
    const isSameHour = request.DateTime === null ? true : requestTime.getHours() === now.getHours();

    const canDelete = (
      request.InsertBy === user?.data?.userName &&
      isSameHour &&
      request.Done === 'false'
    ) || (
      await Uservalidation('تشييك الطلبات', projectId) &&
      request.Done === 'false'
    );

    if (!canDelete) {
      Tostget(request.Done === 'false' ? 'لايمكن حذف الطلبيه بعد ساعه من طلبها' : 'لايمكن حذف الطلبيه بعد تنفيذها');
      return;
    }

    setLoading(prev => ({ ...prev, [`delete_${request.RequestsID}`]: true }));

    try {
      await axiosInstance.get(`/brinshCompany/DeleteRequests?RequestsID=${request.RequestsID}`, {
        headers: { Authorization: `Bearer ${user?.accessToken}` }
      });

      Tostget('تم حذف الطلب بنجاح');
      setShowOptionsModal(false);
      setSelectedRequest(null);

      // Refresh counts and relevant section
      await fetchRequestCounts();
      const typeKey = REQUEST_TYPES.find(t => t.name === request.Type)?.key;
      if (typeKey) {
        const openSectionKey = `${typeKey}-open`;
        if (sectionStates[openSectionKey]?.isExpanded) {
          await fetchSectionData(typeKey, request.Type, 'false', true);
        }
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      Tostget('خطأ في حذف الطلب');
    } finally {
      setLoading(prev => ({ ...prev, [`delete_${request.RequestsID}`]: false }));
    }
  };



  return (
    <ResponsiveLayout>
      <PageHeader
        title="الطلبات"
        subtitle={projectName}
        backButton={
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-lg transition-colors" aria-label="رجوع">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        }
        actions={
          <div className="flex items-center gap-2">
            {/* Project Requests Chat Button */}
            <button
              onClick={() => {
                const chatParams = new URLSearchParams({
                  ProjectID: projectId.toString(),
                  typess: 'طلبات',
                  nameRoom: 'الطلبات',
                  nameProject: projectName
                });
                router.push(`/chat?${chatParams.toString()}`);
              }}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              title="محادثة طلبات المشروع"
              aria-label="محادثة طلبات المشروع"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Create Request Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-0 text-blue-600 hover:underline font-ibm-arabic-semibold bg-transparent p-0"
              title="إضافة طلب جديد"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14m-7-7h14"/>
              </svg>
              إضافة طلب
            </button>

            {/* Export PDF Button - Matching mobile app */}
            <button
              onClick={exportRequestsPDF}
              disabled={exportingPDF}
              className="inline-flex items-center gap-2 text-red-600 hover:underline font-ibm-arabic-semibold bg-transparent p-0 disabled:opacity-50 disabled:cursor-not-allowed"
              title="تصدير PDF"
            >
              {exportingPDF ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              )}
              تصدير PDF
            </button>
          </div>
        }
      />


      {/* Content */}
      <ContentSection>

      <div className="p-4 space-y-6">
        {/* Open Requests */}
        <div>
          <h2 className="text-lg font-ibm-arabic-bold text-gray-900 mb-4 text-center">
            الطلبات المفتوحة
          </h2>

          {REQUEST_TYPES.map((type) => {
            const sectionKey = `${type.key}-open`;
            const section = sectionStates[sectionKey];

            return (
              <RequestSection
                key={sectionKey}
                type={type}
                section={section}
                doneValue="false"
                onToggle={() => toggleSection(type.key, type.name, 'false')}
                onLoadMore={() => loadMoreSectionData(type.key, type.name, 'false')}
                onRequestAction={closeRequest}
                onRequestOptions={(request) => {
                  setSelectedRequest(request);
                  setShowOptionsModal(true);
                }}
                loading={loading[sectionKey]}
                actionLoading={loading}
              />
            );
          })}
        </div>

        {/* Closed Requests */}
        <div>
          <h2 className="text-lg font-ibm-arabic-bold text-gray-900 mb-4 text-center">
            الطلبات المغلقة
          </h2>

          {REQUEST_TYPES.map((type) => {
            const sectionKey = `${type.key}-closed`;
            const section = sectionStates[sectionKey];

            return (
              <RequestSection
                key={sectionKey}
                type={type}
                section={section}
                doneValue="true"
                onToggle={() => toggleSection(type.key, type.name, 'true')}
                onLoadMore={() => loadMoreSectionData(type.key, type.name, 'true')}
                onRequestAction={closeRequest}
                onRequestOptions={(request) => {
                  setSelectedRequest(request);
                  setShowOptionsModal(true);
                }}
                loading={loading[sectionKey]}
                actionLoading={loading}
              />
            );
          })}
        </div>
      </div>
      </ContentSection>


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
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <path d="M12 5v14m-7-7h14"/>
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
                  إضافة طلب جديد
                </h3>
              </div>
            </div>

            {/* Content */}
            <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '16px' }}>
              <div className="space-y-4">
                {/* Request Type */}
                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontSize: '14px',
                      fontFamily: 'var(--font-ibm-arabic-medium)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    نوع الطلب
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full transition-all duration-200 focus:scale-[1.02]"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontFamily: 'var(--font-ibm-arabic-regular)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {REQUEST_TYPES.map((type) => (
                      <option key={type.key} value={type.name}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Request Data */}
                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontSize: '14px',
                      fontFamily: 'var(--font-ibm-arabic-medium)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    تفاصيل الطلب
                  </label>
                  <textarea
                    value={requestData}
                    onChange={(e) => setRequestData(e.target.value)}
                    placeholder="اكتب تفاصيل الطلب هنا..."
                    className="w-full transition-all duration-200 focus:scale-[1.02] resize-none"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontFamily: 'var(--font-ibm-arabic-regular)',
                      color: 'var(--color-text-primary)',
                      minHeight: '100px'
                    }}
                    rows={4}
                  />
                </div>

                {/* Images */}
                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontSize: '14px',
                      fontFamily: 'var(--font-ibm-arabic-medium)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    المرفقات (اختياري)
                  </label>
                  <div className="space-y-3">
                    {/* File Input */}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setSelectedImages(files);
                      }}
                      className="w-full transition-all duration-200 focus:scale-[1.02]"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontFamily: 'var(--font-ibm-arabic-regular)',
                        color: 'var(--color-text-primary)'
                      }}
                    />

                    {/* Selected Images Preview */}
                    {selectedImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                              style={{ border: '1px solid var(--color-border)' }}
                            />
                            <button
                              onClick={() => {
                                setSelectedImages(prev => prev.filter((_, i) => i !== index));
                              }}
                              className="absolute -top-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center text-xs transition-all duration-200 hover:scale-110"
                              style={{
                                backgroundColor: '#ef4444',
                                color: 'white'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                  setShowCreateModal(false);
                  setRequestData('');
                  setSelectedType('مواد خفيفة');
                  setSelectedImages([]);
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
                disabled={loading.createRequest}
              >
                إلغاء
              </button>
              <button
                onClick={createRequest}
                className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: 'var(--font-ibm-arabic-semibold)',
                  border: 'none'
                }}
                disabled={loading.createRequest}
              >
                {loading.createRequest ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء الطلب'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Options Modal */}
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
                {/* Add Note */}
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

                {/* Edit Request */}
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
                    تعديل بيانات الطلب
                  </span>
                </button>

                {/* Delete Request */}
                <button
                  onClick={() => deleteRequest(selectedRequest)}
                  className="w-full p-4 text-right rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-start gap-3"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)'
                  }}
                  disabled={loading[`delete_${selectedRequest?.RequestsID}`]}
                >
                  {loading[`delete_${selectedRequest?.RequestsID}`] ? (
                    <div className="w-5 h-5 border-2 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#ef4444' }}></div>
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
                    حذف الطلب
                  </span>
                </button>

                {/* Copy Request */}
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

                {/* General Chat */}
                <button
                  onClick={() => {
                    const chatParams = new URLSearchParams({
                      ProjectID: selectedRequest.ProjectID.toString(),
                      typess: 'طلبات',
                      nameRoom: 'الطلبات',
                      nameProject: selectedRequest.Nameproject || projectName
                    });
                    router.push(`/chat?${chatParams.toString()}`);
                    setShowOptionsModal(false);
                  }}
                  className="w-full p-4 text-right rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-start gap-3"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2">
                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"/>
                  </svg>
                  <span
                    className="font-bold"
                    style={{
                      fontFamily: 'var(--font-ibm-arabic-semibold)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    محادثة الطلبات
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

      {/* Note Modal */}
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

      {/* Edit Request Modal */}
      {showEditModal && selectedRequest && (
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
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
                  تعديل الطلب
                </h3>
              </div>
            </div>

            {/* Content */}
            <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingBottom: '16px' }}>
              {/* Current Request Info */}
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
                    الطلب الحالي
                  </p>
                </div>
                <p
                  className="text-sm"
                  style={{
                    fontFamily: 'var(--font-ibm-arabic-medium)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {selectedRequest.Type}: {selectedRequest.Data}
                </p>
              </div>

              {/* Edit Type */}
              <div className="mb-6">
                <label
                  className="block mb-3"
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-ibm-arabic-semibold)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  نوع الطلب
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
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
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Edit Data */}
              <div className="mb-6">
                <label
                  className="block mb-3"
                  style={{
                    fontSize: '14px',
                    fontFamily: 'var(--font-ibm-arabic-semibold)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  تفاصيل الطلب
                </label>
                <textarea
                  value={editData}
                  onChange={(e) => setEditData(e.target.value)}
                  placeholder="اكتب تفاصيل الطلب هنا..."
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
                onClick={() => {
                  setShowEditModal(false);
                  setEditData('');
                  setEditType('مواد خفيفة');
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
                disabled={loading.updateRequest}
              >
                إلغاء
              </button>
              <button
                onClick={updateRequest}
                className="flex-1 text-center rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  fontSize: '16px',
                  fontFamily: 'var(--font-ibm-arabic-semibold)',
                  border: 'none'
                }}
                disabled={loading.updateRequest}
              >
                {loading.updateRequest ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التعديل...
                  </>
                ) : (
                  'حفظ التعديل'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ResponsiveLayout>
  );
}

// Request Section Component
interface RequestSectionProps {
  type: { key: string; name: string; icon: string; color: string };
  section: { isExpanded: boolean; requests: Request[]; lastID: number; hasMore: boolean } | undefined;
  doneValue: string;
  onToggle: () => void;
  onLoadMore: () => void;
  onRequestAction: (requestId: number, type: string, request: Request) => void;
  onRequestOptions: (request: Request) => void;
  loading: boolean;
  actionLoading: { [key: string]: boolean };
}

function RequestSection({
  type,
  section,
  doneValue,
  onToggle,
  onLoadMore,
  onRequestAction,
  onRequestOptions,
  loading,
  actionLoading
}: RequestSectionProps) {
  const isOpen = doneValue === 'false';

  return (
    <div className="mb-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center text-white text-lg`}>
            {type.icon}
          </div>
          <div className="text-right">
            <h3 className="font-ibm-arabic-semibold text-gray-900">{type.name}</h3>
            <p className="text-sm text-gray-500">
              {section?.requests.length || 0} طلب
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          )}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className={`transition-transform ${section?.isExpanded ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </button>

      {/* Section Content */}
      {section?.isExpanded && (
        <div className="border-t border-gray-200">
          {section.requests.length > 0 ? (
            <>
              <div className="space-y-2 p-4">
                {section.requests.map((request, index) => (
                  <RequestCard
                    key={request.RequestsID}
                    request={request}
                    index={index}
                    isOpen={isOpen}
                    onAction={() => onRequestAction(request.RequestsID, request.Type, request)}
                    onOptions={() => onRequestOptions(request)}
                    actionLoading={actionLoading[`close_${request.RequestsID}`]}
                  />
                ))}
              </div>

              {section.hasMore && (
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={onLoadMore}
                    disabled={loading}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-ibm-arabic-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'جاري التحميل...' : 'تحميل المزيد'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <p className="text-gray-500 font-ibm-arabic-medium">
                لا توجد طلبات {isOpen ? 'مفتوحة' : 'مغلقة'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Request Card Component
interface RequestCardProps {
  request: Request;
  index: number;
  isOpen: boolean;
  onAction: () => void;
  onOptions: () => void;
  actionLoading: boolean;
}

function RequestCard({ request, index, isOpen, onAction, onOptions, actionLoading }: RequestCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-ibm-arabic-medium text-gray-900 text-sm truncate">
            {index + 1}- طلب بتاريخ {new Date(request.Date).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}
          </p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {request.Data}
          </p>
        </div>

        <div className="flex items-center gap-2 mr-3">
          <button
            onClick={onOptions}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </button>

          {isOpen && (
            <button
              onClick={onAction}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-ibm-arabic-medium transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {actionLoading ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              )}
              تنفيذ
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span>بواسطة: {request.InsertBy}</span>
        <span>{new Date(request.Date).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })} - {new Date(request.Date).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })}</span>
      </div>
    </div>
  );
}
