'use client';

import React from 'react';
import {
  EmployeeOnly,
  NonEmployeeOnly,
  PermissionBasedVisibility,
  JobBasedVisibility,
  AdminGuard,
  FinanceGuard,
  OwnerGuard,
  NonOwnerGuard
} from '@/components/auth/PermissionGuard';
import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';
import { useAppSelector } from '@/store';

/**
 * Examples showing how to hide/show content based on permissions
 * Replicates mobile app's hiding behavior exactly
 */
export default function PermissionHidingExamples() {
  const { isEmployee, isAdmin, isBranchManager } = useJobBasedPermissions();
  const { user } = useAppSelector(state => state.user);

  return (
    <div className="p-6 space-y-8 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">أمثلة على إخفاء المحتوى حسب الصلاحيات</h2>
      
      {/* User Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">معلومات المستخدم الحالي</h3>
        <div className="space-y-1 text-sm">
          <p><strong>الاسم:</strong> {user?.data?.userName}</p>
          <p><strong>الوظيفة:</strong> {user?.data?.job}</p>
          <p><strong>الوصف الوظيفي:</strong> {user?.data?.jobdiscrption}</p>
          <p><strong>موظف:</strong> {isEmployee ? '✅ نعم' : '❌ لا'}</p>
          <p><strong>مشرف:</strong> {isAdmin ? '✅ نعم' : '❌ لا'}</p>
          <p><strong>مدير فرع:</strong> {isBranchManager ? '✅ نعم' : '❌ لا'}</p>
        </div>
      </div>

      {/* Example 1: Employee-only content (like mobile app) */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">1. محتوى للموظفين فقط</h3>
        <p className="text-sm text-gray-600 mb-3">
          مطابق للتطبيق الأساسي: <code>display: user?.data?.jobdiscrption === 'موظف' ? 'flex' : 'none'</code>
        </p>
        
        <EmployeeOnly>
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-green-700 font-medium">✅ هذا المحتوى يظهر للموظفين فقط</p>
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">
              إنشاء مشروع (للموظفين)
            </button>
          </div>
        </EmployeeOnly>
        
        <EmployeeOnly fallback={
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <p className="text-gray-600">❌ هذا المحتوى مخفي لأنك لست موظف</p>
          </div>
        }>
          <div></div>
        </EmployeeOnly>
      </div>

      {/* Example 2: Non-employee content */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">2. محتوى لغير الموظفين</h3>
        <p className="text-sm text-gray-600 mb-3">
          مطابق للتطبيق الأساسي: <code>display: user?.data?.jobdiscrption !== 'موظف' ? 'flex' : 'none'</code>
        </p>
        
        <NonEmployeeOnly>
          <div className="bg-purple-50 border border-purple-200 rounded p-3">
            <p className="text-purple-700 font-medium">✅ هذا المحتوى يظهر لغير الموظفين</p>
            <button className="mt-2 bg-purple-600 text-white px-4 py-2 rounded">
              إعدادات متقدمة (للمدراء)
            </button>
          </div>
        </NonEmployeeOnly>
        
        <NonEmployeeOnly fallback={
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <p className="text-gray-600">❌ هذا المحتوى مخفي لأنك موظف</p>
          </div>
        }>
          <div></div>
        </NonEmployeeOnly>
      </div>

      {/* Example 3: Permission-based hiding */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">3. إخفاء حسب الصلاحية المحددة</h3>
        <p className="text-sm text-gray-600 mb-3">
          المحتوى يختفي تماماً إذا لم تكن لديك الصلاحية
        </p>
        
        <div className="space-y-3">
          <PermissionBasedVisibility permission="إنشاء طلبات">
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-blue-700 font-medium">✅ لديك صلاحية إنشاء الطلبات</p>
              <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">
                إنشاء طلب جديد
              </button>
            </div>
          </PermissionBasedVisibility>

          <PermissionBasedVisibility permission="انشاء عمليات مالية">
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-700 font-medium">✅ لديك صلاحية العمليات المالية</p>
              <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded">
                إدارة المالية
              </button>
            </div>
          </PermissionBasedVisibility>

          <PermissionBasedVisibility permission="تعديل صلاحيات">
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-700 font-medium">✅ لديك صلاحية تعديل الصلاحيات</p>
              <button className="mt-2 bg-red-600 text-white px-4 py-2 rounded">
                إدارة الصلاحيات
              </button>
            </div>
          </PermissionBasedVisibility>
        </div>
      </div>

      {/* Example 4: Admin-only content */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">4. محتوى للمشرفين فقط</h3>
        
        <AdminGuard>
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-700 font-medium">✅ أنت مشرف - يمكنك رؤية هذا المحتوى</p>
            <button className="mt-2 bg-red-600 text-white px-4 py-2 rounded">
              لوحة تحكم المشرف
            </button>
          </div>
        </AdminGuard>
        
        <AdminGuard fallback={
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <p className="text-gray-600">❌ هذا المحتوى للمشرفين فقط</p>
          </div>
        }>
          <div></div>
        </AdminGuard>
      </div>

      {/* Example 5: Finance-only content */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">5. محتوى للمالية فقط</h3>
        
        <FinanceGuard>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-yellow-700 font-medium">✅ لديك صلاحية المالية</p>
            <button className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded">
              التقارير المالية
            </button>
          </div>
        </FinanceGuard>
        
        <FinanceGuard fallback={
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <p className="text-gray-600">❌ هذا المحتوى للمالية فقط</p>
          </div>
        }>
          <div></div>
        </FinanceGuard>
      </div>

      {/* Example 6: Owner-specific content */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">6. محتوى خاص بالمالك</h3>
        <p className="text-sm text-gray-600 mb-3">
          ملاحظة: المالك يُعامل كموظف عادي في النظام (بدون صلاحيات خاصة)
        </p>

        <div className="space-y-3">
          <OwnerGuard>
            <div className="bg-purple-50 border border-purple-200 rounded p-3">
              <p className="text-purple-700 font-medium">✅ محتوى للمالك فقط</p>
              <p className="text-sm text-purple-600 mt-1">
                المالك يرى فقط المشاريع والفروع الموجودة في صلاحياته (مثل الموظفين)
              </p>
            </div>
          </OwnerGuard>

          <NonOwnerGuard>
            <div className="bg-cyan-50 border border-cyan-200 rounded p-3">
              <p className="text-cyan-700 font-medium">✅ محتوى لغير المالك</p>
            </div>
          </NonOwnerGuard>
        </div>
      </div>

      {/* Example 7: Complex job-based visibility */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">7. إخفاء معقد حسب الوظيفة</h3>

        <div className="space-y-3">
          <JobBasedVisibility showForJobRole="مدير الفرع">
            <div className="bg-indigo-50 border border-indigo-200 rounded p-3">
              <p className="text-indigo-700 font-medium">✅ محتوى لمدير الفرع فقط</p>
            </div>
          </JobBasedVisibility>

          <JobBasedVisibility hideForJobRole="موظف">
            <div className="bg-orange-50 border border-orange-200 rounded p-3">
              <p className="text-orange-700 font-medium">✅ محتوى مخفي عن الموظفين</p>
            </div>
          </JobBasedVisibility>
        </div>
      </div>

      {/* Example 8: Multiple permissions (OR logic) */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">8. صلاحيات متعددة (OR)</h3>
        <p className="text-sm text-gray-600 mb-3">
          يظهر المحتوى إذا كان لديك أي من الصلاحيات المطلوبة
        </p>
        
        <PermissionBasedVisibility 
          permissions={['Admin', 'انشاء عمليات مالية', 'تعديل صلاحيات']}
          requireAll={false}
        >
          <div className="bg-teal-50 border border-teal-200 rounded p-3">
            <p className="text-teal-700 font-medium">✅ لديك إحدى الصلاحيات المطلوبة</p>
            <button className="mt-2 bg-teal-600 text-white px-4 py-2 rounded">
              عمليات متقدمة
            </button>
          </div>
        </PermissionBasedVisibility>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">📋 ملخص الاستخدام</h3>
        <div className="text-sm space-y-2">
          <p><strong>EmployeeOnly:</strong> للمحتوى الذي يظهر للموظفين فقط</p>
          <p><strong>NonEmployeeOnly:</strong> للمحتوى الذي يخفى عن الموظفين</p>
          <p><strong>PermissionBasedVisibility:</strong> للإخفاء حسب صلاحية محددة</p>
          <p><strong>AdminGuard:</strong> للمحتوى الخاص بالمشرفين</p>
          <p><strong>FinanceGuard:</strong> للمحتوى الخاص بالمالية</p>
          <p><strong>OwnerGuard:</strong> للمحتوى الخاص بالمالك (يُعامل كموظف عادي)</p>
          <p><strong>NonOwnerGuard:</strong> للمحتوى المخفي عن المالك</p>
          <p><strong>JobBasedVisibility:</strong> للتحكم المعقد حسب الوظيفة</p>
        </div>
      </div>
    </div>
  );
}
