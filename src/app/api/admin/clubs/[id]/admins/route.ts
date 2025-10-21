import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST /api/admin/clubs/[id]/admins - Create a new club admin
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Parse request body
    const body = await request.json();
    const { email, fullName } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "Email and full name are required" },
        { status: 400 }
      );
    }

    // Verify club exists
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .select("id, name")
      .eq("id", id)
      .single();

    if (clubError || !club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Create user with admin client
    const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Default password: ClubAdmin2024!
    const defaultPassword = "ClubAdmin2024!";

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    const newUser = authData.user;

    // Create user profile
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: newUser.id,
        full_name: fullName,
      });

    if (profileError && !profileError.message.includes("duplicate")) {
      console.error("Profile creation error:", profileError);
    }

    // Assign club_admin role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: newUser.id,
        club_id: id,
        role: "club_admin",
      });

    if (roleError) {
      return NextResponse.json(
        { error: "Failed to assign role" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: fullName,
        default_password: defaultPassword,
      },
      message: `Club admin created successfully for ${club.name}`,
    });
  } catch (error) {
    console.error("Error creating club admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/admin/clubs/[id]/admins - List club admins
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get club admins
    const { data: admins, error } = await supabase
      .from("user_roles")
      .select(`
        id,
        user_id,
        users!inner(full_name)
      `)
      .eq("club_id", id)
      .eq("role", "club_admin");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get emails from auth.users using service role
    const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey);
    const { data: authUsers } = await adminClient.auth.admin.listUsers();

    const adminsWithEmails = admins.map((admin) => {
      const authUser = authUsers.users.find((u) => u.id === admin.user_id);
      return {
        id: admin.id,
        user_id: admin.user_id,
        full_name: admin.users?.full_name || "Unknown",
        email: authUser?.email || "Unknown",
      };
    });

    return NextResponse.json({ admins: adminsWithEmails });
  } catch (error) {
    console.error("Error fetching club admins:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
