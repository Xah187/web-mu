'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import UserProfileModal from '@/components/user/UserProfileModal';
import useValidityUser from '@/hooks/useValidityUser';
import { EmployeeOnly } from '@/components/auth/PermissionGuard';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';

// Types
import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

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
  arrayOpen: Request[];
  arrayClosed: Request[];
}

export default function BranchRequestsPage() {
  const router = useRouter();
  const params = useParams();
  const branchId = params.id as string;
  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();
  const { t, isRTL, dir } = useTranslation();

  // Request Types - matching mobile app exactly
  const REQUEST_TYPES = [
    { key: 'light', value: 'مواد خفيفة', name: t('requests.lightMaterials'), icon: '📦', color: 'bg-blue-500' },
    { key: 'heavy', value: 'مواد ثقيلة', name: t('requests.heavyMaterials'), icon: '🏗️', color: 'bg-orange-500' },
    { key: 'electrical', value: 'كهربائي', name: t('requests.electrical'), icon: '⚡', color: 'bg-yellow-500' },
    { key: 'plumber', value: 'سباك', name: t('requests.plumber'), icon: '🔧', color: 'bg-green-500' },
    { key: 'blacksmith', value: 'حداد', name: t('requests.blacksmith'), icon: '🔨', color: 'bg-gray-500' }
  ];

  const [requestsData, setRequestsData] = useState<RequestsData>({
    arrayOpen: [],
    arrayClosed: []
  });
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [selectedType, setSelectedType] = useState<string>('مواد خفيفة');
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [createRequest, setCreateRequest] = useState({
    type: 'مواد خفيفة',
    data: '',
    projectId: 0
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    if (branchId) {
      fetchProjects();
      fetchRequestsData();
    }
  }, [branchId, selectedType, activeTab]);

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get(`/brinshCompany/BringProject?IDCompanySub=${branchId}`, {
        headers: { Authorization: `Bearer ${user?.accessToken}` }
      });

      if (response.data?.data) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchRequestsData = async () => {
    if (!branchId) return;

    const done = activeTab === 'open' ? 'false' : 'true';
    setLoading(prev => ({ ...prev, [activeTab]: true }));

    try {
      const response = await axiosInstance.get(
        `/brinshCompany/v2/BringDataRequests?ProjectID=${branchId}&Type=${selectedType}&kind=all&Done=${done}&lastID=0`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        setRequestsData(prev => ({
          ...prev,
          [activeTab === 'open' ? 'arrayOpen' : 'arrayClosed']: response.data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(prev => ({ ...prev, [activeTab]: false }));
    }
  };

  // Export Branch Requests Report as PDF - Matching mobile app
  // Mobile app: HomSub.tsx navigates to Requests with typepage='all'
  // Then Requests.tsx calls BringreportRequessts(idProject, typepage)
  const exportBranchRequestsPDF = async () => {
    if (!branchId) {
      Tostget('معرف الفرع غير صحيح');
      return;
    }

    setExportingPDF(true);
    try {
      // type='all' means all requests for this branch (not just one project)
      const response = await axiosInstance.get(
        `brinshCompany/BringreportRequessts?id=${branchId}&type=all`,
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
      console.error('Error exporting branch requests PDF:', error);
      Tostget(error.response?.data?.success || 'خطأ في تصدير التقرير');
    } finally {
      setExportingPDF(false);
    }
  };

  const createNewRequest = async () => {
    if (!createRequest.data.trim() || !createRequest.projectId) {
      Tostget('يرجى ملء جميع الحقول');
      return;
    }

    // Check permission - matching mobile app exactly
    const hasPermission = await Uservalidation('إنشاء طلبات', createRequest.projectId);
    if (!hasPermission) {
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
      await fetchRequestsData();
    } catch (error) {
      console.error('Error creating request:', error);
      Tostget('خطأ في إنشاء الطلب');
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  const resetCreateRequest = () => {
    setCreateRequest({
      type: 'مواد خفيفة',
      data: '',
      projectId: 0
    });
    setShowCreateModal(false);
  };

  const currentData = requestsData[activeTab === 'open' ? 'arrayOpen' : 'arrayClosed'];

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title="2744372e272a"
          backButton={
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="312c4839">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          }
        />
      }
    >
      <ContentSection>


      {/* Content */}
      <div className="px-6 py-4" style={{ direction: dir as 'rtl' | 'ltr' }}>
        {/* Action Buttons - Matching mobile app */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          {/* Create Request Button - Show for employees only like mobile app */}
          <EmployeeOnly>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              {t('requests.addRequest')}
            </button>
          </EmployeeOnly>

          {/* Export PDF Button - Matching mobile app */}
          <button
            onClick={exportBranchRequestsPDF}
            disabled={exportingPDF}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-green-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('requests.exportPDF')}
          >
            {exportingPDF ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            )}
            {t('requests.exportPDF')}
          </button>
        </div>

        {/* Request Type Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {REQUEST_TYPES.map((type) => (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.value)}
                className={`px-4 py-2 rounded-lg font-ibm-arabic-medium transition-colors ${
                  selectedType === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {type.icon} {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-6 py-3 rounded-lg font-ibm-arabic-semibold transition-colors ${
                activeTab === 'open'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t('requests.openRequests')}
            </button>
            <button
              onClick={() => setActiveTab('closed')}
              className={`px-6 py-3 rounded-lg font-ibm-arabic-semibold transition-colors ${
                activeTab === 'closed'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t('requests.closedRequests')}
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {loading[activeTab] ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : currentData.length > 0 ? (
            currentData.map((request) => (
              <div key={request.RequestsID} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-ibm-arabic-semibold text-gray-900 mb-1">
                      {request.Type}
                    </h3>
                    <p className="text-gray-600 font-ibm-arabic-medium text-sm">
                      {request.Data}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-ibm-arabic-semibold ${
                    request.Done === 'false'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {request.Done === 'false' ? t('requests.open') : t('requests.closed')}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{t('requests.by')}: {request.InsertBy}</span>
                  <span>{new Date(request.Date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</span>
                </div>

                {request.Nameproject && (
                  <div className="mt-2 text-sm text-blue-600 font-ibm-arabic-medium">
                    {t('requests.project')}: {request.Nameproject}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-ibm-arabic-semibold text-gray-700 mb-2">
                {t('requests.noRequests')}
              </h3>
              <p className="text-gray-500 font-ibm-arabic-medium">
                {t('requests.noRequestsOfType', { type: REQUEST_TYPES.find(rt => rt.value === selectedType)?.name || selectedType })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" style={{ direction: dir as 'rtl' | 'ltr' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl">
            <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-4 text-center">
              {t('requests.addNewRequest')}
            </h3>

            {/* Project Selection */}
            <div className="mb-4">
              <label className="block text-sm font-ibm-arabic-semibold text-gray-700 mb-2" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {t('requests.project')}
              </label>
              <select
                value={createRequest.projectId}
                onChange={(e) => setCreateRequest(prev => ({ ...prev, projectId: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ direction: dir as 'rtl' | 'ltr' }}
              >
                <option value={0}>{t('requests.selectProject')}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.Nameproject}
                  </option>
                ))}
              </select>
            </div>

            {/* Request Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-ibm-arabic-semibold text-gray-700 mb-2" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {t('requests.requestType')}
              </label>
              <select
                value={createRequest.type}
                onChange={(e) => setCreateRequest(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ direction: dir as 'rtl' | 'ltr' }}
              >
                {REQUEST_TYPES.map((type) => (
                  <option key={type.key} value={type.value}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Request Description */}
            <div className="mb-6">
              <label className="block text-sm font-ibm-arabic-semibold text-gray-700 mb-2" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {t('requests.requestDetails')}
              </label>
              <textarea
                value={createRequest.data}
                onChange={(e) => setCreateRequest(prev => ({ ...prev, data: e.target.value }))}
                placeholder={t('requests.requestDetailsPlaceholder')}
                className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                style={{ direction: dir as 'rtl' | 'ltr', textAlign: isRTL ? 'right' : 'left' }}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <button
                onClick={resetCreateRequest}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
                disabled={loading.create}
              >
                {t('requests.cancel')}
              </button>
              <button
                onClick={createNewRequest}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading.create}
              >
                {loading.create ? t('requests.creating') : t('requests.create')}
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
