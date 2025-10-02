# 🔍 تدقيق شامل لجميع الأزرار والصلاحيات في التطبيق المحمول

## 📱 الصفحة الرئيسية (HomeAdmin.tsx)

### 1. زر "إنشاء فرع"
**السطر:** 424-437

**الكود:**
```javascript
<ButtonCreat
  onpress={async () => {
    if (await Uservalidation('Admin')) {
      setModulsBOOLEN({name: 'settingSub', verify: true});
    }
  }}
  text="إنشاء فرع"
/>
```

**الشرط:**
- ✅ الزر **يظهر دائماً** للجميع
- ✅ عند الضغط: يفحص صلاحية `'Admin'`
- ✅ إذا لم يكن Admin → رسالة خطأ

**الويب الحالي:** ✅ صحيح - يستخدم `AdminGuard` في `handleCreateBranch`

---

### 2. زر "العهد"
**السطر:** 439-461

**الكود:**
```javascript
let job = users?.data?.job === 'مالية' ? 'Admin' : users?.data?.job;

{job === 'Admin' && (
  <ButtonCreat
    onpress={async () => {
      const results = await Uservalidation('covenant');
      navigation.navigate('CovenantBrinsh', {
        IDCompanyBransh: 0,
        Acceptingcovenant: results,
      });
    }}
    text="العهد"
    number={BrinshData?.Covenantnumber}
  />
)}
```

**الشرط:**
- ✅ الزر يظهر **فقط** إذا `job === 'Admin'`
- ✅ المالية تُعامل كـ Admin
- ✅ عند الضغط: يفحص صلاحية `'covenant'`

**الويب الحالي:** ✅ **تم الإصلاح** - يستخدم `AdminGuard`

---

### 3. زر إعدادات الفرع (في كل بطاقة فرع)
**السطر:** 498-507

**الكود:**
```javascript
onpressSetting={async () => {
  const result = await Uservalidation('Admin');
  if (result) {
    setModulsBOOLEN({
      name: 'OpreationData',
      verify: true,
      items: item,
    });
  }
}}
```

**الشرط:**
- ✅ الزر **يظهر دائماً**
- ✅ عند الضغط: يفحص صلاحية `'Admin'`

**الويب الحالي:** يحتاج فحص

---

## 📱 صفحة الفرع (HomSub.tsx)

### 4. زر "إنشاء مشروع"
**السطر:** 466-482

**الكود:**
```javascript
<ButtonCreat
  styleButton={[
    styles.stylecreatproject,
    {
      display: user?.data?.jobdiscrption === 'موظف' ? 'flex' : 'none',
    },
  ]}
  onpress={async () => {
    if (await Uservalidation('إنشاء المشروع', 0)) {
      navigation.navigate('PageCreateProject', {
        IDCompanyBransh: IDCompanyBransh,
      });
    }
  }}
  text="انشاء مشروع"
/>
```

**الشرط:**
- ✅ الزر يظهر **فقط** إذا `jobdiscrption === 'موظف'`
- ✅ عند الضغط: يفحص صلاحية `'إنشاء المشروع'`

**الويب الحالي:** ✅ صحيح - يستخدم `<EmployeeOnly>` + `<PermissionBasedVisibility>`

---

### 5. زر "حذف المشروع" (في قائمة الخيارات)
**السطر:** 148

**الكود:**
```javascript
if (await Uservalidation('حذف المشروع', 0)) {
  // حذف المشروع
}
```

**الشرط:**
- ✅ يفحص صلاحية `'حذف المشروع'`

**الويب الحالي:** ✅ صحيح

---

### 6. زر "إغلاق المشروع" (في قائمة الخيارات)
**السطر:** 184

**الكود:**
```javascript
if (await Uservalidation('اغلاق المشروع', 0)) {
  // إغلاق المشروع
}
```

**الشرط:**
- ✅ يفحص صلاحية `'اغلاق المشروع'`

**الويب الحالي:** ✅ صحيح

---

### 7. زر "تعديل بيانات الفرع"
**السطر:** 258

**الكود:**
```javascript
if (await Uservalidation('تعديل بيانات الفرغ', 0)) {
  // تعديل الفرع
}
```

**الشرط:**
- ✅ يفحص صلاحية `'تعديل بيانات الفرغ'`

**الويب الحالي:** يحتاج فحص

---

### 8. زر "المشاريع المغلقة"
**السطر:** 264

**الكود:**
```javascript
if (await Uservalidation('المشاريع المغلقة', 0)) {
  // عرض المشاريع المغلقة
}
```

**الشرط:**
- ✅ يفحص صلاحية `'المشاريع المغلقة'`

**الويب الحالي:** يحتاج فحص

---

## 📱 صفحة المشروع (PageHomeProject.tsx)

### 9. زر "إنشاء مهمة" (إضافة مرحلة رئيسية)
**السطر:** 333-353

