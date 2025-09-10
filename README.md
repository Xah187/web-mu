# مشرف - نظام إدارة المشاريع (ويب)

تطبيق ويب شامل لإدارة المشاريع والتواصل بين الفرق، مطور باستخدام Next.js 14 مع TypeScript.

## 🚀 الميزات

### ✅ المنجز
- ✅ نظام مصادقة كامل (تسجيل دخول + OTP)
- ✅ واجهة مستخدم متجاوبة مع دعم RTL
- ✅ نظام إدارة الحالة باستخدام Redux Toolkit
- ✅ صفحة رئيسية مع لوحة تحكم
- ✅ نظام المنشورات والتقارير اليومية
- ✅ صفحة التقارير المفصلة مع رسوم بيانية
- ✅ صفحة الإعدادات الشخصية
- ✅ تصميم متطابق مع التطبيق الأصلي
- ✅ دعم الخطوط العربية
- ✅ نظام التنقل السفلي (Bottom Navigation)
- ✅ تكامل Socket.io للتواصل الفوري
- ✅ نظام Axios للتواصل مع API

### 🔄 قيد التطوير
- 🔄 نظام الإشعارات
- 🔄 إدارة الفروع والمشاريع
- 🔄 نظام التخزين المؤقت (Offline Storage)
- 🔄 صفحات إضافية (الدردشة، الأرشيف، إلخ)

## 🛠 التقنيات المستخدمة

### Frontend Framework
- **Next.js 14** - إطار React مع App Router
- **TypeScript** - للكتابة الآمنة
- **Tailwind CSS** - للتصميم السريع والمتجاوب

### State Management
- **Redux Toolkit** - لإدارة الحالة
- **React Redux** - للربط مع React

### UI & Animation
- **Framer Motion** - للحركات والتنقلات
- **Styled Components** - للتصميم المتقدم
- **Custom Arabic Fonts** - خطوط عربية مخصصة

### Communication
- **Axios** - للتواصل مع API
- **Socket.io Client** - للتواصل الفوري
- **React Hook Form** - لإدارة النماذج

### Utilities
- **Moment.js** - لإدارة التواريخ
- **Recharts** - للرسوم البيانية
- **React Dropzone** - لرفع الملفات

## 📱 الصفحات المتاحة

### صفحات المصادقة
- `/` - صفحة الترحيب الرئيسية
- `/login` - تسجيل الدخول
- `/verification` - التحقق من OTP

### الصفحات الرئيسية (محمية)
- `/home` - الصفحة الرئيسية
- `/publications` - المنشورات والتقارير اليومية
- `/reports` - التقارير المفصلة
- `/settings` - الإعدادات الشخصية

## 🎨 نظام التصميم

### الألوان الأساسية
```typescript
const colors = {
  BLUE: '#2117fb',        // اللون الأساسي
  HOME: '#f6f8fe',        // خلفية الصفحات
  WHITE: '#ffffff',       // الأبيض
  BLACK: '#212121',       // النص الأساسي
  BORDER: '#7e879a',      // الحدود
  GREEN: '#10B982',       // النجاح
  RED: '#FF0F0F',         // الخطأ
  // ... المزيد
}
```

### الخطوط
- **IBM Plex Sans Arabic** - للنصوص الأساسية
- **Cairo** - للعناوين
- **Tajawal** - للنصوص الثانوية
- **Changa** - للعناوين المميزة

### التحجيم المتجاوب
```typescript
// دوال التحجيم المتجاوب
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
```

## 🗂 هيكل المشروع

```
moshrif-web/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/            # صفحات المصادقة
│   │   │   ├── login/
│   │   │   └── verification/
│   │   ├── (dashboard)/       # الصفحات المحمية
│   │   │   ├── home/
│   │   │   ├── publications/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   └── layout.tsx         # التخطيط الرئيسي
│   ├── components/            # المكونات
│   │   ├── design/           # مكونات التصميم الأساسية
│   │   │   ├── Input.tsx
│   │   │   ├── ButtonLong.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   ├── layout/           # مكونات التخطيط
│   │   └── providers/        # مقدمي الخدمة
│   ├── lib/                  # المكتبات والأدوات
│   │   ├── api/             # تكوين Axios
│   │   ├── socket/          # تكوين Socket.io
│   │   └── db/             # قاعدة البيانات المحلية
│   ├── store/              # Redux store
│   │   ├── slices/         # شرائح Redux
│   │   └── index.ts        # تكوين Store
│   ├── constants/          # الثوابت
│   │   ├── colors.ts       # الألوان
│   │   └── fonts.ts        # الخطوط
│   ├── utils/              # الأدوات المساعدة
│   └── types/              # تعريفات TypeScript
├── public/
│   ├── fonts/              # الخطوط العربية
│   └── images/             # الصور والأيقونات
└── ...config files
```

