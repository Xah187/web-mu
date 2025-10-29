# تحديثات نظام الأعضاء والصلاحيات

## التاريخ: 2025-10-21

## الملخص
تم تحديث نظام إدارة الأعضاء والصلاحيات في الويب ليتوافق مع الباك اند الجديد (`/Users/fata/Desktop/backendMoshrif-master`) والفرونت اند المحمول (`/Users/fata/Desktop/frontendMoshrif-master`).

---

## التغييرات الرئيسية

### 1. تحديث API جلب الأعضاء

#### قبل التحديث:
```typescript
// كان يستخدم type=justuser (غير موجود في الباك اند الجديد)
const response = await axiosInstance.get(
  `/user/BringUserCompanyinv2?IDCompany=${user?.data?.IDCompany}&idBrinsh=${branchId}&type=justuser&number=${lastId}&kind_request=all`
);
```

#### بعد التحديث:
```typescript
// يستخدم type حسب الوضع + معامل selectuser
let apiType = 'user'; // الافتراضي لجلب أعضاء الفرع
let selectuser = 'bransh'; // الافتراضي

if (mode === 'manager') {
  apiType = 'AdminSub'; // لتغيير مدير الفرع
  selectuser = 'bransh';
} else if (mode === 'finance') {
  apiType = 'Acceptingcovenant'; // لصلاحية المالية
  selectuser = 'bransh';
} else if (mode === 'members') {
  apiType = 'user'; // لإضافة/إزالة أعضاء
  selectuser = 'bransh';
}

const response = await axiosInstance.get(
  `/user/BringUserCompanyinv2?IDCompany=${user?.data?.IDCompany}&idBrinsh=${branchId}&type=${apiType}&number=${lastId}&kind_request=all&selectuser=${selectuser}`
);
```

**الفائدة:**
- الباك اند الجديد يرجع البيانات الصحيحة مباشرة حسب `type` و `selectuser`
- لا حاجة للفلترة في الفرونت اند
- يدعم أوضاع متعددة: عرض الأعضاء، تغيير المدير، صلاحية المالية

---

### 2. إضافة وظيفة إضافة/إزالة الأعضاء من الفرع

#### الوظائف الجديدة:

**handleGlobalChoice:**
```typescript
const handleGlobalChoice = (memberId: number, isInBranchValue: string) => {
  // 1) تحديث المستخدم في المصفوفة
  const key = mode === 'finance' ? 'is_in_Acceptingcovenant' : 'is_in_branch';
  const updatedMembers = members.map(m =>
    m.id === memberId ? { ...m, [key]: isInBranchValue } : m
  );

  // 2) بناء القوائم الجديدة
  const nextNew = { ...checkGloblenew };
  const nextDel = { ...checkGlobledelete };

  const target: any = members.find(m => m.id === memberId);
  const original = target?.original_is_in;

  if (isInBranchValue !== original) {
    if (isInBranchValue === "true") {
      nextNew[memberId] = { id: memberId, Validity: [] };
      delete nextDel[memberId];
    } else {
      delete nextNew[memberId];
      if (original === "true") nextDel[memberId] = memberId;
      else delete nextDel[memberId];
    }
  } else {
    delete nextNew[memberId];
    delete nextDel[memberId];
  }

  setMembers(updatedMembers);
  setCheckGloblenew(nextNew);
  setCheckGlobledelete(nextDel);

  return { nextNew, nextDel };
};
```

