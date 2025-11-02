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
import { useTranslation } from '@/hooks/useTranslation';

interface AddMemberModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

// مطابق للتطبيق المحمول 100%
const jobsList = [
  { id: 1, name: 'مهندس موقع' },
  { id: 2, name: 'مستشار جودة' },
  { id: 3, name: 'مدير عقود' },
  { id: 4, name: 'مالك' },
  { id: 5, name: 'زائر' },
  { id: 6, name: 'مقاول' },
  { id: 7, name: 'حارس موقع' },
  { id: 8, name: 'زائر' },
  { id: 9, name: 'مراقب جودة' },
  { id: 10, name: 'مدخل بيانات' },
  { id: 11, name: 'موظف' },
  { id: 12, name: 'إستشاري موقع' },
  { id: 13, name: 'مراقب موقع' },
];

// مطابق للتطبيق المحمول 100%
const adminJobsList = [
  { id: 16, name: 'مسئول طلبيات' },
  { id: 14, name: 'مسئول طلبيات خفيفة' },
  { id: 15, name: 'مسئول طلبيات ثقيلة' },
  { id: 16, name: 'مالية' },
  { id: 17, name: 'موارد بشرية' },
  { id: 18, name: 'مدير عام' },
  { id: 19, name: 'مدير تنفيذي' },
];

// مطابق للتطبيق المحمول - خيارين فقط
const jobDescriptions = [
  { id: 1, name: 'موظف' },
  { id: 2, name: 'مستخدم' },
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

// Helper function to normalize phone number (same as backend)
const normalizePhone = (raw: string | number | null | undefined): string => {
  // يدعم 05XXXXXXXX أو 9665XXXXXXXX → 5XXXXXXXX
  let d = convertArabicToEnglish(raw).replace(/\D/g, "");
  if (d.startsWith("966")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  return d; // نتوقع 9 أرقام محلية
};

export default function AddMemberModal({ onClose, onSuccess }: AddMemberModalProps) {
  const { user, size } = useAppSelector((state: any) => state.user);
  const { t, isRTL, dir } = useTranslation();
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

    // اسم العضو: 2-100 حرف
    const nameStr = String(formData.userName || '').trim();
    if (!nameStr || nameStr.length < 2 || nameStr.length > 100) {
      newErrors.userName = t('members.memberNameRequired');
    }

    // رقم الهوية: 10-15 رقم
    const idNumberStr = convertArabicToEnglish(formData.IDNumber).replace(/\D/g, '');
    if (!idNumberStr || !/^\d{10,15}$/.test(idNumberStr)) {
      newErrors.IDNumber = t('members.idNumberInvalid');
    }

    // رقم الجوال: 9 أرقام بعد التطبيع
    const phoneNormalized = normalizePhone(formData.PhoneNumber);
    if (!/^\d{9}$/.test(phoneNormalized)) {
      newErrors.PhoneNumber = t('members.phoneNumberInvalid');
    }

    // الوظيفة: 2-100 حرف
    const jobStr = String(formData.job || '').trim();
    if (!jobStr || jobStr.length < 2 || jobStr.length > 100) {
      newErrors.job = t('members.jobRequired');
    }

    // صفة المستخدم: 2-500 حرف
    const jobDescStr = String(formData.jobdiscrption || '').trim();
    if (!jobDescStr || jobDescStr.length < 2 || jobDescStr.length > 500) {
      newErrors.jobdiscrption = t('members.jobDescriptionRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Tostget(t('members.fillAllFieldsCorrectly'));
      return;
    }

    setLoading(true);
    try {
      // تطبيع البيانات بنفس طريقة الباك اند
      const idNumberStr = convertArabicToEnglish(formData.IDNumber).replace(/\D/g, '');
      const phoneNormalized = normalizePhone(formData.PhoneNumber);

      const dataToSend = {
        IDCompany: user?.data?.IDCompany,
        userName: String(formData.userName || '').trim(),
        IDNumber: idNumberStr,
        PhoneNumber: phoneNormalized,
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
          Tostget(t('members.addSuccess'));
          onSuccess();
        } else {
          Tostget(response.data?.message || response.data || t('members.addError'));
        }
      } else {
        Tostget(t('members.serverError'));
      }
    } catch (error: any) {
      console.error('Error adding member:', error);

      // عرض رسالة الخطأ من الباك اند إذا كانت موجودة
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).join('\n');
        Tostget(errorMessages);
      } else {
        Tostget(error.response?.data?.message || t('members.addError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ direction: dir as 'rtl' | 'ltr' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ direction: dir as 'rtl' | 'ltr' }}>
        {/* Header */}
        <div className={`sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
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
            {t('members.addNewMember')}
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
              name={t('members.memberName')}
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
              name={t('members.idNumber')}
              value={formData.IDNumber}
              onChange={(value: string) => {
                // تحويل الأرقام العربية وإزالة أي حروف
                const cleaned = convertArabicToEnglish(value).replace(/\D/g, '');
                handleInputChange('IDNumber', cleaned);
              }}
              type="tel"
              error={errors.IDNumber}
              marginBottom={0}
            />
          </div>

          {/* Phone Number */}
          <div>
            <Input
              name={t('members.phoneNumber')}
              value={formData.PhoneNumber}
              onChange={(value: string) => {
                // تحويل الأرقام العربية وإزالة أي حروف
                const cleaned = convertArabicToEnglish(value).replace(/\D/g, '');
                handleInputChange('PhoneNumber', cleaned);
              }}
              type="tel"
              error={errors.PhoneNumber}
              marginBottom={0}
            />
          </div>

          {/* Job */}
          <div>
            <Combobox
              label={t('members.job')}
              value={formData.job}
              onChange={(value: string) => handleInputChange('job', value)}
              options={getAvailableJobs()}
              placeholder={t('members.selectJob')}
            />
            {errors.job && (
              <p
                className={`text-red-500 ${isRTL ? 'text-right' : 'text-left'}`}
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
              label={t('members.jobDescription')}
              value={formData.jobdiscrption}
              onChange={(value: string) => handleInputChange('jobdiscrption', value)}
              options={jobDescriptions}
              placeholder={t('members.selectJobDescription')}
            />
            {errors.jobdiscrption && (
              <p className={`text-red-500 text-sm mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>{errors.jobdiscrption}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            style={{
              fontFamily: fonts.CAIROBOLD,
              fontSize: 14 + size
            }}
          >
            {t('members.cancel')}
          </button>

          <ButtonLong
            text={loading ? t('members.adding') : t('members.addMember')}
            Press={handleSubmit}
            disabled={loading}
            styleButton={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
}
