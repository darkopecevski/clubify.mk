# User Roles & Permissions
## Clubify.mk

### Version 1.0
**Last Updated:** 2025-10-18

---

## 1. Overview

This document defines the user roles in the Clubify.mk system and their associated permissions. The system implements role-based access control (RBAC) to ensure users can only access and modify data appropriate to their role.

---

## 2. Role Hierarchy

```
Super Admin
    │
    └── Club Administrator
            │
            ├── Coach
            ├── Parent
            └── Player
```

---

## 3. Role Definitions

### 3.1 Super Admin

**Description:** Platform-level administrator with full system access.

**Primary Responsibilities:**
- Onboard new clubs to the platform
- Manage club lifecycle (activate/deactivate)
- Assign and manage club administrators
- Platform-wide oversight and reporting
- System configuration and maintenance

**Permissions:**

| Resource | Create | Read | Update | Delete | Special |
|----------|--------|------|--------|--------|---------|
| Clubs | ✓ | ✓ (All) | ✓ (All) | ✓ (All) | Activate/Deactivate |
| Club Admins | ✓ | ✓ (All) | ✓ (All) | ✓ (All) | Assign to clubs |
| Teams | ✗ | ✓ (All) | ✗ | ✗ | View-only |
| Players | ✗ | ✓ (All) | ✗ | ✗ | View-only |
| Coaches | ✗ | ✓ (All) | ✗ | ✗ | View-only |
| Parents | ✗ | ✓ (All) | ✗ | ✗ | View-only |
| Training Sessions | ✗ | ✓ (All) | ✗ | ✗ | View-only |
| Matches | ✗ | ✓ (All) | ✗ | ✗ | View-only |
| Payments | ✗ | ✓ (All) | ✗ | ✗ | View-only |

**Access Scope:** Entire platform, all clubs

**Login:** Dedicated super admin portal

---

### 3.2 Club Administrator

**Description:** Primary administrator for a specific club with full management capabilities within their club.

**Primary Responsibilities:**
- Manage club profile and public homepage
- Create and manage teams
- Create and manage player profiles
- Create and manage coach accounts
- Define subscription fees and track payments
- Publish news and announcements
- Manage photo galleries and media
- Oversee club operations

**Permissions:**

| Resource | Create | Read | Update | Delete | Special |
|----------|--------|------|--------|--------|---------|
| Club Profile | ✗ | ✓ (Own) | ✓ (Own) | ✗ | Manage public homepage |
| Teams | ✓ | ✓ (Own club) | ✓ (Own club) | ✗ | Activate/Deactivate |
| Players | ✓ | ✓ (Own club) | ✓ (Own club) | ✓ (Own club) | CSV Import, Assign to teams |
| Coaches | ✓ | ✓ (Own club) | ✓ (Own club) | ✓ (Own club) | Assign to teams |
| Parents | ✓ | ✓ (Own club) | ✓ (Own club) | ✗ | Link to players |
| Training Sessions | ✗ | ✓ (Own club) | ✗ | ✗ | View-only |
| Matches | ✗ | ✓ (Own club) | ✗ | ✗ | View-only |
| Subscription Fees | ✓ | ✓ (Own club) | ✓ (Own club) | ✗ | Set per team, Set discounts |
| Payments | ✗ | ✓ (Own club) | ✓ (Own club) | ✗ | Mark as paid/unpaid |
| Announcements | ✓ | ✓ (Own club) | ✓ (Own club) | ✓ (Own club) | Publish to homepage |
| Media/Photos | ✓ | ✓ (Own club) | ✓ (Own club) | ✓ (Own club) | Upload, Organize galleries |

**Access Scope:** Own club only

**Login:** Club-specific portal (e.g., clubname.clubify.mk/admin)

**Additional Notes:**
- Can have multiple administrators per club
- Can view all data within their club
- Cannot access other clubs' data

---

### 3.3 Coach

**Description:** Team-level manager responsible for training and match management.

**Primary Responsibilities:**
- Manage assigned team(s)
- Schedule and manage training sessions
- Track attendance
- Create and manage matches
- Select squad and starting lineup
- Record match results and statistics

**Permissions:**

