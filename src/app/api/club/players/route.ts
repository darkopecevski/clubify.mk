import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/club/players - Create a new player with parent account
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has club_admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "club_admin"]);

    if (!roles || roles.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      // Personal info
      first_name,
      last_name,
      date_of_birth,
      gender,
      photo_url,
      // Football info
      position,
      dominant_foot,
      jersey_number,
      notes,
      // Medical info
      blood_type,
      allergies,
      medical_conditions,
      // Emergency contact
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      // Parent info
      parent_email,
      parent_full_name,
      parent_relationship,
      create_parent_account,
      // Club
      club_id,
    } = body;

    // Validate club access
    const hasAccess =
      roles.some((r) => r.role === "super_admin") ||
      roles.some((r) => r.role === "club_admin" && r.club_id === club_id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have access to this club" },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();

    let parentUserId: string;
    let parentPassword: string | undefined;

    // Create or find parent account
    if (create_parent_account) {
      // Check if parent email already exists
      const { data: existingParent } = await adminClient.auth.admin.listUsers();
      const parentExists = existingParent.users.find(
        (u) => u.email === parent_email
      );

      if (parentExists) {
        // Parent already has an account
        parentUserId = parentExists.id;

        // Check if parent has a profile in users table
        const { data: userProfile } = await supabase
          .from("users")
          .select("id")
          .eq("id", parentUserId)
          .single();

        if (!userProfile) {
          // Create parent profile in users table
          const { error: profileError } = await supabase.from("users").insert({
            id: parentUserId,
            full_name: parent_full_name,
          });

          if (profileError) throw profileError;
        }

        // Check if parent has role for this club
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", parentUserId)
          .eq("club_id", club_id)
          .eq("role", "parent")
          .single();

        if (!existingRole) {
          // Assign parent role for this club
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
              user_id: parentUserId,
              club_id: club_id,
              role: "parent",
            });

          if (roleError) throw roleError;
        }
      } else {
        // Create new parent account
        parentPassword = "Player2025!";
        const { data: authData, error: authError } =
          await adminClient.auth.admin.createUser({
            email: parent_email,
            password: parentPassword,
            email_confirm: true,
            user_metadata: { full_name: parent_full_name },
          });

        if (authError) throw authError;

        parentUserId = authData.user.id;

        // Create parent profile in users table
        const { error: profileError } = await supabase.from("users").insert({
          id: parentUserId,
          full_name: parent_full_name,
        });

        if (profileError) throw profileError;

        // Assign parent role
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: parentUserId,
          club_id: club_id,
          role: "parent",
        });

        if (roleError) throw roleError;
      }
    } else {
      // If not creating parent account, we still need a parent user ID
      // For now, we'll skip this case - in future, could allow linking to existing user
      return NextResponse.json(
        { error: "Parent account creation is required" },
        { status: 400 }
      );
    }

    // Create player user account
    const playerEmail = `${first_name.toLowerCase()}.${last_name.toLowerCase()}.${Date.now()}@player.clubify.mk`;
    const playerPassword = "Player2025!";

    const { data: playerAuthData, error: playerAuthError } =
      await adminClient.auth.admin.createUser({
        email: playerEmail,
        password: playerPassword,
        email_confirm: true,
        user_metadata: {
          full_name: `${first_name} ${last_name}`,
        },
      });

    if (playerAuthError) throw playerAuthError;

    const playerUserId = playerAuthData.user.id;

    // Create player profile in users table
    const { error: playerProfileError } = await supabase.from("users").insert({
      id: playerUserId,
      full_name: `${first_name} ${last_name}`,
    });

    if (playerProfileError) throw playerProfileError;

    // Assign player role
    const { error: playerRoleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: playerUserId,
        club_id: club_id,
        role: "player",
      });

    if (playerRoleError) throw playerRoleError;

    // Normalize values to match database constraints (lowercase)
    const normalizedGender = gender?.toLowerCase();
    const normalizedDominantFoot = dominant_foot?.toLowerCase();

    // Create player record
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .insert({
        id: playerUserId, // Use auth user ID as player ID
        club_id: club_id,
        first_name,
        last_name,
        date_of_birth,
        gender: normalizedGender,
        photo_url: photo_url || null,
        position: position || null,
        dominant_foot: normalizedDominantFoot || null,
        jersey_number: jersey_number || null,
        notes: notes || null,
        blood_type: blood_type || null,
        allergies: allergies || null,
        medical_conditions: medical_conditions || null,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        is_active: true,
      })
      .select()
      .single();

    if (playerError) throw playerError;

    // Normalize relationship to match database constraints (lowercase)
    const normalizedRelationship = parent_relationship?.toLowerCase();

    // Create parent-player relationship
    const { error: relationshipError } = await supabase
      .from("player_parents")
      .insert({
        player_id: playerUserId,
        parent_user_id: parentUserId,
        relationship: normalizedRelationship,
      });

    if (relationshipError) throw relationshipError;

    // TODO: Send welcome email to parent
    // This would be implemented with Resend in a future phase

    return NextResponse.json({
      success: true,
      player: playerData,
      parent_password: parentPassword, // Return only if new account created
      message: "Player created successfully",
    });
  } catch (error) {
    console.error("Error creating player:", error);

    // Return detailed error info for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error ? error.stack : String(error);

    console.error("Error details:", {
      message: errorMessage,
      stack: errorDetails,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMessage, // Include error details in response
      },
      { status: 500 }
    );
  }
}
