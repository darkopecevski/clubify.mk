# Technology Stack Summary
## Clubify.mk

### Version 1.0
**Last Updated:** 2025-10-18

---

## Quick Reference

### Core Stack
- **Frontend:** Next.js 14+ (TypeScript, React 18)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:** Netlify (frontend) + Supabase Cloud (backend)

---

## 1. Frontend Technologies

### 1.1 Framework & Language

**Next.js 14+** - React Framework
- **Why:** SSR/SSG for SEO, API routes, excellent DX, optimal for multi-tenant apps
- **Version:** 14+ (App Router)
- **Documentation:** https://nextjs.org/docs

**TypeScript** - Programming Language
- **Why:** Type safety, better IDE support, fewer runtime errors
- **Version:** 5.0+
- **Configuration:** Strict mode enabled
- **Documentation:** https://www.typescriptlang.org/docs/

**React 18+** - UI Library
- **Why:** Component-based, large ecosystem, industry standard
- **Version:** 18+
- **Documentation:** https://react.dev/

---

### 1.2 Styling & UI Components

**Tailwind CSS** - Utility-First CSS Framework
- **Why:** Fast development, small bundle size, consistent design
- **Version:** 3.4+
- **Documentation:** https://tailwindcss.com/docs

**shadcn/ui** - Component Library
- **Why:** Copy-paste components, full ownership, built on Radix UI (accessibility)
- **Components Used:**
  - Forms: Input, Select, Checkbox, Radio, Textarea, DatePicker
  - Data Display: Table, Card, Badge, Avatar
  - Feedback: Toast, Dialog, Alert, Skeleton
  - Navigation: Dropdown Menu, Tabs, Navigation Menu
  - Layout: Sheet, Accordion, Separator
- **Documentation:** https://ui.shadcn.com/

**Radix UI** - Unstyled Accessible Components (via shadcn/ui)
- **Why:** WCAG compliant, keyboard navigation, ARIA attributes
- **Documentation:** https://www.radix-ui.com/

**Lucide React** - Icon Library
- **Why:** Beautiful icons, tree-shakeable, consistent style
- **Documentation:** https://lucide.dev/

---

### 1.3 State Management

**TanStack Query (React Query)** - Server State Management
- **Why:** Caching, background refetching, optimistic updates, reduced boilerplate
- **Version:** 5.0+
- **Use Cases:**
  - Fetching players, teams, matches
  - Mutations (create player, update attendance)
  - Automatic cache invalidation
  - Real-time sync with Supabase
- **Documentation:** https://tanstack.com/query/latest

**Zustand** - Client State Management
- **Why:** Lightweight (1KB), simple API, no boilerplate
- **Version:** 4.0+
- **Use Cases:**
  - UI state (sidebar open/closed, theme)
  - Current user role context
  - Global filters and preferences
- **Documentation:** https://zustand-demo.pmnd.rs/

---

### 1.4 Form Handling & Validation

**React Hook Form** - Form State Management
- **Why:** Performant, less re-renders, great DX, integrates with Zod
- **Version:** 7.0+
- **Documentation:** https://react-hook-form.com/

**Zod** - Schema Validation
- **Why:** TypeScript-first, composable schemas, great error messages
- **Version:** 3.0+
- **Use Cases:**
  - Form validation
  - API request/response validation
  - Environment variable validation
- **Documentation:** https://zod.dev/

---

### 1.5 Internationalization

**next-intl** - i18n for Next.js
- **Why:** Built for Next.js App Router, type-safe translations, pluralization support
- **Version:** 3.0+
- **Languages:** English (en), Macedonian (mk), Albanian (sq)
- **Documentation:** https://next-intl-docs.vercel.app/

---

### 1.6 Date & Time

**date-fns** - Date Utility Library
- **Why:** Modular, immutable, functional, tree-shakeable
- **Version:** 3.0+
- **Use Cases:**
  - Date formatting
  - Relative time (e.g., "2 hours ago")
  - Date math (add/subtract)
  - Timezone handling (with date-fns-tz)
