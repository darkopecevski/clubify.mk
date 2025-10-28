# Clubify.mk - Development TODO List

**Last Updated:** 2025-10-23 (Phase 4.4 CSV Import - FULLY TESTED & PRODUCTION READY! 🎉)

## Development Principles

- ✅ Break work into small, testable pieces
- ✅ Test each chapter thoroughly before moving to the next
- ✅ Plan before coding - get approval for each chapter
- ✅ Write tests for each feature (balanced, not overkill)
- ✅ Commit working code frequently
- ✅ Deploy to staging after each major chapter

---

## Legend

- ⏳ **In Progress**
- ✅ **Completed**
- 🔴 **Blocked**
- 📝 **Planned**
- 🧪 **Needs Testing**

---

## Phase 0: Project Foundation & Setup

### 0.1 Project Infrastructure ✅
- [x] Create GitHub repository
- [x] Connect to Netlify
- [x] Link Supabase project
- [x] Set up environment variables
- [x] Create comprehensive documentation
- [x] Set up TODO.md tracking

### 0.2 Next.js Application Bootstrap ✅
- [x] Initialize Next.js 15 with App Router
- [x] Install and configure TypeScript (strict mode)
- [x] Set up pnpm
- [x] Configure ESLint + Prettier
- [x] Set up Tailwind CSS v4 with green theme
- [x] Initialize shadcn/ui component library
- [x] Create project folder structure
- [x] Set up testing infrastructure (Vitest + Playwright)
- [x] Configure Inter font with next/font
- [x] Set up dark mode with next-themes
- [x] Create homepage with theme toggle
- [x] Test: Build successful, deployed to Netlify

**Deliverable:** ✅ Working Next.js app deployed at https://clubifymk.netlify.app

---

## Phase 1: Database Foundation

### 1.1 Database Schema - Core Tables ✅
- [x] Create users table (extends Supabase Auth)
- [x] Create user_roles table with multi-tenancy support
- [x] Create clubs table
- [x] Create teams table
- [x] Add RLS policies with helper functions (is_super_admin, user_club_ids)
- [x] Create Supabase client utilities (server, browser, middleware)
- [x] Generate TypeScript types from schema
- [x] Create seed data (3 clubs, 4 teams)
- [x] Test: Verified tables, relationships, and RLS policies work
- [x] Create /clubs demo page

**Deliverable:** ✅ Core database tables with RLS, typed clients, and working demo

### 1.2 Database Schema - Player Management ✅
- [x] Create players table with personal, medical, and football info
- [x] Create player_parents table (many-to-many)
- [x] Create team_players table (many-to-many with join/leave dates)
- [x] Create coaches table with licensing and experience
- [x] Create team_coaches table (many-to-many with roles)
- [x] Add RLS policies (simplified to avoid recursion)
- [x] Update TypeScript types
- [x] Insert 8 sample players (5 U10, 3 U12)
- [x] Assign players to teams
- [x] Test: Verify relationships and API queries work

**Deliverable:** ✅ Player and coach tables with RLS, types, and test data

### 1.3 Database Schema - Training & Matches ✅
- [x] Create training_sessions table
- [x] Create training_recurrences table
- [x] Create attendance table
- [x] Create matches table
- [x] Create match_squads table
- [x] Create match_statistics table
- [x] Add RLS policies for all training and match tables
- [x] Apply migration via Supabase CLI
- [x] Update TypeScript types
- [x] Create seed data (4 recurrences, 3 sessions, 3 matches, full squads and stats)
- [x] Test: Verified all tables, relationships, and RLS policies work

**Deliverable:** ✅ Training and match tables with comprehensive seed data

### 1.4 Database Schema - Payments & Content ✅
- [x] Create subscription_fees table
- [x] Create discounts table
- [x] Create payment_records table
- [x] Create announcements table
- [x] Create media_gallery table
- [x] Create notifications table
- [x] Create notification_preferences table
- [x] Add RLS policies for all tables
- [x] Apply migration via Supabase CLI
- [x] Update TypeScript types
- [x] Create seed data (fees, payments, announcements, media, notifications)
- [x] Test: Verified all tables and RLS policies work

**Deliverable:** ✅ Complete database schema with payments and communication tables

### 1.5 Row Level Security (RLS) Policies ✅
- [x] Enable RLS on all tables
- [x] Create super_admin policies (full access)
- [x] Create club_admin policies (club-scoped)
- [x] Create coach policies (team-scoped)
- [x] Create parent policies (own children only)
- [x] Create player policies (own data only)
- [x] Test: Verified policies with public/authenticated access
- [x] Implemented helper functions (is_super_admin, user_club_ids)

**Deliverable:** ✅ Secure database with working RLS policies (completed in Phases 1.1-1.4)

**Note:** RLS policies were implemented progressively in each phase rather than as a separate phase.

### 1.6 Database Triggers & Functions ✅
- [x] Create update_updated_at() trigger function
- [x] Apply to all tables with updated_at column
- [ ] Create calculate_match_result() trigger (future enhancement)
- [ ] Create update_payment_status() trigger (future enhancement)
- [ ] Create function to generate monthly payment records (future - will use Edge Functions)
- [x] Test: Verified triggers work correctly

**Deliverable:** ✅ Basic database automation with updated_at triggers

**Note:** Advanced triggers will be implemented as needed in later phases. Monthly payment generation will use Supabase Edge Functions instead of database triggers.

---

## Phase 2: Authentication & Authorization

### 2.1 Supabase Auth Setup ✅
- [x] Create Supabase client utilities (browser, server, admin, middleware)
- [x] Create middleware for automatic session refresh
- [x] Create auth callback route (/auth/callback)
- [x] Create auth error page (/auth/error)
- [x] Add URL helper utilities
- [x] Set up environment variables (NEXT_PUBLIC_SITE_URL)
- [x] Document email templates for manual configuration
- [x] Document redirect URLs for manual configuration
- [ ] **Manual Step:** Configure Supabase Auth settings in dashboard (see docs/PHASE_2_1_SETUP.md)
- [ ] **Manual Step:** Set up email templates in dashboard
- [ ] **Manual Step:** Configure redirect URLs in dashboard
- [ ] Test: Manual signup/login in Supabase dashboard

**Deliverable:** ✅ Auth infrastructure ready (⏳ Manual dashboard config pending)

