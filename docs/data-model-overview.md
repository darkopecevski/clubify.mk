# Data Model Overview
## Clubify.mk

### Version 1.0
**Last Updated:** 2025-10-18

---

## 1. Introduction

This document provides a high-level overview of the data entities and their relationships in the Clubify.mk system. This is a business-level view focusing on what data is stored and how entities relate to each other, without technical implementation details.

---

## 2. Core Entities

### 2.1 Club
Represents a youth football club in the system.

**Key Attributes:**
- Club name
- Logo/badge
- Description
- Contact information (email, phone, address)
- Website URL
- Social media links
- Status (Active/Inactive)
- Created date
- Public homepage settings

**Relationships:**
- Has many Teams
- Has many Players
- Has many Coaches
- Has many Club Administrators
- Has many Announcements
- Has many Media/Photos

---

### 2.2 User
Represents any person who can log into the system.

**Key Attributes:**
- Full name
- Email (unique, used for login)
- Password (encrypted)
- Phone
- Photo
- Status (Active/Inactive)
- Last login date
- Created date

**Roles:**
- Super Admin
- Club Administrator
- Coach
- Parent
- Player

**Relationships:**
- User can have multiple roles
- Club Admin → belongs to one Club
- Coach → belongs to one Club, assigned to many Teams
- Parent → linked to many Players (children)
- Player → has one User account

---

### 2.3 Team
Represents an age-group team within a club.

**Key Attributes:**
- Team name (e.g., "U10", "U12")
- Age group
- Season/year
- Description
- Team photo
- Status (Active/Inactive)
- Monthly subscription fee
- Created date

**Relationships:**
- Belongs to one Club
- Has many Players (through team assignments)
- Has many Coaches (assigned)
- Has many Training Sessions
- Has many Matches
- Has one Subscription Fee

---

### 2.4 Player
Represents a young athlete in the club.

**Key Attributes:**

**Personal:**
- Full name
- Birthdate
- Gender
- Nationality
- Photo
- Address

**Football:**
- Position (Goalkeeper, Defender, Midfielder, Forward)
- Dominant foot (Left, Right, Both)
- Jersey number
- Height
- Weight

**Medical:**
- Medical conditions
- Allergies
- Blood type
- Medications
- Doctor contact

**Emergency Contact:**
- Contact name
- Contact phone
- Relationship

**System:**
- Player ID (unique)
- Status (Active/Inactive)
- Created date

**Relationships:**
- Belongs to one Club
- Assigned to many Teams (multi-team assignment allowed)
- Has one User account (for login)
- Has one or more Parents/Guardians
- Has many Attendance records
- Has many Match Participations
- Has many Payment Records
- Has many Statistics

---

### 2.5 Coach
Represents a coach in the club.

**Key Attributes:**
- Full name
- Email
- Phone
- Photo
- Bio/description
- Coaching licenses/certifications
- Status (Active/Inactive)
- Created date

**Relationships:**
- Belongs to one Club
- Has one User account
- Assigned to many Teams
- Creates many Training Sessions
- Creates many Matches

---

### 2.6 Parent/Guardian
Represents a parent or guardian of a player.

**Key Attributes:**
- Full name
- Email
- Phone
- Relationship to player
- Status (Active/Inactive)
- Created date

**Relationships:**
- Has one User account
- Linked to many Players (children, can be across multiple clubs)
- Receives many Notifications
- Views many Payment Records

---

### 2.7 Training Session
Represents a scheduled training session for a team.

**Key Attributes:**
- Date
- Start time
- Duration
- Location/venue
- Status (Scheduled, Cancelled, Completed)
- Cancellation reason (if cancelled)
- Notes/description
- Is recurring (yes/no)
- Recurrence pattern (if recurring)
- Created date

**Relationships:**
- Belongs to one Team
- Created by one Coach
- Has many Attendance records (one per player)

---

