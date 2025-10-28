# Claude Code Development Workflow

This document defines the development workflow and principles for building Clubify.mk with Claude Code.

---

## Core Development Principles

### 1. Plan Before Code
- **ALWAYS** create a plan for each chapter/feature before writing code
- Present the plan to the user for approval
- Get explicit confirmation before proceeding
- Document the plan in TODO.md

### 2. Break Work into Small, Testable Pieces
- Each feature should be a "chapter" - a complete, testable unit
- A chapter should take 30-60 minutes maximum
- Can be tested independently
- Can be deployed independently if needed

### 3. Test Each Chapter Thoroughly
- After completing a chapter, **STOP**
- Test the functionality thoroughly
- Verify it works as expected
- Only move to next chapter after confirmation

### 4. Balanced Testing Approach
- Write tests for each feature
- Focus on critical paths and business logic
- Avoid testing trivial code (getters/setters)
- Don't aim for 100% coverage - aim for confidence
- Test what matters: auth, RLS, payments, data integrity

### 5. Commit Working Code Frequently
- Commit after each completed chapter
- Write clear, descriptive commit messages
- Follow conventional commits format
- Push to GitHub regularly

### 6. Deploy After Major Milestones
- Deploy to staging after completing a phase
- Test in staging environment
- Get user feedback before moving to next phase

---

## Development Workflow

### Step 1: Review TODO.md
- Check current phase and chapter
- Understand what needs to be built
- Review acceptance criteria

### Step 2: Create a Plan
```markdown
## Plan for [Chapter Name]

**Goal:** [What we're building]

**Approach:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Files to Create/Modify:**
- [List files]

**Testing Strategy:**
- [How we'll test this]

**Definition of Done:**
- [ ] [Criteria 1]
- [ ] [Criteria 2]

**Estimated Time:** [X minutes]
```

### Step 3: Get Approval
- Present the plan to the user
- Wait for explicit confirmation
- Adjust plan based on feedback

### Step 4: Implement
- Follow the approved plan
- Write clean, maintainable code
- Add comments for complex logic
- Follow TypeScript strict mode
- Use ESLint + Prettier

### Step 5: Test
- Test the feature manually
- Write automated tests (unit/integration/e2e as appropriate)
- Verify edge cases
- Test with different user roles (if applicable)

### Step 6: Review & Confirm
- Present what was built
- Demonstrate it working
- Show test results
- Get user confirmation before proceeding

### Step 7: Commit & Update
- Commit the working code
- **Update TODO.md** (mark chapter as complete)
- **When finishing a PHASE, update TODO.md to mark the entire phase complete**
- Push to GitHub
- Deploy to staging if it's a milestone

### Step 8: Repeat
- Move to next chapter
- Start from Step 1

---

## Code Quality Standards

### TypeScript
- Use strict mode
- Avoid `any` type
- Define proper interfaces and types
- Use Zod for runtime validation

### Components
- Prefer server components (Next.js App Router)
- Use client components only when needed (interactivity)
- Keep components small and focused
- Extract reusable logic into hooks

### Styling
- Use Tailwind CSS utility classes
- Use shadcn/ui components
- Follow consistent spacing and sizing
- Mobile-first responsive design

### Database
- Always use RLS policies
- Test policies with different roles
- Use transactions for multi-step operations
- Handle errors gracefully

### Error Handling
- Use try/catch for async operations
- Provide user-friendly error messages
- Log errors for debugging
- Don't expose sensitive information

---

## Testing Guidelines

### What to Test

**High Priority:**
- Authentication flows
- Authorization (RLS policies)
- Payment calculations
- Data integrity (relationships, constraints)
- Critical user paths (create player, mark attendance, etc.)

**Medium Priority:**
- Form validation
- API endpoints
- UI component behavior
- Edge cases

**Low Priority:**
- Simple getters/setters
- Trivial utility functions
- Static content

### Testing Levels

**Unit Tests (Vitest):**
- Utility functions
- Validation schemas
- Business logic
- Hooks

**Integration Tests (Vitest + Supabase):**
- Database operations
- RLS policy enforcement
- API routes
- Authentication flows

**E2E Tests (Playwright):**
- Critical user journeys
- Multi-step workflows
- Cross-role interactions
- Payment flows

### Test Coverage Goals
- Critical paths: 90%+
- Business logic: 80%+
- Overall: 70%+
- Don't obsess over 100% - focus on confidence

---

## Communication Principles

