# Technical Architecture
## Clubify.mk

### Version 1.0
**Last Updated:** 2025-10-18

---

## 1. Architecture Overview

Clubify.mk follows a modern **serverless, full-stack architecture** using Next.js for the frontend and Supabase for the backend infrastructure.

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Web Browser                            │   │
│  │  (Desktop / Mobile - Responsive)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js Application (Netlify)                │   │
│  │  - Server-Side Rendering (SSR)                            │   │
│  │  - Static Site Generation (SSG) for public pages          │   │
│  │  - API Routes for custom logic                            │   │
│  │  - React Components (shadcn/ui + Tailwind)                │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API / WebSocket
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     BACKEND LAYER (Supabase)                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Supabase Services                     │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │    │
│  │  │ PostgREST  │  │    Auth    │  │  Storage   │        │    │
│  │  │  Auto API  │  │  (JWT)     │  │  (Files)   │        │    │
│  │  └────────────┘  └────────────┘  └────────────┘        │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │    │
│  │  │  Realtime  │  │   Edge     │  │    RLS     │        │    │
│  │  │ (WebSocket)│  │ Functions  │  │  Policies  │        │    │
│  │  └────────────┘  └────────────┘  └────────────┘        │    │
│  └─────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      DATABASE LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database (Supabase)               │   │
│  │  - Multi-tenant data (isolated by club)                   │   │
│  │  - Row Level Security (RLS)                               │   │
│  │  - Triggers & Functions                                   │   │
│  │  - Automated backups                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │   Resend   │  │   Casys    │  │  Netlify   │                │
│  │  (Email)   │  │ (Payments) │  │   (CDN)    │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Next.js 14+ (App Router) | React framework with SSR/SSG capabilities |
| **Language** | TypeScript | Type-safe development |
| **UI Library** | React 18+ | Component-based UI |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Component Library** | shadcn/ui | Pre-built accessible components |
| **State Management** | TanStack Query + Zustand | Server state (React Query) + Client state |
| **Form Handling** | React Hook Form + Zod | Form validation and management |
| **Internationalization** | next-intl | Multi-language support (EN, MK, SQ) |
| **Date/Time** | date-fns | Date manipulation and formatting |
| **Icons** | Lucide React | Icon library |

### 2.2 Backend Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend Platform** | Supabase | Backend-as-a-Service (BaaS) |
| **Database** | PostgreSQL 15+ | Relational database |
| **API** | PostgREST (auto-generated) | REST API from database schema |
| **Custom API** | Next.js API Routes | Custom business logic endpoints |
| **Authentication** | Supabase Auth | User authentication & authorization |
| **Authorization** | Row Level Security (RLS) | Database-level access control |
| **File Storage** | Supabase Storage | Image and document storage |
| **Real-time** | Supabase Realtime | WebSocket subscriptions |
| **Functions** | Supabase Edge Functions | Serverless functions (Deno runtime) |

### 2.3 Infrastructure & DevOps

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Hosting** | Netlify | Frontend deployment and CDN |
| **Database Hosting** | Supabase Cloud | Managed PostgreSQL |
| **CI/CD** | Netlify (Git integration) | Automated deployments |
| **Version Control** | GitHub | Source code management |
| **Package Manager** | pnpm | Fast, efficient dependency management |
| **Code Quality** | ESLint + Prettier | Code linting and formatting |
| **Type Generation** | Supabase CLI | Database types for TypeScript |

### 2.4 External Services

| Service | Technology | Purpose |
|---------|-----------|---------|
| **Email** | Resend | Transactional emails |
| **Payments** | Casys (future) | Payment processing |
| **Analytics** | Netlify Analytics | Basic traffic analytics |
| **Error Tracking** | Sentry (future) | Error monitoring |

### 2.5 Testing Stack

| Type | Technology | Purpose |
|------|-----------|---------|
| **Unit/Integration** | Vitest | Fast unit and integration testing |
| **Component Testing** | React Testing Library | Component behavior testing |
| **E2E Testing** | Playwright | End-to-end user flow testing |
| **Type Checking** | TypeScript | Compile-time type safety |

---

## 3. Application Architecture

### 3.1 Next.js Application Structure

