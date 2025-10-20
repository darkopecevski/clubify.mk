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

**This workflow ensures we build Clubify.mk incrementally, with confidence, and with high quality.**

🚀 **Let's build something great!**
