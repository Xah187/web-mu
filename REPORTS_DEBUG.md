# تشخيص مشاكل صفحة التقارير

## ✅ تم إصلاح المشكلة: عدم ظهور الفروع

### 🔧 الإصلاحات المطبقة:

#### 1. تبسيط معالجة البيانات في useReports ✅
```typescript
// قبل الإصلاح - معقد ومعرض للأخطاء
if (response.data.data && Array.isArray(response.data.data)) {
  branchesArray = response.data.data;
} else if (Array.isArray(response.data)) {
  branchesArray = response.data;
} else if (response.data.masseg === 'succfuly' && response.data.data) {
  branchesArray = response.data.data;
}

// بعد الإصلاح - بسيط ومطابق لـ usePosts
if (response.status === 200 && response.data?.data) {
  const branchesData = response.data.data.map((branch: any) => ({
    id: branch.id,
    name: branch.NameSub || branch.name,
    NameSub: branch.NameSub || branch.name
  }));
  setBranches(branchesData);
}
```

#### 2. إضافة تشخيص مفصل ✅
```typescript
console.log('useReports useEffect triggered:', { 
  hasAccessToken: !!user?.accessToken, 
  hasIDCompany: !!user?.data?.IDCompany,
  user: user?.data 
});
console.log('Starting to fetch branches in useReports...');
console.log('Branches set in useReports:', branchesData);
```

#### 3. إضافة زر تحديث يدوي ✅
```tsx
<button
  onClick={() => {
    console.log('Manual refresh branches clicked');
    fetchBranches('update');
  }}
  title="تحديث الفروع"
  disabled={branchesLoading}
>
  {branchesLoading ? <Spinner /> : <RefreshIcon />}
</button>
```

#### 4. إصلاح أخطاء TypeScript ✅
```typescript
interface User {
  accessToken?: string;
  data?: UserData;
}

const user = useAppSelector((state) => state.user) as User;
```

## 🔍 المشكلة السابقة: عدم ظهور الفروع

### 📊 API Endpoints المستخدمة:

#### 1. جلب الفروع:
```
POST company/brinsh/bring
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer [TOKEN]"
}
Body: {
  "IDCompany": [COMPANY_ID],
  "type": "cache"
}
```

#### 2. جلب المشاريع:
```
GET brinshCompany/BringProject?IDcompanySub=[BRANCH_ID]&IDfinlty=0&type=cache
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer [TOKEN]"
}
```

#### 3. جلب التقرير:
```
GET brinshCompany/BringReportforProject?ProjectID=[PROJECT_ID]
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer [TOKEN]"
}
```

## 🛠️ خطوات التشخيص:

### الخطوة 1: تحقق من Console
1. افتح Developer Tools (F12)
2. اذهب إلى تبويب Console
3. ابحث عن الرسائل التالية:
   - `"Fetching branches with:"`
   - `"Branches API response:"`
   - `"Missing user data:"`

### الخطوة 2: تحقق من Network
1. اذهب إلى تبويب Network
2. قم بتحديث الصفحة
3. ابحث عن طلبات API:
   - `company/brinsh/bring`
   - `brinshCompany/BringProject`
   - `brinshCompany/BringReportforProject`

### الخطوة 3: تحقق من الاستجابات
#### استجابة الفروع المتوقعة:
```json
{
  "masseg": "succfuly",
  "data": [
    {
      "id": 1,
      "NameSub": "فرع الرياض",
      "BranchAddress": "الرياض - حي النرجس",
      "Email": "example@company.com",
      "PhoneNumber": "0505365001"
    }
  ]
}
```

#### استجابة المشاريع المتوقعة:
```json
{
  "data": [
    {
      "id": 1,
      "Nameproject": "مشروع سكني",
      "startDateProject": "2024-01-01",
      "EndDateProject": "2024-12-31"
    }
  ]
}
```

## 🚨 الأخطاء الشائعة:

### 1. خطأ 401 (Unauthorized)
**السبب**: Token منتهي الصلاحية أو غير صحيح
**الحل**: تسجيل دخول جديد

### 2. خطأ 404 (Not Found)
**السبب**: Endpoint غير صحيح أو الخادم لا يدعم هذا المسار
**الحل**: تحقق من إعدادات الخادم

### 3. خطأ CORS
**السبب**: الخادم لا يسمح بطلبات من النطاق الحالي
**الحل**: إعداد CORS في الخادم

### 4. لا توجد بيانات في الاستجابة
**السبب**: المستخدم لا يملك فروع أو مشاريع
**الحل**: تحقق من قاعدة البيانات

## 🔧 معلومات التشخيص المعروضة:

في وضع التطوير، ستظهر معلومات التشخيص التالية:
- عدد الفروع المحملة
- عدد المشاريع المحملة  
- الفرع المختار حالياً
- المشروع المختار حالياً
- حالة التحميل لكل API

## 📝 لوغ التشخيص:

### Console Logs المفيدة:
```javascript
// عند بدء تحميل الفروع
"Fetching branches with: {IDCompany: 1, type: 'cache'}"

// استجابة API الفروع
"Branches API response: {masseg: 'succfuly', data: [...]}"

// الفروع المعالجة
"Processed branches data: [{id: 1, name: 'فرع الرياض', ...}]"

// عند اختيار فرع
"Fetching projects with: {branchId: 1, lastProjectId: 0}"

// استجابة API المشاريع
"Projects API response: {data: [...]}"
```

## 🎯 نصائح لحل المشاكل:

### 1. تحقق من بيانات المستخدم:
```javascript
// في Console
console.log('User data:', JSON.parse(localStorage.getItem('user')))
```

### 2. تحقق من Token:
```javascript
// في Console
console.log('Token:', JSON.parse(localStorage.getItem('user'))?.accessToken)
```

### 3. اختبار API يدوياً:
```javascript
// في Console
fetch('http://localhost:3001/company/brinsh/bring', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('user'))?.accessToken
  },
  body: JSON.stringify({
    IDCompany: JSON.parse(localStorage.getItem('user'))?.data?.IDCompany,
    type: 'cache'
  })
})
.then(res => res.json())
.then(data => console.log('Manual API test:', data))
```

## 📞 إذا استمرت المشكلة:

1. تحقق من أن الخادم يعمل على `localhost:3001`
2. تحقق من أن المستخدم مسجل دخول صحيح
3. تحقق من أن الشركة لديها فروع في قاعدة البيانات
4. تحقق من إعدادات CORS في الخادم
5. تحقق من صحة API endpoints في الخادم

## 🔄 زر التحديث:

إذا لم تظهر البيانات، اضغط على زر التحديث (🔄) في أعلى يمين الصفحة لإعادة تحميل الصفحة والبيانات.
