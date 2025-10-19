# Product Requirements Document (PRD)
## Clubify.mk - Youth Football Club Management System

### Version 1.0
**Last Updated:** 2025-10-18

---

## 1. Executive Summary

Clubify.mk is a comprehensive management system designed specifically for youth football clubs in Macedonia. The platform enables clubs to manage their teams, players, coaches, training sessions, matches, and subscriptions through an intuitive web-based interface.

### 1.1 Vision
To provide Macedonian youth football clubs with a modern, easy-to-use platform that streamlines administrative tasks, improves communication between clubs and parents, and enhances the overall youth football experience.

### 1.2 Target Audience
- Youth football clubs in Macedonia (child league)
- Club administrators
- Coaches
- Parents
- Young players

---

## 2. Core Objectives

1. **Easy Club Onboarding** - Streamlined process for new clubs to join the platform
2. **Multi-Role Access** - Support for different user types with appropriate permissions
3. **Public Presence** - Each club has its own public homepage
4. **Team Management** - Flexible team organization by age groups
5. **Player Management** - Comprehensive player profiles and multi-team assignments
6. **Training Coordination** - Recurring training sessions with attendance tracking
7. **Match Management** - Match scheduling, squad selection, and result tracking
8. **Subscription Tracking** - Monthly payment management with status tracking
9. **Communication** - Notifications for stakeholders (parents, coaches, players)

---

## 3. User Roles & Capabilities

### 3.1 Super Admin
- Creates and manages clubs in the system
- Assigns club administrators
- Has oversight of the entire platform

### 3.2 Club Administrator
- Manages club information and settings
- Creates and manages teams
- Creates player profiles (with CSV import support)
- Assigns coaches to teams
- Defines subscription fees per team
- Manages payment tracking
- Publishes news and announcements
- Manages club public homepage content
- Manages photo galleries

### 3.3 Coach
- Manages teams they are assigned to
- Defines and manages training sessions for their teams
- Tracks attendance at training sessions
- Creates and manages matches
- Selects squad and starting lineup for matches
- Records match results (scores, goals, assists)
- Can cancel/reschedule training sessions

### 3.4 Parent
- Views player profile(s) of their child/children
- Updates player information
- Receives notifications (matches, payments, announcements)
- Can access multiple player profiles (for multiple children)
- Can view children across different clubs

### 3.5 Player
- Views their own profile
- Views team information
- Views training schedule
- Views match schedule

---

## 4. Core Features

### 4.1 Club Management

#### 4.1.1 Club Onboarding
- Super admin creates new club
- Club information setup (name, logo, contact details, description)
- Assignment of initial club administrator(s)
- Public homepage setup

#### 4.1.2 Club Public Homepage
**Public Information Displayed:**
- Club details and description
- List of teams (by age group)
- News and announcements
- Photo galleries and media
- Contact form for inquiries/join requests

**Privacy Considerations:**
- No player personal details exposed
- No exact training locations/times that could pose safety risks
- Only club-level and team-level information

### 4.2 Team Management

#### 4.2.1 Team Organization
- Teams organized by age groups
- Each team has:
  - Name (e.g., "U10", "U12", etc.)
  - Age group designation
  - Assigned coaches
  - Roster of players
  - Subscription fee (monthly)
  - Training schedule
  - Match schedule

#### 4.2.2 Team Lifecycle
- Teams can be activated/deactivated
- Historical data preserved when teams are deactivated
- Useful for season transitions

### 4.3 Player Management

#### 4.3.1 Player Profile Creation
- Club administrator creates player profiles
- CSV import support for bulk player creation
- Parent credentials generated upon creation

#### 4.3.2 Player Information
**Required Information:**
- Full name
- Birthdate
- Position (goalkeeper, defender, midfielder, forward)
- Dominant foot (left/right)
- Jersey number
- Medical information
- Emergency contacts
- Parent/guardian information

**Optional Information:**
- Photo
- Height/weight
- Additional notes

#### 4.3.3 Multi-Team Assignment
- Players can be assigned to multiple teams
- Common scenario: player plays in their age group and older age group
- No restrictions on age difference (for now)

#### 4.3.4 Player Access
- Each player has their own login credentials
- Can view their profile, teams, training schedule, match schedule

### 4.4 Coach Management

#### 4.4.1 Coach Assignment
- Club administrators define coaches
- Coaches can be assigned to one or multiple teams
- Coaches have management access to their assigned teams only

### 4.5 Training Session Management

#### 4.5.1 Recurring Training Sessions
- Coaches define recurring training schedule per team
- Training session details:
  - Day(s) of week
  - Time
  - Duration
  - Location
  - Recurrence pattern

#### 4.5.2 Attendance Tracking
- Coaches mark player attendance at each session
- Historical attendance records maintained
- Attendance visible to parents

#### 4.5.3 Schedule Management
- Training sessions can be cancelled
- Training sessions can be rescheduled
- Notifications sent when changes occur

