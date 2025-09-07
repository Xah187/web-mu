# دليل نظام الصلاحيات المتكامل - Moshrif Web

## ✅ **تم تطبيق نظام الصلاحيات بالكامل!**

### 🎯 **نظرة عامة**

تم تطبيق نظام صلاحيات متكامل يحاكي بدقة نظام الصلاحيات في التطبيق الأصلي، مع دعم كامل لجميع الأدوار والصلاحيات المختلفة.

---

## 🏗️ **هيكل النظام**

### **1. أنواع البيانات (`/src/types/permissions.ts`)**

```typescript
// أدوار المستخدمين
type UserRole = 'Admin' | 'مدير عام' | 'مدير الفرع' | 'مالية' | 'موظف';

// أنواع الصلاحيات (مطابقة للتطبيق الأصلي)
type PermissionType = 
  | 'اقفال المرحلة'
  | 'اضافة مرحلة فرعية'
  | 'إضافة مرحلة رئيسية'
  | 'تعديل مرحلة رئيسية'
  | 'تشييك الانجازات الفرعية'
  | 'إضافة تأخيرات'
  | 'انشاء مجلد او تعديله'
  | 'انشاء عمليات مالية'
  | 'ترتيب المراحل'
  | 'إنشاء طلبات'
  | 'تشييك الطلبات'
  | 'إشعارات المالية'
  | 'Admin';
```

### **2. Redux State (`/src/store/slices/userSlice.ts`)**

```typescript
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  Validity: PermissionType[];  // مصفوفة صلاحيات المستخدم
  boss: BossType;              // حالة مدير الفرع
}
```

---

## 🔧 **المكونات الأساسية**

### **1. useValidityUser Hook (`/src/hooks/useValidityUser.ts`)**

```typescript
const { 
  Uservalidation,        // التحقق من الصلاحية (async)
  hasPermission,         // فحص سريع للصلاحية (sync)
  isAdmin,              // هل المستخدم Admin
  isBranchManager,      // هل المستخدم مدير فرع
  isFinance,            // هل المستخدم مالية
  isEmployee,           // هل المستخدم موظف
  getUserRole,          // الحصول على دور المستخدم
  getUserPermissions    // الحصول على جميع صلاحيات المستخدم
} = useValidityUser();
```

### **2. PermissionGuard Component (`/src/components/auth/PermissionGuard.tsx`)**

```typescript
// حماية عامة بصلاحية واحدة
<PermissionGuard permission="Admin">
  <ButtonCreat text="إنشاء فرع" />
</PermissionGuard>

// حماية بصلاحيات متعددة
<PermissionGuard 
  permissions={['Admin', 'انشاء عمليات مالية']}
  requireAll={false}  // يحتاج أي صلاحية من القائمة
>
  <ButtonCreat text="العهد" />
</PermissionGuard>

// حماية Admin فقط
<AdminGuard>
  <ButtonCreat text="الأعضاء" />
</AdminGuard>

// منع الموظفين
<EmployeeRestricted>
  <ButtonCreat text="العهد" />
</EmployeeRestricted>
```

### **3. Permission API Hook (`/src/hooks/usePermissionAPI.ts`)**

```typescript
const { 
  fetchUserPermissions,     // جلب صلاحيات المستخدم
  fetchBranchPermissions,   // جلب صلاحيات الفرع
  refreshPermissions,       // تحديث الصلاحيات
  clearPermissions         // مسح الصلاحيات
} = usePermissionAPI();
```

---

## 🎨 **مكونات الواجهة**

### **1. PermissionList Component**

```typescript
<PermissionList
  selectedPermissions={permissions}
  onPermissionChange={setPermissions}
  readonly={false}
  title="صلاحيات المستخدم"
/>
```

### **2. PermissionSummary Component**

```typescript
<PermissionSummary />  // عرض مختصر لصلاحيات المستخدم الحالي
```

---

## 📋 **منطق الصلاحيات**

### **قواعد الصلاحيات (مطابقة للتطبيق الأصلي):**

#### **1. Admin:**
- ✅ **صلاحية كاملة**: يمكنه الوصول لجميع الميزات
- ✅ **تجاوز جميع القيود**: لا يحتاج فحص صلاحيات إضافية
- ✅ **إدارة المستخدمين**: يمكنه تعديل صلاحيات الآخرين

#### **2. مدير الفرع (`boss === 'مدير الفرع'`):**
- ✅ **صلاحية شبه كاملة**: يمكنه الوصول لجميع الميزات ما عدا Admin
- ✅ **إدارة الفرع**: صلاحيات كاملة داخل الفرع
- ❌ **لا يمكنه**: تعديل صلاحيات المستخدمين

#### **3. المستخدمون العاديون:**
- 🔍 **فحص مصفوفة الصلاحيات**: `Validity.includes(permission)`
- ✅ **صلاحيات محددة**: حسب ما هو موجود في `Validity`
- ❌ **قيود**: لا يمكن الوصول للميزات غير المصرح بها

### **كود منطق التحقق:**

```typescript
const KnowValidity = (kind: PermissionType, users = user): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      // إذا كان المستخدم Admin، السماح فوراً
      if (users?.data?.job === 'Admin') {
        return resolve(true);
      }
      
      // إذا كان مدير فرع وليس طلب Admin، السماح
      if (boss === 'مدير الفرع' && kind !== 'Admin') {
        return resolve(true);
      } else {
        // فحص وجود الصلاحية في مصفوفة الصلاحيات
        return Array.isArray(Validity) 
          ? resolve(Validity.includes(kind)) 
          : resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};
```

---

## 🚀 **الصفحات المطبقة**

