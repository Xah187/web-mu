'use client';

import { useState } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import { useAppSelector } from '@/store';
import Input from '@/components/design/Input';
import ButtonLong from '@/components/design/ButtonLong';
import Combobox from '@/components/design/Combobox';
import { Tostget } from '@/components/ui/Toast';
import axiosInstance from '@/lib/api/axios';

interface AddMemberModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const jobsList = [
  { id: 1, name: 'مهندس موقع' },
  { id: 2, name: 'مستشار جودة' },
  { id: 3, name: 'مدير عقود' },
  { id: 4, name: 'مالك' },
  { id: 5, name: 'زائر' },
  { id: 6, name: 'مقاول' },
  { id: 7, name: 'حارس موقع' },
  { id: 8, name: 'مراقب جودة' },
  { id: 9, name: 'مدخل بيانات' },
  { id: 10, name: 'موظف' },
  { id: 11, name: 'إستشاري موقع' },
  { id: 12, name: 'مراقب موقع' },
];

const adminJobsList = [
  { id: 13, name: 'مسئول طلبيات' },
  { id: 14, name: 'مسئول طلبيات خفيفة' },
  { id: 15, name: 'مسئول طلبيات ثقيلة' },
  { id: 16, name: 'مالية' },
  { id: 17, name: 'موارد بشرية' },
  { id: 18, name: 'مدير عام' },
  { id: 19, name: 'مدير تنفيذي' },
];

const jobDescriptions = [
  { id: 1, name: 'موظف' },
  { id: 2, name: 'مدير' },
  { id: 3, name: 'مشرف' },
  { id: 4, name: 'منسق' },
];

// Helper function to convert Arabic numbers to English
const convertArabicToEnglish = (input: string | number | null | undefined): string => {
  // تحويل المدخل إلى نص أولاً
  const str = String(input || '');
  
  const arabicNumerals = '٠١٢٣٤٥٦٧٨٩';
  const englishNumerals = '0123456789';
  
  return str.split('').map(char => {
    const index = arabicNumerals.indexOf(char);
    return index !== -1 ? englishNumerals[index] : char;
  }).join('');
};

export default function AddMemberModal({ onClose, onSuccess }: AddMemberModalProps) {
  const { user, size } = useAppSelector((state: any) => state.user);
  const [loading, setLoading] = useState(false);
  
  // TODO: ربط صلاحيات افتراضية لاحقاً (محاذاة مع الموبايل)
  
  const [formData, setFormData] = useState({
    userName: '',
    IDNumber: '',
    PhoneNumber: '',
    job: '',
    jobdiscrption: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Get available jobs based on user role
  const getAvailableJobs = () => {
    const isAdmin = user?.data?.job === 'Admin' || user?.data?.job === 'مدير الفرع';
    return isAdmin ? [...jobsList, ...adminJobsList] : jobsList;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.userName || !String(formData.userName).trim()) {
      newErrors.userName = 'اسم العضو مطلوب';
    }
    
    if (!formData.IDNumber || !String(formData.IDNumber).trim()) {
      newErrors.IDNumber = 'رقم البطاقة مطلوب';
    }
    
    if (!formData.PhoneNumber || !String(formData.PhoneNumber).trim()) {
      newErrors.PhoneNumber = 'رقم الجوال مطلوب';
    } else if (String(formData.PhoneNumber).length < 9) {
      newErrors.PhoneNumber = 'رقم الجوال غير صحيح';
    }
    
    if (!formData.job || !String(formData.job).trim()) {
      newErrors.job = 'الوظيفة مطلوبة';
    }
    
    if (!formData.jobdiscrption || !String(formData.jobdiscrption).trim()) {
      newErrors.jobdiscrption = 'صفة المستخدم مطلوبة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Tostget('يجب إكمال جميع البيانات المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        IDCompany: user?.data?.IDCompany,
        userName: String(formData.userName || '').trim(),
        IDNumber: convertArabicToEnglish(formData.IDNumber),
        PhoneNumber: convertArabicToEnglish(formData.PhoneNumber),
        job: String(formData.job || '').trim(),
        jobdiscrption: String(formData.jobdiscrption || '').trim(),
      };

      console.log('Adding user with data:', dataToSend);

      const response = await axiosInstance.post('user', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Add response:', response.data);

      if (response.status === 200) {
        if (response.data?.success || response.data?.message === 'تمت العملية بنجاح' || response.data === 'تمت العملية بنجاح') {
          Tostget('تمت إضافة العضو بنجاح');
          onSuccess();
        } else {
          Tostget(response.data?.message || response.data || 'فشل في إضافة العضو');
        }
      } else {
        Tostget('حدث خطأ في الخادم');
      }
    } catch (error: any) {
      console.error('Error adding member:', error);
      Tostget(error.response?.data?.message || 'خطأ في إضافة العضو');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          
          <h2 
            className="font-bold text-lg"
            style={{
              fontFamily: fonts.IBMPlexSansArabicSemiBold,
              fontSize: verticalScale(16 + size),
              color: colors.BLACK
            }}
          >
            إضافة عضو جديد
          </h2>
          
          <div className="w-10" />
        </div>

        {/* Form */}
        <div
          style={{
            padding: `${scale(24)}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${scale(20)}px`
          }}
        >
          {/* User Name */}
          <div>
            <Input
              name="اسم العضو"
              value={formData.userName}
              onChange={(value: string) => handleInputChange('userName', value)}
              type="text"
              error={errors.userName}
              marginBottom={0}
            />
          </div>

          {/* ID Number */}
          <div>
            <Input
              name="رقم البطاقة"
              value={formData.IDNumber}
              onChange={(value: string) => handleInputChange('IDNumber', convertArabicToEnglish(value))}
              type="tel"
              error={errors.IDNumber}
              marginBottom={0}
            />
          </div>

          {/* Phone Number */}
          <div>
            <Input
              name="رقم الجوال"
              value={formData.PhoneNumber}
              onChange={(value: string) => handleInputChange('PhoneNumber', convertArabicToEnglish(value))}
              type="tel"
              error={errors.PhoneNumber}
              marginBottom={0}
            />
          </div>

          {/* Job */}
          <div>
            <Combobox
              label="الوظيفة"
              value={formData.job}
              onChange={(value: string) => handleInputChange('job', value)}
              options={getAvailableJobs()}
              placeholder="اختر الوظيفة"
            />
            {errors.job && (
              <p
                className="text-red-500 text-right"
                style={{
                  fontSize: `${scale(12 + size)}px`,
                  fontFamily: fonts.IBMPlexSansArabicMedium,
                  marginTop: `${scale(4)}px`,
                  lineHeight: 1.4
                }}
              >
                {errors.job}
              </p>
            )}
          </div>

          {/* Job Description */}
          <div>
            <Combobox
              label="صفة المستخدم"
              value={formData.jobdiscrption}
              onChange={(value: string) => handleInputChange('jobdiscrption', value)}
              options={jobDescriptions}
              placeholder="اختر صفة المستخدم"
            />
            {errors.jobdiscrption && (
              <p className="text-red-500 text-sm mt-1">{errors.jobdiscrption}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            style={{
              fontFamily: fonts.CAIROBOLD,
              fontSize: 14 + size
            }}
          >
            إلغاء
          </button>
          
          <ButtonLong
            text={loading ? 'جاري الإضافة...' : 'إضافة العضو'}
            Press={handleSubmit}
            disabled={loading}
            styleButton={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
}
