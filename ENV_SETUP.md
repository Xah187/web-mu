# متغيرات البيئة - Environment Variables Setup

## إنشاء ملف .env.local

قم بإنشاء ملف `.env.local` في المجلد الجذر للمشروع واضافة المتغيرات التالية:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Development Configuration
NODE_ENV=development
```

## الخطوات:

1. في المجلد `/Users/fata/Desktop/moshrif-web/`
2. قم بإنشاء ملف جديد باسم `.env.local`
3. انسخ المحتوى أعلاه إلى الملف
4. احفظ الملف
5. أعد تشغيل خادم التطوير:

```bash
npm run dev
```

## ملاحظات:

- تأكد من أن عنوان API صحيح
- إذا كان الخادم يعمل على منفذ مختلف، قم بتغيير الرقم في NEXT_PUBLIC_API_URL
- هذا الملف مخفي افتراضياً، تأكد من إظهار الملفات المخفية في محرر النصوص

## التحقق من التكوين:

بعد إنشاء الملف، تأكد من أن:
- ✅ الصور تُحمل بدون أخطاء
- ✅ لا تظهر رسالة "hostname localhost is not configured"
- ✅ اليوميات تعرض الوسائط بشكل صحيح
