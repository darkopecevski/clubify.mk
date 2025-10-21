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
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id)
      .eq("role", "super_admin")
      .single();

    if (!roles) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get user using our custom function
    const adminClient = createAdminClient();
    const { data: usersData, error: usersError } = await adminClient.rpc("get_users_with_email");

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    const user = usersData?.find((u: { id: string }) => u.id === id);

    if (!user) {
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
      id: user.id,
      email: user.email || "",
      full_name: user.full_name || null,
      created_at: user.created_at,
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
