'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useCreateProject } from '@/hooks/useCreateProject';
import ResponsiveLayout, { PageHeader, ContentSection } from '@/components/layout/ResponsiveLayout';

// Helper function for scaling (matching mobile app)
const scale = (size: number) => size;
const verticalScale = (size: number) => size;

interface ProjectFormData {
  IDcompanySub: number;
  Nameproject: string;
  Note: string;
  LocationProject: string;
  GuardNumber: string;
  TypeOFContract: string;
  numberBuilding: number;
  Referencenumber: number;
  Cost_per_Square_Meter: number;
  Project_Space: number;
}

const CreateProjectPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = parseInt(searchParams.get('branchId') || '0');

  const { user } = useSelector((state: any) => state.user || {});
  const { createProject, getContractTypes, loading, error, clearError } = useCreateProject();
  const [activeField, setActiveField] = useState<number>(0);
  const [contractTypes, setContractTypes] = useState<Array<{id: number, Type: string}>>([]);
  const [showContractDropdown, setShowContractDropdown] = useState(false);

  const [formData, setFormData] = useState<ProjectFormData>({
    IDcompanySub: branchId,
    Nameproject: '',
    Note: '',
    LocationProject: '',
    GuardNumber: '',
    TypeOFContract: '',
    numberBuilding: 1,
    Referencenumber: 0,
    Cost_per_Square_Meter: 0,
    Project_Space: 0
  });

  const formFields = [
    { id: 1, name: 'اسم المشروع', key: 'Nameproject', type: 'text' },
    { id: 2, name: 'اسم فرعي', key: 'Note', type: 'text' },
    { id: 3, name: 'الموقع', key: 'LocationProject', type: 'text' },
    { id: 4, name: 'الحارس', key: 'GuardNumber', type: 'text' },
  ];

  // مطابق للتطبيق المحمول - جلب أنواع العقود عند تحميل الصفحة
  useEffect(() => {
    const fetchContractTypes = async () => {
      const types = await getContractTypes();
      setContractTypes(types);
    };
    fetchContractTypes();
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNumberChange = (key: string, value: string) => {
    // مطابق للتطبيق المحمول - تحويل الأرقام العربية إلى إنجليزية
    const convertedValue = value.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    const numericValue = convertedValue.replace(/[^\d.]/g, '');

    setFormData(prev => ({
      ...prev,
      [key]: numericValue
    }));
  };

  const handleBuildingCountChange = (type: 'plus' | 'minus') => {
    setFormData(prev => ({
      ...prev,
      numberBuilding: type === 'plus'
        ? prev.numberBuilding + 1
        : Math.max(0, prev.numberBuilding - 1)
    }));
  };

  const handleSubmit = async () => {
    clearError();

    const success = await createProject(formData);

    if (success) {
      alert('تم إنشاء المشروع بنجاح');
      router.back();
    } else if (error) {
      alert(error);
    }
  };

  return (
    <ResponsiveLayout
      header={
        <PageHeader
          title="إنشاء مشروع جديد"
          backButton={
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="رجوع">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="#2117FB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          }
        />
      }
    >
      <ContentSection>
      <div className="p-4 space-y-6">
        {/* Form Fields */}
        <div className="space-y-6">
          {formFields.map((field) => (
            <div key={field.id} className="relative">
              <div className="relative bg-white rounded-xl border-2 transition-all duration-200"
                   style={{
                     borderColor: activeField === field.id ? '#2117FB' : '#E5E7EB',
                     minHeight: '60px'
                   }}>
                <input
                  type={field.type}
                  value={String(formData[field.key as keyof ProjectFormData] || '')}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  onFocus={() => setActiveField(field.id)}
                  onBlur={() => setActiveField(0)}
                  className="w-full h-full px-4 pt-6 pb-2 bg-transparent text-right font-ibm-arabic-medium text-gray-900 outline-none"
                  style={{ fontSize: scale(14) }}
                />

                {/* Floating Label */}
                <label
                  className={`absolute right-4 transition-all duration-200 pointer-events-none font-ibm-arabic-medium ${
                    activeField === field.id || String(formData[field.key as keyof ProjectFormData] || '')
                      ? 'top-2 text-xs text-blue-600'
                      : 'top-1/2 transform -translate-y-1/2 text-gray-500'
                  }`}
                  style={{
                    fontSize: activeField === field.id || String(formData[field.key as keyof ProjectFormData] || '')
                      ? scale(10)
                      : scale(14)
                  }}
                >
                  {field.name}
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Cost per Square Meter & Project Space - مطابق للتطبيق المحمول */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <label className="block text-right font-ibm-arabic-medium text-gray-600 mb-2" style={{ fontSize: scale(12) }}>
              تكلفة المتر المربع
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={formData.Cost_per_Square_Meter || ''}
              onChange={(e) => handleNumberChange('Cost_per_Square_Meter', e.target.value)}
              className="w-full text-center font-ibm-arabic-semibold text-gray-900 outline-none bg-transparent"
              style={{ fontSize: scale(16) }}
              placeholder="0"
            />
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <label className="block text-right font-ibm-arabic-medium text-gray-600 mb-2" style={{ fontSize: scale(12) }}>
              مساحة المشروع
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={formData.Project_Space || ''}
              onChange={(e) => handleNumberChange('Project_Space', e.target.value)}
              className="w-full text-center font-ibm-arabic-semibold text-gray-900 outline-none bg-transparent"
              style={{ fontSize: scale(16) }}
              placeholder="0"
            />
          </div>
        </div>

        {/* Building Count & Reference Number - مطابق للتطبيق المحمول */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <label className="block text-right font-ibm-arabic-medium text-gray-600 mb-2" style={{ fontSize: scale(12) }}>
              عدد الفلل
            </label>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBuildingCountChange('plus')}
                  className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <span className="text-white text-lg">▲</span>
                </button>
                <button
                  onClick={() => handleBuildingCountChange('minus')}
                  className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
                  disabled={formData.numberBuilding <= 0}
                >
                  <span className="text-gray-700 text-lg">▼</span>
                </button>
              </div>
              <span className="text-2xl font-ibm-arabic-semibold text-gray-900">
                {formData.numberBuilding}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <label className="block text-right font-ibm-arabic-medium text-gray-600 mb-2" style={{ fontSize: scale(12) }}>
              الرقم المرجعي
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.Referencenumber || ''}
              onChange={(e) => handleNumberChange('Referencenumber', e.target.value)}
              className="w-full text-center font-ibm-arabic-semibold text-gray-900 outline-none bg-transparent"
              style={{ fontSize: scale(16) }}
              placeholder="0"
            />
          </div>
        </div>

        {/* Contract Type Dropdown - مطابق للتطبيق المحمول */}
        <div className="relative bg-white rounded-xl border-2 border-gray-200">
          <button
            type="button"
            onClick={() => setShowContractDropdown(!showContractDropdown)}
            className="w-full p-4 text-right flex items-center justify-between"
          >
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${showContractDropdown ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <div className="flex-1 text-right">
              {formData.TypeOFContract ? (
                <span className="font-ibm-arabic-semibold text-gray-900" style={{ fontSize: scale(14) }}>
                  {formData.TypeOFContract}
                </span>
              ) : (
                <span className="font-ibm-arabic-medium text-gray-500" style={{ fontSize: scale(14) }}>
                  اختار نوع العقد
                </span>
              )}
            </div>
          </button>

          {showContractDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
              {contractTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, TypeOFContract: type.Type }));
                    setShowContractDropdown(false);
                  }}
                  className="w-full p-4 text-right hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <span className="font-ibm-arabic-medium text-gray-900" style={{ fontSize: scale(14) }}>
                    {type.Type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-8 pb-6">
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.Nameproject.trim()}
            className="w-full bg-blue-600 text-white py-5 rounded-xl font-ibm-arabic-bold hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-3 space-x-reverse shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            style={{ fontSize: scale(18) }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>جاري الإنشاء...</span>
              </>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
                </svg>
                <span>إنشاء المشروع</span>
              </>
            )}
          </button>
        </div>
      </div>
      </ContentSection>
    </ResponsiveLayout>
  );
};

export default CreateProjectPage;