### 2.2 Authentication UI ✅
- [x] Create useAuth hook (signUp, signIn, signOut, resetPassword, updatePassword)
- [x] Create useUser hook (session management, auth state listening)
- [x] Create Zod validation schemas (signIn, signUp, forgotPassword, resetPassword)
- [x] Create login page (/login) with email/password
- [x] Create signup page (/signup) with full name, email, password
- [x] Create forgot password page (/forgot-password)
- [x] Create reset password page (/reset-password)
- [x] Add form validation with Zod schemas
- [x] Add loading states and error handling
- [x] Add show/hide password toggles
- [x] Add success states with redirects
- [ ] **Design & apply branded email templates** (see docs/SUPABASE_AUTH_CONFIG.md)
  - [ ] Confirm Signup template with Clubify.mk branding
  - [ ] Reset Password template with Clubify.mk branding
  - [ ] Change Email template with Clubify.mk branding
  - [ ] Magic Link template with Clubify.mk branding
- [x] Test: Complete auth flows (login, logout, reset, signup) ✅ ALL WORKING!

**Deliverable:** ✅ Authentication UI complete and fully tested! (⏳ Email template branding optional)

### 2.3 Session Management & Middleware ✅
- [x] Create auth middleware for session refresh (src/middleware.ts)
- [x] Create useUser hook for session management
- [x] Create useAuth hook for auth operations
- [x] Implement auto token refresh (via middleware)
- [x] Test: Session persistence and token refresh working
- [ ] Create auth context/provider (optional - hooks work well)
- [ ] Create ProtectedRoute wrapper component (when needed for protected pages)

**Deliverable:** ✅ Session management complete and tested!

### 2.4 Role-Based Access Control ✅
- [x] Create useUserRole hook with role fetching and helpers
- [x] Create role-checking utility functions (hasRole, hasMinimumRole, etc.)
- [x] Implement role hierarchy (parent < coach < club_admin < super_admin)
- [x] Create ProtectedRoute component for page protection
- [x] Create RequireRole, SuperAdminOnly, ClubAdminOnly, CoachOnly components
- [x] Create /unauthorized page
- [x] Document RBAC usage with examples (docs/RBAC_USAGE.md)
- [x] Build tested successfully - ready for use!

**Deliverable:** ✅ Complete RBAC system with documentation!

---

## Phase 3: Super Admin Portal ✅ COMPLETE

### 3.0 UI Redesign & Professional Layout ✅
- [x] Redesign admin layout with professional CMS-style design
- [x] Implement collapsible sidebar (desktop: icons, mobile: drawer)
- [x] Create full-width responsive header with search, notifications, settings
- [x] Add dark/light theme toggle with next-themes
- [x] Replace emoji icons with professional Lucide React icons
- [x] Add color-coded stat cards with trend indicators
- [x] Implement mobile-first responsive design
- [x] Fix Tailwind v4 dark mode with @custom-variant
- [x] Test: Theme toggle works, responsive on all devices

**Deliverable:** ✅ Professional, responsive admin UI with working theme switcher

**Key Technical Notes:**
- Tailwind v4 requires `@custom-variant dark (&:where(.dark, .dark *))` in CSS
- No `tailwind.config.js` needed for dark mode in v4
- Must define both `:root, .light` and `.dark` CSS variables
- Theme persistence with `storageKey` in ThemeProvider

### 3.1 Super Admin Dashboard ✅
- [x] Create super admin layout with sidebar navigation
- [x] Create dashboard overview page
- [x] Show stats: total clubs, users, players, teams
- [x] Show recent activity (latest clubs)
- [x] Create navigation menu (Dashboard, Clubs, Users, Settings)
- [x] Protected with ProtectedRoute (super_admin role)
- [x] Add professional stat cards with icons and trends
- [x] Test: Dashboard loads, stats accurate, responsive

**Deliverable:** ✅ Super admin dashboard complete

### 3.2 Club Management (Super Admin) ✅
- [x] Create clubs list page with table
- [x] Create "Create Club" form with Zod validation
- [x] Create "Edit Club" form with pre-filled data
- [x] Add club activation/deactivation (is_active toggle)
- [x] Delete club with confirmation modal
- [x] Auto-generate slug from club name
- [x] All fields: name, slug, city, founded_year, contact_email, contact_phone, website, address, description, logo_url, is_active
- [x] Created database migrations for missing fields (founded_year, logo_url, description, website)
- [x] Test: CRUD operations on clubs working
- [ ] Add search and filtering (future enhancement)
- [ ] Add pagination (future enhancement)

**Deliverable:** ✅ Full club CRUD management for super admin

### 3.3 User Management (Super Admin) ✅
- [x] Create users list page with roles display
- [x] Show user info: email, name, roles, clubs
- [x] Show parent-child relationships in users list
- [x] Create "Assign Role" functionality
- [x] Support multi-role assignment per user
- [x] Support club-specific roles (club_admin, coach)
- [x] Remove role from user
- [x] Created custom database function to get users with emails
- [x] Display children on user details page with clubs
- [x] Color-coded role badges (purple=super_admin, blue=club_admin, green=coach, yellow=parent, gray=player)
- [x] Test: Assign roles working, parent relationships displayed
- [ ] Filter users by role (future enhancement)

**Deliverable:** ✅ User management with role assignment complete

---

**Phase 3 Summary:** ✅ COMPLETE
- Professional responsive admin UI with theme switching
- Full club management (CRUD operations)
- User management with role assignment
- Parent-child relationship display
- Super admin club admin management (create/assign users as club admins)
- Super admin club switching (seamless admin↔club view transitions)
- Unified layouts with sign-out buttons
- All features tested and deployed

---

## Phase 4: Club Admin Portal

### 4.1 Club Admin Dashboard ✅
- [x] Create club admin layout with sidebar navigation
- [x] Create club context hook for club selection
- [x] Create dashboard overview with stats
- [x] Show club stats (teams, players, coaches, upcoming events)
- [x] Show upcoming matches (next 7 days)
- [x] Show recently added players
- [x] Create navigation menu (Dashboard, Teams, Players, Coaches, Matches, Training, Payments, Settings)
- [x] Protected with ProtectedRoute (club_admin minimum role)
- [x] Responsive design matching super admin portal
- [x] Super admin support (can view any club via club selector)
- [x] "Back to Admin" button for super admins
- [x] Club selector dropdown for admins with multiple clubs
- [x] Auto-redirect based on role (super_admin→/admin, club_admin→/club)
- [x] Unified form layouts (club create/edit matching)
- [x] Test: Dashboard shows correct club data only

**Deliverable:** ✅ Club admin dashboard complete with full super admin integration