## ⚙️ التشغيل والتطوير

### المتطلبات
- Node.js 18+ 
- npm أو yarn
- متصفح حديث

### التشغيل المحلي
```bash
# تثبيت المكتبات
npm install

# تشغيل الخادم المحلي
npm run dev

# فتح المتصفح على
http://localhost:3000
```

### البناء للإنتاج
```bash
# بناء التطبيق
npm run build

# تشغيل النسخة المبنية
npm start
```

### التحقق من الكود
```bash
# فحص TypeScript
npm run type-check

# فحص ESLint
npm run lint

# إصلاح مشاكل ESLint
npm run lint:fix
```

## 🔧 التكوين

### متغيرات البيئة
```env
# API الأساسي
NEXT_PUBLIC_API_URL=http://35.247.12.97:8080

# إعدادات أخرى حسب الحاجة
NEXT_PUBLIC_APP_NAME=مشرف

# URLs للملفات والتحميلات
NEXT_PUBLIC_UPLOAD_URL=http://35.247.12.97:8080/upload
NEXT_PUBLIC_STORAGE_URL=https://storage.googleapis.com/demo_backendmoshrif_bucket-1
```

### تكوين Tailwind
```typescript
// tailwind.config.ts
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // الألوان المخصصة
      },
      fontFamily: {
        // الخطوط العربية
      }
    }
  }
}
```

## 📊 المقارنة مع التطبيق الأصلي

| الميزة | React Native | Next.js Web | الحالة |
|--------|-------------|-------------|--------|
| تسجيل الدخول | ✅ | ✅ | مكتمل |
| التحقق من OTP | ✅ | ✅ | مكتمل |
| الصفحة الرئيسية | ✅ | ✅ | مكتمل |
| المنشورات | ✅ | ✅ | مكتمل |
| التقارير | ✅ | ✅ | مكتمل |
| الإعدادات | ✅ | ✅ | مكتمل |
| الدردشة | ✅ | 🔄 | قيد التطوير |
| الإشعارات | ✅ | 🔄 | قيد التطوير |
| إدارة الملفات | ✅ | 🔄 | قيد التطوير |
| الوضع غير المتصل | SQLite | 🔄 | قيد التطوير |

## 🎯 خطة التطوير المستقبلية

### المرحلة التالية
1. **نظام الدردشة الفوري**
   - صفحات الدردشة
   - إرسال الرسائل والملفات
   - الإشعارات الفورية

2. **إدارة الملفات**
   - رفع وتحميل الملفات
   - معاينة المستندات
   - إدارة الصور والفيديو

3. **النظام غير المتصل**
   - تخزين البيانات محلياً
   - مزامنة تلقائية
   - العمل بدون إنترنت

### التحسينات المستقبلية
- PWA (Progressive Web App)
- دعم الإشعارات التلقائية
- تحسين الأداء
- اختبارات آلية شاملة
- نظام التحديثات التلقائية

## 🐛 الأخطاء المعروفة

- [x] مشاكل TypeScript في المكونات - **تم إصلاحها**
- [x] تعارض في معاملات API - **تم إصلاحها**
- [ ] بعض الأيقونات غير متطابقة تماماً
- [ ] الحاجة لتحسين الأداء على الأجهزة الضعيفة

## 📝 ملاحظات التطوير

### الاختلافات عن React Native
1. **التنقل**: استخدام Next.js Router بدلاً من React Navigation
2. **التخزين**: LocalStorage/IndexedDB بدلاً من AsyncStorage/SQLite
3. **المكونات**: HTML elements بدلاً من React Native components
4. **الحركات**: Framer Motion بدلاً من Reanimated
5. **الملفات**: File API بدلاً من react-native-fs

### أفضل الممارسات المتبعة
- **Component-first approach** - مكونات قابلة للإعادة
- **Type-safe development** - استخدام TypeScript بشكل صارم
- **Mobile-first responsive** - التصميم للموبايل أولاً
- **Performance optimization** - تحسين الأداء والتحميل
- **Accessibility** - دعم إمكانية الوصول

## 👥 المساهمة

للمساهمة في المشروع:

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى Branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مطور لأغراض تجارية خاصة. جميع الحقوق محفوظة.

## 📞 التواصل

للدعم والاستفسارات:
- البريد الإلكتروني: support@moshrif.com
- الموقع الإلكتروني: [moshrif.net](https://moshrif.net)

---

**آخر تحديث:** ${new Date().toLocaleDateString('ar-SA')}
**الإصدار:** 1.0.0
**المطور:** فريق مشرف التقني