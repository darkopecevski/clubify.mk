# Design System
## Clubify.mk

### Version 1.0
**Last Updated:** 2025-10-18

---

## Table of Contents
1. [Design Principles](#1-design-principles)
2. [Brand Identity](#2-brand-identity)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Components](#6-components)
7. [Responsive Design](#7-responsive-design)
8. [Iconography](#8-iconography)
9. [Data Visualization](#9-data-visualization)
10. [Accessibility](#10-accessibility)

---

## 1. Design Principles

### 1.1 Core Principles

**Simple & Clean**
- Minimalist interface focused on functionality
- Remove unnecessary visual clutter
- Clear hierarchy and information architecture

**Professional & Trustworthy**
- Inspire confidence in club administrators
- Clean, polished aesthetic
- Consistent and predictable patterns

**Efficient & Fast**
- Quick access to common actions
- Minimal clicks to accomplish tasks
- Fast load times and smooth interactions

**Mobile-First**
- Works great on phones and tablets
- Touch-friendly controls
- Responsive on all screen sizes

**Accessible**
- WCAG 2.1 Level AA compliance
- Keyboard navigable
- Screen reader friendly
- High contrast mode support

---

## 2. Brand Identity

### 2.1 Brand Personality

**Clubify.mk is:**
- Professional yet approachable
- Modern and tech-forward
- Reliable and trustworthy
- Community-focused
- Empowering for clubs

**Clubify.mk is NOT:**
- Overly playful or childish
- Corporate and stiff
- Complicated or technical
- Exclusive or intimidating

### 2.2 Logo & Branding ✅ Confirmed

**Logo Approach:** Text-based logo (MVP)

**Design:**
- Wordmark: "Clubify.mk"
- Font: Bold, modern sans-serif
- Primary version: Green (#10B981) text
- Light backgrounds: Green text
- Dark backgrounds: White text
- Optional: Small football/soccer icon next to text

**Logo Usage:**
- Primary logo: Green text on light backgrounds
- Secondary logo: White text on dark backgrounds
- Icon-only: First letter "C" or small football icon for favicons
- Minimum size: 32px height for digital

**Future:** Can be replaced with a professionally designed logo later

### 2.3 Brand Colors ✅ Confirmed

**Selected: Bold & Energetic**

- **Primary:** Football Green (#10B981 / Green-500)
- **Secondary:** Red (#EF4444 / Red-500)
- **Accent:** Yellow (#F59E0B / Amber-500)

This palette conveys energy, athleticism, and youth - perfect for a football club management system.

### 2.4 Dark Mode ✅ Confirmed

**Approach:** Implement both light and dark mode from the start

**Features:**
- Theme toggle in user menu
- System preference detection (auto-detect user's OS preference)
- Persistent preference (saved in localStorage)
- Smooth transition between themes

**Implementation:**
- Use next-themes package
- shadcn/ui components support dark mode out of the box
- All custom components designed for both themes

---

## 3. Color System

### 3.1 Tailwind Color Palette

We'll use Tailwind's built-in color system with shadcn/ui theme variables.

**Base Colors (shadcn/ui defaults - customizable):**

```css
:root {
  --background: 0 0% 100%;           /* White */
  --foreground: 222.2 84% 4.9%;      /* Near Black */

  --card: 0 0% 100%;                 /* White */
  --card-foreground: 222.2 84% 4.9%; /* Near Black */

  --popover: 0 0% 100%;              /* White */
  --popover-foreground: 222.2 84% 4.9%;

  --primary: 222.2 47.4% 11.2%;      /* Dark Blue/Slate */
  --primary-foreground: 210 40% 98%;

  --secondary: 210 40% 96.1%;        /* Light Gray */
  --secondary-foreground: 222.2 47.4% 11.2%;

  --muted: 210 40% 96.1%;            /* Light Gray */
  --muted-foreground: 215.4 16.3% 46.9%;

  --accent: 210 40% 96.1%;           /* Light Gray */
  --accent-foreground: 222.2 47.4% 11.2%;

  --destructive: 0 84.2% 60.2%;      /* Red */
  --destructive-foreground: 210 40% 98%;

  --border: 214.3 31.8% 91.4%;       /* Light Border */
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;

  --radius: 0.5rem;                  /* Border radius */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode variants */
}
```

### 3.2 Semantic Colors

**Status Colors:**
- **Success:** Green-500 (#22C55E) - Payments, completed actions
- **Warning:** Yellow-500 (#EAB308) - Pending, needs attention
- **Error:** Red-500 (#EF4444) - Errors, overdue payments
- **Info:** Blue-500 (#3B82F6) - General information

**Role Colors (for badges/avatars):**
- **Super Admin:** Purple-600
- **Club Admin:** Blue-600
- **Coach:** Green-600
- **Parent:** Orange-500
- **Player:** Sky-500

**Match Result Colors:**
- **Win:** Green-600
- **Loss:** Red-600
- **Draw:** Gray-500

**Attendance Status Colors:**
- **Present:** Green-500
- **Absent:** Red-500
- **Excused:** Yellow-500
- **Late:** Orange-500

### 3.3 Background Colors

- **App Background:** Gray-50 (light mode) / Gray-900 (dark mode)
- **Card/Panel:** White (light) / Gray-800 (dark)
- **Hover State:** Gray-100 (light) / Gray-700 (dark)
- **Active State:** Primary color with opacity

---

## 4. Typography

### 4.1 Font Families ✅ Confirmed

**Primary Font: Inter** - Google Font
- Clean, modern sans-serif
- Excellent readability at all sizes
- Great for UI and data tables
- Professional and widely used

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**Implementation:**
- Load via Next.js font optimization (next/font/google)
- Variable font for optimal performance
- Fallback to system fonts during load

**Monospace (for codes, data):**
```css
font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

### 4.2 Type Scale

Using Tailwind's default scale:

| Element | Size | Tailwind Class | Usage |
|---------|------|----------------|-------|
| H1 | 36px (2.25rem) | `text-4xl` | Page titles |
| H2 | 30px (1.875rem) | `text-3xl` | Section headers |
| H3 | 24px (1.5rem) | `text-2xl` | Subsection headers |
| H4 | 20px (1.25rem) | `text-xl` | Card headers |
| H5 | 18px (1.125rem) | `text-lg` | Small headers |
| Body | 16px (1rem) | `text-base` | Body text |
| Small | 14px (0.875rem) | `text-sm` | Secondary text |
| Tiny | 12px (0.75rem) | `text-xs` | Captions, labels |

### 4.3 Font Weights

- **Light (300):** Rarely used
- **Normal (400):** Body text
- **Medium (500):** Emphasis, buttons
- **Semibold (600):** Headings, labels
- **Bold (700):** Strong emphasis
- **Extrabold (800):** Display text, hero

### 4.4 Line Heights

- **Tight (1.25):** Headings
- **Normal (1.5):** Body text
- **Relaxed (1.75):** Long-form content

### 4.5 Typography Examples

```typescript
// Page Title
<h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>

// Section Header
<h2 className="text-2xl font-semibold text-gray-800">Players</h2>

// Card Header
<h3 className="text-lg font-medium text-gray-900">Recent Matches</h3>

// Body Text
<p className="text-base text-gray-700">Lorem ipsum...</p>

// Secondary Text
<span className="text-sm text-gray-500">Last updated 2 hours ago</span>

// Label
<label className="text-sm font-medium text-gray-700">Email Address</label>
```

---

## 5. Spacing & Layout

### 5.1 Spacing Scale

Using Tailwind's default spacing (4px base unit):

| Size | Value | Usage |
|------|-------|-------|
| 0 | 0px | No spacing |
| 1 | 4px | Tiny gaps |
| 2 | 8px | Small gaps |
| 3 | 12px | Default gaps |
| 4 | 16px | Standard spacing |
| 5 | 20px | Medium spacing |
| 6 | 24px | Large spacing |
| 8 | 32px | Section spacing |
| 10 | 40px | Large sections |
| 12 | 48px | Major sections |
| 16 | 64px | Page sections |
| 20 | 80px | Hero sections |

### 5.2 Layout Patterns

**Container Widths:**
- Small: `max-w-4xl` (768px)
- Medium: `max-w-6xl` (1152px)
- Large: `max-w-7xl` (1280px)
- Full: `max-w-full`

**Common Padding:**
- Card padding: `p-6` (24px)
- Section padding: `py-12 px-4` (48px vertical, 16px horizontal)
- Page padding: `p-8` (32px)

**Grid Systems:**
```typescript
// 2-column responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// 3-column responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Dashboard cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

### 5.3 Page Layout Structure

```
┌─────────────────────────────────────────────────┐
│ Header (64px fixed)                             │
│ Logo | Navigation | User Menu                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┬───────────────────────────┐  │
│  │              │                           │  │
│  │   Sidebar    │      Main Content        │  │
│  │   (240px)    │      (flex-1)            │  │
│  │              │                           │  │
│  │   - Nav      │   Page Title             │  │
│  │   - Links    │                           │  │
│  │   - Actions  │   Content Area           │  │
│  │              │   (cards, tables, etc.)  │  │
│  │              │                           │  │
│  └──────────────┴───────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 6. Components

### 6.1 Buttons

**Primary Button (Call-to-action):**
```typescript
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-md
                   font-medium hover:bg-primary/90 transition-colors">
  Create Player
</button>
```

**Secondary Button:**
```typescript
<button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md
                   font-medium hover:bg-secondary/80 transition-colors">
  Cancel
</button>
```

**Destructive Button:**
```typescript
<button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md
                   font-medium hover:bg-destructive/90 transition-colors">
  Delete
</button>
```

**Ghost Button:**
```typescript
<button className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md
                   font-medium transition-colors">
  View Details
</button>
```

**Button Sizes:**
- Small: `px-3 py-1.5 text-sm`
- Default: `px-4 py-2 text-base`
- Large: `px-6 py-3 text-lg`

### 6.2 Cards

**Standard Card:**
```typescript
<div className="bg-card rounded-lg border border-border p-6 shadow-sm">
  <h3 className="text-lg font-semibold mb-4">Card Title</h3>
  <p className="text-gray-600">Card content...</p>
</div>
```

**Stat Card (Dashboard):**
```typescript
<div className="bg-card rounded-lg border border-border p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-muted-foreground">Total Players</p>
      <p className="text-3xl font-bold">156</p>
    </div>
    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center
                    justify-center">
      <UsersIcon className="w-6 h-6 text-blue-600" />
    </div>
  </div>
  <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
</div>
```

### 6.3 Forms

**Input Field:**
```typescript
<div className="space-y-2">
  <label className="text-sm font-medium text-gray-700">
    Email Address
  </label>
  <input
    type="email"
    className="w-full px-3 py-2 border border-input rounded-md
               focus:outline-none focus:ring-2 focus:ring-ring"
    placeholder="you@example.com"
  />
  <p className="text-xs text-muted-foreground">
    We'll never share your email.
  </p>
</div>
```

**Select Dropdown:**
```typescript
<select className="w-full px-3 py-2 border border-input rounded-md
                   focus:outline-none focus:ring-2 focus:ring-ring">
  <option>Select an option</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### 6.4 Tables

**Data Table:**
```typescript
<div className="overflow-x-auto">
  <table className="w-full">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
          Name
        </th>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
          Position
        </th>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
          Team
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 text-sm">John Doe</td>
        <td className="px-4 py-3 text-sm">Forward</td>
        <td className="px-4 py-3 text-sm">U12</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 6.5 Badges

**Status Badge:**
```typescript
// Paid
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
               font-medium bg-green-100 text-green-800">
  Paid
</span>

// Pending
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
               font-medium bg-yellow-100 text-yellow-800">
  Pending
</span>

// Overdue
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
               font-medium bg-red-100 text-red-800">
  Overdue
</span>
```

### 6.6 Navigation

**Sidebar Navigation:**
```typescript
<nav className="space-y-1">
  <a href="/dashboard"
     className="flex items-center px-3 py-2 rounded-md text-sm font-medium
                bg-primary text-primary-foreground">
    <HomeIcon className="w-5 h-5 mr-3" />
    Dashboard
  </a>
  <a href="/players"
     className="flex items-center px-3 py-2 rounded-md text-sm font-medium
                text-gray-700 hover:bg-gray-100">
    <UsersIcon className="w-5 h-5 mr-3" />
    Players
  </a>
</nav>
```

---

## 7. Responsive Design

### 7.1 Breakpoints

Using Tailwind's default breakpoints:

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Small tablets, large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops, small desktops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

### 7.2 Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```typescript
// Mobile: Stack vertically
// Tablet+: Side by side
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">Column 1</div>
  <div className="flex-1">Column 2</div>
</div>

// Mobile: 1 column
// Tablet: 2 columns
// Desktop: 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  ...
</div>
```

### 7.3 Mobile Considerations

- **Touch Targets:** Minimum 44x44px for interactive elements
- **Font Sizes:** Minimum 16px for body text (prevents zoom on iOS)
- **Navigation:** Hamburger menu on mobile, full nav on desktop
- **Tables:** Horizontal scroll or card layout on mobile
- **Forms:** Full-width inputs, large tap targets

---

## 8. Iconography

### 8.1 Icon Library

**Lucide React** - Modern, consistent icon set

```bash
pnpm add lucide-react
```

**Commonly Used Icons:**
- `Home` - Dashboard
- `Users` - Players, Teams
- `Calendar` - Schedule, Matches
- `ClipboardList` - Training, Attendance
- `CreditCard` - Payments
- `Bell` - Notifications
- `Settings` - Settings
- `Plus` - Add/Create
- `Edit` - Edit
- `Trash` - Delete
- `Eye` - View
- `Download` - Export
- `Upload` - Import
- `Search` - Search

### 8.2 Icon Sizing

- Small: `w-4 h-4` (16px) - In text, badges
- Default: `w-5 h-5` (20px) - Buttons, navigation
- Medium: `w-6 h-6` (24px) - Headers, cards
- Large: `w-8 h-8` (32px) - Empty states, illustrations

### 8.3 Icon Usage

```typescript
import { Users, Plus } from 'lucide-react';

// In button
<button className="flex items-center gap-2">
  <Plus className="w-4 h-4" />
  Add Player
</button>

// As standalone
<Users className="w-6 h-6 text-gray-600" />
```

---

## 9. Data Visualization

### 9.1 Charts & Graphs

For future analytics features, use **Recharts** or **Chart.js**

**Common Visualizations:**
- **Line Chart:** Attendance trends over time
- **Bar Chart:** Goals per player, matches won/lost
- **Pie Chart:** Payment status distribution
- **Progress Bars:** Attendance percentage, payment completion

### 9.2 Empty States

**When there's no data:**
```typescript
<div className="text-center py-12">
  <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
  <h3 className="text-lg font-medium text-gray-900 mb-2">
    No players yet
  </h3>
  <p className="text-gray-500 mb-4">
    Get started by adding your first player
  </p>
  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
    Add Player
  </button>
</div>
```

### 9.3 Loading States

**Skeleton Loaders:**
```typescript
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
</div>
```

**Spinner:**
```typescript
<div className="flex items-center justify-center">
  <div className="w-8 h-8 border-4 border-primary border-t-transparent
                  rounded-full animate-spin"></div>
</div>
```

---

## 10. Accessibility

### 10.1 Color Contrast

- **Normal text:** Minimum 4.5:1 contrast ratio
- **Large text (18px+):** Minimum 3:1 contrast ratio
- **Interactive elements:** Minimum 3:1 contrast ratio
- Use tools like WebAIM Contrast Checker

### 10.2 Focus States

All interactive elements must have visible focus state:

```css
focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
```

### 10.3 ARIA Labels

```typescript
// Button with icon only
<button aria-label="Delete player">
  <Trash className="w-5 h-5" />
</button>

// Loading state
<div role="status" aria-live="polite">
  Loading...
</div>

// Form errors
<input aria-invalid="true" aria-describedby="email-error" />
<p id="email-error" className="text-red-600">Invalid email address</p>
```

### 10.4 Keyboard Navigation

- All interactive elements accessible via Tab key
- Skip links for main content
- Modal traps focus
- Escape key closes modals/dialogs

---

## 11. Design Tokens (For Reference)

### 11.1 Border Radius
- `rounded-sm` - 2px - Small elements
- `rounded` - 4px - Inputs, small buttons
- `rounded-md` - 6px - Cards, buttons (default)
- `rounded-lg` - 8px - Large cards
- `rounded-full` - 9999px - Circular (avatars, badges)

### 11.2 Shadows
- `shadow-sm` - Subtle elevation
- `shadow` - Default card shadow
- `shadow-md` - Dropdown, popover
- `shadow-lg` - Modal, dialog
- `shadow-xl` - High elevation

### 11.3 Transitions
- `transition-colors` - Color changes (hover, active)
- `transition-all` - Multiple properties
- Duration: `duration-150` (150ms default)

---

## 12. Component Library (shadcn/ui)

We'll use shadcn/ui for pre-built, accessible components:

**Core Components to Install:**
- Button
- Card
- Input, Textarea, Select
- Form (with react-hook-form integration)
- Table
- Dialog, Sheet
- Dropdown Menu
- Toast (notifications)
- Badge
- Avatar
- Tabs
- Accordion
- Calendar, Date Picker
- Checkbox, Radio Group, Switch

All styled with Tailwind, fully customizable.

---

## 13. Design Review Checklist

Before deploying a new feature, verify:

- [ ] Consistent spacing (padding, margins)
- [ ] Consistent typography (sizes, weights)
- [ ] Proper color usage (semantic colors)
- [ ] Responsive on all screen sizes
- [ ] Accessible (keyboard, screen reader, contrast)
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Empty states designed
- [ ] Consistent with existing pages
- [ ] Icons used appropriately

---

## 14. Design Resources

**Color Palette Generator:**
- https://uicolors.app/create

**Contrast Checker:**
- https://webaim.org/resources/contrastchecker/

**Tailwind Docs:**
- https://tailwindcss.com/docs

**shadcn/ui Components:**
- https://ui.shadcn.com/

**Lucide Icons:**
- https://lucide.dev/icons/

---

## 15. Design Inspiration & Reference ✅

**Reference Dashboard:** CMS Full Form example

**Key Design Elements We'll Adopt:**

### Layout:
- **Collapsible Sidebar** (240px → ~60px icon-only)
- Clean left navigation with icons + labels
- Grouped menu items by category (Overview, E-commerce, etc.)
- Count badges for items (e.g., "Projects 12")

### Dashboard Cards:
- **Stat Cards** in grid (4 columns on desktop)
- Large number display with icon
- Percentage change indicators (green ↑, red ↓)
- Clean white cards with subtle shadows
- Consistent spacing and padding

### Charts & Data Viz:
- Clean line charts with grid background
- Colorful bar charts
- Legend with color-coded dots
- Light grid lines, minimal chrome

### Activity Feed:
- **System History / User Activity** pattern
- Icon circles with colored backgrounds
- Clear action descriptions
- Timestamp on right
- Role/status badges (Editor, Admin, etc.)
- Grouped by sections

### Top Bar:
- Breadcrumb navigation
- Global search (centered)
- Right-aligned: Theme toggle, Notifications (with badge), Settings, User menu
- Clean and minimal

### Forms:
- Clean input fields with labels
- Tab navigation for sections
- Generous spacing
- Clear hierarchy

### Typography:
- Bold headings
- Regular body text
- Subtle gray for secondary text
- Good use of font weights for hierarchy

### Color Usage:
- Mostly white/light gray backgrounds
- Colorful accents sparingly (status badges, icons, charts)
- Good contrast ratios
- Clean, not overwhelming

**What We'll Keep:**
✅ Collapsible sidebar pattern
✅ Stat card grid layout
✅ Activity feed design
✅ Clean top bar with breadcrumbs
✅ Generous white space
✅ Subtle shadows and borders
✅ Icon usage in navigation
✅ Count badges
✅ Status badges with colors

**What We'll Adapt:**
- Use our green primary color instead of blue
- Our specific navigation structure (roles-based)
- Football-specific icons and terminology
- Our own data visualizations (attendance, match stats)

---

## 16. All Design Decisions ✅ Confirmed

1. **Brand Colors:** ✅ Bold & Energetic (Green primary, Red secondary, Yellow accent)
2. **Logo:** ✅ Text-based "Clubify.mk" in bold green
3. **Dark Mode:** ✅ Both light and dark mode from start
4. **Font:** ✅ Inter font (Google Font)
5. **Design Reference:** ✅ Clean dashboard style (CMS Full Form inspired)

---

## Next Steps

**Ready to start building!**

1. Initialize Next.js with TypeScript
2. Set up Tailwind with our green color scheme
3. Install shadcn/ui components
4. Configure Inter font
5. Set up dark mode (next-themes)
6. Create base layout (sidebar + top bar)
7. Build first dashboard page

---

**This design system will ensure every page in Clubify.mk looks professional, consistent, and polished!** 🎨