### 4.2 Team Management ✅
- [x] Create teams list page
- [x] Create "Create Team" form (name, age group, season)
- [x] Create "Edit Team" form
- [x] Add team activation/deactivation
- [ ] Set subscription fee per team (deferred to Phase 8 - Payment Management)
- [x] Test: CRUD operations on teams, RLS enforcement

**Deliverable:** ✅ Team management for club admins complete

### 4.3 Player Management - CRUD Operations

#### 4.3.1 Create Player ✅ **FULLY TESTED & WORKING**
- [x] Create players list page with table
- [x] Create "Add Player" multi-step form
  - [x] Step 1: Personal info
  - [x] Step 2: Football info
  - [x] Step 3: Medical info
  - [x] Step 4: Emergency contact
  - [x] Step 5: Parent/guardian info
- [x] Auto-create parent user account
- [x] Handle existing parent accounts robustly
  - [x] Check if parent has role for this club, assign if missing
  - [x] Reuse existing parent accounts when email matches
  - [x] Ensure parent-player relationship is created
- [x] Create player user account with unique email
- [x] Idempotent operations (retry-safe)
- [x] Test: Create player, verify accounts created ✅
- [x] Test: Create multiple players with same parent ✅
- [x] Test: Retry after partial failure ✅

**API Fixes Applied (2025-10-22):**
- [x] Fixed case mismatch for database constraints (gender, dominant_foot, relationship)
- [x] Fixed admin client import and usage
- [x] Fixed pagination issues with listUsers() - now uses RPC function
- [x] Fixed RLS policy violations - all inserts use admin client
- [x] Fixed duplicate key errors - check before insert for retries
- [x] Made all operations idempotent and retry-safe

#### 4.3.2 View Player Profile ✅ **COMPLETE**
- [x] Create player profile view page (`/club/[clubId]/players/[playerId]`)
- [x] Display all player information (personal, football, medical, emergency)
- [x] Show parent information and relationship
- [x] Show team assignments (if any)
- [x] Show player statistics (to be populated later)
- [x] Access control: club_admins, coaches, parents (own children), players (own profile)
- [x] Test: View player as different roles

#### 4.3.3 Edit Player ✅ **COMPLETE**
- [x] Create edit player page (`/club/[clubId]/players/[playerId]/edit`)
- [x] Reuse multi-step form from creation (pre-populate with existing data)
- [x] Allow editing all player fields except generated ones (email, user_id)
- [x] Allow updating parent information
- [x] Handle parent email changes (link to different existing parent if needed)
- [x] Update player profile on save
- [x] Access control: club_admins and super_admins only
- [x] Test: Edit player, verify all fields updated
- [x] Fixed select option values to match database (lowercase)
- [x] Fixed form auto-submission issue

#### 4.3.4 Delete Player ✅ **COMPLETE**
- [x] Add delete button on player profile page (club_admins only)
- [x] Add delete confirmation modal
- [x] Create DELETE API endpoint (`/api/club/players/[playerId]`)
- [x] Soft delete vs hard delete decision:
  - [x] Option A: Soft delete (set is_active = false) ✅ IMPLEMENTED
- [x] Handle auth account cleanup (keeping accounts for audit trail)
- [x] Access control: club_admins and super_admins only
- [x] Test: Delete player, verify soft delete behavior

**Future Enhancements (Post-CRUD):**
- [ ] **Add missing fields to player creation form** - Add nationality, city, address, phone, email_prefix, previous_club, medications (to match CSV import fields)
- [ ] Add ability to link existing users as parents (without creating new account)
- [ ] Send welcome email to parent (deferred to Phase 9 - Notifications)
- [ ] Send notification email to existing parent about new child
- [ ] **Password Reset by Admins:** Club admins should be able to reset passwords for players and parents in their club. Super admins should be able to reset passwords for all users.

**Major Refactor - URL-Based Club Routing:** ✅ COMPLETE
- [x] Refactor from context-based to URL-based club selection
  - **Problem Solved:** Eliminated infinite loops, localStorage hacks, complex state management
  - **Solution:** Now using `/club/[clubId]/*` pattern
  - **Benefits:** Bookmarkable URLs, simpler code, no context needed, better UX
- [x] Phase 1: Create new route structure
  - [x] Create `/club/[clubId]` directory
  - [x] Move all club routes to new structure (dashboard, teams, players, etc.)
  - [x] Update layout to read clubId from params, validate access
- [x] Phase 2: Update pages
  - [x] Update all pages to use clubId from params instead of context
  - [x] Remove useClubContext() calls
  - [x] Update all navigation links to include clubId
- [x] Phase 3: Update admin integration
  - [x] Make club table rows clickable → navigate to `/club/[clubId]`
  - [x] Update admin layout "Switch to Club View" → navigate to `/club/[clubId]`
  - [x] Keep "Edit" button for editing club details
- [x] Phase 4: Update auth redirects
  - [x] Update getRoleDashboardUrl to redirect club_admins to `/club/[first-club-id]`
  - [x] Update super admin redirects
  - [x] Remove localStorage usage
- [x] Phase 5: Cleanup
  - [x] Delete ClubProvider and useClubContext hook
  - [x] Delete old `/club/*` routes
  - [x] Update all internal links
  - [x] Test all navigation flows thoroughly

**Fixes Applied:**
- [x] Fixed isSuperAdmin function vs boolean confusion
- [x] Fixed race condition in access validation (wait for rolesLoading)
- [x] Fixed infinite loop by removing function dependencies from useEffect
- [x] Fixed server component error in admin clubs page (split into server + client components)

**Deliverable (Phase 4.3):** ✅ **COMPLETE - Full Player CRUD Operations!**
- ✅ 4.3.1 - Player Creation (COMPLETE & production-ready)
- ✅ 4.3.2 - Player Profile View (COMPLETE)
- ✅ 4.3.3 - Player Edit (COMPLETE)
- ✅ 4.3.4 - Player Delete (Soft Delete COMPLETE)

### 4.4 Player Management - CSV Import ✅ **FULLY TESTED & PRODUCTION READY!**
- [x] Create CSV template download (all 26 fields)
- [x] Create CSV upload component with drag & drop
- [x] Validate CSV format and data (Zod schemas)
- [x] Show preview before import (first 10 rows with validation status)
- [x] Bulk create players with parents and team assignments
- [x] Handle errors gracefully (per-row error tracking)
- [x] Show import summary (success/failed counts)
- [x] Download error log for invalid rows
- [x] Access control (super_admin + club_admin)
- [x] **Made import operations idempotent** (retry-safe)
  - [x] Check if player exists before creating
  - [x] Check if auth user exists before creating
  - [x] Check if parent role exists before assigning
  - [x] Check if player role exists before assigning
  - [x] Check if parent-player link exists before creating
  - [x] Check if team assignment exists before creating
