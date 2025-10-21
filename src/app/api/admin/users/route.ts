import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/admin/users - List all users
export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is super admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin");

    if (!roles || roles.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users from users table
    const { data: users, error } = await supabase
      .from("users")
      .select("id, full_name")
      .order("full_name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get emails from auth.users using service role
    const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey);
    const { data: authUsers } = await adminClient.auth.admin.listUsers();

    const usersWithEmails = users.map((user) => {
      const authUser = authUsers.users.find((u) => u.id === user.id);
      return {
        id: user.id,
        full_name: user.full_name || "Unknown",
        email: authUser?.email || "Unknown",
      };
    });

    return NextResponse.json({ users: usersWithEmails });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