### Be Concise
- Don't over-explain
- User knows what they want
- Present options, let user choose

### Ask When Uncertain
- Don't guess requirements
- Ask clarifying questions
- Present alternatives

### Show, Don't Tell
- Demonstrate working features
- Show test results
- Provide examples

---

## Common Commands Reference

### Development
```bash
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm lint                   # Lint code
pnpm type-check             # TypeScript check
pnpm test                   # Run tests
pnpm test:watch             # Run tests in watch mode
pnpm test:e2e               # Run E2E tests
```

### Supabase
```bash
supabase status             # Check status
supabase migration list     # List migrations (local and remote)
supabase migration new <name>  # Create new migration file
supabase db push            # Push migrations to remote
supabase gen types typescript --linked > src/types/database.types.ts  # Generate types
supabase db reset           # Reset local DB (dev only)
supabase login --token <token>  # Login with access token
supabase link --project-ref <ref>  # Link to remote project
```

**Database Migration Workflow:**
1. Create migration: `supabase migration new feature_name`
2. Write SQL in the generated file
3. Push to remote: `supabase db push` (auto-prompts for confirmation)
4. Regenerate types: `supabase gen types typescript --linked > src/types/database.types.ts`
5. Verify build: `pnpm build`

### Git
```bash
git status                  # Check status
git add .                   # Stage changes
git commit -m "message"     # Commit
git push origin main        # Push to GitHub
```

### Netlify
```bash
netlify deploy              # Deploy to staging
netlify deploy --prod       # Deploy to production
netlify open                # Open dashboard
```

---

## Git Commit Message Format

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add login page with email/password

- Create login form component
- Add form validation with Zod
- Integrate with Supabase Auth
- Add error handling and loading states

Closes #12

---

fix(payment): correct discount calculation

The discount was being applied twice. Now applies only once.

---

test(attendance): add unit tests for attendance percentage calculation

---