- [x] **Fixed database schema mismatches**
  - [x] Added missing columns (nationality, city, address, phone, email, user_id, previous_club, medications)
  - [x] Updated blood type format to match database constraint (A+, A-, B+, B-, AB+, AB-, O+, O-)
  - [x] Regenerated TypeScript types from database
- [x] Test: Successfully imported 10 players with all relationships! ✅

**Deliverable:** ✅ CSV bulk player import FULLY TESTED & PRODUCTION READY!

**Implementation Details:**
- **CSV Template:** 26 fields covering all player data (personal, football, medical, emergency, parent, team)
- **Validation:** Client-side Zod validation with detailed error messages matching database constraints
- **Parent Accounts:** Auto-creates new parents or reuses existing ones by email
- **Player Accounts:** Smart handling - reuses existing auth users, creates player records only when needed
- **Team Assignment:** Optional team assignment by team name + jersey number
- **Error Handling:** Continues processing even if some rows fail, detailed error messages per row
- **Idempotency:** All operations check for existence before insert - safe to retry failed imports
- **UI Flow:** Upload → Preview → Import → Results summary with error download
- **API:** POST `/api/club/players/import` - processes all valid rows in bulk
- **Database Migration:** `20251023140000_add_missing_player_columns.sql`

**Production Testing:**
- ✅ Imported 10 players for FK Spartak (2 teams: "2017" and "U9")
- ✅ Verified parent account creation and reuse
- ✅ Verified player account creation and reuse
- ✅ Verified role assignments
- ✅ Verified parent-player relationships
- ✅ Verified team assignments with jersey numbers
- ✅ Verified retry after partial failure works correctly

### 4.5 Player Team Assignment ✅
- [x] Create team detail/roster page (`/club/[clubId]/teams/[id]`)
- [x] Show current team roster with player details
- [x] Add "Assign to Team" functionality (from player profile)
- [x] Add "Add Players" functionality (bulk assignment from team page)
- [x] Support multi-team assignment (players can be on multiple teams)
- [x] Add jersey number column to team_players table (migration)
- [x] Remove player from team (custom modal on both pages)
- [x] Replace native confirm dialogs with custom modals
- [x] API endpoints for assign/remove operations
- [x] Access control: super_admin, club_admin (coach access pending Phase 5)
- [x] Test: Assign players to teams, remove from teams
- [ ] Add jersey number editing functionality (inline or modal-based)

**Deliverable:** ✅ Player-team assignment complete!

**Implementation Details:**
- **From Player Profile:** "Assign to Team" button opens modal with available teams
- **From Team Page:** "Add Players" button opens bulk selection modal with checkboxes
- **Remove Operations:** Custom confirmation modals matching design system (no native dialogs)
- **Database:** `jersey_number` column added with CHECK constraint (1-99)
- **API Routes:**
  - POST `/api/club/teams/[teamId]/players` - Assign player to team
  - DELETE `/api/club/team-players/[teamPlayerId]` - Remove from team
- **Access Control:** Validates user roles and club membership on both frontend and backend

### 4.6 Coach Management ✅ COMPLETE
- [x] Create coaches list page with stats
- [x] Create "Add Coach" form with credentials
- [x] Create coach user account (smart reuse existing accounts)
- [x] Set default password (ClubifyCoach2025!)
- [x] Create coach profile view page
- [x] Create edit coach form
- [x] Delete coach (soft delete)
- [x] Design consistency (matching teams/players pages exactly)
- [x] Assign coach to teams functionality
- [x] Remove coach from team functionality
- [x] Display coaches on team detail page
- [ ] Send welcome email (deferred to Phase 9 - Notifications)
- [x] Test: Full coach management workflow

**Deliverable:** ✅ Coach management FULLY COMPLETE!

---

## Phase 5: Coach Portal ⏳

### 5.1 Coach Dashboard ✅
- [x] Create coach layout with sidebar
- [x] Create dashboard overview with stats
- [x] Show assigned teams (filtered by coach role)
- [x] Show upcoming training sessions (next 7 days)
- [x] Show upcoming matches (next 7 days)
- [x] Show attendance summary (last 30 days)
- [x] Fix role-based filtering (use coach_id not user_id)
- [x] Test: Coach sees only their teams ✅

**Deliverable:** ✅ Coach dashboard complete

### 5.2 Training Session Management (List View) ✅
- [x] Create training sessions list page
- [x] Create "Schedule Training" form (one-time session)
- [x] Create "Recurring Training" form with day selector
- [x] Generate recurring session instances from pattern
- [x] Edit training session (custom modal)
- [x] Delete training session (custom modal)
- [x] Fix schema alignment (session_date, duration_minutes)
- [x] API endpoints (POST, PATCH, DELETE, recurring)
- [x] Test: Create/edit/delete sessions ✅

**Deliverable:** ✅ Training session CRUD complete

### 5.2.1 Training Session Management - Calendar View & Recurring Improvements ⏳
**Implementation Plan (Option C - Hybrid Approach):**

#### Database Changes
- [ ] Add `is_override` boolean column to `training_sessions` table
  - Default: false
  - True when session is manually edited (breaks from recurring pattern)
  - Migration: `20251028000000_add_is_override_to_training_sessions.sql`

#### Calendar View Component
- [ ] Create `/src/components/coach/TrainingCalendar.tsx` - Main wrapper
- [ ] Create `/src/components/coach/DayView.tsx` - Hour-by-hour schedule
- [ ] Create `/src/components/coach/WeekView.tsx` - 7-column grid (Google Calendar style)
- [ ] Create `/src/components/coach/MonthView.tsx` - Traditional month calendar
- [ ] Add view toggle buttons: Day | Week | Month
- [ ] Add navigation: ← Today → buttons
- [ ] Add date range display (e.g., "Nov 25 - Dec 1, 2024")
- [ ] Color-code sessions by team
- [ ] Show session details on hover
- [ ] Click session → detail modal
- [ ] Click empty slot → create session modal

#### Session Interaction Modals
- [ ] **Session Detail Modal:**
  - Display full session info
  - Buttons: Edit | Delete | View Attendance | Close
  - Show recurring indicator (↻ icon) if part of pattern

- [ ] **Edit Session Modal (for recurring sessions):**
  - Radio buttons:
    - ○ Edit only this session (Nov 28)
    - ○ Edit all future sessions in this pattern
  - Then show edit form
  - "Single" mode: sets `is_override = true`
  - "All future" mode: updates pattern, regenerates non-override sessions

