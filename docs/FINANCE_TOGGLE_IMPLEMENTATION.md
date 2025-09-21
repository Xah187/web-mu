# تنفيذ زر توقيف العمليات المالية

## نظرة عامة
تم تنفيذ زر توقيف العمليات اليدوية لقسم المالية في الويب ليتطابق تماماً مع التطبيق المحمول.

## التطبيق المحمول (المرجع)

### API Endpoint
```javascript
// routes/company.js
router.route("/OpenOrCloseopreationStopfinance").get(OpenOrCloseopreationStopfinance(uploadQueue));
```

### Backend Function
```javascript
// function/companyinsert/insertCompany.js
const OpenOrCloseopreationStopfinance = () => {
  return async (req, res) => {
    try {
      const id = req.query.idCompany;
      let DisabledFinance;
      const data = await SELECTTablecompany(id);
      if (data.DisabledFinance === "true") {
        DisabledFinance = "false";
      } else {
        DisabledFinance = "true";
      }
      await UpdateTableinnuberOfcurrentBranchescompany(
        [DisabledFinance, id],
        "DisabledFinance"
      );
      res.send({
        success: "تمت العملية بنجاح",
        DisabledFinance: DisabledFinance,
      }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(400);
    }
  };
};
```

### Mobile App Frontend
```javascript
// Src/functions/company/Apiscompany.tsx
const OpenOrCloseopreationStopfinance = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const resultuser = await getItemsStroge('user');
      await axiosFile.get(
        `company/OpenOrCloseopreationStopfinance?idCompany=${resultuser?.data?.IDCompany}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + resultuser?.accessToken,
          },
        },
      ).then(async result => {
        if (result.status === 200) {
          resolve(result.data);
          Tostget(result?.data?.success);
          let datauser = {
            ...resultuser,
            DisabledFinance: result?.data?.DisabledFinance,
          };
          await setItemsStroge(datauser, 'user');
          dispatch(setUser(datauser));
        }
      });
    } catch (err) {
      // Handle error
    }
  });
};
```

### Mobile App UI
```javascript
// Src/Screens/Information.tsx
<Switch
  thumbColor={colors.RED}
  trackColor={{false: colors.RED, true: colors.BLUE}}
  value={user?.DisabledFinance === 'true'}
  onChange={async () => {
    if (Boolean(user.data?.CommercialRegistrationNumber)) {
      if (user?.data?.job === 'Admin') {
        await OpenOrCloseopreationStopfinance();
      } else {
        Tostget('ليس في نطاق صلاحياتك');
      }
    }
  }}