chore(deps): update Next.js to 14.1.0
```

---

## File Organization

```
clubify.mk/
├── app/                          # Next.js App Router
│   ├── [locale]/                # i18n routes
│   │   ├── (auth)/              # Protected routes
│   │   │   ├── dashboard/       # Role-based dashboards
│   │   │   ├── admin/           # Super admin
│   │   │   ├── club/            # Club admin
│   │   │   ├── coach/           # Coach
│   │   │   ├── parent/          # Parent
│   │   │   └── player/          # Player
│   │   └── (public)/            # Public routes
│   └── api/                     # API routes
├── components/                   # React components
│   ├── ui/                      # shadcn/ui
│   ├── shared/                  # Shared components
│   ├── forms/                   # Form components
│   └── [feature]/               # Feature-specific components
├── lib/                         # Utilities
│   ├── supabase/                # Supabase clients
│   ├── hooks/                   # Custom hooks
│   ├── utils/                   # Helper functions
│   └── validations/             # Zod schemas
├── types/                       # TypeScript types
├── tests/                       # Test files
├── docs/                        # Documentation
└── supabase/                    # Supabase config
```

---

## Troubleshooting

### Build Fails
1. Check TypeScript errors: `pnpm type-check`
2. Check linting: `pnpm lint`
3. Clear cache: `rm -rf .next && pnpm build`

### Database Issues
1. Check RLS policies in Supabase dashboard
2. Verify user roles: `SELECT * FROM user_roles WHERE user_id = auth.uid()`
3. Check logs in Supabase dashboard

### Authentication Issues
1. Clear browser cookies
2. Check Supabase Auth settings
3. Verify environment variables

---

## Database Schema Overview

### Phase 1: Database Foundation (✅ Complete)

**22 Tables across 4 sub-phases:**

**Phase 1.1 - Core Tables:**
- `users` - User profiles (extends auth.users)
- `clubs` - Football clubs
- `user_roles` - Multi-tenant role assignments (5 roles: super_admin, club_admin, coach, parent, player)
- `teams` - Teams within clubs

**Phase 1.2 - Player Management:**
- `players` - Player profiles with medical info
- `player_parents` - Parent-player relationships
- `team_players` - Team roster assignments
- `coaches` - Coach profiles with licenses
- `team_coaches` - Coach-team assignments

**Phase 1.3 - Training & Matches:**
- `training_recurrences` - Recurring training schedules
- `training_sessions` - Individual training sessions
- `attendance` - Player attendance tracking
- `matches` - Match details
- `match_squads` - Squad selections
- `match_statistics` - Player match stats

**Phase 1.4 - Payments & Communication:**
- `subscription_fees` - Monthly fees per team
- `discounts` - Player-specific discounts
- `payment_records` - Payment tracking
- `announcements` - Club news
- `media_gallery` - Photos/videos
- `notifications` - In-app notifications
- `notification_preferences` - User notification settings

**Key Database Features:**
- ✅ Comprehensive RLS policies on all tables
- ✅ Helper functions: `is_super_admin()`, `user_club_ids()`, `user_has_club_role()`
- ✅ Automatic `updated_at` triggers
- ✅ Foreign key relationships with CASCADE rules
- ✅ Check constraints for data integrity
- ✅ Multi-tenant architecture (club-scoped data)

**Seed Data Available:**
- `supabase/seed.sql` - 3 clubs, 4 teams
- `supabase/seed_players.sql` - 8 players
- `supabase/seed_coaches_parents.sql` - 2 coaches, 3 parents
- `supabase/seed_training_matches.sql` - Training sessions and matches
- `supabase/seed_payments_communication.sql` - Payments and announcements

---

## Remember

- ✅ **Plan first, code second**
- ✅ **Test each chapter before moving on**
- ✅ **Commit working code frequently**
- ✅ **Update TODO.md after each chapter completion**
- ✅ **Update TODO.md after each phase completion**
- ✅ **Communicate clearly and concisely**
- ✅ **Follow the TODO.md roadmap**
- ✅ **Balance testing - test what matters**
- ✅ **Keep code clean and maintainable**

---

---

## Phase 2: Authentication & Authorization (✅ Complete)

### Authentication Infrastructure

**Supabase Clients:**
- `src/lib/supabase/client.ts` - Browser client (client components)
- `src/lib/supabase/server.ts` - Server client (server components, API routes)
- `src/lib/supabase/admin.ts` - Admin client with service role (bypasses RLS)
- `src/lib/supabase/middleware.ts` - Middleware client for session refresh

**Middleware:**
- `src/middleware.ts` - Automatic session refresh on all routes
- Runs before every request to keep tokens fresh
- Handles auth state changes transparently

**Auth Routes:**
- `/auth/callback` - Handles email verification, password reset redirects
- `/auth/error` - Error page for failed auth attempts
- `/login` - Login page with email/password
- `/signup` - Signup page with email verification
- `/forgot-password` - Request password reset link
- `/reset-password` - Set new password after reset
- `/unauthorized` - Access denied page

### Authentication Hooks

**`useAuth()` Hook:**
```tsx
const { signUp, signIn, signOut, resetPassword, updatePassword, loading, error } = useAuth();
```
- All auth operations in one hook
- Automatic error handling
- Loading states
- Returns user data on success

**`useUser()` Hook:**
```tsx
const { user, loading } = useUser();
```
- Get current authenticated user
- Auto-updates on auth state changes
- Listens to Supabase auth events

### Form Validation

**Zod Schemas (`src/lib/validations/auth.ts`):**
- `signInSchema` - Email + password
- `signUpSchema` - Email, password, confirmPassword, fullName
- `forgotPasswordSchema` - Email only
- `resetPasswordSchema` - Password + confirmPassword

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number

### Role-Based Access Control (RBAC)

**Role Hierarchy (lowest to highest):**
1. `parent` - Can view their children's data
2. `coach` - Can manage teams and players
3. `club_admin` - Can manage entire club
4. `super_admin` - Can manage all clubs (full system access)

**`useUserRole()` Hook:**
```tsx
const {
  roles,              // Array of user's roles
  isLoading,          // Loading state
  error,              // Error if any
  hasRole,            // Check specific role
  isSuperAdmin,       // Is super admin?
  isClubAdmin,        // Is club admin?
  isCoach,            // Is coach?
  isParent,           // Is parent?
  clubIds,            // Club IDs user has access to
} = useUserRole();
```

**Role Utilities (`src/lib/auth/roles.ts`):**
- `hasRole(roles, role, clubId?)` - Check specific role
- `hasMinimumRole(roles, minimumRole, clubId?)` - Check role hierarchy
- `isSuperAdmin(roles)` - Is super admin?
- `isClubAdmin(roles, clubId?)` - Is club admin?
- `hasClubAccess(roles, clubId)` - Has access to club?
- `getHighestRole(roles)` - Get user's highest role

**Page Protection:**
```tsx
import { ProtectedRoute } from "@/components/auth";