- [ ] **Delete Confirmation Modal (for recurring sessions):**
  - Radio buttons:
    - ○ Delete only this session
    - ○ Delete all future sessions in this pattern
  - Confirm/Cancel buttons
  - "Single" mode: soft delete session
  - "All future" mode: deletes pattern and future non-override sessions

#### API Updates
- [ ] Update PATCH `/api/coach/training/[sessionId]/route.ts`
  - Add `edit_mode` parameter: "single" | "all_future"
  - Implement single edit logic (set is_override = true)
  - Implement pattern update logic (update recurrence, delete future non-override, regenerate)

- [ ] Update DELETE `/api/coach/training/[sessionId]/route.ts`
  - Add `delete_mode` parameter: "single" | "all_future"
  - Implement single delete
  - Implement pattern delete (remove recurrence + future sessions)

- [ ] Create PATCH `/api/coach/training/recurring/[recurrenceId]/route.ts`
  - Direct pattern update endpoint
  - Used from recurring patterns management page

#### Recurring Patterns Management Page
- [ ] Create `/src/app/coach/training/patterns/page.tsx` - Server component
- [ ] Create `/src/app/coach/training/patterns/page-client.tsx` - Client component
- [ ] List all active recurring patterns for coach's teams
- [ ] Show: Team, Days (Mon/Wed/Fri), Time (18:00-19:30), Location
- [ ] Actions per pattern:
  - Edit Pattern (updates all future non-override sessions)
  - Delete Pattern (removes pattern + future sessions)
  - Extend (generate more sessions to new date)
- [ ] Navigation link from main training page

#### Integration & Polish
- [ ] Update `/src/app/coach/training/page-client.tsx`
  - Replace list view with calendar as default
  - Keep list view as optional tab (Calendar | List)
  - Integrate all new modals
  - Add "Manage Recurring Patterns" link

- [ ] Visual indicators:
  - ↻ icon for recurring sessions
  - Show pattern summary on hover: "Part of Mon/Wed/Fri 18:00-19:30 pattern"
  - Different styling for override sessions (dimmed recurring icon)

#### Testing
- [x] Test calendar views (day/week/month) - Basic rendering
- [ ] Test click interactions (view, edit, delete from calendar)
- [ ] Test single vs all occurrences editing
- [ ] Test override behavior (edited sessions stay when pattern changes)
- [ ] Test pattern management page (edit/delete/extend)
- [ ] Test with multiple teams and overlapping sessions
- [ ] Test responsive design (mobile calendar view)

**Progress Update (2025-10-28 - COMPLETED ✅):**
- ✅ Database migration complete (`is_override` column added)
- ✅ Calendar components created (DayView, WeekView, MonthView, TrainingCalendar)
- ✅ Calendar is default view with list view toggle
- ✅ Session Detail Modal implemented
- ✅ Delete Modal enhanced with single/all future options
- ✅ DELETE API endpoint updated with `delete_mode` parameter
- ✅ Timezone issues fixed (manual date formatting)
- ✅ Visual distinction for recurring sessions (ring borders)
- ✅ Delete all future sessions works correctly (finds all patterns in group)

**Completed Features:**
- ✅ Google Calendar-style interface (Day/Week/Month views)
- ✅ Create recurring training patterns (select days, set schedule)
- ✅ Session Detail Modal with full info and action buttons
- ✅ Delete single session or all future sessions in pattern
- ✅ Visual indicators for recurring sessions (ring border + ↻ icon)
- ✅ Timezone-safe date handling across all calendar views
- ✅ Color-coded sessions by team (8-color palette)

**Remaining Work (Future Enhancements):**
- [ ] Enhance Edit Modal for Recurring Sessions
  - Add radio buttons when editing recurring session:
    - ○ Edit only this session (DATE)
    - ○ Edit all future sessions in this pattern
  - Pass `edit_mode` parameter to API
  - Update PATCH endpoint logic

- [ ] Recurring Patterns Management Page
  - Create `/coach/training/patterns` page
  - List all active recurring patterns
  - Edit/Delete/Extend patterns
  - Navigation link from main training page

**Deliverable:** ✅ Google Calendar-style training management with smart recurring session handling

**Technical Notes:**
- **is_override = true:** Session has been manually edited, won't be affected by pattern updates
- **is_override = false:** Session is auto-generated from pattern, will be regenerated if pattern changes
- **Pattern update flow:** Updates `training_recurrences`, deletes future non-override sessions, regenerates from today
- **Calendar rendering:** Fetch sessions for current view range (month ± 1 week for smooth navigation)
- **Color coding:** Each team gets a distinct background color (from predefined palette)

### 5.3 Attendance Tracking ✅ COMPLETE
- [x] Create attendance marking UI (per session)
- [x] Show team roster with checkboxes
- [x] Mark: Present, Absent, Excused, Late, Injured
- [x] Add notes per player
- [x] Save attendance
- [x] Show attendance history
- [x] Calculate attendance percentage
- [x] Attendance overview page with statistics
- [x] Team and date range filters
- [x] Color-coded attendance percentages

**Deliverable:** ✅ Attendance tracking complete

**Completed Features:**
- ✅ Mark attendance from Session Detail Modal (calendar view)
- ✅ Mark attendance from list view (action button)
- ✅ Attendance modal with team roster table
- ✅ 5 status options: Present, Absent, Late, Excused, Injured
- ✅ Arrival time field for "Late" status
- ✅ Optional notes per player
- ✅ Upsert logic (update existing, create new)
- ✅ Custom success toast notification
- ✅ Attendance overview page (`/coach/attendance`)
- ✅ Statistics API endpoint with filters
- ✅ Per-player attendance statistics
- ✅ Overall statistics (total sessions, avg attendance, perfect/low counts)
- ✅ Color-coded percentages: Green (≥90%), Yellow (75-89%), Orange (60-74%), Red (<60%)
- ✅ Team and date range filters

### 5.4 Match Management 📝
- [ ] Create matches list per team
- [ ] Create "Schedule Match" form
- [ ] Select opponent, date, venue
- [ ] Set match type (friendly, league, tournament)
- [ ] Cancel/reschedule match
- [ ] Send notifications
- [ ] Test: Create match, verify notifications

**Deliverable:** Match scheduling

### 5.5 Squad Selection 📝
- [ ] Create squad selection UI
- [ ] Show team roster
- [ ] Select players for squad (multi-select)
- [ ] Designate starting 11
- [ ] Formation builder (optional MVP)
- [ ] Save squad
- [ ] Send notifications to selected players
- [ ] Test: Select squad, verify notifications