- **Documentation:** https://date-fns.org/

---

## 2. Backend Technologies

### 2.1 Backend Platform

**Supabase** - Backend-as-a-Service (BaaS)
- **Why:** Rapid development, managed infrastructure, built-in auth/storage/realtime
- **Version:** Latest
- **Services Used:**
  - PostgreSQL Database
  - PostgREST (auto-generated API)
  - Supabase Auth (authentication)
  - Supabase Storage (file uploads)
  - Supabase Realtime (WebSocket subscriptions)
  - Supabase Edge Functions (serverless)
- **Documentation:** https://supabase.com/docs

---

### 2.2 Database

**PostgreSQL 15+** - Relational Database
- **Why:** ACID compliance, powerful features, JSON support, excellent for multi-tenant
- **Version:** 15+
- **Features Used:**
  - Row Level Security (RLS)
  - Triggers & Functions
  - Foreign Keys & Constraints
  - Indexes
  - Full-text search
- **Documentation:** https://www.postgresql.org/docs/

**PostgREST** - Auto-generated REST API
- **Why:** Instant CRUD API from database schema, reduces backend code
- **Version:** Included with Supabase
- **Documentation:** https://postgrest.org/

---

### 2.3 Custom Backend Logic

**Next.js API Routes** - Serverless API Endpoints
- **Why:** Co-located with frontend, TypeScript support, easy deployment
- **Use Cases:**
  - Custom business logic
  - Complex queries not suitable for direct PostgREST
  - Webhook handlers
  - Cron jobs
- **Documentation:** https://nextjs.org/docs/pages/building-your-application/routing/api-routes

**Supabase Edge Functions** - Deno-based Serverless Functions
- **Why:** Close to database, fast cold starts, TypeScript support
- **Use Cases:**
  - Background jobs (payment reminders)
  - Scheduled tasks (monthly payment generation)
  - Complex database operations
- **Documentation:** https://supabase.com/docs/guides/functions

---

### 2.4 Authentication & Authorization

**Supabase Auth** - Authentication Service
- **Why:** Built-in, JWT-based, supports multiple providers, secure
- **Features:**
  - Email/Password authentication
  - Password reset
  - Email verification
  - Session management
  - JWT tokens
- **Documentation:** https://supabase.com/docs/guides/auth

**Row Level Security (RLS)** - Database-level Authorization
- **Why:** Data isolation at database level, multi-tenant safe, impossible to bypass
- **Use Cases:**
  - Club data isolation
  - Role-based access control
  - Player privacy protection
- **Documentation:** https://supabase.com/docs/guides/auth/row-level-security

---

### 2.5 File Storage

**Supabase Storage** - Object Storage
- **Why:** S3-compatible, RLS policies, image optimization, CDN
- **Use Cases:**
  - Player photos
  - Club logos
  - Match photos
  - Gallery images
  - CSV imports
- **Features:**
  - Public and private buckets
  - Signed URLs for private files
  - Image transformations
  - Automatic CDN caching
- **Documentation:** https://supabase.com/docs/guides/storage

---

### 2.6 Real-time

**Supabase Realtime** - WebSocket Subscriptions
- **Why:** Live updates, no polling, built-in to Supabase
- **Use Cases:**
  - Live notifications
  - Real-time match score updates
  - Attendance tracking updates
  - Multi-user collaboration
- **Documentation:** https://supabase.com/docs/guides/realtime

---

## 3. External Services

### 3.1 Email Service

**Resend** - Transactional Email API
- **Why:** Developer-friendly, affordable, React Email support
- **Tier:** Start with free tier (3,000 emails/month)
- **Use Cases:**
  - Welcome emails
  - Password resets
  - Payment reminders
  - Match notifications
  - Announcements
- **Documentation:** https://resend.com/docs

---

### 3.2 Payment Processing (Future)

**Casys** - Macedonian Payment Provider
- **Why:** Local provider, supports Macedonian denars (MKD)
- **Status:** Future implementation (v2)
- **Use Cases:**
  - Monthly subscription payments
  - Online payment processing
  - Payment receipts