// Require authentication only
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Require specific role
<ProtectedRoute requireRole="club_admin">
  <AdminPanel />
</ProtectedRoute>

// Require minimum role level
<ProtectedRoute requireMinimumRole="coach">
  <CoachDashboard />
</ProtectedRoute>

// Require club access
<ProtectedRoute requireClubAccess={clubId}>
  <ClubDetails />
</ProtectedRoute>
```

**Conditional UI Rendering:**
```tsx
import { RequireRole, SuperAdminOnly, ClubAdminOnly, CoachOnly } from "@/components/auth";

// Show only to super admins
<SuperAdminOnly>
  <DeleteButton />
</SuperAdminOnly>

// Show to club admins and above
<ClubAdminOnly clubId={clubId}>
  <ManageClubButton />
</ClubAdminOnly>

// Show to coaches and above
<CoachOnly clubId={clubId}>
  <ManagePlayersButton />
</CoachOnly>

// Custom requirements with fallback
<RequireRole
  minimumRole="coach"
  clubId={clubId}
  fallback={<p>You need coach access</p>}
>
  <CoachTools />
</RequireRole>
```

### Environment Variables

**Required for Auth:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://clubifymk.netlify.app
```

### Supabase Auth Configuration

**Manual Steps Required (see `docs/PHASE_2_1_SETUP.md`):**
1. Set Site URL and Redirect URLs in dashboard
2. Enable Email provider with confirmation
3. Customize email templates (4 templates)
4. Configure rate limits
5. Set password policies

**Redirect URLs to Configure:**
- `http://localhost:3000/**` (local dev)
- `https://clubifymk.netlify.app/**` (production)
- `https://*--clubifymk.netlify.app/**` (preview deployments)

### Testing Auth & RBAC

**Test Different Roles:**
```sql
-- Create test users with different roles
INSERT INTO user_roles (user_id, club_id, role)
VALUES
  ('user-uuid', NULL, 'super_admin'),           -- Super admin
  ('user-uuid', 'club-uuid', 'club_admin'),     -- Club admin
  ('user-uuid', 'club-uuid', 'coach'),          -- Coach
  ('user-uuid', 'club-uuid', 'parent');         -- Parent
```

**Auth Flow Testing:**
- ✅ Signup with email verification
- ✅ Login with email/password
- ✅ Logout
- ✅ Forgot password flow
- ✅ Reset password flow
- ✅ Session persistence across page reloads
- ✅ Auto token refresh

**RBAC Testing:**
- ✅ Page protection redirects work
- ✅ Unauthorized page shows for insufficient permissions
- ✅ UI elements hide based on roles
- ✅ Role hierarchy enforced correctly

### Key Learnings

**Auth Best Practices:**
1. Always use `ProtectedRoute` for pages - don't rely on UI hiding alone
2. Validate roles server-side - client-side is for UX only
3. RLS policies are the real security - RBAC is additional layer
4. Check roles in API routes - never trust client
5. Use middleware for automatic session refresh
6. Handle loading and error states properly

**Common Patterns:**
```tsx
// Check if user can edit something
function canEdit(userRoles: UserRole[], clubId: string) {
  return hasMinimumRole(userRoles, "club_admin", clubId);
}

// Show different UI based on role
function Dashboard() {
  const { isSuperAdmin, isClubAdmin } = useUserRole();

  if (isSuperAdmin()) return <SuperAdminDashboard />;
  if (isClubAdmin()) return <ClubAdminDashboard />;
  return <UserDashboard />;
}

// Protect API route
async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: roles } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", user.id);

  if (!isSuperAdmin(roles)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Proceed with deletion...
}
```

### Documentation

**Phase 2 Docs:**
- `docs/PHASE_2_1_SETUP.md` - Auth setup instructions
- `docs/SUPABASE_AUTH_CONFIG.md` - Email template configurations
- `docs/RBAC_USAGE.md` - Complete RBAC usage guide with examples

---

## Phase 3: Super Admin Portal (✅ Complete)

### UI Redesign & Professional Layout ✅

**Full-width Responsive Admin Layout:**
- Redesigned admin portal with professional CMS-style layout
- Collapsible sidebar (desktop: minimizes to icons, mobile: slide-in drawer)
- Full-width top header with search bar, notifications, settings, theme toggle
- Mobile-first responsive design with proper breakpoints (sm, md, lg)
- Replaced emoji icons with professional Lucide React icons
- Color-coded stat cards with trend indicators
- Proper spacing and visual hierarchy
- User dropdown menu with sign out in header and sidebar
- "Switch to Club View" selector for managing any club directly

