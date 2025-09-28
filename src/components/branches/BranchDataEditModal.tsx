'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { BranchData } from '@/hooks/useCompanyData';
import { Tostget } from '@/components/ui/Toast';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { scale, verticalScale } from '@/utils/responsiveSize';
import Input from '@/components/design/Input';

interface BranchDataEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: BranchData | null;
  onSave: (data: any) => Promise<void>;
  loading?: boolean;
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "number" | "password" | "text" | "email" | "tel";
  required?: boolean;
}

function InputField({ label, value, onChange, placeholder, type = 'text', required = false }: InputFieldProps) {
  const { size } = useAppSelector((state: any) => state.user);
  
  return (
    <div
      style={{
        width: '100%',
        marginBottom: `${scale(20)}px`
      }}
    >
      <Input
        name={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        marginBottom={0}
      />
    </div>
  );
}

function ButtonLong({ onPress, children, disabled = false }: { onPress: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <div 
      style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: verticalScale(25) 
      }}
    >
      <button
        onClick={onPress}
        disabled={disabled}
        style={{
          width: '85%',
          maxWidth: '400px',
          height: 50,
          backgroundColor: disabled ? colors.GREAY : colors.BLUE,
          borderRadius: 12,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseOver={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = '#1e0ff0';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseOut={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = colors.BLUE;
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {children}
      </button>
    </div>
  );
}

export default function BranchDataEditModal({
  isOpen,
  onClose,
  branch,
  onSave,
  loading = false
}: BranchDataEditModalProps) {
  const { size } = useAppSelector((state: any) => state.user);
  
  const [formData, setFormData] = useState({
    NameSub: '',
    BranchAddress: '',
    Email: '',
    PhoneNumber: ''
  });

  // Initialize form data when branch changes
  useEffect(() => {
    if (branch) {
      setFormData({
        NameSub: branch.NameSub || '',
        BranchAddress: branch.BranchAddress || '',
        Email: branch.Email || '',
        PhoneNumber: branch.PhoneNumber || ''
      });
    }
  }, [branch]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        NameSub: '',
        BranchAddress: '',
        Email: '',
        PhoneNumber: ''
      });
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (!branch) return;

      // Validate required fields
      if (!formData.NameSub.trim()) {
        Tostget('يرجى إدخال اسم الفرع');
        return;
      }

      if (!formData.BranchAddress.trim()) {
        Tostget('يرجى إدخال اسم المنطقة');
        return;
      }

      const updatedBranch = {
        ...branch,
        ...formData
      };

      await onSave(updatedBranch);
      onClose();
      Tostget('تم تحديث بيانات الفرع بنجاح', 'success');
    } catch (error) {
      console.error('Error saving branch:', error);
      Tostget('فشل في تحديث بيانات الفرع', 'error');
    }
  };

  const convertArabicToEnglish = (str: string) => {
    const arabicNumbers = '٠١٢٣٤٥٦٧٨٩';
    const englishNumbers = '0123456789';
    return str.replace(/[٠-٩]/g, (d) => englishNumbers[arabicNumbers.indexOf(d)]);
  };

  if (!isOpen || !branch) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-h-[85vh] overflow-hidden shadow-2xl"
        style={{
          backgroundColor: 'var(--theme-card-background)',
          border: '1px solid var(--theme-border)',
          borderRadius: `${scale(20)}px`,
          maxWidth: `${scale(480)}px`,
          minWidth: `${scale(400)}px`,
          fontFamily: fonts.IBMPlexSansArabicSemiBold,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div
          className="text-center"
          style={{
            borderBottom: '1px solid var(--theme-border)',
            background: 'linear-gradient(135deg, var(--theme-card-background) 0%, var(--theme-surface-secondary) 100%)',
            paddingLeft: scale(24),
            paddingRight: scale(24),
            paddingTop: scale(20),
            paddingBottom: scale(20),
            marginBottom: scale(16),
            borderTopLeftRadius: `${scale(20)}px`,
            borderTopRightRadius: `${scale(20)}px`
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--theme-primary-alpha, rgba(99, 102, 241, 0.1))' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7" stroke="var(--theme-primary, #6366f1)" strokeWidth="2"/>
                <path d="M3 7H21V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V7Z" stroke="var(--theme-primary, #6366f1)" strokeWidth="2"/>
                <path d="M8 11H16" stroke="var(--theme-primary, #6366f1)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 15H12" stroke="var(--theme-primary, #6366f1)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2
              className="font-bold"
              style={{
                fontSize: `${scale(18 + size)}px`,
                fontFamily: fonts.IBMPlexSansArabicBold,
                color: 'var(--theme-text-primary)',
                lineHeight: 1.4
              }}
            >
              تعديل بيانات الفرع
            </h2>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 left-4 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
            style={{
              padding: '10px',
              backgroundColor: 'var(--theme-surface-secondary)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text-secondary)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div 
          className="overflow-y-auto"
          style={{ 
            maxHeight: '75vh',
            padding: `${verticalScale(20)}px ${verticalScale(20)}px`,
            paddingBottom: verticalScale(30)
          }}
        >
          {/* اسم الفرع */}
          <InputField
            label="اسم الفرع"
            value={formData.NameSub}
            onChange={(value) => handleInputChange('NameSub', value)}
            placeholder="أدخل اسم الفرع"
            required
          />

          {/* اسم المنطقة */}
          <InputField
            label="اسم المنطقة"
            value={formData.BranchAddress}
            onChange={(value) => handleInputChange('BranchAddress', value)}
            placeholder="أدخل اسم المنطقة"
            required
          />

          {/* الأيميل */}
          <InputField
            label="الأيميل"
            value={formData.Email}
            onChange={(value) => handleInputChange('Email', value)}
            placeholder="أدخل الأيميل"
            type="email"
          />

          {/* رقم هاتف الفرع */}
          <InputField
            label="رقم هاتف الفرع"
            value={formData.PhoneNumber}
            onChange={(value) => handleInputChange('PhoneNumber', convertArabicToEnglish(value))}
            placeholder="أدخل رقم هاتف الفرع"
            type="tel"
          />

          {/* Save Button */}
          <ButtonLong
            onPress={handleSave}
            disabled={loading}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading && (
                <div 
                  style={{
                    width: 15,
                    height: 15,
                    border: `2px solid ${colors.WHITE}`,
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                />
              )}
              <span
                style={{
                  fontFamily: fonts.IBMPlexSansArabicSemiBold,
                  color: colors.WHITE,
                  fontSize: verticalScale(15 + size),
                  fontWeight: '600'
                }}
              >
                {loading ? 'جاري الحفظ...' : 'تعديل'}
              </span>
            </div>
          </ButtonLong>
        </div>
      </div>

      {/* Add keyframes for spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
