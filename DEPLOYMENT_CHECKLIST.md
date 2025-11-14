# ✅ Deployment Checklist

## Pre-Deployment

- [x] Build compiles successfully (`npm run build`)
- [x] All TypeScript errors resolved
- [x] All linting errors resolved
- [x] Performance optimizations applied
- [x] Assets organized correctly
- [x] Security measures in place
- [x] Environment variables documented

## Deployment Steps

### 1. Code Preparation
- [ ] Commit all changes to Git
- [ ] Push to GitHub/GitLab
- [ ] Verify no sensitive data in code
- [ ] Check `.gitignore` is correct

### 2. Vercel Setup
- [ ] Create Vercel account (if needed)
- [ ] Import project from repository
- [ ] Configure build settings:
  - [ ] Framework: Next.js
  - [ ] Root Directory: `website` (if needed)
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`

### 3. Environment Variables
- [ ] Add `DATABASE_URL` (PostgreSQL connection string)
- [ ] Add `ADMIN_USER` (optional, fallback)
- [ ] Add `ADMIN_PASS` (optional, fallback)
- [ ] Add `NODE_ENV=production`
- [ ] Add `NEXT_PUBLIC_SITE_URL` (your domain)

### 4. Database Setup
- [ ] Create PostgreSQL database (Vercel Postgres, Supabase, Neon, etc.)
- [ ] Copy connection string
- [ ] Add to environment variables
- [ ] Run migrations (automatic via postinstall or manual)

### 5. Deploy
- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete
- [ ] Check build logs for errors
- [ ] Verify deployment URL works

### 6. Post-Deployment
- [ ] Visit website URL
- [ ] Test all pages load correctly
- [ ] Test admin login (`/admin/login`)
- [ ] Create admin user (`/admin/setup`)
- [ ] Test image upload
- [ ] Test contact form
- [ ] Verify mobile responsiveness
- [ ] Check performance (PageSpeed Insights)

### 7. Domain Setup (Optional)
- [ ] Add custom domain in Vercel
- [ ] Configure DNS records
- [ ] Wait for SSL certificate
- [ ] Test custom domain

## Critical Items

⚠️ **Must Do:**
1. Set `DATABASE_URL` environment variable
2. Run database migrations
3. Create admin user
4. Test all functionality

✅ **Recommended:**
1. Set up custom domain
2. Configure analytics
3. Set up monitoring
4. Enable backups

## Quick Commands

```bash
# Build locally
npm run build

# Test production build
npm run build && npm start

# Deploy to Vercel
vercel --prod

# Check deployment
vercel ls
```

## Troubleshooting

**Build fails:**
- Check environment variables
- Verify `DATABASE_URL` format
- Check build logs

**Database errors:**
- Verify connection string
- Run migrations: `npx prisma migrate deploy`
- Check database accessibility

**Admin login fails:**
- Create admin via `/admin/setup`
- Or set `ADMIN_USER` and `ADMIN_PASS`

---

**Ready to deploy?** Follow [DEPLOY_NOW.md](./DEPLOY_NOW.md) for detailed instructions.


