import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ coachId: string }> }
) {
  const { coachId } = await params;
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
  const { teamId, role } = body;

  if (!teamId || !role) {
    return NextResponse.json(
      { error: "Team ID and role are required" },
      { status: 400 }
    );
  }

  // Validate role
  const validRoles = [
    "head_coach",
    "assistant_coach",
    "goalkeeper_coach",
    "fitness_coach",
    "other",
  ];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    // Get coach to verify club_id
    const { data: coach, error: coachError } = await supabase
      .from("coaches")
      .select("club_id")
      .eq("id", coachId)
      .single();

    if (coachError || !coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    // Verify team belongs to same club
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("club_id")
      .eq("id", teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.club_id !== coach.club_id) {
      return NextResponse.json(
        { error: "Team and coach must belong to the same club" },
        { status: 400 }
      );
    }

    // Validate access to club
    const isSuperAdmin = roles.some((r) => r.role === "super_admin");
    const hasClubAccess = roles.some((r) => r.club_id === coach.club_id);

    if (!isSuperAdmin && !hasClubAccess) {
      return NextResponse.json(
        { error: "No access to this club" },
        { status: 403 }
      );
    }

    // Check if assignment already exists
    const { data: existingAssignment } = await supabase
      .from("team_coaches")
      .select("id, is_active")
      .eq("team_id", teamId)
      .eq("coach_id", coachId)
      .maybeSingle();

    if (existingAssignment) {
      if (existingAssignment.is_active) {
        return NextResponse.json(
          { error: "Coach is already assigned to this team" },
          { status: 400 }
        );
      } else {
        // Reactivate the assignment
        const { data: updated, error: updateError } = await supabase
          .from("team_coaches")
          .update({
            role,
            is_active: true,
            assigned_at: new Date().toISOString().split("T")[0],
            removed_at: null,
          })
          .eq("id", existingAssignment.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(
            `Failed to reactivate assignment: ${updateError.message}`
          );
        }

        return NextResponse.json({
          success: true,
          assignment: updated,
        });
      }
    }

    // Create new assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from("team_coaches")
      .insert({
        team_id: teamId,
        coach_id: coachId,
        role,
        is_active: true,
      })
      .select()
      .single();

    if (assignmentError) {
      throw new Error(
        `Failed to create assignment: ${assignmentError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error("Error assigning coach to team:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to assign coach to team",
      },
      { status: 500 }
    );
  }
}