**Theme Switching (Tailwind v4 Dark Mode):**
- Implemented light/dark mode toggle with next-themes
- Fixed Tailwind CSS v4 dark mode configuration (uses `@custom-variant` instead of config file)
- Added Sun/Moon icons that change based on current theme
- Persistent theme storage across sessions
- Proper CSS variable definitions for both `.light` and `.dark` classes

**Technical Implementation:**
- `src/app/admin/layout.tsx` - Collapsible sidebar, responsive header, theme toggle, club selector
- `src/app/admin/page.tsx` - Professional dashboard with stat cards
- `src/app/globals.css` - Tailwind v4 dark mode with `@custom-variant dark (&:where(.dark, .dark *))`
- No `tailwind.config.js` needed for dark mode in v4 (CSS-based configuration)
- Theme state managed with `next-themes` library
- Conditional rendering after mount to prevent hydration mismatch

**Key Learnings:**
- Tailwind v4 uses `@custom-variant` directive in CSS instead of config file
- Must define both `:root, .light` and `.dark` CSS variable sets
- Theme persistence requires proper `storageKey` in ThemeProvider
- `suppressHydrationWarning` on `<html>` tag prevents theme flash

### Super Admin Features ✅

**Dashboard:**
- Real-time statistics: total clubs, users, players, teams
- Trend indicators with color-coded percentages
- Recent clubs activity feed
- Quick navigation cards with "View details" links

**Club Management:**
- Full CRUD operations with proper validation
- Club activation/deactivation toggle
- Auto-generated slugs from club names
- All fields: name, slug, city, founded_year, contact info, logo, description
- Unified form layout between create and edit pages (2-column responsive grid)
- Club admin management per club (create new users or assign existing)
- Default password generation for new club admins (ClubAdmin2024!)
- List and manage club administrators for each club

**User Management:**
- Users list with role badges (color-coded by role)
- Multi-role assignment per user
- Club-specific role assignment (club_admin, coach)
- Parent-child relationships displayed
- Custom database function for fetching users with emails
- API endpoint to list all users (for admin assignment)

**Club Admin User Management:**
- `POST /api/admin/clubs/[id]/admins` - Create new club admin or assign existing user
- `GET /api/admin/clubs/[id]/admins` - List all admins for a club
- `GET /api/admin/users` - List all users in system (for assignment)
- Modal with two modes: "Existing User" (dropdown selector) or "New User" (create form)
- Auto-filters already assigned admins from selection list
- Success modal displays temporary credentials for new users

**Super Admin Club Management:**
- Can switch to any club's admin view via "Switch to Club View" button
- Stores selected club in localStorage for seamless transition
- Full club admin capabilities when viewing a specific club
- "Back to Admin" button in club view to return to admin panel
- Visual indicators showing "Super Admin" status when in club view

**Role System:**
- 5 roles: super_admin, club_admin, coach, parent, player
- Visual role badges with distinct colors
- Role hierarchy enforced in UI and database
- Protected routes with `ProtectedRoute` component
- Super admins can access all club admin features seamlessly

---

## Phase 4: Club Admin Dashboard (✅ Phase 4.1 Complete)

### Phase 4.1: Dashboard Foundation ✅

**Unified Layout System:**
- Professional sidebar layout matching admin portal
- Collapsible sidebar with navigation links
- Full-width responsive header with search, notifications, theme toggle
- User dropdown menu with sign out option
- Sign out button in sidebar footer
- Mobile-first responsive design (drawer on mobile)
- "Back to Admin" button for super admins viewing club

**Club Context Management:**
- `ClubProvider` context for managing selected club
- `useClubContext()` hook for accessing club data
- Multi-club support for users with multiple club admin roles
- Club selector dropdown (shows when user has 2+ clubs)
- Auto-selects first club on initial load
- Supports super admin viewing all clubs
- Uses localStorage for super admin club selection

**Dashboard Features:**
- Real-time statistics: teams, players, coaches, upcoming matches
- Color-coded stat cards with icons (blue, purple, green, orange)
- Upcoming matches section (next 7 days) with match details
- Recently added players section
- Empty states with call-to-action buttons
- "Add Player" quick action button
- Dynamic data based on selected club

