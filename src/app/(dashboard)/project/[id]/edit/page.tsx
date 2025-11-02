'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import useValidityUser from '@/hooks/useValidityUser';
import { useTranslation } from '@/hooks/useTranslation';

import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

// Types
interface ProjectData {
  id: number;
  Nameproject: string;
  Note: string;
  LocationProject: string;
  GuardNumber: string;
  numberBuilding: number;
  Referencenumber: number;
  TypeOFContract: string;
  IDcompanySub: number;
  Cost_per_Square_Meter?: number;
  Project_Space?: number;
}

interface FormData {
  Nameproject: string;
  Note: string;
  LocationProject: string;
  GuardNumber: string;
  numberBuilding: number;
  Referencenumber: number;
  TypeOFContract: string;
  TypeSub: string;
  IDcompanySub: number;
  Contractsigningdate: string;
  Cost_per_Square_Meter: number;
  Project_Space: number;
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  const { user } = useSelector((state: any) => state.user || {});
  const { Uservalidation } = useValidityUser();
  const { t, dir } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [contractTypes, setContractTypes] = useState<Array<{id: number, Type: string}>>([]);
  const [showContractDropdown, setShowContractDropdown] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    Nameproject: '',
    Note: '',
    LocationProject: '',
    GuardNumber: '',
    numberBuilding: 1,
    Referencenumber: 0,
    TypeOFContract: '',
    TypeSub: '',
    IDcompanySub: 0,
    Contractsigningdate: new Date().toISOString().split('T')[0],
    Cost_per_Square_Meter: 0,
    Project_Space: 0
  });

  const formFields = [
    { id: 1, nameKey: 'editProject.projectName', key: 'Nameproject', type: 'text' },
    { id: 2, nameKey: 'editProject.subName', key: 'Note', type: 'text' },
    { id: 3, nameKey: 'editProject.location', key: 'LocationProject', type: 'text' },
    { id: 4, nameKey: 'editProject.guard', key: 'GuardNumber', type: 'text' },
    { id: 5, nameKey: 'editProject.contractDate', key: 'Contractsigningdate', type: 'date' },
  ];

  // مطابق للتطبيق المحمول - جلب أنواع العقود
  useEffect(() => {
    const fetchContractTypes = async () => {
      try {
        const response = await axiosInstance.get('/Templet/BringTypeOFContract', {
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        });
        if (response.data?.data) {
          setContractTypes(response.data.data);
        }
      } catch (error) {
        // Error fetching contract types
      }
    };

    if (user?.accessToken) {
      fetchContractTypes();
    }
  }, [user?.accessToken]);

  useEffect(() => {
    if (projectId && user?.accessToken) {
      fetchProjectData();
    }
  }, [projectId, user?.accessToken]);

  const fetchProjectData = async () => {
    try {
      setFetchLoading(true);
      const response = await axiosInstance.get(
        `/brinshCompany/BringProjectObjectone?idProject=${projectId}`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` }
        }
      );

      if (response.data?.data) {
        const projectData = response.data.data;
        setProject(projectData);

        setFormData({
          Nameproject: projectData.Nameproject || '',
          Note: projectData.Note || '',
          LocationProject: projectData.LocationProject || '',
          GuardNumber: projectData.GuardNumber || '',
          numberBuilding: projectData.numberBuilding || 1,
          Referencenumber: projectData.Referencenumber || 0,
          TypeOFContract: projectData.TypeOFContract || '',
          TypeSub: '',
          IDcompanySub: projectData.IDcompanySub || 0,
          Contractsigningdate: projectData.Contractsigningdate
            ? new Date(projectData.Contractsigningdate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          Cost_per_Square_Meter: projectData.Cost_per_Square_Meter || 0,
          Project_Space: projectData.Project_Space || 0
        });
      }
    } catch (error: any) {
      Tostget(t('editProject.error'));
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleContractTypeSelect = () => {
    // مطابق للتطبيق: لا يمكن تعديل نوع العقد لمشروع موجود (Edite !== null)
    // يمكن تعديله فقط عند إنشاء مشروع جديد (Edite === null)
    // في صفحة التعديل، المشروع دائماً موجود، لذا نمنع التعديل
    Tostget('لايمكن تعديل نوع العقد');
    return;
  };

  const incrementBuilding = () => {
    setFormData(prev => ({
      ...prev,
      numberBuilding: prev.numberBuilding + 1
    }));
  };

  const decrementBuilding = () => {
    setFormData(prev => ({
      ...prev,
      numberBuilding: prev.numberBuilding > 1 ? prev.numberBuilding - 1 : 1
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.Nameproject.trim()) {
      Tostget('يرجى إدخال اسم المشروع');
      return;
    }

    // Check permissions
    const hasPermission = await Uservalidation('تعديل بيانات المشروع', 0);
    if (!hasPermission) {
      return;
    }

    setLoading(true);
    try {
      // مطابق للتطبيق والباك اند - إرسال البيانات المطلوبة فقط
      // تحويل جميع القيم إلى string قبل استدعاء trim() لتجنب أخطاء
      const updateData = {
        IDcompanySub: formData.IDcompanySub,
        Nameproject: String(formData.Nameproject || '').trim(),
        Note: String(formData.Note || '').trim(),
        TypeOFContract: String(formData.TypeOFContract || '').trim(),
        GuardNumber: String(formData.GuardNumber || '').trim(),
        LocationProject: String(formData.LocationProject || '').trim(),
        numberBuilding: formData.numberBuilding,
        Referencenumber: formData.Referencenumber,
        Cost_per_Square_Meter: formData.Cost_per_Square_Meter,
        Project_Space: formData.Project_Space,
        ProjectID: projectId
      };

      console.log('Sending update data:', updateData);

      const response = await axiosInstance.put(
        '/brinshCompany/projectUpdat',
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      console.log('Update response:', response.data);
      Tostget(t('editProject.success'));
      router.back();
    } catch (error: any) {
      console.error('Update project error:', error);
      console.error('Error response:', error?.response?.data);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.errors || t('editProject.error');
      if (typeof errorMessage === 'object') {
        // إذا كانت الأخطاء object، نعرض أول خطأ
        const firstError = Object.values(errorMessage)[0];
        Tostget(String(firstError));
      } else {
        Tostget(String(errorMessage));
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">{t('editProject.loading')}</h3>
          <p className="text-gray-600 font-ibm-arabic-medium">{t('common.pleaseWait')}</p>
        </div>
      </div>
    );
  }

  if (!project && !fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-600">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-2">{t('editProject.notFound')}</h3>
          <p className="text-gray-600 font-ibm-arabic-medium mb-4">{t('editProject.checkConnection')}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title={t('editProject.title')}
          backButton={
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label={t('common.back')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          }
        />
      }
    >
      <ContentSection>
        {/* All Form Fields with consistent spacing */}
        <div className="flex flex-col gap-5 sm:gap-4" style={{ direction: dir as 'rtl' | 'ltr' }}>
          {formFields.map((field) => {
            const newValue = formData[field.key as keyof FormData] as string;

            return (
              <div key={field.id} className="bg-white p-6 sm:p-5 rounded-xl border border-gray-200 shadow-sm transition-all">
                <label className="block text-sm font-ibm-arabic-bold text-gray-900 mb-3 px-4 sm:px-3">
                  {t(field.nameKey)}
                </label>

                <input
                  type={field.type}
                  value={newValue}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className="w-full px-4 sm:px-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg font-ibm-arabic-medium bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  placeholder={`${t('editProject.enter')} ${t(field.nameKey)}`}
                />
              </div>
            );
          })}

          {/* Reference Number */}
          <div className="bg-white p-6 sm:p-5 rounded-xl border border-gray-200 shadow-sm transition-all">
            <label className="block text-sm font-ibm-arabic-bold text-gray-900 mb-3 px-4 sm:px-3">
              {t('editProject.referenceNumber')}
            </label>

            <input
              type="number"
              value={formData.Referencenumber}
              onChange={(e) => handleInputChange('Referencenumber', e.target.value)}
              className="w-full px-4 sm:px-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg font-ibm-arabic-medium bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
              placeholder={t('editProject.enterReferenceNumber')}
            />
          </div>

          {/* Number of Buildings */}
          <div className="bg-white p-6 sm:p-5 rounded-xl border border-gray-200 shadow-sm transition-all">
            <label className="block text-sm font-ibm-arabic-bold text-gray-900 mb-4 px-4 sm:px-3">
              {t('editProject.buildingsCount')}
            </label>

            <div className="flex items-center gap-4 sm:gap-3 p-4 sm:p-3 border border-gray-300 rounded-lg bg-gray-50">
              <button
                onClick={decrementBuilding}
                className="w-11 h-11 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-700">
                  <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2"/>
                </svg>
              </button>

              <div className="flex-1 text-center">
                <span className="text-3xl sm:text-2xl font-ibm-arabic-bold text-gray-900">
                  {formData.numberBuilding}
                </span>
              </div>

              <button
                onClick={incrementBuilding}
                className="w-11 h-11 sm:w-10 sm:h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-700">
                  <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2"/>
                  <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Cost per Square Meter */}
          <div className="bg-white p-6 sm:p-5 rounded-xl border border-gray-200 shadow-sm transition-all">
            <label className="block text-sm font-ibm-arabic-bold text-gray-900 mb-3 px-4 sm:px-3">
              {t('editProject.costPerSquareMeter')}
            </label>

            <input
              type="number"
              value={formData.Cost_per_Square_Meter}
              onChange={(e) => handleInputChange('Cost_per_Square_Meter', e.target.value)}
              className="w-full px-4 sm:px-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg font-ibm-arabic-medium bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
              placeholder={t('editProject.enterCostPerSquareMeter')}
            />
          </div>

          {/* Project Space */}
          <div className="bg-white p-6 sm:p-5 rounded-xl border border-gray-200 shadow-sm transition-all">
            <label className="block text-sm font-ibm-arabic-bold text-gray-900 mb-3 px-4 sm:px-3">
              {t('editProject.projectSpace')}
            </label>

            <input
              type="number"
              value={formData.Project_Space}
              onChange={(e) => handleInputChange('Project_Space', e.target.value)}
              className="w-full px-4 sm:px-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg font-ibm-arabic-medium bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
              placeholder={t('editProject.enterProjectSpace')}
            />
          </div>

          {/* Contract Type Section */}
          <div className="bg-white p-6 sm:p-5 rounded-xl border border-gray-200 shadow-sm transition-all">
            <label className="block text-sm font-ibm-arabic-bold text-gray-900 mb-3 px-4 sm:px-3">
              {t('editProject.contractType')}
            </label>

            {/* Contract Type Dropdown */}
            <div className="relative">
              <button
                onClick={() => !project && setShowContractDropdown(!showContractDropdown)}
                disabled={!!project}
                className={`w-full px-4 sm:px-3 py-3 sm:py-2.5 border rounded-lg font-ibm-arabic-medium flex items-center justify-between transition-all ${
                  project
                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <span className={formData.TypeOFContract ? 'text-gray-900' : 'text-gray-400'}>
                  {formData.TypeOFContract || t('editProject.selectContractType')}
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className={`transition-transform text-gray-600 ${showContractDropdown ? 'rotate-180' : ''}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown List */}
              {showContractDropdown && !project && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {contractTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={handleContractTypeSelect}
                      className={`w-full px-4 sm:px-3 py-3 sm:py-2.5 text-right font-ibm-arabic-medium hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        formData.TypeOFContract === type.Type ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {type.Type}
                    </button>
                  ))}
                  {contractTypes.length === 0 && (
                    <div className="p-4 sm:p-3 text-center text-gray-500 font-ibm-arabic-medium">
                      {t('common.loading')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 sm:py-2.5 rounded-lg font-ibm-arabic-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('editProject.updating')}
              </>
            ) : (
              t('editProject.updateButton')
            )}
          </button>
        </div>
      </ContentSection>
    </ResponsiveLayout>
  );
}