**Deliverable:** Squad selection

### 5.6 Match Results & Statistics 📝
- [ ] Create match result entry form
- [ ] Enter final score (own, opponent)
- [ ] Auto-calculate result (win/loss/draw)
- [ ] Enter player statistics (goals, assists, cards, minutes)
- [ ] Add match notes/report
- [ ] Select MVP
- [ ] Publish results
- [ ] Test: Enter results, verify stats aggregated to player profiles

**Deliverable:** Match results tracking

---

## Phase 6: Parent Portal

### 6.1 Parent Dashboard 📝
- [ ] Create parent layout
- [ ] Create dashboard
- [ ] Show all children (if multiple)
- [ ] Show upcoming events per child
- [ ] Show payment status summary
- [ ] Create child selector (if multiple)
- [ ] Test: Parent with multiple children sees all

**Deliverable:** Parent dashboard

### 6.2 Player Profile Viewing 📝
- [ ] Create player profile view page
- [ ] Show all player information (read-only)
- [ ] Show team assignments
- [ ] Show training schedule
- [ ] Show match schedule
- [ ] Show attendance history
- [ ] Show match statistics
- [ ] Test: Parent sees correct child data

**Deliverable:** Player profile viewing

### 6.3 Player Profile Editing 📝
- [ ] Create edit player info form
- [ ] Allow editing: personal, medical, emergency contact, parent info
- [ ] Prevent editing: football info (position, foot, jersey)
- [ ] Validation and error handling
- [ ] Test: Parent edits info, coach cannot see changes to restricted fields

**Deliverable:** Parent can update player info

### 6.4 Payment Tracking View 📝
- [ ] Show payment history
- [ ] Show current payment status (paid/unpaid/overdue)
- [ ] Show upcoming payments
- [ ] Show discounts applied
- [ ] Download payment receipts (future)
- [ ] Test: Parent sees accurate payment data

**Deliverable:** Payment viewing for parents

---

## Phase 7: Player Portal

### 7.1 Player Dashboard 📝
- [ ] Create player layout
- [ ] Create simple dashboard
- [ ] Show player's teams
- [ ] Show upcoming training and matches
- [ ] Show recent match results
- [ ] Show personal stats
- [ ] Test: Player sees own data only

**Deliverable:** Player dashboard

### 7.2 Player Profile View 📝
- [ ] Show player profile (read-only)
- [ ] Show teams
- [ ] Show attendance percentage
- [ ] Show match statistics (goals, assists, etc.)
- [ ] Test: Player views own profile

**Deliverable:** Player profile view

---

## Phase 8: Payment Management

### 8.1 Subscription Fee Management 📝
- [ ] Create subscription fees list per team
- [ ] Set/update monthly fee for team
- [ ] Track fee history (effective dates)
- [ ] Test: Change fee, verify historical tracking

**Deliverable:** Subscription fee management

### 8.2 Discount Management 📝
- [ ] Create discounts list per player
- [ ] Create "Add Discount" form
- [ ] Select discount type (%, fixed)
- [ ] Select reason (sibling, hardship, merit, other)
- [ ] Set effective/end dates
- [ ] Remove discount
- [ ] Test: Apply discount, verify payment calculations

**Deliverable:** Discount management

### 8.3 Payment Record Generation 📝
- [ ] Create Edge Function to generate monthly payments
- [ ] Run on 1st of each month (scheduled)
- [ ] Generate payment record for each active player
- [ ] Calculate amount due (fee - discount)
- [ ] Set due date (e.g., 5th of month)
- [ ] Test: Manually trigger, verify records created

**Deliverable:** Auto payment generation

### 8.4 Payment Tracking 📝
- [ ] Create payment records list (filterable)
- [ ] Filter by status, team, month
- [ ] Mark payment as paid
- [ ] Record payment method and date
- [ ] Add payment notes
- [ ] Auto-update status (unpaid → overdue)
- [ ] Test: Mark paid, verify status changes

**Deliverable:** Payment tracking

### 8.5 Payment Reminders 📝
- [ ] Create Edge Function for payment reminders
- [ ] Send reminder 3 days before due
- [ ] Send reminder on due date
- [ ] Send overdue reminder (3 days after)
- [ ] Send urgent reminder (7 days after)
- [ ] Use Resend for email delivery
- [ ] Test: Trigger reminders, verify emails sent

**Deliverable:** Automated payment reminders

---

## Phase 9: Notifications System

### 9.1 In-App Notifications 📝
- [ ] Create notifications table/schema
- [ ] Create notification center component
- [ ] Show unread count badge
- [ ] List all notifications
- [ ] Mark as read
- [ ] Delete notification
- [ ] Test: Notifications display correctly

**Deliverable:** In-app notification center

### 9.2 Real-time Notifications 📝
- [ ] Set up Supabase Realtime subscriptions
- [ ] Listen for new notifications
- [ ] Show toast/alert for new notifications
- [ ] Update notification count in real-time
- [ ] Test: New notification appears without refresh

**Deliverable:** Real-time notifications

### 9.3 Email Notifications 📝
- [ ] Create email templates (Resend + React Email)
- [ ] Training created/cancelled/rescheduled
- [ ] Match created
- [ ] Squad selected
- [ ] Payment reminder
- [ ] Announcements
- [ ] Test: Send test emails, verify delivery

**Deliverable:** Email notifications

### 9.4 Notification Preferences 📝
- [ ] Create preferences page
- [ ] Toggle notifications per type
- [ ] Toggle email vs in-app
- [ ] Save preferences
- [ ] Test: Disable email, verify no emails sent

**Deliverable:** Notification preferences

---

## Phase 10: Public Club Homepage

### 10.1 Club Homepage Structure 📝
- [ ] Create public route for club (e.g., /club/[slug])
- [ ] Create homepage layout
- [ ] Create hero section (logo, name, banner)
- [ ] Create about section
- [ ] Create navigation
- [ ] Test: Public page accessible without login

**Deliverable:** Basic club homepage structure

### 10.2 Teams Section 📝
- [ ] Display list of active teams
- [ ] Show team name, age group, photo
- [ ] Player count (no names)
- [ ] Test: Teams display correctly

**Deliverable:** Teams section on homepage

### 10.3 News & Announcements 📝
- [ ] Create announcements list (public only)
- [ ] Show title, excerpt, date, image
- [ ] Create announcement detail page
- [ ] Pagination/load more
- [ ] Test: Announcements display, private ones hidden

**Deliverable:** Public announcements

