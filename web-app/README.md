# Nonprofit Management Web App

Web version of the nonprofit volunteer management app, connecting to the same Firebase database as the mobile app.

## 🚀 Quick Start

### Local Development
```bash
cd web-app
bun install
bun dev
```

The app will be available at `http://localhost:5173`

## 📦 Deployment to Vercel

### Option 1: Vercel CLI (Recommended)
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd web-app
   vercel
   ```

### Option 2: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Set the root directory to `web-app`
5. Click "Deploy"

## 🔥 Firebase Configuration

The app uses the same Firebase configuration as the mobile app:
- **Database**: `sevenmore-app-5a969`
- **Project ID**: `sevenmore-app-5a969`
- **Region**: Default

All data is synchronized in real-time between web and mobile apps.

## 🔐 Login

Use the same credentials as your mobile app. The web app validates against the same `/users` path in Firebase.

## 📝 Features

- ✅ Same Firebase database as mobile app
- ✅ Real-time data synchronization
- ✅ Responsive design
- ✅ Secure login system
- ✅ Role-based access control

## 🌐 Custom Domain

After deploying to Vercel, you can add your custom domain:
1. Go to Project Settings → Domains
2. Add your domain (e.g., `app.yourdomain.com`)
3. Follow Vercel's DNS configuration instructions

## 📱 Connecting with Mobile App

Both apps share the same Firebase Realtime Database, so:
- Users created in mobile app can login on web
- Data updated on web appears instantly on mobile
- All participant, task, and scheduling data is synchronized
