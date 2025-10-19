# Feature Specifications
## Clubify.mk

### Version 1.0
**Last Updated:** 2025-10-18

---

## Table of Contents
1. [Club Management](#1-club-management)
2. [Team Management](#2-team-management)
3. [Player Management](#3-player-management)
4. [Coach Management](#4-coach-management)
5. [Training Session Management](#5-training-session-management)
6. [Match Management](#6-match-management)
7. [Subscription & Payment Management](#7-subscription--payment-management)
8. [Notifications System](#8-notifications-system)
9. [Public Homepage](#9-public-homepage)
10. [User Authentication & Profiles](#10-user-authentication--profiles)

---

## 1. Club Management

### 1.1 Club Creation (Super Admin)

**User Story:**
As a super admin, I want to create new clubs in the system so that they can start using the platform.

**Acceptance Criteria:**
- Super admin can create a new club with the following information:
  - Club name (required)
  - Club logo/badge (optional)
  - Club description (optional)
  - Contact email (required)
  - Contact phone (optional)
  - Address (optional)
  - Website URL (optional)
  - Social media links (optional)
- Upon creation, club is assigned a unique identifier
- Club status defaults to "Active"
- Confirmation message shown upon successful creation

**UI Components:**
- Club creation form
- Logo upload with image preview
- Form validation

---

### 1.2 Club Administrator Assignment

**User Story:**
As a super admin, I want to assign administrators to clubs so that they can manage their club independently.

**Acceptance Criteria:**
- Super admin can create club admin account with:
  - Full name (required)
  - Email (required, unique)
  - Phone (optional)
  - Temporary password (auto-generated)
- Super admin can assign admin to specific club
- Club admin receives welcome email with login credentials
- Club admin must change password on first login
- Multiple admins can be assigned to one club
- Super admin can remove club admin access

**UI Components:**
- Admin creation form
- Club selection dropdown
- Admin list view per club
- Assign/Remove actions

---

### 1.3 Club Profile Management (Club Admin)

**User Story:**
As a club admin, I want to manage my club's profile information so that it's up-to-date and accurate.

**Acceptance Criteria:**
- Club admin can update:
  - Club description
  - Contact information
  - Logo/badge
  - Social media links
  - Address
- Changes reflected immediately on public homepage
- Image uploads validated (format, size)
- Success/error messages displayed
- Audit log of profile changes maintained

**UI Components:**
- Club profile edit form
- Image upload with crop/resize
- Preview mode before publishing
- Save/Cancel actions

---

## 2. Team Management

### 2.1 Team Creation

**User Story:**
As a club admin, I want to create teams for different age groups so that I can organize players appropriately.

**Acceptance Criteria:**
- Club admin can create team with:
  - Team name (required, e.g., "U10", "U12")
  - Age group (required)
  - Season/year (required)
  - Team description (optional)
  - Team photo (optional)
- Default status: "Active"
- Team assigned unique identifier within club
- Success confirmation displayed

**UI Components:**
- Team creation form
- Age group selector (predefined list: U6, U8, U10, U12, U14, U16, U18, U20)
- Season selector (current + past 2 years, future 1 year)

---

### 2.2 Team Activation/Deactivation

**User Story:**
As a club admin, I want to deactivate teams that are no longer active so that the system stays organized without losing historical data.

**Acceptance Criteria:**
- Club admin can deactivate any team
- Deactivated teams:
  - Not shown in active team lists
  - Accessible via "Archived Teams" section
  - Retain all historical data (players, matches, training sessions)
  - Cannot have new training sessions or matches added
- Club admin can reactivate deactivated teams
- Confirmation dialog before deactivation
- Reason for deactivation captured (optional)

**UI Components:**
- Activate/Deactivate toggle
- Archived teams view
- Confirmation dialog
- Status badge (Active/Inactive)

---

### 2.3 Coach Assignment to Team

**User Story:**
As a club admin, I want to assign coaches to teams so that they can manage their designated teams.

**Acceptance Criteria:**
- Club admin can assign one or more coaches to a team
- Coach can be assigned to multiple teams
- Assigned coach immediately gets access to team management
- Coach receives notification of assignment
- Club admin can remove coach from team
- Team history shows coach assignment timeline

**UI Components:**
- Coach selector (dropdown/search)
- Multi-select for multiple coaches
- Assigned coaches list per team
- Remove action per coach

---

## 3. Player Management

### 3.1 Player Profile Creation (Manual)

**User Story:**
As a club admin, I want to create player profiles so that I can add new players to the club.

**Acceptance Criteria:**
- Club admin can create player with:
  - **Personal Information:**
    - Full name (required)
    - Birthdate (required)
    - Gender (required)
    - Photo (optional)
    - Nationality (optional)
  - **Football Information:**
    - Position (required: Goalkeeper, Defender, Midfielder, Forward)
    - Dominant foot (required: Left, Right, Both)
    - Jersey number (optional)
    - Height (optional)
    - Weight (optional)
  - **Contact Information:**
    - Address (optional)
    - Emergency contact name (required)
    - Emergency contact phone (required)
    - Emergency contact relationship (required)
  - **Medical Information:**
    - Medical conditions (optional, text area)
    - Allergies (optional, text area)
    - Blood type (optional)
    - Medications (optional, text area)
    - Doctor name and contact (optional)
  - **Parent/Guardian Information:**
    - Parent name (required)
    - Parent email (required, for account creation)
    - Parent phone (required)
- Upon creation:
  - Player assigned unique ID
  - Parent account created automatically (if doesn't exist)
  - Parent receives welcome email with login credentials
  - Player login credentials generated
- Form validation for required fields
- Success confirmation with player ID

**UI Components:**
- Multi-step player creation form (sections: Personal, Football, Contact, Medical, Parent)
- Date picker for birthdate
- Position selector with icons
- Photo upload with preview
- Parent account linking (if parent already exists)

---

### 3.2 Player Profile Creation (CSV Import)

**User Story:**
As a club admin, I want to bulk import players from a CSV file so that I can quickly onboard multiple players.

**Acceptance Criteria:**
- Club admin can download CSV template
- Template includes all required and optional fields
- Club admin uploads filled CSV file
- System validates CSV:
  - Correct format
  - Required fields present
  - Valid data types
  - Duplicate detection
- Validation errors shown with row numbers
- Club admin reviews import preview
- Upon confirmation:
  - All valid players created
  - Parent accounts created/linked
  - Welcome emails sent
- Import summary displayed (success count, error count)
- Failed rows downloadable for correction

**CSV Template Fields:**
```
player_first_name,player_last_name,birthdate,gender,position,dominant_foot,jersey_number,
emergency_contact_name,emergency_contact_phone,emergency_contact_relationship,
medical_conditions,allergies,parent_name,parent_email,parent_phone
```

**UI Components:**
- CSV upload area (drag & drop)
- Template download button
- Validation results table
- Import preview table
- Confirm/Cancel import
- Import summary modal

---

### 3.3 Player Profile Update

**User Story:**
As a parent or club admin, I want to update player information so that it remains current.

**Acceptance Criteria:**
- **Club Admin:** Can update all player fields
- **Parent:** Can update:
  - Personal information
  - Medical information
  - Emergency contacts
  - Parent/guardian information
- **Parent cannot update:**
  - Football-specific info (position, foot, jersey number)
  - Team assignments
- Changes saved immediately
- Audit log maintained for sensitive field changes (medical info)
- Success confirmation displayed

**UI Components:**
- Player profile edit form (same as creation, pre-filled)
- Field-level permissions based on role
- Save/Cancel buttons
- Last updated timestamp display

---

### 3.4 Player Team Assignment

**User Story:**
As a club admin, I want to assign players to teams so that they can participate in training and matches.

**Acceptance Criteria:**
- Club admin can assign player to one or more teams
- Player can be assigned to teams in same or older age groups
- No restrictions on number of teams (for now)
- Upon assignment:
  - Player appears in team roster
  - Player can see team in their profile
  - Parent notified of team assignment
  - Coach of team notified
- Club admin can remove player from team
- Team assignment history maintained

**UI Components:**
- Team selector (multi-select)
- Current teams list for player
- Add/Remove team actions
- Confirmation dialog for removal

---

### 3.5 Player Profile Viewing

**User Story:**
As a player or parent, I want to view the player profile so that I can see all relevant information.

**Acceptance Criteria:**
- Player/Parent can view:
  - Personal information
  - Football information (position, stats)
  - Team assignments
  - Training schedule
  - Match schedule
  - Attendance history
  - Match statistics
  - Payment status (parent only)
- Profile organized in clear sections
- Responsive layout for mobile
- Print-friendly view available

**UI Components:**
- Player profile dashboard
- Tabbed sections or accordion layout
- Stat cards (goals, assists, attendance %)
- Upcoming events timeline

---

## 4. Coach Management

### 4.1 Coach Account Creation

**User Story:**
As a club admin, I want to create coach accounts so that coaches can manage their teams.

**Acceptance Criteria:**
- Club admin can create coach with:
  - Full name (required)
  - Email (required, unique)
  - Phone (optional)
  - Coaching license/certifications (optional)
  - Photo (optional)
  - Bio/description (optional)
- Coach account created with temporary password
- Coach receives welcome email with credentials
- Coach must change password on first login
- Success confirmation displayed

**UI Components:**
- Coach creation form
- License/certification input (multi-add)
- Photo upload
- Email validation

---

### 4.2 Coach Profile Management

**User Story:**
As a coach, I want to manage my profile information so that it's up-to-date.

**Acceptance Criteria:**
- Coach can update:
  - Contact information
  - Photo
  - Bio/description
  - Certifications
- Cannot change email (admin function)
- Changes saved immediately
- Success confirmation

**UI Components:**
- Profile edit form
- Photo upload with preview
- Save/Cancel actions

---

## 5. Training Session Management

### 5.1 Recurring Training Session Creation

**User Story:**
As a coach, I want to create recurring training sessions for my team so that players know when to attend.

**Acceptance Criteria:**
- Coach can create recurring training with:
  - Team (required, from assigned teams)
  - Day(s) of week (required, multi-select)
  - Start time (required)
  - Duration (required, in minutes)
  - Location/venue (required)
  - Recurrence start date (required)
  - Recurrence end date (optional, defaults to end of season)
  - Notes/description (optional)
- System generates individual training session instances
- Sessions appear in team calendar
- Players and parents notified of new training schedule
- Coach can edit recurrence pattern
- Success confirmation displayed

**UI Components:**
- Training session form
- Day of week multi-selector (checkboxes)
- Time picker
- Duration input (with common presets: 60, 90, 120 min)
- Location input with saved locations dropdown
- Date range picker
- Recurrence preview (next 5 sessions)

---

### 5.2 Training Session Cancellation

**User Story:**
As a coach, I want to cancel a training session so that players know not to attend.

**Acceptance Criteria:**
- Coach can cancel individual training session instance
- Cancellation requires reason (optional text)
- Upon cancellation:
  - Session marked as "Cancelled" (not deleted)
  - All team players and parents notified immediately
  - Session shown in calendar with cancelled status
- Coach can undo cancellation (before session time)
- Cancelled sessions remain in history

**UI Components:**
- Cancel button on session detail
- Cancellation reason modal
- Confirmation dialog
- Cancelled badge on calendar

---

### 5.3 Training Session Rescheduling

**User Story:**
As a coach, I want to reschedule a training session so that players know the new time/location.

**Acceptance Criteria:**
- Coach can reschedule individual training session
- Can change:
  - Date
  - Time
  - Location
- Cannot change team
- Upon rescheduling:
  - Session updated with new details
  - All team players and parents notified
  - Original date/time stored in history
- Rescheduling reason captured (optional)
- Success confirmation

**UI Components:**
- Reschedule button on session detail
- Edit session modal
- Date/time pickers
- Reason text area
- Notification preview

---

### 5.4 Attendance Tracking

**User Story:**
As a coach, I want to track player attendance at training sessions so that I can monitor participation.

**Acceptance Criteria:**
- Coach can mark attendance for each player:
  - Present
  - Absent
  - Excused absence
  - Late (optional)
- Attendance can be marked:
  - Before session (planned)
  - During session
  - After session (within 24 hours)
- Bulk actions available (mark all present)
- Notes per player per session (optional)
- Attendance history viewable:
  - Per player (attendance %)
  - Per team (session attendance)
- Parents can view their child's attendance
- Success confirmation after saving

**UI Components:**
- Attendance sheet (roster with checkboxes)
- Quick actions (mark all, mark none)
- Status indicators (present, absent, excused, late)
- Notes input per player
- Save button (auto-save optional)
- Attendance summary stats

---

## 6. Match Management

### 6.1 Match Creation

**User Story:**
As a coach, I want to create a match for my team so that players know when and where to play.

**Acceptance Criteria:**
- Coach can create match with:
  - Team (required, from assigned teams)
  - Opponent team name (required, free text)
  - Date and time (required)
  - Venue/location (required)
  - Match type (required: Friendly, League, Tournament)
  - Competition name (required if type is Tournament)
  - Home/Away (required)
  - Notes/instructions (optional)
- Upon creation:
  - Match appears in team calendar
  - Players and parents notified
  - Match status: "Scheduled"
- Success confirmation displayed

**UI Components:**
- Match creation form
- Date/time picker
- Opponent input (free text, with autocomplete from previous opponents)
- Match type selector
- Home/Away toggle
- Location input with saved venues

---

### 6.2 Squad Selection

**User Story:**
As a coach, I want to select the squad for a match so that players know if they're included.

**Acceptance Criteria:**
- Coach can select squad (all players for match) from team roster
- Coach can designate starting 11 from squad
- Squad must have minimum 11 players
- Starting lineup must be exactly 11 players
- Players assigned positions on field (formation)
- Players not in squad marked as "Not selected"
- Upon saving:
  - Squad players notified (positive message)
  - Non-squad players notified (encouraging message to parents only)
- Coach can update squad until match time
- Squad history viewable (who was selected when)

**UI Components:**
- Player list with select checkboxes
- Drag-and-drop formation builder for starting 11
- Squad summary (count, positions)
- Formation selector (4-4-2, 4-3-3, etc.)
- Save/Update button

---

### 6.3 Match Result Recording

**User Story:**
As a coach, I want to record match results and player statistics so that we have a record of performance.

**Acceptance Criteria:**
- Coach can record:
  - **Final score:**
    - Own team score (required)
    - Opponent score (required)
    - Result (auto-calculated: Win/Loss/Draw)
  - **Player statistics** (for each squad player):
    - Goals scored (number)
    - Assists (number)
    - Yellow cards (number)
    - Red cards (number)
    - Minutes played (number)
    - Player rating (optional, 1-10)
  - **Match notes:**
    - Summary/report (optional, text area)
    - MVP (optional, select player)
- Can be saved as draft and completed later
- Upon publishing:
  - Match status: "Completed"
  - Result visible to players and parents
  - Statistics added to player profiles
- Match report can be edited (within 48 hours)
- Audit log of changes maintained

**UI Components:**
- Score input (two number fields)
- Player statistics table (roster with stat columns)
- Quick add buttons (+1 goal, +1 assist)
- Match notes editor
- Save draft / Publish buttons
- Match summary view

---

### 6.4 Match Viewing

**User Story:**
As a player/parent, I want to view match details so that I know when and where to be.

**Acceptance Criteria:**
- Players/parents can view:
  - Match date, time, location
  - Opponent
  - Squad list (if selected)
  - Starting lineup (if published)
  - Match result (if completed)
  - Individual player stats (own child only for parents)
- Can add match to personal calendar (iCal export)
- Can get directions to venue (map link)
- Can see team lineup visually (formation)

**UI Components:**
- Match detail card
- Squad list with badges (starter/substitute)
- Formation visualization
- Score display (if completed)
- Calendar export button
- Map/directions button

---

## 7. Subscription & Payment Management

### 7.1 Subscription Fee Setup

**User Story:**
As a club admin, I want to set monthly subscription fees per team so that parents know what to pay.

**Acceptance Criteria:**
- Club admin can set fee per team:
  - Monthly amount (required)
  - Currency (default: MKD - Macedonian Denar)
  - Effective date (required)
  - Description/notes (optional)
- Fee changes create new fee record (history maintained)
- Players assigned to team automatically inherit fee
- Parents notified of fee changes
- Success confirmation

**UI Components:**
- Fee input per team
- Fee history table
- Effective date picker
- Notification preview

---

### 7.2 Discount Management

**User Story:**
As a club admin, I want to apply discounts to player subscriptions so that I can offer reduced fees when appropriate.

**Acceptance Criteria:**
- Club admin can create discount:
  - Discount type (Percentage / Fixed amount)
  - Discount value (number)
  - Reason (required: Sibling, Financial hardship, Merit, Other)
  - Custom reason text (if Other selected)
  - Effective date (required)
  - End date (optional)
- Discount applied to specific player
- Discounted amount calculated and displayed
- Parent notified of discount
- Discount can be removed
- Discount history maintained per player

**UI Components:**
- Discount creation modal
- Type selector (%, fixed)
- Reason dropdown
- Amount input
- Date range picker
- Active discounts list per player

---

### 7.3 Payment Tracking

**User Story:**
As a club admin, I want to track which players have paid their monthly subscriptions so that I know who is current.

**Acceptance Criteria:**
- System auto-generates payment record for each player each month
- Payment record includes:
  - Player
  - Month/Year
  - Amount due (fee - discount)
  - Status (Unpaid / Paid / Overdue)
  - Payment date (when marked paid)
  - Payment method (Cash, Bank transfer, Other)
  - Notes (optional)
- Club admin can:
  - Mark payment as paid
  - Record payment date and method
  - Add payment notes
  - View payment history per player
  - View overdue payments report
- Payment status auto-updates:
  - Unpaid → Overdue (after 5 days past due date)
- Parent can view payment status (own children only)

**UI Components:**
- Payment list view (filterable by status, team, month)
- Mark as paid action
- Payment detail modal
- Payment history per player
- Overdue payments dashboard widget

---

### 7.4 Payment Reminders

**User Story:**
As a parent, I want to receive payment reminders so that I don't forget to pay.

**Acceptance Criteria:**
- System sends automated payment reminders:
  - 3 days before due date (reminder)
  - On due date (due today)
  - 3 days after due date (overdue)
  - 7 days after due date (urgent)
- Reminders sent via:
  - In-app notification
  - Email
- Reminder includes:
  - Amount due
  - Due date
  - Player name
  - Payment instructions
- Parent can view all payment reminders history
- Club admin can manually send reminder

**UI Components:**
- Notification center (in-app)
- Email template
- Payment reminder list (admin view)
- Send reminder button (admin)

---

## 8. Notifications System

### 8.1 Notification Types

**System generates notifications for:**

| Event | Recipients | Priority | Delivery |
|-------|-----------|----------|----------|
| New training session created | Players, Parents of team | Low | In-app, Email |
| Training session cancelled | Players, Parents of team | High | In-app, Email, (SMS future) |
| Training session rescheduled | Players, Parents of team | High | In-app, Email |
| Match created | Players, Parents of team | Medium | In-app, Email |
| Squad selected | Selected players, Parents | Medium | In-app, Email |
| Match result published | Players, Parents of team | Low | In-app |
| Payment reminder | Parent | Medium | In-app, Email |
| Payment overdue | Parent | High | In-app, Email |
| Club announcement | All club members | Low-High | In-app, Email |
| Player assigned to team | Player, Parent, Coach | Medium | In-app, Email |
| Coach assigned to team | Coach, Team players | Low | In-app |

---

### 8.2 Notification Preferences

**User Story:**
As a user, I want to control which notifications I receive so that I'm not overwhelmed.

**Acceptance Criteria:**
- Users can set preferences per notification type:
  - In-app: On/Off
  - Email: On/Off
  - SMS: On/Off (future)
- Default preferences set based on role
- Parents can set separate preferences per child
- Critical notifications cannot be disabled (payment overdue, training cancelled)
- Preferences saved per user
- Success confirmation

**UI Components:**
- Notification preferences page
- Toggle switches per notification type
- Grouped by category
- Save button

---

### 8.3 Notification Center

**User Story:**
As a user, I want to see all my notifications in one place so that I don't miss anything.

**Acceptance Criteria:**
- Notification center shows:
  - All notifications (paginated)
  - Unread count badge
  - Filter by type, date, priority
  - Mark as read/unread
  - Delete notification
- Notifications sorted by date (newest first)
- Visual indicators:
  - Unread (bold, blue dot)
  - Priority (icon/color)
- Click notification to view detail
- Auto-mark as read on view

**UI Components:**
- Notification dropdown (header)
- Notification center page
- Filter/sort controls
- Notification list items
- Mark read/delete actions

---

## 9. Public Homepage

### 9.1 Club Homepage Content

**User Story:**
As a website visitor, I want to view a club's public page so that I can learn about the club.

**Sections displayed:**

#### 9.1.1 Hero Section
- Club logo
- Club name
- Tagline/motto
- Hero image/banner

#### 9.1.2 About Section
- Club description
- Mission/values
- History
- Contact information (public)

#### 9.1.3 Teams Section
- List of active teams
- Team name, age group
- Team photo
- Brief description
- Number of players (count only, no names)

#### 9.1.4 News & Announcements
- Recent announcements (last 5)
- Title, excerpt, date
- Read more link
- Searchable archive

#### 9.1.5 Photo Gallery
- Recent photos
- Albums/categories
- Lightbox view
- No player names (privacy)

#### 9.1.6 Contact Section
- Contact form (name, email, message)
- Social media links
- Phone/email (public only)
- Map/address (if public)

**Privacy:**
- No player names or photos identifiable to individuals
- No training times/locations
- No detailed schedules
- No contact info for minors

**UI Components:**
- Responsive public website
- Modern, clean design
- Mobile-friendly
- SEO optimized

---

### 9.2 Content Management

**User Story:**
As a club admin, I want to manage the public homepage content so that it stays current.

**Acceptance Criteria:**
- Club admin can edit all homepage sections
- WYSIWYG editor for text content
- Image upload with preview
- Publish/unpublish content
- Preview before publishing
- Version history (optional)
- Changes go live immediately upon publish

**UI Components:**
- Homepage editor dashboard
- Section editors (modals or inline)
- Image gallery manager
- Publish/preview buttons

---

### 9.3 News & Announcements

**User Story:**
As a club admin, I want to publish news and announcements so that I can communicate with the community.

**Acceptance Criteria:**
- Club admin can create announcement:
  - Title (required)
  - Content (required, rich text)
  - Featured image (optional)
  - Publish date (required)
  - Visibility (Public, Members only)
  - Target audience (All, Specific teams)
- Announcements can be:
  - Published immediately
  - Scheduled for future publish
  - Saved as draft
- Published announcements:
  - Appear on homepage
  - Trigger notifications (if members-only)
  - Archived after 30 days (still accessible)
- Can edit/delete announcements

**UI Components:**
- Announcement creation form
- Rich text editor
- Image upload
- Visibility toggle
- Audience selector
- Publish/schedule/draft actions

---

## 10. User Authentication & Profiles

### 10.1 User Registration

**Note:** Users are NOT self-registered; they are created by admins.

- Super admin creates club admins
- Club admin creates coaches, players, parents
- Each user receives welcome email with credentials

---

### 10.2 User Login

**User Story:**
As a user, I want to log in to access my account.

**Acceptance Criteria:**
- Login with email and password
- Remember me option (30-day session)
- Forgot password link
- Account lockout after 5 failed attempts (15 min)
- Redirect to appropriate dashboard based on role
- Login activity logged (security)

**UI Components:**
- Login form
- Remember me checkbox
- Forgot password link
- Error messages
- Loading state

---

### 10.3 Password Reset

**User Story:**
As a user, I want to reset my password if I forget it.

**Acceptance Criteria:**
- User enters email address
- System sends password reset link (if email exists)
- Reset link valid for 24 hours
- User creates new password
- Password requirements enforced:
  - Minimum 8 characters
  - At least one uppercase, lowercase, number
- Password changed confirmation
- User logged out of all sessions
- Success confirmation, redirect to login

**UI Components:**
- Forgot password form
- Reset password form
- Password strength indicator
- Success message

---

### 10.4 User Profile Management

**User Story:**
As a user, I want to manage my profile information.

**Acceptance Criteria:**
- User can update:
  - Name
  - Phone
  - Photo
  - Password
- Cannot change email (admin function)
- Password change requires current password
- Changes saved immediately
- Success confirmation

**UI Components:**
- Profile edit form
- Photo upload
- Change password section
- Save button

---

### 10.5 Dashboard (Role-based)

**User Story:**
As a user, I want to see a dashboard relevant to my role when I log in.

#### Super Admin Dashboard:
- Total clubs count
- Active clubs
- Total users
- Recent activity log
- Quick actions (create club, create admin)

#### Club Admin Dashboard:
- Club overview (teams, players, coaches count)
- Recent announcements
- Payment status summary (paid, unpaid, overdue)
- Upcoming matches
- Quick actions (create player, create team, publish announcement)

#### Coach Dashboard:
- My teams
- Upcoming training sessions
- Upcoming matches
- Recent attendance summary
- Quick actions (mark attendance, create match)

#### Parent Dashboard:
- My children (player cards)
- Upcoming events (training, matches)
- Payment status
- Recent notifications
- Quick actions (view player, pay subscription)

#### Player Dashboard:
- My profile summary
- My teams
- Upcoming events
- My stats (goals, assists, attendance)
- Recent match results

**UI Components:**
- Role-specific dashboard layouts
- Widget cards
- Quick action buttons
- Activity timeline
- Stats visualizations

---

## Summary

This document outlines the detailed feature specifications for Clubify.mk version 1.0. Each feature includes user stories, acceptance criteria, and UI component descriptions to guide development and design.

**Next Steps:**
1. Review and approve feature specifications
2. Create technical specifications (architecture, data models, APIs)
3. Design UI/UX mockups
4. Develop implementation plan and sprint breakdown

---
