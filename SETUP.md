# Hypehatch Events Website - Setup Guide

## Prerequisites

- Node.js 18+ (use `.nvmrc` for version management)
- PostgreSQL database
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database URL and admin credentials:
```
DATABASE_URL="postgresql://user:password@localhost:5432/hypehatch_events?schema=public"
ADMIN_USER="admin"
ADMIN_PASS="your_secure_password_here"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

3. Set up Prisma:
```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

4. Create upload directories:
```bash
mkdir -p public/uploads/originals public/uploads/thumbnails
```

## Development

Start the development server:
```bash
npm run dev
```

Visit:
- Homepage: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin/gallery

## Admin Dashboard

1. Navigate to `/admin/gallery`
2. Login with credentials from `.env.local`
3. Upload images (max 2MB, JPEG/PNG/WebP)
4. Images are automatically optimized and thumbnails are generated

## API Endpoints

- `GET /api/gallery` - Fetch gallery images (supports `?limit=12` and `?category=CategoryName`)
- `POST /api/upload` - Upload new image (requires Basic Auth)
- `DELETE /api/gallery/[id]` - Delete image (requires Basic Auth)

## Production Build

```bash
npm run build
npm start
```

## Troubleshooting

- **Database connection errors**: Verify `DATABASE_URL` in `.env.local`
- **Image upload fails**: Check file size (< 2MB) and format (JPEG/PNG/WebP)
- **Prisma errors**: Run `npx prisma generate` after schema changes


