# Requirements Q&A Session

This document captures the clarifying questions and answers for the Clubify.mk application.

---

## 1. User Roles & Access

### Q1.1: Who creates the player profiles initially - the club administrator or the parents?
**Answer:** Club administrator. We might allow some CSV import to make the job easier.

### Q1.2: Can parents update player information, or is it read-only for them?
**Answer:** Yes, parents can update player information.

### Q1.3: Should coaches have access to the app? If yes, what can they do (view team info, mark attendance, etc.)?
**Answer:** Yes, coaches need access. They can manage the teams they have been assigned to.

### Q1.4: Can one parent have access to multiple player profiles (e.g., siblings)?
**Answer:** Yes, if they have multiple kids that are training within the club or different clubs.

---

## 2. Teams & Age Groups

### Q2.1: How are teams organized? By age groups, skill levels, or both?
**Answer:** By age groups.

### Q2.2: When you say "a player can play in teams which are his or older age" - should there be any restrictions (e.g., max age difference)?
**Answer:** Not for now.

### Q2.3: Can teams be archived or deactivated (e.g., at the end of a season)?
**Answer:** Yes, they can be deactivated.

---

## 3. Training Sessions

### Q3.1: Should the system track attendance at training sessions?
**Answer:** Yes.

### Q3.2: Can training sessions be cancelled or rescheduled?
**Answer:** Yes.

### Q3.3: Should there be notifications for training sessions?
**Answer:** Yes.

---

## 4. Subscriptions/Payments

### Q4.1: Is the subscription fee the same for all teams within a club, or can it vary by team/age group?
**Answer:** It can vary by team.

### Q4.2: What payment periods are supported - monthly only, or also quarterly/annual?
**Answer:** Monthly only.

### Q4.3: Should there be a way to track payment status (paid/unpaid/overdue)?
**Answer:** Yes.

### Q4.4: Can there be discounts (e.g., for siblings, financial hardship)?
**Answer:** Yes.

---

## 5. Matches

### Q5.1: Should the system track match results (scores, goals, assists)?
**Answer:** Yes.

### Q5.2: Is there a concept of "squad" vs "starting lineup" for matches?
**Answer:** Yes, coaches can define all of the players for a match and also can specify which players will start the game.

### Q5.3: Should there be opponent team information stored?
**Answer:** Only opponent club/team name.

### Q5.4: Can matches be part of tournaments or competitions?
**Answer:** Yes.

---

## 6. Club Public Homepage

### Q6.1: What information should appear on the public homepage? (team listings, upcoming matches, contact info, news/announcements?)
**Answer:** Details about the club, which teams they have, news/announcements. Note: Be careful not to disclose sensitive information (e.g., player personal details, exact training locations/times that could pose safety risks).

### Q6.2: Should there be photo galleries or media?
**Answer:** Yes.

### Q6.3: Should there be a way to contact the club or request to join?
**Answer:** Yes, simple contact form.

---

## 7. Multi-tenancy

### Q7.1: Should clubs be completely isolated from each other, or is there any cross-club functionality (e.g., leagues, inter-club matches)?
**Answer:** Isolated for now. We will see if we are going to add functionality regarding leagues etc.

### Q7.2: Will there be a central/super admin to manage all clubs?
**Answer:** Yes, super admin should be the one defining clubs and assigning club admins.

---

## 8. Players & Parents

### Q8.1: What information needs to be stored about players? (birthdate, medical info, emergency contacts, etc.?)
**Answer:** Birthdate, medical info, emergency contacts, position, left/right footed, jersey number, etc.

### Q8.2: Should parents receive notifications (upcoming matches, payment reminders, announcements)?
**Answer:** Yes.

---
