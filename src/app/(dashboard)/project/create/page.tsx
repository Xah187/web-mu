'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useCreateProject } from '@/hooks/useCreateProject';

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
  TypeSub: string;
  numberBuilding: number;
  Referencenumber: number;
  Contractsigningdate: string;
}

const CreateProjectPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = parseInt(searchParams.get('branchId') || '0');
  
  const { user } = useSelector((state: any) => state.user || {});
  const { createProject, loading, error, clearError } = useCreateProject();
  const [activeField, setActiveField] = useState<number>(0);
  const [contractOption, setContractOption] = useState(1); // 1: عظم, 2: تشطيب, 3: حر
  const [subOption, setSubOption] = useState(1); // 1: بدون قبو, 2: مع قبو
  
  const [formData, setFormData] = useState<ProjectFormData>({
    IDcompanySub: branchId,
    Nameproject: '',
    Note: '',
    LocationProject: '',
    GuardNumber: '',
    TypeOFContract: 'عظم',
    TypeSub: 'بدون قبو',
    numberBuilding: 1,
    Referencenumber: 0,
    Contractsigningdate: new Date().toISOString().split('T')[0], // تاريخ اليوم بصيغة YYYY-MM-DD
  });

  const formFields = [
    { id: 1, name: 'اسم المشروع', key: 'Nameproject', type: 'text' },
    { id: 2, name: 'اسم فرعي', key: 'Note', type: 'text' },
    { id: 3, name: 'الموقع', key: 'LocationProject', type: 'text' },
    { id: 4, name: 'الحارس', key: 'GuardNumber', type: 'number' },
    { id: 5, name: 'الرقم المرجعي', key: 'Referencenumber', type: 'number' },
    { id: 6, name: 'تاريخ توقيع العقد', key: 'Contractsigningdate', type: 'date' },
  ];

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: (key === 'GuardNumber' || key === 'Referencenumber')
        ? value.replace(/[^\d]/g, '')
        : value
    }));
  };

  const handleContractTypeChange = (option: number) => {
    setContractOption(option);
    if (option === 1) {
      setFormData(prev => ({ ...prev, TypeOFContract: 'عظم', TypeSub: 'بدون قبو' }));
      setSubOption(1);
    } else if (option === 2) {
      setFormData(prev => ({ ...prev, TypeOFContract: 'تشطيب', TypeSub: 'بدون قبو' }));
      setSubOption(1);
    } else if (option === 3) {
      setFormData(prev => ({ ...prev, TypeOFContract: 'حر', TypeSub: 'حر' }));
    }
  };

  const handleSubTypeChange = (option: number) => {
    setSubOption(option);
    setFormData(prev => ({
      ...prev,
      TypeSub: option === 1 ? 'بدون قبو' : 'مع قبو'
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
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f6f8fe' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="#2117FB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="text-lg font-ibm-arabic-bold text-gray-900">إنشاء مشروع جديد</h1>
          <div className="w-10"></div>
        </div>
      </div>

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

        {/* Building Count */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <label className="block text-right font-ibm-arabic-semibold text-gray-900 mb-4" style={{ fontSize: scale(16) }}>
            عدد المباني
          </label>
          <div className="flex items-center justify-center space-x-6 space-x-reverse">
            <button
              onClick={() => handleBuildingCountChange('minus')}
              className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors border-2 border-gray-200"
              disabled={formData.numberBuilding <= 0}
            >
              <span className="text-2xl font-bold text-gray-700">-</span>
            </button>
            <div className="bg-blue-50 rounded-xl px-6 py-3 min-w-[80px]">
              <span className="text-3xl font-ibm-arabic-bold text-blue-600 text-center block">
                {formData.numberBuilding}
              </span>
            </div>
            <button
              onClick={() => handleBuildingCountChange('plus')}
              className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
            >
              <span className="text-2xl font-bold text-white">+</span>
            </button>
          </div>
        </div>

        {/* Contract Type Selection */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <label className="block text-right font-ibm-arabic-semibold text-gray-900 mb-4" style={{ fontSize: scale(16) }}>
            نوع العقد
          </label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 1, label: 'عظم', value: 'عظم' },
              { id: 2, label: 'تشطيب', value: 'تشطيب' },
              { id: 3, label: 'حر', value: 'حر' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => handleContractTypeChange(option.id)}
                className={`p-4 rounded-xl font-ibm-arabic-semibold transition-all duration-200 border-2 ${
                  contractOption === option.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
                style={{ fontSize: scale(14) }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub Type Selection (only for عظم and تشطيب) */}
        {contractOption !== 3 && (
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <label className="block text-right font-ibm-arabic-semibold text-gray-900 mb-4" style={{ fontSize: scale(16) }}>
              نوع فرعي
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 1, label: 'بدون قبو' },
                { id: 2, label: 'مع قبو' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSubTypeChange(option.id)}
                  className={`p-4 rounded-xl font-ibm-arabic-semibold transition-all duration-200 border-2 ${
                    subOption === option.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                  style={{ fontSize: scale(14) }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

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
    </div>
  );
};

export default CreateProjectPage;
