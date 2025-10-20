# Role-Based Access Control (RBAC) Usage Guide

This guide explains how to use the RBAC system in Clubify.mk.

## Role Hierarchy

From lowest to highest permissions:
1. **parent** - Can view their children's data
2. **coach** - Can manage teams and players
3. **club_admin** - Can manage entire club
4. **super_admin** - Can manage all clubs (full system access)

## Available Hooks

### `useUserRole()`

Get the current user's roles and check permissions.

```tsx
import { useUserRole } from "@/hooks/use-user-role";

function MyComponent() {
  const {
    roles,           // Array of user's roles
    isLoading,       // Loading state
    error,           // Error if any
    hasRole,         // Function to check if user has specific role
    isSuperAdmin,    // Function to check if user is super admin
    isClubAdmin,     // Function to check if user is club admin
    isCoach,         // Function to check if user is coach
    isParent,        // Function to check if user is parent
    clubIds,         // Array of club IDs user has access to
  } = useUserRole();

  if (isLoading) return <div>Loading...</div>;

  if (isSuperAdmin()) {
    return <SuperAdminDashboard />;
  }

  if (isClubAdmin("club-123")) {
    return <ClubAdminDashboard clubId="club-123" />;
  }

  return <RegularUserView />;
}
```

## Protecting Entire Pages

### `ProtectedRoute` Component

Wrap your page content with `ProtectedRoute` to require authentication or specific roles.

```tsx
import { ProtectedRoute } from "@/components/auth";

// Require authentication only
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

// Require specific role
export default function AdminPage() {
  return (
    <ProtectedRoute requireRole="club_admin">
      <AdminPanel />
    </ProtectedRoute>
  );
}

// Require minimum role level
export default function CoachPage() {
  return (
    <ProtectedRoute requireMinimumRole="coach">
      <CoachDashboard />
    </ProtectedRoute>
  );
}

// Require club access
export default function ClubPage({ params }: { params: { clubId: string } }) {
  return (
    <ProtectedRoute requireClubAccess={params.clubId}>
      <ClubDetails clubId={params.clubId} />
    </ProtectedRoute>
  );
}

// Combine requirements
export default function ClubAdminPage({ params }: { params: { clubId: string } }) {
  return (
    <ProtectedRoute
      requireMinimumRole="club_admin"
      requireClubAccess={params.clubId}
    >
      <ClubAdminPanel clubId={params.clubId} />
    </ProtectedRoute>
  );
}
```

## Conditionally Showing UI Elements

### `RequireRole` Component

Show/hide UI elements based on user roles.

```tsx
import { RequireRole, SuperAdminOnly, ClubAdminOnly, CoachOnly } from "@/components/auth";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Show to everyone */}
      <PublicContent />

      {/* Show only to super admins */}
      <SuperAdminOnly>
        <SuperAdminPanel />
      </SuperAdminOnly>

      {/* Show only to club admins and above */}
      <ClubAdminOnly clubId="club-123">
        <ManageClubButton />
      </ClubAdminOnly>

      {/* Show only to coaches and above */}
      <CoachOnly clubId="club-123">
        <ManagePlayersButton />
      </CoachOnly>

      {/* Show to specific role */}
      <RequireRole role="parent">
        <ViewChildrenButton />
      </RequireRole>

      {/* Show with fallback */}
      <RequireRole
        minimumRole="coach"
        fallback={<p>You need coach access to see this.</p>}
      >
        <CoachTools />
      </RequireRole>
    </div>
  );
}
```

## Role Checking Utilities

For programmatic role checking (useful in API routes or server components):

```tsx
import {
  hasRole,
  hasMinimumRole,
  isSuperAdmin,
  isClubAdmin,
  hasClubAccess
} from "@/lib/auth/roles";

// Example: Check in a server component
async function getClubData(userId: string, clubId: string) {
  const supabase = await createClient();

  const { data: roles } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", userId);

  if (!hasClubAccess(roles, clubId)) {
    throw new Error("No access to this club");
  }

  // Fetch club data...
}
```

## Examples

### Example 1: Protect Admin Page

```tsx
// src/app/admin/page.tsx
import { ProtectedRoute } from "@/components/auth";
import { AdminDashboard } from "@/components/admin/dashboard";

export default function AdminPage() {
  return (
    <ProtectedRoute requireMinimumRole="club_admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

### Example 2: Show Delete Button Only to Admins

```tsx
import { ClubAdminOnly } from "@/components/auth";

function PlayerCard({ player }) {
  return (
    <div className="player-card">
      <h3>{player.name}</h3>
      <p>{player.position}</p>

      <ClubAdminOnly clubId={player.clubId}>
        <button onClick={() => deletePlayer(player.id)}>
          Delete Player
        </button>
      </ClubAdminOnly>
    </div>
  );
}
```

### Example 3: Different Dashboards Based on Role

```tsx
import { useUserRole } from "@/hooks/use-user-role";

function DashboardPage() {
  const { isSuperAdmin, isClubAdmin, isCoach, isParent } = useUserRole();

  if (isSuperAdmin()) {
    return <SuperAdminDashboard />;
  }

  if (isClubAdmin()) {
    return <ClubAdminDashboard />;
  }

  if (isCoach()) {
    return <CoachDashboard />;
  }

  if (isParent()) {
    return <ParentDashboard />;
  }

  return <GuestView />;
}
```

## Testing Different Roles

To test different roles, create test users in Supabase with different roles in the `user_roles` table:

```sql
-- Create a super admin
INSERT INTO user_roles (user_id, role)
VALUES ('user-uuid', 'super_admin');

-- Create a club admin
INSERT INTO user_roles (user_id, club_id, role)
VALUES ('user-uuid', 'club-uuid', 'club_admin');

-- Create a coach
INSERT INTO user_roles (user_id, club_id, role)
VALUES ('user-uuid', 'club-uuid', 'coach');

-- Create a parent
INSERT INTO user_roles (user_id, club_id, role)
VALUES ('user-uuid', 'club-uuid', 'parent');
```

## Best Practices

1. **Always use `ProtectedRoute` for pages** - Don't rely on hiding UI elements alone
2. **Validate on the server** - Client-side protection is for UX, not security
3. **Use RLS policies** - Database-level security is the real protection
4. **Check roles in API routes** - Never trust client-side role checks
5. **Use meaningful fallbacks** - Tell users why they can't see something
6. **Test with different roles** - Make sure each role sees the right content
