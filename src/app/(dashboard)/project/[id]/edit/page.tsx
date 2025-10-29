'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import useValidityUser from '@/hooks/useValidityUser';
import { colors } from '@/constants/colors';
import { verticalScale, scale } from '@/utils/responsiveSize';

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
    { id: 1, name: 'اسم المشروع', key: 'Nameproject', type: 'text' },
    { id: 2, name: 'اسم فرعي', key: 'Note', type: 'text' },
    { id: 3, name: 'الموقع', key: 'LocationProject', type: 'text' },
    { id: 4, name: 'الحارس', key: 'GuardNumber', type: 'text' },
    { id: 5, name: 'تاريخ توقيع العقد', key: 'Contractsigningdate', type: 'date' },
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
        console.error('Error fetching contract types:', error);
      }
    };

    if (user?.accessToken) {
      fetchContractTypes();
    }
  }, [user?.accessToken]);

  useEffect(() => {
    console.log('Project ID:', projectId);
    console.log('User:', user);
    if (projectId && user?.accessToken) {
      fetchProjectData();
    } else {
      console.log('Missing projectId or accessToken');
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

      console.log('API Response:', response.data);

      if (response.data?.data) {
        const projectData = response.data.data;
        console.log('Project Data:', projectData);
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
      console.error('Error fetching project data:', error);
      console.error('Error details:', error.response?.data);
      Tostget(`خطأ في جلب بيانات المشروع: ${error.response?.data?.message || error.message}`);
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

  const handleContractTypeSelect = (id: number, name: string) => {
    if (project) {
      Tostget('لايمكن تعديل نوع العقد');
      return;
    }
    setFormData(prev => ({ ...prev, TypeOFContract: name }));
    setShowContractDropdown(false);
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
      const updateData = {
        IDcompanySub: formData.IDcompanySub,
        Nameproject: formData.Nameproject,
        Note: formData.Note,
        TypeOFContract: formData.TypeOFContract,
        GuardNumber: formData.GuardNumber,
        LocationProject: formData.LocationProject,
        numberBuilding: formData.numberBuilding,
        Referencenumber: formData.Referencenumber,
        Contractsigningdate: new Date(formData.Contractsigningdate),
        Cost_per_Square_Meter: formData.Cost_per_Square_Meter,
        Project_Space: formData.Project_Space,
        ProjectID: projectId
      };

      await axiosInstance.put(
        '/brinshCompany/projectUpdat',
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );

      Tostget('تم تحديث بيانات المشروع بنجاح');
      router.back();
    } catch (error) {
      console.error('Error updating project:', error);
      Tostget('خطأ في تحديث بيانات المشروع');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-lg font-ibm-arabic-bold text-gray-800 mb-2">جاري تحميل بيانات المشروع</h3>
          <p className="text-gray-600 font-ibm-arabic-medium">يرجى الانتظار...</p>
        </div>
      </div>
    );
  }

  if (!project && !fetchLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-600">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3 className="text-lg font-ibm-arabic-bold text-gray-800 mb-2">لم يتم العثور على بيانات المشروع</h3>
          <p className="text-gray-600 font-ibm-arabic-medium mb-4">تأكد من صحة رقم المشروع أو اتصالك بالإنترنت</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title="تعديل بيانات المشروع"
          backButton={
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-lg transition-colors" aria-label="رجوع">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          }
        />
      }
    >

      {/* Content */}
      <ContentSection>




        {/* Form Fields */}
        <div className="space-y-6 mb-8">
          {formFields.map((field) => {
            const currentValue = project ? project[field.key as keyof ProjectData] : '';
            const newValue = formData[field.key as keyof FormData] as string;
            const hasChanged = currentValue !== newValue;

            return (
              <div key={field.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-ibm-arabic-bold text-gray-800 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-600">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    {field.name}
                    {hasChanged && (
                      <span className="text-orange-600 text-sm bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                        تم التعديل
                      </span>
                    )}
                  </label>

                  {project && (
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                      <span className="font-ibm-arabic-semibold">الحالي: </span>
                      <span className="font-ibm-arabic-medium">
                        {currentValue || 'غير محدد'}
                      </span>
                    </div>
                  )}
                </div>

                <input
                  type={field.type}
                  value={newValue}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className={`w-full p-4 border-2 rounded-xl font-ibm-arabic-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    hasChanged
                      ? 'border-orange-300 bg-orange-50 shadow-md'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                  placeholder={`أدخل ${field.name} الجديد`}
                />

                {hasChanged && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-500 p-1 rounded-full">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M12 9v4"/>
                          <path d="M12 17h.01"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-yellow-800 font-ibm-arabic-medium text-sm">
                          <span className="font-ibm-arabic-bold">التغيير:</span> من
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded mx-1">
                            "{currentValue || 'غير محدد'}"
                          </span>
                          إلى
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded mx-1">
                            "{newValue}"
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Reference Number */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            {(() => {
              const currentValue = project ? project.Referencenumber : 0;
              const newValue = formData.Referencenumber;
              const hasChanged = currentValue !== newValue;

              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-lg font-ibm-arabic-bold text-gray-800 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-600">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      الرقم المرجعي
                      {hasChanged && (
                        <span className="text-orange-600 text-sm bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                          تم التعديل
                        </span>
                      )}
                    </label>

                    {project && (
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                        <span className="font-ibm-arabic-semibold">الحالي: </span>
                        <span className="font-ibm-arabic-medium">{currentValue}</span>
                      </div>
                    )}
                  </div>

                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => handleInputChange('Referencenumber', e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl font-ibm-arabic-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      hasChanged
                        ? 'border-orange-300 bg-orange-50 shadow-md'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                    placeholder="أدخل الرقم المرجعي الجديد"
                  />

                  {hasChanged && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-500 p-1 rounded-full">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M12 9v4"/>
                            <path d="M12 17h.01"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-yellow-800 font-ibm-arabic-medium text-sm">
                            <span className="font-ibm-arabic-bold">التغيير:</span> من
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded mx-1">
                              "{currentValue}"
                            </span>
                            إلى
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded mx-1">
                              "{newValue}"
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Number of Buildings */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            {(() => {
              const currentValue = project ? project.numberBuilding : 1;
              const newValue = formData.numberBuilding;
              const hasChanged = currentValue !== newValue;

              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-lg font-ibm-arabic-bold text-gray-800 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-600">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9,22 9,12 15,12 15,22"/>
                      </svg>
                      عدد المباني
                      {hasChanged && (
                        <span className="text-orange-600 text-sm bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                          تم التعديل
                        </span>
                      )}
                    </label>

                    {project && (
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                        <span className="font-ibm-arabic-semibold">الحالي: </span>
                        <span className="font-ibm-arabic-medium">{currentValue}</span>
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center gap-4 p-4 border-2 rounded-xl transition-all ${
                    hasChanged
                      ? 'border-orange-300 bg-orange-50 shadow-md'
                      : 'border-gray-300 bg-gray-50'
                  }`}>
                    <button
                      onClick={decrementBuilding}
                      className="w-12 h-12 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-colors shadow-sm"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>

                    <div className="flex-1 text-center">
                      <span className="text-3xl font-ibm-arabic-bold text-gray-900">
                        {newValue}
                      </span>
                    </div>

                    <button
                      onClick={incrementBuilding}
                      className="w-12 h-12 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-colors shadow-sm"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                  </div>

                  {hasChanged && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-500 p-1 rounded-full">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M12 9v4"/>
                            <path d="M12 17h.01"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-yellow-800 font-ibm-arabic-medium text-sm">
                            <span className="font-ibm-arabic-bold">التغيير:</span> من
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded mx-1">
                              "{currentValue}"
                            </span>
                            إلى
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded mx-1">
                              "{newValue}"
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Cost per Square Meter - تكلفة المتر المربع */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            {(() => {
              const currentValue = project ? (project.Cost_per_Square_Meter || 0) : 0;
              const newValue = formData.Cost_per_Square_Meter;
              const hasChanged = currentValue !== newValue;

              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-lg font-ibm-arabic-bold text-gray-800 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-600">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      تكلفة المتر المربع
                      {hasChanged && (
                        <span className="text-orange-600 text-sm bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                          تم التعديل
                        </span>
                      )}
                    </label>

                    {project && (
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                        <span className="font-ibm-arabic-semibold">الحالي: </span>
                        <span className="font-ibm-arabic-medium">{currentValue}</span>
                      </div>
                    )}
                  </div>

                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => handleInputChange('Cost_per_Square_Meter', e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl font-ibm-arabic-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      hasChanged
                        ? 'border-orange-300 bg-orange-50 shadow-md'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                    placeholder="أدخل تكلفة المتر المربع"
                  />

                  {hasChanged && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-500 p-1 rounded-full">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M12 9v4"/>
                            <path d="M12 17h.01"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-yellow-800 font-ibm-arabic-medium text-sm">
                            <span className="font-ibm-arabic-bold">التغيير:</span> من
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded mx-1">
                              "{currentValue}"
                            </span>
                            إلى
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded mx-1">
                              "{newValue}"
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Project Space - مساحة المشروع */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            {(() => {
              const currentValue = project ? (project.Project_Space || 0) : 0;
              const newValue = formData.Project_Space;
              const hasChanged = currentValue !== newValue;

              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-lg font-ibm-arabic-bold text-gray-800 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-600">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                      مساحة المشروع
                      {hasChanged && (
                        <span className="text-orange-600 text-sm bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                          تم التعديل
                        </span>
                      )}
                    </label>

                    {project && (
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                        <span className="font-ibm-arabic-semibold">الحالي: </span>
                        <span className="font-ibm-arabic-medium">{currentValue}</span>
                      </div>
                    )}
                  </div>

                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => handleInputChange('Project_Space', e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl font-ibm-arabic-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      hasChanged
                        ? 'border-orange-300 bg-orange-50 shadow-md'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                    placeholder="أدخل مساحة المشروع"
                  />

                  {hasChanged && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-500 p-1 rounded-full">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M12 9v4"/>
                            <path d="M12 17h.01"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-yellow-800 font-ibm-arabic-medium text-sm">
                            <span className="font-ibm-arabic-bold">التغيير:</span> من
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded mx-1">
                              "{currentValue}"
                            </span>
                            إلى
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded mx-1">
                              "{newValue}"
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Contract Type Section - مطابق للتطبيق المحمول */}
        <div className="mb-8">
          <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-4 text-center">
            نوع العقد
          </h3>

          {/* Contract Type Disabled Notice for Existing Projects */}
          {project && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-ibm-arabic-medium text-yellow-800 text-center">
                لا يمكن تعديل نوع العقد للمشاريع الموجودة
              </p>
            </div>
          )}

          {/* Contract Type Dropdown - مطابق للتطبيق المحمول */}
          <div className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={() => !project && setShowContractDropdown(!showContractDropdown)}
              disabled={!!project}
              className={`w-full p-4 border-2 rounded-xl font-ibm-arabic-medium text-right flex items-center justify-between transition-all ${
                project
                  ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
                  : 'border-blue-500 bg-white hover:bg-blue-50'
              }`}
            >
              <span className={formData.TypeOFContract ? 'text-gray-900' : 'text-gray-400'}>
                {formData.TypeOFContract || 'اختر نوع العقد'}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className={`transition-transform ${showContractDropdown ? 'rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown List */}
            {showContractDropdown && !project && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-500 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                {contractTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleContractTypeSelect(type.id, type.Type)}
                    className={`w-full p-4 text-right font-ibm-arabic-medium hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      formData.TypeOFContract === type.Type ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {type.Type}
                  </button>
                ))}
                {contractTypes.length === 0 && (
                  <div className="p-4 text-center text-gray-500 font-ibm-arabic-medium">
                    جاري تحميل الأنواع...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mb-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-ibm-arabic-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري التحديث...
              </>
            ) : (
              'تحديث بيانات المشروع'
            )}
          </button>
        </div>
      </ContentSection>
    </ResponsiveLayout>
  );
}
