import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const {
    clubId,
    full_name,
    email,
    phone,
    license_type,
    license_number,
    specialization,
    years_of_experience,
    bio,
  } = body;

  // Validate access to club
  const isSuperAdmin = roles.some((r) => r.role === "super_admin");
  const hasClubAccess = roles.some((r) => r.club_id === clubId);

  if (!isSuperAdmin && !hasClubAccess) {
    return NextResponse.json(
      { error: "No access to this club" },
      { status: 403 }
    );
  }

  // Use admin client for creating user accounts
  const adminSupabase = createAdminClient();

  try {
    // 1. Check if user already exists by email
    const { data: allUsers } = await adminSupabase.rpc("get_users_with_email");
    const existingUser = allUsers?.find(
      (u: { email: string }) => u.email === email
    );

    let coachUserId: string;

    if (existingUser) {
      // User exists, use existing user
      coachUserId = existingUser.id;

      // Check if user already has coach role for this club
      const { data: existingCoach } = await adminSupabase
        .from("coaches")
        .select("id")
        .eq("user_id", coachUserId)
        .eq("club_id", clubId)
        .maybeSingle();

      if (existingCoach) {
        return NextResponse.json(
          { error: "This user is already a coach for this club" },
          { status: 400 }
        );
      }

      // Update user's full_name if provided
      if (full_name) {
        await adminSupabase
          .from("users")
          .update({ full_name, phone })
          .eq("id", coachUserId);
      }
    } else {
      // Create new coach user account with default password
      const defaultPassword = "ClubifyCoach2025!";

      const { data: authData, error: authError } =
        await adminSupabase.auth.admin.createUser({
          email: email,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: {
            full_name: full_name,
          },
        });

      if (authError || !authData.user) {
        throw new Error(`Failed to create coach account: ${authError?.message}`);
      }

      coachUserId = authData.user.id;

      // Create user profile
      await adminSupabase.from("users").insert({
        id: coachUserId,
        full_name: full_name,
        phone: phone,
      });
    }

    // 2. Create coach profile
    const { data: coach, error: coachError } = await adminSupabase
      .from("coaches")
      .insert({
        club_id: clubId,
        user_id: coachUserId,
        license_type: license_type,
        license_number: license_number,
        specialization: specialization,
        years_of_experience: years_of_experience,
        bio: bio,
        is_active: true,
      })
      .select()
      .single();

    if (coachError) {
      throw new Error(`Failed to create coach profile: ${coachError.message}`);
    }

    // 3. Assign coach role
    const { data: existingRole } = await adminSupabase
      .from("user_roles")
      .select("id")
      .eq("user_id", coachUserId)
      .eq("club_id", clubId)
      .eq("role", "coach")
      .maybeSingle();

    if (!existingRole) {
      await adminSupabase.from("user_roles").insert({
        user_id: coachUserId,
        club_id: clubId,
        role: "coach",
      });
    }

    return NextResponse.json({
      success: true,
      coach,
    });
  } catch (error) {
    console.error("Error creating coach:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create coach",
      },
      { status: 500 }
    );
  }
}