```
clubify.mk/
├── app/                        # Next.js 14 App Router
│   ├── [locale]/              # Internationalization routing
│   │   ├── (auth)/            # Auth-required routes
│   │   │   ├── dashboard/     # Role-based dashboards
│   │   │   ├── teams/         # Team management
│   │   │   ├── players/       # Player management
│   │   │   ├── matches/       # Match management
│   │   │   ├── training/      # Training sessions
│   │   │   └── payments/      # Payment tracking
│   │   ├── (public)/          # Public routes
│   │   │   ├── [club]/        # Club public homepage
│   │   │   └── login/         # Login page
│   │   └── layout.tsx         # Root layout with providers
│   └── api/                   # API routes
│       ├── auth/              # Auth endpoints
│       ├── webhooks/          # External webhooks
│       └── cron/              # Scheduled jobs
├── components/                # React components
│   ├── ui/                    # shadcn/ui components
│   ├── shared/                # Shared components
│   ├── dashboard/             # Dashboard components
│   ├── forms/                 # Form components
│   └── layouts/               # Layout components
├── lib/                       # Utility functions
│   ├── supabase/              # Supabase clients
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client
│   │   └── admin.ts           # Admin client
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Helper functions
│   └── validations/           # Zod schemas
├── types/                     # TypeScript types
│   ├── database.types.ts      # Auto-generated from Supabase
│   └── custom.types.ts        # Custom type definitions
├── messages/                  # i18n translation files
│   ├── en.json                # English
│   ├── mk.json                # Macedonian
│   └── sq.json                # Albanian
├── public/                    # Static assets
├── supabase/                  # Supabase configuration
│   ├── migrations/            # Database migrations
│   ├── functions/             # Edge functions
│   └── seed.sql               # Database seed data
└── tests/                     # Test files
    ├── unit/                  # Unit tests
    ├── integration/           # Integration tests
    └── e2e/                   # E2E tests
```

### 3.2 Data Flow Architecture

#### 3.2.1 Read Operations (Query)

```
User Action (UI)
    ↓
React Component
    ↓
TanStack Query Hook
    ↓
Supabase Client (Browser)
    ↓
PostgREST API
    ↓
Row Level Security Check
    ↓
PostgreSQL Database
    ↓
Return Data
    ↓
TanStack Query Cache
    ↓
React Component Re-render
```

#### 3.2.2 Write Operations (Mutation)

```
User Action (Form Submit)
    ↓
React Hook Form Validation (Zod)
    ↓
TanStack Query Mutation
    ↓
Supabase Client
    ↓
PostgREST API / Next.js API Route
    ↓
Row Level Security Check
    ↓
PostgreSQL Database (Insert/Update)
    ↓
Database Trigger (if any)
    ↓
Success Response
    ↓
Invalidate TanStack Query Cache
    ↓
UI Update (Optimistic or Refetch)
```

#### 3.2.3 Real-time Updates

```
Database Change (Insert/Update/Delete)
    ↓
PostgreSQL Trigger
    ↓
Supabase Realtime (WebSocket)
    ↓
Client Subscription Listener
    ↓
TanStack Query Cache Update
    ↓
React Component Re-render
```

---

## 4. Authentication & Authorization Architecture

### 4.1 Authentication Flow

```
User Login
    ↓
Supabase Auth (Email/Password)
    ↓
Generate JWT Token
    ↓
Store in httpOnly Cookie (Supabase handles)
    ↓
Return User Session
    ↓
Fetch User Roles (from database)
    ↓
Store in Client State (Zustand)
    ↓
Redirect to Dashboard (role-based)
```

### 4.2 Authorization Layers

#### Layer 1: Client-Side (UI Protection)
- Route protection with middleware
- Component-level role checks
- Conditional rendering based on permissions

#### Layer 2: API-Level (Server Protection)
- Next.js API route authentication
- Supabase server client with user context
- Role validation before processing

#### Layer 3: Database-Level (RLS Policies)
- Row Level Security policies on all tables
- User role and club context enforced
- Multi-tenant data isolation

### 4.3 Row Level Security (RLS) Strategy

**Example RLS Policies:**

```sql
-- Players table: Club admin can see all players in their club
CREATE POLICY "club_admin_players_select" ON players
  FOR SELECT
  USING (
    club_id IN (
      SELECT club_id FROM club_admins
      WHERE user_id = auth.uid()
    )
  );

-- Players table: Parent can only see their children
CREATE POLICY "parent_players_select" ON players
  FOR SELECT
  USING (
    id IN (
      SELECT player_id FROM player_parents
      WHERE parent_user_id = auth.uid()
    )
  );

-- Training sessions: Coach can only modify their team's sessions
CREATE POLICY "coach_training_update" ON training_sessions
  FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_coaches
      WHERE coach_user_id = auth.uid()
    )
  );
```

