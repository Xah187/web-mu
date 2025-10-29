# تغييرات API الباك اند الجديد

## التغييرات المطبقة على الويب

### 1. تغيير API جلب الفروع من POST إلى GET

**الباك اند القديم:**
```javascript
POST /api/company/brinsh/bring
Body: { IDCompany, type }
```

**الباك اند الجديد:**
```javascript
GET /api/company/brinsh/bring?IDCompany={id}&type={type}
```

**الملفات المعدلة:**
- ✅ `src/hooks/useReports.ts` (line 89)
- ✅ `src/hooks/useCompanyData.ts` (line 98)
- ✅ `src/app/(dashboard)/branch/[id]/projects/page.tsx` (lines 367, 422)
- ✅ `src/hooks/usePermissionAPI.ts` (line 99)
- ✅ `src/lib/api/posts/ApiPosts.ts` (line 148)

### 2. تغيير Base URL للاختبار

**قبل:**
```typescript
export const Api = 'https://mushrf.net';
```

**بعد:**
```typescript
export const Api = 'http://35.247.12.97:8080';
```

**الملف المعدل:**
- ✅ `src/lib/api/axios.ts` (line 9)

### 3. إضافة Debug Logging للتقارير

تم إضافة logging تفصيلي في `src/lib/api/axios.ts` لتتبع:
- 📤 Request details (URL, method, headers)
- 📤 Token payload (id, IDCompany, userName, job)
- ✅ Response success
- ❌ Response errors with full details

## الـ Endpoints التي لم تتغير

### جلب المشاريع
```javascript
GET /api/brinshCompany/BringProject?IDcompanySub={id}&IDfinlty={lastId}&type={type}
```
- Response: `{ success: true, data: [...], boss: "..." }`
- لم يتغير ✅

### تقرير الجدول الزمني
```javascript
GET /api/brinshCompany/BringreportTimeline?ProjectID={id}
```
- Response: `{ success: "...", namefile: "..." }`
- لم يتغير ✅

### تقرير الطلبات
```javascript
GET /api/brinshCompany/BringreportRequessts?id={id}&type={type}
```
- Response: `{ success: "...", namefile: "..." }`
- لم يتغير ✅

## ملاحظات مهمة

### 1. الباك اند الجديد لا يحتوي على try-catch
- أي خطأ يرجع 500 بدون تفاصيل
- يجب التحقق من server logs للحصول على التفاصيل

### 2. التوكن يجب أن يحتوي على `id`
- استخدام `/auth/verification` (v1) بدلاً من `/auth/v2/verification`
- v2 لا يضيف `id` في الـ token payload

### 3. Response Structure
الباك اند الجديد يستخدم نفس الـ response structure:
```javascript
{
  masseg: "succfuly",  // ملاحظة: الإملاء الخاطئ موجود في الباك اند
  data: [...],
  nameCompany: "...",
  CommercialRegistrationNumber: "...",
  Country: "...",
  Covenantnumber: 0
}
```

## خطوات الاختبار

1. ✅ تأكد من تشغيل الباك اند على `http://35.247.12.97:8080`
2. ✅ سجل الخروج وسجل الدخول مرة أخرى للحصول على token جديد
3. ✅ جرب جلب الفروع من الصفحة الرئيسية
4. ✅ جرب جلب المشاريع من صفحة الفرع
5. ✅ جرب تقرير الجدول الزمني
6. ✅ جرب تقرير الطلبات

## المشاكل المحتملة

### إذا لم تظهر الفروع:
- تحقق من console للـ errors
- تحقق من أن الـ token يحتوي على `id`
- تحقق من أن الباك اند يعمل على البورت الصحيح

### إذا لم تظهر المشاريع:
- تحقق من أن الفرع المختار صحيح
- تحقق من صلاحيات المستخدم في الفرع
- تحقق من الـ response في console

### إذا فشلت التقارير:
- تحقق من أن `ProjectID` صحيح
- تحقق من أن المشروع يحتوي على بيانات
- تحقق من server logs للحصول على التفاصيل

