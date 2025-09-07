# دليل نظام الصلاحيات المحدث - إصلاح مشكلة تغيير الصلاحيات في الفروع

## المشكلة التي تم حلها

### المشكلة الأصلية:
- في التطبيق والويب، الصلاحيات تتغير عند دخول الفروع
- السبب: يتم تحديث `boss` من API الفرع مما يؤثر على منطق الصلاحيات
- في الصفحة الرئيسية: الصلاحيات مبنية على الوظيفة فقط
- في الفروع: الصلاحيات تتأثر بحالة `boss` من API

### الحل المطبق:
1. **إنشاء نظام صلاحيات مزدوج:**
   - `useJobBasedPermissions`: للصلاحيات الثابتة المبنية على الوظيفة
   - `useValidityUser`: للصلاحيات التي قد تتأثر بالسياق

2. **تحديث منطق الصلاحيات:**
   - أولوية للوظيفة الفعلية في المنطق
   - حالة `boss` كفحص ثانوي فقط

## الـ Hooks الجديدة والمحدثة

### 1. `useJobBasedPermissions` (جديد)
**الغرض:** صلاحيات ثابتة مبنية على الوظيفة فقط - لا تتغير مع السياق

```typescript
import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';

function HomePage() {
  const {
    hasJobPermission,      // فحص صلاحية معينة
    isAdmin,              // هل المستخدم مشرف
    isBranchManager,      // هل المستخدم مدير فرع
    isFinance,            // هل المستخدم مالية
    isEmployee,           // هل المستخدم موظف
    
    // وظائف مساعدة
    canCreateProject,     // يمكن إنشاء مشروع
    canManageFinance,     // يمكن إدارة المالية
    canEditPermissions,   // يمكن تعديل الصلاحيات
    // ... المزيد
    
    getUserRole,          // الحصول على دور المستخدم
    getJobPermissions,    // الحصول على جميع الصلاحيات
  } = useJobBasedPermissions();

  return (
    <div>
      {canCreateProject() && <CreateProjectButton />}
      {isAdmin && <AdminPanel />}
      {hasJobPermission('تعديل صلاحيات') && <EditPermissionsButton />}
    </div>
  );
}
```

### 2. `useValidityUser` (محدث)
**الغرض:** صلاحيات قد تتأثر بالسياق - للحالات الخاصة

```typescript
import useValidityUser from '@/hooks/useValidityUser';

function BranchPage() {
  const {
    hasPermission,        // فحص صلاحية (قد تتأثر بالسياق)
    Uservalidation,       // فحص مع رسائل خطأ
    isAdmin,             // مع الأخذ في الاعتبار السياق
    isBranchManager,     // مع الأخذ في الاعتبار السياق
  } = useValidityUser();

  const handleAction = async () => {
    const hasAccess = await Uservalidation('إنشاء طلبات');
    if (hasAccess) {
      // تنفيذ العملية
    }
  };

  return (
    <div>
      {hasPermission('إنشاء طلبات') && <CreateRequestButton />}
    </div>
  );
}
```

## متى تستخدم كل Hook؟

### استخدم `useJobBasedPermissions` في:
1. **الصفحة الرئيسية** - دائماً
2. **قوائم التطبيق الأساسية** - للثبات
3. **العمليات الحساسة** - مثل حذف المستخدمين
4. **إعدادات الصلاحيات** - عند تحديد ما يمكن للمستخدم فعله
5. **أي مكان تريد فيه صلاحيات ثابتة**

### استخدم `useValidityUser` في:
1. **صفحات الفروع** - إذا كنت تحتاج للسياق
2. **العمليات الخاصة بالفرع** - مثل طلبات خاصة بفرع
3. **عندما تحتاج رسائل خطأ تلقائية**

## أمثلة تطبيقية

### مثال 1: الصفحة الرئيسية
```typescript
'use client';

import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';
import PermissionGuard from '@/components/auth/PermissionGuard';

export default function HomePage() {
  const {
    canCreateBranch,
    canViewReports,
    isEmployee,
    getUserRole
  } = useJobBasedPermissions();

  return (
    <div>
      <h1>أهلاً {getUserRole}</h1>
      
      {/* زر إنشاء فرع - للمشرفين فقط */}
      {canCreateBranch() && (
        <button>إنشاء فرع جديد</button>
      )}
      
      {/* التقارير - للمشرفين ومديري الفروع والمالية */}
      {canViewReports() && (
        <button>عرض التقارير</button>
      )}
      
      {/* إخفاء بعض الأزرار عن الموظفين */}
      {!isEmployee && (
        <button>إعدادات متقدمة</button>
      )}
    </div>
  );
}
```

