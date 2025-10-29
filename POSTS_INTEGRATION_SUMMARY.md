# 📱 ملخص تكامل اليوميات (Posts) - الويب مع التطبيق المحمول

## ✅ التعديلات المطبقة

### 1. **src/lib/api/posts/ApiPosts.ts**

#### **BringPost API** (السطر 19-62)
```typescript
const fetchPosts = async (companyId: number, lastPostId: number = 0, userName?: string)
```
- ✅ مطابق للتطبيق المحمول (السطر 14-41)
- ✅ يرسل: `posts/BringPost?CompanyID=${companyId}&PostID=${lastPostId}&user=${userParam}`
- ✅ يمرر `PhoneNumber` من session في الباكند (مطلوب للموظفين)

#### **SearchPosts API** (السطر 68-93)
```typescript
const searchPosts = async (filterData: any)
```
- ✅ مطابق للتطبيق المحمول (السطر 227-256)
- ✅ يرسل: `posts/SearchPosts?CompanyID=...&DateStart=...&user=${userName}`
- ✅ **بدون اقتباس أو encoding** للـ `user` parameter (مثل التطبيق المحمول بالضبط)
- ✅ يضيف `Content-Type: application/json` header

---

### 2. **src/functions/posts/functionPosts.ts**

#### **تنسيق التاريخ** (السطر 98-112)
```typescript
const formatDateForAPIHelper = (date?: Date | string) => {
  // Format: YY-MM-DD (e.g., 25-10-20)
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```
- ✅ مطابق للتطبيق المحمول: `moment.parseZone().format('yy-MM-DD')`

#### **جلب المنشورات** (السطر 146-172)
```typescript
if (!filterData.Done) {
  // Use BringPost for default feed (like mobile app)
  data = await apiFetchPosts(companyId, lastPostId, user?.data?.userName || '');
} else {
  // Use SearchPosts for filters (like mobile app)
  data = await apiSearchPosts(params);
}
```
- ✅ مطابق للتطبيق المحمول (السطر 108-116):
  - `if (FilterData.Done === true)` → استخدام `SearchPosts`
  - `else` → استخدام `BringPost`

#### **البحث مع الفلتر** (السطر 330-428)
```typescript
const searchPosts = async (filters: Partial<FilterData>) => {
  // Format dates as YY-MM-DD
  const yyParams = {
    DateStart: formatYY(finalFilterData.DateStart),
    DateEnd: formatYY(finalFilterData.DateEnd),
    ...
  };
  
  // Try YY-MM-DD first, fallback to YYYY-MM-DD
  let data = await apiSearchPosts(yyParams);
  if (!data?.data || data.data.length === 0) {
    data = await apiSearchPosts(yyyyParams);
  }
}
```
- ✅ مطابق للتطبيق المحمول (السطر 370-389)
- ✅ يستبدل المنشورات بالكامل (مثل التطبيق المحمول): `setPosts(filteredResults)`

---

## 🔍 المشاكل المكتشفة في الباكند

### ⚠️ **مشكلة 1: BringPost - تاريخ ثابت**
**الملف:** `/Users/fata/Desktop/backendMoshrif-master/function/postpublic/post.js` (السطر 39)

```javascript
const arrayPosts = await BringPostforEmploaysCompany(
  CompanyID,
  "2025-07-14",  // ❌ تاريخ ثابت بدلاً من formattedDate
  PostID,
  user,
  userSession.jobdiscrption,
  userSession.PhoneNumber  // ✅ يمرر PhoneNumber بشكل صحيح
);
```

**التأثير:**
- يعرض فقط منشورات بتاريخ `2025-07-14`
- لا يمكن رؤية منشورات تواريخ أخرى في العرض الافتراضي
- **الحل المؤقت:** استخدام الفلتر لرؤية منشورات تواريخ أخرى

---

### ⚠️ **مشكلة 2: SearchPosts - PhoneNumber مفقود**
**الملف:** `/Users/fata/Desktop/backendMoshrif-master/function/postpublic/post.js` (السطر 169-180)

```javascript
const result = await SELECTTablePostPublicSearch(
  CompanyID,        // 1
  DateStart,        // 2
  DateEnd,          // 3
  type,             // 4
  nameProject,      // 5
  userName,         // 6
  branch,           // 7
  parseInt(PostID), // 8
  userSession.jobdiscrption, // 9
  user              // 10
  // ❌ ناقص: userSession.PhoneNumber (معامل 11)
);
```

**الملف:** `/Users/fata/Desktop/backendMoshrif-master/sql/selected/selected.js` (السطر 2428-2432)

```javascript
if (!isAdminOrBranchManager) {  // إذا كان موظف
  query += `
    LEFT JOIN usersCompany us ON us.PhoneNumber = ?  // ❌ يحتاج PhoneNumber هنا!
    INNER JOIN usersProject up ON up.ProjectID = ca.ProjectID AND us.id = up.user_id
  `;
}
```

