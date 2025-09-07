# دليل النشر - Deployment Guide

## 🚨 مشكلة Mixed Content محلولة

### المشكلة:
```
Mixed Content: The page at 'https://moshrif-web.vercel.app/login' was loaded over HTTPS, but attempted to connect to the insecure WebSocket endpoint 'ws://35.247.12.97:8080/socket.io/?EIO=4&transport=websocket'
```

### الحل المطبق:

## 1. متغيرات البيئة في Vercel

في Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://mushrf.net (Production)
NEXT_PUBLIC_API_URL = http://35.247.12.97:8080 (Development)
NODE_ENV = production (Production)
```

## 2. إعداد SSL للـ API Server

على السيرفر `35.247.12.97`:

```bash
# تثبيت Cloudflare Tunnel
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# إنشاء tunnel
cloudflared tunnel create mushrf-api
cloudflared tunnel route dns mushrf-api mushrf.net

# تشغيل tunnel
cloudflared tunnel run --url http://localhost:8080 mushrf-api
```

## 3. تحديث Backend CORS

في ملف `config.js` للـ Backend:

```javascript
corsOrigins: [
  "http://34.82.27.107:8080",
  "http://35.247.12.97:8080", 
  "https://mushrf.net",
  "https://moshrif-web.vercel.app",
  "https://mushrf.co",
  "https://www.mushrf.co"
]
```

## 4. النشر

```bash
git add .
git commit -m "Fix Mixed Content: Configure HTTPS API for production"
git push origin main
```

## 5. التحقق

بعد النشر، تحقق من:
- ✅ لا توجد أخطاء Mixed Content في Console
- ✅ Socket.IO متصل بـ WSS بدلاً من WS
- ✅ تسجيل الدخول يعمل بدون أخطاء

## ملاحظات مهمة:

- **التطوير:** يستخدم `http://35.247.12.97:8080`
- **الإنتاج:** يستخدم `https://mushrf.net`
- **Socket.IO:** سيتصل تلقائياً بـ WSS في الإنتاج
