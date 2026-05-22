# FOMO Restaurant Management System & POS

نظام متكامل لإدارة المطاعم ونقاط البيع (POS)، بالإضافة إلى نظام تتبع مالي متقدم (حصالة).

## 🌟 المميزات (Features)
- **نقطة البيع (POS)**: واجهة سهلة وسريعة لإنشاء وإدارة الطلبات.
- **إدارة المنتجات والأصناف**: إضافة، تعديل، وحذف المنتجات والأصناف (Categories).
- **إدارة العملاء والمندوبين**: تتبع بيانات العملاء ومندوبي التوصيل (Representatives).
- **نظام الحصالة (Hassala)**: نظام لتتبع الحركات المالية اليومية والمصروفات.
- **حصالة شخصية (Personal Hassala)**: تتبع مالي مخصص إضافي.
- **التوثيق والحماية**: نظام تسجيل دخول مبني على (JWT & Bcrypt).

## 🛠 التقنيات المستخدمة (Tech Stack)

### الواجهة الأمامية (Frontend)
- **React.js** (عبر Vite)
- **Redux Toolkit** (لإدارة الحالة State Management)
- **React Router** (للتنقل بين الصفحات)
- **Tailwind CSS v4** (لتنسيق الواجهات)
- **Lucide React** (للأيقونات)
- **Axios** (للتعامل مع الـ API)

### الواجهة الخلفية (Backend)
- **Node.js & Express.js**
- **SQLite3** (قاعدة البيانات باستخدام `better-sqlite3`)
- **Bcrypt.js & JSON Web Tokens (JWT)** (للتشفير والتوثيق)
- **Cors & Dotenv**

## 📂 هيكل المشروع (Project Structure)
```text
FOMO/
├── backend/               # الخادم وقواعد البيانات
│   ├── routes/            # مسارات الـ API (Auth, Products, Orders, Hassala, ...)
│   ├── index.js           # نقطة البداية للخادم
│   ├── db.js              # إعدادات قاعدة البيانات SQLite
│   └── package.json       # مكاتب الـ Backend
├── frontend/              # واجهة المستخدم
│   ├── src/
│   │   ├── components/    # مكونات React القابلة لإعادة الاستخدام
│   │   ├── pages/         # صفحات التطبيق (Dashboard, POS, ...)
│   │   ├── store/         # إعدادات Redux Slices
│   │   ├── layouts/       # تخطيط الصفحات (Layouts)
│   │   ├── context/       # الـ Context API إن وجد
│   │   ├── App.jsx        
│   │   └── main.jsx       
│   └── package.json       # مكاتب الـ Frontend
├── package.json           # مكاتب المشروع الرئيسي (Concurrently)
└── .gitignore             
```

## 🚀 كيفية التشغيل (Getting Started)

### المتطلبات المسبقة:
- [Node.js](https://nodejs.org/) (إصدار حديث)

### 1️⃣ التثبيت (Installation)
قم بتثبيت الحزم الأساسية في المجلد الرئيسي، وكذلك في مجلدي `backend` و `frontend`:
```bash
# في المجلد الرئيسي (Root)
npm install

# في مجلد backend
cd backend
npm install

# في مجلد frontend
cd ../frontend
npm install
```

### 2️⃣ التشغيل (Running the Project)
يوفر المشروع أوامر تشغيل مبسطة باستخدام `concurrently` لتشغيل الواجهتين الأمامية والخلفية معاً بضغطة زر.

من **المجلد الرئيسي (Root)**، قم بتشغيل:
```bash
npm run dev
```
سيتم تشغيل:
- **Backend**: يعمل على المنفذ (Port 5000 أو حسب ملف الـ .env)
- **Frontend**: يعمل من خلال Vite.

*ملاحظة: يمكنك تشغيل كل جزء بشكل منفصل باستخدام:*
- `npm run dev:backend`
- `npm run dev:frontend`

## 📡 أهم نقاط النهاية للـ API (Endpoints)
- `/api/auth`: تسجيل الدخول وإدارة المستخدمين.
- `/api/products` & `/api/categories`: إدارة المنيو والمنتجات.
- `/api/orders`: إدارة الطلبات.
- `/api/customers` & `/api/representatives`: إدارة الأشخاص.
- `/api/hassala` & `/api/personal-hassala`: التتبع المالي اليومي.