**التأثير:**
- **للموظفين:** `SearchPosts` يفشل لأن SQL يحتاج `PhoneNumber` لكن لا يتم تمريره
- **للمديرين/مدراء الفروع:** `SearchPosts` يعمل بشكل صحيح (لا يحتاج `PhoneNumber`)

**الحل المؤقت:**
- الموظفون يستخدمون `BringPost` فقط (العرض الافتراضي)
- المديرون يمكنهم استخدام الفلتر بنجاح

---

## 📊 المقارنة النهائية

| الميزة | التطبيق المحمول | الويب (بعد التعديل) | الحالة |
|-------|-----------------|---------------------|--------|
| **API للعرض الافتراضي** | `BringPost` | `BringPost` | ✅ مطابق |
| **API للفلتر** | `SearchPosts` | `SearchPosts` | ✅ مطابق |
| **تنسيق التاريخ** | `yy-MM-DD` | `yy-MM-DD` + fallback `YYYY-MM-DD` | ✅ محسّن |
| **user parameter** | بدون اقتباس | بدون اقتباس | ✅ مطابق |
| **PhoneNumber في BringPost** | ✅ يمرر | ✅ يمرر (من session) | ✅ مطابق |
| **PhoneNumber في SearchPosts** | ❌ لا يمرر (خطأ باكند) | ❌ لا يمرر (خطأ باكند) | ⚠️ نفس المشكلة |
| **التاريخ الثابت في BringPost** | ❌ `2025-07-14` | ❌ `2025-07-14` | ⚠️ نفس المشكلة |

---

## 🎯 النتيجة

### ✅ **ما يعمل الآن:**
1. **العرض الافتراضي (BringPost):**
   - يعرض منشورات تاريخ `2025-07-14` فقط
   - يعمل للموظفين (يمرر `PhoneNumber` بشكل صحيح)

2. **الفلتر للمديرين (SearchPosts):**
   - يعمل بشكل صحيح للمديرين ومدراء الفروع
   - يمكنهم رؤية منشورات أي تاريخ

### ⚠️ **ما لا يعمل:**
1. **العرض الافتراضي:**
   - لا يعرض منشورات تواريخ أخرى غير `2025-07-14`

2. **الفلتر للموظفين:**
   - `SearchPosts` يفشل للموظفين (يحتاج `PhoneNumber` لكن لا يتم تمريره)

---

## 🔧 الحلول المقترحة

### **حل 1: إصلاح الباكند (الأفضل)**

#### **ملف:** `function/postpublic/post.js`

**إصلاح BringPost (السطر 39):**
```javascript
// قبل:
"2025-07-14",

// بعد:
formattedDate,  // استخدام التاريخ الحالي
```

**إصلاح SearchPosts (السطر 169-180):**
```javascript
const result = await SELECTTablePostPublicSearch(
  CompanyID,
  DateStart,
  DateEnd,
  type,
  nameProject,
  userName,
  branch,
  parseInt(PostID),
  userSession.jobdiscrption,
  user,
  userSession.PhoneNumber  // ✅ إضافة PhoneNumber
);
```

#### **ملف:** `sql/selected/selected.js`

**تحديث SELECTTablePostPublicSearch (السطر 2378-2389):**
```javascript
const SELECTTablePostPublicSearch = (
  id,
  DateStart,
  DateEnd,
  type,
  nameProject,
  userName,
  branch,
  PostID,
  userJob = "موظف",
  user,
  PhoneNumber  // ✅ إضافة معامل PhoneNumber
) => {
  // ...
  let data =
    type === "بحسب التاريخ"
      ? isAdminOrBranchManager
        ? [id, DateStart, DateEnd, PostID]
        : [PhoneNumber, id, DateStart, DateEnd, PostID]  // ✅ إضافة PhoneNumber للموظفين
      : // ... باقي الأنواع
}
```

---

### **حل 2: حل مؤقت من الويب (الحالي)**

- ✅ استخدام `BringPost` للعرض الافتراضي (يعمل لكن بتاريخ ثابت)
- ✅ استخدام `SearchPosts` للفلتر (يعمل للمديرين فقط)
- ✅ عرض رسالة للموظفين لاستخدام الفلتر إذا لم تظهر منشورات

---

## 📝 ملاحظات

1. **التطبيق المحمول يعمل** لأن:
   - جميع المنشورات في قاعدة البيانات بتاريخ `2025-07-14`
   - أو المستخدمون يستخدمون الفلتر دائماً

2. **الويب الآن مطابق 100%** للتطبيق المحمول في:
   - استخدام نفس APIs
   - نفس تنسيق التاريخ
   - نفس طريقة إرسال المعاملات
   - نفس المشاكل في الباكند!

3. **لإصلاح المشاكل بشكل نهائي:**
   - يجب تعديل الباكند (الحل 1)
   - أو الاستمرار بالحل المؤقت (الحل 2)

