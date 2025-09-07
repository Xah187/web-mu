'use client';

import React from 'react';
import { useAppSelector } from '@/store';
import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';
import useValidityUser from '@/hooks/useValidityUser';

export default function DebugUserPage() {
  const { user, Validity, boss } = useAppSelector(state => state.user);
  
  const jobBased = useJobBasedPermissions();
  const validityBased = useValidityUser();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">معلومات المستخدم والصلاحيات</h1>
        
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">معلومات المستخدم</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>الاسم:</strong> {user?.data?.userName || 'غير محدد'}
            </div>
            <div>
              <strong>الوظيفة (job):</strong> {user?.data?.job || 'غير محدد'}
            </div>
            <div>
              <strong>الوصف الوظيفي (jobdiscrption):</strong> {user?.data?.jobdiscrption || 'غير محدد'}
            </div>
            <div>
              <strong>رقم الهاتف:</strong> {user?.data?.PhoneNumber || 'غير محدد'}
            </div>
            <div>
              <strong>حالة الفرع (boss):</strong> {boss || 'غير محدد'}
            </div>
            <div>
              <strong>عدد الصلاحيات:</strong> {Validity?.length || 0}
            </div>
          </div>
          
          {Validity && Validity.length > 0 && (
            <div className="mt-4">
              <strong>الصلاحيات:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {Validity.map((permission, index) => (
                  <li key={index} className="text-sm">{permission}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Job-Based Permissions */}
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-800">الصلاحيات المبنية على الوظيفة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <strong>مشرف:</strong> {jobBased.isAdmin ? '✅ نعم' : '❌ لا'}
            </div>
            <div>
              <strong>مدير فرع:</strong> {jobBased.isBranchManager ? '✅ نعم' : '❌ لا'}
            </div>
            <div>
              <strong>مالية:</strong> {jobBased.isFinance ? '✅ نعم' : '❌ لا'}
            </div>
            <div>
              <strong>موظف:</strong> {jobBased.isEmployee ? '✅ نعم' : '❌ لا'}
            </div>
            <div>
              <strong>يمكن إدارة المالية:</strong> {jobBased.canManageFinance() ? '✅ نعم' : '❌ لا'}
            </div>
            <div>
              <strong>يمكن إنشاء فرع:</strong> {jobBased.canCreateBranch() ? '✅ نعم' : '❌ لا'}
            </div>
            <div>
              <strong>يمكن عرض التقارير:</strong> {jobBased.canViewReports() ? '✅ نعم' : '❌ لا'}
            </div>
            <div>
              <strong>يمكن إنشاء مشروع:</strong> {jobBased.canCreateProject() ? '✅ نعم' : '❌ لا'}
            </div>
          </div>
          
          <div className="mt-4">
            <strong>الدور:</strong> 
            <span className="ml-2 px-2 py-1 bg-green-100 rounded text-green-800">
              {jobBased.getUserRole}
            </span>
          </div>
        </div>

        {/* Validity-Based Permissions */}
        <div className="bg-orange-50 rounded-lg shadow-sm border border-orange-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-800">الصلاحيات المبنية على السياق</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <strong>مشرف:</strong> {validityBased.isAdmin() ? '✅ نعم' : '❌ لا'}
            </div>
            <div>
              <strong>مدير فرع:</strong> {validityBased.isBranchManager() ? '✅ نعم' : '❌ لا'}
            </div>
            <div>
              <strong>مالية:</strong> {validityBased.isFinance() ? '✅ نعم' : '❌ لا'}
            </div>
            <div>
              <strong>موظف:</strong> {validityBased.isEmployee() ? '✅ نعم' : '❌ لا'}
            </div>
          </div>
          
          <div className="mt-4">
            <strong>الدور:</strong> 
            <span className="ml-2 px-2 py-1 bg-orange-100 rounded text-orange-800">
              {validityBased.getUserRole()}
            </span>
          </div>
        </div>

        {/* Permission Tests */}
        <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">اختبارات الصلاحيات المالية</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg">
              <h3 className="font-semibold mb-2">الوصول للمالية حسب الوظيفة:</h3>
              <p className="text-sm text-gray-600 mb-2">
                شرط الدخول: <code>isAdmin || isFinance || canManageFinance()</code>
              </p>
              <div className="space-y-2">
                <div>
                  <strong>isAdmin:</strong> {jobBased.isAdmin ? '✅ نعم' : '❌ لا'}
                </div>
                <div>
                  <strong>isFinance:</strong> {jobBased.isFinance ? '✅ نعم' : '❌ لا'}
                </div>
                <div>
                  <strong>canManageFinance:</strong> {jobBased.canManageFinance() ? '✅ نعم' : '❌ لا'}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-gray-100">
                  <strong>النتيجة النهائية:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded ${
                    (jobBased.isAdmin || jobBased.isFinance || jobBased.canManageFinance()) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(jobBased.isAdmin || jobBased.isFinance || jobBased.canManageFinance()) 
                      ? '✅ يمكن الدخول' 
                      : '❌ لا يمكن الدخول'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <h3 className="font-semibold mb-2">فحص صلاحيات مالية محددة:</h3>
              <div className="space-y-2">
                <div>
                  <strong>انشاء عمليات مالية:</strong> {jobBased.hasJobPermission('انشاء عمليات مالية') ? '✅ نعم' : '❌ لا'}
                </div>
                <div>
                  <strong>إشعارات المالية:</strong> {jobBased.hasJobPermission('إشعارات المالية') ? '✅ نعم' : '❌ لا'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Raw Data */}
        <details className="bg-gray-100 rounded-lg p-4 mt-6">
          <summary className="font-semibold cursor-pointer">البيانات الخام (للمطورين)</summary>
          <pre className="mt-4 text-xs overflow-auto bg-gray-900 text-green-400 p-4 rounded">
            {JSON.stringify({
              user: user?.data,
              Validity,
              boss,
            }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