**Role-Based Redirects:**
- `getRoleDashboardUrl()` utility for determining landing page
- Automatic redirect on login based on user role
- Home page auto-redirects authenticated users to their dashboard
- Role hierarchy: player < parent < coach < club_admin < super_admin
- Each role has specific landing page (/player, /parent, /coach, /club, /admin)

**Navigation Structure:**
- Dashboard - Overview and quick stats
- Teams - Team management
- Players - Player management
- Coaches - Coach management
- Matches - Match scheduling and results
- Payments - Financial management
- Settings - Club configuration

**Technical Implementation:**
- `src/app/club/layout.tsx` - Main layout with sidebar, header, club selector
- `src/app/club/page.tsx` - Server component wrapper
- `src/app/club/page-client.tsx` - Client component with dashboard logic
- `src/hooks/use-club-context.tsx` - Club context and provider
- `src/lib/auth/redirect.ts` - Role-based redirect logic
- `src/app/page.tsx` - Updated with auto-redirect for authenticated users
- `src/app/login/page.tsx` - Updated to redirect based on role

**Key Features:**
- Dashboard updates when switching between clubs
- Super admins see all clubs in selector
- Club admins see only their assigned clubs
- Proper loading and error states
- TypeScript types for all data structures
- Dark mode support throughout

---

### Phase 4.2: Team Management ✅

**Team CRUD Operations:**
- Full create, read, update, delete functionality
- Team list with stats (number of players per team)
- Team detail page with roster management
- Add/remove players from teams
- Native HTML table with gray header background
- Consistent design pattern across all management pages

**Technical Implementation:**
- `src/app/club/[clubId]/teams/page.tsx` - Teams list server component
- `src/app/club/[clubId]/teams/page-client.tsx` - Teams list client component
- `src/app/club/[clubId]/teams/create/page.tsx` - Create team form
- `src/app/club/[clubId]/teams/[id]/page-client.tsx` - Team detail with roster
- `src/app/club/[clubId]/teams/[id]/edit/page.tsx` - Edit team form
- `src/app/api/club/teams/route.ts` - Create team API
- `src/app/api/club/teams/[teamId]/route.ts` - Update/delete team API
- `src/app/api/club/teams/[teamId]/players/route.ts` - Add players to team
- `src/app/api/club/team-players/[teamPlayerId]/route.ts` - Remove player from team

**Design Consistency:**
- Full-width forms (no max-width constraints)
- Green focus states on all inputs
- Native HTML elements (input, select, textarea)
- Gray table headers with uppercase text
- Stat cards with colored icon badges
- Explicit color classes (no semantic tokens)

---

### Phase 4.3: Player Management ✅

**Player CRUD Operations:**
- Full create, read, update, delete (soft delete)
- Player list with search and filtering
- Comprehensive player profiles (personal, medical, emergency contact info)
- Parent/guardian relationships
- Team assignments
- Multi-step form with validation

**Technical Implementation:**
- `src/app/club/[clubId]/players/page.tsx` - Players list
- `src/app/club/[clubId]/players/create/page-client.tsx` - Multi-step create form
- `src/app/club/[clubId]/players/[playerId]/page-client.tsx` - Player detail
- `src/app/club/[clubId]/players/[playerId]/edit/page-client.tsx` - Edit form
- `src/app/api/club/players/route.ts` - Create player API
- `src/app/api/club/players/[playerId]/route.ts` - Update/delete player API

**Player Form Features:**
- 3-step wizard: Personal Info → Football Info → Emergency Contact
- Comprehensive fields: name, DOB, gender, position, dominant foot, jersey number
- Medical information: blood type, allergies, medical conditions
- Emergency contact details
- Form validation with Zod schemas
- Progress indicator

**Design Pattern:**
- Matches teams management design exactly
- Native HTML forms with explicit styling
- Green focus states throughout
- Consistent button and input styling

---

### Phase 4.4: CSV Import for Players ✅

**Bulk Player Import:**
- CSV file upload with drag & drop
- Template download option
- Preview and validation before import
- Field mapping interface
- Error handling and reporting
- Smart parent account handling (creates or links existing)

**Technical Implementation:**
- `src/app/club/[clubId]/players/import/page-client.tsx` - Import UI
- `src/app/api/club/players/import/route.ts` - Import processing
- CSV parsing with papaparse
- Validation before database insertion
- Transaction support for bulk operations

**CSV Template Fields:**
- first_name, last_name, date_of_birth, gender
- position, dominant_foot, jersey_number
- blood_type, allergies, medical_conditions
- emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
- parent_email, parent_name, parent_relationship (optional)