### 10.4 Media Gallery 📝
- [ ] Display photo gallery (public photos only)
- [ ] Group by album
- [ ] Lightbox view
- [ ] Test: Images load, private images hidden

**Deliverable:** Photo gallery

### 10.5 Contact Form 📝
- [ ] Create contact form
- [ ] Validate form fields
- [ ] Send email to club admin (Resend)
- [ ] Show success/error messages
- [ ] Test: Submit form, verify email received

**Deliverable:** Contact form

---

## Phase 11: Content Management

### 11.1 Announcement Management 📝
- [ ] Create announcements list (club admin)
- [ ] Create "New Announcement" form
- [ ] Rich text editor (optional: use textarea for MVP)
- [ ] Upload featured image
- [ ] Set visibility (public/members)
- [ ] Set target audience (all/specific teams)
- [ ] Publish/schedule/draft
- [ ] Edit/delete announcements
- [ ] Test: Create announcement, verify visibility

**Deliverable:** Announcement management

### 11.2 Media Gallery Management 📝
- [ ] Create media upload page
- [ ] Upload images to Supabase Storage
- [ ] Set visibility (public/members)
- [ ] Add caption
- [ ] Organize by album
- [ ] Delete images
- [ ] Test: Upload images, verify storage and RLS

**Deliverable:** Media management

### 11.3 Club Homepage Editing 📝
- [ ] Create club settings page
- [ ] Edit club description
- [ ] Upload logo/banner
- [ ] Edit contact info
- [ ] Edit social media links
- [ ] Preview homepage
- [ ] Test: Update settings, verify public page changes

**Deliverable:** Homepage content management

---

## Phase 12: Internationalization (i18n)

### 12.1 i18n Setup 📝
- [ ] Configure next-intl
- [ ] Create translation files (en, mk, sq)
- [ ] Translate static UI text
- [ ] Create language switcher component
- [ ] Test: Switch languages, verify translations

**Deliverable:** Multi-language support

### 12.2 Translate All Features 📝
- [ ] Translate authentication pages
- [ ] Translate dashboards
- [ ] Translate forms and tables
- [ ] Translate notifications
- [ ] Translate public pages
- [ ] Test: All pages work in all languages

**Deliverable:** Full translation coverage

---

## Phase 13: Advanced Features & Polish

### 13.1 Search & Filtering 📝
- [ ] Add search to players list
- [ ] Add filters (team, position, active/inactive)
- [ ] Add search to matches list
- [ ] Add filters (team, status, date range)
- [ ] Debounce search input
- [ ] Test: Search and filters work correctly

**Deliverable:** Search and filtering

### 13.2 Data Export 📝
- [ ] Export players list to CSV
- [ ] Export payment records to CSV
- [ ] Export attendance to CSV
- [ ] Test: Exports contain correct data

**Deliverable:** Data export functionality

### 13.3 Performance Optimization 📝
- [ ] Implement pagination on large lists
- [ ] Add loading skeletons
- [ ] Optimize images (Next.js Image component)
- [ ] Add caching with TanStack Query
- [ ] Lazy load components
- [ ] Test: Pages load quickly, smooth UX

**Deliverable:** Optimized performance

### 13.4 Error Handling & Validation 📝
- [ ] Add error boundaries
- [ ] Improve form validation messages
- [ ] Add toast notifications for actions
- [ ] Handle API errors gracefully
- [ ] Add retry logic for failed requests
- [ ] Test: Error scenarios handled gracefully

**Deliverable:** Robust error handling

### 13.5 Accessibility (a11y) 📝
- [ ] Add proper ARIA labels
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader
- [ ] Ensure color contrast meets WCAG
- [ ] Add focus indicators
- [ ] Test: Accessibility audit passes

**Deliverable:** Accessible application

---

## Phase 14: Testing & Quality Assurance

### 14.1 Unit Tests 📝
- [ ] Write tests for utility functions
- [ ] Write tests for hooks
- [ ] Write tests for validation schemas
- [ ] Test RLS policies with different roles
- [ ] Test database triggers
- [ ] Target: 70%+ coverage on critical paths

**Deliverable:** Unit tests

### 14.2 Integration Tests 📝
- [ ] Test authentication flows
- [ ] Test CRUD operations with RLS
- [ ] Test payment generation
- [ ] Test notification delivery
- [ ] Test file uploads

**Deliverable:** Integration tests

### 14.3 E2E Tests 📝
- [ ] Test super admin flow (create club → assign admin)
- [ ] Test club admin flow (create team → add player)
- [ ] Test coach flow (schedule training → mark attendance)
- [ ] Test parent flow (view player → update info)
- [ ] Test player flow (view profile)
- [ ] Use Playwright for critical user journeys

**Deliverable:** E2E tests for critical paths

### 14.4 Manual Testing 📝
- [ ] Test all features with different roles
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile devices
- [ ] Test with multiple clubs
- [ ] Test with large datasets (100+ players)
- [ ] Document bugs and fix

**Deliverable:** Manual test report

---

## Phase 15: Deployment & Launch

### 15.1 Staging Deployment 📝
- [ ] Deploy to Netlify staging
- [ ] Set up staging Supabase environment
- [ ] Configure environment variables
- [ ] Test staging deployment
- [ ] Fix any deployment issues

**Deliverable:** Working staging environment

### 15.2 Production Setup 📝
- [ ] Set up production Supabase project
- [ ] Run database migrations on production
- [ ] Set up Supabase Storage buckets
- [ ] Configure production environment variables in Netlify
- [ ] Test production deployment (internal)

**Deliverable:** Production environment ready

### 15.3 Custom Domain Setup 📝
- [ ] Purchase clubify.mk domain
- [ ] Configure DNS records
- [ ] Set up SSL certificate (Netlify auto)
- [ ] Test domain access

**Deliverable:** Custom domain working

### 15.4 Monitoring & Logging 📝
- [ ] Set up Sentry for error tracking
- [ ] Configure Netlify Analytics
- [ ] Set up Supabase logging
- [ ] Create alert rules for critical errors
- [ ] Test error reporting

**Deliverable:** Monitoring in place

### 15.5 Documentation 📝
- [ ] Update setup guide with production steps
- [ ] Create admin user guide
- [ ] Create coach user guide
- [ ] Create parent user guide
- [ ] Create API documentation (if needed)

**Deliverable:** User documentation

### 15.6 Launch Preparation 📝
- [ ] Create demo data (sample club)
- [ ] Prepare launch announcement
- [ ] Create onboarding flow for first club
- [ ] Create backup strategy
- [ ] Define rollback plan

