import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/club/payments - Get payment records with filters
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const teamId = searchParams.get("teamId");
    const status = searchParams.get("status");

    if (!clubId || !month || !year) {
      return NextResponse.json(
        { error: "Missing required parameters: clubId, month, year" },
        { status: 400 }
      );
    }

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this club
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id);

    const isSuperAdmin = roles?.some((r) => r.role === "super_admin");
    const isClubAdmin = roles?.some(
      (r) => r.role === "club_admin" && r.club_id === clubId
    );

    if (!isSuperAdmin && !isClubAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Club admin access required" },
        { status: 403 }
      );
    }

    // Get all teams for this club
    const { data: clubTeams } = await supabase
      .from("teams")
      .select("id")
      .eq("club_id", clubId);

    if (!clubTeams || clubTeams.length === 0) {
      return NextResponse.json({ records: [] });
    }

    const clubTeamIds = clubTeams.map((t) => t.id);

    // Build query
    let query = supabase
      .from("payment_records")
      .select(
        `
        id,
        period_month,
        period_year,
        amount_due,
        amount_paid,
        discount_applied,
        status,
        due_date,
        paid_date,
        payment_method,
        notes,
        player:player_id (
          id,
          first_name,
          last_name,
          jersey_number
        ),
        team:team_id (
          id,
          name,
          age_group
        )
      `
      )
      .in("team_id", clubTeamIds)
      .eq("period_month", parseInt(month))
      .eq("period_year", parseInt(year))
      .order("player(last_name)", { ascending: true });

    // Apply team filter
    if (teamId && teamId !== "all") {
      query = query.eq("team_id", teamId);
    }

    // Apply status filter
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: records, error: recordsError } = await query;

    if (recordsError) throw recordsError;

    // Auto-update overdue status
    const today = new Date().toISOString().split("T")[0];
    const recordsToUpdate = records?.filter(
      (r) => r.status === "unpaid" && r.due_date < today
    );

    if (recordsToUpdate && recordsToUpdate.length > 0) {
      await supabase
        .from("payment_records")
        .update({ status: "overdue" })
        .in(
          "id",
          recordsToUpdate.map((r) => r.id)
        );

      // Update local records
      records?.forEach((r) => {
        if (r.status === "unpaid" && r.due_date < today) {
          r.status = "overdue";
        }
      });
    }

    return NextResponse.json({ records: records || [] });
  } catch (error) {
    console.error("Error in /api/club/payments GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
