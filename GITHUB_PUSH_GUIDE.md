# 📤 How to Push Code to GitHub

## ✅ Step 1: Create GitHub Repository

1. **Go to [github.com](https://github.com)**
   - Sign up/Login to your account

2. **Create New Repository:**
   - Click the **"+"** icon (top right) → **"New repository"**
   - **Repository name:** `hypehatch-events-website` (or any name you like)
   - **Description:** "Hypehatch Events - Experiential Marketing Website"
   - **Visibility:** Choose **Public** or **Private**
   - **DO NOT** check "Initialize with README" (we already have code)
   - Click **"Create repository"**

3. **Copy the repository URL:**
   - After creating, GitHub will show you a URL like:
   - `https://github.com/your-username/hypehatch-events-website.git`
   - **Copy this URL** - you'll need it in the next step

---

## ✅ Step 2: Connect and Push Code

### **Option A: Using Terminal (Recommended)**

Open Terminal and run these commands:

```bash
# Navigate to your project
cd "/Volumes/Nitin Exter/Hypehatch Events Website/website"

# Add GitHub repository as remote
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push code to GitHub
git branch -M main
git push -u origin main
```

**Replace:**
- `YOUR-USERNAME` with your GitHub username
- `YOUR-REPO-NAME` with your repository name

**Example:**
```bash
git remote add origin https://github.com/nitinkg/hypehatch-events-website.git
git branch -M main
git push -u origin main
```

### **Option B: Using GitHub Desktop**

1. **Download GitHub Desktop:** https://desktop.github.com
2. **Install and login**
3. **Add Local Repository:**
   - File → Add Local Repository
   - Select: `/Volumes/Nitin Exter/Hypehatch Events Website/website`
4. **Publish Repository:**
   - Click "Publish repository"
   - Choose name and visibility
   - Click "Publish"

---

## ✅ Step 3: Verify

1. **Go to your GitHub repository page**
2. **You should see all your files**
3. **Check that `.env.local` is NOT there** (it's in `.gitignore` - good!)

---

## 🔐 Important Notes

### **What's NOT pushed (protected):**
- ✅ `.env.local` - Contains your database password (protected)
- ✅ `node_modules/` - Dependencies (too large)
- ✅ `.next/` - Build files (generated)
- ✅ `prisma/dev.db` - Local database (not needed)

### **What IS pushed:**
- ✅ All source code
- ✅ Configuration files
- ✅ Public assets (images, icons)
- ✅ Prisma schema (but not database file)

---

## 🚀 Next Step: Deploy to Vercel

After pushing to GitHub:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js
4. Add environment variables (DATABASE_URL, etc.)
5. Deploy!

---

## ❓ Troubleshooting

### **"Repository not found"**
- Check repository name and username
- Make sure repository exists on GitHub

### **"Permission denied"**
- You might need to authenticate
- Use: `git push -u origin main` (will prompt for login)

### **"Authentication failed"**
- Use Personal Access Token instead of password
- GitHub → Settings → Developer settings → Personal access tokens → Generate new token

---

## 📝 Quick Commands Reference

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

