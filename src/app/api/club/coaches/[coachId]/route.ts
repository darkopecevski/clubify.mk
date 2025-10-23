import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
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

  // Get coach to verify club access
  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("club_id, user_id")
    .eq("id", coachId)
    .single();

  if (coachError || !coach) {
    return NextResponse.json({ error: "Coach not found" }, { status: 404 });
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

  // Validate access to club
  const isSuperAdmin = roles.some((r) => r.role === "super_admin");
  const hasClubAccess = roles.some((r) => r.club_id === coach.club_id);

  if (!isSuperAdmin && !hasClubAccess) {
    return NextResponse.json(
      { error: "No access to this club" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const {
    full_name,
    phone,
    license_type,
    license_number,
    specialization,
    years_of_experience,
    bio,
  } = body;

  try {
    // Update user profile
    if (full_name || phone !== undefined) {
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          ...(full_name && { full_name }),
          ...(phone !== undefined && { phone }),
        })
        .eq("id", coach.user_id);

      if (userUpdateError) {
        throw new Error(`Failed to update user: ${userUpdateError.message}`);
      }
    }

    // Update coach profile
    const { error: updateError } = await supabase
      .from("coaches")
      .update({
        license_type: license_type,
        license_number: license_number,
        specialization: specialization,
        years_of_experience: years_of_experience,
        bio: bio,
      })
      .eq("id", coachId);

    if (updateError) {
      throw new Error(`Failed to update coach: ${updateError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating coach:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update coach",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

  // Get coach to verify club access
  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("club_id")
    .eq("id", coachId)
    .single();

  if (coachError || !coach) {
    return NextResponse.json({ error: "Coach not found" }, { status: 404 });
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

  // Validate access to club
  const isSuperAdmin = roles.some((r) => r.role === "super_admin");
  const hasClubAccess = roles.some((r) => r.club_id === coach.club_id);

  if (!isSuperAdmin && !hasClubAccess) {
    return NextResponse.json(
      { error: "No access to this club" },
      { status: 403 }
    );
  }

  // Soft delete - set is_active to false
  const { error: deleteError } = await supabase
    .from("coaches")
    .update({ is_active: false })
    .eq("id", coachId);

  if (deleteError) {
    return NextResponse.json(
      { error: "Failed to deactivate coach" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