---

## 5. Multi-Tenancy Architecture

### 5.1 Tenant Isolation Strategy

**Approach:** Shared database with club-level isolation using RLS

```
clubs table (id, name, ...)
    ↓
teams table (club_id, ...)
    ↓
players table (club_id, ...)
    ↓
All data filtered by club_id in RLS policies
```

**Benefits:**
- Single database = simpler maintenance
- Cost-effective
- Cross-club queries possible (for super admin)
- Data isolation enforced at database level

**Trade-offs:**
- Requires careful RLS policy design
- All queries must include club context
- Slightly more complex than separate databases

### 5.2 Club Subdomain Routing

**URL Structure:**
- Super Admin: `admin.clubify.mk`
- Club Public Page: `[club-slug].clubify.mk` (e.g., `vardar.clubify.mk`)
- Club Admin Portal: `[club-slug].clubify.mk/admin`

**Implementation:**
- Next.js middleware extracts subdomain
- Lookup club by subdomain/slug
- Inject club context into requests
- RLS policies automatically filter by club

---

## 6. Performance Optimization

### 6.1 Caching Strategy

**Client-Side Caching (TanStack Query):**
- Default stale time: 5 minutes
- Background refetching enabled
- Optimistic updates for mutations
- Prefetching for predictable navigation

**CDN Caching (Netlify):**
- Static assets cached at edge
- SSG pages cached (public club pages)
- API routes not cached (dynamic data)

**Database Query Optimization:**
- Indexes on foreign keys
- Composite indexes for common queries
- Materialized views for complex aggregations (future)

### 6.2 Bundle Optimization

- Code splitting per route (Next.js automatic)
- Dynamic imports for heavy components
- Image optimization with Next.js Image
- Tree-shaking with ES modules
- Tailwind CSS purging

### 6.3 Database Connection Pooling

- Supabase connection pooler (PgBouncer)
- Transaction mode for high concurrency
- Session mode for complex transactions

---

## 7. Security Architecture

### 7.1 Security Layers

| Layer | Implementation | Purpose |
|-------|---------------|---------|
| **Network** | HTTPS only, Netlify SSL | Encrypted data in transit |
| **Authentication** | Supabase Auth (JWT) | Verify user identity |
| **Authorization** | RLS + API checks | Enforce permissions |
| **Data** | PostgreSQL encryption at rest | Protect stored data |
| **Input Validation** | Zod schemas | Prevent injection attacks |
| **CORS** | Supabase CORS policies | Control API access |
| **Rate Limiting** | Supabase built-in | Prevent abuse |
| **CSRF Protection** | Next.js built-in | Prevent cross-site attacks |

### 7.2 Sensitive Data Handling

**Medical Information:**
- Encrypted column (pgcrypto)
- Access logged (audit trail)
- Only accessible by authorized roles

**Passwords:**
- Supabase Auth (bcrypt hashing)
- Never stored in plain text
- Password reset via secure tokens

**File Storage:**
- Supabase Storage RLS policies
- Signed URLs for private files
- Public bucket for club logos/public images

---

## 8. Scalability Considerations

### 8.1 Current Capacity (Free/Starter Tiers)

| Resource | Limit | Estimated Capacity |
|----------|-------|-------------------|
| Database | 500 MB | ~5-10 clubs |
| Storage | 1 GB | ~1000 images |
| Bandwidth | 2 GB/month | ~1000 active users |
| Edge Functions | 500K invocations/month | Light usage |

### 8.2 Growth Path

**Phase 1: 0-10 clubs (Free tier)**
- Supabase Free + Netlify Free
- Cost: $0/month

**Phase 2: 10-50 clubs (Paid tier)**
- Supabase Pro ($25/month)
- Netlify Pro ($19/month)
- Resend ($20/month)
- Cost: ~$65/month

**Phase 3: 50-200 clubs (Scale)**
- Supabase Team ($599/month) or custom
- Netlify Business ($99/month)
- Resend ($80/month for 200K emails)
- Cost: ~$780/month

**Phase 4: 200+ clubs (Enterprise)**
- Dedicated Supabase instance
- Custom pricing

### 8.3 Horizontal Scaling Strategy

- Database read replicas (Supabase Pro+)
- CDN edge caching (Netlify global)
- Supabase connection pooling
- Database partitioning by club (future)

---

## 9. Deployment Architecture

### 9.1 Deployment Pipeline