**Features:**
- Validates all required fields
- Checks for duplicate players (by name + DOB)
- Creates parent accounts if email provided
- Links existing parent accounts by email
- Atomic operations (all or nothing)
- Detailed error messages with row numbers

---

### Phase 4.6: Coach Management ✅

**Coach CRUD Operations:**
- Full create, read, update, delete functionality
- Coach list with credentials and team assignments
- Coach profiles with bio and specializations
- License information (UEFA Pro, A, B, C, Grassroots)
- Years of experience tracking
- Smart user account handling (creates or reuses existing)

**Technical Implementation:**
- `src/app/club/[clubId]/coaches/page.tsx` - Coaches list server component
- `src/app/club/[clubId]/coaches/page-client.tsx` - Coaches list client component
- `src/app/club/[clubId]/coaches/create/page.tsx` - Create coach wrapper
- `src/app/club/[clubId]/coaches/create/create-coach-form.tsx` - Create form
- `src/app/club/[clubId]/coaches/[coachId]/page.tsx` - Coach profile server component
- `src/app/club/[clubId]/coaches/[coachId]/page-client.tsx` - Coach profile client
- `src/app/club/[clubId]/coaches/[coachId]/edit/page.tsx` - Edit wrapper
- `src/app/club/[clubId]/coaches/[coachId]/edit/edit-coach-form.tsx` - Edit form
- `src/app/api/club/coaches/route.ts` - Create coach API
- `src/app/api/club/coaches/[coachId]/route.ts` - Update/delete coach API

**Coach Account Management:**
- Checks if user exists by email before creating
- Reuses existing accounts when email matches
- Creates new auth account with default password: `ClubifyCoach2025!`
- Auto-assigns coach role to user
- Email confirmed by default
- Updates user profile with name and phone

**Coach Form Features:**
- Two sections: Basic Information + Coaching Credentials
- Basic info: full name, email, phone, specialization
- Credentials: license type, license number, years of experience, bio
- Email cannot be changed after creation (shown as read-only on edit)
- Form validation with error messages
- Native HTML elements (input, select, textarea)

**Design Consistency:**
- Matches teams/players management design exactly
- Native HTML table with gray header background
- Stat cards with colored icon badges (blue, purple, green)
- Full-width forms with back button in header
- Green focus states and explicit color classes
- Right-aligned submit button only (no cancel in footer)
- Coach detail page with 2-column grid layout
- Team assignments section matching player assignments design

**Coach List Page:**
- Table columns: Name, Contact, License, Experience, Teams, Status, Actions
- Total coaches, Licensed coaches, Active coaches stat cards
- Color-coded role badges for team assignments
- Edit and delete actions per coach
- Soft delete (sets is_active = false)

**Coach Detail Page:**
- Header with title, subtitle, and action buttons
- Status badge (Active/Inactive)
- Contact Information card (name, email, phone, specialization)
- Coaching Credentials card (license type/number, experience, joined date)
- Biography section (if provided)
- Team Assignments section with role badges and dates
- Manage Teams button for assigning coaches to teams
- Consistent with team/player detail page design

**Coach Team Assignment:** ✅
- Assign teams page (`/club/[clubId]/coaches/[coachId]/assign-teams`)
- Modal UI for selecting team and coaching role
- 5 role types: head_coach, assistant_coach, goalkeeper_coach, fitness_coach, other
- Color-coded role badges (purple, blue, green, orange, gray)
- API endpoint POST `/api/club/coaches/[coachId]/teams` - Assign coach to team
- API endpoint DELETE `/api/club/team-coaches/[teamCoachId]` - Remove from team
- Smart handling: reactivates inactive assignments
- Soft delete with is_active flag and removed_at date
- Full validation: team and coach must belong to same club
- Team detail page shows coaching staff section with clickable coach names

---

## Phase 5: Coach Portal - Training Management (✅ Complete)

### 5.2.1 Training Calendar with Recurring Sessions ✅

**Google Calendar-Style Interface:**
- Three view modes: Day, Week, Month
- Navigation controls: ← Today → buttons
- Date range display (e.g., "Nov 25 - Dec 1, 2024")
- View toggle buttons with active state highlighting
- Color-coded sessions by team (8-color palette)

