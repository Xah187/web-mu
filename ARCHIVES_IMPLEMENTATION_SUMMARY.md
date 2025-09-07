# تطبيق آلية الأرشيف في الويب - مطابقة للتطبيق المحمول

## 📋 ملخص التطبيق

تم تطبيق آلية الأرشيف بالكامل في الويب مطابقة للتطبيق المحمول، مع نفس الأسماء والمحتويات والوظائف.

## 🗂️ الملفات المنشأة

### 1. Hook الرئيسي
- **`src/hooks/useArchivesFunction.ts`**
  - مطابق تماماً لـ `useArchivesFunction` في التطبيق المحمول
  - يحتوي على جميع الدوال والحالات المطلوبة
  - APIs مطابقة: `BringArchives`, `BringArchivesFolderdata`, `AddFolderArchivesnew`, إلخ

### 2. الصفحات الرئيسية
- **`src/app/(dashboard)/project/[id]/archives/Archives.tsx`**
  - مطابق لـ `Archives.tsx` في التطبيق المحمول
  - عرض قائمة المجلدات الرئيسية
  - فلترة وبحث المجلدات
  - إنشاء مجلدات جديدة

- **`src/app/(dashboard)/project/[id]/archives/page.tsx`**
  - صفحة wrapper للمكون الرئيسي

- **`src/app/(dashboard)/archives/[id]/ArchivesSub.tsx`**
  - مطابق لـ `ArchivesSub.tsx` في التطبيق المحمول
  - عرض محتويات المجلدات الفرعية
  - رفع الملفات والمجلدات
  - عرض الملفات بأنواعها المختلفة

- **`src/app/(dashboard)/archives/[id]/page.tsx`**
  - صفحة wrapper للمكون الفرعي

### 3. المكونات المساعدة
- **`src/components/archives/CreateFolderModal.tsx`**
  - مودال إنشاء مجلد جديد في الصفحة الرئيسية

- **`src/components/archives/CreateFolderChildrenModal.tsx`**
  - مودال إنشاء مجلد أو رفع ملف في المجلدات الفرعية
  - يدعم التبديل بين إنشاء مجلد ورفع ملف

- **`src/components/archives/FilterModal.tsx`**
  - مودال فلترة وبحث المجلدات

- **`src/components/archives/OperationFileModal.tsx`**
  - مودال عمليات الملفات والمجلدات (تعديل/حذف)
  - يدعم كلاً من الملفات والمجلدات

- **`src/components/archives/FileViewerModal.tsx`**
  - عارض الملفات المختلفة (صور، فيديو، مستندات)
  - تحميل الملفات

## 🔧 APIs المطبقة

### 1. APIs الرئيسية
```typescript
// جلب مجلدات الأرشيف الرئيسية
BringArchives?idproject=${projectId}

// جلب محتويات مجلد فرعي
BringArchivesFolderdata?ArchivesID=${ArchivesID}&idSub=${idSub}&type=${type}&idproject=${idproject}

// إنشاء مجلد جديد
AddFolderArchivesnew (POST)

// إضافة ملف أو مجلد فرعي
AddfileinFolderHomeinArchive (POST)

// تحديث أو حذف مجلد/ملف
UpdateNameFolderOrfileinArchive (PUT)
```

### 2. معاملات APIs
- **BringArchives**: `idproject`
- **BringArchivesFolderdata**: `ArchivesID`, `idSub`, `type`, `idproject`
- **AddFolderArchivesnew**: `ProjectID`, `FolderName`
- **AddfileinFolderHomeinArchive**: `ArchivesID`, `id`, `type`, `file/name`
- **UpdateNameFolderOrfileinArchive**: `ArchivesID`, `id`, `type`, `name`, `nameOld`, `kidopreation`

## 🎯 الوظائف المطبقة

### 1. إدارة المجلدات
- ✅ عرض قائمة المجلدات الرئيسية
- ✅ إنشاء مجلد جديد
- ✅ تعديل اسم المجلد
- ✅ حذف المجلد
- ✅ فلترة وبحث المجلدات
- ✅ التمييز بين مجلدات النظام والمجلدات القابلة للتعديل