### 2.8 Attendance
Represents a player's attendance at a training session.

**Key Attributes:**
- Status (Present, Absent, Excused, Late)
- Notes
- Marked date (when coach recorded it)

**Relationships:**
- Belongs to one Training Session
- Belongs to one Player
- Recorded by one Coach

---

### 2.9 Match
Represents a football match for a team.

**Key Attributes:**
- Date and time
- Opponent team name
- Venue/location
- Match type (Friendly, League, Tournament)
- Competition name (if tournament)
- Home/Away
- Status (Scheduled, In Progress, Completed, Cancelled)
- Final score (own team)
- Opponent score
- Result (Win, Loss, Draw)
- Match notes/report
- MVP player (optional)
- Created date

**Relationships:**
- Belongs to one Team
- Created by one Coach
- Has many Squad Selections (players selected)
- Has many Player Statistics (per player in squad)

---

### 2.10 Squad Selection
Represents a player selected for a match squad.

**Key Attributes:**
- Is starting lineup (yes/no)
- Position on field
- Selected date

**Relationships:**
- Belongs to one Match
- Belongs to one Player
- Selected by one Coach

---

### 2.11 Match Statistics
Represents a player's performance statistics in a match.

**Key Attributes:**
- Goals scored
- Assists
- Yellow cards
- Red cards
- Minutes played
- Player rating (1-10, optional)

**Relationships:**
- Belongs to one Match
- Belongs to one Player

---

### 2.12 Subscription Fee
Represents the monthly subscription fee for a team.

**Key Attributes:**
- Amount
- Currency (default: MKD)
- Effective date
- End date (optional, when fee changes)
- Description/notes

**Relationships:**
- Belongs to one Team
- Applied to many Players (in that team)
- Used to generate Payment Records

---

### 2.13 Discount
Represents a discount applied to a player's subscription.

**Key Attributes:**
- Discount type (Percentage, Fixed amount)
- Discount value
- Reason (Sibling, Financial hardship, Merit, Other)
- Custom reason text
- Effective date
- End date (optional)
- Created date

**Relationships:**
- Applied to one Player
- Created by one Club Admin
- Affects Payment Records

---

### 2.14 Payment Record
Represents a monthly payment for a player's subscription.

**Key Attributes:**
- Month and year
- Amount due (after discount)
- Status (Unpaid, Paid, Overdue)
- Payment date (when marked paid)
- Payment method (Cash, Bank transfer, Other)
- Notes
- Due date
- Created date

**Relationships:**
- Belongs to one Player
- References one Subscription Fee
- May reference one Discount
- Updated by Club Admin

---

### 2.15 Announcement
Represents a news item or announcement from the club.

**Key Attributes:**
- Title
- Content (rich text)
- Featured image
- Publish date
- Visibility (Public, Members only)
- Target audience (All, Specific teams)
- Status (Draft, Scheduled, Published, Archived)
- Created date

**Relationships:**
- Belongs to one Club
- Created by one Club Admin
- May target specific Teams
- Triggers Notifications (if members-only)

---

### 2.16 Media/Photo
Represents a photo or media item in the club's gallery.

**Key Attributes:**
- File name
- File path/URL
- Caption
- Album/category
- Visibility (Public, Members only)
- Upload date

**Relationships:**
- Belongs to one Club
- Uploaded by one Club Admin
- Displayed on Public Homepage (if public)

---

### 2.17 Notification
Represents a notification sent to a user.

**Key Attributes:**
- Notification type (Training created, Match scheduled, Payment due, etc.)
- Title
- Message
- Priority (Low, Medium, High)
- Delivery method (In-app, Email, SMS)
- Status (Sent, Read, Deleted)
- Sent date
- Read date

**Relationships:**
- Sent to one User
- May reference related entity (Training Session, Match, Payment, etc.)

---

## 3. Entity Relationship Summary

### 3.1 Visual Relationship Map