---

## 4. Hosting & Deployment

### 4.1 Frontend Hosting

**Netlify** - Jamstack Platform
- **Why:** Excellent Next.js support, automatic deployments, generous free tier
- **Features:**
  - CDN edge deployment
  - Automatic HTTPS
  - Deploy previews
  - Environment variables
  - Built-in CI/CD
  - Analytics
- **Tier:** Start with free, upgrade as needed
- **Documentation:** https://docs.netlify.com/

---

### 4.2 Backend Hosting

**Supabase Cloud** - Managed Supabase Platform
- **Why:** Fully managed, automatic backups, global CDN
- **Features:**
  - Managed PostgreSQL
  - Automatic backups
  - Connection pooling
  - Global edge network
  - Realtime subscriptions
- **Tier:** Start with free, upgrade to Pro as needed
- **Documentation:** https://supabase.com/docs/guides/platform

---

## 5. Development Tools

### 5.1 Package Management

**pnpm** - Fast, Efficient Package Manager
- **Why:** Faster than npm/yarn, disk space efficient, strict dependencies
- **Version:** 8.0+
- **Documentation:** https://pnpm.io/

---

### 5.2 Code Quality

**ESLint** - JavaScript/TypeScript Linter
- **Why:** Catch errors early, enforce code style, best practices
- **Config:** Next.js recommended + custom rules
- **Documentation:** https://eslint.org/

**Prettier** - Code Formatter
- **Why:** Consistent formatting, no debates, saves time
- **Integration:** ESLint integration
- **Documentation:** https://prettier.io/

**TypeScript Compiler** - Type Checker
- **Config:** Strict mode enabled
- **Integration:** Next.js built-in

---

### 5.3 Version Control

**Git** - Version Control System
- **Why:** Industry standard, distributed, powerful

**GitHub** - Git Hosting
- **Why:** Integration with Netlify, collaboration features, actions
- **Features:**
  - Code review (pull requests)
  - Issue tracking
  - Project boards
  - GitHub Actions (future CI/CD)
- **Documentation:** https://docs.github.com/

---

### 5.4 Database Management

**Supabase CLI** - Database Migration Tool
- **Why:** Local development, migrations, type generation
- **Version:** Latest
- **Use Cases:**
  - Run Supabase locally (Docker)
  - Create migrations
  - Generate TypeScript types from schema
  - Deploy migrations to cloud
- **Documentation:** https://supabase.com/docs/guides/cli

**Supabase Studio** - Database GUI
- **Why:** Visual database management, query builder, RLS policy editor
- **Access:** Web-based (included with Supabase)

---

## 6. Testing Tools

### 6.1 Unit & Integration Testing

**Vitest** - Unit Test Framework
- **Why:** Faster than Jest, Vite-compatible, great DX
- **Version:** 1.0+
- **Documentation:** https://vitest.dev/

**React Testing Library** - Component Testing
- **Why:** Test user behavior, not implementation, accessible by default
- **Version:** 14.0+
- **Documentation:** https://testing-library.com/react

---

### 6.2 End-to-End Testing

**Playwright** - E2E Testing Framework
- **Why:** Fast, reliable, cross-browser, great debugging
- **Version:** 1.40+
- **Use Cases:**
  - User flows (login, create player, mark attendance)
  - Multi-role testing
  - Critical path testing
- **Documentation:** https://playwright.dev/

---

## 7. Monitoring & Analytics

### 7.1 Analytics

**Netlify Analytics** - Traffic Analytics
- **Why:** Built-in, privacy-focused, no JavaScript required
- **Tier:** Starter ($9/month)

---

### 7.2 Error Tracking (Future)

**Sentry** - Error Monitoring
- **Why:** Industry standard, source maps, performance monitoring
- **Status:** Future implementation
- **Documentation:** https://docs.sentry.io/

---

## 8. Additional Libraries

### 8.1 Utility Libraries