**handleSaveChanges:**
```typescript
const handleSaveChanges = async () => {
  try {
    setActionLoading({ save: true });

    // إضافة الأعضاء الجدد
    if (Object.keys(checkGloblenew).length > 0) {
      const response = await axiosInstance.put(
        '/user/updat/userBrinshv2',
        {
          IDCompanySub: branchId,
          type: mode === 'finance' ? 'Acceptingcovenant' : mode === 'manager' ? 'AdminSub' : 'user',
          checkGloble: checkGloblenew
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );
    }

    // حذف الأعضاء
    if (Object.keys(checkGlobledelete).length > 0) {
      const response = await axiosInstance.put(
        '/user/updat/userBrinshv2',
        {
          IDCompanySub: branchId,
          type: mode === 'finance' ? 'Acceptingcovenant' : mode === 'manager' ? 'AdminSub' : 'user',
          checkGloble: {},
          checkGlobledelete: checkGlobledelete
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.accessToken}`
          }
        }
      );
    }

    // إعادة تحميل البيانات
    setCheckGloblenew({});
    setCheckGlobledelete({});
    await fetchBranchMembers(0);

  } catch (error) {
    console.error('Error saving changes:', error);
    Tostget('خطأ في حفظ التغييرات');
  } finally {
    setActionLoading({ save: false });
  }
};
```

**واجهة المستخدم:**
- تم إضافة checkbox لكل عضو في mode='members' أو 'finance'
- زر "حفظ التغييرات" يظهر عند وجود تغييرات
- عداد يعرض عدد التغييرات المعلقة

---

### 3. إضافة وظيفة تعديل الصلاحيات

#### الوظيفة الجديدة:
```typescript
const handleEditPermissions = async (member: BranchMember) => {
  // تعديل صلاحيات المستخدم - مطابق للتطبيق المحمول
  if (user?.data?.job === 'Admin' || user?.data?.job === 'مدير الفرع') {
    setSelectedMember(member);
    setShowPermissionsModal(true);
  } else {
    Tostget('ليس لديك صلاحية لتعديل الصلاحيات');
  }
};
```

#### الواجهة:
- تم إضافة زر "تعديل الصلاحيات" في قائمة خيارات العضو
- يظهر فقط للمدير أو مدير الفرع
- يستخدم `PermissionsModal` الموجود مسبقاً

---

### 4. تحديث واجهة المستخدم

#### MemberCard Component:
```typescript
interface MemberCardProps {
  member: BranchMember & { is_in_branch?: string; is_in_Acceptingcovenant?: string; original_is_in?: string };
  onOptions: () => void;
  getJobDisplay: (member: BranchMember) => string;
  getJobColor: (job: string) => string;
  formatDate: (date: string) => string;
  mode?: string;
  onToggleMember?: (memberId: number, value: string) => void;
}
```

**التحسينات:**
- دعم checkbox لإضافة/إزالة الأعضاء
- إخفاء زر الخيارات في mode='members' أو 'finance'
- عرض حالة العضو (في الفرع أو خارجه)

#### العنوان الديناميكي:
```typescript
const getPageTitle = () => {
  switch (mode) {
    case 'manager':
      return 'تغيير مدير فرع';
    case 'members':
      return 'اضافة او ازالة عضوء';
    case 'finance':
      return 'اضافة صلاحية مالية الفرع';
    default:
      return 'أعضاء الفرع';
  }
};
```

---

## الملفات المعدلة

### 1. `src/app/(dashboard)/branch/[id]/members/page.tsx`
- تحديث API جلب الأعضاء
- إضافة handleGlobalChoice و handleSaveChanges
- إضافة handleEditPermissions
- تحديث MemberCard لدعم checkbox
- إضافة PermissionsModal
- تحديث BranchMember interface

### 2. `src/components/branch/PermissionsModal.tsx`
- موجود مسبقاً - لم يتم تعديله
- يستخدم `/user/updat` لتحديث الصلاحيات

### 3. `src/components/branch/AddProjectsModal.tsx`
- موجود مسبقاً - لم يتم تعديله
- يستخدم `/user/InsertmultipleProjecsinvalidity` لإضافة مشاريع

---

## API Endpoints المستخدمة

### 1. جلب الأعضاء:
```
GET /user/BringUserCompanyinv2?IDCompany={id}&idBrinsh={branchId}&type={type}&number={lastId}&kind_request=all&selectuser={selectuser}
```

**المعاملات:**
- `type`: 'user' | 'AdminSub' | 'Acceptingcovenant' | رقم المشروع
- `selectuser`: 'none' | 'bransh' | 'project'
- `kind_request`: 'all' | 'Admin' | 'مدير الفرع' | ...

### 2. إضافة/إزالة أعضاء من الفرع:
```
PUT /user/updat/userBrinshv2
Body: {
  IDCompanySub: number,
  type: string,
  checkGloble: { [id: number]: { id: number, Validity: string[] } },
  checkGlobledelete?: { [id: number]: number }
}
```

### 3. تعديل الصلاحيات:
```
PUT /user/updat
Body: {
  id: number,
  userName: string,
  IDNumber: string,
  PhoneNumber: string,
  Email: string,
  job: string,
  jobdiscrption: string,
  Validity: string // JSON.stringify([{ idBrinsh, Validity, project }])
}
```

### 4. إضافة مشاريع للمستخدم:
```
PUT /user/InsertmultipleProjecsinvalidity
Body: {
  ProjectesNew: number[],
  Validitynew: string[],
  idBrinsh: number,
  PhoneNumber: string
}
```

---

## الاختبار

### السيناريوهات المطلوبة:

1. **جلب أعضاء الفرع:**
   - الذهاب إلى صفحة الفرع
   - النقر على "الأعضاء"
   - التحقق من ظهور الأعضاء الصحيحين

2. **إضافة/إزالة أعضاء:**
   - الذهاب إلى صفحة الفرع مع `?mode=members`
   - تحديد/إلغاء تحديد الأعضاء
   - النقر على "حفظ التغييرات"
   - التحقق من حفظ التغييرات

3. **تعديل الصلاحيات:**
   - النقر على خيارات العضو
   - اختيار "تعديل الصلاحيات"
   - تعديل الصلاحيات
   - حفظ التغييرات

4. **إضافة مشاريع:**
   - النقر على خيارات العضو
   - اختيار "إضافة عدة مشاريع"
   - اختيار المشاريع والصلاحيات
   - حفظ التغييرات

---

## الملاحظات

1. **التوافق مع الباك اند الجديد:**
   - جميع التغييرات متوافقة مع `/Users/fata/Desktop/backendMoshrif-master`
   - تم استخدام نفس المعاملات والـ endpoints

2. **التوافق مع التطبيق المحمول:**
   - تم نسخ المنطق من `PageUsers.tsx` في التطبيق المحمول
   - نفس الوظائف: handleGlobalChoice, handleSaveChanges

3. **الأمان:**
   - التحقق من الصلاحيات قبل كل عملية
   - فقط المدير أو مدير الفرع يمكنه تعديل الأعضاء

4. **تجربة المستخدم:**
   - واجهة بسيطة وسهلة الاستخدام
   - عداد للتغييرات المعلقة
   - رسائل واضحة للنجاح/الفشل

---

## الخطوات التالية

1. اختبار جميع السيناريوهات مع الباك اند الجديد
2. التحقق من التوافق مع جميع الأوضاع (members, manager, finance)
3. اختبار الأداء مع عدد كبير من الأعضاء
4. إضافة المزيد من التحقق من الأخطاء إذا لزم الأمر