| Resource | Create | Read | Update | Delete | Special |
|----------|--------|------|--------|--------|---------|
| Teams | ✗ | ✓ (Assigned) | ✗ | ✗ | View assigned teams only |
| Players | ✗ | ✓ (Assigned teams) | ✗ | ✗ | View players in assigned teams |
| Training Sessions | ✓ | ✓ (Assigned teams) | ✓ (Assigned teams) | ✓ (Assigned teams) | Cancel, Reschedule |
| Attendance | ✓ | ✓ (Assigned teams) | ✓ (Assigned teams) | ✗ | Mark attendance |
| Matches | ✓ | ✓ (Assigned teams) | ✓ (Assigned teams) | ✓ (Assigned teams) | Create, Update results |
| Squad Selection | ✓ | ✓ (Own matches) | ✓ (Own matches) | ✗ | Select squad & lineup |
| Match Statistics | ✓ | ✓ (Own matches) | ✓ (Own matches) | ✗ | Record goals, assists, etc. |
| Club Profile | ✗ | ✓ (Limited) | ✗ | ✗ | View club info only |
| Announcements | ✗ | ✓ (Own club) | ✗ | ✗ | View-only |

**Access Scope:** Assigned team(s) within their club

**Login:** Coach portal with team selection

**Additional Notes:**
- Can be assigned to multiple teams
- Cannot modify player profiles
- Cannot access payment information
- Can view club announcements but cannot create them

---

### 3.4 Parent

**Description:** Guardian of one or more players with view and limited edit access.

**Primary Responsibilities:**
- View and update child's profile information
- Monitor training attendance
- View match schedules and results
- Receive notifications about their child's activities
- Manage payment information (view only in v1)

**Permissions:**