```
Super Admin
    └── manages → Club
                    ├── has → Club Admin
                    ├── has → Team
                    │         ├── has → Coach (assigned)
                    │         ├── has → Player (assigned)
                    │         ├── has → Training Session
                    │         │         └── has → Attendance
                    │         ├── has → Match
                    │         │         ├── has → Squad Selection
                    │         │         └── has → Match Statistics
                    │         └── has → Subscription Fee
                    ├── has → Player
                    │         ├── has → Parent (guardian)
                    │         ├── has → Payment Record
                    │         ├── has → Discount
                    │         └── has → User (login)
                    ├── has → Coach
                    │         └── has → User (login)
                    ├── has → Announcement
                    └── has → Media/Photo

Parent
    └── linked to → Player (can be multiple)
                      └── has → Payment Record
                                  ├── references → Subscription Fee
                                  └── references → Discount
```

---

## 4. Key Relationships Explained

### 4.1 Player Multi-Team Assignment
- A Player can be assigned to multiple Teams
- Common scenario: Player plays in their age group (U10) and also in older age group (U12)
- Each team assignment is tracked separately
- Player inherits subscription fee from each team (admin can apply discount)

### 4.2 Parent-Player Relationship
- A Parent can have multiple children (Players)
- Children can be in the same club or different clubs
- Parent sees consolidated view of all children's data
- One User account for parent, linked to multiple Player entities

### 4.3 Coach-Team Assignment
- A Coach can be assigned to multiple Teams
- Common scenario: Coach handles multiple age groups
- Coach only sees data for their assigned teams
- Team can have multiple Coaches (head coach, assistant coach)

### 4.4 User-Role Relationship
- One User can have multiple Roles
- Example: A parent who is also a coach
- User can switch between role contexts in the app
- Permissions are union of all assigned roles

### 4.5 Payment-Discount Relationship
- Payment Record calculates amount due based on:
  - Team's Subscription Fee
  - Any active Discount for the player
- Formula: Amount Due = Subscription Fee - Discount
- If player is on multiple teams, separate payment records generated

### 4.6 Match-Squad-Statistics Relationship
- Match has Squad Selection (which players are selected)
- Squad Selection indicates starting 11 vs substitutes
- Match Statistics records performance for each squad player
- Statistics aggregated to Player profile (career stats)

---

## 5. Data Lifecycle & History

### 5.1 Soft Deletes
Most entities are not permanently deleted but marked as inactive:
- Teams (deactivated, not deleted)
- Players (deactivated when they leave)
- Coaches (deactivated when they leave)
- Users (deactivated, not deleted)

**Reason:** Preserve historical data for statistics, payment history, match records

### 5.2 Historical Records
The following records are never deleted:
- Attendance records
- Match statistics
- Payment records
- Training sessions (even if cancelled)
- Matches (even if cancelled)

**Reason:** Auditing, reporting, historical performance analysis

### 5.3 Versioning
Some entities maintain version history:
- Subscription Fees (when fee changes, new record created with effective date)
- Discounts (track when applied and when removed)
- Announcements (optional: track edits)

---

## 6. Data Privacy & Security Considerations

### 6.1 Sensitive Data
**Medical Information:**
- Stored encrypted
- Only accessible by: Player, Parent, Club Admin
- Not shared on public pages

**Emergency Contacts:**
- Accessible by: Player, Parent, Club Admin, Assigned Coach
- Not shared publicly

**Payment Information:**
- Accessible by: Parent (own children), Club Admin
- Coaches cannot see payment data

### 6.2 Public vs Private Data
**Public (on Club Homepage):**
- Club information
- Team names and age groups
- Announcements (public ones)
- Photos (without player identification)

**Private (login required):**
- Player names and personal details
- Training schedules
- Match details (beyond basic info)
- Payment information
- Medical information
- Contact information