**Deliverable:** Launch readiness

### 15.7 Go Live 🚀 📝
- [ ] Deploy to production
- [ ] Onboard first real club
- [ ] Monitor for issues
- [ ] Collect initial feedback
- [ ] Fix critical bugs

**Deliverable:** Live application with first club!

---

## Future Enhancements (Post-Launch)

### 16.1 Payment Integration 📝
- [ ] Integrate Casys payment provider
- [ ] Implement online payment flow
- [ ] Add payment receipts
- [ ] Test payment processing

### 16.2 Mobile App 📝
- [ ] Explore React Native
- [ ] Build mobile app MVP
- [ ] Push notifications
- [ ] Deploy to App Store / Google Play

### 16.3 Advanced Analytics 📝
- [ ] Player performance analytics
- [ ] Team statistics dashboard
- [ ] Attendance trends
- [ ] Payment analytics

### 16.4 League Management 📝
- [ ] Cross-club league functionality
- [ ] League standings
- [ ] Tournament brackets
- [ ] Inter-club matches

---

## Current Focus

**Now:** Phase 5.4 📝 **Match Management**

**Next Steps (in priority order):**
1. **Phase 5.4** - Match Management (schedule matches, opponents, venues)
2. **Phase 5.5** - Squad Selection (select players for matches)
3. **Phase 5.6** - Match Results & Statistics (record scores, player stats)
4. **5.2.1 Enhancement** - Edit recurring sessions (single vs all occurrences)
5. **5.2.1 Enhancement** - Recurring patterns management page
6. **4.5 Enhancement** - Jersey number editing (deferred, lower priority)
7. **Phase 6** - Parent Portal (view player info, payments, schedules)
7. **Phase 8** - Payment Management (subscription fees, discounts, payment tracking)

**Completed Recently:**
- ✅ **Phase 5.3 - Attendance Tracking** (FULLY COMPLETE!) 🎉
  - Mark attendance from calendar and list view
  - Attendance overview page with statistics
  - Color-coded percentage badges
  - Team and date range filters
  - Dashboard integration with correct calculations
- ✅ **Phase 5.2.1 - Training Calendar View** (FULLY COMPLETE!) 🎉
  - Google Calendar-style interface (Day/Week/Month views)
  - Recurring training sessions
  - Session Detail Modal
  - Delete with single/all future options
  - Visual distinction for recurring sessions
  - Timezone-safe date handling
- ✅ **Phase 4.6 - Coach Management** (FULLY COMPLETE!) 🎉
  - **CRUD Operations:**
    - Coaches list page with stats (Total, Licensed, Active coaches)
    - Create coach form with credentials (license, experience, bio)
    - Coach profile view with 2-column layout
    - Edit coach form (pre-populated, email read-only)
    - Soft delete (sets is_active = false)
  - **Smart Account Management:**
    - Checks if user exists by email before creating
    - Auto-creates or reuses existing auth accounts
    - Default password: ClubifyCoach2025! for new coaches
    - Auto-assigns coach role to user
  - **Team Assignment:**
    - Assign teams page with modal UI
    - 5 coaching roles: head_coach, assistant_coach, goalkeeper_coach, fitness_coach, other
    - Color-coded role badges (purple, blue, green, orange, gray)
    - API endpoints for assign/remove operations
    - Smart handling: reactivates inactive assignments
    - Soft delete with is_active flag
    - Team detail page shows coaching staff section
  - **Design Consistency:**
    - Native HTML elements (no shadcn components)
    - Green focus states and explicit color classes
    - Full-width forms with back button in header
    - Matches teams/players pages exactly
- ✅ **Phase 4.4 - CSV Player Import** (PRODUCTION READY!) 🎉
  - CSV template with all 26 player fields
  - Drag & drop upload with validation
  - Preview table with validation status
  - Bulk import with comprehensive error handling
  - **Idempotent operations** - retry-safe after failures
  - **Smart account management** - reuses existing auth users and parent accounts
  - Auto-create/reuse parent accounts by email
  - Optional team assignment by team name + jersey number
  - Error log download for debugging
  - Results summary (success/failed counts)
  - **Successfully tested with 10 players** imported to FK Spartak
  - Fixed blood type validation to match database (A+, A-, etc.)
  - Added missing database columns (nationality, city, address, etc.)
- ✅ **Phase 4.5 - Player Team Assignment** (COMPLETE!) 🎉
  - Team detail/roster page with player management
  - Assign players to teams (from player profile OR team page)
  - Bulk player assignment with checkbox selection
  - Remove players from teams with custom confirmation modals
  - Multi-team support (players can be on multiple teams)
  - Jersey number column added to database
  - Full access control (super_admin + club_admin)
- ✅ **Phase 4.3 - Player Management CRUD** (COMPLETE!) 🎉
  - **4.3.1** - Multi-step player creation form with parent account management
  - **4.3.2** - Player profile view with all information display
  - **4.3.3** - Player edit with pre-population and validation
  - **4.3.4** - Soft delete functionality with confirmation modal
  - Fixed form value matching (lowercase DB values)
  - Production-ready with full access control
- ✅ Phase 4.2 - Team Management (CRUD operations)
- ✅ Phase 4.1 - Club Admin Dashboard (with super admin integration)
- ✅ Phase 3 - Complete Super Admin Portal (UI redesign + theme switcher)
- ✅ Phase 2 - Complete Auth & RBAC system with hooks
- ✅ Phase 1 - Database Foundation (22 tables)

**Phase 4.3.1 Complete - Key Achievements:**
- ✅ 5-step player creation form (personal, football, medical, emergency, parent)
- ✅ Automatic parent account creation with email uniqueness
- ✅ Smart parent reuse (same parent for multiple children)
- ✅ Role-based access with proper RLS bypass
- ✅ Retry-safe operations (idempotent inserts)
- ✅ Comprehensive error handling and logging
- ✅ Production tested with real data

**Why Complete CRUD First:**
- Player View/Edit/Delete are essential for any production app
- Users expect full CRUD before advanced features like CSV import
- Team assignment requires viewing player profiles
- Following REST/CRUD best practices

---

## Notes

- This TODO list is a living document
- Update status as tasks are completed
- Add new tasks as they are discovered
- Review and adjust priorities as needed
- Celebrate small wins! 🎉

---

**Last Review:** 2025-10-27
**Progress:** Phase 4.6 FULLY COMPLETE! (Coach Management with Team Assignments) 🎉
**Next Milestone:** Phase 5 - Coach Portal OR Phase 4.5 Enhancement - Jersey Number Editing
