import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamCoachId: string }> }
) {
  const { teamCoachId } = await params;
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

  try {
    // Get team_coach assignment to verify club access
    const { data: assignment, error: assignmentError } = await supabase
      .from("team_coaches")
      .select(
        `
        id,
        team_id,
        coach_id,
        teams:team_id (
          club_id
        )
      `
      )
      .eq("id", teamCoachId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const clubId = (
      assignment.teams as { club_id: string } | null
    )?.club_id;

    // Validate access to club
    const isSuperAdmin = roles.some((r) => r.role === "super_admin");
    const hasClubAccess = roles.some((r) => r.club_id === clubId);

    if (!isSuperAdmin && !hasClubAccess) {
      return NextResponse.json(
        { error: "No access to this club" },
        { status: 403 }
      );
    }

    // Soft delete: mark as inactive and set removed_at date
    const { error: deleteError } = await supabase
      .from("team_coaches")
      .update({
        is_active: false,
        removed_at: new Date().toISOString().split("T")[0],
      })
      .eq("id", teamCoachId);

    if (deleteError) {
      throw new Error(`Failed to remove assignment: ${deleteError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Coach removed from team successfully",
    });
  } catch (error) {
    console.error("Error removing coach from team:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove coach from team",
      },
      { status: 500 }
    );
  }
}
