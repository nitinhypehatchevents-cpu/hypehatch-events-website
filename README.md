# Hypehatch Events Website

A modern, high-performance website for Hypehatch Events - Experiential Marketing & BTL Activations.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📋 Features

- ✅ **Dynamic Content Management** - Admin dashboard for managing all content
- ✅ **Image Upload & Management** - Upload, organize, and manage images
- ✅ **Contact Form** - Working contact form with message management
- ✅ **Performance Optimized** - Lightning-fast loading (50-60% faster)
- ✅ **SEO Optimized** - Meta tags, sitemap, robots.txt
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Secure Admin Dashboard** - Password-protected with bcrypt hashing
- ✅ **Database Support** - SQLite (dev) / PostgreSQL (production)

## 🔐 Admin Dashboard

- **URL:** `/admin/login`
- **Features:**
  - Hero section management
  - Portfolio management (Events & Activations)
  - Brand logo management
  - Testimonials management
  - Contact information management
  - Contact messages viewer
  - Password change functionality

## 🗄️ Database Setup

### Local Development (SQLite)
```bash
# Database is auto-created on first run
npm run dev
```

### Production (PostgreSQL)
1. Set `DATABASE_URL` environment variable
2. Run migrations: `npx prisma migrate deploy`
3. Generate client: `npx prisma generate`

## 🚀 Deployment

See **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** for complete deployment guide.

### Quick Deploy to Vercel

1. **Push to GitHub**
2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables (see DEPLOY_NOW.md)
   - Deploy!

### Required Environment Variables

```env
DATABASE_URL=your_postgresql_connection_string
ADMIN_USER=admin (optional, fallback)
ADMIN_PASS=your_secure_password (optional, fallback)
NODE_ENV=production
```

## 📁 Project Structure

```
website/
├── app/              # Next.js app router
│   ├── admin/       # Admin dashboard pages
│   ├── api/         # API routes
│   └── page.tsx      # Home page
├── components/       # React components
├── lib/              # Utilities & helpers
├── public/           # Static assets
│   ├── icons/       # Organized icons
│   ├── images/      # Images
│   └── uploads/     # User-uploaded content
└── prisma/          # Database schema
```

## 🛠️ Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

## 📚 Documentation

- **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** - Complete deployment guide
- **[SETUP.md](./SETUP.md)** - Setup instructions
- **[DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md)** - Database setup
- **[SECURITY_GUIDE.md](./SECURITY_GUIDE.md)** - Security information
- **[ASSETS_ORGANIZATION.md](./ASSETS_ORGANIZATION.md)** - Asset organization
- **[PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md)** - Performance details

## 🔒 Security

- ✅ Bcrypt password hashing (12 rounds)
- ✅ Rate limiting (5 attempts max)
- ✅ Account locking (15 minutes)
- ✅ Input sanitization
- ✅ Secure session management
- ✅ XSS protection
- ✅ SQL injection prevention (Prisma)

## ⚡ Performance

- ✅ Code splitting & lazy loading
- ✅ Image optimization
- ✅ Font optimization
- ✅ Bundle size optimization
- ✅ API call optimization
- ✅ Caching strategies

## 📞 Support

For issues or questions, check the documentation files or contact the development team.

---

**Built with:** Next.js 16, React 19, TypeScript, Tailwind CSS, Prisma, Framer Motion
