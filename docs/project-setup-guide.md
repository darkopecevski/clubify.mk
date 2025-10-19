# Project Setup Guide
## Clubify.mk - Development Environment Setup

### Version 1.0
**Last Updated:** 2025-10-18

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Initial Setup](#2-initial-setup)
3. [Supabase Setup](#3-supabase-setup)
4. [Next.js Application Setup](#4-nextjs-application-setup)
5. [Database Setup](#5-database-setup)
6. [Environment Configuration](#6-environment-configuration)
7. [Running the Application](#7-running-the-application)
8. [Development Workflow](#8-development-workflow)
9. [Deployment](#9-deployment)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

### 1.1 Required Software

Install the following software before starting:

| Software | Minimum Version | Installation |
|----------|----------------|--------------|
| **Node.js** | 18.17.0 LTS | https://nodejs.org/ |
| **pnpm** | 8.0+ | `npm install -g pnpm` |
| **Git** | 2.0+ | https://git-scm.com/ |
| **Docker** (optional) | 20.0+ | https://www.docker.com/ |
| **VS Code** (recommended) | Latest | https://code.visualstudio.com/ |

### 1.2 Verify Installation

```bash
# Check Node.js version
node --version  # Should be v18.17.0 or higher

# Check pnpm version
pnpm --version  # Should be 8.0.0 or higher

# Check Git version
git --version   # Should be 2.0.0 or higher
```

### 1.3 Recommended VS Code Extensions

Install these extensions for the best development experience:

```bash
# Open VS Code and install:
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- GitLens
- Error Lens
- Auto Rename Tag
- TypeScript Importer
```

Or use the command palette (Cmd/Ctrl + Shift + P) and search for "Extensions: Show Recommended Extensions"

---

## 2. Initial Setup

### 2.1 Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/clubify.mk.git

# Navigate to project directory
cd clubify.mk
```

### 2.2 Install Dependencies

```bash
# Install all dependencies using pnpm
pnpm install

# This will install:
# - Next.js
# - React
# - TypeScript
# - Tailwind CSS
# - Supabase client
# - TanStack Query
# - shadcn/ui components
# - All other dependencies
```

---

## 3. Supabase Setup

### 3.1 Create Supabase Account

1. Go to https://supabase.com/
2. Click "Start your project"
3. Sign up with GitHub (recommended)

### 3.2 Create New Project

1. Click "New Project"
2. Fill in:
   - **Name:** `clubify-dev` (for development)
   - **Database Password:** Generate a strong password and **save it securely**
   - **Region:** Choose closest to you (e.g., `eu-central-1` for Europe)
   - **Pricing Plan:** Free tier
3. Click "Create new project"
4. Wait 2-3 minutes for project to be provisioned

### 3.3 Get Project Credentials

Once project is ready:

1. Go to **Settings** > **API**
2. Copy the following values:

```
Project URL: https://xxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (keep secret!)
```

### 3.4 Install Supabase CLI (Optional but Recommended)

```bash
# macOS
brew install supabase/tap/supabase

# Windows (PowerShell)
scoop install supabase

# Linux
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase

# Verify installation
supabase --version
```

### 3.5 Link Local Project to Supabase

```bash
# Login to Supabase
supabase login

# Link to your remote project
supabase link --project-ref xxxxx
# (get project ref from Supabase dashboard URL)

# Generate TypeScript types from database
supabase gen types typescript --linked > types/database.types.ts
```

---

## 4. Next.js Application Setup

### 4.1 Initialize Next.js Application

If starting from scratch (skip if cloning existing repo):

```bash
# Create Next.js app with TypeScript
pnpm create next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# Answer prompts:
# ✔ Would you like to use TypeScript? Yes
# ✔ Would you like to use ESLint? Yes
# ✔ Would you like to use Tailwind CSS? Yes
# ✔ Would you like to use `src/` directory? Yes
# ✔ Would you like to use App Router? Yes
# ✔ Would you like to customize the default import alias (@/*)? No
```

### 4.2 Install Core Dependencies

```bash
# Supabase
pnpm add @supabase/supabase-js @supabase/ssr

# State management
pnpm add @tanstack/react-query zustand

# Form handling
pnpm add react-hook-form @hookform/resolvers zod

# UI components
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
pnpm add @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-avatar
pnpm add lucide-react class-variance-authority clsx tailwind-merge

# Internationalization
pnpm add next-intl

# Date handling
pnpm add date-fns date-fns-tz

# Utilities
pnpm add nanoid
```

### 4.3 Install Dev Dependencies

```bash
# Type definitions
pnpm add -D @types/node @types/react @types/react-dom

# Testing
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D @playwright/test

# Code quality
pnpm add -D eslint-config-prettier prettier prettier-plugin-tailwindcss

# TypeScript Supabase types
pnpm add -D supabase@">=1.8.1" --save-exact
```

### 4.4 Initialize shadcn/ui

```bash
# Initialize shadcn/ui
pnpm dlx shadcn-ui@latest init

# Answer prompts:
# ✔ Which style would you like to use? › Default
# ✔ Which color would you like to use as base color? › Slate
# ✔ Would you like to use CSS variables for colors? › yes

# Install commonly used components
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add form
pnpm dlx shadcn-ui@latest add table
pnpm dlx shadcn-ui@latest add dialog
pnpm dlx shadcn-ui@latest add dropdown-menu
pnpm dlx shadcn-ui@latest add select
pnpm dlx shadcn-ui@latest add toast
pnpm dlx shadcn-ui@latest add card
pnpm dlx shadcn-ui@latest add badge
pnpm dlx shadcn-ui@latest add avatar
pnpm dlx shadcn-ui@latest add tabs
pnpm dlx shadcn-ui@latest add calendar
```

---

## 5. Database Setup

### 5.1 Create Database Schema

**Option A: Using Supabase Dashboard (Recommended for first time)**

1. Go to Supabase Dashboard > SQL Editor
2. Copy the schema from `docs/database-schema.md`
3. Run each section sequentially
4. Verify tables are created in Table Editor

**Option B: Using Migrations (Recommended for production)**

```bash
# Create initial migration
supabase migration new create_initial_schema

# This creates: supabase/migrations/YYYYMMDDHHMMSS_create_initial_schema.sql

# Copy schema SQL into the migration file
# Then apply migration
supabase db push

# Generate TypeScript types
supabase gen types typescript --linked > types/database.types.ts
```

### 5.2 Enable Row Level Security (RLS)

```bash
# Create RLS policies migration
supabase migration new create_rls_policies

# Add RLS policies from docs/database-schema.md
# Then apply
supabase db push
```

### 5.3 Create Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Create buckets:

```
- club-logos (public)
- player-photos (private with RLS)
- media-gallery (public)
- documents (private with RLS)
```

3. Set bucket policies:

```sql
-- Example: Allow club admins to upload club logos
CREATE POLICY "club_admin_upload_logo" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'club-logos'
  AND auth.uid() IN (
    SELECT user_id FROM user_roles
    WHERE role = 'club_admin'
  )
);
```

### 5.4 Seed Initial Data

```bash
# Create seed file
supabase/seed.sql

# Add sample data:
# - Super admin user
# - Sample club
# - Sample teams
# - Test players

# Run seed (local only)
supabase db reset  # This will reset DB and run migrations + seed
```

---

## 6. Environment Configuration

### 6.1 Create Environment Files

Create the following files in project root:

**.env.local** (Local development - **DO NOT COMMIT**)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Keep secret!

# Email (Resend)
RESEND_API_KEY=re_xxx  # Get from https://resend.com/

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Internationalization
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

**.env.example** (Template - **COMMIT THIS**)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email
RESEND_API_KEY=your_resend_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Internationalization
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

**.gitignore** (Make sure it includes)
```
.env*.local
.env.local
.env.development.local
.env.production.local
```

### 6.2 Environment Variable Validation

Create `lib/env.ts`:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(['en', 'mk', 'sq']),
});

export const env = envSchema.parse(process.env);
```

---

## 7. Running the Application

### 7.1 Development Server

```bash
# Start Next.js development server
pnpm dev

# Server will start at http://localhost:3000
# Open browser and navigate to localhost:3000
```

### 7.2 Run with Supabase Local (Optional)

```bash
# Start local Supabase (requires Docker)
supabase start

# This will start:
# - PostgreSQL database
# - Supabase Studio (http://localhost:54323)
# - PostgREST API
# - Realtime server
# - Storage server

# Update .env.local to use local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (from supabase start output)

# Then start Next.js
pnpm dev
```

### 7.3 Run Tests

```bash
# Run unit tests
pnpm test

# Run unit tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e:ui
```

### 7.4 Build for Production

```bash
# Build the application
pnpm build

# Start production server locally
pnpm start
```

---

## 8. Development Workflow

### 8.1 Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/player-management

# 2. Make changes, commit frequently
git add .
git commit -m "feat: add player list component"

# 3. Push to GitHub
git push origin feature/player-management

# 4. Create Pull Request on GitHub

# 5. After review, merge to main
```

### 8.2 Database Changes

```bash
# 1. Create migration
supabase migration new add_player_notes_column

# 2. Edit migration file
# supabase/migrations/YYYYMMDDHHMMSS_add_player_notes_column.sql
ALTER TABLE players ADD COLUMN notes TEXT;

# 3. Apply migration locally
supabase db push

# 4. Generate new types
supabase gen types typescript --linked > types/database.types.ts

# 5. Commit migration file
git add supabase/migrations/
git commit -m "db: add notes column to players table"

# 6. Migration will auto-apply on deployment (Supabase CLI in CI/CD)
```

### 8.3 Adding New shadcn/ui Components

```bash
# Add component (e.g., Accordion)
pnpm dlx shadcn-ui@latest add accordion

# Component will be added to components/ui/accordion.tsx
# Import and use in your code
```

### 8.4 Code Quality Checks

```bash
# Run ESLint
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Type check
pnpm type-check
```

Add these scripts to `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 9. Deployment

### 9.1 Deploy to Netlify

**Initial Setup:**

1. Push code to GitHub
2. Go to https://netlify.com/ and sign up
3. Click "Add new site" > "Import an existing project"
4. Connect to GitHub and select `clubify.mk` repository
5. Configure build settings:

```
Build command: pnpm build
Publish directory: .next
```

6. Add environment variables (from `.env.local`)
7. Click "Deploy site"

**Subsequent Deploys:**
- Every push to `main` branch auto-deploys to production
- Pull requests create deploy previews

### 9.2 Deploy Database Migrations

```bash
# Apply migrations to production Supabase
supabase link --project-ref your-prod-project-ref
supabase db push --linked

# Or via CI/CD (GitHub Actions example)
```

### 9.3 Setup Custom Domain

1. Purchase domain (e.g., `clubify.mk`)
2. In Netlify: **Domain settings** > **Add custom domain**
3. Add domain: `clubify.mk`
4. Configure DNS:
   - Add A record pointing to Netlify's load balancer
   - Add CNAME for `www`
5. Enable HTTPS (automatic via Let's Encrypt)

### 9.4 Setup Subdomain Routing

For club subdomains (e.g., `vardar.clubify.mk`):

1. In Netlify: **Domain settings** > **Add domain alias**
2. Add wildcard domain: `*.clubify.mk`
3. Configure DNS:
   - Add A record for `*` pointing to Netlify
4. Update Next.js middleware to handle subdomain routing

---

## 10. Troubleshooting

### 10.1 Common Issues

**Issue: `pnpm install` fails**
```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

**Issue: Supabase connection error**
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verify Supabase project is running
# Check API settings in Supabase dashboard
```

**Issue: TypeScript errors after database changes**
```bash
# Regenerate database types
supabase gen types typescript --linked > types/database.types.ts

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

**Issue: RLS policy blocking queries**
```bash
# Check RLS policies in Supabase dashboard
# Temporarily disable RLS for debugging (Table > RLS > Disable)
# Check user authentication status
# Verify user has correct role in user_roles table
```

**Issue: Next.js build fails**
```bash
# Check for TypeScript errors
pnpm type-check

# Check for linting errors
pnpm lint

# Clear Next.js cache
rm -rf .next

# Rebuild
pnpm build
```

### 10.2 Useful Commands

```bash
# View Supabase logs
supabase functions logs

# View local Supabase status
supabase status

# Stop local Supabase
supabase stop

# Reset local database
supabase db reset

# Generate types
supabase gen types typescript --linked > types/database.types.ts

# View Next.js build info
pnpm build --debug
```

### 10.3 Getting Help

- **Supabase:** https://supabase.com/docs | Discord: https://discord.supabase.com/
- **Next.js:** https://nextjs.org/docs | Discord: https://discord.gg/nextjs
- **shadcn/ui:** https://ui.shadcn.com/ | GitHub Discussions
- **Stack Overflow:** Tag questions with `next.js`, `supabase`, `typescript`

---

## 11. Project Structure Reference

```
clubify.mk/
├── app/                          # Next.js App Router
│   ├── [locale]/                # i18n routing
│   │   ├── (auth)/              # Protected routes
│   │   │   ├── dashboard/       # Dashboards (role-based)
│   │   │   ├── players/         # Player management
│   │   │   ├── teams/           # Team management
│   │   │   ├── matches/         # Match management
│   │   │   └── settings/        # Settings
│   │   ├── (public)/            # Public routes
│   │   │   ├── [club]/          # Club public pages
│   │   │   ├── login/           # Login page
│   │   │   └── signup/          # Signup page
│   │   └── layout.tsx           # Root layout
│   └── api/                     # API routes
│       ├── auth/                # Auth endpoints
│       └── webhooks/            # Webhooks
├── components/                  # React components
│   ├── ui/                      # shadcn/ui components
│   ├── shared/                  # Shared components
│   ├── forms/                   # Form components
│   └── layouts/                 # Layout components
├── lib/                         # Utility functions
│   ├── supabase/                # Supabase clients
│   ├── hooks/                   # Custom hooks
│   ├── utils/                   # Helper functions
│   └── validations/             # Zod schemas
├── types/                       # TypeScript types
│   ├── database.types.ts        # Supabase generated types
│   └── custom.types.ts          # Custom types
├── messages/                    # i18n translations
│   ├── en.json
│   ├── mk.json
│   └── sq.json
├── public/                      # Static assets
├── supabase/                    # Supabase configuration
│   ├── migrations/              # Database migrations
│   ├── functions/               # Edge functions
│   └── seed.sql                 # Seed data
├── tests/                       # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                        # Documentation
├── .env.local                   # Local environment variables (gitignored)
├── .env.example                 # Environment template
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── pnpm-lock.yaml              # Lockfile
```

---

## 12. Next Steps

After completing setup:

1. ✅ Verify development server runs without errors
2. ✅ Create first super admin user via Supabase Auth
3. ✅ Test database connection (create test club)
4. ✅ Implement authentication flow
5. ✅ Build first feature (e.g., club management)
6. ✅ Write tests for critical paths
7. ✅ Deploy to staging (Netlify deploy preview)
8. ✅ Deploy to production

**You're now ready to start building Clubify.mk!** 🚀

---

## Appendix A: Quick Start Checklist

- [ ] Install Node.js 18+, pnpm, Git
- [ ] Clone repository
- [ ] Run `pnpm install`
- [ ] Create Supabase account and project
- [ ] Copy `.env.example` to `.env.local` and fill in values
- [ ] Run database migrations (`supabase db push`)
- [ ] Generate TypeScript types (`supabase gen types...`)
- [ ] Start dev server (`pnpm dev`)
- [ ] Visit http://localhost:3000
- [ ] Create super admin user
- [ ] Start coding! 🎉

---

## Appendix B: Useful Resources

- **Project Docs:** `/docs` folder
- **Supabase Dashboard:** https://app.supabase.com/
- **Netlify Dashboard:** https://app.netlify.com/
- **Resend Dashboard:** https://resend.com/
- **GitHub Repo:** https://github.com/your-username/clubify.mk

---