#### 4.5.4 Notifications
- Parents notified of upcoming training sessions
- Notifications for cancellations/rescheduling
- Reminder notifications

### 4.6 Match Management

#### 4.6.1 Match Creation
- Coaches create matches for their teams
- Match information:
  - Date and time
  - Location/venue
  - Opponent club/team name
  - Match type (friendly, league, tournament/competition)
  - Tournament/competition name (if applicable)

#### 4.6.2 Squad Selection
- Coaches select squad (all players for the match)
- Coaches designate starting lineup (11 players)
- Squad and lineup can be updated before match

#### 4.6.3 Match Results
- Record final score
- Record individual player statistics:
  - Goals scored
  - Assists
  - Cards (yellow/red) - optional
  - Other statistics as needed

#### 4.6.4 Match Visibility
- Parents can view upcoming matches
- Parents can view match results and player statistics
- Public homepage shows upcoming matches (team level)

### 4.7 Subscription & Payment Management

#### 4.7.1 Subscription Setup
- Club administrators set monthly subscription fee per team
- Fees can vary by team/age group
- Discount support:
  - Sibling discounts
  - Financial hardship considerations
  - Custom discount reasons

#### 4.7.2 Payment Tracking
- Track payment status per player per month:
  - Paid
  - Unpaid
  - Overdue
- Payment history maintained
- **Note:** Initial version is tracking-only (manual payment processing)
- Future: In-app payment processing

#### 4.7.3 Payment Notifications
- Parents receive payment reminders
- Overdue payment notifications
- Payment confirmation (when marked as paid)

### 4.8 Notifications System

#### 4.8.1 Notification Types
- **Training-related:**
  - Upcoming training reminders
  - Training cancellations
  - Training rescheduling

- **Match-related:**
  - Upcoming match notifications
  - Squad selection announcements
  - Match result updates

- **Payment-related:**
  - Monthly payment reminders
  - Overdue payment notices

- **General:**
  - Club announcements
  - News updates

#### 4.8.2 Notification Delivery
- In-app notifications
- Email notifications
- Future: SMS/push notifications (mobile app)

---

## 5. Multi-Tenancy Architecture

### 5.1 Club Isolation
- Clubs are completely isolated from each other
- No cross-club functionality in initial version
- Future consideration: Leagues, inter-club competitions

### 5.2 Data Segregation
- Each club's data is isolated
- Club administrators only see their club data
- Parents can access players across multiple clubs (if applicable)

### 5.3 Super Admin Oversight
- Super admin has platform-wide access
- Can manage all clubs
- Can assign/reassign club administrators

---

## 6. Future Considerations

### 6.1 Payment Integration
- Online payment processing within the app
- Multiple payment methods
- Automated payment reminders and receipts

### 6.2 League Management
- Cross-club league functionality
- League standings and statistics
- Inter-club match scheduling

### 6.3 Mobile Application
- Native iOS/Android apps
- Push notifications
- Offline access to key information

### 6.4 Advanced Analytics
- Player performance analytics
- Team statistics
- Attendance trends
- Financial reporting

### 6.5 Communication Features
- In-app messaging
- Team chat groups
- Announcement broadcast

---

## 7. Success Metrics

### 7.1 Adoption Metrics
- Number of clubs onboarded
- Number of active users (admins, coaches, parents, players)
- User engagement (logins per week)

### 7.2 Usage Metrics
- Training sessions scheduled and tracked
- Matches recorded
- Attendance tracking usage
- Payment tracking adoption

### 7.3 Satisfaction Metrics
- User satisfaction surveys
- Feature request tracking
- Support ticket volume and resolution time

---

## 8. Constraints & Assumptions

### 8.1 Technical Constraints
- Web-based platform (initially)
- Must be mobile-responsive
- Multi-language support may be needed (Macedonian, Albanian, English)

### 8.2 Business Constraints
- Initial version: payment tracking only (no processing)
- Manual club onboarding through super admin
- CSV import for player bulk creation

### 8.3 Assumptions
- Clubs have basic internet access
- Parents have email addresses for notifications
- Coaches are willing to track attendance and match data

---

## 9. Non-Functional Requirements

### 9.1 Performance
- Page load time < 2 seconds
- Support for clubs with up to 500 players
- Real-time notifications delivery

### 9.2 Security
- Role-based access control
- Secure authentication
- Data encryption in transit and at rest
- GDPR compliance for personal data (minors)

### 9.3 Usability
- Intuitive interface requiring minimal training
- Mobile-responsive design
- Accessible to non-technical users

### 9.4 Reliability
- 99.5% uptime
- Regular backups
- Data recovery procedures

---

## 10. Out of Scope (Initial Version)

- Mobile native applications
- In-app payment processing
- League/competition management across clubs
- Video/live streaming features
- Advanced analytics and reporting
- Messaging/chat functionality
- Player transfer management between clubs
- Referee management
- Equipment/inventory management

---
