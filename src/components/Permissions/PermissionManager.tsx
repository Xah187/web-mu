'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { PermissionType } from '@/hooks/useUserPermissions';
import { Tostget } from '@/components/ui/Toast';

interface PermissionManagerProps {
  userId: string;
  currentPermissions: PermissionType[];
  onSave: (permissions: PermissionType[]) => void;
  onCancel: () => void;
  isVisible: boolean;
}

// All available permissions from mobile app
const ALL_PERMISSIONS: PermissionType[] = [
  'اقفال المرحلة',
  'اضافة مرحلة فرعية',
  'إضافة مرحلة رئيسية',
  'تعديل مرحلة رئيسية',
  'تشييك الانجازات الفرعية',
  'إضافة تأخيرات',
  'انشاء مجلد او تعديله',
  'انشاء عمليات مالية',
  'ترتيب المراحل',
  'إنشاء طلبات',
  'تشييك الطلبات',
  'إشعارات المالية',
];

export default function PermissionManager({
  userId,
  currentPermissions,
  onSave,
  onCancel,
  isVisible
}: PermissionManagerProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionType[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<PermissionType[]>([]);

  useEffect(() => {
    if (isVisible) {
      setSelectedPermissions([...currentPermissions]);
      
      // Calculate available permissions (those not currently selected)
      const available = ALL_PERMISSIONS.filter(
        permission => !currentPermissions.includes(permission)
      );
      setAvailablePermissions(available);
    }
  }, [isVisible, currentPermissions]);

  const handleTogglePermission = (permission: PermissionType) => {
    const isCurrentlySelected = selectedPermissions.includes(permission);
    
    if (isCurrentlySelected) {
      // Remove permission
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
      setAvailablePermissions(prev => [...prev, permission]);
    } else {
      // Add permission
      setSelectedPermissions(prev => [...prev, permission]);
      setAvailablePermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const handleSave = () => {
    onSave(selectedPermissions);
    Tostget('تم حفظ الصلاحيات بنجاح');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-bordercolor">
          <h2 
            className="text-lg font-bold"
            style={{
              fontFamily: fonts.IBMPlexSansArabicBold,
              color: colors.BLACK
            }}
          >
            إدارة الصلاحيات
          </h2>
          <button
            onClick={onCancel}
            className="text-greay hover:text-black w-8 h-8 flex items-center justify-center"
            style={{ fontSize: 20 }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Selected Permissions */}
          <div className="mb-6">
            <h3 
              className="text-base font-bold mb-3"
              style={{
                fontFamily: fonts.IBMPlexSansArabicBold,
                color: colors.BLUE
              }}
            >
              الصلاحيات المختارة ({selectedPermissions.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedPermissions.map((permission) => (
                <PermissionButton
                  key={permission}
                  permission={permission}
                  isSelected={true}
                  onClick={() => handleTogglePermission(permission)}
                />
              ))}
              
              {selectedPermissions.length === 0 && (
                <p 
                  className="text-center py-4 col-span-full"
                  style={{
                    color: colors.GREAY,
                    fontFamily: fonts.IBMPlexSansArabicRegular
                  }}
                >
                  لم يتم اختيار أي صلاحيات
                </p>
              )}
            </div>
          </div>

          {/* Available Permissions */}
          <div className="mb-6">
            <h3 
              className="text-base font-bold mb-3"
              style={{
                fontFamily: fonts.IBMPlexSansArabicBold,
                color: colors.GREAY
              }}
            >
              الصلاحيات المتاحة ({availablePermissions.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availablePermissions.map((permission) => (
                <PermissionButton
                  key={permission}
                  permission={permission}
                  isSelected={false}
                  onClick={() => handleTogglePermission(permission)}
                />
              ))}
              
              {availablePermissions.length === 0 && (
                <p 
                  className="text-center py-4 col-span-full"
                  style={{
                    color: colors.GREAY,
                    fontFamily: fonts.IBMPlexSansArabicRegular
                  }}
                >
                  جميع الصلاحيات مختارة
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-bordercolor p-4">
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-black py-3 rounded-lg hover:bg-gray-300 transition-colors"
              style={{
                fontFamily: fonts.IBMPlexSansArabicMedium
              }}
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-lg text-white transition-colors"
              style={{
                backgroundColor: colors.BLUE,
                fontFamily: fonts.IBMPlexSansArabicMedium
              }}
            >
              حفظ ({selectedPermissions.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PermissionButtonProps {
  permission: PermissionType;
  isSelected: boolean;
  onClick: () => void;
}

function PermissionButton({ permission, isSelected, onClick }: PermissionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-3 rounded-lg border-2 transition-all duration-200 text-right
        ${isSelected 
          ? 'border-blue bg-blue/10' 
          : 'border-bordercolor bg-white hover:bg-gray-50'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <span 
          className="flex-1 text-sm"
          style={{
            fontFamily: fonts.IBMPlexSansArabicMedium,
            color: isSelected ? colors.BLUE : colors.BLACK
          }}
        >
          {permission}
        </span>
        
        <div 
          className={`
            w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
            ${isSelected 
              ? 'bg-blue border-blue' 
              : 'border-bordercolor'
            }
          `}
        >
          {isSelected && (
            <span className="text-white text-xs">✓</span>
          )}
        </div>
      </div>
    </button>
  );
}
