'use client';

import React, { useState } from 'react';
import { Tostget } from '@/components/ui/Toast';
import useBranchOperations from '@/hooks/useBranchOperations';

interface BranchFinanceTabProps {
  branchId: string;
  branchName: string;
  currentFinanceSettings?: {
    enabled: boolean;
    permissions: string[];
  };
}

interface FinancePermission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const defaultFinancePermissions: FinancePermission[] = [
  {
    id: 'expense_management',
    name: 'إدارة المصروفات',
    description: 'إضافة وتعديل وحذف المصروفات',
    enabled: false
  },
  {
    id: 'income_management',
    name: 'إدارة الإيرادات',
    description: 'إضافة وتعديل وحذف الإيرادات',
    enabled: false
  },
  {
    id: 'financial_reports',
    name: 'التقارير المالية',
    description: 'عرض وتصدير التقارير المالية',
    enabled: false
  },
  {
    id: 'budget_management',
    name: 'إدارة الميزانية',
    description: 'وضع وإدارة ميزانيات المشاريع',
    enabled: false
  },
  {
    id: 'payment_approval',
    name: 'الموافقة على المدفوعات',
    description: 'الموافقة على المدفوعات الكبيرة',
    enabled: false
  }
];

export default function BranchFinanceTab({ 
  branchId, 
  branchName, 
  currentFinanceSettings 
}: BranchFinanceTabProps) {
  const { updateFinancePermissions, loading } = useBranchOperations();
  
  const [financeEnabled, setFinanceEnabled] = useState(currentFinanceSettings?.enabled || false);
  const [permissions, setPermissions] = useState<FinancePermission[]>(
    defaultFinancePermissions.map(permission => ({
      ...permission,
      enabled: currentFinanceSettings?.permissions?.includes(permission.id) || false
    }))
  );

  const handleToggleFinance = async () => {
    try {
      const newStatus = !financeEnabled;
      await updateFinancePermissions(branchId, newStatus);
      setFinanceEnabled(newStatus);
      
      if (!newStatus) {
        // Disable all permissions if finance is disabled
        setPermissions(prev => prev.map(p => ({ ...p, enabled: false })));
      }
    } catch (error: any) {
      console.error('Error toggling finance:', error);
      Tostget(error.message || 'فشل في تحديث إعدادات المالية', 'error');
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    setPermissions(prev => prev.map(p => 
      p.id === permissionId ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const handleSavePermissions = async () => {
    try {
      if (!financeEnabled) {
        Tostget('يجب تفعيل إدارة المالية أولاً');
        return;
      }

      const enabledPermissions = permissions.filter(p => p.enabled).map(p => p.id);
      
      // TODO: Implement save permissions API call
      Tostget('ميزة حفظ الصلاحيات المالية ستكون متاحة قريباً');
      
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      Tostget(error.message || 'فشل في حفظ الصلاحيات', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">إدارة الصلاحيات المالية</h3>
      
      {/* Finance Enable/Disable */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">تفعيل إدارة المالية</h4>
            <p className="text-sm text-blue-700">
              تفعيل أو إلغاء تفعيل النظام المالي لهذا الفرع
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={financeEnabled}
              onChange={handleToggleFinance}
              disabled={loading}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Permissions List */}
      {financeEnabled && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">الصلاحيات المالية</h4>
          
          <div className="space-y-4">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{permission.name}</h5>
                  <p className="text-sm text-gray-600">{permission.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mr-4">
                  <input
                    type="checkbox"
                    checked={permission.enabled}
                    onChange={() => handleTogglePermission(permission.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSavePermissions}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 rtl:space-x-reverse"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{loading ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Finance Statistics */}
      {financeEnabled && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">إحصائيات مالية سريعة</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">0</p>
              <p className="text-sm text-green-600">إجمالي الإيرادات</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-700">0</p>
              <p className="text-sm text-red-600">إجمالي المصروفات</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">0</p>
              <p className="text-sm text-blue-600">الرصيد الحالي</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-700">0</p>
              <p className="text-sm text-purple-600">المعاملات الشهرية</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="mr-3">
            <h4 className="text-sm font-medium text-yellow-800">ملاحظة مهمة</h4>
            <p className="text-sm text-yellow-700 mt-1">
              هذه الميزة قيد التطوير. ستكون متاحة قريباً لإدارة الصلاحيات المالية بشكل كامل وربطها مع النظام المالي الموجود في التطبيق.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
