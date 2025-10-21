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
    const { email, fullName, userId } = body;

    // Check if this is for an existing user or new user
    const isExistingUser = !!userId;

    if (!isExistingUser && (!email || !fullName)) {
      return NextResponse.json(
        { error: "Email and full name are required for new users" },
        { status: 400 }
      );
    }

    if (isExistingUser && !userId) {
      return NextResponse.json(
        { error: "User ID is required for existing users" },
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

    let targetUserId: string;
    let userEmail: string;
    let userFullName: string;
    let defaultPassword: string | undefined;

    if (isExistingUser) {
      // Assign existing user as club admin
      targetUserId = userId;

      // Get user details
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id, full_name")
        .eq("id", userId)
        .single();

      if (userError || !existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Get user email from auth
      const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey);
      const { data: authUser } = await adminClient.auth.admin.getUserById(userId);

      userEmail = authUser.user?.email || "";
      userFullName = existingUser.full_name || "";
    } else {
      // Create new user with admin client
      const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // Default password: ClubAdmin2024!
      defaultPassword = "ClubAdmin2024!";

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
      targetUserId = newUser.id;
      userEmail = newUser.email || email;
      userFullName = fullName;

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
    }

    // Assign club_admin role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: targetUserId,
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
        id: targetUserId,
        email: userEmail,
        full_name: userFullName,
        default_password: defaultPassword,
      },
      message: isExistingUser
        ? `${userFullName} assigned as club admin for ${club.name}`
        : `Club admin created successfully for ${club.name}`,
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
