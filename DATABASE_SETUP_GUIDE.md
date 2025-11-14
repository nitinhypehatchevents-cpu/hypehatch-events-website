# Database Setup Guide

## Current Status

✅ **The website works WITHOUT a database** - It shows empty states gracefully
❌ **The dashboard CANNOT save data** without a database configured

---

## When to Configure Database

### Option 1: Configure Now (Recommended for Testing)
**Pros:**
- Test dashboard functionality immediately
- Upload and manage content during development
- Verify everything works before going live
- Can use local database (free, easy setup)

**Cons:**
- Need to set up database locally
- Will need to migrate data to production later

### Option 2: Configure When Going Live
**Pros:**
- One-time setup
- No local database needed during development

**Cons:**
- Cannot test dashboard functionality
- Cannot upload/manage content until live
- Risk of issues when going live
- Website will show empty states until database is configured

---

## Recommendation: **Configure Now for Testing**

I recommend setting up a **local database now** for testing, then using a **production database** when going live.

---

## Database Options

### 1. Local Development (Free, Easy)
- **PostgreSQL** (recommended) - Free, powerful
- **SQLite** (simplest) - File-based, no server needed
- **MySQL** - Alternative option

### 2. Production (When Going Live)
- **Vercel Postgres** (if hosting on Vercel) - Easy integration
- **Supabase** - Free tier available, PostgreSQL
- **Railway** - PostgreSQL hosting
- **AWS RDS** - Enterprise option
- **DigitalOcean** - Managed PostgreSQL

---

## Quick Setup: Local PostgreSQL (Recommended)

### Step 1: Install PostgreSQL
**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Or use Docker:**
```bash
docker run --name hypehatch-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14
```

### Step 2: Create Database
```bash
createdb hypehatch_events
# Or via psql:
psql -U postgres
CREATE DATABASE hypehatch_events;
```

### Step 3: Update `.env.local`
Add to `website/.env.local`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hypehatch_events?schema=public"
ADMIN_USER=admin
ADMIN_PASS=admin123
```

### Step 4: Run Migrations
```bash
cd website
npx prisma migrate dev --name init
npx prisma generate
```

### Step 5: Restart Server
```bash
npm run dev
```

---

## Quick Setup: SQLite (Simplest - No Server Needed)

### Step 1: Update `prisma/schema.prisma`
Change:
```prisma
datasource db {
  provider = "sqlite"  // Changed from "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 2: Update `.env.local`
```env
DATABASE_URL="file:./dev.db"
ADMIN_USER=admin
ADMIN_PASS=admin123
```

### Step 3: Run Migrations
```bash
cd website
npx prisma migrate dev --name init
npx prisma generate
```

### Step 4: Restart Server
```bash
npm run dev
```

**Note:** SQLite file will be created at `website/prisma/dev.db`

---

## Production Setup (When Going Live)

### Option A: Vercel Postgres (If hosting on Vercel)
1. Go to Vercel Dashboard → Your Project → Storage
2. Create Postgres database
3. Copy connection string
4. Add to Vercel Environment Variables: `DATABASE_URL`
5. Run migrations: `npx prisma migrate deploy`

### Option B: Supabase (Free tier available)
1. Sign up at supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Add to `.env.local` or hosting environment variables
6. Run migrations: `npx prisma migrate deploy`

---

## Current Behavior Without Database

✅ **Frontend:**
- Shows empty states: "No images available. Upload from dashboard..."
- No errors, graceful handling

❌ **Dashboard:**
- Cannot upload images (returns 503 error)
- Cannot add brands (returns 503 error)
- Cannot add testimonials (returns 503 error)
- Cannot manage hero images (returns 503 error)

---

## Next Steps

**Choose one:**
1. **Set up local database now** - I can help you configure it
2. **Wait until going live** - Website will work but dashboard won't save data
3. **Use SQLite for quick testing** - Simplest option, no server needed

Let me know which option you prefer!