### مثال 2: صفحة الفرع
```typescript
'use client';

import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';
import useValidityUser from '@/hooks/useValidityUser';

export default function BranchPage() {
  // للعمليات الأساسية - استخدم Job-based
  const {
    canCreateProject,
    canViewReports,
    isAdmin
  } = useJobBasedPermissions();
  
  // للعمليات الخاصة بالسياق - استخدم Validity
  const {
    hasPermission,
    Uservalidation
  } = useValidityUser();

  const handleCreateRequest = async () => {
    // فحص مع رسالة خطأ تلقائية
    const canCreate = await Uservalidation('إنشاء طلبات');
    if (canCreate) {
      // إنشاء الطلب
    }
  };

  return (
    <div>
      {/* الأزرار الأساسية - استخدم Job-based */}
      {canCreateProject() && (
        <button>إنشاء مشروع</button>
      )}
      
      {canViewReports() && (
        <button>التقارير</button>
      )}
      
      {/* العمليات الخاصة بالسياق */}
      {hasPermission('إنشاء طلبات') && (
        <button onClick={handleCreateRequest}>
          إنشاء طلب
        </button>
      )}
      
      {/* للمشرفين فقط */}
      {isAdmin && (
        <button>إعدادات الفرع</button>
      )}
    </div>
  );
}
```

### مثال 3: استخدام PermissionGuard
```typescript
import PermissionGuard from '@/components/auth/PermissionGuard';
import useJobBasedPermissions from '@/hooks/useJobBasedPermissions';

export default function ProjectPage() {
  const { hasJobPermission } = useJobBasedPermissions();

  return (
    <div>
      {/* استخدام Component Guard */}
      <PermissionGuard permission="إنشاء طلبات">
        <CreateRequestButton />
      </PermissionGuard>
      
      {/* استخدام Hook مباشر */}
      {hasJobPermission('تعديل مرحلة رئيسية') && (
        <EditStageButton />
      )}
    </div>
  );
}
```

## منطق الصلاحيات المحدث

### ترتيب فحص الصلاحيات:
1. **فحص المشرف:** `job === 'Admin' || job === 'مالية'`
2. **فحص الوظيفة:** `job === 'مدير الفرع'` (للغير-مشرف)
3. **فحص حالة الفرع:** `boss === 'مدير الفرع'` (ثانوي)
4. **فحص مصفوفة الصلاحيات:** `Validity.includes(permission)`

### قواعد الصلاحيات:
- **مالية = مشرف:** في منطق التطبيق
- **مشرف:** كامل الصلاحيات
- **مدير فرع:** كامل الصلاحيات عدا المشرف
- **الباقي:** حسب مصفوفة الصلاحيات

## الاختبار والتأكد

### مكون الاختبار
```typescript
import PermissionExamples from '@/components/examples/PermissionExamples';

// في أي صفحة للاختبار
<PermissionExamples />
```

هذا المكون يعرض:
- مقارنة بين النظامين
- الصلاحيات الحالية للمستخدم
- أمثلة على الاستخدام

## النتيجة

### قبل الإصلاح:
- ✅ الصفحة الرئيسية: صلاحيات ثابتة
- ❌ الفروع: صلاحيات تتغير

### بعد الإصلاح:
- ✅ الصفحة الرئيسية: صلاحيات ثابتة (`useJobBasedPermissions`)
- ✅ الفروع: خيار الصلاحيات الثابتة (`useJobBasedPermissions`)
- ✅ الفروع: خيار الصلاحيات السياقية (`useValidityUser`) عند الحاجة
- ✅ مرونة في الاختيار حسب الحاجة

## التوصيات

1. **ابدأ بـ `useJobBasedPermissions`** في كل مكان
2. **استخدم `useValidityUser`** فقط عند الحاجة للسياق
3. **للعمليات الحساسة** استخدم `useJobBasedPermissions` دائماً
4. **اختبر التغييرات** باستخدام `PermissionExamples`

## ملاحظات للتطوير المستقبلي

1. يمكن إضافة المزيد من الوظائف المساعدة في `useJobBasedPermissions`
2. يمكن إنشاء Guards مخصصة للعمليات المختلفة
3. يمكن إضافة نظام تسجيل (logging) للصلاحيات
4. يمكن إضافة نظام cache للصلاحيات لتحسين الأداء