**الكود:**
```javascript
<View
  style={{
    display: user?.data?.jobdiscrption === 'موظف' ? 'flex' : 'none',
  }}>
  <ButtonCreat
    onpress={async () => {
      if (await Uservalidation('إضافة مرحلة رئيسية', idProject)) {
        setModulsBOOLEN({name: 'creatTask', verify: true});
      }
    }}
    text="انشاء مهمة"
  />
</View>
```

**الشرط:**
- ✅ الزر يظهر **فقط** إذا `jobdiscrption === 'موظف'`
- ✅ عند الضغط: يفحص صلاحية `'إضافة مرحلة رئيسية'`

**الويب الحالي:** ✅ صحيح - يستخدم `<EmployeeOnly>` + `<PermissionBasedVisibility>`

---

### 10. زر "ترتيب المراحل"
**السطر:** 200

**الكود:**
```javascript
if (await Uservalidation('ترتيب المراحل', idProject)) {
  // ترتيب المراحل
}
```

**الشرط:**
- ✅ يفحص صلاحية `'ترتيب المراحل'`

**الويب الحالي:** ✅ صحيح

---

### 11. زر "تعديل تاريخ المشروع"
**السطر:** 223

**الكود:**
```javascript
if (await Uservalidation('تعديل تاريخ المشروع', 0)) {
  // تعديل التاريخ
}
```

**الشرط:**
- ✅ يفحص صلاحية `'تعديل تاريخ المشروع'`

**الويب الحالي:** ✅ صحيح

---

### 12. زر "بدء تنفيذ المشروع"
**السطر:** 294

**الكود:**
```javascript
if (await Uservalidation('مدير الفرع', idProject)) {
  setTime(true);
}
```

**الشرط:**
- ✅ يفحص صلاحية `'مدير الفرع'`

**الويب الحالي:** ✅ **تم الإصلاح** - يستخدم `'مدير الفرع'`

---

### 13. زر "تعديل بيانات المشروع"
**السطر:** 299

**الكود:**
```javascript
if (await Uservalidation('تعديل بيانات المشروع')) {
  // تعديل البيانات
}
```

**الشرط:**
- ✅ يفحص صلاحية `'تعديل بيانات المشروع'`

**الويب الحالي:** ✅ صحيح

---

### 14. زر "حذف مرحلة رئيسية"
**السطر:** 400

**الكود:**
```javascript
if (await Uservalidation('حذف مرحلة رئيسية', 0)) {
  // حذف المرحلة
}
```

**الشرط:**
- ✅ يفحص صلاحية `'حذف مرحلة رئيسية'`

**الويب الحالي:** ✅ صحيح

---

## 📊 ملخص الأزرار التي تحتاج فحص

| # | الزر | الصفحة | الشرط في التطبيق | الويب | الحالة |
|---|------|--------|------------------|-------|--------|
| 1 | إنشاء فرع | Home | يظهر للجميع + فحص Admin | ✅ | ✅ صحيح |
| 2 | العهد | Home | `job === 'Admin'` | ✅ | ✅ **تم الإصلاح** |
| 3 | إعدادات الفرع | Home | يظهر للجميع + فحص Admin | ❓ | ⚠️ يحتاج فحص |
| 4 | إنشاء مشروع | Branch | `jobdiscrption === 'موظف'` | ✅ | ✅ صحيح |
| 5 | حذف المشروع | Branch | صلاحية | ✅ | ✅ صحيح |
| 6 | إغلاق المشروع | Branch | صلاحية | ✅ | ✅ صحيح |
| 7 | تعديل الفرع | Branch | صلاحية | ❓ | ⚠️ يحتاج فحص |
| 8 | المشاريع المغلقة | Branch | صلاحية | ❓ | ⚠️ يحتاج فحص |
| 9 | إنشاء مهمة | Project | `jobdiscrption === 'موظف'` | ✅ | ✅ صحيح |
| 10 | ترتيب المراحل | Project | صلاحية | ✅ | ✅ صحيح |
| 11 | تعديل التاريخ | Project | صلاحية | ✅ | ✅ صحيح |
| 12 | بدء التنفيذ | Project | `'مدير الفرع'` | ✅ | ✅ **تم الإصلاح** |
| 13 | تعديل البيانات | Project | صلاحية | ✅ | ✅ صحيح |
| 14 | حذف مرحلة | Project | صلاحية | ✅ | ✅ صحيح |

---

## 🔍 الفروقات المكتشفة والإصلاحات المطلوبة

### ❌ الفرق 1: زر تعديل الفرع (Branch Edit Button)

**التطبيق المحمول:**
```javascript
// BoxSubCompne.tsx السطر 51
{user.data.jobdiscrption === 'موظف' && (
  <SettingSvg onpressSetting={onpressSetting} />
)}
```
- ✅ الزر يظهر **فقط للموظفين**
- ✅ عند الضغط: يفحص صلاحية `'تعديل بيانات الفرغ'`

**الويب (قبل الإصلاح):**
```typescript
showEdit={isAdmin || isBranchManager}
```
- ❌ الزر يظهر للـ Admin ومدير الفرع
- ❌ لا يطابق التطبيق المحمول

