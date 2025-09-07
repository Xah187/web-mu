'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';
import useValidityUser from '@/hooks/useValidityUser';
import { colors } from '@/constants/colors';
import { verticalScale, scale } from '@/utils/responsiveSize';

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
  const [contractOption, setContractOption] = useState(1); // 1: عظم, 2: تشطيب
  const [basementOption, setBasementOption] = useState(1); // 1: بدون قبو, 2: مع قبو, 3: حر
  
  const [formData, setFormData] = useState<FormData>({
    Nameproject: '',
    Note: '',
    LocationProject: '',
    GuardNumber: '',
    numberBuilding: 1,
    Referencenumber: 0,
    TypeOFContract: 'عظم',
    TypeSub: 'بدون قبو',
    IDcompanySub: 0,
    Contractsigningdate: new Date().toISOString().split('T')[0]
  });

  const formFields = [
    { id: 1, name: 'اسم المشروع', key: 'Nameproject', type: 'text' },
    { id: 2, name: 'اسم فرعي', key: 'Note', type: 'text' },
    { id: 3, name: 'الموقع', key: 'LocationProject', type: 'text' },
    { id: 4, name: 'الحارس', key: 'GuardNumber', type: 'text' },
    { id: 5, name: 'تاريخ توقيع العقد', key: 'Contractsigningdate', type: 'date' },
  ];

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
        
        // Parse contract type
        let contractType = 'عظم';
        let subType = 'بدون قبو';
        
        if (projectData.TypeOFContract === 'حر') {
          contractType = 'حر';
          subType = 'حر';
          setContractOption(1);
          setBasementOption(3);
        } else if (projectData.TypeOFContract.includes('تشطيب')) {
          contractType = 'تشطيب';
          subType = projectData.TypeOFContract.includes('مع قبو') ? 'مع قبو' : 'بدون قبو';
          setContractOption(2);
          setBasementOption(projectData.TypeOFContract.includes('مع قبو') ? 2 : 1);
        } else {
          contractType = 'عظم';
          subType = projectData.TypeOFContract.includes('مع قبو') ? 'مع قبو' : 'بدون قبو';
          setContractOption(1);
          setBasementOption(projectData.TypeOFContract.includes('مع قبو') ? 2 : 1);
        }

        setFormData({
          Nameproject: projectData.Nameproject || '',
          Note: projectData.Note || '',
          LocationProject: projectData.LocationProject || '',
          GuardNumber: projectData.GuardNumber || '',
          numberBuilding: projectData.numberBuilding || 1,
          Referencenumber: projectData.Referencenumber || 0,
          TypeOFContract: contractType,
          TypeSub: subType,
          IDcompanySub: projectData.IDcompanySub || 0,
          Contractsigningdate: projectData.Contractsigningdate
            ? new Date(projectData.Contractsigningdate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
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

  const handleContractTypeChange = (option: number) => {
    if (project) {
      Tostget('لايمكن تعديل نوع العقد');
      return;
    }
    
    setContractOption(option);
    if (option === 1) {
      setFormData(prev => ({ ...prev, TypeOFContract: 'عظم' }));
    } else if (option === 2) {
      setFormData(prev => ({ ...prev, TypeOFContract: 'تشطيب' }));
    }
  };

  const handleBasementChange = (option: number) => {
    if (project) {
      Tostget('لايمكن تعديل نوع العقد');
      return;
    }
    
    setBasementOption(option);
    if (option === 1) {
      setFormData(prev => ({ ...prev, TypeSub: 'بدون قبو' }));
    } else if (option === 2) {
      setFormData(prev => ({ ...prev, TypeSub: 'مع قبو' }));
    } else if (option === 3) {
      setFormData(prev => ({ 
        ...prev, 
        TypeOFContract: 'حر',
        TypeSub: 'حر'
      }));
    }
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
      const typeOfContract = formData.TypeOFContract.includes('حر') 
        ? 'حر' 
        : `${formData.TypeOFContract} ${formData.TypeSub}`;

      const updateData = {
        IDcompanySub: formData.IDcompanySub,
        Nameproject: formData.Nameproject,
        Note: formData.Note,
        TypeOFContract: typeOfContract,
        GuardNumber: formData.GuardNumber,
        LocationProject: formData.LocationProject,
        numberBuilding: formData.numberBuilding,
        Referencenumber: formData.Referencenumber,
        Contractsigningdate: new Date(formData.Contractsigningdate),
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4" style={{ paddingTop: '35px' }}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 className="text-lg font-ibm-arabic-bold text-gray-900">
            تعديل بيانات المشروع
          </h1>
          
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">




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
        </div>

        {/* Contract Type Section */}
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

          {/* Contract Type Options */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => handleContractTypeChange(1)}
              disabled={!!project}
              className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                contractOption === 1
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white'
              } ${project ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`font-ibm-arabic-semibold ${
                contractOption === 1 ? 'text-blue-600' : 'text-gray-700'
              }`}>
                عظم
              </span>
            </button>

            <button
              onClick={() => handleContractTypeChange(2)}
              disabled={!!project}
              className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                contractOption === 2
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white'
              } ${project ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`font-ibm-arabic-semibold ${
                contractOption === 2 ? 'text-blue-600' : 'text-gray-700'
              }`}>
                تشطيب
              </span>
            </button>
          </div>

          {/* Basement Options */}
          {contractOption !== 3 && (
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => handleBasementChange(1)}
                disabled={!!project}
                className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                  basementOption === 1
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white'
                } ${project ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`font-ibm-arabic-semibold ${
                  basementOption === 1 ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  بدون قبو
                </span>
              </button>

              <button
                onClick={() => handleBasementChange(2)}
                disabled={!!project}
                className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                  basementOption === 2
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white'
                } ${project ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`font-ibm-arabic-semibold ${
                  basementOption === 2 ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  مع قبو
                </span>
              </button>
            </div>
          )}

          {/* Free Contract Option */}
          <button
            onClick={() => handleBasementChange(3)}
            disabled={!!project}
            className={`w-full p-4 rounded-xl border-2 transition-colors ${
              basementOption === 3
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 bg-white'
            } ${project ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`font-ibm-arabic-semibold ${
              basementOption === 3 ? 'text-blue-600' : 'text-gray-700'
            }`}>
              حر
            </span>
          </button>
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
      </div>
    </div>
  );
}
