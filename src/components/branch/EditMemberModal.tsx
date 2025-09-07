'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/api/axios';
import { Tostget } from '@/components/ui/Toast';

interface BranchMember {
  id: number;
  userName: string;
  IDNumber?: string;
  PhoneNumber: string;
  Email: string;
  job: string;
  jobdiscrption: string;
  jobHOM?: string;
  image?: string;
  Date: string;
}

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: BranchMember | null;
  onSuccess: () => void;
}

export default function EditMemberModal({
  isOpen,
  onClose,
  member,
  onSuccess
}: EditMemberModalProps) {
  const { user } = useSelector((state: any) => state.user || {});
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    userName: '',
    IDNumber: '',
    PhoneNumber: '',
    Email: '',
    job: '',
    jobdiscrption: ''
  });

  useEffect(() => {
    if (member) {
      setFormData({
        userName: member.userName || '',
        IDNumber: member.IDNumber || '',
        PhoneNumber: member.PhoneNumber || '',
        Email: member.Email || '',
        job: member.job || '',
        jobdiscrption: member.jobdiscrption || ''
      });
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // التحقق من البيانات المطلوبة - مطابق للتطبيق المحمول
    if (!formData.userName.trim()) {
      Tostget('يرجى إدخال اسم العضو');
      return;
    }
    
    if (!formData.IDNumber.trim()) {
      Tostget('يرجى إدخال رقم البطاقة');
      return;
    }
    
    if (!formData.PhoneNumber.trim()) {
      Tostget('يرجى إدخال رقم الهاتف');
      return;
    }

    setLoading(true);
    try {
      // مطابق للتطبيق المحمول - API تعديل مستخدم
      const updateData = {
        ...formData,
        id: member.id
      };

      const response = await axiosInstance.put('/user/updat', updateData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`
        }
      });

      if (response.data?.success === 'تمت العملية بنجاح') {
        Tostget('تم تحديث بيانات العضو بنجاح');
        onSuccess();
        onClose();
      } else {
        Tostget(response.data?.success || 'فشل في تحديث البيانات');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      Tostget('خطأ في تحديث البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-ibm-arabic-bold text-gray-900 mb-6 text-center">
          تعديل بيانات العضو
        </h3>
        
        <div className="space-y-4">
          {/* اسم العضو */}
          <div>
            <label className="block text-sm font-ibm-arabic-medium text-gray-700 mb-2">
              اسم العضو *
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => handleInputChange('userName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-medium text-right focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="أدخل اسم العضو"
            />
          </div>

          {/* رقم البطاقة */}
          <div>
            <label className="block text-sm font-ibm-arabic-medium text-gray-700 mb-2">
              رقم البطاقة *
            </label>
            <input
              type="text"
              value={formData.IDNumber}
              onChange={(e) => handleInputChange('IDNumber', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-medium text-right focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="أدخل رقم البطاقة"
            />
          </div>

          {/* رقم الهاتف */}
          <div>
            <label className="block text-sm font-ibm-arabic-medium text-gray-700 mb-2">
              رقم الهاتف *
            </label>
            <input
              type="tel"
              value={formData.PhoneNumber}
              onChange={(e) => handleInputChange('PhoneNumber', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-medium text-right focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="أدخل رقم الهاتف"
            />
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <label className="block text-sm font-ibm-arabic-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={formData.Email}
              onChange={(e) => handleInputChange('Email', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-medium text-right focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>

          {/* الوظيفة */}
          <div>
            <label className="block text-sm font-ibm-arabic-medium text-gray-700 mb-2">
              الوظيفة *
            </label>
            <select
              value={formData.job}
              onChange={(e) => handleInputChange('job', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-medium text-right focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="مدير عام">مدير عام</option>
              <option value="مدير تنفيذي">مدير تنفيذي</option>
              <option value="مدير الفرع">مدير الفرع</option>
              <option value="مالية">مالية</option>
              <option value="موظف">موظف</option>
            </select>
          </div>

          {/* صفة المستخدم */}
          <div>
            <label className="block text-sm font-ibm-arabic-medium text-gray-700 mb-2">
              صفة المستخدم *
            </label>
            <select
              value={formData.jobdiscrption}
              onChange={(e) => handleInputChange('jobdiscrption', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg font-ibm-arabic-medium text-right focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="موظف">موظف</option>
              <option value="مستخدم">مستخدم</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-ibm-arabic-semibold hover:bg-gray-300 transition-colors"
          >
            إلغاء
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-ibm-arabic-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الحفظ...
              </>
            ) : (
              'حفظ التغييرات'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