/>
```

## تنفيذ الويب

### API Endpoint
```typescript
// src/app/api/company/finance-toggle/route.ts
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const idCompany = searchParams.get('idCompany');

    const backendUrl = `${BACKEND_BASE_URL}/api/company/OpenOrCloseopreationStopfinance?idCompany=${idCompany}`;
    
    const response = await axios.get(backendUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    // Handle error
  }
}
```

### API Function
```typescript
// src/lib/api/company/ApiCompany.ts
export const toggleFinanceOperations = async (
  idCompany: string | number,
  accessToken: string
): Promise<FinanceToggleResponse> => {
  const response = await fetch(`/api/company/finance-toggle?idCompany=${idCompany}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'فشل في تنفيذ العملية');
  }
  return data;
};
```

### Frontend Implementation
```typescript
// src/app/(dashboard)/settings/page.tsx
const handleFinanceToggle = async () => {
  if (!isAdmin) {
    Tostget('ليس في نطاق صلاحياتك');
    return;
  }

  try {
    const data = await toggleFinanceOperations(
      user.data.IDCompany,
      user.accessToken
    );

    const newFinanceDisabled = data.DisabledFinance === 'true';
    setFinanceDisabled(newFinanceDisabled);
    
    const updatedUser = {
      ...user,
      data: { ...user.data, DisabledFinance: data.DisabledFinance }
    };
    dispatch(setUser(updatedUser));

    Tostget(data.success || 'تمت العملية بنجاح');
  } catch (error: any) {
    Tostget(error.message || 'خطأ في الشبكة');
  }
};
```

## الاستخدام في العمليات المالية

### Mobile App Check
```javascript
// Src/Screens/projectfiles/Finance.tsx
if (user?.DisabledFinance === 'true') {
  await TaketdatandsendforEdit(element, type);
} else {
  Tostget('العمليات المالية اليدوية متوقفه حالياً');
}
```

## الميزات المطابقة

✅ **نفس API Endpoint**: `/api/company/OpenOrCloseopreationStopfinance`  
✅ **نفس المعاملات**: `idCompany` في query parameters  
✅ **نفس الاستجابة**: `{ success, DisabledFinance }`  
✅ **نفس التحقق من الصلاحيات**: Admin only  
✅ **نفس تحديث بيانات المستخدم**: Redux state update  
✅ **نفس الرسائل**: نفس نصوص التأكيد والخطأ  
✅ **نفس السلوك**: Toggle between true/false  

## الحالات المختلفة

- **DisabledFinance = "true"**: العمليات المالية متوقفة
- **DisabledFinance = "false"**: العمليات المالية مفعلة

## المزامنة التلقائية

### مشكلة المزامنة
عندما يتم تغيير حالة العمليات المالية في التطبيق المحمول، لا تنعكس التغييرات تلقائياً في الويب لأن:
- الويب يحتفظ ببيانات المستخدم في Redux state
- التطبيق المحمول يحدث قاعدة البيانات مباشرة
- لا توجد آلية push notifications للويب

### الحل المطبق

#### 1. **API Endpoint للتحديث**
```typescript
// src/app/api/user/refresh/route.ts
export async function GET(request: NextRequest) {
  const idCompany = searchParams.get('idCompany');
  const backendUrl = `${BACKEND_BASE_URL}/api/company?idCompany=${idCompany}`;

  const response = await axios.get(backendUrl, {
    headers: { 'Authorization': authHeader }
  });

  return NextResponse.json(response.data);
}
```

#### 2. **دالة التحديث التلقائي**
```typescript
// src/lib/api/company/ApiCompany.ts
export const refreshUserData = async (
  idCompany: string | number,
  accessToken: string
): Promise<UserRefreshResponse> => {
  const response = await fetch(`/api/user/refresh?idCompany=${idCompany}`);
  return response.json();
};
```

#### 3. **التحديث الدوري في Frontend**
```typescript
// src/app/(dashboard)/settings/page.tsx
useEffect(() => {
  const refreshUserInfo = async () => {
    if (user?.accessToken && user?.data?.IDCompany && isAdmin) {
      const refreshedData = await refreshUserData(user.data.IDCompany, user.accessToken);

      if (refreshedData?.data?.DisabledFinance !== user.data?.DisabledFinance) {
        // تحديث Redux state
        dispatch(setUser(updatedUser));
        setFinanceDisabled(refreshedData.data.DisabledFinance === 'true');
      }
    }
  };

  // تحديث فوري عند تحميل الصفحة
  refreshUserInfo();

  // تحديث دوري كل 30 ثانية
  const interval = setInterval(refreshUserInfo, 30000);
  return () => clearInterval(interval);
}, [user?.accessToken, user?.data?.IDCompany, isAdmin]);
```

### آلية العمل

1. **عند تحميل صفحة الإعدادات**:
   - يتم استدعاء `refreshUserData` فوراً
   - يجلب أحدث بيانات الشركة من قاعدة البيانات
   - يقارن `DisabledFinance` الجديدة مع القديمة
   - يحدث Redux state إذا كانت مختلفة

2. **التحديث الدوري**:
   - كل 30 ثانية يتم فحص البيانات تلقائياً
   - يضمن مزامنة البيانات حتى لو تم التغيير في التطبيق المحمول
   - لا يعرض رسائل خطأ للمستخدم (تحديث خلفي)

3. **عند الضغط على الزر**:
   - يتم التحديث فوراً عبر `toggleFinanceOperations`
   - يحدث Redux state مباشرة من الاستجابة
   - يضمن التزامن الفوري

### النتيجة
✅ **مزامنة تلقائية** بين الويب والتطبيق المحمول
✅ **تحديث فوري** عند تحميل الصفحة
✅ **تحديث دوري** كل 30 ثانية
✅ **لا توجد أزرار تحديث يدوية** - كل شيء تلقائي
✅ **أداء محسن** - التحديث فقط عند وجود تغيير

## الأمان

- ✅ التحقق من صلاحيات الأدمن
- ✅ JWT Authentication
- ✅ Pass-through authentication إلى الـ backend
- ✅ Error handling شامل
- ✅ تحديث آمن للبيانات الحساسة
