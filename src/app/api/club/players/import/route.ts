import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ParsedRow } from "@/lib/validation/csv-schemas";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check user roles
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("role, club_id")
    .eq("user_id", user.id)
    .in("role", ["super_admin", "club_admin"]);

  if (rolesError || !roles || roles.length === 0) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { clubId, rows } = body as { clubId: string; rows: ParsedRow[] };

  // Validate access to club
  const isSuperAdmin = roles.some((r) => r.role === "super_admin");
  const hasClubAccess = roles.some((r) => r.club_id === clubId);

  if (!isSuperAdmin && !hasClubAccess) {
    return NextResponse.json({ error: "No access to this club" }, { status: 403 });
  }

  // Get club info for email generation
  const { data: club } = await supabase
    .from("clubs")
    .select("slug, name")
    .eq("id", clubId)
    .single();

  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  // Get all teams for this club (for team assignment)
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .eq("club_id", clubId);

  const teamMap = new Map(teams?.map((t) => [t.name.toLowerCase(), t.id]) || []);

  // Process imports
  const adminSupabase = createAdminClient();
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const row of rows) {
    if (!row.validation.isValid) {
      results.failed++;
      results.errors.push(`Row ${row.rowNumber}: Validation failed`);
      continue;
    }

    try {
      const data = row.data;

      // 1. Check if parent exists by email
      const { data: allUsers } = await adminSupabase.rpc("get_users_with_email");
      const existingUsers = allUsers?.filter((u: { email: string }) => u.email === data.parent_email) || [];

      let parentUserId: string;

      if (existingUsers && existingUsers.length > 0) {
        // Parent exists, use existing user
        parentUserId = existingUsers[0].id;

        // Check if parent has role for this club
        const { data: parentRoles } = await adminSupabase
          .from("user_roles")
          .select("id")
          .eq("user_id", parentUserId)
          .eq("club_id", clubId)
          .eq("role", "parent")
          .single();

        if (!parentRoles) {
          // Assign parent role for this club
          await adminSupabase.from("user_roles").insert({
            user_id: parentUserId,
            club_id: clubId,
            role: "parent",
          });
        }
      } else {
        // Create new parent account
        const parentEmail = data.parent_email!;
        const parentPassword = `temp${Math.random().toString(36).slice(2, 10)}!`;

        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
          email: parentEmail,
          password: parentPassword,
          email_confirm: true,
          user_metadata: {
            full_name: `${data.parent_first_name} ${data.parent_last_name}`,
          },
        });

        if (authError || !authData.user) {
          throw new Error(`Failed to create parent account: ${authError?.message}`);
        }

        parentUserId = authData.user.id;

        // Assign parent role
        await adminSupabase.from("user_roles").insert({
          user_id: parentUserId,
          club_id: clubId,
          role: "parent",
        });
      }

      // 2. Create player account
      const playerEmail = `${data.email_prefix}@${club.slug}.clubify.mk`;
      const playerPassword = `temp${Math.random().toString(36).slice(2, 10)}!`;

      // Check if player email already exists
      const { data: allPlayersUsers } = await adminSupabase.rpc("get_users_with_email");
      const existingPlayerUsers = allPlayersUsers?.filter((u: { email: string }) => u.email === playerEmail) || [];

      if (existingPlayerUsers && existingPlayerUsers.length > 0) {
        results.failed++;
        results.errors.push(
          `Row ${row.rowNumber}: Player email ${playerEmail} already exists`
        );
        continue;
      }

      const { data: playerAuthData, error: playerAuthError } =
        await adminSupabase.auth.admin.createUser({
          email: playerEmail,
          password: playerPassword,
          email_confirm: true,
          user_metadata: {
            full_name: `${data.first_name} ${data.last_name}`,
          },
        });

      if (playerAuthError || !playerAuthData.user) {
        throw new Error(`Failed to create player account: ${playerAuthError?.message}`);
      }

      const playerUserId = playerAuthData.user.id;

      // 3. Create player record
      const { data: player, error: playerError } = await adminSupabase
        .from("players")
        .insert({
          user_id: playerUserId,
          club_id: clubId,
          first_name: data.first_name!,
          last_name: data.last_name!,
          date_of_birth: data.date_of_birth!,
          gender: data.gender!,
          nationality: data.nationality!,
          city: data.city!,
          address: data.address || null,
          phone: data.phone || null,
          email: playerEmail,
          position: data.position!,
          dominant_foot: data.dominant_foot!,
          previous_club: data.previous_club || null,
          blood_type: data.blood_type || null,
          allergies: data.allergies || null,
          medical_conditions: data.medical_conditions || null,
          medications: data.medications || null,
          emergency_contact_name: data.emergency_contact_name!,
          emergency_contact_phone: data.emergency_contact_phone!,
          emergency_contact_relationship: data.emergency_contact_relationship!,
          is_active: true,
        })
        .select()
        .single();

      if (playerError || !player) {
        throw new Error(`Failed to create player: ${playerError?.message}`);
      }

      // 4. Link parent to player
      const { error: parentLinkError } = await adminSupabase
        .from("player_parents")
        .insert({
          player_id: player.id,
          parent_user_id: parentUserId,
          relationship: data.parent_relationship!,
        });

      if (parentLinkError) {
        // Don't fail the import if parent link fails (might already exist)
        console.warn(`Failed to link parent to player: ${parentLinkError.message}`);
      }

      // 5. Assign player role
      await adminSupabase.from("user_roles").insert({
        user_id: playerUserId,
        club_id: clubId,
        role: "player",
      });

      // 6. Assign to team (if team_name provided)
      if (data.team_name) {
        const teamId = teamMap.get(data.team_name.toLowerCase());
        if (teamId) {
          const { error: teamError } = await adminSupabase.from("team_players").insert({
            team_id: teamId,
            player_id: player.id,
            jersey_number: data.jersey_number ? parseInt(data.jersey_number) : null,
            joined_at: new Date().toISOString(),
            is_active: true,
          });

          if (teamError) {
            console.warn(`Failed to assign player to team: ${teamError.message}`);
          }
        }
      }

      results.success++;
    } catch (error) {
      results.failed++;
      const message =
        error instanceof Error ? error.message : "Unknown error";
      results.errors.push(`Row ${row.rowNumber}: ${message}`);
      console.error(`Import error for row ${row.rowNumber}:`, error);
    }
  }

  return NextResponse.json(results);
}
