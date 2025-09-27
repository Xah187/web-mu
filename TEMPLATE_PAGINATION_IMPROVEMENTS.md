# تحسينات التحميل التدريجي للقوالب

## المشكلة الأصلية
كان التطبيق الويب لا يحمل جميع قوالب المراحل، بينما التطبيق الأساسي يستخدم نظام التحميل التدريجي (pagination) لجلب البيانات بشكل تدريجي.

## الحلول المطبقة

### 1. تحسين useTemplet Hook

#### إضافة حالة التحميل التدريجي:
```typescript
const [hasMoreData, setHasMoreData] = useState(true);
```

#### تحسين fetchStageHomes:
- إضافة parameter `append` للتحكم في إضافة البيانات أم استبدالها
- منع التحميل المتكرر
- تحديث حالة `hasMoreData` بناءً على عدد النتائج
- تجنب تكرار البيانات باستخدام Set

#### إضافة loadMoreStageHomes:
```typescript
const loadMoreStageHomes = useCallback(async () => {
  if (!hasMoreData || loading || stageHomes.length === 0) return;
  
  const lastItem = stageHomes[stageHomes.length - 1];
  if (lastItem?.StageIDtemplet) {
    await fetchStageHomes(lastItem.StageIDtemplet, true);
  }
}, [hasMoreData, loading, stageHomes, fetchStageHomes]);
```

### 2. تحسين صفحة القوالب الرئيسية

#### إضافة زر "تحميل المزيد":
- يظهر فقط عند وجود المزيد من البيانات
- يتضمن حالة التحميل مع spinner
- تصميم متجاوب ومتسق مع باقي التطبيق

```tsx
{hasMoreData && stageHomes.length > 0 && (
  <div className="mt-6 pt-6 border-t border-gray-100">
    <button
      onClick={loadMoreStageHomes}
      disabled={loading}
      className="w-full bg-gradient-to-r from-gray-50 to-gray-100..."
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span>جاري التحميل...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>تحميل المزيد من القوالب</span>
        </div>
      )}
    </button>
  </div>
)}
```

### 3. تحسين صفحة القوالب الفرعية

#### تحسين دالة bring:
- إضافة منع التحميل المتكرر
- تحديث حالة `hasMoreData`
- تجنب تكرار البيانات

```typescript
const bring = async (last = 0) => {
  if (loading) return; // منع التحميل المتكرر
  
  setLoading(true);
  const data = await fetchStageSub(stageId, last);
  if (Array.isArray(data)) {
    // تحديث حالة وجود المزيد من البيانات
    setHasMoreSubData(data.length >= 10);
    
    if (last === 0) {
      setSubItems(data);
    } else {
      // تجنب التكرار
      setSubItems(prev => {
        const existingIds = new Set(prev.map(item => item.StageSubID));
        const newItems = data.filter(item => !existingIds.has(item.StageSubID));
        return [...prev, ...newItems];
      });
    }
  } else {
    setHasMoreSubData(false);
  }
  setLoading(false);
};
```

#### إضافة loadMoreSubStages:
```typescript
const loadMoreSubStages = async () => {
  if (!hasMoreSubData || loading || subItems.length === 0) return;
  
  const lastItem = subItems[subItems.length - 1];
  if (lastItem?.StageSubID) {
    await bring(lastItem.StageSubID);
  }
};
```

### 4. تطابق مع التطبيق الأساسي

#### SQL Query Pattern:
```sql
SELECT * FROM StagesTemplet 
WHERE StageIDtemplet > ${number} 
ORDER BY StageIDtemplet ASC 
LIMIT 10
```

#### API Endpoint Pattern:
```
GET /Templet/BringStageHomeTemplet?StageIDtemplet=${number}
GET /Templet/BringStageSubTemplet?StageID=${StageID}&StageSubID=${number}
```

## الفوائد المحققة

### 1. الأداء:
- تحميل أسرع للصفحة الأولى
- تقليل استهلاك الذاكرة
- تحسين تجربة المستخدم

### 2. قابلية التوسع:
- يمكن التعامل مع آلاف القوالب
- لا توجد مشاكل في الأداء مع زيادة البيانات

### 3. تجربة المستخدم:
- تحميل سلس ومتدرج
- مؤشرات واضحة لحالة التحميل
- عدم تكرار البيانات

### 4. التوافق:
- نفس النظام المستخدم في التطبيق الأساسي
- API endpoints متطابقة
- منطق التحميل متسق

## الملفات المحدثة

1. `src/hooks/useTemplet.ts` - إضافة التحميل التدريجي
2. `src/app/(dashboard)/templet/page.tsx` - صفحة القوالب الرئيسية
3. `src/app/(dashboard)/templet/[stageId]/page.tsx` - صفحة القوالب الفرعية

## اختبار التحسينات

1. تحقق من تحميل أول 10 قوالب
2. اختبر زر "تحميل المزيد"
3. تأكد من عدم تكرار البيانات
4. اختبر الأداء مع بيانات كثيرة
