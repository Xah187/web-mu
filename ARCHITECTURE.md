# 🏗️ بنية المشروع - Architecture

## ✅ **تم تطبيق بنية التطبيق المحمول على الويب**

### **📱 التطبيق المحمول (المرجع):**
```
Src/functions/
├── posts/
│   ├── ApiPosts.tsx          // API calls only
│   └── funcationPosts.tsx    // Business logic only
├── Login/
│   ├── LoginUser.tsx         // Login API
│   └── ValidityUser.tsx      // Permissions logic
├── company/
│   ├── Apiscompany.tsx       // Company APIs
│   └── FunctionUsers.tsx     // User functions
└── chate/
    ├── SendMassge.tsx        // Chat functions
    └── VerifctionFile.tsx    // File verification
```

### **🌐 التطبيق الويب (الجديد):**
```
src/
├── lib/api/                  // API calls only (like mobile)
│   ├── posts/
│   │   └── ApiPosts.ts       // Posts API functions
│   ├── projects/
│   │   └── ApiProjects.ts    // Projects API functions
│   ├── auth/
│   │   └── ApiAuth.ts        // Authentication API
│   └── axios.ts              // Base axios config
├── functions/                // Business logic only (like mobile)
│   ├── posts/
│   │   └── functionPosts.ts  // Posts business logic
│   ├── projects/
│   │   └── functionProjects.ts
│   └── auth/
│       └── functionAuth.ts
└── hooks/                    // Re-exports for compatibility
    ├── usePosts.ts           // Re-exports from functions/
    ├── useProjects.ts        // Re-exports from functions/
    └── useAuth.ts            // Re-exports from functions/
```

## 🔄 **الفصل بين API والـ Business Logic:**

### **✅ الطريقة الصحيحة (مطبقة الآن):**

**API Layer (src/lib/api/posts/ApiPosts.ts):**
```typescript
export default function useApiPosts() {
  // API calls only - no business logic
  const fetchPosts = async (companyId, lastPostId, userName) => {
    const response = await axiosInstance.get(url, { headers });
    return response.data; // Return raw data
  };
  
  const toggleLike = async (postId) => {
    const response = await axiosInstance.get(likeUrl, { headers });
    return response.data; // Return raw data
  };
}
```

**Business Logic Layer (src/functions/posts/functionPosts.ts):**
```typescript
export default function useFunctionPosts(companyId) {
  const { fetchPosts: apiFetchPosts, toggleLike: apiToggleLike } = useApiPosts();
  
  // Business logic only - uses API functions
  const fetchPosts = async (reset = false) => {
    const data = await apiFetchPosts(companyId, lastPostId, userName);
    
    // Business logic: filtering, state management, etc.
    const filteredPosts = filterPostsForUser(data.data);
    setPosts(reset ? filteredPosts : [...posts, ...filteredPosts]);
  };
  
  const toggleLike = async (postId) => {
    await apiToggleLike(postId);
    
    // Business logic: update local state
    setPosts(prev => prev.map(post => 
      post.PostID === postId 
        ? { ...post, Likeuser: !post.Likeuser, Likes: post.Likeuser ? post.Likes - 1 : post.Likes + 1 }
        : post
    ));
  };
}
```

**Hook Layer (src/hooks/usePosts.ts):**
```typescript
// Re-export for backward compatibility
export { default } from '@/functions/posts/functionPosts';
export type { Post, FilterData } from '@/functions/posts/functionPosts';
```

## 🎯 **الفوائد:**

### **1. فصل الاهتمامات (Separation of Concerns):**
- **API Layer:** يتعامل فقط مع HTTP requests
- **Business Logic:** يتعامل مع منطق التطبيق وإدارة الحالة
- **Hook Layer:** يوفر واجهة متوافقة مع الكود الموجود

### **2. إعادة الاستخدام (Reusability):**
- يمكن استخدام API functions في أماكن متعددة
- Business logic منفصل ويمكن اختباره بسهولة

### **3. سهولة الصيانة (Maintainability):**
- تغيير API endpoint يتطلب تعديل ملف واحد فقط
- تغيير Business logic لا يؤثر على API calls

### **4. التوافق مع التطبيق المحمول:**
- نفس البنية المستخدمة في التطبيق المحمول
- سهولة نقل الكود بين المنصات

## 📋 **الملفات المنشأة:**

### **✅ API Layer:**
- `src/lib/api/posts/ApiPosts.ts` - Posts API functions
- `src/lib/api/projects/ApiProjects.ts` - Projects API functions  
- `src/lib/api/auth/ApiAuth.ts` - Authentication API functions

### **✅ Business Logic Layer:**
- `src/functions/posts/functionPosts.ts` - Posts business logic

### **✅ Hook Layer (Compatibility):**
- `src/hooks/usePosts.ts` - Re-exports from functions

## 🚀 **الخطوات التالية:**

1. **إنشاء باقي Functions:**
   - `src/functions/projects/functionProjects.ts`
   - `src/functions/auth/functionAuth.ts`
   - `src/functions/notifications/functionNotifications.ts`

2. **تحديث الـ Hooks الموجودة:**
   - تحويلها لـ re-exports من Functions الجديدة

3. **اختبار التوافق:**
   - التأكد من أن الكود الموجود يعمل بدون تغييرات

## 📝 **ملاحظات مهمة:**

- **Backward Compatibility:** الكود الموجود سيعمل بدون تغييرات
- **Gradual Migration:** يمكن تحويل الملفات تدريجياً
- **Type Safety:** جميع الـ types محفوظة ومُصدّرة بشكل صحيح
- **Mobile App Parity:** البنية مطابقة تماماً للتطبيق المحمول