### 6.3 Child Data Protection (GDPR)
- Players are minors, extra protection required
- Parent has control over child's data
- Right to access: Parent can download all child's data
- Right to erasure: Parent can request data deletion
- Data retention: Anonymization option (keep stats, remove personal info)

---

## 7. Data Integrity Rules

### 7.1 Required Relationships
- Player must belong to a Club
- Player must have at least one Parent
- Team must belong to a Club
- Coach must belong to a Club
- Training Session must belong to a Team
- Match must belong to a Team
- Payment Record must belong to a Player

### 7.2 Business Rules
- Player can only be assigned to teams in same club (or older age groups)
- Coach can only manage teams in their assigned club
- Squad Selection: minimum 11 players, starting lineup exactly 11
- Payment Record: auto-generated on 1st of each month for active players
- Attendance: can only be marked by coaches assigned to the team
- Match Statistics: can only be recorded for players in squad

### 7.3 Validation Rules
- Birthdate: Player must be under 21 years old
- Jersey number: Unique within a team (but player can have different numbers in different teams)
- Email: Must be unique across all users
- Payment amount: Cannot be negative
- Discount: Cannot exceed subscription fee
- Training duration: Minimum 30 minutes, maximum 240 minutes

---

## 8. Calculated/Derived Data

These values are calculated from existing data, not stored:

### 8.1 Player Statistics
- **Total Goals:** Sum of goals from all Match Statistics
- **Total Assists:** Sum of assists from all Match Statistics
- **Attendance Percentage:** (Present sessions / Total sessions) * 100
- **Matches Played:** Count of Squad Selections
- **Matches Started:** Count of Squad Selections where is_starting = true

### 8.2 Team Statistics
- **Team Record:** Count of Wins, Losses, Draws
- **Goals For:** Sum of all match scores (own team)
- **Goals Against:** Sum of all opponent scores
- **Average Attendance:** Average attendance % across all players

### 8.3 Payment Summary
- **Total Paid (player):** Sum of paid payments
- **Total Owed (player):** Sum of unpaid/overdue payments
- **Club Revenue (month):** Sum of all paid payments for the month
- **Outstanding Payments (club):** Sum of all unpaid/overdue payments

---

## 9. Next Steps

This data model overview provides the foundation for:

1. **Technical Data Model Design:**
   - Database schema (tables, columns, indexes)
   - Relationships (foreign keys, junction tables)
   - Data types and constraints

2. **API Design:**
   - Endpoints for CRUD operations
   - Query patterns and filters
   - Data serialization (DTOs)

3. **Security Implementation:**
   - Access control logic
   - Data encryption
   - Audit logging

4. **UI/UX Design:**
   - Forms and data entry
   - Data display and visualization
   - Filtering and search

---

## Appendix: Entity Count Estimates

For a typical medium-sized club:

| Entity | Estimated Count |
|--------|----------------|
| Club | 1 |
| Teams | 8-12 (U6 through U18) |
| Players | 150-300 |
| Coaches | 10-20 |
| Parents | 150-300 (approximately 1 per player) |
| Club Admins | 1-3 |
| Training Sessions | ~400/year (8 teams × 2 sessions/week × 50 weeks) |
| Matches | ~120/year (8 teams × 15 matches/season) |
| Attendance Records | ~60,000/year (300 players × 2 sessions/week × 50 weeks) |
| Payment Records | ~3,600/year (300 players × 12 months) |
| Announcements | 50-100/year |
| Notifications | ~100,000/year (high volume) |

**Platform-wide (100 clubs):**
- Clubs: 100
- Teams: 1,000
- Players: 20,000
- Users: 40,000
- Training Sessions: 40,000/year
- Matches: 12,000/year
- Attendance Records: 6,000,000/year
- Payment Records: 360,000/year
- Notifications: 10,000,000/year

These estimates inform technical decisions around:
- Database scaling
- Performance optimization
- Backup and archival strategies
- Search and indexing

---
