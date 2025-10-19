# Technical Requirements Q&A Session

This document captures the technical decisions and requirements for the Clubify.mk application.

---

## 1. Frontend Technology

### Q1.1: What frontend framework/library do you want to use?
**Answer:** Next.js (React framework)

### Q1.2: Do you prefer TypeScript or JavaScript?
**Answer:** TypeScript

### Q1.3: What CSS framework or styling approach do you want to use?
**Answer:** Tailwind CSS + shadcn/ui

### Q1.4: What state management solution do you prefer (if applicable)?
**Answer:** TanStack Query (React Query) for server state + Zustand for client state

---

## 2. Backend Technology

### Q2.1: What backend framework/language do you want to use?
**Answer:** Supabase (PostgreSQL backend) with Next.js API routes for custom business logic

### Q2.2: Do you want a REST API, GraphQL, or both?
**Answer:** Supabase auto-generated REST API (PostgREST) + Next.js API routes for custom endpoints

### Q2.3: What ORM/database access layer do you prefer (if any)?
**Answer:** Supabase client SDK (with TypeScript types auto-generated from database schema)

---

## 3. Database

### Q3.1: What database do you want to use (PostgreSQL, MySQL, MongoDB, etc.)?
**Answer:** PostgreSQL (via Supabase)

### Q3.2: Do you need a caching layer (Redis, Memcached)?
**Answer:** Not initially. Supabase has built-in connection pooling and TanStack Query provides client-side caching. Can add Redis later if needed.

---

## 4. Authentication & Authorization

### Q4.1: Do you want to build custom authentication or use a service (Auth0, Firebase Auth, Supabase Auth, etc.)?
**Answer:** Supabase Auth

### Q4.2: What authentication method (JWT, sessions, or other)?
**Answer:** JWT (Supabase Auth default) with Row Level Security (RLS) policies for authorization

---

## 5. File Storage

### Q5.1: Where should files (photos, documents) be stored (local storage, AWS S3, Cloudinary, etc.)?
**Answer:** Supabase Storage

---

## 6. Hosting & Deployment

### Q6.1: Where do you want to host the application (AWS, Vercel, Netlify, DigitalOcean, Heroku, etc.)?
**Answer:** Netlify (for Next.js frontend), Supabase (for backend/database - already hosted)

### Q6.2: Do you want to use containers (Docker) for deployment?
**Answer:** Not needed. Netlify handles Next.js deployment natively, Supabase is fully managed.

### Q6.3: What CI/CD approach do you prefer (GitHub Actions, GitLab CI, etc.)?
**Answer:** Netlify's built-in CI/CD (automatic deployments from Git)

---

## 7. Email & Notifications

### Q7.1: What email service do you want to use (SendGrid, AWS SES, Mailgun, Resend, etc.)?
**Answer:** Resend (start with free tier 3,000 emails/month, can migrate to AWS SES later for cost optimization)

### Q7.2: How should in-app notifications be delivered (WebSockets, polling, Server-Sent Events)?
**Answer:** Supabase Realtime (WebSocket subscriptions for live notifications)

---

## 8. Payments (Future)

### Q8.1: What payment provider do you envision for future payment processing (Stripe, PayPal, local Macedonian provider)?
**Answer:** Casys (local Macedonian payment provider)

---

## 9. Development Environment & Tools

### Q9.1: What package manager (npm, yarn, pnpm, bun)?
**Answer:** pnpm

### Q9.2: Do you want a monorepo or separate repositories for frontend/backend?
**Answer:** Single repository (Next.js project with Supabase integration)

### Q9.3: What testing frameworks do you prefer (Jest, Vitest, Playwright, Cypress, etc.)?
**Answer:** Vitest (unit/integration tests) + React Testing Library (component tests) + Playwright (E2E tests). Set up infrastructure now, write tests as features are developed.

---

## 10. Additional Considerations

### Q10.1: Do you need multi-language support (i18n) from the start?
**Answer:** Yes. Support for 3 languages: English, Macedonian, and Albanian. Use next-intl (recommended i18n library for Next.js).

### Q10.2: What logging/monitoring tools (if any)?
**Answer:** Start simple with console logs + Netlify analytics. Add Sentry for error tracking later when needed.

### Q10.3: Do you have any existing infrastructure or preferences we should consider?
**Answer:**
- Domain: To be purchased soon (clubify.mk suggested)
- Git hosting: GitHub
- Coding standards: Clean, maintainable code with TypeScript strict mode, ESLint + Prettier for code formatting
- Server infrastructure: Netlify (frontend) + Supabase (backend/database/storage)

---
