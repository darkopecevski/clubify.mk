import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check if user is super_admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .single();

    if (!roles) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get user from auth.users
    const adminClient = createAdminClient();
    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(
      id
    );

    if (authError || !authUser?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user roles
    const { data: userRoles, error: rolesError } = await adminClient
      .from("user_roles")
      .select(`
        id,
        role,
        club_id,
        clubs (
          name
        )
      `)
      .eq("user_id", id);

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
    }

    return NextResponse.json({
      id: authUser.user.id,
      email: authUser.user.email || "",
      full_name: authUser.user.user_metadata?.full_name || null,
      created_at: authUser.user.created_at,
      roles: userRoles || [],
    });
  } catch (error) {
    console.error("Error in GET /api/admin/users/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