| Resource | Create | Read | Update | Delete | Special |
|----------|--------|------|--------|--------|---------|
| Player Profile | ✗ | ✓ (Own children) | ✓ (Own children) | ✗ | Update personal info, medical info, emergency contacts |
| Teams | ✗ | ✓ (Children's teams) | ✗ | ✗ | View team info |
| Training Sessions | ✗ | ✓ (Children's teams) | ✗ | ✗ | View schedule |
| Attendance | ✗ | ✓ (Own children) | ✗ | ✗ | View attendance history |
| Matches | ✗ | ✓ (Children's teams) | ✗ | ✗ | View schedule & results |
| Match Statistics | ✗ | ✓ (Own children) | ✗ | ✗ | View child's stats |
| Payments | ✗ | ✓ (Own children) | ✗ | ✗ | View payment status & history |
| Announcements | ✗ | ✓ (Children's clubs) | ✗ | ✗ | View club announcements |
| Club Homepage | ✗ | ✓ (Children's clubs) | ✗ | ✗ | View public info |
| Notifications | ✗ | ✓ (Own) | ✓ (Own) | ✗ | Manage notification preferences |

**Access Scope:**
- Own children's data
- Can access multiple children across multiple clubs

**Login:** Parent portal with child selection (if multiple children)

**Additional Notes:**
- Cannot see other players' detailed information
- Can update player profile but cannot delete
- Receives automated notifications (training, matches, payments)
- Cannot mark payments as paid (admin/coach function)

---

### 3.5 Player

**Description:** Youth athlete with view-only access to their own information.

**Primary Responsibilities:**
- View own profile
- View team information
- View training and match schedules
- View own statistics

**Permissions:**

| Resource | Create | Read | Update | Delete | Special |
|----------|--------|------|--------|--------|---------|
| Player Profile | ✗ | ✓ (Own) | ✗ | ✗ | View-only |
| Teams | ✗ | ✓ (Own teams) | ✗ | ✗ | View team roster |
| Training Sessions | ✗ | ✓ (Own teams) | ✗ | ✗ | View schedule |
| Attendance | ✗ | ✓ (Own) | ✗ | ✗ | View own attendance |
| Matches | ✗ | ✓ (Own teams) | ✗ | ✗ | View schedule & results |
| Match Statistics | ✗ | ✓ (Own) | ✗ | ✗ | View own stats |
| Club Homepage | ✗ | ✓ (Own club) | ✗ | ✗ | View public info |
| Announcements | ✗ | ✓ (Own club) | ✗ | ✗ | View announcements |

**Access Scope:** Own data only

**Login:** Player portal (simplified interface)

**Additional Notes:**
- Completely read-only access
- Age-appropriate interface design
- Parent has control over account settings
- Cannot update any information (parent does this)

---

## 4. Permission Matrix Summary

| Action | Super Admin | Club Admin | Coach | Parent | Player |
|--------|-------------|------------|-------|--------|--------|
| Create clubs | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage club homepage | ✗ | ✓ | ✗ | ✗ | ✗ |
| Create teams | ✗ | ✓ | ✗ | ✗ | ✗ |
| Create players | ✗ | ✓ | ✗ | ✗ | ✗ |
| Update player info | ✗ | ✓ | ✗ | ✓ (own children) | ✗ |
| Create coaches | ✗ | ✓ | ✗ | ✗ | ✗ |
| Assign coaches to teams | ✗ | ✓ | ✗ | ✗ | ✗ |
| Create training sessions | ✗ | ✗ | ✓ | ✗ | ✗ |
| Track attendance | ✗ | ✗ | ✓ | ✗ | ✗ |
| Create matches | ✗ | ✗ | ✓ | ✗ | ✗ |
| Record match results | ✗ | ✗ | ✓ | ✗ | ✗ |
| Set subscription fees | ✗ | ✓ | ✗ | ✗ | ✗ |
| Track payments | ✗ | ✓ | ✗ | ✗ | ✗ |
| View payment status | ✓ (all) | ✓ (own club) | ✗ | ✓ (own children) | ✗ |
| Publish announcements | ✗ | ✓ | ✗ | ✗ | ✗ |
| Upload media | ✗ | ✓ | ✗ | ✗ | ✗ |

---

## 5. Special Scenarios

### 5.1 Multiple Roles
**Scenario:** A person could have multiple roles (e.g., Club Admin who is also a Parent)

**Solution:**
- User can switch between role contexts
- Dashboard shows combined view with role selector
- Permissions are union of all roles when in combined view
- Audit logs track which role was active for each action

### 5.2 Coach Becomes Parent
**Scenario:** A coach's child joins the club

**Solution:**
- Same user account gets both Coach and Parent roles
- Can view children's data in Parent mode
- Cannot use Coach privileges to access child's payment data (separation of concerns)

### 5.3 Parent with Children in Multiple Clubs
**Scenario:** Parent has children in different clubs

**Solution:**
- Single parent account
- Club selector in dashboard
- Can view data across all clubs where they have children
- Notifications consolidated across all clubs

### 5.4 Player Aging Out / Moving Teams
**Scenario:** Player moves from one team to another or leaves the club

**Solution:**
- Club admin can reassign player to different team
- Historical data (attendance, match stats) preserved
- Parent retains access to historical data even after player leaves
- Player account can be deactivated but not deleted (data retention)

---

## 6. Authentication & Authorization

### 6.1 Authentication
- Email/password login for all users
- Password reset via email
- Optional: Two-factor authentication (future)

### 6.2 Session Management
- 24-hour session timeout for regular users
- 8-hour session timeout for admins
- Forced re-authentication for sensitive operations (e.g., deleting players)

### 6.3 Authorization Checks
- Role verified on every request
- Resource ownership validated (e.g., coach can only modify their teams)
- Audit log for all sensitive operations

---

## 7. Data Privacy & GDPR Compliance

### 7.1 Data Access Principles
- **Least Privilege:** Users only access data necessary for their role
- **Need-to-Know:** Coaches don't see payment info, parents don't see other players' details
- **Child Protection:** Extra safeguards for minors' data

### 7.2 Sensitive Data Handling
- Medical information: Only club admin and parent can view
- Emergency contacts: Only club admin, assigned coach, and parent can view
- Payment information: Only club admin and parent can view
- Personal contact details: Not shown on public pages

### 7.3 Data Deletion Rights
- Parents can request player data deletion (GDPR right to erasure)
- Super admin processes deletion requests
- Anonymization option: Keep statistics but remove personal identifiers

---