### 2. إدارة الملفات
- ✅ عرض محتويات المجلدات
- ✅ رفع ملفات جديدة
- ✅ إنشاء مجلدات فرعية
- ✅ تعديل أسماء الملفات والمجلدات
- ✅ حذف الملفات والمجلدات
- ✅ عرض الملفات (صور، فيديو، مستندات)
- ✅ تحميل الملفات

### 3. التنقل والواجهة
- ✅ التنقل بين المجلدات
- ✅ العودة للمجلد الأب
- ✅ عرض مسار التنقل (Breadcrumb)
- ✅ حالات التحميل والأخطاء
- ✅ رسائل التأكيد والنجاح

### 4. الصلاحيات
- ✅ التحقق من صلاحيات إنشاء المجلدات
- ✅ التحقق من صلاحيات رفع الملفات
- ✅ التحقق من صلاحيات التعديل والحذف
- ✅ منع التعديل على مجلدات النظام

## 🔄 التطابق مع التطبيق المحمول

### 1. نفس أسماء الملفات
- ✅ `Archives.tsx`
- ✅ `ArchivesSub.tsx`
- ✅ `useArchivesFunction.ts`

### 2. نفس أسماء الدوال
- ✅ `BringArchivesHome`
- ✅ `BringDataHom`
- ✅ `BringArchivesSubFolderdata`
- ✅ `BringData`
- ✅ `AddFolderArchivesnew`
- ✅ `CreatFoldernew`
- ✅ `UpdateArchives`
- ✅ `deleteOnpress`
- ✅ `updateOnpress`
- ✅ `handlerOpreation`

### 3. نفس States
- ✅ `arrafolder`
- ✅ `moudleBollen`
- ✅ `Input`
- ✅ `refreshing`
- ✅ `tilte`
- ✅ `Id`
- ✅ `children`
- ✅ `viewImage`
- ✅ `viewVedio`
- ✅ `ViewDelays`

### 4. نفس المنطق
- ✅ فلترة المجلدات حسب العنوان
- ✅ استبعاد ملفات البيانات (`type !== 'Data'`)
- ✅ التحقق من `ActivationHome` و `Activationchildren`
- ✅ معالجة أنواع الملفات المختلفة
- ✅ عرض الأيقونات المناسبة

## 📱 الاختلافات المطلوبة للويب

### 1. التنقل
- استخدام Next.js Router بدلاً من React Navigation
- معاملات URL بدلاً من navigation params

### 2. رفع الملفات
- استخدام HTML file input بدلاً من DocumentPicker
- FormData للويب بدلاً من React Native

### 3. عرض الملفات
- استخدام HTML elements للصور والفيديو
- تحميل الملفات عبر browser download

## 🧪 خطوات الاختبار

### 1. اختبار الصفحة الرئيسية
```
1. انتقل إلى /project/[id]/archives
2. تحقق من عرض قائمة المجلدات
3. اختبر إنشاء مجلد جديد
4. اختبر فلترة المجلدات
5. اختبر تعديل وحذف المجلدات
```

### 2. اختبار الصفحة الفرعية
```
1. اضغط على مجلد للدخول إليه
2. تحقق من عرض محتويات المجلد
3. اختبر رفع ملف جديد
4. اختبر إنشاء مجلد فرعي
5. اختبر عرض الملفات المختلفة
6. اختبر تحميل الملفات
7. اختبر تعديل وحذف الملفات
```

### 3. اختبار الصلاحيات
```
1. اختبر مع مستخدم لديه صلاحيات
2. اختبر مع مستخدم ليس لديه صلاحيات
3. تحقق من رسائل الخطأ المناسبة
```

## ✅ النتيجة النهائية

تم تطبيق آلية الأرشيف بالكامل في الويب مطابقة 100% للتطبيق المحمول من ناحية:
- أسماء الملفات والمكونات
- أسماء الدوال والمتغيرات
- منطق العمل والفلترة
- APIs المستخدمة
- معالجة الأخطاء والصلاحيات
- واجهة المستخدم والتفاعل

الآن يمكن للمستخدمين استخدام نفس وظائف الأرشيف في الويب كما هو موجود في التطبيق المحمول.
