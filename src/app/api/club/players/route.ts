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
      try {
        // Try to create new parent account
        parentPassword = "Player2025!";
        const { data: authData, error: authError } =
          await adminClient.auth.admin.createUser({
            email: parent_email,
            password: parentPassword,
            email_confirm: true,
            user_metadata: { full_name: parent_full_name },
          });

        if (authError) {
          // Check if error is because user already exists
          if (authError.message?.includes("already been registered")) {
            console.log("Parent exists, looking up by email:", parent_email);

            // Parent already has an account - use RPC function to find them by email
            const { data: usersWithEmail, error: rpcError } = await supabase.rpc(
              "get_users_with_email"
            );

            if (rpcError) {
              console.error("RPC error:", rpcError);
              throw new Error(`Failed to query users: ${rpcError.message}`);
            }

            console.log("Found users count:", usersWithEmail?.length || 0);

          const foundUser = usersWithEmail?.find(
            (u: { email: string }) => u.email === parent_email
          );

          if (!foundUser) {
            throw new Error(
              `Parent account with email ${parent_email} exists but could not be found in database.`
            );
          }

          parentUserId = foundUser.id;
          parentPassword = undefined; // Don't return password for existing account

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
          // Some other auth error
          throw authError;
        }
      } else {
        // Successfully created new parent account
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
      } catch (parentError) {
        console.error("Error in parent account creation/lookup:", parentError);
        throw new Error(
          `Failed to create or find parent account: ${
            parentError instanceof Error ? parentError.message : String(parentError)
          }`
        );
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

    // Handle different error types
    let errorMessage = "Unknown error";
    let errorDetails = "";

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || "";
    } else if (typeof error === "object" && error !== null) {
      // Supabase errors
      const err = error as { message?: string; error_description?: string };
      errorMessage = err.message || err.error_description || JSON.stringify(error);
      errorDetails = JSON.stringify(error, null, 2);
    } else {
      errorMessage = String(error);
    }

    console.error("Error details:", {
      message: errorMessage,
      details: errorDetails,
      type: typeof error,
      isError: error instanceof Error,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMessage,
        type: typeof error,
      },
      { status: 500 }
    );
  }
}