**الويب (بعد الإصلاح):**
```typescript
showEdit={isEmployee} // Matching mobile app: BoxSubCompne.tsx line 51
```
- ✅ الزر يظهر **فقط للموظفين**
- ✅ يطابق التطبيق المحمول

---

### ❌ الفرق 2: فحص صلاحية تعديل الفرع

**التطبيق المحمول:**
```javascript
// HomSub.tsx السطر 258
if (await Uservalidation('تعديل بيانات الفرغ', 0)) {
  await EditeDataBrinsh();
  setModulsBOOLEN({name: 'Changename', verify: true});
}
```

**الويب (قبل الإصلاح):**
```typescript
const handleBranchEdit = (branch: any) => {
  if (isAdmin || isBranchManager) {
    setSelectedBranch(branch);
    setEditModalOpen(true);
  }
};
```
- ❌ يفحص `isAdmin || isBranchManager`
- ❌ لا يستخدم `Uservalidation`

**الويب (بعد الإصلاح):**
```typescript
const handleBranchEdit = async (branch: any) => {
  const hasPermission = await Uservalidation('تعديل بيانات الفرغ', 0);
  if (hasPermission) {
    setSelectedBranch(branch);
    setEditModalOpen(true);
  }
};
```
- ✅ يستخدم `Uservalidation('تعديل بيانات الفرغ', 0)`
- ✅ يطابق التطبيق المحمول

---

### ❌ الفرق 3: زر "المشاريع المغلقة" مفقود

**التطبيق المحمول:**
```javascript
// HomSub.tsx السطر 263-270
onpressClose={async () => {
  if (await Uservalidation('المشاريع المغلقة', 0)) {
    navigation.navigate('ProjectColse', {
      IDCompanyBransh: IDCompanyBransh,
    });
    setModulsBOOLEN({});
  }
}}
```
- ✅ يوجد زر "المشاريع المغلقة" في قائمة الإعدادات
- ✅ يفحص صلاحية `'المشاريع المغلقة'`

**الويب:**
- ❌ **الزر غير موجود!**
- ❌ لا توجد صفحة للمشاريع المغلقة

**الإصلاح المطلوب:**
- إضافة زر "المشاريع المغلقة" في صفحة الفرع
- إنشاء صفحة للمشاريع المغلقة
- فحص صلاحية `'المشاريع المغلقة'`

---

## ✅ الإصلاحات المنفذة

### 1. ✅ زر العهد في الصفحة الرئيسية
**قبل:** `<PermissionBasedVisibility permission="covenant">`
**بعد:** `<AdminGuard>` (يظهر فقط للـ Admin والمالية)

### 2. ✅ زر تعديل الفرع - شرط الظهور
**قبل:** `showEdit={isAdmin || isBranchManager}`
**بعد:** `showEdit={isEmployee}` (يظهر فقط للموظفين)

### 3. ✅ زر تعديل الفرع - فحص الصلاحية
**قبل:** `if (isAdmin || isBranchManager)`
**بعد:** `await Uservalidation('تعديل بيانات الفرغ', 0)`

---

## ⚠️ الإصلاحات المطلوبة (لم تُنفذ بعد)

### 1. ⚠️ زر "المشاريع المغلقة"
- إضافة الزر في صفحة الفرع
- إنشاء صفحة `/branch/[id]/closed-projects`
- فحص صلاحية `'المشاريع المغلقة'`

---

## 📊 ملخص نهائي

| الزر | التطبيق | الويب (قبل) | الويب (بعد) | الحالة |
|------|---------|-------------|-------------|--------|
| **إنشاء فرع** | يظهر للجميع + فحص Admin | ✅ صحيح | ✅ صحيح | ✅ |
| **العهد** | `job === 'Admin'` | ❌ خطأ | ✅ صحيح | ✅ **تم الإصلاح** |
| **تعديل الفرع (ظهور)** | `jobdiscrption === 'موظف'` | ❌ خطأ | ✅ صحيح | ✅ **تم الإصلاح** |
| **تعديل الفرع (صلاحية)** | `Uservalidation('تعديل بيانات الفرغ')` | ❌ خطأ | ✅ صحيح | ✅ **تم الإصلاح** |
| **المشاريع المغلقة** | موجود | ❌ غير موجود | ❌ غير موجود | ⚠️ **يحتاج إضافة** |
| **إنشاء مشروع** | `jobdiscrption === 'موظف'` | ✅ صحيح | ✅ صحيح | ✅ |
| **إنشاء مهمة** | `jobdiscrption === 'موظف'` | ✅ صحيح | ✅ صحيح | ✅ |
| **بدء التنفيذ** | `'مدير الفرع'` | ❌ خطأ | ✅ صحيح | ✅ **تم الإصلاح** |

---

## 🎯 الخلاصة

### تم إصلاح:
1. ✅ زر العهد - يظهر فقط للـ Admin
2. ✅ زر تعديل الفرع - يظهر فقط للموظفين
3. ✅ فحص صلاحية تعديل الفرع - يستخدم Uservalidation

### يحتاج إضافة:
1. ⚠️ زر "المشاريع المغلقة"
2. ⚠️ صفحة المشاريع المغلقة