```
Developer Push to GitHub
    ↓
Netlify Webhook Triggered
    ↓
Build Process (pnpm install, pnpm build)
    ↓
Run Tests (optional: pnpm test)
    ↓
TypeScript Type Check
    ↓
ESLint Check
    ↓
Build Next.js Application
    ↓
Deploy to Netlify Edge
    ↓
Notify on Slack/Email (optional)
```

### 9.2 Environment Strategy

**Environments:**

1. **Development** (Local)
   - Local Next.js server
   - Supabase local instance (Docker) OR dev project
   - `.env.local` configuration

2. **Staging** (Netlify Deploy Preview)
   - Automatic for pull requests
   - Supabase staging project
   - Test with real data scenarios

3. **Production** (Netlify Production)
   - Main branch deployments
   - Supabase production project
   - Environment variables in Netlify

### 9.3 Database Migration Strategy

**Migration Flow:**
```
Developer writes migration (SQL)
    ↓
Test locally (Supabase CLI)
    ↓
Commit to Git (supabase/migrations/)
    ↓
Deploy to staging (supabase db push --env staging)
    ↓
Test on staging
    ↓
Deploy to production (supabase db push --env production)
    ↓
Generate new TypeScript types
```

**Migration Best Practices:**
- Never destructive migrations in production
- Always reversible (down migrations)
- Test with production-like data
- Backup before major migrations

---

## 10. Monitoring & Observability

### 10.1 Monitoring Stack (Future)

| Component | Tool | Metrics |
|-----------|------|---------|
| **Application Performance** | Sentry | Error rates, response times |
| **Database Performance** | Supabase Dashboard | Query performance, connection pool |
| **User Analytics** | Netlify Analytics | Page views, traffic |
| **Real-time Monitoring** | Supabase Realtime Dashboard | WebSocket connections |
| **Logs** | Netlify Functions Logs | API route logs |

### 10.2 Key Metrics to Track

**Performance:**
- Page load time (target: <2s)
- API response time (target: <500ms)
- Database query time (target: <100ms)

**Business:**
- Active clubs
- Active users (players, parents, coaches)
- Training sessions tracked
- Matches recorded
- Payment tracking adoption

**Reliability:**
- Uptime (target: 99.5%)
- Error rate (target: <0.1%)
- Failed requests

---

## 11. Disaster Recovery & Backup

### 11.1 Backup Strategy

**Database Backups (Supabase):**
- Automated daily backups (retained 7 days on Pro)
- Point-in-time recovery (Pro tier)
- Manual backups before major changes

**File Storage Backups:**
- Supabase Storage redundancy (built-in)
- Critical files mirrored to secondary storage (future)

**Code Backups:**
- Git repository (GitHub)
- Tagged releases for rollback

### 11.2 Disaster Recovery Plan

**Scenario 1: Database Corruption**
- Restore from latest Supabase backup
- Replay recent transactions (if possible)
- Estimated RTO: 1 hour

**Scenario 2: Supabase Outage**
- Status page monitoring
- Communicate with users
- No immediate mitigation (managed service)
- Consider multi-region setup (future)

**Scenario 3: Deployment Failure**
- Rollback to previous Netlify deployment (instant)
- Revert Git commit
- Redeploy

---

## 12. Future Architecture Enhancements

### 12.1 Short-term (3-6 months)
- [ ] Sentry error tracking integration
- [ ] Advanced analytics (PostHog/Mixpanel)
- [ ] Database query optimization (indexes, views)
- [ ] Mobile-responsive optimizations

### 12.2 Medium-term (6-12 months)
- [ ] Mobile native apps (React Native)
- [ ] Push notifications (FCM)
- [ ] Advanced caching (Redis)
- [ ] CDN for user-uploaded images (Cloudflare R2)

### 12.3 Long-term (12+ months)
- [ ] GraphQL API layer (for mobile apps)
- [ ] Microservices for payment processing
- [ ] Multi-region deployment
- [ ] Data warehouse for analytics (BigQuery)
- [ ] Machine learning for player performance insights

---

## Conclusion

This architecture provides a solid foundation for Clubify.mk with:
- **Scalability:** Can grow from 1 to 100+ clubs
- **Performance:** Fast page loads and real-time updates
- **Security:** Multi-layered protection
- **Maintainability:** Clean separation of concerns
- **Cost-efficiency:** Start free, scale as you grow

The Supabase + Next.js combination offers rapid development while maintaining flexibility for future enhancements.

---
