'use client';

import React from 'react';
import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';
import useValidityUser from '@/hooks/useValidityUser';
import { useAppSelector } from '@/store';

/**
 * Example component showing the difference between job-based and context-based permissions
 * This demonstrates the fix for the permissions changing when entering branches
 */
export default function PermissionExamples() {
  // Job-based permissions (consistent everywhere)
  const {
    hasJobPermission,
    isAdmin: jobIsAdmin,
    isBranchManager: jobIsBranchManager,
    getUserRole: getJobRole,
    canCreateProject: jobCanCreateProject,
    canManageFinance: jobCanManageFinance,
  } = useJobBasedPermissions();

  // Context-based permissions (may change in branches)
  const {
    hasPermission: hasContextPermission,
    isAdmin: contextIsAdmin,
    isBranchManager: contextIsBranchManager,
    getUserRole: getContextRole,
  } = useValidityUser();

  const { user, boss, Validity } = useAppSelector(state => state.user);

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">نظام الصلاحيات - مقارنة</h2>
      
      {/* User Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">معلومات المستخدم</h3>
        <div className="space-y-1 text-sm">
          <p><strong>الاسم:</strong> {user?.data?.userName}</p>
          <p><strong>الوظيفة:</strong> {user?.data?.job}</p>
          <p><strong>الوصف الوظيفي:</strong> {user?.data?.jobdiscrption}</p>
          <p><strong>حالة الفرع:</strong> {boss || 'غير محدد'}</p>
          <p><strong>الصلاحيات:</strong> {Validity?.length ? Validity.join(', ') : 'لا توجد'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job-Based Permissions (Fixed) */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 mb-3">
            الصلاحيات المبنية على الوظيفة (ثابتة)
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>الدور:</strong> 
              <span className="ml-2 px-2 py-1 bg-green-100 rounded text-green-800">
                {getJobRole}
              </span>
            </div>
            
            <div className="space-y-1">
              <p><strong>مشرف:</strong> {jobIsAdmin ? '✅ نعم' : '❌ لا'}</p>
              <p><strong>مدير فرع:</strong> {jobIsBranchManager ? '✅ نعم' : '❌ لا'}</p>
              <p><strong>يمكن إنشاء مشروع:</strong> {jobCanCreateProject() ? '✅ نعم' : '❌ لا'}</p>
              <p><strong>يمكن إدارة المالية:</strong> {jobCanManageFinance() ? '✅ نعم' : '❌ لا'}</p>
              <p><strong>يمكن إنشاء طلبات:</strong> {hasJobPermission('إنشاء طلبات') ? '✅ نعم' : '❌ لا'}</p>
              <p><strong>يمكن تعديل صلاحيات:</strong> {hasJobPermission('تعديل صلاحيات') ? '✅ نعم' : '❌ لا'}</p>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-700">
            💡 هذه الصلاحيات لا تتغير عند دخول الفروع
          </div>
        </div>

        {/* Context-Based Permissions (May Change) */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="font-semibold text-orange-800 mb-3">
            الصلاحيات المبنية على السياق (قد تتغير)
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>الدور:</strong> 
              <span className="ml-2 px-2 py-1 bg-orange-100 rounded text-orange-800">
                {getContextRole()}
              </span>
            </div>
            
            <div className="space-y-1">
              <p><strong>مشرف:</strong> {contextIsAdmin() ? '✅ نعم' : '❌ لا'}</p>
              <p><strong>مدير فرع:</strong> {contextIsBranchManager() ? '✅ نعم' : '❌ لا'}</p>
              <p><strong>يمكن إنشاء طلبات:</strong> {hasContextPermission('إنشاء طلبات') ? '✅ نعم' : '❌ لا'}</p>
              <p><strong>يمكن تعديل صلاحيات:</strong> {hasContextPermission('تعديل صلاحيات') ? '✅ نعم' : '❌ لا'}</p>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-700">
            ⚠️ هذه الصلاحيات قد تتغير عند دخول الفروع
          </div>
        </div>
      </div>

      {/* Usage Recommendations */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">توصيات الاستخدام</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>للصفحة الرئيسية:</strong> استخدم <code className="bg-gray-200 px-1 rounded">useJobBasedPermissions</code>
          </p>
          <p>
            <strong>للفروع:</strong> استخدم <code className="bg-gray-200 px-1 rounded">useValidityUser</code> إذا كنت تحتاج للسياق
          </p>
          <p>
            <strong>للعمليات الحساسة:</strong> استخدم <code className="bg-gray-200 px-1 rounded">useJobBasedPermissions</code> دائماً
          </p>
          <p>
            <strong>للواجهات:</strong> استخدم <code className="bg-gray-200 px-1 rounded">useJobBasedPermissions</code> لثبات العرض
          </p>
        </div>
      </div>

      {/* Implementation Example */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-3">مثال على التطبيق</h3>
        <pre className="text-xs bg-blue-100 p-3 rounded overflow-x-auto">
{`// في الصفحة الرئيسية
import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';

function HomePage() {
  const { canCreateProject, isAdmin } = useJobBasedPermissions();
  
  return (
    <div>
      {canCreateProject() && <CreateProjectButton />}
      {isAdmin && <AdminPanel />}
    </div>
  );
}

// في صفحة الفرع (إذا كنت تحتاج للسياق)
import useValidityUser from '@/hooks/useValidityUser';

function BranchPage() {
  const { hasPermission } = useValidityUser();
  
  return (
    <div>
      {hasPermission('إنشاء طلبات') && <CreateRequestButton />}
    </div>
  );
}`}
        </pre>
      </div>
    </div>
  );
}