### **1. الصفحة الرئيسية (`/home`)**
- ✅ **عرض صلاحيات المستخدم**: `PermissionSummary`
- ✅ **أزرار محمية**: إنشاء فرع، الأعضاء، العهد، الصلاحيات
- ✅ **فحص الصلاحيات**: قبل عرض كل زر

### **2. صفحة الأعضاء (`/members`)**
- ✅ **حماية الوصول**: Admin فقط يمكنه إدارة الأعضاء
- ✅ **فحص صلاحيات التعديل**: قبل تعديل أي مستخدم
- ✅ **نظام صلاحيات متدرج**: حسب دور المستخدم

### **3. صفحة إنشاء الفرع (`/create-branch`)**
- ✅ **حماية شاملة**: Admin فقط يمكنه إنشاء فروع
- ✅ **فحص الصلاحيات**: في جميع العمليات

### **4. صفحة إدارة الصلاحيات (`/permissions`)** - جديدة
- ✅ **Admin فقط**: صفحة مخصصة للمديرين
- ✅ **إدارة صلاحيات المستخدمين**: تعديل وحفظ
- ✅ **عرض مرئي للصلاحيات**: قائمة تفاعلية
- ✅ **فحص صلاحيات التعديل**: قبل تعديل أي مستخدم

---

## 🔄 **تدفق البيانات**

### **1. عند تسجيل الدخول:**
```
1. المستخدم يسجل دخول → تخزين بيانات المستخدم
2. usePermissionAPI يجلب الصلاحيات من API
3. تخزين الصلاحيات في Redux (Validity, boss)
4. تحديث واجهة المستخدم حسب الصلاحيات
```

### **2. عند فحص الصلاحيات:**
```
1. useValidityUser يقرأ من Redux
2. تطبيق منطق الفحص (Admin → مدير فرع → Validity)
3. إرجاع النتيجة (true/false)
4. عرض/إخفاء المحتوى حسب النتيجة
```

### **3. عند تحديث الصلاحيات:**
```
1. API call لتحديث صلاحيات المستخدم
2. تحديث Redux state
3. إعادة عرض الواجهة تلقائياً
4. تحديث الصلاحيات في جميع المكونات
```

---

## 📱 **التطبيق على الصفحات**

### **مثال: الصفحة الرئيسية**

```typescript
// استيراد نظام الصلاحيات
import useValidityUser from '@/hooks/useValidityUser';
import PermissionGuard, { AdminGuard } from '@/components/auth/PermissionGuard';
import { PermissionSummary } from '@/components/permissions/PermissionList';

export default function HomePage() {
  const { isAdmin, hasPermission } = useValidityUser();

  return (
    <div>
      {/* عرض صلاحيات المستخدم */}
      <PermissionSummary />
      
      {/* أزرار محمية */}
      <AdminGuard>
        <ButtonCreat text="إنشاء فرع" onpress={handleCreateBranch} />
      </AdminGuard>
      
      <PermissionGuard 
        permissions={['Admin', 'انشاء عمليات مالية']}
        requireAll={false}
      >
        <ButtonCreat text="العهد" onpress={handleCovenant} />
      </PermissionGuard>
    </div>
  );
}
```

---

## 🎯 **المميزات المحققة**

### ✅ **مطابقة كاملة للتطبيق الأصلي:**
- نفس منطق الفحص (`ValidityUser.tsx`)
- نفس أنواع الصلاحيات (`AddValidity.tsx`)
- نفس هيكل البيانات (Redux state)
- نفس سلوك API calls

### ✅ **نظام متكامل:**
- Hook للفحص (`useValidityUser`)
- Hook لجلب البيانات (`usePermissionAPI`)
- مكونات حماية (`PermissionGuard`)
- مكونات عرض (`PermissionList`)
- صفحة إدارة (`/permissions`)

### ✅ **تجربة مستخدم محسنة:**
- عرض مرئي للصلاحيات
- رسائل واضحة عند منع الوصول
- تحديث تلقائي للواجهة
- تصميم متجاوب ومتناسق

### ✅ **أمان شامل:**
- فحص الصلاحيات في الواجهة
- فحص الصلاحيات قبل API calls
- منع الوصول غير المصرح به
- رسائل تحذيرية واضحة

---

## 📚 **كيفية الاستخدام**

### **1. فحص صلاحية بسيط:**
```typescript
const { hasPermission } = useValidityUser();

if (hasPermission('إنشاء طلبات')) {
  // عرض زر إنشاء طلب
}
```

### **2. فحص صلاحية متقدم:**
```typescript
const { Uservalidation } = useValidityUser();

const handleAction = async () => {
  const hasAccess = await Uservalidation('Admin', userId);
  if (hasAccess) {
    // تنفيذ العملية
  }
  // رسالة الخطأ تظهر تلقائياً
};
```

### **3. حماية مكون:**
```typescript
<PermissionGuard permission="تشييك الطلبات">
  <RequestsComponent />
</PermissionGuard>
```

### **4. حماية متعددة الصلاحيات:**
```typescript
<PermissionGuard 
  permissions={['Admin', 'مدير الفرع', 'انشاء عمليات مالية']}
  requireAll={false}
  showError={true}
>
  <FinancialOperationsComponent />
</PermissionGuard>
```

---

## 🎉 **النتيجة النهائية**

✅ **نظام صلاحيات متكامل ومطابق بالكامل للتطبيق الأصلي**

✅ **كل مستخدم يرى فقط ما يحق له الوصول إليه**

✅ **واجهة مستخدم تتكيف تلقائياً حسب الصلاحيات**

✅ **أمان شامل في جميع مستويات التطبيق**

✅ **سهولة الصيانة والتطوير المستقبلي**

**النظام جاهز للاستخدام ويعمل بنفس آلية التطبيق الأصلي تماماً! 🚀**
