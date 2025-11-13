# 🚀 DEPLOY NOW - Quick Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] Build compiles successfully
- [x] All components optimized
- [x] Performance optimizations applied
- [x] Assets organized
- [x] Security configured
- [x] Vercel config ready

---

## 📋 Step-by-Step Deployment

### **Step 1: Prepare Your Code**

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Verify build works:**
   ```bash
   npm run build
   ```
   ✅ Should complete without errors

---

### **Step 2: Deploy to Vercel**

#### **Option A: Via Vercel Dashboard (Recommended)**

1. **Go to [vercel.com](https://vercel.com)**
   - Sign up/Login with GitHub

2. **Import Your Project**
   - Click "Add New Project"
   - Import your GitHub repository
   - Or drag & drop your project folder

3. **Configure Project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `website` (if repo has multiple folders)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install`

4. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```
   DATABASE_URL=your_postgresql_connection_string
   ADMIN_USER=your_admin_username
   ADMIN_PASS=your_secure_password
   NODE_ENV=production
   ```

5. **Deploy!**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

#### **Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd website
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (first time) or Yes (updates)
# - Project name? hypehatch-events-website
# - Directory? ./
# - Override settings? No
```

---

### **Step 3: Set Up Database (PostgreSQL)**

#### **Option A: Vercel Postgres (Easiest) - Recommended for India**

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - **Choose Region:** Mumbai or Singapore (closest to India)
   - Create database
   - Copy connection string

2. **Add to Environment Variables:**
   - `DATABASE_URL` = your connection string

#### **Option B: Supabase (Free Tier) - Good for India**

1. **Go to [supabase.com](https://supabase.com)**
2. **Create account** (free)
3. **Create new project:**
   - Name: Hypehatch Events
   - **Region:** Southeast Asia (Singapore) - closest to India
   - Database password: (save it!)
4. **Get connection string:**
   - Settings → Database → Connection string
5. **Add to Vercel Environment Variables:**
   - `DATABASE_URL` = your Supabase connection string

#### **Option C: Neon (Free Tier) - Serverless Postgres**

1. **Go to [neon.tech](https://neon.tech)**
2. **Create account** (free)
3. **Create project:**
   - **Region:** Choose closest to India
4. **Copy connection string**
5. **Add to Vercel Environment Variables:**
   - `DATABASE_URL` = your Neon connection string

---

### **Step 4: Run Database Migrations**

After deployment, run migrations:

**Option A: Via Vercel Dashboard**
- Go to project → Settings → Environment Variables
- Add `DATABASE_URL` if not already added
- Redeploy (migrations run automatically via `postinstall` script)

**Option B: Via Vercel CLI**
```bash
vercel env pull .env.local
npx prisma migrate deploy
npx prisma generate
```

**Option C: Via Vercel Functions**
- Create a one-time migration script
- Or use Vercel's postinstall hook (already configured)

---

### **Step 5: Create Admin User**

After database is set up:

1. **Visit:** `https://your-domain.com/admin/setup`
2. **Create admin account:**
   - Username: (choose your username)
   - Password: (strong password required)
3. **Login:** `https://your-domain.com/admin/login`

---

## 🔐 Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `ADMIN_USER` | ⚠️ Optional* | Admin username (fallback) | `admin` |
| `ADMIN_PASS` | ⚠️ Optional* | Admin password (fallback) | `SecurePass123!` |
| `NODE_ENV` | ✅ Yes | Environment | `production` |

*Optional if using database-based authentication (recommended)

---

## ✅ Post-Deployment Checklist

- [ ] Website loads correctly
- [ ] Admin dashboard accessible
- [ ] Can login to admin
- [ ] Can upload images
- [ ] Can manage content
- [ ] Contact form works
- [ ] All sections display correctly
- [ ] Images load properly
- [ ] Mobile responsive
- [ ] Performance is good

---

## 🔧 Troubleshooting

### **Build Fails:**
- Check environment variables are set
- Verify `DATABASE_URL` format
- Check build logs in Vercel dashboard

### **Database Errors:**
- Verify `DATABASE_URL` is correct
- Run migrations: `npx prisma migrate deploy`
- Check database is accessible

### **Admin Login Fails:**
- Create admin user via `/admin/setup`
- Or set `ADMIN_USER` and `ADMIN_PASS` env vars

### **Images Not Loading:**
- Check `/uploads` folder exists
- Verify file permissions
- Check image paths in database

---

## 📝 Quick Commands

```bash
# Build locally
npm run build

# Test production build
npm run build && npm start

# Deploy to Vercel
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

---

## 🎯 Your Website is Ready!

After deployment:
- ✅ Website: `https://your-domain.vercel.app`
- ✅ Admin: `https://your-domain.vercel.app/admin/login`
- ✅ All features working
- ✅ Optimized and fast
- ✅ Production-ready

**Good luck with your launch! 🚀**

