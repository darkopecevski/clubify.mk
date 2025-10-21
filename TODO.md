# Clubify.mk - Development TODO List

**Last Updated:** 2025-10-20 (Phase 2 COMPLETE! 🎉 - Auth & RBAC System Ready!)

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

## Phase 3: Super Admin Portal

### 3.1 Super Admin Dashboard ✅
- [x] Create super admin layout with sidebar navigation
- [x] Create dashboard overview page
- [x] Show stats: total clubs, users, players, teams
- [x] Show recent activity (latest clubs)
- [x] Create navigation menu (Dashboard, Clubs, Users, Settings)
- [x] Protected with ProtectedRoute (super_admin role)
- [x] Test: Dashboard loads, stats accurate

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

### 3.3 User Management (Super Admin) ⏳
- [ ] Create users list page with roles display
- [ ] Show user info: email, name, roles, clubs
- [ ] Create "Assign Role" functionality
- [ ] Support multi-role assignment per user
- [ ] Support club-specific roles (club_admin, coach)
- [ ] Remove role from user
- [ ] Filter users by role
- [ ] Test: Assign roles, verify access changes

**Deliverable:** User management with role assignment

---

## Phase 4: Club Admin Portal

### 4.1 Club Admin Dashboard 📝
- [ ] Create club admin layout
- [ ] Create dashboard overview
- [ ] Show club stats (teams, players, payments)
- [ ] Show upcoming matches and training
- [ ] Create navigation menu
- [ ] Test: Dashboard shows correct club data only

**Deliverable:** Club admin dashboard

### 4.2 Team Management 📝
- [ ] Create teams list page
- [ ] Create "Create Team" form (name, age group, season)
- [ ] Create "Edit Team" form
- [ ] Add team activation/deactivation
- [ ] Set subscription fee per team
- [ ] Test: CRUD operations on teams, RLS enforcement

**Deliverable:** Team management for club admins

### 4.3 Player Management - Manual Creation 📝
- [ ] Create players list page with table
- [ ] Create "Add Player" multi-step form
  - [ ] Step 1: Personal info
  - [ ] Step 2: Football info
  - [ ] Step 3: Medical info
  - [ ] Step 4: Emergency contact
  - [ ] Step 5: Parent/guardian info
- [ ] Auto-create parent user account
- [ ] Send welcome email to parent
- [ ] Create player user account
- [ ] Test: Create player, verify accounts created

**Deliverable:** Manual player creation

### 4.4 Player Management - CSV Import 📝
- [ ] Create CSV template download
- [ ] Create CSV upload component
- [ ] Validate CSV format and data
- [ ] Show preview before import
- [ ] Bulk create players
- [ ] Handle errors gracefully
- [ ] Show import summary
- [ ] Test: Import 10+ players successfully

**Deliverable:** CSV bulk player import

### 4.5 Player Team Assignment 📝
- [ ] Create player profile page
- [ ] Show current team assignments
- [ ] Add "Assign to Team" functionality
- [ ] Support multi-team assignment
- [ ] Set jersey number per team
- [ ] Remove from team
- [ ] Test: Assign player to multiple teams

**Deliverable:** Player-team assignment

### 4.6 Coach Management 📝
- [ ] Create coaches list page
- [ ] Create "Add Coach" form
- [ ] Create coach user account
- [ ] Send welcome email
- [ ] Assign coach to teams
- [ ] Remove coach from team
- [ ] Test: Create coach, assign to teams, verify access

**Deliverable:** Coach management

---

## Phase 5: Coach Portal

### 5.1 Coach Dashboard 📝
- [ ] Create coach layout
- [ ] Create dashboard overview
- [ ] Show assigned teams
- [ ] Show upcoming training sessions and matches
- [ ] Show attendance summary
- [ ] Test: Coach sees only their teams

**Deliverable:** Coach dashboard

### 5.2 Training Session Management 📝
- [ ] Create training sessions list per team
- [ ] Create "Schedule Training" form (one-time)
- [ ] Create "Recurring Training" form
- [ ] Generate recurring session instances
- [ ] Cancel training session
- [ ] Reschedule training session
- [ ] Send notifications to players/parents
- [ ] Test: Create recurring training, verify instances

**Deliverable:** Training session scheduling

### 5.3 Attendance Tracking 📝
- [ ] Create attendance marking UI (per session)
- [ ] Show team roster with checkboxes
- [ ] Mark: Present, Absent, Excused, Late
- [ ] Add notes per player
- [ ] Save attendance
- [ ] Show attendance history
- [ ] Calculate attendance percentage
- [ ] Test: Mark attendance, verify calculations

**Deliverable:** Attendance tracking

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

**Now:** Phase 3.3 - User Management (Super Admin) ⏳

**Next:** Phase 4 - Club Admin Portal

**Completed Recently:**
- ✅ Phase 2 - Complete Auth & RBAC system with hooks
- ✅ Phase 3.1 - Super admin dashboard with stats
- ✅ Phase 3.2 - Full club CRUD management

**Phase 3 Progress:**
- ✅ Admin layout with sidebar navigation
- ✅ Dashboard with stats cards (clubs, users, players, teams)
- ✅ Clubs management (create, read, update, delete)
- ⏳ User management with role assignment (in progress)

---

## Notes

- This TODO list is a living document
- Update status as tasks are completed
- Add new tasks as they are discovered
- Review and adjust priorities as needed
- Celebrate small wins! 🎉

---

**Last Review:** 2025-10-20
**Progress:** Phase 1 Complete! (Database Foundation - All 22 tables)
**Next Milestone:** Phase 2 - Authentication & Authorization