**Calendar Components:**
- `src/components/coach/TrainingCalendar.tsx` - Main calendar wrapper with view switching
- `src/components/coach/DayView.tsx` - Hour-by-hour single day schedule (7 AM - 9 PM)
- `src/components/coach/WeekView.tsx` - 7-column weekly grid with time slots
- `src/components/coach/MonthView.tsx` - Traditional month calendar with event badges

**Recurring Training Sessions:**
- Create recurring patterns: select days of week (Mon/Wed/Fri, etc.)
- Set time, duration, location, and generate-until date
- Database: `training_recurrences` table stores one record per day of week
- Auto-generates `training_sessions` from pattern
- Each session links to pattern via `recurrence_id`

**Session Management:**
- **Session Detail Modal**: Click session → view full details with Edit/Delete buttons
- **Delete Options**:
  - Delete only this session (single mode)
  - Delete all future sessions in pattern (all_future mode)
- **Visual Distinction**: Recurring sessions have subtle ring border
- API endpoint: DELETE `/api/coach/training/[sessionId]` with `delete_mode` parameter

**Timezone Handling:**
- Manual date formatting to avoid `.toISOString()` timezone conversion
- All dates reset to `00:00:00.000` with `setHours(0, 0, 0, 0)`
- Consistent date format: `YYYY-MM-DD` across calendar views
- Fixed in: MonthView, WeekView, DayView, TrainingCalendar, recurring API

**Delete Logic:**
- Single mode: Deletes only the selected session
- All future mode:
  1. Finds all recurrence patterns with same team/time/duration/location
  2. Deletes all those patterns (e.g., Mon/Wed/Fri group)
  3. Deletes all future sessions linked to those patterns

**Key Technical Details:**
- `is_override` column tracks manually edited sessions
- Recurring sessions show ↻ icon in calendar
- Delete modal shows radio buttons for recurring sessions only
- Database migration: `20251028000000_add_is_override_to_training_sessions.sql`

**API Endpoints:**
- POST `/api/coach/training/recurring` - Create recurring pattern + generate sessions
- DELETE `/api/coach/training/[sessionId]` - Delete with single/all_future modes
- PATCH `/api/coach/training/[sessionId]` - Update single session

**Future Enhancements (TODO):**
- Edit modal with "single vs all future" options
- Recurring patterns management page
- Match integration with different visual styling

---

## Phase 5: Coach Portal - Attendance Tracking (✅ Complete)

### 5.3 Attendance Tracking ✅

**Mark Attendance Feature:**
- Attendance modal accessible from Session Detail Modal or list view action button
- Team roster table with all players (jersey number, name)
- 5 status options: Present, Absent, Late, Excused, Injured
- Arrival time field (enabled only for "Late" status)
- Optional notes per player
- Upsert logic (updates existing records, creates new ones)
- Custom success toast notification (no native alerts)

**Attendance Overview Page** (`/coach/attendance`):
- Statistics cards: Total Sessions, Avg Attendance, Perfect Attendance (100%), Low Attendance (<75%)
- Filters: Team dropdown (all/specific), Date range (from/to)
- Player statistics table with attendance breakdown
- Color-coded percentage badges:
  - Green ≥90% (Excellent)
  - Yellow 75-89% (Good)
  - Orange 60-74% (Fair)
  - Red <60% (Poor)
- Real-time filtering and data fetching

**API Endpoints:**
- POST `/api/coach/training/[sessionId]/attendance` - Save/update attendance for session
- GET `/api/coach/training/[sessionId]/attendance` - Get attendance for session with team roster
- GET `/api/coach/attendance/statistics` - Get attendance statistics with team/date filters

**Dashboard Integration:**
- Fixed coach dashboard attendance calculation
- Now includes both "present" and "late" statuses
- Shows last 30 days attendance percentage
- Matches Attendance page calculation formula

**Technical Details:**
- Attendance percentage formula: `(present + late) / total * 100`
- Permission validation: super_admin, club_admin, or assigned coach only
- Upsert with conflict resolution on `(training_session_id, player_id)`
- Dark mode support throughout

**Components Created:**
- `/src/app/coach/attendance/page.tsx` - Server component
- `/src/app/coach/attendance/page-client.tsx` - Client component with UI
- `/src/app/api/coach/training/[sessionId]/attendance/route.ts` - Mark attendance API
- `/src/app/api/coach/attendance/statistics/route.ts` - Statistics API

---

**This workflow ensures we build Clubify.mk incrementally, with confidence, and with high quality.**

🚀 **Let's build something great!**
- Add to memory. After each phase is finished update the TODO.md