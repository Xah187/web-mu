# إصلاح مشكلة فتح الملفات المرفوعة من الويب في التطبيق المحمول

## المشكلة
عندما يتم رفع ملف من الويب في الدردشات (القرارات، الاعتمادات، إلخ)، يظهر الملف بشكل صحيح في الويب ولكن لا يمكن فتحه في التطبيق المحمول.

## السبب الجذري

### 1. كيف يعمل التطبيق المحمول:
عندما يرفع المستخدم ملف من التطبيق المحمول:
```javascript
File: {
  name: "file123.pdf",
  type: "application/pdf",
  size: 12345,
  uri: "file:///storage/emulated/0/DCIM/file.pdf" // مسار محلي
}
```

عندما يحاول فتح الملف، يتحقق من وجوده محلياً:
```javascript
// في VerifctionFile.tsx
const urinew = await selectOnur(id, type); // يجلب uri من قاعدة البيانات
await RNFS.exists(File.uri || urinew) // يتحقق من وجود الملف
  .then(async stats => {
    if (stats) { // موجود محلياً
      resolve(urinew);
    } else { // غير موجود - يحمله من السيرفر
      const url = await actualDownload(`${URLFIL}/${File.name}`, ...);
      resolve(url);
    }
  })
```

### 2. المشكلة مع الملفات المرفوعة من الويب:
عندما يتم رفع ملف من الويب، كان يتم حفظ:
```javascript
File: {
  name: "file123.pdf",
  type: "application/pdf",
  size: 12345
  // لا يوجد uri
}
```

عندما يحاول التطبيق المحمول فتح الملف:
```javascript
await RNFS.exists(undefined || undefined) // يفشل ويذهب إلى catch
  .catch(err => reject(err)); // يرفض الـ Promise ولا يفتح الملف
```

## الحل المطبق

### 1. في الويب (`src/app/(dashboard)/chat/page.tsx`):
إضافة `uri` بمسار وهمي عند رفع الملف:
```javascript
File: { 
  name: nameFile, 
  type: file.type || 'application/octet-stream',
  size: file.size,
  uri: `/web-upload/${nameFile}` // مسار وهمي
}
```

**لماذا مسار وهمي؟**
- لا يمكن استخدام رابط HTTP مثل `https://storage.googleapis.com/...` لأن `RNFS.exists()` يتوقع مسار محلي وسيفشل مع exception
- المسار الوهمي `/web-upload/${nameFile}` سيجعل `RNFS.exists()` يرجع `false` (وليس exception)
- عندما يرجع `false`، سينتقل إلى `searchForFile` ثم `actualDownload`
- سيحمل الملف من `${URLFIL}/${File.name}` بنجاح

### 2. في الويب (`src/components/chat/MessageBubble.tsx`):
تحديث منطق عرض الملفات لتجاهل المسارات الوهمية:
```javascript
const getFileUrl = () => {
  const uri = message.File.uri || message.File.url;
  const name = message.File.name;
  const arrived = message.arrived;

  // استخدام uri فقط إذا كان blob/data/http صالح
  if (!arrived && uri && (uri.startsWith('blob:') || uri.startsWith('data:') || uri.startsWith('http'))) {
    return uri;
  }

  // إذا وصلت الرسالة، استخدم URLFIL
  if (arrived && name) {
    return `${URLFIL}/${name}`;
  }

  // تجاهل المسارات الوهمية واستخدم URLFIL
  if (name) {
    return `${URLFIL}/${name}`;
  }

  return uri || '';
};
```

## سير العمل بعد الإصلاح

### رفع ملف من الويب:
1. المستخدم يختار ملف في الويب
2. يتم رفعه إلى Google Cloud Storage
3. يتم حفظ البيانات في قاعدة البيانات:
   ```json
   {
     "File": {
       "name": "file123.pdf",
       "type": "application/pdf",
       "size": 12345,
       "uri": "/web-upload/file123.pdf"
     }
   }
   ```
4. يتم بث الرسالة عبر Socket.IO إلى جميع المستخدمين

### فتح الملف في التطبيق المحمول:
1. التطبيق يستقبل الرسالة ويحفظها في قاعدة البيانات المحلية
2. المستخدم ينقر على الملف
3. يتم استدعاء `DownloadFile(File, id, ProjectID, type, 'file')`
4. يتحقق من `RNFS.exists('/web-upload/file123.pdf')` → يرجع `false`
5. يبحث عن الملف بالاسم في `searchForFile` → لا يجده
6. يحمل الملف من `https://storage.googleapis.com/demo_backendmoshrif_bucket-1/file123.pdf`
7. يحفظ الملف محلياً ويفتحه بنجاح

### عرض الملف في الويب:
1. يتحقق من `uri = '/web-upload/file123.pdf'`
2. لا يبدأ بـ `blob:` أو `data:` أو `http`
3. يستخدم `${URLFIL}/${name}` بدلاً منه
4. يعرض رابط التحميل: `https://storage.googleapis.com/demo_backendmoshrif_bucket-1/file123.pdf`

## الملفات المعدلة

1. **src/app/(dashboard)/chat/page.tsx**
   - إضافة `uri: /web-upload/${nameFile}` عند رفع الملف

2. **src/components/chat/MessageBubble.tsx**
   - تحديث `getFileUrl()` لتجاهل المسارات الوهمية
   - استخدام `${URLFIL}/${name}` للملفات المرفوعة

## الاختبار

### اختبار في الويب:
1. افتح صفحة الدردشة (القرارات أو الاعتمادات)
2. ارفع ملف PDF أو Word أو Excel
3. تأكد من ظهور رابط التحميل
4. انقر على الرابط وتأكد من فتح/تحميل الملف

### اختبار في التطبيق المحمول:
1. افتح نفس الدردشة في التطبيق المحمول
2. يجب أن تظهر الرسالة مع الملف المرفق
3. انقر على الملف
4. يجب أن يتم تحميله وفتحه بنجاح

## ملاحظات مهمة

- **لم يتم تعديل أي ملف في التطبيق المحمول** - جميع التعديلات في الويب فقط
- المسار الوهمي `/web-upload/` هو مجرد علامة للتطبيق المحمول أن الملف ليس محلياً
- الحل متوافق مع الملفات المرفوعة من التطبيق المحمول (التي لها `uri` محلي صحيح)
- الحل يعمل مع جميع أنواع الملفات (PDF, Word, Excel, صور، فيديوهات، إلخ)

## الخلاصة

تم حل المشكلة بإضافة `uri` وهمي للملفات المرفوعة من الويب، بحيث:
- التطبيق المحمول يتحقق من الملف محلياً (يفشل)
- ثم يحمله من السيرفر تلقائياً
- الويب يتجاهل المسار الوهمي ويستخدم رابط Google Cloud Storage مباشرة

