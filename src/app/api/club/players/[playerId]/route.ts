import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// PUT /api/club/players/[playerId] - Update a player
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
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
      parent_full_name,
      parent_relationship,
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

    const adminSupabase = createAdminClient();

    // Normalize values to match database constraints (lowercase)
    const normalizedGender = gender?.toLowerCase();
    const normalizedDominantFoot = dominant_foot?.toLowerCase();
    const normalizedRelationship = parent_relationship?.toLowerCase();

    // Update player record
    const { data: playerData, error: playerError } = await adminSupabase
      .from("players")
      .update({
        first_name,
        last_name,
        date_of_birth,
        gender: normalizedGender,
        photo_url: photo_url || null,
        position: position || null,
        dominant_foot: normalizedDominantFoot || null,
        jersey_number: jersey_number ? parseInt(jersey_number) : null,
        notes: notes || null,
        blood_type: blood_type || null,
        allergies: allergies || null,
        medical_conditions: medical_conditions || null,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
      })
      .eq("id", playerId)
      .select()
      .single();

    if (playerError) {
      console.error("Player update error:", playerError);
      throw new Error(`Failed to update player: ${playerError.message}`);
    }

    // Update parent name in users table if provided
    if (parent_full_name) {
      // Get parent user ID from player_parents
      const { data: parentRelation } = await adminSupabase
        .from("player_parents")
        .select("parent_user_id")
        .eq("player_id", playerId)
        .single();

      if (parentRelation) {
        const { error: parentUpdateError } = await adminSupabase
          .from("users")
          .update({
            full_name: parent_full_name,
          })
          .eq("id", parentRelation.parent_user_id);

        if (parentUpdateError) {
          console.error("Parent update error:", parentUpdateError);
          // Don't fail the whole operation if parent update fails
        }

        // Update parent relationship
        const { error: relationshipUpdateError } = await adminSupabase
          .from("player_parents")
          .update({
            relationship: normalizedRelationship,
          })
          .eq("player_id", playerId)
          .eq("parent_user_id", parentRelation.parent_user_id);

        if (relationshipUpdateError) {
          console.error("Relationship update error:", relationshipUpdateError);
          // Don't fail the whole operation
        }
      }
    }

    return NextResponse.json({
      success: true,
      player: playerData,
      message: "Player updated successfully",
    });
  } catch (error) {
    console.error("Error updating player:", error);

    // Handle different error types
    let errorMessage = "Unknown error";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error !== null) {
      const err = error as { message?: string; error_description?: string };
      errorMessage = err.message || err.error_description || JSON.stringify(error);
    } else {
      errorMessage = String(error);
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