**clsx** - Conditional Class Names
- **Why:** Clean conditional CSS classes
- **Documentation:** https://github.com/lukeed/clsx

**tailwind-merge** - Merge Tailwind Classes
- **Why:** Avoid style conflicts with Tailwind
- **Documentation:** https://github.com/dcastil/tailwind-merge

---

## 9. Development Environment

### 9.1 Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18+ LTS | JavaScript runtime |
| pnpm | 8.0+ | Package manager |
| Git | 2.0+ | Version control |
| Docker | 20.0+ (optional) | Local Supabase |
| VS Code | Latest (recommended) | Code editor |

---

### 9.2 Recommended VS Code Extensions

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **Prisma** (if using Prisma later)
- **GitHub Copilot** (optional)
- **Error Lens** - Inline errors
- **Auto Rename Tag** - HTML tag renaming

---

## 10. Learning Resources

### 10.1 Official Documentation

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- TypeScript: https://www.typescriptlang.org/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- TanStack Query: https://tanstack.com/query/latest/docs/react/overview

### 10.2 Video Tutorials

- **Next.js 14:**
  - Next.js Official YouTube Channel
  - Web Dev Simplified (Next.js tutorials)

- **Supabase:**
  - Supabase Official YouTube Channel
  - Jon Meyers (Supabase + Next.js)

- **Tailwind CSS:**
  - Tailwind Labs YouTube Channel

### 10.3 Community

- Next.js Discord: https://discord.gg/nextjs
- Supabase Discord: https://discord.supabase.com/
- Stack Overflow

---

## 11. Cost Breakdown (Estimated)

### 11.1 Development Phase (Free)

| Service | Tier | Cost |
|---------|------|------|
| Netlify | Free | $0 |
| Supabase | Free | $0 |
| Resend | Free (3K emails) | $0 |
| GitHub | Free | $0 |
| **Total** | | **$0/month** |

### 11.2 Production (Small Scale: 5-10 clubs)

| Service | Tier | Cost |
|---------|------|------|
| Netlify | Free | $0 |
| Supabase | Free | $0 |
| Resend | Free | $0 |
| Domain (clubify.mk) | Annual | ~$15/year |
| **Total** | | **~$1.25/month** |

### 11.3 Production (Medium Scale: 20-50 clubs)

| Service | Tier | Cost |
|---------|------|------|
| Netlify | Pro | $19/month |
| Supabase | Pro | $25/month |
| Resend | Starter | $20/month |
| Domain | Annual | ~$15/year |
| **Total** | | **~$65/month** |

### 11.4 Production (Large Scale: 100+ clubs)

| Service | Tier | Cost |
|---------|------|------|
| Netlify | Business | $99/month |
| Supabase | Team | $599/month |
| Resend | Pro | $80/month |
| Sentry | Team | $26/month |
| Domain | Annual | ~$15/year |
| **Total** | | **~$805/month** |

---

## 12. Technology Decision Summary

### Why This Stack?

✅ **Rapid Development:** Supabase eliminates backend boilerplate
✅ **Type Safety:** TypeScript across the entire stack
✅ **Modern DX:** Next.js + Tailwind = fast, enjoyable development
✅ **Cost Efficient:** Can start completely free
✅ **Scalable:** Proven at scale (Supabase powers 1M+ projects)
✅ **Maintainable:** Clean code, good separation of concerns
✅ **Secure:** Database-level security with RLS
✅ **Real-time:** Built-in WebSocket support
✅ **SEO Friendly:** SSR for public pages

### Trade-offs Accepted

⚠️ **Vendor Lock-in:** Supabase-specific (mitigated: PostgreSQL is portable)
⚠️ **Learning Curve:** Multiple technologies to learn
⚠️ **Free Tier Limits:** Need to upgrade as you grow

---

This stack provides the best balance of:
- **Speed:** Fast to build and iterate
- **Quality:** Production-ready, secure, performant
- **Cost:** Start free, scale affordably
- **Experience:** Modern, enjoyable development experience

---
